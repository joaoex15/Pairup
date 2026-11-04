<!-- Telas de login e cadastro: painel da marca ao lado do formulário. -->
<script lang="ts">
    import BrandPanel from '$lib/components/BrandPanel.svelte';
</script>

<div class="auth-shell">
    <BrandPanel />

    <main class="form-panel">
        <slot />
    </main>
</div>

<style>
    .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .form-panel {
        background: var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        overflow-y: auto;
    }

    @media (max-width: 768px) {
        .auth-shell { grid-template-columns: 1fr; }
        .form-panel { padding: 2rem 1.25rem; min-height: 100vh; }
    }
</style>
