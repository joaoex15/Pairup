<!-- $lib/components/login/AuthContainer.svelte -->
<script lang="ts">
    import LoginSection from './LoginSection.svelte';
    import LoginForm from './LoginForm.svelte';
    import ForgotPasswordForm from './ForgotPasswordForm.svelte';
    import RegisterForm from './RegisterForm.svelte';

    type Mode = 'login' | 'forgot' | 'register';
    let mode: Mode = 'login';

    const handleLoginSubmit    = async (_data: { email: string; password: string }) => {};
    const handleForgotSubmit   = async (_email: string) => {};
    const handleRegisterSubmit = async (_data: { nome?: string; email: string; password: string; confirmPassword: string; aceitouTermos: boolean }) => {};
</script>

<div class="unese-root">
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>
    <div class="blob blob-3" aria-hidden="true"></div>

    <div class="unese-center">
        <div class="logo-wrap">
            <span class="logo-icon">🎓</span>
            <span class="logo-text">UNeSe</span>
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
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :global(*) { box-sizing:border-box; margin:0; padding:0; }

    :global(:root) {
        --bg:        #F4F6FB;
        --ink:       #0F1624;
        --primary:   #4F46E5;
        --primary-d: #3730A3;
        --primary-l: #EEF2FF;
        --accent:    #7C3AED;
        --muted:     #64748B;
        --border:    rgba(79,70,229,0.15);
        --shadow:    0 8px 48px rgba(79,70,229,0.12), 0 2px 12px rgba(15,22,36,0.06);
    }

    .unese-root {
        min-height:100vh;
        background:var(--bg);
        display:flex; align-items:center; justify-content:center;
        font-family:'Plus Jakarta Sans',sans-serif;
        position:relative; overflow:hidden; padding:1.5rem;
    }

    .blob {
        position:fixed; border-radius:50%;
        filter:blur(80px); opacity:.3;
        pointer-events:none;
        animation:drift 14s ease-in-out infinite alternate;
    }
    .blob-1 {
        width:520px; height:520px;
        background:radial-gradient(circle, #818CF8 0%, #4F46E5 60%, transparent 100%);
        top:-180px; left:-180px; animation-duration:16s;
    }
    .blob-2 {
        width:380px; height:380px;
        background:radial-gradient(circle, #A78BFA 0%, #7C3AED 60%, transparent 100%);
        bottom:-120px; right:-100px; animation-duration:20s; animation-delay:-6s;
    }
    .blob-3 {
        width:260px; height:260px;
        background:radial-gradient(circle, #6366F1 0%, transparent 70%);
        top:55%; left:55%; animation-duration:18s; animation-delay:-3s;
    }
    @keyframes drift {
        from { transform:translate(0,0) scale(1); }
        to   { transform:translate(30px,20px) scale(1.06); }
    }

    .unese-center {
        display:flex; flex-direction:column; align-items:center;
        gap:1.5rem; width:100%; max-width:420px;
        position:relative; z-index:1;
    }

    .logo-wrap { display:flex; align-items:center; gap:.5rem; user-select:none; }
    .logo-icon { font-size:1.8rem; line-height:1; animation:pulse-icon 3s ease-in-out infinite; }
    .logo-text {
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:2.2rem; font-weight:800;
        color:var(--ink); letter-spacing:-.03em;
    }
    @keyframes pulse-icon {
        0%,100% { transform:scale(1);    opacity:1; }
        50%     { transform:scale(1.15); opacity:.85; }
    }
</style>