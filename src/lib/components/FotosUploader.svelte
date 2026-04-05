<!-- $lib/components/FotosUploader.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let fotos: Array<{
        id: string;
        url: string;
        file?: File;
        principal: boolean;
    }> = [];

    export let errors: Record<string, string> = {};
    export let disabled = false;
    export let maxFotos = 6;
    export let maxSizeMB = 5;

    const dispatch = createEventDispatcher();

    let uploadLoading = false;
    let uploadError = '';

    const handleFileSelect = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        if (files.length === 0) return;

        // Verifica limite máximo
        if (fotos.length + files.length > maxFotos) {
            uploadError = `Máximo de ${maxFotos} fotos permitidas`;
            input.value = '';
            return;
        }

        uploadLoading = true;
        uploadError = '';

        const novosUploads: Array<{ foto: typeof fotos[0]; file: File }> = [];

        for (const file of files) {
            // Validação de tipo
            if (!file.type.startsWith('image/')) {
                uploadError = 'Apenas imagens são permitidas';
                continue;
            }

            // Validação de tamanho
            if (file.size > maxSizeMB * 1024 * 1024) {
                uploadError = `Imagem muito grande (máx ${maxSizeMB}MB)`;
                continue;
            }

            const localUrl = URL.createObjectURL(file);
            const isPrimeiraFoto = fotos.length === 0 && novosUploads.length === 0;

            const novaFoto = {
                id: `temp-${Date.now()}-${Math.random()}-${file.name}`,
                url: localUrl,
                file,
                principal: isPrimeiraFoto,
            };

            novosUploads.push({ foto: novaFoto, file });
        }

        if (novosUploads.length > 0) {
            fotos = [...fotos, ...novosUploads.map(u => u.foto)];

            // Dispara evento para upload real no componente pai
            dispatch('fotos-selecionadas', novosUploads.map(u => u.file));
        }

        uploadLoading = false;
        input.value = '';
    };

    const setPrincipal = (id: string) => {
        if (disabled) return;
        fotos = fotos.map(f => ({ ...f, principal: f.id === id }));
        dispatch('principal-alterada', id);
    };

    const removerFoto = (id: string) => {
        if (disabled) return;

        const removida = fotos.find(f => f.id === id);
        
        // Revoga URL blob para evitar memory leak
        if (removida?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(removida.url);
        }

        fotos = fotos.filter(f => f.id !== id);

        // Se removeu a foto principal e ainda há fotos, define a primeira como principal
        if (removida?.principal && fotos.length > 0) {
            fotos = fotos.map((f, i) => ({ ...f, principal: i === 0 }));
        }

        dispatch('foto-removida', id);
    };

    // Cleanup das URLs blob quando componente for destruído
    function cleanupBlobUrls() {
        fotos.forEach(foto => {
            if (foto.url?.startsWith('blob:')) {
                URL.revokeObjectURL(foto.url);
            }
        });
    }

    $: {
        // Limpa erro quando fotos mudam
        if (uploadError && fotos.length > 0) {
            uploadError = '';
        }
    }
</script>

<svelte:window on:beforeunload={cleanupBlobUrls} />

<div class="fotos-uploader">
    {#if uploadError}
        <div class="upload-error" role="alert">{uploadError}</div>
    {/if}

    <div class="fotos-grid">
        {#each fotos as foto (foto.id)}
            <div class="foto-item" class:principal={foto.principal}>
                <img 
                    src={foto.url} 
                    alt="Foto {foto.principal ? 'principal' : ''}"
                    loading="lazy"
                />

                {#if !foto.principal && !disabled}
                    <button 
                        class="foto-principal-btn" 
                        on:click={() => setPrincipal(foto.id)} 
                        title="Definir como principal"
                        type="button"
                    >
                        ★
                    </button>
                {:else if foto.principal}
                    <div class="principal-badge">Principal</div>
                {/if}

                {#if !disabled}
                    <button 
                        class="foto-remove-btn" 
                        on:click={() => removerFoto(foto.id)} 
                        title="Remover foto"
                        type="button"
                    >
                        ✕
                    </button>
                {/if}
            </div>
        {/each}

        {#if fotos.length < maxFotos && !disabled}
            <label class="foto-add" class:loading={uploadLoading}>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    on:change={handleFileSelect}
                    disabled={uploadLoading}
                />
                <div class="add-icon">
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
    .fotos-uploader { width:100%; }

    .fotos-grid {
        display:grid;
        grid-template-columns:repeat(auto-fill, minmax(96px, 1fr));
        gap:.65rem;
    }

    .foto-item {
        position:relative; aspect-ratio:1;
        border-radius:12px; overflow:hidden;
        border:2px solid transparent;
        transition:border-color .2s;
    }
    .foto-item.principal { border-color:var(--primary,#4F46E5); }
    .foto-item img { width:100%; height:100%; object-fit:cover; display:block; }

    .principal-badge {
        position:absolute; bottom:0; left:0; right:0;
        background:linear-gradient(to top, rgba(79,70,229,.9), transparent);
        color:#fff; font-size:.58rem; font-weight:700;
        text-align:center; padding:.3rem;
        text-transform:uppercase; letter-spacing:.05em;
        pointer-events:none;
    }

    .foto-principal-btn {
        position:absolute; top:.28rem; left:.28rem;
        background:rgba(0,0,0,.55); border:none;
        color:#fbbf24; font-size:.95rem;
        width:26px; height:26px; border-radius:50%;
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        transition:background .2s;
    }
    .foto-principal-btn:hover { background:rgba(0,0,0,.8); }

    .foto-remove-btn {
        position:absolute; top:.28rem; right:.28rem;
        background:rgba(0,0,0,.55); border:none;
        color:#f87171; font-size:.85rem;
        width:26px; height:26px; border-radius:50%;
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        transition:background .2s, color .2s;
    }
    .foto-remove-btn:hover { background:rgba(0,0,0,.8); color:#ef4444; }

    .foto-add {
        aspect-ratio:1;
        border:2px dashed rgba(79,70,229,.25);
        border-radius:12px;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        cursor:pointer;
        transition:border-color .2s, background .2s;
        background:rgba(79,70,229,.03);
    }
    .foto-add:hover:not(.loading) {
        border-color:var(--primary,#4F46E5);
        background:rgba(79,70,229,.07);
    }
    .foto-add.loading { opacity:.65; cursor:default; }
    .foto-add input { display:none; }

    .add-icon {
        font-size:1.8rem; color:var(--primary,#4F46E5);
        margin-bottom:.2rem; display:flex; align-items:center; justify-content:center;
        width:32px; height:32px;
    }
    .add-spinner {
        width:20px; height:20px;
        border:2.5px solid rgba(79,70,229,.2);
        border-top-color:var(--primary,#4F46E5);
        border-radius:50%;
        animation:spin .7s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg); } }

    .add-text { font-size:.68rem; font-weight:600; color:var(--primary,#4F46E5); }

    .fotos-hint {
        font-size:.68rem; color:var(--muted,#64748B);
        margin-top:.75rem; line-height:1.5;
    }

    .upload-error {
        background:#FEF2F2; border:1px solid #FECACA;
        color:#991B1B; font-size:.75rem;
        padding:.5rem .75rem; border-radius:8px; margin-bottom:.75rem;
    }

    .field-error { font-size:.72rem; color:#DC2626; margin-top:.3rem; }
</style>