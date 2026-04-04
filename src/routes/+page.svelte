<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import LoginForm from '$lib/components/login/LoginForm.svelte';
    import RegisterForm from '$lib/components/login/RegisterForm.svelte';
    import ForgotPasswordForm from '$lib/components/login/ForgotPasswordForm.svelte';
    import { apiLogin, apiRegister, apiForgotPassword, apiGetMyProfile } from '$lib/services/api';
    import { authStore } from '$lib/stores/authStore';
    import { handleApiError } from '$lib/utils/errorUtils';

    interface LoginData    { email: string; password: string; }
    interface RegisterData { nome: string; email: string; password: string; confirmPassword: string; }

    type AuthMode = 'login' | 'register' | 'forgot';

    let mode: AuthMode = 'login';
    let globalError = '';
    let successMessage = '';
    let isLoading = false;

    const clear = () => { globalError = ''; successMessage = ''; };

    /** Verifica se o usuário já criou o perfil (Pessoa) */
    const temPerfil = async (): Promise<boolean> => {
        const res = await apiGetMyProfile();
        return !!res.data && !res.error;
    };

    const handleLogin = async (data: LoginData) => {
        clear();
        isLoading = true;
        try {
            const res = await apiLogin(data.email, data.password);
            if (res.error || !res.data) throw new Error(res.error ?? 'Resposta inválida');

            authStore.login({
                id:    res.data.userId,
                email: res.data.email,
                token: res.data.token,
            });

            const hasPerfil = await temPerfil();
            await goto(hasPerfil ? '/home' : '/onboarding');
        } catch (e) {
            globalError = handleApiError(e);
        } finally {
            isLoading = false;
        }
    };

    const handleRegister = async (data: RegisterData) => {
        clear();
        isLoading = true;
        const { confirmPassword: _, ...payload } = data;
        try {
            const res = await apiRegister(payload);
            if (res.error) throw new Error(res.error);
            successMessage = 'Conta criada com sucesso! Faça seu login.';
            mode = 'login';
        } catch (e) {
            globalError = handleApiError(e);
        } finally {
            isLoading = false;
        }
    };

    const handleForgotPassword = async (email: string) => {
        clear();
        isLoading = true;
        try {
            const res = await apiForgotPassword(email);
            if (res.error) throw new Error(res.error);
            successMessage = 'Instruções enviadas para seu e-mail.';
            setTimeout(() => { mode = 'login'; clear(); }, 3000);
        } catch (e) {
            globalError = handleApiError(e);
        } finally {
            isLoading = false;
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
            <p class="page-sub">Enviaremos as instruções por e-mail</p>
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
            onForgotPassword={() => { mode = 'forgot'; clear(); }}
            onRegister={() => { mode = 'register'; clear(); }}
            loading={isLoading}
        />
    {:else if mode === 'register'}
        <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => { mode = 'login'; clear(); }}
            loading={isLoading}
        />
    {:else}
        <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => { mode = 'login'; clear(); }}
            loading={isLoading}
        />
    {/if}
</LoginSection>

<style>
    .page-header { text-align: center; margin-bottom: 1.75rem; }
    .page-logo   { display: inline-flex; align-items: center; gap: .4rem; margin-bottom: 1.25rem; }
    .page-star   { font-size: 1.3rem; color: var(--rose, #D94F6B); animation: pulse 3s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:.8} }
    .page-brand  { font-family:'Cormorant Garamond',serif; font-size:1.7rem; font-weight:700; color:var(--ink,#1A1410); letter-spacing:-.02em; }
    .page-title  { font-family:'Cormorant Garamond',serif; font-size:1.55rem; font-weight:700; color:var(--ink,#1A1410); margin-bottom:.3rem; }
    .page-sub    { font-size:.82rem; color:var(--muted,#8A7F79); }

    .success-message { display:flex; align-items:center; gap:.5rem; background:#F0FDF4; border:1px solid #BBF7D0; color:#166534; font-size:.82rem; padding:.65rem .9rem; border-radius:10px; margin-bottom:1rem; }
    .success-message svg { width:16px; height:16px; flex-shrink:0; }

    .global-error { display:flex; align-items:center; gap:.5rem; background:#FEF2F2; border:1px solid #FECACA; color:#991B1B; font-size:.82rem; padding:.65rem .9rem; border-radius:10px; margin-bottom:1rem; animation:shake .35s ease; }
    .global-error svg { width:16px; height:16px; flex-shrink:0; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
</style>