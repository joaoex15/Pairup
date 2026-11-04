<!-- $lib/components/ui/LoadingState.svelte -->
<script lang="ts">
    export let text = 'Carregando...';
</script>

<div class="wrap" role="status" aria-live="polite">
    <div class="ring" aria-hidden="true"></div>
    <p class="text">{text}</p>
</div>

<style>
    .wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; }
    .ring { width: 44px; height: 44px; border: 3px solid rgba(79,70,229,.15); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; }
    .text { font-size: .82rem; color: var(--muted); }
    @keyframes spin { to { transform: rotate(360deg); } }
</style>
