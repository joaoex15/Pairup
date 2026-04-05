<!-- $lib/components/TagsSelector.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { apiGetTagsAtivas } from '$lib/services/api';
    import type { TagResponse } from '$lib/services/api';

    // CORREÇÃO: tags carregadas da API em vez de hardcoded.
    // Usa /tags/ativas (endpoint público, sem JWT necessário no backend).

    export let selectedTags: TagResponse[] = [];

    let searchTerm  = '';
    let allTags:    TagResponse[] = [];
    let loadError   = '';
    let loadingTags = true;

    const searchId = `tag-search-${Math.random().toString(36).slice(2, 9)}`;

    onMount(async () => {
        const res = await apiGetTagsAtivas();
        if (res.error || !res.data) {
            loadError = 'Não foi possível carregar os interesses.';
        } else {
            allTags = res.data;
        }
        loadingTags = false;
    });

    $: filteredTags = allTags.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSelected = (id: string) => selectedTags.some(t => t.id === id);

    const toggleTag = (tag: TagResponse) => {
        if (isSelected(tag.id)) {
            selectedTags = selectedTags.filter(t => t.id !== tag.id);
        } else if (selectedTags.length < 5) {
            selectedTags = [...selectedTags, tag];
        }
    };
</script>

<div class="tags-wrap">
    <div class="tags-header">
        <span class="tags-label">Interesses</span>
        <span class="tags-count">{selectedTags.length}/5 selecionado{selectedTags.length !== 1 ? 's' : ''}</span>
    </div>

    <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input
            id={searchId}
            type="text"
            placeholder="Buscar interesses..."
            bind:value={searchTerm}
            class="search-input"
            aria-label="Buscar interesses"
        />
    </div>

    {#if selectedTags.length > 0}
        <div class="selected-chips" aria-label="Tags selecionadas">
            {#each selectedTags as tag (tag.id)}
                <button
                    type="button"
                    class="chip chip-selected"
                    on:click={() => toggleTag(tag)}
                    aria-label={`Remover ${tag.nome}`}
                >
                    {tag.nome}
                    <span class="chip-x" aria-hidden="true">✕</span>
                </button>
            {/each}
        </div>
    {/if}

    <div class="tags-pool" aria-label="Tags disponíveis" aria-busy={loadingTags}>
        {#if loadingTags}
            <p class="no-results">Carregando interesses...</p>
        {:else if loadError}
            <p class="no-results error">{loadError}</p>
        {:else if filteredTags.length === 0}
            <p class="no-results">Nenhum interesse encontrado</p>
        {:else}
            {#each filteredTags as tag (tag.id)}
                <button
                    type="button"
                    class="chip"
                    class:chip-selected={isSelected(tag.id)}
                    class:chip-disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                    on:click={() => toggleTag(tag)}
                    disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                    aria-pressed={isSelected(tag.id)}
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
        margin-bottom: .6rem;
    }
    .tags-label {
        font-size: .72rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: .06em;
        color: var(--muted, #64748B);
    }
    .tags-count { font-size: .72rem; font-weight: 700; color: var(--primary, #4F46E5); }

    .search-wrap { position: relative; margin-bottom: .75rem; }
    .search-icon {
        position: absolute; left: .7rem; top: 50%; transform: translateY(-50%);
        width: 15px; height: 15px; color: var(--muted, #64748B); pointer-events: none;
    }
    .search-input {
        width: 100%; padding: .6rem .9rem .6rem 2.2rem;
        border: 1.5px solid rgba(100,116,139,.22);
        border-radius: 10px; background: rgba(255,255,255,.7);
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: .85rem;
        color: var(--ink, #0F1624); outline: none;
        transition: border-color .2s, box-shadow .2s;
    }
    .search-input::placeholder { color: rgba(100,116,139,.5); }
    .search-input:focus {
        border-color: var(--primary, #4F46E5);
        box-shadow: 0 0 0 3px rgba(79,70,229,.1);
    }

    .selected-chips {
        display: flex; flex-wrap: wrap; gap: .4rem;
        margin-bottom: .75rem; padding: .6rem;
        border-radius: 10px;
        background: var(--primary-l, #EEF2FF);
    }

    .tags-pool {
        display: flex; flex-wrap: wrap; gap: .4rem;
        max-height: 130px; overflow-y: auto;
        padding: .5rem;
        border: 1.5px solid rgba(79,70,229,.12);
        border-radius: 10px;
        background: rgba(255,255,255,.45);
        margin-bottom: .4rem;
    }

    .chip {
        padding: .3rem .8rem; border-radius: 20px;
        border: 1.5px solid rgba(100,116,139,.25);
        background: #fff; color: var(--ink, #0F1624);
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: .78rem; font-weight: 500;
        cursor: pointer; white-space: nowrap;
        transition: all .18s ease;
        display: flex; align-items: center; gap: .3rem;
    }
    .chip:hover:not(:disabled) {
        border-color: var(--primary, #4F46E5);
        color: var(--primary, #4F46E5);
        background: var(--primary-l, #EEF2FF);
    }
    .chip:focus { outline: 2px solid var(--primary, #4F46E5); outline-offset: 1px; }

    .chip-selected {
        background: var(--primary, #4F46E5);
        border-color: var(--primary, #4F46E5);
        color: #fff;
    }
    .chip-selected:hover { background: var(--primary-d, #3730A3); border-color: var(--primary-d, #3730A3); color: #fff; }

    .chip-disabled { opacity: .4; cursor: not-allowed; }
    .chip-x { font-size: .65rem; opacity: .75; }

    .no-results { font-size: .8rem; color: var(--muted, #64748B); padding: .5rem; }
    .no-results.error { color: #DC2626; }
    .tags-tip { font-size: .7rem; color: var(--muted, #64748B); }
</style>