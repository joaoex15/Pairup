<script lang="ts">
    import LoginSection from './LoginSection.svelte';
    import LoginForm from './LoginForm.svelte';
    import ForgotPasswordForm from './ForgotPasswordForm.svelte';
    import RegisterForm from './RegisterForm.svelte';

    type Mode = 'login' | 'forgot' | 'register';
    let mode: Mode = 'login';

    // Handlers tipados explicitamente para evitar inferência errada do Svelte LS
    const handleLoginSubmit    = async (_data: { email: string; password: string }) => {};
    const handleForgotSubmit   = async (_email: string) => {};
    const handleRegisterSubmit = async (_data: { name: string; email: string; password: string; confirmPassword: string }) => {};
</script>

<div class="pairup-root">
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>
    <div class="blob blob-3" aria-hidden="true"></div>

    <div class="pairup-center">
        <div class="logo-wrap">
            <span class="logo-icon">✦</span>
            <span class="logo-text">PairUp</span>
        </div>

        <LoginSection>
            {#if mode === 'login'}
                <LoginForm
                    onSubmit={handleLoginSubmit}
                    onForgotPassword={() => { mode = 'forgot'; }}
                    onRegister={() => { mode = 'register'; }}
                />
            {:else if mode === 'forgot'}
                <ForgotPasswordForm
                    onSubmit={handleForgotSubmit}
                    onBackToLogin={() => { mode = 'login'; }}
                />
            {:else}
                <RegisterForm
                    onSubmit={handleRegisterSubmit}
                    onLogin={() => { mode = 'login'; }}
                />
            {/if}
        </LoginSection>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

    :global(*) { box-sizing: border-box; margin: 0; padding: 0; }

    :global(:root) {
        --cream:    #FAF7F2;
        --ink:      #1A1410;
        --rose:     #D94F6B;
        --rose-mid: #E8748A;
        --rose-pale:#FDE8EE;
        --gold:     #C9A96E;
        --muted:    #8A7F79;
        --card-bg:  rgba(255,255,255,0.72);
        --border:   rgba(201,169,110,0.25);
        --shadow:   0 8px 48px rgba(217,79,107,0.10), 0 2px 12px rgba(26,20,16,0.06);
    }

    .pairup-root {
        min-height: 100vh;
        background: var(--cream);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'DM Sans', sans-serif;
        position: relative;
        overflow: hidden;
        padding: 1.5rem;
    }

    .blob {
        position: fixed;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.35;
        pointer-events: none;
        animation: drift 14s ease-in-out infinite alternate;
    }
    .blob-1 {
        width: 520px; height: 520px;
        background: radial-gradient(circle, #F4B8C8 0%, #E87090 60%, transparent 100%);
        top: -180px; left: -180px;
        animation-duration: 16s;
    }
    .blob-2 {
        width: 380px; height: 380px;
        background: radial-gradient(circle, #C9A96E 0%, #E8C990 60%, transparent 100%);
        bottom: -120px; right: -100px;
        animation-duration: 20s; animation-delay: -6s;
    }
    .blob-3 {
        width: 260px; height: 260px;
        background: radial-gradient(circle, #D94F6B 0%, transparent 70%);
        top: 55%; left: 55%;
        animation-duration: 18s; animation-delay: -3s;
    }
    @keyframes drift {
        from { transform: translate(0, 0) scale(1); }
        to   { transform: translate(30px, 20px) scale(1.06); }
    }

    .pairup-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        width: 100%;
        max-width: 420px;
        position: relative;
        z-index: 1;
    }

    .logo-wrap { display: flex; align-items: center; gap: 0.5rem; user-select: none; }
    .logo-icon  { font-size: 1.6rem; color: var(--rose); line-height: 1; animation: pulse-icon 3s ease-in-out infinite; }
    .logo-text  { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; }

    @keyframes pulse-icon {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%       { transform: scale(1.18); opacity: 0.85; }
    }
</style>