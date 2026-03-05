<script lang="ts">
    export let selectedTags: Tag[] = [];
    
    interface Tag {
        id: string;
        nome: string;
        categoria?: string;
    }
    
    let searchTerm = '';
    let searchInputId = `tag-search-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock tags
    const availableTags: Tag[] = [
        { id: '1', nome: 'Música', categoria: 'Hobbies' },
        { id: '2', nome: 'Esportes', categoria: 'Hobbies' },
        { id: '3', nome: 'Cinema', categoria: 'Entretenimento' },
        { id: '4', nome: 'Tecnologia', categoria: 'Interesses' },
        { id: '5', nome: 'Viagem', categoria: 'Estilo de vida' },
        { id: '6', nome: 'Fotografia', categoria: 'Arte' },
        { id: '7', nome: 'Culinária', categoria: 'Hobbies' },
        { id: '8', nome: 'Leitura', categoria: 'Hobbies' },
        { id: '9', nome: 'Jogos', categoria: 'Entretenimento' },
        { id: '10', nome: 'Animais', categoria: 'Estilo de vida' },
    ];
    
    $: filteredTags = availableTags.filter(tag => 
        tag.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const toggleTag = (tag: Tag) => {
        if (selectedTags.some(t => t.id === tag.id)) {
            selectedTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            selectedTags = [...selectedTags, tag];
        }
    };
    
    const isSelected = (tagId: string) => {
        return selectedTags.some(t => t.id === tagId);
    };
    
    // Handlers de teclado para acessibilidade
    const handleKeyDownTag = (e: KeyboardEvent, tag: Tag) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTag(tag);
        }
    };
    
    const handleKeyDownRemover = (e: KeyboardEvent, tag: Tag) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTag(tag);
        }
    };
</script>

<div>
    <label for={searchInputId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 block">
        Interesses (opcional)
    </label>
    
    <input
        id={searchInputId}
        type="text"
        placeholder="Buscar tags..."
        bind:value={searchTerm}
        class="block w-full py-2 text-sm text-gray-700 bg-white border rounded-lg px-3 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 mb-3"
    />
    
    {#if selectedTags.length > 0}
        <div class="mb-3">
            <span id="selected-tags-label" class="text-xs text-gray-500 mb-1 block">Selecionadas:</span>
            <div class="flex flex-wrap gap-1" aria-labelledby="selected-tags-label">
                {#each selectedTags as tag (tag.id)}
                    <button
                        type="button"
                        on:click={() => toggleTag(tag)}
                        on:keydown={(e) => handleKeyDownRemover(e, tag)}
                        class="px-2 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        aria-label={`Remover tag ${tag.nome}`}
                        title={`Remover tag ${tag.nome}`}
                    >
                        {tag.nome} ✕
                    </button>
                {/each}
            </div>
        </div>
    {/if}
    
    <div class="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-1 border rounded-lg" role="list" aria-label="Tags disponíveis">
        {#each filteredTags as tag (tag.id)}
            <button
                type="button"
                on:click={() => toggleTag(tag)}
                on:keydown={(e) => handleKeyDownTag(e, tag)}
                class={`
                    px-2 py-0.5 text-xs rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500
                    ${isSelected(tag.id)
                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
                `}
                aria-pressed={isSelected(tag.id)}
                aria-label={`Tag ${tag.nome}${isSelected(tag.id) ? ' (selecionada)' : ''}`}
                title={`Tag ${tag.nome}`}
            >
                {tag.nome}
            </button>
        {/each}
    </div>
</div>