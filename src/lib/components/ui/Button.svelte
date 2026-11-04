<!-- $lib/components/ui/Button.svelte -->
<script lang="ts">
    export let variant: 'primary' | 'ghost' | 'danger' | 'danger-outline' = 'primary';
    export let type: 'button' | 'submit' = 'button';
    export let block = false;
    export let disabled = false;
    export let loading = false;
    export let loadingText = 'Aguarde...';
</script>

<button class="btn btn--{variant}" class:block {type} disabled={disabled || loading} aria-busy={loading} on:click>
    {#if loading}
        <span class="spinner" aria-hidden="true"></span> {loadingText}
    {:else}
        <slot />
    {/if}
</button>

<style>
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: .45rem; padding: .75rem 1.5rem; border-radius: 12px; font-family: inherit; font-size: .88rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity .2s, border-color .2s, color .2s, background .2s; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .block { width: 100%; }
    .btn--primary { border: none; color: #fff; background: linear-gradient(135deg, var(--primary), var(--accent)); box-shadow: 0 4px 16px rgba(79,70,229,.3); }
    .btn--primary:hover:not(:disabled) { opacity: .9; }
    .btn--ghost { background: none; border: 1.5px solid rgba(100,116,139,.28); color: var(--muted); font-weight: 500; }
    .btn--ghost:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .btn--danger { border: none; background: #ef4444; color: #fff; }
    .btn--danger:hover:not(:disabled) { opacity: .88; }
    .btn--danger-outline { background: transparent; border: 1.5px solid rgba(239,68,68,.3); color: #ef4444; font-size: .82rem; font-weight: 500; padding: .65rem; }
    .btn--danger-outline:hover:not(:disabled) { background: rgba(239,68,68,.06); border-color: #ef4444; }
    .spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
</style>
