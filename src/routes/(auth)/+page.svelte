<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import LoginSection       from '$lib/components/login/LoginSection.svelte';
    import LoginForm          from '$lib/components/login/LoginForm.svelte';
    import RegisterForm       from '$lib/components/login/RegisterForm.svelte';
    import { apiLogin, apiRegister, apiGetMyProfile } from '$lib/services/api';
    import { authStore } from '$lib/stores/authStore';
    import { handleApiError } from '$lib/utils/errorUtils';
    import { perfilPendente } from '$lib/utils/pessoa';
    import Alert     from '$lib/components/ui/Alert.svelte';
    import BrandLogo from '$lib/components/ui/BrandLogo.svelte';

    interface LoginData    { email: string; password: string; }
    interface RegisterData { nome?: string; email: string; password: string; confirmPassword: string; aceitouTermos: boolean; }

    type AuthMode = 'login' | 'register';

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

    const handleLogin = async (data: LoginData) => {
        clear();
        isLoading = true;
        try {
            const res = await apiLogin(data.email, data.password);
            if (res.error || !res.data) throw new Error(res.error ?? 'Resposta inválida');

            const { token, userId, email } = res.data;

            // ✅ Login na store
            authStore.login({ id: userId, email }, token);

            const perfil = await apiGetMyProfile();
            await goto(perfilPendente(perfil) ? '/onboarding' : '/home');
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

    const switchMode = (m: AuthMode) => { mode = m; clear(); };
</script>

<LoginSection>
    <div class="page-header">
        <div class="page-logo"><BrandLogo size="lg" /></div>

        {#if mode === 'login'}
            <h1 class="page-title">Bem-vindo de volta</h1>
            <p class="page-sub">Entre na sua conta para continuar</p>
        {:else}
            <h1 class="page-title">Criar conta</h1>
            <p class="page-sub">Comece sua jornada no Pairup</p>
        {/if}
    </div>

    {#if successMessage}<Alert tone="success">{successMessage}</Alert>{/if}
    {#if globalError}<Alert>{globalError}</Alert>{/if}

    {#if mode === 'login'}
        <LoginForm
            onSubmit={handleLogin}
            onRegister={() => switchMode('register')}
            loading={isLoading}
        />
    {:else}
        <RegisterForm
            onSubmit={handleRegister}
            onLogin={() => switchMode('login')}
            loading={isLoading}
        />
    {/if}
</LoginSection>

<style>
    .page-header { text-align: center; margin-bottom: 1.75rem; }
    .page-logo   { margin-bottom: 1.1rem; }
    .page-title  { font-size: 1.35rem; font-weight: 700; color: var(--ink); margin-bottom: .25rem; }
    .page-sub    { font-size: .82rem; color: var(--muted); }
</style>
