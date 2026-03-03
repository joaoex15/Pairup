<script lang="ts">
    import LoginSection from './LoginSection.svelte';
    import LoginForm from './LoginForm.svelte';
    import ForgotPasswordForm from './ForgotPasswordForm.svelte';
    import RegisterForm from './RegisterForm.svelte';

    type Mode = 'login' | 'forgot' | 'register';
    let mode: Mode = 'login';

    // Simulação de chamadas API (remover em produção)
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
</script>

<LoginSection>
    {#if mode === 'login'}
        <LoginForm 
            onSubmit={async (data) => { console.log('Login:', data); await wait(1000); }}
            onForgotPassword={() => mode = 'forgot'}
            onRegister={() => mode = 'register'}
        />
    {:else if mode === 'forgot'}
        <ForgotPasswordForm 
            onSubmit={async (email) => { console.log('Recuperar:', email); await wait(1000); }}
            onBackToLogin={() => mode = 'login'}
        />
    {:else}
        <RegisterForm 
            onSubmit={async (data) => { console.log('Registro:', data); await wait(1000); }}
            onLogin={() => mode = 'login'}
        />
    {/if}
</LoginSection>