<!-- src/routes/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { authStore } from '$lib/stores/authStore';
    import { apiGetMyProfile } from '$lib/services/api';

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

            authStore.login({
                id:    userId,
                email: decodeURIComponent(email),
                nome:  nome ? decodeURIComponent(nome) : undefined,
                token,
            });

            // Verifica se já tem perfil (Pessoa)
            const res = await apiGetMyProfile();
            const hasPerfil = !!res.data && !res.error;

            status = 'success';
            setTimeout(() => goto(hasPerfil ? '/home' : '/onboarding'), 1200);
        } catch (e) {
            status = 'error';
            errorMessage = e instanceof Error ? e.message : 'Erro ao processar login';
            setTimeout(() => goto('/'), 3000);
        }
    });
</script>

{#if status === 'loading'}
    <div class="screen">
        <div class="spinner"></div>
        <p>Processando login...</p>
    </div>
{:else if status === 'success'}
    <div class="screen">
        <div class="icon success-icon">✓</div>
        <h1>Login realizado!</h1>
        <p>Redirecionando...</p>
        <div class="progress-bar"></div>
    </div>
{:else}
    <div class="screen">
        <div class="icon">⚠️</div>
        <h1>Erro no login</h1>
        <p>{errorMessage}</p>
        <p class="small">Redirecionando para o login...</p>
    </div>
{/if}

<style>
    .screen {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background: var(--cream, #FAF7F2);
        font-family: 'DM Sans', sans-serif;
        color: var(--ink, #1A1410);
        padding: 2rem;
        text-align: center;
    }
    .spinner {
        width: 48px; height: 48px;
        border: 3px solid rgba(217,79,107,.2);
        border-top-color: var(--rose, #D94F6B);
        border-radius: 50%;
        animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .icon { font-size: 3.5rem; }
    .success-icon { color: #22c55e; font-size: 3.5rem; font-weight: 700; }
    h1 { font-size: 1.4rem; font-weight: 600; margin: 0; }
    p  { font-size: .9rem; color: var(--muted, #8A7F79); margin: 0; }
    .small { font-size: .75rem; }
    .progress-bar {
        width: 200px; height: 3px;
        background: rgba(217,79,107,.15);
        border-radius: 99px;
        overflow: hidden;
        position: relative;
    }
    .progress-bar::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--rose, #D94F6B);
        animation: fill 1.2s linear forwards;
    }
    @keyframes fill { from { width: 0 } to { width: 100% } }
</style>