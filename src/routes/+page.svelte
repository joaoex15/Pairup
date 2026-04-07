<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import LoginSection       from '$lib/components/login/LoginSection.svelte';
    import LoginForm          from '$lib/components/login/LoginForm.svelte';
    import RegisterForm       from '$lib/components/login/RegisterForm.svelte';
    import ForgotPasswordForm from '$lib/components/login/ForgotPasswordForm.svelte';
    import { apiLogin, apiRegister, apiForgotPassword, apiGetMyProfile, redirectToGoogleOAuth } from '$lib/services/api';
    import { authStore } from '$lib/stores/authStore';
    import { handleApiError } from '$lib/utils/errorUtils';

    interface LoginData    { email: string; password: string; }
    interface RegisterData { nome?: string; email: string; password: string; confirmPassword: string; aceitouTermos: boolean; }

    type AuthMode = 'login' | 'register' | 'forgot';

    let mode: AuthMode    = 'login';
    let globalError       = '';
    let successMessage    = '';
    let isLoading         = false;

    // ✅ Redireciona usuário já autenticado direto para /home
    onMount(() => {
        const unsub = authStore.subscribe(state => {
            if (!state.isLoading && state.isAuthenticated) {
                goto('/home');
            }
        });
        return unsub;
    });

    const clear = () => { globalError = ''; successMessage = ''; };

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

            const { token, userId, email } = res.data;

            // ✅ Login na store
            authStore.login({ id: userId, email }, token);

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
        try {
            const res = await apiRegister({
                nome:     data.nome ?? '',
                email:    data.email,
                password: data.password,
            });
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

    const switchMode = (m: AuthMode) => { mode = m; clear(); };
    
    // ✅ NOVO: Handler para login com Google (redireciona, não faz fetch!)
    const handleGoogleLogin = () => {
        clear();
        redirectToGoogleOAuth();
    };
</script>

<LoginSection>
    <div class="page-header">
        <div class="page-logo">
            <span class="page-icon" aria-hidden="true">🎓</span>
            <span class="page-brand">PairUp</span>
        </div>

        {#if mode === 'login'}
            <h1 class="page-title">Bem-vindo de volta</h1>
            <p class="page-sub">Entre na sua conta para continuar</p>
        {:else if mode === 'register'}
            <h1 class="page-title">Criar conta</h1>
            <p class="page-sub">Comece sua jornada no PairUp</p>
        {:else}
            <h1 class="page-title">Recuperar senha</h1>
            <p class="page-sub">Enviaremos as instruções por e-mail</p>
        {/if}
    </div>

    {#if successMessage}
        <div class="alert alert--success" role="status" aria-live="polite">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
            </svg>
            {successMessage}
        </div>
    {/if}

    {#if globalError}
        <div class="alert alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            {globalError}
        </div>
    {/if}

    {#if mode === 'login'}
        <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => switchMode('forgot')}
            onRegister={() => switchMode('register')}
            loading={isLoading}
        />
        
        <!-- ✅ NOVO: Divisor e botão do Google -->
        <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-text">ou</span>
            <span class="divider-line"></span>
        </div>
        
        <button 
            class="google-btn" 
            on:click={handleGoogleLogin}
            disabled={isLoading}
        >
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
        </button>
        
    {:else if mode === 'register'}
        <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => switchMode('login')}
            loading={isLoading}
        />
    {:else}
        <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => switchMode('login')}
        />
    {/if}
</LoginSection>

<style>
    .page-header { text-align: center; margin-bottom: 1.75rem; }
    .page-logo   { display: inline-flex; align-items: center; gap: .45rem; margin-bottom: 1.1rem; }
    .page-icon   { font-size: 1.5rem; animation: pulse 3s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: .85; } }
    .page-brand  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.65rem; font-weight: 800; color: var(--ink, #0F1624); letter-spacing: -.03em; }
    .page-title  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.35rem; font-weight: 700; color: var(--ink, #0F1624); margin-bottom: .25rem; }
    .page-sub    { font-size: .82rem; color: var(--muted, #64748B); }

    .alert { display: flex; align-items: center; gap: .5rem; font-size: .82rem; padding: .65rem .9rem; border-radius: 10px; margin-bottom: 1rem; }
    .alert svg { width: 16px; height: 16px; flex-shrink: 0; }
    .alert--success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
    .alert--error   { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; animation: shake .35s ease; }
    @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
    
    /* ✅ ESTILOS DO DIVISOR E BOTÃO GOOGLE */
    .divider {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 1.5rem 0;
    }
    
    .divider-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    }
    
    .divider-text {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .google-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #334155;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .google-btn:hover:not(:disabled) {
        background: #f8fafc;
        border-color: #cbd5e1;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .google-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .google-icon {
        flex-shrink: 0;
    }
</style>