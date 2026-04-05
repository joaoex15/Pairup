<!-- $lib/components/login/LoginSection.svelte -->
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
        width:100%;
        background:rgba(255,255,255,.82);
        backdrop-filter:blur(18px) saturate(1.3);
        -webkit-backdrop-filter:blur(18px) saturate(1.3);
        border:1px solid var(--border,rgba(79,70,229,.15));
        border-radius:20px;
        box-shadow:0 8px 48px rgba(79,70,229,.1), 0 2px 12px rgba(15,22,36,.06);
        padding:2rem 2rem 1.75rem;
        animation:card-in .5s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes card-in {
        from { opacity:0; transform:translateY(18px) scale(.98); }
        to   { opacity:1; transform:translateY(0) scale(1); }
    }

    .card-title {
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:1.4rem; font-weight:800;
        color:var(--ink,#0F1624);
        text-align:center; margin-bottom:1.25rem;
        letter-spacing:-.02em;
    }
</style>