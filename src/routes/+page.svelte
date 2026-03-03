<script lang="ts">
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import LoginForm from '$lib/components/login/LoginForm.svelte';
    import RegisterForm from '$lib/components/login/RegisterForm.svelte';
    import ForgotPasswordForm from '$lib/components/login/ForgotPasswordForm.svelte';
    
    type AuthMode = 'login' | 'register' | 'forgot';
    let mode: AuthMode = 'login';
    
    const handleLogin = async ({ email, password }: any) => {
        console.log('Login:', { email, password });
    };
    
    const handleRegister = async (data: any) => {
        console.log('Registro:', data);
        mode = 'login';
    };
    
    const handleForgotPassword = async (email: string) => {
        console.log('Recuperar:', email);
        mode = 'login';
    };
</script>

<LoginSection maxWidth="sm">
    <div class="text-center pt-6 pb-2"> <!-- Aumentado padding top e reduzido bottom -->
        <img 
            src="https://merakiui.com/images/logo.svg" 
            alt="Logo" 
            class="h-10 mx-auto mb-2" 
        />
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white">
            Login
        </h1>
    </div>
    
    {#if mode === 'login'}
        <LoginForm 
            onSubmit={handleLogin}
            onForgotPassword={() => mode = 'forgot'}
            onRegister={() => mode = 'register'}
        />
    {:else if mode === 'register'}
        <RegisterForm 
            onSubmit={handleRegister}
            onLogin={() => mode = 'login'}
        />
    {:else}
        <ForgotPasswordForm 
            onSubmit={handleForgotPassword}
            onBackToLogin={() => mode = 'login'}
        />
    {/if}
</LoginSection>