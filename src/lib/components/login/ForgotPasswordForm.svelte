<script lang="ts">
    import InputField from './InputField.svelte';
    import SubmitButton from './SubmitButton.svelte';
    
    export let onSubmit: (email: string) => Promise<void> = async () => {};
    export let onBackToLogin: () => void = () => {};
    
    let email: string = '';
    let loading: boolean = false;
    let errors: { email?: string } = {};
    let success: boolean = false;
    
    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!email.trim()) { errors.email = 'Obrigatório'; return; }
        loading = true;
        try { await onSubmit(email); success = true; } 
        catch { errors.email = 'Erro'; } 
        finally { loading = false; }
    };
</script>

<form class="w-full px-3 py-2" on:submit={handleSubmit}> <!-- Padding interno aqui -->
    {#if success}
        <div class="text-center p-2 bg-green-100 text-green-700 rounded text-sm mb-2">
            Email enviado!
        </div>
        <button type="button" on:click={onBackToLogin} class="w-full text-sm text-blue-500 py-1">
            ← Voltar
        </button>
    {:else}
        <p class="text-xs text-gray-600 text-center mb-2">Instruções por email</p>
        <InputField type="email" placeholder="Email" bind:value={email} error={errors.email} />
        <SubmitButton text="Enviar" {loading} disabled={loading} />
        <div class="text-center mt-2">
            <button type="button" on:click={onBackToLogin} class="text-xs text-blue-500">
                ← Voltar
            </button>
        </div>
    {/if}
</form>