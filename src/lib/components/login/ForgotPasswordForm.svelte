<!-- $lib/components/login/ForgotPasswordForm.svelte -->
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
        if (!email.trim()) { errors.email = 'E-mail obrigatório'; return; }
        loading = true;
        try { await onSubmit(email); success = true; }
        catch { errors.email = 'Não foi possível enviar. Tente novamente.'; }
        finally { loading = false; }
    };
</script>

{#if success}
    <div class="success-state">
        <div class="success-icon" aria-hidden="true">✉️</div>
        <h3 class="form-title">E-mail enviado!</h3>
        <p class="form-sub">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
        <button type="button" class="back-btn" on:click={onBackToLogin}>
            ← Voltar para o login
        </button>
    </div>
{:else}
    <div class="form-header">
        <h3 class="form-title">Recuperar senha</h3>
        <p class="form-sub">Informe seu e-mail e enviaremos as instruções</p>
    </div>

    <form on:submit={handleSubmit}>
        <InputField type="email" placeholder="seu@email.com" label="E-mail" bind:value={email} error={errors.email} />
        <SubmitButton text="Enviar instruções" {loading} disabled={loading} />
        <button type="button" class="back-btn" on:click={onBackToLogin}>
            ← Voltar para o login
        </button>
    </form>
{/if}

<style>
    .form-header { text-align:center; margin-bottom:1.5rem; }
    .form-title {
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:1.3rem; font-weight:800;
        color:var(--ink,#0F1624); letter-spacing:-.02em;
    }
    .form-sub { font-size:.8rem; color:var(--muted,#64748B); margin-top:.25rem; }

    form { width:100%; }

    .success-state {
        display:flex; flex-direction:column;
        align-items:center; text-align:center;
        gap:.5rem; padding:1rem 0;
    }
    .success-icon { font-size:2.5rem; margin-bottom:.5rem; }

    .back-btn {
        display:block; margin:1rem auto 0;
        background:none; border:none;
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:.8rem; font-weight:600;
        color:var(--primary,#4F46E5);
        cursor:pointer; padding:0; transition:color .2s;
    }
    .back-btn:hover { color:var(--accent,#7C3AED); }
</style>