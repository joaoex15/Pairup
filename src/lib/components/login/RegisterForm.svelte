<script lang="ts">
    import InputField from './InputField.svelte.txt';
    import SubmitButton from './SubmitButton.svelte';

    interface RegisterData {  email: string; password: string; confirmPassword: string; }
    interface Errors {  email?: string; password?: string; confirmPassword?: string; }

    export let onSubmit: (data: RegisterData) => Promise<void> = async () => {};
    export let onLogin: () => void = () => {};

    let email = '';
    let password = '';
    let confirmPassword = '';
    let loading = false;
    let errors: Errors = {};

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        let hasError = false;

        if (!email.trim())    { errors.email           = 'Email obrigatório';       hasError = true; }
        if (!password)        { errors.password        = 'Senha obrigatória';       hasError = true; }
        if (!confirmPassword) { errors.confirmPassword = 'Confirme sua senha';      hasError = true; }
        if (password && confirmPassword && password !== confirmPassword) {
                                errors.confirmPassword = 'As senhas não coincidem'; hasError = true; }

        if (!hasError) {
            loading = true;
            try { await onSubmit({ email, password, confirmPassword }); }
            finally { loading = false; }
        }
    };
</script>

<div class="form-header">
    <h3 class="form-title">Criar conta</h3>
    <p class="form-sub">Comece a encontrar conexões incríveis</p>
</div>

<form on:submit={handleSubmit}>
    <InputField type="email"    placeholder="seu@email.com" label="Email"           bind:value={email}           error={errors.email} />
    <InputField type="password" placeholder="••••••••"      label="Senha"           bind:value={password}        error={errors.password} />
    <InputField type="password" placeholder="••••••••"      label="Confirmar senha" bind:value={confirmPassword} error={errors.confirmPassword} />

    <SubmitButton text="Criar conta" {loading} disabled={loading} />

    <div class="login-row">
        <span class="login-text">Já tem uma conta?</span>
        <button type="button" class="link-btn" on:click={onLogin}>Entrar</button>
    </div>
</form>

<style>
    .form-header { text-align: center; margin-bottom: 1.5rem; }
    .form-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--ink, #1A1410);
        margin-bottom: 0.25rem;
        letter-spacing: -0.01em;
    }
    .form-sub { font-size: 0.8rem; color: var(--muted, #8A7F79); }
    form { width: 100%; }
    .login-row {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.35rem;
        margin-top: 1rem;
    }
    .login-text { font-size: 0.8rem; color: var(--muted, #8A7F79); }
    .link-btn {
        background: none;
        border: none;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.8rem;
        color: var(--gold, #C9A96E);
        cursor: pointer;
        padding: 0;
        transition: color 0.2s;
    }
    .link-btn:hover { color: var(--rose, #D94F6B); }
</style>