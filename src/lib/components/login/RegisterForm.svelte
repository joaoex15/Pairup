<!-- $lib/components/login/RegisterForm.svelte -->
<script lang="ts">
    import InputField from './InputField.svelte';
    import SubmitButton from './SubmitButton.svelte';

    interface RegisterData { nome?: string; email: string; password: string; confirmPassword: string; aceitouTermos: boolean; }
    interface Errors { email?: string; password?: string; confirmPassword?: string; }

    export let onSubmit: (data: RegisterData) => Promise<void> = async () => {};
    export let onLogin: () => void = () => {};
    export let loading = false;
    export let extraErrors: Record<string, string> = {};

    let nome = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let aceitouTermos = false;
    let errors: Errors = {};

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        let hasError = false;

        if (!email.trim())    { errors.email           = 'E-mail obrigatório';      hasError = true; }
        if (!password)        { errors.password        = 'Senha obrigatória';       hasError = true; }
        if (!confirmPassword) { errors.confirmPassword = 'Confirme sua senha';      hasError = true; }
        if (password && confirmPassword && password !== confirmPassword) {
                                errors.confirmPassword = 'As senhas não coincidem'; hasError = true; }

        if (!hasError) {
            loading = true;
            try { await onSubmit({ nome, email, password, confirmPassword, aceitouTermos }); }
            finally { loading = false; }
        }
    };
</script>

<div class="form-header">
    <h3 class="form-title">Criar conta</h3>
    <p class="form-sub">Comece sua jornada na UNeSe</p>
</div>

<form on:submit={handleSubmit}>
    <InputField type="text"     placeholder="Seu nome (opcional)" label="Nome"            bind:value={nome} />
    <InputField type="email"    placeholder="seu@email.com"       label="E-mail"          bind:value={email}           error={errors.email} />
    <InputField type="password" placeholder="••••••••"            label="Senha"           bind:value={password}        error={errors.password} />
    <InputField type="password" placeholder="••••••••"            label="Confirmar senha" bind:value={confirmPassword} error={errors.confirmPassword} />

    {#if extraErrors.termos}
        <p class="terms-error">⚠️ {extraErrors.termos}</p>
    {/if}

    <SubmitButton text="Criar conta" {loading} disabled={loading} />

    <div class="login-row">
        <span class="login-text">Já tem uma conta?</span>
        <button type="button" class="link-btn" on:click={onLogin}>Entrar</button>
    </div>
</form>

<style>
    .form-header { text-align:center; margin-bottom:1.25rem; }
    .form-title {
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:1.3rem; font-weight:800;
        color:var(--ink,#0F1624); margin-bottom:.25rem;
        letter-spacing:-.02em;
    }
    .form-sub { font-size:.8rem; color:var(--muted,#64748B); }

    form { width:100%; }

    .terms-error { font-size:.75rem; color:#DC2626; margin-top:.3rem; }

    .login-row {
        display:flex; justify-content:center; align-items:center;
        gap:.35rem; margin-top:1rem;
    }
    .login-text { font-size:.8rem; color:var(--muted,#64748B); }
    .link-btn {
        background:none; border:none;
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:.8rem; font-weight:700;
        color:var(--primary,#4F46E5);
        cursor:pointer; padding:0; transition:color .2s;
    }
    .link-btn:hover { color:var(--accent,#7C3AED); }
</style>