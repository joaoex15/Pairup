<!-- $lib/components/AuthGuard.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';

    export let redirectTo      = '/';
    export let requiredProfile = false;

    let isChecking = true;

    onMount(() => {
        // CORREÇÃO: desinscreve o subscriber ao destruir o componente,
        // evitando vazamento de memória e redirecionamentos duplicados.
        const unsubscribe = authStore.subscribe(state => {
            if (state.isLoading) return;   // aguarda hidratação do store

            if (!state.isAuthenticated) {
                goto(redirectTo);
            } else if (requiredProfile && !state.user?.nome) {
                // CORREÇÃO: redireciona para completar perfil apenas se
                // requiredProfile=true E o nome ainda não foi preenchido.
                goto('/completar-perfil');
            }

            isChecking = false;
        });

        return () => unsubscribe();
    });
</script>

{#if isChecking}
    <div class="auth-loading" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">Verificando acesso...</p>
    </div>
{:else}
    <slot />
{/if}

<style>
    .auth-loading {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .85rem;
        background: var(--bg, #F4F6FB);
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(79,70,229,.2);
        border-top-color: var(--primary, #4F46E5);
        border-radius: 50%;
        animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-text {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: .8rem;
        color: var(--muted, #64748B);
    }
</style>