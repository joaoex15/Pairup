<script lang="ts">
    // routes/auth/callback/+page.svelte
    // ✅ O backend redireciona para:
    //    /auth/callback?token=<JWT>
    //    O userId NÃO vem na URL — é extraído do JWT pelo backend
    //    e o frontend usa o token para chamar /pessoas/me.

    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { authStore } from '$lib/stores/authStore';
    import { apiGet, API } from '$lib/services/api';

    let status: 'loading' | 'error' = 'loading';
    let errorMessage = '';

    onMount(async () => {
        if (!browser) return;

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!token) {
                throw new Error('Token de autenticação ausente. Tente fazer login novamente.');
            }

            // ✅ Salva o token ANTES de qualquer chamada autenticada
            localStorage.setItem('token', token);

            // ✅ Busca os dados do usuário usando o token (backend valida o JWT)
            const res = await fetch(`${API}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Não foi possível recuperar seus dados. Faça login novamente.');
            }

            const user = await res.json();

            // Salva user + token no store (e no localStorage via store)
            authStore.login(user, token);

            // ✅ Verifica se o usuário já tem perfil (Pessoa) via endpoint seguro
            const perfilRes = await fetch(`${API}/pessoas/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (perfilRes.ok) {
                await goto('/home');
            } else if (perfilRes.status === 404) {
                await goto('/Onboarding');
            } else {
                // Qualquer outro erro — redireciona para home com segurança
                await goto('/home');
            }

        } catch (error) {
            console.error('Erro no callback OAuth:', error);
            localStorage.removeItem('token');
            status = 'error';
            errorMessage = error instanceof Error ? error.message : 'Erro ao processar login';
            setTimeout(() => goto('/'), 3000);
        }
    });
</script>

{#if status === 'loading'}
    <div class="shell">
        <div class="card">
            <div class="spinner"></div>
            <p class="label">Entrando na sua conta...</p>
        </div>
    </div>
{:else}
    <div class="shell">
        <div class="card card--error">
            <div class="error-icon">⚠️</div>
            <h2 class="error-title">Ops, algo deu errado</h2>
            <p class="error-msg">{errorMessage}</p>
            <p class="redirect-hint">Redirecionando para o login...</p>
        </div>
    </div>
{/if}

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

    :global(body) { margin: 0; font-family: 'DM Sans', sans-serif; background: #FAF7F2; }

    .shell {
        min-height: 100vh;
        display: flex; align-items: center; justify-content: center;
        background: #FAF7F2;
    }

    .card {
        background: #fff;
        border: 1px solid rgba(201,169,110,.22);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        text-align: center;
        box-shadow: 0 8px 40px rgba(217,79,107,.1);
        display: flex; flex-direction: column; align-items: center; gap: 1rem;
        min-width: 260px;
    }

    .spinner {
        width: 44px; height: 44px;
        border: 3px solid rgba(217,79,107,.15);
        border-top-color: #D94F6B;
        border-radius: 50%;
        animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .label { font-size: .85rem; color: #8A7F79; margin: 0; }

    .card--error { border-color: rgba(239,68,68,.2); }
    .error-icon  { font-size: 2.5rem; }
    .error-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.4rem; font-weight: 700; color: #1A1410; margin: 0;
    }
    .error-msg       { font-size: .82rem; color: #8A7F79; margin: 0; max-width: 280px; line-height: 1.5; }
    .redirect-hint   { font-size: .75rem; color: rgba(138,127,121,.6); margin: 0; }
</style>