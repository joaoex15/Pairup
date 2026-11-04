<!-- $lib/components/ui/Section.svelte -->
<script lang="ts">
    export let icon = '';
    export let title: string;
</script>

<section class="section">
    <h3 class="title">{#if icon}<span aria-hidden="true">{icon}</span>{/if} {title}</h3>
    <slot />
</section>

<style>
    .section { background: rgba(255,255,255,.82); backdrop-filter: blur(10px); border: 1px solid var(--border); border-radius: 16px; padding: 1.1rem; box-shadow: 0 2px 12px rgba(15,22,36,.04); }
    .title { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-bottom: .9rem; display: flex; align-items: center; gap: .4rem; }
</style>
