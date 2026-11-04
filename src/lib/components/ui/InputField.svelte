<!-- $lib/components/ui/InputField.svelte -->
<script lang="ts">
    import { uid } from '$lib/utils/uid';

    export let label: string = '';
    export let type: string = 'text';
    export let value: string = '';
    export let placeholder: string = '';
    export let error: string = '';
    export let required: boolean = false;
    export let readonly: boolean = false;
    export let disabled: boolean = false;
    export let autocomplete: HTMLInputElement['autocomplete'] | null = null;
    export let maxlength: number | undefined = undefined;
    /** Formata o texto a cada tecla (ex.: mascaraWhatsApp). */
    export let mask: ((valor: string) => string) | null = null;

    const id = uid();

    const handleInput = () => { if (mask) value = mask(value); };
</script>

<div class="input-field">
    {#if label}
        <label for={id} class="input-label">
            {label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </label>
    {/if}

    <input
        {id}
        {type}
        bind:value
        on:input={handleInput}
        {placeholder}
        {readonly}
        {disabled}
        {autocomplete}
        {maxlength}
        class="input-el"
        class:input-error={!!error}
    />

    {#if error}
        <span class="error-message">{error}</span>
    {/if}
</div>

<style>
    .input-field { display: flex; flex-direction: column; gap: .28rem; margin-bottom: .5rem; }
    .input-label { font-size: .68rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .required { color: var(--primary); margin-left: .15rem; }
    .input-el { width: 100%; padding: .68rem .85rem; font-family: inherit; font-size: .87rem; color: var(--ink); background: rgba(255,255,255,.65); border: 1.5px solid rgba(100,116,139,.22); border-radius: 9px; outline: none; transition: border-color .2s, box-shadow .2s; }
    .input-el::placeholder { color: rgba(100,116,139,.5); }
    .input-el:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .input-el:read-only { background: rgba(100,116,139,.08); cursor: default; }
    .input-error { border-color: var(--error); }
    .error-message { font-size: .7rem; color: var(--error); }
</style>
