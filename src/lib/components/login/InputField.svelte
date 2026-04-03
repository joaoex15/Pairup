<!-- $lib/components/InputField.svelte -->
<script lang="ts">
    export let label: string = '';
    export let type: string = 'text';
    export let value: string = '';
    export let placeholder: string = '';
    export let error: string = '';
    export let required: boolean = false;
    export let readonly: boolean = false;
    export let disabled: boolean = false;
    
    const id = `input-${Math.random().toString(36).substr(2, 9)}`;
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
        {placeholder}
        {readonly}
        {disabled}
        class="input-el"
        class:input-error={!!error}
    />
    
    {#if error}
        <span class="error-message">{error}</span>
    {/if}
</div>

<style>
    .input-field {
        display: flex;
        flex-direction: column;
        gap: 0.28rem;
        margin-bottom: 0.5rem;
    }
    
    .input-label {
        font-size: 0.68rem;
        font-weight: 500;
        color: var(--muted, #8A7F79);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    
    .required {
        color: var(--rose, #D94F6B);
        margin-left: 0.15rem;
    }
    
    .input-el {
        width: 100%;
        padding: 0.68rem 0.85rem;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.87rem;
        color: var(--ink, #1A1410);
        background: rgba(255,255,255,0.65);
        border: 1.5px solid rgba(138,127,121,0.22);
        border-radius: 9px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .input-el::placeholder {
        color: rgba(138,127,121,0.5);
    }
    
    .input-el:focus {
        border-color: var(--rose, #D94F6B);
        box-shadow: 0 0 0 3px rgba(217,79,107,0.1);
    }
    
    .input-el:read-only {
        background: rgba(138,127,121,0.08);
        cursor: default;
    }
    
    .input-error {
        border-color: var(--rose, #D94F6B);
    }
    
    .error-message {
        font-size: 0.7rem;
        color: var(--rose, #D94F6B);
    }
</style>