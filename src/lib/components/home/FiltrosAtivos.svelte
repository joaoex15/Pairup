<!-- $lib/components/home/FiltrosAtivos.svelte -->
<script lang="ts">
    import Icon from '$lib/components/ui/Icon.svelte';

    export let nomes: string[];
    export let onLimpar: () => void;

    $: texto = nomes.join(', ');
</script>

<div class="bar" role="group" aria-label="Filtros ativos: {texto}">
    <Icon name="funnel" size={13} />
    <span class="text">{texto}</span>
    <button on:click={onLimpar} aria-label="Remover filtros">✕</button>
</div>

<style>
    .bar { display: flex; align-items: center; gap: .5rem; background: rgba(79,70,229,.08); border: 1px solid rgba(79,70,229,.2); border-radius: 20px; padding: .35rem .75rem; font-size: .72rem; color: var(--primary); max-width: 380px; width: 100%; }
    .text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    button { background: none; border: none; cursor: pointer; color: var(--primary); font-size: .75rem; padding: 0; flex-shrink: 0; }
</style>
