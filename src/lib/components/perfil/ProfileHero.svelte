<!-- $lib/components/perfil/ProfileHero.svelte -->
<script lang="ts">
    import Avatar from '$lib/components/ui/Avatar.svelte';

    export let nome = '';
    export let curso = '';
    export let foto = '';
    export let tags: string[] = [];
</script>

<div class="hero">
    <Avatar {nome} {foto} size={64} />
    <div class="info">
        <h2 class="name">{nome || 'Seu nome'}</h2>
        <p class="meta">{curso}</p>
        {#if tags.length > 0}
            <div class="tags">
                {#each tags.slice(0, 3) as tag (tag)}<span class="tag">{tag}</span>{/each}
            </div>
        {/if}
    </div>
</div>

<style>
    /* alinha com a coluna de 480px da tela de perfil, em qualquer largura */
    .hero { display: flex; align-items: center; gap: 1rem; padding: 1.25rem max(1rem, calc((100% - 480px) / 2 + 1rem)); background: #fff; border-bottom: 1px solid var(--border); }
    .info { flex: 1; min-width: 0; }
    .name { font-size: 1.15rem; font-weight: 700; color: var(--ink); }
    .meta { font-size: .75rem; color: var(--muted); margin-top: .1rem; }
    .tags { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .4rem; }
    .tag { font-size: .63rem; padding: .18rem .5rem; border-radius: 20px; background: var(--primary-l); color: var(--primary); font-weight: 500; }
</style>
