<!-- $lib/components/login/LoginForm.svelte -->
<script lang="ts">
    import InputField from './InputField.svelte';
    import SocialLogin from './SocialLogin.svelte';
    import SubmitButton from './SubmitButton.svelte';
    import { getGoogleOAuthUrl } from '$lib/services/api';
    import { validateEmail } from '$lib/utils/errorUtils';

    interface LoginData { email: string; password: string; }

    export let onSubmit: (data: LoginData) => Promise<void> = async () => {};
    export let onForgotPassword: () => void = () => {};
    export let onRegister: () => void = () => {};
    export let loading = false;

    let email = '';
    let password = '';
    let errors: Record<string, string> = {};

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};

        if (!email.trim())             errors.email    = 'E-mail obrigatório';
        else if (!validateEmail(email)) errors.email    = 'E-mail inválido';
        if (!password)                 errors.password = 'Senha obrigatória';
        else if (password.length < 6)  errors.password = 'Mínimo 6 caracteres';

        if (Object.keys(errors).length > 0) return;

        await onSubmit({ email: email.trim(), password });
    };

    const handleGoogle = () => {
        if (loading) return;
        window.location.href = getGoogleOAuthUrl();
    };
</script>

<form on:submit={handleSubmit} novalidate>
    <InputField type="email"    label="E-mail" placeholder="seu@email.com" bind:value={email}    error={errors.email}    required />
    <InputField type="password" label="Senha"  placeholder="••••••••"      bind:value={password} error={errors.password} required />

    <div class="forgot-row">
        <button type="button" class="link-btn" on:click={onForgotPassword}>Esqueceu a senha?</button>
    </div>

    <SubmitButton text="Entrar" {loading} disabled={loading} />
    <SocialLogin onGoogleClick={handleGoogle} onRegister={onRegister} />
</form>

<style>
    form { width:100%; }
    .forgot-row { display:flex; justify-content:flex-end; margin-top:-.3rem; margin-bottom:.25rem; }
    .link-btn   { background:none; border:none; font-family:'DM Sans',sans-serif; font-size:.78rem; color:var(--gold,#C9A96E); cursor:pointer; padding:0; transition:color .2s; }
    .link-btn:hover { color:var(--rose,#D94F6B); }
</style>