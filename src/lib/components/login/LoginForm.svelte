<script lang="ts">
    import InputField from './InputField.svelte';
    import SocialLogin from './SocialLogin.svelte';
    import SubmitButton from './SubmitButton.svelte';
    import { authService } from '$lib/services/authService';

    interface LoginData { email: string; password: string; }
    interface Errors { email?: string; password?: string; }

    export let onSubmit: (data: LoginData) => Promise<void> = async () => {};
    export let onForgotPassword: () => void = () => {};
    export let onRegister: () => void = () => {};

    let email = '';
    let password = '';
    let loading = false;
    let errors: Errors = {};

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        let hasError = false;
        if (!email.trim()) { errors.email    = 'Email obrigatório'; hasError = true; }
        if (!password)     { errors.password = 'Senha obrigatória'; hasError = true; }
        if (!hasError) {
            loading = true;
            try { await onSubmit({ email, password }); }
            finally { loading = false; }
        }
    };

    const handleGoogleLogin = () => authService.loginWithGoogle();
</script>

<form on:submit={handleSubmit}>
    <InputField type="email"    placeholder="seu@email.com" label="Email" bind:value={email}    error={errors.email} />
    <InputField type="password" placeholder="••••••••"      label="Senha" bind:value={password} error={errors.password} />

    <div class="forgot-row">
        <button type="button" class="link-btn" on:click={onForgotPassword}>
            Esqueceu a senha?
        </button>
    </div>

    <SubmitButton text="Entrar" {loading} disabled={loading} />

    <SocialLogin onGoogleClick={handleGoogleLogin} onRegister={onRegister} />
</form>

<style>
    form { width: 100%; }
    .forgot-row { display: flex; justify-content: flex-end; margin-top: -0.3rem; margin-bottom: 0.25rem; }
    .link-btn { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: var(--gold, #C9A96E); cursor: pointer; padding: 0; transition: color 0.2s; }
    .link-btn:hover { color: var(--rose, #D94F6B); }
</style>