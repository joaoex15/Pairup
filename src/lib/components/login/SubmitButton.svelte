<!-- $lib/components/login/SubmitButton.svelte -->
<script lang="ts">
    export let text: string = 'Entrar';
    export let loading: boolean = false;
    export let disabled: boolean = false;
    export let variant: 'primary' | 'ghost' = 'primary';
</script>

<button
    type="submit"
    {disabled}
    class="btn btn-{variant}"
    class:loading
>
    {#if loading}
        <span class="spinner" aria-hidden="true"></span>
        <span>Aguarde...</span>
    {:else}
        {text}
    {/if}
</button>

<style>
    .btn {
        width:100%; margin-top:1.2rem;
        padding:.8rem 1.5rem;
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:.9rem; font-weight:700; letter-spacing:.01em;
        border:none; border-radius:12px; cursor:pointer;
        display:flex; align-items:center; justify-content:center; gap:.5rem;
        transition:opacity .2s, transform .15s, box-shadow .2s;
    }
    .btn:active:not(:disabled) { transform:scale(.98); }

    .btn-primary {
        background:linear-gradient(135deg, var(--primary,#4F46E5) 0%, var(--accent,#7C3AED) 100%);
        color:#fff;
        box-shadow:0 4px 18px rgba(79,70,229,.35);
    }
    .btn-primary:hover:not(:disabled) {
        opacity:.92;
        box-shadow:0 6px 24px rgba(79,70,229,.45);
    }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; }

    .btn-ghost {
        background:transparent;
        color:var(--primary,#4F46E5);
        border:1.5px solid var(--primary,#4F46E5);
        box-shadow:none;
    }
    .btn-ghost:hover:not(:disabled) { background:var(--primary-l,#EEF2FF); }

    .spinner {
        width:16px; height:16px;
        border:2px solid rgba(255,255,255,.35);
        border-top-color:#fff;
        border-radius:50%;
        animation:spin .7s linear infinite;
        flex-shrink:0;
    }
    @keyframes spin { to { transform:rotate(360deg); } }
</style>