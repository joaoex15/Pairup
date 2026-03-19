<script lang="ts">
    export let type: string = 'text';
    export let placeholder: string = '';
    export let label: string = '';
    export let id: string = '';
    export let value: string = '';
    export let error: string = '';
    export let required: boolean = false;
</script>

<div class="field">
    {#if label}
        <label for={id} class="field-label">
            {label}
            {#if required}<span class="required">*</span>{/if}
        </label>
    {/if}

    <div class="input-wrap" class:has-error={!!error}>
        <input
            {type}
            {placeholder}
            {id}
            bind:value
            {required}
            class="field-input"
        />
    </div>

    {#if error}
        <span class="field-error" role="alert">{error}</span>
    {/if}
</div>

<style>
    .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        margin-bottom: 0.85rem;
    }

    .field-label {
        font-size: 0.72rem;
        font-weight: 500;
        color: var(--muted, #8A7F79);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .required { color: var(--rose, #D94F6B); margin-left: 2px; }

    .input-wrap {
        border: 1.5px solid rgba(138,127,121,0.25);
        border-radius: 10px;
        background: rgba(255,255,255,0.6);
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrap:focus-within {
        border-color: var(--rose, #D94F6B);
        box-shadow: 0 0 0 3px rgba(217,79,107,0.12);
    }
    .input-wrap.has-error {
        border-color: var(--rose, #D94F6B);
    }

    .field-input {
        width: 100%;
        padding: 0.7rem 0.9rem;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        color: var(--ink, #1A1410);
        background: transparent;
        border: none;
        outline: none;
        border-radius: 10px;
    }
    .field-input::placeholder { color: rgba(138,127,121,0.55); }

    .field-error {
        font-size: 0.72rem;
        color: var(--rose, #D94F6B);
        margin-top: 0.1rem;
    }
</style>