<script lang="ts">
    // routes/+page.svelte
    // ✅ handleLogin agora salva token + user via authStore.login(user, token)

    import { goto } from '$app/navigation';
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import LoginForm from '$lib/components/login/LoginForm.svelte';
    import RegisterForm from '$lib/components/login/RegisterForm.svelte';
    import ForgotPasswordForm from '$lib/components/login/ForgotPasswordForm.svelte';
    import { authStore } from '$lib/stores/authStore';
    import { handleApiError } from '$lib/utils/errorUtils';
    import { API } from '$lib/services/api';

    interface LoginData    { email: string; password: string; }
    interface RegisterData { name: string; email: string; password: string; confirmPassword: string; }

    type AuthMode = 'login' | 'register' | 'forgot';

    let mode: AuthMode = 'login';
    let globalError = '';
    let successMessage = '';

    const clearMessages = () => { globalError = ''; successMessage = ''; };

    const handleLogin = async (data: LoginData) => {
        clearMessages();
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? 'Email ou senha incorretos.');
            }

            const { token, user } = await res.json();

            // ✅ Salva user + token (api.ts vai injetar o token em todas as chamadas)
            authStore.login(user, token);

            // ✅ Verifica perfil via endpoint autenticado (sem expor userId na URL)
            const perfilRes = await fetch(`${API}/pessoas/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (perfilRes.ok) {
                await goto('/home');
            } else {
                await goto('/Onboarding');
            }

        } catch (error) {
            globalError = handleApiError(error);
            throw error;
        }
    };

    const handleRegister = async (data: RegisterData) => {
        clearMessages();
        const { confirmPassword: _confirm, name, ...rest } = data;
        try {
            const res = await fetch(`${API}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: name, ...rest }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Erro ao criar conta.');
            }
            successMessage = 'Conta criada com sucesso! Faça seu login.';
            mode = 'login';
        } catch (error) {
            globalError = handleApiError(error);
            throw error;
        }
    };

    const handleForgotPassword = async (email: string) => {
        clearMessages();
        try {
            await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            successMessage = 'Instruções de recuperação enviadas para seu email.';
            setTimeout(() => { mode = 'login'; clearMessages(); }, 3000);
        } catch (error) {
            globalError = handleApiError(error);
            throw error;
        }
    };
</script>

<LoginSection>
    <div class="page-header">
        <div class="page-logo">
            <span class="page-star">✦</span>
            <span class="page-brand">PairUp</span>
        </div>

        {#if mode === 'login'}
            <h1 class="page-title">Bem-vindo de volta</h1>
            <p class="page-sub">Entre na sua conta para continuar</p>
        {:else if mode === 'forgot'}
            <h1 class="page-title">Recuperar senha</h1>
            <p class="page-sub">Enviaremos as instruções por email</p>
        {/if}
    </div>

    {#if successMessage}
        <div class="success-message" role="status">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
            </svg>
            {successMessage}
        </div>
    {/if}

    {#if globalError}
        <div class="global-error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            {globalError}
        </div>
    {/if}

    {#if mode === 'login'}
        <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => { mode = 'forgot'; clearMessages(); }}
            onRegister={() => { mode = 'register'; clearMessages(); }}
        />
    {:else if mode === 'register'}
        <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => { mode = 'login'; clearMessages(); }}
        />
    {:else}
        <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => { mode = 'login'; clearMessages(); }}
        />
    {/if}
</LoginSection>

<style>
    .page-header { text-align: center; margin-bottom: 1.75rem; }
    .page-logo { display: inline-flex; align-items: center; gap: .4rem; margin-bottom: 1.25rem; }
    .page-star { font-size: 1.3rem; color: var(--rose, #D94F6B); animation: pulse 3s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.8; } }
    .page-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -0.02em; }
    .page-title { font-family: 'Cormorant Garamond', serif; font-size: 1.55rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -0.01em; margin-bottom: 0.3rem; }
    .page-sub { font-size: 0.82rem; color: var(--muted, #8A7F79); }
    .success-message { display: flex; align-items: center; gap: .5rem; background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; font-size: .82rem; padding: .65rem .9rem; border-radius: 10px; margin-bottom: 1rem; }
    .success-message svg { width: 16px; height: 16px; flex-shrink: 0; }
    .global-error { display: flex; align-items: center; gap: .5rem; background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; font-size: .82rem; padding: .65rem .9rem; border-radius: 10px; margin-bottom: 1rem; animation: shake .35s ease; }
    .global-error svg { width: 16px; height: 16px; flex-shrink: 0; }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
</style>