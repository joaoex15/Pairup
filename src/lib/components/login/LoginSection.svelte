<script lang="ts">
    export let title: string = '';
</script>

<div class="card">
    {#if title}
        <h2 class="card-title">{title}</h2>
    {/if}
    <slot />
</div>

<style>
    .card {
        width: 100%;
        background: var(--card-bg, rgba(255,255,255,0.72));
        backdrop-filter: blur(18px) saturate(1.4);
        -webkit-backdrop-filter: blur(18px) saturate(1.4);
        border: 1px solid var(--border, rgba(201,169,110,0.25));
        border-radius: 20px;
        box-shadow: var(--shadow, 0 8px 48px rgba(217,79,107,0.10));
        padding: 2rem 2rem 1.75rem;
        animation: card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes card-in {
        from { opacity: 0; transform: translateY(18px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
    }

    .card-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ink, #1A1410);
        text-align: center;
        margin-bottom: 1.25rem;
        letter-spacing: -0.01em;
    }
</style>