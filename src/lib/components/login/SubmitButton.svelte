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
        width: 100%;
        margin-top: 1.2rem;
        padding: 0.8rem 1.5rem;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.03em;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .btn:active:not(:disabled) { transform: scale(0.98); }

    .btn-primary {
        background: linear-gradient(135deg, var(--rose, #D94F6B) 0%, #C0394F 100%);
        color: #fff;
        box-shadow: 0 4px 18px rgba(217,79,107,0.35);
    }
    .btn-primary:hover:not(:disabled) {
        opacity: 0.92;
        box-shadow: 0 6px 24px rgba(217,79,107,0.45);
    }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

    .btn-ghost {
        background: transparent;
        color: var(--rose, #D94F6B);
        border: 1.5px solid var(--rose, #D94F6B);
        box-shadow: none;
    }
    .btn-ghost:hover:not(:disabled) { background: var(--rose-pale, #FDE8EE); }

    .spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
</style>