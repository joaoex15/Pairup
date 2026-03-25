<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { authStore } from '$lib/stores/authStore';

    const API = 'http://localhost:8080';
    
    let status = 'loading'; // loading, success, error
    let errorMessage = '';

    onMount(async () => {
        if (!browser) return;
        
        try {
            // Pegar os parâmetros da URL
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('userId');
            const email = urlParams.get('email');
            const name = urlParams.get('name');
            
            if (!userId || !email) {
                throw new Error('Dados de autenticação inválidos');
            }
            
            // Criar objeto de usuário
            const user = {
                id: userId,
                email: decodeURIComponent(email),
                name: name ? decodeURIComponent(name) : ''
            };
            
            // Salvar no authStore
            authStore.login(user);
            
            // Verificar se o usuário já tem perfil
            const temPerfil = await verificarPerfil(userId, user.email);
            
            if (temPerfil) {
                await goto('/home');
            } else {
                await goto('/Onboarding');
            }
        } catch (error) {
            console.error('Erro no callback:', error);
            status = 'error';
            errorMessage = error instanceof Error ? error.message : 'Erro ao processar login';
            
            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                goto('/login');
            }, 3000);
        }
    });
    
    const verificarPerfil = async (userId: string, userEmail: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API}/pessoas`);
            if (!res.ok) return false;
            const lista: any[] = await res.json();
            // Procura pessoa vinculada ao usuário pelo usuarioId ou email
            return lista.some(p => p.usuarioId === userId || p.email === userEmail);
        } catch {
            return false;
        }
    };
</script>

{#if status === 'loading'}
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div class="text-center">
            <div class="inline-block">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
            <p class="mt-4 text-gray-600">Processando login...</p>
        </div>
    </div>
{:else if status === 'error'}
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div class="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
            <div class="text-6xl mb-4">⚠️</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Erro no login</h1>
            <p class="text-gray-600 mb-4">{errorMessage}</p>
            <p class="text-sm text-gray-500">Redirecionando para a página de login...</p>
        </div>
    </div>
{/if}

<style>
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>