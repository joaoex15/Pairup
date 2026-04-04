<!-- src/lib/components/AuthGuard.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    
    export let redirectTo = '/';
    export let requiredProfile = false;
    
    let isChecking = true;
    
    onMount(() => {
        const unsubscribe = authStore.subscribe(state => {
            if (!state.isLoading) {
                if (!state.isAuthenticated) {
                    goto(redirectTo);
                } else if (requiredProfile && !state.user?.nome) {
                    goto('/completar-perfil');
                }
                isChecking = false;
            }
        });
        
        return () => unsubscribe();
    });
</script>

{#if isChecking}
    <div class="auth-loading">
        <div class="spinner" aria-label="Carregando..."></div>
    </div>
{:else}
    <slot />
{/if}

<style>
    .auth-loading {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(217,79,107,0.2);
        border-top-color: var(--rose, #D94F6B);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>