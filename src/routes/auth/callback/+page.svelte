<!-- src/routes/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { authStore } from '$lib/stores/authStore';
    import { apiGetMyProfile, apiSetToken } from '$lib/services/api';

    let status: 'loading' | 'success' | 'error' = 'loading';
    let errorMessage = '';

    onMount(async () => {
        if (!browser) return;
        try {
            const params = new URLSearchParams(window.location.search);
            const token  = params.get('token');
            const userId = params.get('userId');
            const email  = params.get('email');
            const nome   = params.get('name');

            if (!token || !userId || !email) {
                throw new Error('Dados de autenticação ausentes na URL');
            }

            // CORREÇÃO: authStore.login(user, token) — assinatura correta (token separado)
            authStore.login(
                {
                    id:    userId,
                    email: decodeURIComponent(email),
                    nome:  nome ? decodeURIComponent(nome) : undefined,
                },
                token
            );

            // Limpa os parâmetros sensíveis da URL imediatamente após leitura
            if (window.history?.replaceState) {
                window.history.replaceState({}, '', window.location.pathname);
            }

            const res       = await apiGetMyProfile();
            const hasPerfil = !!res.data && !res.error;

            status = 'success';
            setTimeout(() => goto(hasPerfil ? '/home' : '/onboarding'), 1200);
        } catch (e) {
            status       = 'error';
            errorMessage = e instanceof Error ? e.message : 'Erro ao processar login';
            setTimeout(() => goto('/'), 3000);
        }
    });
</script>

{#if status === 'loading'}
    <div class="screen" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Processando login...</p>
    </div>
{:else if status === 'success'}
    <div class="screen" role="status" aria-live="polite">
        <div class="icon success-icon" aria-hidden="true">✓</div>
        <h1>Login realizado!</h1>
        <p>Redirecionando para a UNeSe...</p>
        <div class="progress-bar" aria-hidden="true"></div>
    </div>
{:else}
    <div class="screen" role="alert">
        <div class="icon" aria-hidden="true">⚠️</div>
        <h1>Erro no login</h1>
        <p>{errorMessage}</p>
        <p class="small">Redirecionando para o login...</p>
        <a href="/" class="btn-retry">Tentar novamente</a>
    </div>
{/if}

<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .screen {
        min-height: 100vh;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1rem;
        background: var(--bg, #F4F6FB);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--ink, #0F1624);
        padding: 2rem; text-align: center;
    }

    .spinner {
        width: 48px; height: 48px;
        border: 3px solid rgba(79,70,229,.2);
        border-top-color: var(--primary, #4F46E5);
        border-radius: 50%;
        animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .icon         { font-size: 3.5rem; }
    .success-icon { color: #22c55e; font-size: 3.5rem; font-weight: 800; }

    h1 { font-size: 1.4rem; font-weight: 700; margin: 0; }
    p  { font-size: .9rem; color: var(--muted, #64748B); margin: 0; }
    .small { font-size: .75rem; }

    .progress-bar {
        width: 200px; height: 4px;
        background: rgba(79,70,229,.15);
        border-radius: 99px; overflow: hidden; position: relative;
    }
    .progress-bar::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, var(--primary, #4F46E5), var(--accent, #7C3AED));
        animation: fill 1.2s linear forwards;
    }
    @keyframes fill { from { width: 0; } to { width: 100%; } }

    .btn-retry {
        margin-top: .5rem;
        padding: .65rem 1.5rem;
        border: none; border-radius: 10px;
        background: var(--primary, #4F46E5); color: #fff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: .85rem; font-weight: 600;
        text-decoration: none; cursor: pointer;
        transition: opacity .2s;
    }
    .btn-retry:hover { opacity: .88; }
</style>