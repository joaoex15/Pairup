<script lang="ts">
    export let fotos: Foto[] = [];
    export let errors: Record<string, string> = {};
    
    interface Foto {
        id: string;
        url: string;
        file?: File;
        principal: boolean;
    }
    
    // Controle do carrossel de fotos
    let fotoIndex = 0;
    let uploadLoading = false;
    const fotoInputId = `foto-${Math.random().toString(36).substr(2, 9)}`;
    
    $: fotoAtual = fotos[fotoIndex] || null;
    $: totalFotos = fotos.length;
    
    // Função para lidar com upload de múltiplas fotos
    const handleFileUpload = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        
        uploadLoading = true;
        
        try {
            // Processar cada arquivo selecionado
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                
                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    errors.foto = 'Apenas imagens são permitidas';
                    continue;
                }
                
                // Validar tamanho (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    errors.foto = 'Cada imagem deve ter no máximo 5MB';
                    continue;
                }
                
                // Criar preview local
                const reader = new FileReader();
                const fotoId = `foto-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`;
                
                await new Promise((resolve) => {
                    reader.onload = (e) => {
                        const novaFoto: Foto = {
                            id: fotoId,
                            url: e.target?.result as string,
                            file: file,
                            principal: fotos.length === 0 && i === 0 // Primeira foto é principal
                        };
                        
                        fotos = [...fotos, novaFoto];
                        resolve(null);
                    };
                    reader.readAsDataURL(file);
                });
            }
            
            // Se era a primeira foto, mostrar ela
            if (fotos.length > 0 && fotoIndex >= fotos.length) {
                fotoIndex = fotos.length - 1;
            }
            
        } catch {
            errors.foto = 'Erro ao fazer upload';
        } finally {
            uploadLoading = false;
            // Limpar input
            input.value = '';
        }
    };
    
    // Função para remover foto
    const removerFoto = (fotoId: string) => {
        const fotoRemovida = fotos.find(f => f.id === fotoId);
        fotos = fotos.filter(f => f.id !== fotoId);
        
        // Se removeu a foto principal, definir nova principal
        if (fotoRemovida?.principal && fotos.length > 0) {
            fotos[0].principal = true;
        }
        
        // Ajustar índice
        if (fotoIndex >= fotos.length) {
            fotoIndex = Math.max(0, fotos.length - 1);
        }
    };
    
    // Função para definir foto como principal
    const setFotoPrincipal = (fotoId: string) => {
        fotos = fotos.map(f => ({
            ...f,
            principal: f.id === fotoId
        }));
    };
    
    // Navegação do carrossel
    const fotoAnterior = () => {
        if (fotoIndex > 0) {
            fotoIndex--;
        }
    };
    
    const fotoProxima = () => {
        if (fotoIndex < fotos.length - 1) {
            fotoIndex++;
        }
    };
    
    // Handlers de teclado para acessibilidade
    const handleKeyDownAnterior = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fotoAnterior();
        }
    };
    
    const handleKeyDownProxima = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fotoProxima();
        }
    };
    
    const handleKeyDownThumbnail = (e: KeyboardEvent, idx: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fotoIndex = idx;
        }
    };
    
    const handleKeyDownRemover = (e: KeyboardEvent, fotoId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            removerFoto(fotoId);
        }
    };
    
    const handleKeyDownPrincipal = (e: KeyboardEvent, fotoId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFotoPrincipal(fotoId);
        }
    };
</script>

<div>
    <!-- Label associado ao input (acessibilidade) -->
    <label for={fotoInputId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        Fotos do Perfil <span class="text-red-500">*</span>
    </label>
    
    <!-- Carrossel de Fotos -->
    {#if fotos.length > 0}
        <div class="relative mb-4">
            <!-- Imagem atual -->
            <div class="aspect-square w-full max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 {fotoAtual?.principal ? 'border-pink-500' : 'border-gray-300'}">
                {#if fotoAtual}
                    <img src={fotoAtual.url} alt={`Foto ${fotoIndex + 1} do perfil`} class="w-full h-full object-cover">
                {/if}
            </div>
            
            <!-- Indicador de principal -->
            {#if fotoAtual?.principal}
                <div class="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    Principal
                </div>
            {/if}
            
            <!-- Botões de navegação -->
            {#if totalFotos > 1}
                <button 
                    type="button"
                    on:click={fotoAnterior}
                    on:keydown={handleKeyDownAnterior}
                    disabled={fotoIndex === 0}
                    aria-label="Foto anterior"
                    title="Foto anterior"
                    class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button 
                    type="button"
                    on:click={fotoProxima}
                    on:keydown={handleKeyDownProxima}
                    disabled={fotoIndex === totalFotos - 1}
                    aria-label="Próxima foto"
                    title="Próxima foto"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            {/if}
            
            <!-- Contador -->
            <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                {fotoIndex + 1}/{totalFotos}
            </div>
        </div>
        
        <!-- Miniaturas -->
        <div class="flex gap-2 overflow-x-auto pb-2 mb-3" role="list" aria-label="Miniaturas das fotos">
            {#each fotos as foto, idx (foto.id)}
                <!-- Usando button em vez de div para acessibilidade -->
                <button 
                    type="button"
                    on:click={() => fotoIndex = idx}
                    on:keydown={(e) => handleKeyDownThumbnail(e, idx)}
                    aria-label={`Ver foto ${idx + 1}${foto.principal ? ' (principal)' : ''}`}
                    aria-current={fotoIndex === idx ? 'true' : 'false'}
                    class="relative shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-lg"
                >
                    <div class={`
                        w-16 h-16 rounded-lg overflow-hidden border-2
                        ${foto.principal ? 'border-pink-500' : 'border-gray-300'}
                        ${fotoIndex === idx ? 'ring-2 ring-pink-500' : ''}
                    `}>
                        <img src={foto.url} alt={`Miniatura ${idx + 1}`} class="w-full h-full object-cover">
                    </div>
                    
                    <!-- Botão remover - agora está SEPARADO, não dentro de outro botão -->
                </button>
                
                <!-- Botão remover fora do botão da miniatura -->
                <div class="relative inline-block ml-[-20px]">
                    <button 
                        type="button"
                        on:click={(e) => {
                            e.stopPropagation();
                            removerFoto(foto.id);
                        }}
                        on:keydown={(e) => {
                            e.stopPropagation();
                            handleKeyDownRemover(e, foto.id);
                        }}
                        aria-label={`Remover foto ${idx + 1}`}
                        title="Remover foto"
                        class="bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        ✕
                    </button>
                </div>
                
                <!-- Indicador de principal -->
              
            {/each}
            
            <!-- Botão adicionar mais -->
            <div class="relative shrink-0">
                <input
                    type="file"
                    id={fotoInputId}
                    accept="image/*"
                    multiple
                    on:change={handleFileUpload}
                    class="hidden"
                    disabled={uploadLoading}
                />
                <label 
                    for={fotoInputId}
                    class="w-16 h-16 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 {uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}"
                    tabindex="0"
                    role="button"
                    aria-label="Adicionar novas fotos"
                    on:keydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            document.getElementById(fotoInputId)?.click();
                        }
                    }}
                >
                    {#if uploadLoading}
                        <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    {:else}
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="text-[8px] text-gray-500">Adicionar</span>
                    {/if}
                </label>
            </div>
        </div>
        
        <!-- Botão definir como principal -->
        {#if fotoAtual && !fotoAtual.principal}
            <button 
                type="button"
                on:click={() => setFotoPrincipal(fotoAtual.id)}
                on:keydown={(e) => handleKeyDownPrincipal(e, fotoAtual.id)}
                class="text-xs text-pink-600 hover:text-pink-700 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500 p-1 rounded"
                aria-label="Definir foto atual como principal"
            >
                Definir como foto principal
            </button>
        {/if}
    {:else}
        <!-- Estado vazio -->
        <div class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-gray-500 mb-3">Nenhuma foto adicionada</p>
            
            <input
                type="file"
                id={fotoInputId}
                accept="image/*"
                multiple
                on:change={handleFileUpload}
                class="hidden"
                disabled={uploadLoading}
            />
            <label 
                for={fotoInputId}
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 {uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}"
                tabindex="0"
                role="button"
                on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById(fotoInputId)?.click();
                    }
                }}
            >
                {#if uploadLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                {:else}
                    Escolher fotos
                {/if}
            </label>
        </div>
    {/if}
    
    {#if errors.foto}
        <span class="text-xs text-red-500 block mt-2" role="alert">{errors.foto}</span>
    {/if}
    <p class="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, GIF. Máx: 5MB por foto. Você pode selecionar múltiplas fotos de uma vez.</p>
</div>