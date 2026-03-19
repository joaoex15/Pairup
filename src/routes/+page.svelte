<script lang="ts">
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import LoginForm from '$lib/components/login/LoginForm.svelte';
    import RegisterForm from '$lib/components/login/RegisterForm.svelte';
    import ForgotPasswordForm from '$lib/components/login/ForgotPasswordForm.svelte';

    // ─── Tipos ───────────────────────────────────────────────
    interface LoginData    { email: string; password: string; }
    interface RegisterData { name: string; email: string; password: string; confirmPassword: string; }

    type AuthMode = 'login' | 'register' | 'forgot';

    // ─── Estado ──────────────────────────────────────────────
    let mode: AuthMode = 'login';
    let globalError = '';

    const API = 'http://localhost:8080';

    // ─── Helpers ─────────────────────────────────────────────
    async function apiFetch(path: string, body: object): Promise<Response> {
        return fetch(`${API}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    function handleApiError(status: number): string {
        if (status === 401) return 'Email ou senha incorretos.';
        if (status === 409) return 'Este email já está cadastrado.';
        if (status === 404) return 'Email não encontrado.';
        if (status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';
        return 'Algo deu errado. Tente novamente.';
    }

    // ─── Handlers ────────────────────────────────────────────
    const handleLogin = async (data: LoginData) => {
        globalError = '';
        const res = await apiFetch('/users/login', data);
        if (!res.ok) { globalError = handleApiError(res.status); throw new Error(); }
        const user = await res.json();
        // TODO: salvar token/sessão e redirecionar
        console.log('Usuário logado:', user);
    };

    const handleRegister = async (data: RegisterData) => {
        globalError = '';
        const { confirmPassword: _, ...payload } = data; // remove campo de confirmação
        const res = await apiFetch('/users', payload);
        if (!res.ok) { globalError = handleApiError(res.status); throw new Error(); }
        // Após cadastro, volta pro login com mensagem de sucesso
        mode = 'login';
    };

    const handleForgotPassword = async (email: string) => {
        globalError = '';
        // Endpoint de recuperação de senha — ajuste conforme sua API
        const res = await apiFetch('/users/forgot-password', { email });
        if (!res.ok) { globalError = handleApiError(res.status); throw new Error(); }
    };
</script>

<LoginSection>
    <!-- Logo + título -->
    <div class="page-header">
        <div class="page-logo">
            <span class="page-star">✦</span>
            <span class="page-brand">PairUp</span>
        </div>

        {#if mode === 'login'}
            <h1 class="page-title">Bem-vindo de volta</h1>
            <p class="page-sub">Entre na sua conta para continuar</p>
        {:else if mode === 'register'}
            <h1 class="page-title">Criar conta</h1>
            <p class="page-sub">Comece a encontrar conexões incríveis</p>
        {:else}
            <h1 class="page-title">Recuperar senha</h1>
            <p class="page-sub">Enviaremos as instruções por email</p>
        {/if}
    </div>

    <!-- Erro global de API -->
    {#if globalError}
        <div class="global-error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            {globalError}
        </div>
    {/if}

    <!-- Formulários -->
    {#if mode === 'login'}
        <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => { mode = 'forgot'; globalError = ''; }}
            onRegister={() => { mode = 'register'; globalError = ''; }}
        />
    {:else if mode === 'register'}
        <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => { mode = 'login'; globalError = ''; }}
        />
    {:else}
        <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => { mode = 'login'; globalError = ''; }}
        />
    {/if}
</LoginSection>

<style>
    .page-header {
        text-align: center;
        margin-bottom: 1.75rem;
    }

    .page-logo {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
    }
    .page-star {
        font-size: 1.3rem;
        color: var(--rose, #D94F6B);
        animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%       { transform: scale(1.2); opacity: 0.8; }
    }
    .page-brand {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.7rem;
        font-weight: 700;
        color: var(--ink, #1A1410);
        letter-spacing: -0.02em;
    }

    .page-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--ink, #1A1410);
        letter-spacing: -0.01em;
        margin-bottom: 0.3rem;
    }
    .page-sub {
        font-size: 0.82rem;
        color: var(--muted, #8A7F79);
    }

    /* Erro global de API */
    .global-error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #FEF2F2;
        border: 1px solid #FECACA;
        color: #991B1B;
        font-size: 0.82rem;
        padding: 0.65rem 0.9rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        animation: shake 0.35s ease;
    }
    .global-error svg { width: 16px; height: 16px; flex-shrink: 0; }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-5px); }
        40%       { transform: translateX(5px); }
        60%       { transform: translateX(-3px); }
        80%       { transform: translateX(3px); }
    }
</style>