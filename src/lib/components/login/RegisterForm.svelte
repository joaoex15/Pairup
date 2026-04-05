<!-- $lib/components/login/RegisterForm.svelte -->
<script lang="ts">
    import InputField   from './InputField.svelte';
    import SubmitButton from './SubmitButton.svelte';
    import { validateEmail } from '$lib/utils/errorUtils';

    interface RegisterData {
        nome?:          string;
        email:          string;
        password:       string;
        confirmPassword: string;
        aceitouTermos:  boolean;
    }

    export let onSubmit:     (data: RegisterData) => Promise<void> = async () => {};
    export let onLogin:      () => void = () => {};
    export let loading       = false;
    export let extraErrors:  Record<string, string> = {};

    let nome            = '';
    let email           = '';
    let password        = '';
    let confirmPassword = '';
    let aceitouTermos   = false;
    let errors: Record<string, string> = {};

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        errors = {};
        let hasError = false;

        if (!email.trim()) {
            errors.email = 'E-mail obrigatório'; hasError = true;
        } else if (!validateEmail(email)) {
            errors.email = 'E-mail inválido';    hasError = true;
        }

        if (!password) {
            errors.password = 'Senha obrigatória';       hasError = true;
        } else if (password.length < 6) {
            errors.password = 'Mínimo 6 caracteres';     hasError = true;
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Confirme sua senha';       hasError = true;
        } else if (password && password !== confirmPassword) {
            errors.confirmPassword = 'As senhas não coincidem';  hasError = true;
        }

        // CORREÇÃO: valida aceitação dos termos antes de submeter
        if (!aceitouTermos) {
            errors.termos = 'Você deve aceitar os termos para continuar'; hasError = true;
        }

        if (hasError) return;

        loading = true;
        try {
            await onSubmit({ nome: nome.trim() || undefined, email: email.trim(), password, confirmPassword, aceitouTermos });
        } finally {
            loading = false;
        }
    };
</script>

<div class="form-header">
    <h3 class="form-title">Criar conta</h3>
    <p class="form-sub">Comece sua jornada na UNeSe</p>
</div>

<form on:submit={handleSubmit} novalidate aria-label="Formulário de cadastro">
    <InputField
        type="text"
        placeholder="Seu nome (opcional)"
        label="Nome"
        bind:value={nome}
        autocomplete="name"
    />
    <InputField
        type="email"
        placeholder="seu@email.com"
        label="E-mail"
        bind:value={email}
        error={errors.email}
        required
        autocomplete="email"
    />
    <InputField
        type="password"
        placeholder="••••••••"
        label="Senha"
        bind:value={password}
        error={errors.password}
        required
        autocomplete="new-password"
    />
    <InputField
        type="password"
        placeholder="••••••••"
        label="Confirmar senha"
        bind:value={confirmPassword}
        error={errors.confirmPassword}
        required
        autocomplete="new-password"
    />

    <!-- Aceite de termos -->
    <label class="termos-label">
        <input type="checkbox" bind:checked={aceitouTermos} class="termos-check" />
        <span class="termos-text">
            Declaro que tenho 18 anos ou mais e aceito os
            <a href="/termos" target="_blank" rel="noopener noreferrer" class="termos-link">termos de uso</a>
        </span>
    </label>
    {#if errors.termos}
        <p class="field-error" role="alert">⚠️ {errors.termos}</p>
    {/if}

    {#if extraErrors.termos}
        <p class="field-error" role="alert">⚠️ {extraErrors.termos}</p>
    {/if}

    {#if extraErrors.geral}
        <div class="external-error" role="alert">{extraErrors.geral}</div>
    {/if}

    <SubmitButton text="Criar conta" {loading} disabled={loading || !aceitouTermos} />

    <div class="login-row">
        <span class="login-text">Já tem uma conta?</span>
        <button type="button" class="link-btn" on:click={onLogin}>Entrar</button>
    </div>
</form>

<style>
    .form-header { text-align: center; margin-bottom: 1.25rem; }
    .form-title {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 1.3rem; font-weight: 800;
        color: var(--ink, #0F1624); margin-bottom: .25rem;
        letter-spacing: -.02em;
    }
    .form-sub { font-size: .8rem; color: var(--muted, #64748B); }

    form { width: 100%; }

    .termos-label {
        display: flex; align-items: flex-start; gap: .5rem;
        margin-top: .5rem; cursor: pointer;
    }
    .termos-check {
        flex-shrink: 0; width: 15px; height: 15px;
        margin-top: .15rem; accent-color: var(--primary, #4F46E5);
        cursor: pointer;
    }
    .termos-text { font-size: .78rem; color: var(--muted, #64748B); line-height: 1.4; }
    .termos-link {
        color: var(--primary, #4F46E5); text-decoration: underline;
        text-underline-offset: 2px;
    }

    .field-error { font-size: .72rem; color: #DC2626; margin-top: .3rem; }

    .external-error {
        background: #FEF2F2; border: 1px solid #FECACA;
        color: #991B1B; font-size: .78rem;
        padding: .55rem .85rem; border-radius: 8px;
        margin-top: .5rem;
    }

    .login-row {
        display: flex; justify-content: center; align-items: center;
        gap: .35rem; margin-top: 1rem;
    }
    .login-text { font-size: .8rem; color: var(--muted, #64748B); }
    .link-btn {
        background: none; border: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: .8rem; font-weight: 700;
        color: var(--primary, #4F46E5);
        cursor: pointer; padding: 0; transition: color .2s;
    }
    .link-btn:hover { color: var(--accent, #7C3AED); }
</style>