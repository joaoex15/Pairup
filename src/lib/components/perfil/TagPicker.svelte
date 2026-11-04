<!-- $lib/components/perfil/TagPicker.svelte
     Busca e seleção de tags. Não chama a API: quem usa carrega `tags` uma vez.
     Sem `max`, a seleção é ilimitada (filtros da home). -->
<script lang="ts">
    import type { TagResponse } from '$lib/services/api';

    export let tags: TagResponse[] = [];
    export let selected: TagResponse[] = [];
    export let loading = false;
    export let max: number | null = null;

    let busca = '';

    $: filtradas = tags.filter(t => t.nome.toLowerCase().includes(busca.toLowerCase()));
    $: selecionadas = new Set(selected.map(t => t.id));
    $: cheio = max !== null && selected.length >= max;

    const alternar = (tag: TagResponse) => {
        if (selecionadas.has(tag.id)) selected = selected.filter(t => t.id !== tag.id);
        else if (!cheio) selected = [...selected, tag];
    };
</script>

{#if loading}
    <div class="loading" aria-live="polite">Carregando interesses...</div>
{:else}
    {#if max !== null}
        <div class="count-row"><span class="count" aria-live="polite">{selected.length}/{max} selecionados</span></div>
    {/if}

    {#if selected.length > 0}
        <div class="selected" aria-label="Interesses selecionados">
            {#each selected as tag (tag.id)}
                <button type="button" class="chip chip--on" on:click={() => alternar(tag)} aria-label="Remover {tag.nome}">
                    {tag.nome} <span aria-hidden="true">✕</span>
                </button>
            {/each}
        </div>
    {/if}

    <input type="text" placeholder="Buscar interesses..." bind:value={busca} class="search" aria-label="Buscar interesses" />

    <div class="pool" aria-label="Interesses disponíveis">
        {#each filtradas as tag (tag.id)}
            {@const on = selecionadas.has(tag.id)}
            <button type="button" class="chip" class:chip--on={on} disabled={!on && cheio}
                on:click={() => alternar(tag)} aria-pressed={on}>
                {tag.nome}
            </button>
        {:else}
            <p class="none">Nenhum interesse encontrado</p>
        {/each}
    </div>
{/if}

<style>
    .loading { text-align: center; padding: 1.25rem 0; color: var(--muted); }
    .count-row { display: flex; justify-content: flex-end; margin-bottom: .5rem; }
    .count { font-size: .7rem; color: var(--primary); font-weight: 600; }
    .selected { display: flex; flex-wrap: wrap; gap: .35rem; padding: .55rem; border-radius: 10px; background: var(--primary-l); margin-bottom: .65rem; }
    .search { width: 100%; margin-bottom: .6rem; padding: .58rem .85rem; border: 1.5px solid rgba(100,116,139,.2); border-radius: 9px; background: rgba(255,255,255,.65); font-family: inherit; font-size: .83rem; color: var(--ink); outline: none; transition: border-color .2s, box-shadow .2s; }
    .search:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .pool { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 150px; overflow-y: auto; padding: .45rem; border: 1.5px solid rgba(100,116,139,.15); border-radius: 10px; background: rgba(255,255,255,.4); }
    .none { font-size: .78rem; color: var(--muted); padding: .5rem; text-align: center; }
    .chip { padding: .28rem .75rem; border-radius: 20px; border: 1.5px solid rgba(100,116,139,.22); background: #fff; color: var(--ink); font-family: inherit; font-size: .75rem; cursor: pointer; white-space: nowrap; transition: all .15s; }
    .chip:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .chip:disabled { opacity: .4; cursor: not-allowed; }
    .chip--on, .chip--on:hover:not(:disabled) { background: var(--primary); border-color: var(--primary); color: #fff; }
</style>
