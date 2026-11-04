<!-- $lib/components/matches/MatchCard.svelte -->
<script lang="ts">
    import Avatar from '$lib/components/ui/Avatar.svelte';
    import Icon from '$lib/components/ui/Icon.svelte';
    import ContatoLinks from './ContatoLinks.svelte';
    import type { MatchView } from './types';

    export let match: MatchView;
    export let onDesfazer: (matchId: string) => void;
</script>

<div class="card">
    <div class="top">
        <Avatar nome={match.nome} foto={match.fotoUrl} />
        <div class="info">
            <h3 class="name">{match.nome}</h3>
            {#if match.curso}<p class="meta">{match.curso}</p>{/if}
        </div>
        <button class="unmatch" on:click={() => onDesfazer(match.matchId)} aria-label="Desfazer match com {match.nome}">
            <Icon name="x" size={16} />
        </button>
    </div>
    <ContatoLinks instagram={match.instagram} whatsapp={match.whatsapp} telegram={match.telegram} />
</div>

<style>
    .card { background: rgba(255,255,255,.9); backdrop-filter: blur(10px); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 2px 14px rgba(15,22,36,.05); overflow: hidden; animation: fade-up .3s ease both; }
    .top { display: flex; align-items: center; gap: .85rem; padding: .9rem 1rem; }
    .info { flex: 1; min-width: 0; }
    .name { font-size: .92rem; font-weight: 600; color: var(--ink); }
    .meta { font-size: .72rem; color: var(--muted); margin-top: .1rem; }
    .unmatch { background: none; border: none; cursor: pointer; color: rgba(100,116,139,.4); padding: .3rem; border-radius: 8px; transition: color .2s, background .2s; flex-shrink: 0; }
    .unmatch:hover { color: #ef4444; background: rgba(239,68,68,.06); }
    @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
