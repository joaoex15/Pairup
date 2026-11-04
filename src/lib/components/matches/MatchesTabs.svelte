<!-- $lib/components/matches/MatchesTabs.svelte -->
<script lang="ts">
    import Icon from '$lib/components/ui/Icon.svelte';

    export let active: 'matches' | 'likes' = 'matches';
    export let matchCount = 0;
    export let likeCount = 0;
</script>

<div class="bar">
    <button class="tab" class:active={active === 'matches'} on:click={() => active = 'matches'}>
        <Icon name="heart" size={16} filled={active === 'matches'} />
        Matches <span class="count">{matchCount}</span>
    </button>
    <button class="tab" class:active={active === 'likes'} on:click={() => active = 'likes'}>
        <Icon name="star" size={16} filled={active === 'likes'} />
        Likes dados <span class="count">{likeCount}</span>
    </button>
</div>

<style>
    .bar { display: flex; background: #fff; border-bottom: 1px solid rgba(100,116,139,.12); position: sticky; top: 57px; z-index: 9; }
    .tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: .4rem; padding: .85rem .5rem; border: none; background: none; cursor: pointer; font-family: inherit; font-size: .82rem; font-weight: 500; color: var(--muted); border-bottom: 2px solid transparent; transition: color .2s, border-color .2s; }
    .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
    .count { background: rgba(79,70,229,.12); color: var(--primary); font-size: .65rem; font-weight: 600; padding: .15rem .45rem; border-radius: 20px; min-width: 20px; text-align: center; }
    .tab.active .count { background: var(--primary); color: #fff; }
</style>
