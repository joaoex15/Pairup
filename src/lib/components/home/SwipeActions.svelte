<!-- $lib/components/home/SwipeActions.svelte -->
<script lang="ts">
    import Icon from '$lib/components/ui/Icon.svelte';

    export let nome: string;
    export let onLike: () => void;
    export let onDislike: () => void;
</script>

<div class="row">
    <button class="btn dislike" on:click={onDislike} aria-label="Passar — não tenho interesse">
        <Icon name="x" size={26} strokeWidth={2.5} />
    </button>
    <button class="btn like" on:click={onLike} aria-label="Curtir {nome}">
        <Icon name="heart" size={26} filled />
    </button>
</div>

<style>
    .row { display: flex; gap: 1.5rem; align-items: center; }
    .btn { border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .15s, box-shadow .2s; -webkit-tap-highlight-color: transparent; }
    .btn:hover { transform: scale(1.1); }
    .btn:active { transform: scale(.93); }
    .dislike { width: 60px; height: 60px; background: #fff; color: #ef4444; box-shadow: 0 4px 18px rgba(239,68,68,.2); border: 1.5px solid rgba(239,68,68,.15); }
    .like { width: 70px; height: 70px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; box-shadow: 0 6px 24px rgba(79,70,229,.4); }
</style>
