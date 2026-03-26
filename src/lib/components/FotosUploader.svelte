<script lang="ts">
    interface Foto {
        id: string;
        url: string;
        file?: File;
        principal: boolean;
    }

    export let fotos: Foto[] = [];
    export let errors: Record<string, string> = {};

    const API = 'https://pairup-production-b9ee.up.railway.app';

    let fotoIndex = 0;
    let uploadLoading = false;
    let actionLoading = false; // loading para delete/perfil

    const fotoInputId      = `foto-${Math.random().toString(36).substr(2, 9)}`;
    const fotoInputIdEmpty = `foto-empty-${Math.random().toString(36).substr(2, 9)}`;

    $: fotoAtual = fotos[fotoIndex] ?? null;
    $: totalFotos = fotos.length;

    // ── Adicionar fotos (local, sem upload ainda) ──
    const handleFileUpload = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        uploadLoading = true;
        errors = { ...errors, foto: '' };
        try {
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                if (!file.type.startsWith('image/')) { errors.foto = 'Apenas imagens são permitidas'; continue; }
                if (file.size > 5 * 1024 * 1024)     { errors.foto = 'Máx. 5MB por imagem'; continue; }
                const fotoId = `novo-${Date.now()}-${i}`;
                await new Promise<void>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        fotos = [...fotos, {
                            id:        fotoId,
                            url:       ev.target?.result as string,
                            file,
                            principal: fotos.length === 0 && i === 0
                        }];
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            }
            if (fotoIndex >= fotos.length) fotoIndex = Math.max(0, fotos.length - 1);
        } catch {
            errors.foto = 'Erro ao processar imagem';
        } finally {
            uploadLoading = false;
            input.value = '';
        }
    };

    // ── Remover foto ──
    // Se já existe no banco (id não começa com "novo-"), chama DELETE na API
    const removerFoto = async (foto: Foto) => {
        if (actionLoading) return;

        const isNova = foto.id.startsWith('novo-');

        if (!isNova) {
            // Foto já salva no banco — chama o backend
            actionLoading = true;
            try {
                const res = await fetch(`${API}/api/imagens/${foto.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`Erro ${res.status}`);
            } catch (e: any) {
                errors.foto = 'Erro ao remover foto: ' + e.message;
                actionLoading = false;
                return;
            }
            actionLoading = false;
        }

        // Remove do estado local
        const eraPrincipal = foto.principal;
        fotos = fotos.filter(f => f.id !== foto.id);
        if (eraPrincipal && fotos.length > 0) {
            fotos = fotos.map((f, i) => ({ ...f, principal: i === 0 }));
        }
        if (fotoIndex >= fotos.length) fotoIndex = Math.max(0, fotos.length - 1);
    };

    // ── Definir como perfil ──
    // Se já existe no banco, chama PATCH na API
    const setFotoPrincipal = async (foto: Foto) => {
        if (actionLoading || foto.principal) return;

        const isNova = foto.id.startsWith('novo-');

        if (!isNova) {
            // Foto já salva — chama o backend
            actionLoading = true;
            try {
                const res = await fetch(`${API}/api/imagens/${foto.id}/perfil`, { method: 'PATCH' });
                if (!res.ok) throw new Error(`Erro ${res.status}`);
            } catch (e: any) {
                errors.foto = 'Erro ao definir perfil: ' + e.message;
                actionLoading = false;
                return;
            }
            actionLoading = false;
        }

        // Atualiza estado local
        fotos = fotos.map(f => ({ ...f, principal: f.id === foto.id }));
    };
</script>

<div class="uploader">
    <div class="uploader-header">
        <span class="uploader-label">Fotos do Perfil <span class="req">*</span></span>
        <span class="uploader-count">{totalFotos}/6 fotos</span>
    </div>

    {#if fotos.length > 0}
        <!-- Carousel principal -->
        <div class="carousel-img" class:is-principal={fotoAtual?.principal}>
            {#if fotoAtual}
                <img src={fotoAtual.url} alt={`Foto ${fotoIndex + 1}`} />
            {/if}

            {#if fotoAtual?.principal}
                <div class="badge-principal">✦ Principal</div>
            {/if}

            {#if actionLoading}
                <div class="overlay-loading">
                    <span class="mini-spinner white"></span>
                </div>
            {/if}

            {#if totalFotos > 1}
                <button class="nav-btn nav-prev" type="button"
                    on:click={() => fotoIndex--} disabled={fotoIndex === 0} aria-label="Foto anterior">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <button class="nav-btn nav-next" type="button"
                    on:click={() => fotoIndex++} disabled={fotoIndex === totalFotos - 1} aria-label="Próxima foto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            {/if}

            <div class="counter">{fotoIndex + 1} / {totalFotos}</div>
        </div>

        <!-- Ações -->
        <div class="carousel-actions">
            {#if fotoAtual && !fotoAtual.principal}
                <button type="button" class="action-link"
                    disabled={actionLoading}
                    on:click={() => fotoAtual && setFotoPrincipal(fotoAtual)}>
                    {actionLoading ? 'Aguarde...' : 'Definir como principal'}
                </button>
            {:else}
                <span></span>
            {/if}

            {#if fotoAtual}
                <button type="button" class="action-remove"
                    disabled={actionLoading}
                    on:click={() => fotoAtual && removerFoto(fotoAtual)}>
                    {actionLoading ? '...' : 'Remover foto'}
                </button>
            {/if}
        </div>

        <!-- Thumbnails -->
        <div class="thumbs">
            {#each fotos as foto, idx (foto.id)}
                <div class="thumb-wrap">
                    <button
                        type="button"
                        class="thumb"
                        class:active={fotoIndex === idx}
                        class:is-principal={foto.principal}
                        on:click={() => fotoIndex = idx}
                        aria-label={`Ver foto ${idx + 1}${foto.principal ? ' (principal)' : ''}`}
                        aria-current={fotoIndex === idx ? 'true' : 'false'}
                    >
                        <img src={foto.url} alt="" />
                    </button>
                </div>
            {/each}

            {#if fotos.length < 6}
                <div class="thumb-add">
                    <input type="file" id={fotoInputId} accept="image/*" multiple
                        on:change={handleFileUpload} class="hidden-input" disabled={uploadLoading} />
                    <label for={fotoInputId} class="thumb-add-label" aria-label="Adicionar fotos">
                        {#if uploadLoading}
                            <span class="mini-spinner"></span>
                        {:else}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12M6 12h12"/>
                            </svg>
                        {/if}
                    </label>
                </div>
            {/if}
        </div>

    {:else}
        <!-- Estado vazio -->
        <div class="empty-state">
            <input type="file" id={fotoInputIdEmpty} accept="image/*" multiple
                on:change={handleFileUpload} class="hidden-input" disabled={uploadLoading} />
            <div class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
            </div>
            <p class="empty-text">Adicione suas melhores fotos</p>
            <label for={fotoInputIdEmpty} class="empty-btn">
                {#if uploadLoading}
                    <span class="mini-spinner white"></span> Enviando...
                {:else}
                    Escolher fotos
                {/if}
            </label>
        </div>
    {/if}

    {#if errors.foto}
        <p class="error-msg" role="alert">{errors.foto}</p>
    {/if}
    <p class="uploader-hint-bottom">JPG, PNG ou GIF · Máx. 5 MB · Até 6 fotos</p>
</div>

<style>
    .uploader { width: 100%; }

    .uploader-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 0.75rem;
    }
    .uploader-label {
        font-size: 0.72rem; font-weight: 500;
        color: var(--muted, #8A7F79);
        text-transform: uppercase; letter-spacing: 0.06em;
    }
    .req { color: var(--rose, #D94F6B); }
    .uploader-count { font-size: 0.72rem; color: var(--muted, #8A7F79); }
    .uploader-hint-bottom { font-size: 0.7rem; color: var(--muted, #8A7F79); margin-top: 0.5rem; }

    .carousel-img {
        position: relative; aspect-ratio: 4/3;
        border-radius: 14px; overflow: hidden;
        border: 2px solid rgba(138,127,121,0.15);
        background: var(--cream, #FAF7F2);
        transition: border-color 0.3s; margin-bottom: 0.4rem;
    }
    .carousel-img.is-principal { border-color: var(--rose, #D94F6B); }
    .carousel-img img { width: 100%; height: 100%; object-fit: cover; }

    .badge-principal {
        position: absolute; top: 10px; left: 10px;
        background: var(--rose, #D94F6B); color: #fff;
        font-size: 0.68rem; font-weight: 500;
        padding: 3px 10px; border-radius: 20px;
    }

    .overlay-loading {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.35);
        display: flex; align-items: center; justify-content: center;
        z-index: 5;
    }

    .nav-btn {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(255,255,255,0.85); backdrop-filter: blur(4px);
        border: none; border-radius: 50%;
        width: 34px; height: 34px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--ink, #1A1410);
        transition: background 0.2s, opacity 0.2s; padding: 0; z-index: 4;
    }
    .nav-btn svg { width: 16px; height: 16px; }
    .nav-btn:disabled { opacity: 0.3; cursor: default; }
    .nav-btn:hover:not(:disabled) { background: #fff; }
    .nav-prev { left: 10px; }
    .nav-next { right: 10px; }

    .counter {
        position: absolute; bottom: 10px; right: 10px;
        background: rgba(0,0,0,0.45); color: #fff;
        font-size: 0.7rem; padding: 3px 9px; border-radius: 20px; z-index: 4;
    }

    .carousel-actions {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 0.75rem; min-height: 1.5rem;
    }
    .action-link {
        background: none; border: none;
        font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
        color: var(--gold, #C9A96E); cursor: pointer; padding: 0;
        transition: color 0.2s;
    }
    .action-link:hover:not(:disabled) { color: var(--rose, #D94F6B); }
    .action-link:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-remove {
        background: none; border: none;
        font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
        color: rgba(138,127,121,0.7); cursor: pointer;
        padding: 0; margin-left: auto; transition: color 0.2s;
    }
    .action-remove:hover:not(:disabled) { color: var(--rose, #D94F6B); }
    .action-remove:disabled { opacity: 0.5; cursor: not-allowed; }

    .thumbs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 4px; }
    .thumb-wrap { flex-shrink: 0; }
    .thumb {
        width: 60px; height: 60px; border-radius: 10px; overflow: hidden;
        border: 2px solid transparent; cursor: pointer;
        padding: 0; background: none; transition: border-color 0.2s; display: block;
    }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb.active { border-color: var(--rose, #D94F6B); }
    .thumb.is-principal { border-color: var(--gold, #C9A96E); }
    .thumb:focus { outline: 2px solid var(--rose, #D94F6B); outline-offset: 2px; }

    .thumb-add { flex-shrink: 0; }
    .hidden-input { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
    .thumb-add-label {
        display: flex; align-items: center; justify-content: center;
        width: 60px; height: 60px; border-radius: 10px;
        border: 2px dashed rgba(138,127,121,0.35);
        cursor: pointer; color: var(--muted, #8A7F79);
        transition: border-color 0.2s, background 0.2s;
    }
    .thumb-add-label svg { width: 20px; height: 20px; }
    .thumb-add-label:hover { border-color: var(--rose, #D94F6B); background: var(--rose-pale, #FDE8EE); }

    .empty-state {
        display: flex; flex-direction: column; align-items: center;
        gap: 0.75rem; padding: 2.5rem 1rem;
        border: 2px dashed rgba(138,127,121,0.25); border-radius: 14px;
        background: rgba(255,255,255,0.4);
    }
    .empty-icon svg { width: 48px; height: 48px; color: rgba(138,127,121,0.4); }
    .empty-text { font-size: 0.85rem; color: var(--muted, #8A7F79); }
    .empty-btn {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 0.6rem 1.4rem; border-radius: 10px;
        background: var(--rose, #D94F6B); color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
        cursor: pointer; transition: opacity 0.2s;
    }
    .empty-btn:hover { opacity: 0.88; }

    .mini-spinner {
        display: inline-block; width: 16px; height: 16px;
        border: 2px solid rgba(138,127,121,0.3);
        border-top-color: var(--rose, #D94F6B);
        border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    .mini-spinner.white { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg { font-size: 0.75rem; color: var(--rose, #D94F6B); margin-top: 0.4rem; }
</style>