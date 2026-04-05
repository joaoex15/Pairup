<!-- $lib/components/login/SocialLogin.svelte -->
<script lang="ts">
    export let onGoogleClick: () => void = () => {};
    export let onRegister: () => void = () => {};
    export let showRegisterLink: boolean = true;
</script>

<div class="social-wrap">
    <div class="divider" aria-hidden="true">
        <span class="divider-label">ou continue com</span>
    </div>

    <button type="button" class="google-btn" on:click={onGoogleClick}>
        <svg class="google-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7C36 32 34.4 35 31.7 37l-.1.6 6.7 5.2.5.1C42.9 38.3 46.5 31.9 46.5 24.5z"/>
            <path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.8c-2 1.4-4.6 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10.1l-.6.1-7 5.4-.1.5C7.2 42.6 15 47 24 47z"/>
            <path fill="#FBBC05" d="M10.3 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-.1-.6-7.1-5.5-.5.2A23 23 0 0 0 1 24c0 3.7.9 7.2 2.5 10.3l6.8-5.7z"/>
            <path fill="#EB4335" d="M24 9.5c3.6 0 6 1.5 7.4 2.8l5.4-5.3C33.9 3.9 29.3 2 24 2 15 2 7.2 6.4 3.5 13.4l6.8 5.7C12.2 13.8 17.6 9.5 24 9.5z"/>
        </svg>
        Entrar com Google
    </button>

    {#if showRegisterLink}
        <p class="register-prompt">
            Ainda não tem conta?
            <button type="button" class="register-link" on:click={onRegister}>
                Criar conta
            </button>
        </p>
    {/if}
</div>

<style>
    .social-wrap { margin-top:1.25rem; }

    .divider {
        position:relative; display:flex; align-items:center; margin-bottom:1rem;
    }
    .divider::before, .divider::after {
        content:''; flex:1; height:1px;
        background:rgba(100,116,139,.18);
    }
    .divider-label {
        font-size:.72rem; color:var(--muted,#64748B);
        padding:0 .75rem; white-space:nowrap;
        text-transform:uppercase; letter-spacing:.06em;
    }

    .google-btn {
        width:100%; display:flex; align-items:center; justify-content:center;
        gap:.6rem; padding:.72rem 1rem;
        background:#fff;
        border:1.5px solid rgba(100,116,139,.2);
        border-radius:10px;
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:.88rem; font-weight:600;
        color:var(--ink,#0F1624);
        cursor:pointer;
        transition:background .2s, border-color .2s, box-shadow .2s;
    }
    .google-btn:hover {
        background:var(--primary-l,#EEF2FF);
        border-color:rgba(79,70,229,.3);
        box-shadow:0 2px 10px rgba(79,70,229,.1);
    }
    .google-icon { width:18px; height:18px; flex-shrink:0; }

    .register-prompt {
        margin-top:1.1rem; text-align:center;
        font-size:.8rem; color:var(--muted,#64748B);
    }
    .register-link {
        background:none; border:none;
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:.8rem; font-weight:700;
        color:var(--primary,#4F46E5);
        cursor:pointer; padding:0; margin-left:.2rem;
        transition:color .2s;
    }
    .register-link:hover { color:var(--accent,#7C3AED); }
</style>