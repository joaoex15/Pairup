<script lang="ts">
    import InputField    from './InputField.svelte';
    import SocialLogin   from './SocialLogin.svelte';
    import SubmitButton  from './SubmitButton.svelte';
    import { redirectToGoogleOAuth } from '$lib/services/api';  // ✅ CORRIGIDO
    import { validateEmail }     from '$lib/utils/errorUtils';

    interface LoginData { email: string; password: string; }

    export let onSubmit:         (data: LoginData) => Promise<void> = async () => {};
    export let onForgotPassword: () => void = () => {};
    export let onRegister:       () => void = () => {};
    export let loading           = false;
    // CORREÇÃO: erros externos (vindo do pai após resposta da API) são exibidos
    export let externalError     = '';

    let email    = '';
    let password = '';
    let errors: Record<string, string> = {};

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        
        // ✅ Limpa externalError no escopo do componente também
        if (externalError) externalError = '';

        if (!email.trim())              errors.email    = 'E-mail obrigatório';
        else if (!validateEmail(email)) errors.email    = 'E-mail inválido';
        if (!password)                  errors.password = 'Senha obrigatória';
        else if (password.length < 6)   errors.password = 'Mínimo 6 caracteres';

        if (Object.keys(errors).length > 0) return;

        await onSubmit({ email: email.trim(), password });
    };

    // ✅ CORRIGIDO: usa redirectToGoogleOAuth em vez de window.location direto
    const handleGoogle = () => {
        if (loading) return;
        redirectToGoogleOAuth();  // ✅ Agora redireciona corretamente
    };
</script>

<form on:submit={handleSubmit} novalidate aria-label="Formulário de login">
    {#if externalError}
        <div class="external-error" role="alert">{externalError}</div>
    {/if}

    <InputField
        type="email"
        label="E-mail"
        placeholder="seu@email.com"
        bind:value={email}
        error={errors.email}
        required
        autocomplete="email"
    />
    <InputField
        type="password"
        label="Senha"
        placeholder="••••••••"
        bind:value={password}
        error={errors.password}
        required
        autocomplete="current-password"
    />

    <div class="forgot-row">
        <button type="button" class="link-btn" on:click={onForgotPassword}>
            Esqueceu a senha?
        </button>
    </div>

    <SubmitButton text="Entrar" {loading} disabled={loading} />
    
    <!-- ✅ SocialLogin recebe as props corretamente -->
    <SocialLogin onGoogleClick={handleGoogle} onRegister={onRegister} />
</form>

<style>
    form { width: 100%; }

    .external-error {
        background: #FEF2F2; 
        border: 1px solid #FECACA;
        color: #991B1B; 
        font-size: .78rem;
        padding: .55rem .85rem; 
        border-radius: 8px;
        margin-bottom: .75rem;
        animation: shake 0.35s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-4px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
    }

    .forgot-row {
        display: flex; 
        justify-content: flex-end;
        margin-top: -.3rem; 
        margin-bottom: .25rem;
    }
    
    .link-btn {
        background: none; 
        border: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: .78rem; 
        font-weight: 600;
        color: var(--primary, #4F46E5);
        cursor: pointer; 
        padding: 0; 
        transition: color .2s;
    }
    
    .link-btn:hover { 
        color: var(--accent, #7C3AED); 
    }
    
    .link-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>