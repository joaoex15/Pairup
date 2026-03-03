<script lang="ts">
    export let onGoogleClick: () => void = () => {};
    export let onRegister: () => void = () => {};
    export let showRegisterLink: boolean = true;
</script>

<div class="mt-4">
    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                ou entre com
            </span>
        </div>
    </div>

    <button 
        type="button"
        on:click={onGoogleClick}
        class="w-full flex items-center justify-center px-6 py-3 mt-4 text-gray-600
        transition-colors duration-300 transform border rounded-lg
        dark:border-gray-700 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-600"
    >
        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
        </svg>
        <span>Continuar com Google</span>
    </button>

    {#if showRegisterLink}
        <div class="mt-4 text-center">
            <!-- Mudado de <a> para <button> -->
            <button 
                type="button"
                on:click={onRegister}
                class="text-sm text-blue-500 hover:underline dark:text-blue-400"
            >
                Não tem uma conta? Registre-se
            </button>
        </div>
    {/if}
</div>