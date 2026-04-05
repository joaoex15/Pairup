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
    interface RegisterData { nome: string; email: string; password: string; confirmPassword: string; aceitouTermos: boolean; }

    type AuthMode = 'login' | 'register' | 'forgot';

    let mode: AuthMode = 'login';
    let globalError = '';
    let successMessage = '';
    let isLoading = false;

    // ── Estado do formulário de registro (inline nesta página) ──────────
    let regNome = '';
    let regEmail = '';
    let regPassword = '';
    let regConfirm = '';
    let regAceitouTermos = false;
    let regErrors: Record<string, string> = {};

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

            authStore.login({
                id:    res.data.userId,
                email: res.data.email,
                token: res.data.token,
            });

            const hasPerfil = await temPerfil();
            await goto(hasPerfil ? '/home' : '/Onboarding');
        } catch (e) {
            globalError = handleApiError(e);
        } finally {
            isLoading = false;
        }
    };

    const handleRegister = async (data: RegisterData) => {
        clear();
        regErrors = {};

        if (!data.aceitouTermos) {
            regErrors.termos = 'Você precisa aceitar os termos para continuar.';
            return;
        }

        isLoading = true;
        const { confirmPassword: _, aceitouTermos: __, ...payload } = data;
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
            <span class="page-icon">🎓</span>
            <span class="page-brand">UNeSe</span>
        </div>

        {#if mode === 'login'}
            <h1 class="page-title">Bem-vindo de volta</h1>
            <p class="page-sub">Entre na sua conta para continuar</p>
        {:else if mode === 'register'}
            <h1 class="page-title">Criar conta</h1>
            <p class="page-sub">Comece sua jornada na UNeSe</p>
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
        <!-- Formulário de registro com campo de termos -->
        <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => { mode = 'login'; clear(); }}
            loading={isLoading}
            extraErrors={regErrors}
        />
        <!-- Checkbox de termos injetado abaixo do form via slot ou aqui como fallback -->
        {#if regErrors.termos}
            <p class="terms-error">{regErrors.termos}</p>
        {/if}

    {:else}
        <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => { mode = 'login'; clear(); }}
            loading={isLoading}
        />
    {/if}

    <!-- Checkbox de aceite de termos — visível apenas no modo registro -->
    {#if mode === 'register'}
        <div class="terms-block">
            <label class="terms-label">
                <input
                    type="checkbox"
                    bind:checked={regAceitouTermos}
                    class="terms-check"
                />
                <span class="terms-text">
                    Li e aceito os
                    <a href="/termos" target="_blank" class="terms-link">Termos de Uso</a>
                    e a
                    <a href="/privacidade" target="_blank" class="terms-link">Política de Privacidade</a>
                    da UNeSe. Declaro ter pelo menos 18 anos.
                </span>
            </label>
            {#if regErrors.termos}
                <p class="terms-error-msg">⚠️ {regErrors.termos}</p>
            {/if}
        </div>
    {/if}
</LoginSection>

<style>
    .page-header { text-align: center; margin-bottom: 1.75rem; }
    .page-logo   { display: inline-flex; align-items: center; gap: .45rem; margin-bottom: 1.25rem; }
    .page-icon   { font-size: 1.5rem; animation: pulse 3s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.85} }
    .page-brand  { font-family:'Plus Jakarta Sans',sans-serif; font-size:1.7rem; font-weight:800; color:var(--ink,#0F1624); letter-spacing:-.03em; }
    .page-title  { font-family:'Plus Jakarta Sans',sans-serif; font-size:1.4rem; font-weight:700; color:var(--ink,#0F1624); margin-bottom:.3rem; }
    .page-sub    { font-size:.82rem; color:var(--muted,#64748B); }

    .success-message { display:flex; align-items:center; gap:.5rem; background:#F0FDF4; border:1px solid #BBF7D0; color:#166534; font-size:.82rem; padding:.65rem .9rem; border-radius:10px; margin-bottom:1rem; }
    .success-message svg { width:16px; height:16px; flex-shrink:0; }

    .global-error { display:flex; align-items:center; gap:.5rem; background:#FEF2F2; border:1px solid #FECACA; color:#991B1B; font-size:.82rem; padding:.65rem .9rem; border-radius:10px; margin-bottom:1rem; animation:shake .35s ease; }
    .global-error svg { width:16px; height:16px; flex-shrink:0; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }

    /* ── Bloco de termos ── */
    .terms-block {
        margin-top: .85rem;
        background: var(--primary-l, #EEF2FF);
        border: 1.5px solid var(--border, rgba(79,70,229,.15));
        border-radius: 12px;
        padding: .85rem 1rem;
    }
    .terms-label {
        display: flex;
        align-items: flex-start;
        gap: .6rem;
        cursor: pointer;
    }
    .terms-check {
        margin-top: .15rem;
        width: 16px;
        height: 16px;
        accent-color: var(--primary, #4F46E5);
        flex-shrink: 0;
        cursor: pointer;
    }
    .terms-text {
        font-size: .78rem;
        color: var(--muted, #64748B);
        line-height: 1.55;
    }
    .terms-link {
        color: var(--primary, #4F46E5);
        text-decoration: underline;
        font-weight: 500;
    }
    .terms-link:hover { color: var(--primary-d, #3730A3); }
    .terms-error-msg {
        font-size: .75rem;
        color: var(--error, #DC2626);
        margin-top: .45rem;
    }
    .terms-error { font-size: .75rem; color: var(--error, #DC2626); margin-top: .3rem; }
</style>