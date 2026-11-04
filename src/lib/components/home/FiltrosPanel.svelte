<!-- $lib/components/home/FiltrosPanel.svelte
     Edita uma cópia de `selecionadas`: só vale para o deck ao aplicar (onAplicar). -->
<script lang="ts">
    import Alert from '$lib/components/ui/Alert.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Icon from '$lib/components/ui/Icon.svelte';
    import TagPicker from '$lib/components/perfil/TagPicker.svelte';
    import type { TagResponse } from '$lib/services/api';

    export let tags: TagResponse[] = [];
    export let selecionadas: TagResponse[] = [];
    export let loading = false;
    export let compatibilidadeAtiva = false;
    export let onAplicar: (tags: TagResponse[]) => void;
    export let onLimpar: () => void;
    export let onFechar: () => void;

    let rascunho = [...selecionadas];
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -- Escape fecha na página -->
<div class="overlay" on:click={onFechar} aria-hidden="true"></div>
<div class="panel" role="dialog" aria-label="Filtros de busca" aria-modal="true">
    <div class="head">
        <h2 class="title">Filtros</h2>
        <div class="head-actions">
            {#if rascunho.length > 0 || selecionadas.length > 0}<button class="clear" on:click={onLimpar}>Limpar</button>{/if}
            <button class="close" on:click={onFechar} aria-label="Fechar filtros"><Icon name="x" size={18} /></button>
        </div>
    </div>

    {#if compatibilidadeAtiva}
        <Alert tone="info">Filtro de compatibilidade aplicado automaticamente.</Alert>
    {/if}

    <div class="section">
        <p class="section-title">Interesses em comum</p>
        <p class="section-sub">Mostrar pessoas com pelo menos um interesse selecionado</p>
        <TagPicker {tags} {loading} bind:selected={rascunho} />
    </div>

    <Button block on:click={() => onAplicar(rascunho)}>
        Aplicar filtros{#if rascunho.length > 0} · {rascunho.length} tag{rascunho.length > 1 ? 's' : ''}{/if}
    </Button>
</div>

<style>
    .overlay { position: fixed; inset: 0; z-index: 29; background: rgba(15,22,36,.3); backdrop-filter: blur(2px); animation: fade-in .2s ease; }
    .panel { position: fixed; top: 58px; right: 0; left: 0; z-index: 30; background: #fff; border-bottom: 1px solid var(--border); border-radius: 0 0 20px 20px; box-shadow: 0 8px 32px rgba(15,22,36,.12); padding: 1rem 1.25rem 1.25rem; max-height: 70vh; overflow-y: auto; animation: slide-down .25s cubic-bezier(.22,1,.36,1); max-width: 480px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .85rem; }
    .title { font-size: 1.1rem; font-weight: 700; color: var(--ink); }
    .head-actions { display: flex; align-items: center; gap: .5rem; }
    .clear { background: none; border: none; font-size: .75rem; color: var(--primary); cursor: pointer; text-decoration: underline; }
    .close { background: none; border: none; cursor: pointer; color: var(--muted); padding: .2rem; border-radius: 6px; }
    .section { margin-bottom: 1rem; }
    .section-title { font-size: .8rem; font-weight: 600; color: var(--ink); margin-bottom: .15rem; }
    .section-sub { font-size: .72rem; color: var(--muted); margin-bottom: .65rem; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide-down { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: none; } }
</style>
