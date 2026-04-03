<!-- $lib/components/FotosUploader.svelte -->
<script lang="ts">
    import { api } from '$lib/services/api';
    import { handleApiError } from '$lib/utils/errorUtils';

    export let fotos: Array<{
        id: string;
        url: string;
        file?: File;
        principal: boolean;
    }> = [];

    export let errors: Record<string, string> = {};

    let uploadLoading = false;
    let uploadError = '';

    const handleFileSelect = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        
        if (files.length === 0) return;
        
        uploadLoading = true;
        uploadError = '';
        
        for (const file of files) {
            // Validar tipo (já validado no backend, mas fazemos preview)
            if (!file.type.startsWith('image/')) {
                uploadError = 'Apenas imagens são permitidas';
                continue;
            }
            
            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                uploadError = 'Imagem muito grande (máx 5MB)';
                continue;
            }
            
            // Criar preview local
            const localUrl = URL.createObjectURL(file);
            const novaFoto = {
                id: `temp-${Date.now()}-${Math.random()}`,
                url: localUrl,
                file: file,
                principal: fotos.length === 0,
            };
            
            fotos = [...fotos, novaFoto];
            
            // Se for a primeira foto, marca como principal
            if (fotos.length === 1) {
                fotos = fotos.map(f => ({ ...f, principal: f.id === novaFoto.id }));
            }
        }
        
        uploadLoading = false;
        input.value = '';
    };
    
    const setPrincipal = (id: string) => {
        fotos = fotos.map(f => ({
            ...f,
            principal: f.id === id,
        }));
    };
    
    const removerFoto = (id: string) => {
        const removida = fotos.find(f => f.id === id);
        fotos = fotos.filter(f => f.id !== id);
        
        // Se removemos a foto principal e ainda há fotos, marca a primeira como principal
        if (removida?.principal && fotos.length > 0) {
            fotos = fotos.map((f, i) => ({ ...f, principal: i === 0 }));
        }
        
        // Revogar URL do blob
        if (removida?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(removida.url);
        }
    };
</script>

<div class="fotos-uploader">
    {#if uploadError}
        <div class="upload-error">{uploadError}</div>
    {/if}
    
    <div class="fotos-grid">
        {#each fotos as foto (foto.id)}
            <div class="foto-item" class:principal={foto.principal}>
                <img src={foto.url} alt="Foto" />
                
                {#if !foto.principal}
                    <button
                        class="foto-principal-btn"
                        on:click={() => setPrincipal(foto.id)}
                        title="Definir como principal"
                    >
                        ★
                    </button>
                {:else}
                    <div class="principal-badge">Principal</div>
                {/if}
                
                <button
                    class="foto-remove-btn"
                    on:click={() => removerFoto(foto.id)}
                    title="Remover foto"
                >
                    ✕
                </button>
            </div>
        {/each}
        
        {#if fotos.length < 6}
            <label class="foto-add">
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    on:change={handleFileSelect}
                    disabled={uploadLoading}
                />
                <div class="add-icon">+</div>
                <span class="add-text">
                    {#if uploadLoading}
                        Enviando...
                    {:else}
                        Adicionar foto
                    {/if}
                </span>
            </label>
        {/if}
    </div>
    
    <p class="fotos-hint">
        Adicione até 6 fotos. A primeira será sua foto principal (você pode alterar depois).
        <br>
        Formatos: JPEG, PNG, WebP (máx 5MB cada)
    </p>
    
    {#if errors.foto}
        <p class="field-error">{errors.foto}</p>
    {/if}
</div>

<style>
    .fotos-uploader {
        width: 100%;
    }
    
    .fotos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
    }
    
    .foto-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid transparent;
        transition: border-color 0.2s;
    }
    
    .foto-item.principal {
        border-color: var(--rose, #D94F6B);
    }
    
    .foto-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .principal-badge {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(217,79,107,0.9), transparent);
        color: white;
        font-size: 0.6rem;
        font-weight: 500;
        text-align: center;
        padding: 0.25rem;
    }
    
    .foto-principal-btn {
        position: absolute;
        top: 0.25rem;
        left: 0.25rem;
        background: rgba(0,0,0,0.6);
        border: none;
        color: #ffd700;
        font-size: 1rem;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }
    
    .foto-principal-btn:hover {
        background: rgba(0,0,0,0.8);
    }
    
    .foto-remove-btn {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: rgba(0,0,0,0.6);
        border: none;
        color: #ef4444;
        font-size: 1rem;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }
    
    .foto-remove-btn:hover {
        background: rgba(0,0,0,0.8);
        color: #dc2626;
    }
    
    .foto-add {
        aspect-ratio: 1;
        border: 2px dashed rgba(138,127,121,0.3);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
    }
    
    .foto-add:hover {
        border-color: var(--rose, #D94F6B);
        background: rgba(217,79,107,0.05);
    }
    
    .foto-add input {
        display: none;
    }
    
    .add-icon {
        font-size: 2rem;
        color: var(--muted, #8A7F79);
        margin-bottom: 0.25rem;
    }
    
    .add-text {
        font-size: 0.7rem;
        color: var(--muted, #8A7F79);
    }
    
    .fotos-hint {
        font-size: 0.7rem;
        color: var(--muted, #8A7F79);
        margin-top: 0.75rem;
        line-height: 1.4;
    }
    
    .upload-error {
        background: #FEF2F2;
        border: 1px solid #FECACA;
        color: #991B1B;
        font-size: 0.75rem;
        padding: 0.5rem;
        border-radius: 8px;
        margin-bottom: 0.75rem;
    }
    
    .field-error {
        font-size: 0.7rem;
        color: var(--rose, #D94F6B);
        margin-top: 0.25rem;
    }
</style>