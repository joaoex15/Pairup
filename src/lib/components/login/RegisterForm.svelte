<script lang="ts">
    import InputField from './InputField.svelte';
    import SubmitButton from './SubmitButton.svelte';
    
    interface RegisterData { name: string; email: string; password: string; confirmPassword: string; }
    interface Errors { name?: string; email?: string; password?: string; confirmPassword?: string; }
    
    export let onSubmit: (data: RegisterData) => Promise<void> = async () => {};
    export let onLogin: () => void = () => {};
    
    let formData: RegisterData = { name: '', email: '', password: '', confirmPassword: '' };
    let loading: boolean = false;
    let errors: Errors = {};
    
    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        let hasError = false;
        
        if (!formData.name.trim()) { errors.name = 'Obrigatório'; hasError = true; }
        if (!formData.email.trim()) { errors.email = 'Obrigatório'; hasError = true; }
        if (!formData.password) { errors.password = 'Obrigatório'; hasError = true; }
        else if (formData.password.length < 6) { errors.password = '6+ caracteres'; hasError = true; }
        if (formData.password !== formData.confirmPassword) { errors.confirmPassword = 'Diferentes'; hasError = true; }
        
        if (!hasError) {
            loading = true;
            try { await onSubmit(formData); } 
            finally { loading = false; }
        }
    };
</script>

<form class="w-full px-3 py-2" on:submit={handleSubmit}> <!-- Padding interno aqui -->
    <InputField type="text" placeholder="Nome" bind:value={formData.name} error={errors.name} />
    <InputField type="email" placeholder="Email" bind:value={formData.email} error={errors.email} />
    <InputField type="password" placeholder="Senha" bind:value={formData.password} error={errors.password} />
    <InputField type="password" placeholder="Confirmar" bind:value={formData.confirmPassword} error={errors.confirmPassword} />

    <div class="text-center mt-2">
        <button type="button" on:click={onLogin} class="text-xs text-blue-500">
            ← Voltar
        </button>
    </div>

    <SubmitButton text="Registrar" {loading} disabled={loading} />
</form>