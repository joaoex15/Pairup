<script lang="ts">
    interface Tag { id: string; nome: string; categoria?: string; }

    export let selectedTags: Tag[] = [];

    let searchTerm = '';
    const searchId = `tag-search-${Math.random().toString(36).substr(2, 9)}`;

    const availableTags: Tag[] = [
        { id: '1',  nome: 'Música',       categoria: 'Hobbies' },
        { id: '2',  nome: 'Esportes',     categoria: 'Hobbies' },
        { id: '3',  nome: 'Cinema',       categoria: 'Entretenimento' },
        { id: '4',  nome: 'Tecnologia',   categoria: 'Interesses' },
        { id: '5',  nome: 'Viagem',       categoria: 'Estilo de vida' },
        { id: '6',  nome: 'Fotografia',   categoria: 'Arte' },
        { id: '7',  nome: 'Culinária',    categoria: 'Hobbies' },
        { id: '8',  nome: 'Leitura',      categoria: 'Hobbies' },
        { id: '9',  nome: 'Jogos',        categoria: 'Entretenimento' },
        { id: '10', nome: 'Animais',      categoria: 'Estilo de vida' },
        { id: '11', nome: 'Arte',         categoria: 'Arte' },
        { id: '12', nome: 'Meditação',    categoria: 'Estilo de vida' },
    ];

    $: filteredTags = availableTags.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSelected = (id: string) => selectedTags.some(t => t.id === id);

    const toggleTag = (tag: Tag) => {
        if (isSelected(tag.id)) {
            selectedTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            selectedTags = [...selectedTags, tag];
        }
    };
</script>

<div class="tags-wrap">
    <div class="tags-header">
        <span class="tags-label">Interesses</span>
        <span class="tags-count">{selectedTags.length} selecionado{selectedTags.length !== 1 ? 's' : ''}</span>
    </div>

    <!-- Search -->
    <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input id={searchId} type="text" placeholder="Buscar interesses..."
            bind:value={searchTerm} class="search-input" />
    </div>

    <!-- Selected chips -->
    {#if selectedTags.length > 0}
        <div class="selected-chips" aria-label="Tags selecionadas">
            {#each selectedTags as tag (tag.id)}
                <button type="button" class="chip chip-selected"
                    on:click={() => toggleTag(tag)}
                    aria-label={`Remover ${tag.nome}`}>
                    {tag.nome}
                    <span class="chip-x" aria-hidden="true">✕</span>
                </button>
            {/each}
        </div>
    {/if}

    <!-- Available tags — sem role="list" no container para evitar conflito com aria-pressed nos filhos -->
    <div class="tags-pool" aria-label="Tags disponíveis">
        {#if filteredTags.length === 0}
            <p class="no-results">Nenhum interesse encontrado</p>
        {:else}
            {#each filteredTags as tag (tag.id)}
                <button
                    type="button"
                    class="chip"
                    class:chip-selected={isSelected(tag.id)}
                    on:click={() => toggleTag(tag)}
                    aria-pressed={isSelected(tag.id)}
                    aria-label={`${tag.nome}${isSelected(tag.id) ? ' (selecionado)' : ''}`}
                >
                    {tag.nome}
                </button>
            {/each}
        {/if}
    </div>

    <p class="tags-tip">Escolha até 5 interesses para o seu perfil</p>
</div>

<style>
    .tags-wrap { width: 100%; }

    .tags-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 0.6rem;
    }
    .tags-label {
        font-size: 0.72rem; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.06em;
        color: var(--muted, #8A7F79);
    }
    .tags-count { font-size: 0.72rem; color: var(--rose, #D94F6B); }

    .search-wrap { position: relative; margin-bottom: 0.75rem; }
    .search-icon {
        position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%);
        width: 15px; height: 15px; color: var(--muted, #8A7F79); pointer-events: none;
    }
    .search-input {
        width: 100%; padding: 0.6rem 0.9rem 0.6rem 2.2rem;
        border: 1.5px solid rgba(138,127,121,0.22);
        border-radius: 10px; background: rgba(255,255,255,0.6);
        font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
        color: var(--ink, #1A1410); outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-input::placeholder { color: rgba(138,127,121,0.5); }
    .search-input:focus {
        border-color: var(--rose, #D94F6B);
        box-shadow: 0 0 0 3px rgba(217,79,107,0.1);
    }

    .selected-chips {
        display: flex; flex-wrap: wrap; gap: 0.4rem;
        margin-bottom: 0.75rem; padding: 0.6rem;
        border-radius: 10px; background: var(--rose-pale, #FDE8EE);
    }

    /* Tags pool: div sem role="list" para que os buttons
       possam usar aria-pressed livremente */
    .tags-pool {
        display: flex; flex-wrap: wrap; gap: 0.4rem;
        max-height: 130px; overflow-y: auto;
        padding: 0.5rem;
        border: 1.5px solid rgba(138,127,121,0.15);
        border-radius: 10px; background: rgba(255,255,255,0.4);
        margin-bottom: 0.4rem;
    }

    .chip {
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        border: 1.5px solid rgba(138,127,121,0.25);
        background: #fff; color: var(--ink, #1A1410);
        font-family: 'DM Sans', sans-serif; font-size: 0.78rem;
        cursor: pointer; white-space: nowrap;
        transition: all 0.18s ease;
        display: flex; align-items: center; gap: 0.3rem;
    }
    .chip:hover {
        border-color: var(--rose, #D94F6B);
        color: var(--rose, #D94F6B);
        background: var(--rose-pale, #FDE8EE);
    }
    .chip:focus { outline: 2px solid var(--rose, #D94F6B); outline-offset: 1px; }

    .chip-selected {
        background: var(--rose, #D94F6B);
        border-color: var(--rose, #D94F6B);
        color: #fff;
    }
    .chip-selected:hover {
        background: #C0394F; border-color: #C0394F; color: #fff;
    }

    .chip-x { font-size: 0.65rem; opacity: 0.75; }

    .no-results { font-size: 0.8rem; color: var(--muted, #8A7F79); padding: 0.5rem; }
    .tags-tip   { font-size: 0.7rem; color: var(--muted, #8A7F79); }
</style>