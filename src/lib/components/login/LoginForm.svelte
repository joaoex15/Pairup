<script lang="ts">
    import InputField from './InputField.svelte';
    import SocialLogin from './SocialLogin.svelte';
    import SubmitButton from './SubmitButton.svelte';
    
    interface LoginData { email: string; password: string; }
    interface Errors { email?: string; password?: string; }
    
    export let onSubmit: (data: LoginData) => Promise<void> = async () => {};
    export let onForgotPassword: () => void = () => {};
    export let onRegister: () => void = () => {}; // Esta prop é importante
    
    let email: string = '';
    let password: string = '';
    let loading: boolean = false;
    let errors: Errors = {};
    
    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        let hasError = false;
        
        if (!email.trim()) { errors.email = 'Email obrigatório'; hasError = true; }
        if (!password) { errors.password = 'Senha obrigatória'; hasError = true; }
        
        if (!hasError) {
            loading = true;
            try { await onSubmit({ email, password }); } 
            finally { loading = false; }
        }
    };
</script>

<form class="w-full" on:submit={handleSubmit}>
    <InputField type="email" placeholder="Email" bind:value={email} error={errors.email} />
    <InputField type="password" placeholder="Senha" bind:value={password} error={errors.password} />

    <div class="flex justify-end mt-1">
        <button type="button" on:click={onForgotPassword} class="text-xs text-blue-500">
            Esqueceu a senha?
        </button>
    </div>

    <SubmitButton text="Entrar" {loading} disabled={loading} />

    <!-- Passando onRegister para o SocialLogin -->
    <SocialLogin onRegister={onRegister} />
</form>