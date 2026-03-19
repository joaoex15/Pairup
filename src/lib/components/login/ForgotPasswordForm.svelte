<script lang="ts">
    import InputField from './InputField.svelte';
    import SubmitButton from './SubmitButton.svelte';

    export let onSubmit: (email: string) => Promise<void> = async () => {};
    export let onBackToLogin: () => void = () => {};

    let email = '';
    let loading = false;
    let errors: { email?: string } = {};
    let success = false;

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        if (!email.trim()) { errors.email = 'Email obrigatório'; return; }
        loading = true;
        try { await onSubmit(email); success = true; }
        catch { errors.email = 'Não foi possível enviar. Tente novamente.'; }
        finally { loading = false; }
    };
</script>

{#if success}
    <div class="success-state">
        <div class="success-icon" aria-hidden="true">✉️</div>
        <h3 class="form-title">Email enviado!</h3>
        <p class="form-sub">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
        <button type="button" class="back-btn" on:click={onBackToLogin}>
            ← Voltar para o login
        </button>
    </div>
{:else}
    <div class="form-header">
        <h3 class="form-title">Recuperar senha</h3>
        <p class="form-sub">Informe seu email e enviaremos as instruções</p>
    </div>

    <form on:submit={handleSubmit}>
        <InputField type="email" placeholder="seu@email.com" label="Email" bind:value={email} error={errors.email} />
        <SubmitButton text="Enviar instruções" {loading} disabled={loading} />
        <button type="button" class="back-btn" on:click={onBackToLogin}>
            ← Voltar para o login
        </button>
    </form>
{/if}

<style>
    .form-header { text-align: center; margin-bottom: 1.5rem; }
    .form-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.45rem; font-weight: 700;
        color: var(--ink, #1A1410);
        letter-spacing: -0.01em;
    }
    .form-sub { font-size: 0.8rem; color: var(--muted, #8A7F79); margin-top: 0.25rem; }

    form { width: 100%; }

    .success-state {
        display: flex; flex-direction: column;
        align-items: center; text-align: center;
        gap: 0.5rem; padding: 1rem 0;
    }
    .success-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

    .back-btn {
        display: block;
        margin: 1rem auto 0;
        background: none; border: none;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.8rem;
        color: var(--gold, #C9A96E);
        cursor: pointer;
        transition: color 0.2s;
        padding: 0;
    }
    .back-btn:hover { color: var(--rose, #D94F6B); }
</style>