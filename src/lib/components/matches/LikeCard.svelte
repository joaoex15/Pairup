<!-- $lib/components/matches/LikeCard.svelte -->
<script lang="ts">
    import { inicial } from '$lib/utils/pessoa';
    import type { LikeView } from './types';

    export let like: LikeView;
</script>

<div class="card">
    <div class="photo">
        {#if like.fotoUrl}
            <img src={like.fotoUrl} alt={like.nome} />
        {:else}
            <div class="placeholder"><span aria-hidden="true">{inicial(like.nome)}</span></div>
        {/if}
        <div class="badge">💙 Like</div>
    </div>
    <div class="info">
        <p class="name">{like.nome}</p>
        {#if like.curso}<p class="meta">{like.curso}</p>{/if}
    </div>
</div>

<style>
    .card { background: rgba(255,255,255,.9); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(15,22,36,.05); animation: fade-up .3s ease both; }
    .photo { position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #818CF8, #4F46E5); }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .placeholder span { font-size: 2.5rem; font-weight: 800; color: rgba(255,255,255,.8); }
    .badge { position: absolute; top: .6rem; right: .6rem; background: var(--primary); color: #fff; font-size: .62rem; font-weight: 600; padding: .2rem .55rem; border-radius: 20px; }
    .info { padding: .65rem .75rem; }
    .name { font-size: .82rem; font-weight: 600; color: var(--ink); }
    .meta { font-size: .7rem; color: var(--muted); margin-top: .1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>
