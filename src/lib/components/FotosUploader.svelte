<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { apiDeleteImagem } from '$lib/services/api';
    import type { Foto } from '$lib/data/perfil';

    export let fotos: Foto[] = [];

    export let errors:   Record<string, string> = {};
    export let disabled  = false;
    export let maxFotos  = 6;
    export let maxSizeMB = 5;

    const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'] as const;

    const dispatch    = createEventDispatcher();
    let uploadLoading = false;
    let uploadError   = '';
    let removingId    = '';

    // No servidor a principal só muda quando a foto nova é enviada: guarda a atual para
    // poder voltar a ela se a nova for removida antes disso
    let principalSalvaId = '';

    // Rastreia URLs blob criadas localmente para revogação correta
    const blobsLocais = new Set<string>();

    // Uma foto é "já salva no servidor" quando o id NÃO começa com "temp-"
    const isSalvaNoServidor = (id: string) => !id.startsWith('temp-');

    const handleFileSelect = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        input.value = '';
        if (files.length === 0) return;

        uploadError = '';

        if (fotos.length + files.length > maxFotos) {
            uploadError = `Máximo de ${maxFotos} fotos permitidas`;
            return;
        }

        uploadLoading = true;

        const novos: Foto[] = [];

        for (const file of files) {
            if (!(TIPOS_ACEITOS as readonly string[]).includes(file.type)) {
                uploadError = 'Apenas JPEG, PNG e WebP são permitidos';
                continue;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                uploadError = `Imagem muito grande (máx ${maxSizeMB} MB)`;
                continue;
            }

            const localUrl = URL.createObjectURL(file);
            blobsLocais.add(localUrl);

            const isPrimeira = fotos.length === 0 && novos.length === 0;
            novos.push({
                id:        `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                url:       localUrl,
                file,
                principal: isPrimeira,
            });
        }

        if (novos.length > 0) {
            fotos = [...fotos, ...novos];
            dispatch('fotos-selecionadas', novos.map(f => f.file));
        }

        uploadLoading = false;
    };

    // O backend só define a foto de perfil no upload (POST /api/imagens/upload com
    // perfil=true) — não existe endpoint para trocar a principal de uma foto já salva.
    // Por isso a estrela só aparece em fotos novas (ainda não enviadas).
    const setPrincipal = (id: string) => {
        if (disabled || isSalvaNoServidor(id)) return;

        const foto = fotos.find(f => f.id === id);
        if (!foto || foto.principal) return;

        const anterior = fotos.find(f => f.principal);
        if (anterior && isSalvaNoServidor(anterior.id)) principalSalvaId = anterior.id;

        fotos = fotos.map(f => ({
            ...f,
            principal: f.id === id
        }));
        dispatch('principal-alterada', id);
    };

    const removerFoto = async (id: string) => {
        if (disabled || removingId) return;

        const foto = fotos.find(f => f.id === id);
        if (!foto) return;

        // ── Foto já salva no servidor: chama DELETE na API ──────────────────
        if (isSalvaNoServidor(id)) {
            removingId = id;
            try {
                const res = await apiDeleteImagem(id);
                if (res.error) {
                    uploadError = `Erro ao remover foto: ${res.error}`;
                    removingId = '';
                    return;
                }
            } catch (e) {
                uploadError = 'Erro ao remover foto do servidor.';
                removingId = '';
                return;
            }
            removingId = '';
        }

        // ── Foto local (blob): revoga URL ────────────────────────────────────
        if (foto.url && blobsLocais.has(foto.url)) {
            URL.revokeObjectURL(foto.url);
            blobsLocais.delete(foto.url);
        }

        const wasPrincipal = foto.principal;
        fotos = fotos.filter(f => f.id !== id);

        // Ao apagar a principal salva, o backend promove a primeira foto ativa que sobrou
        if (wasPrincipal) {
            const nova = fotos.find(f => f.id === principalSalvaId)
                ?? fotos.find(f => isSalvaNoServidor(f.id))
                ?? fotos[0];
            fotos = fotos.map(f => ({ ...f, principal: f.id === nova?.id }));
        }

        dispatch('foto-removida', id);
    };

    onDestroy(() => {
        blobsLocais.forEach(url => URL.revokeObjectURL(url));
        blobsLocais.clear();
    });

</script>

<div class="fotos-uploader">
    {#if uploadError}
        <div class="upload-error" role="alert">{uploadError}</div>
    {/if}

    <div class="fotos-grid">
        {#each fotos as foto (foto.id)}
            <div class="foto-item" class:principal={foto.principal}>
                <img
                    src={foto.url}
                    alt={foto.principal ? 'Foto principal' : 'Foto do perfil'}
                    loading="lazy"
                />

                {#if foto.principal}
                    <div class="principal-badge" aria-label="Foto principal">Principal</div>
                {:else if !disabled && !isSalvaNoServidor(foto.id)}
                    <button
                        class="foto-principal-btn"
                        on:click={() => setPrincipal(foto.id)}
                        title="Definir como principal"
                        type="button"
                        aria-label="Definir como foto principal"
                    >
                        ★
                    </button>
                {/if}

                {#if !disabled}
                    <button
                        class="foto-remove-btn"
                        on:click={() => removerFoto(foto.id)}
                        title="Remover foto"
                        type="button"
                        aria-label="Remover foto"
                        disabled={removingId === foto.id}
                    >
                        {#if removingId === foto.id}
                            <span class="remove-spinner"></span>
                        {:else}
                            ✕
                        {/if}
                    </button>
                {/if}
            </div>
        {/each}

        {#if fotos.length < maxFotos && !disabled}
            <label class="foto-add" class:loading={uploadLoading}>
                <input
                    type="file"
                    accept={TIPOS_ACEITOS.join(',')}
                    multiple
                    on:change={handleFileSelect}
                    disabled={uploadLoading}
                    aria-label="Adicionar foto"
                />
                <div class="add-icon" aria-hidden="true">
                    {#if uploadLoading}
                        <span class="add-spinner"></span>
                    {:else}
                        +
                    {/if}
                </div>
                <span class="add-text">
                    {uploadLoading ? 'Enviando...' : 'Adicionar foto'}
                </span>
            </label>
        {/if}
    </div>

    <p class="fotos-hint">
        Até {maxFotos} fotos · A primeira será sua principal (pode alterar depois)
        <br>Formatos: JPEG, PNG, WebP · Máx {maxSizeMB} MB cada
    </p>

    {#if errors.foto}
        <p class="field-error" role="alert">⚠️ {errors.foto}</p>
    {/if}
</div>

<style>
    .fotos-uploader { width: 100%; }

    .fotos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: .65rem;
    }

    .foto-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid transparent;
        transition: border-color .2s;
    }
    .foto-item.principal { border-color: var(--primary); }
    .foto-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .principal-badge {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: linear-gradient(to top, rgba(79,70,229,.9), transparent);
        color: #fff; font-size: .58rem; font-weight: 700;
        text-align: center; padding: .3rem;
        text-transform: uppercase; letter-spacing: .05em;
        pointer-events: none;
    }

    .foto-principal-btn {
        position: absolute; top: .28rem; left: .28rem;
        background: rgba(0,0,0,.55); border: none;
        color: #fbbf24; font-size: .95rem;
        width: 26px; height: 26px; border-radius: 50%;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background .2s;
    }
    .foto-principal-btn:hover:not(:disabled) { background: rgba(0,0,0,.8); }
    .foto-principal-btn:disabled { opacity: .6; cursor: default; }

    .foto-remove-btn {
        position: absolute; top: .28rem; right: .28rem;
        background: rgba(0,0,0,.55); border: none;
        color: #f87171; font-size: .85rem;
        width: 26px; height: 26px; border-radius: 50%;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: background .2s, color .2s;
    }
    .foto-remove-btn:hover:not(:disabled) { background: rgba(0,0,0,.8); color: #ef4444; }
    .foto-remove-btn:disabled { opacity: .6; cursor: default; }

    .remove-spinner {
        width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin .6s linear infinite;
    }

    .foto-add {
        aspect-ratio: 1;
        border: 2px dashed rgba(79,70,229,.25);
        border-radius: 12px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        cursor: pointer;
        transition: border-color .2s, background .2s;
        background: rgba(79,70,229,.03);
    }
    .foto-add:hover:not(.loading) {
        border-color: var(--primary);
        background: rgba(79,70,229,.07);
    }
    .foto-add.loading { opacity: .65; cursor: default; }
    .foto-add input { display: none; }

    .add-icon {
        font-size: 1.8rem; color: var(--primary);
        margin-bottom: .2rem;
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
    }
    .add-spinner {
        width: 20px; height: 20px;
        border: 2.5px solid rgba(79,70,229,.2);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .add-text { font-size: .68rem; font-weight: 600; color: var(--primary); }

    .fotos-hint {
        font-size: .68rem; color: #64748B;
        margin-top: .75rem; line-height: 1.5;
    }

    .upload-error {
        background: #FEF2F2; border: 1px solid #FECACA;
        color: #991B1B; font-size: .75rem;
        padding: .5rem .75rem; border-radius: 8px; margin-bottom: .75rem;
    }

    .field-error { font-size: .72rem; color: #DC2626; margin-top: .3rem; }
</style>