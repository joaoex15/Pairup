<!-- $lib/components/ui/SelectField.svelte -->
<script lang="ts" generics="T extends string">
    import { uid } from '$lib/utils/uid';

    export let label: string;
    export let value: T | '' = '';
    export let options: { value: T; label: string }[] = [];
    export let placeholder = 'Selecione...';
    export let error = '';
    export let required = false;

    const id = uid();
</script>

<div class="field">
    <label class="label" for={id}>
        {label}{#if required}<span class="req" aria-hidden="true"> *</span>{/if}
    </label>
    <div class="wrap" class:has-error={!!error}>
        <select {id} bind:value class="select" aria-required={required}>
            <option value="">{placeholder}</option>
            {#each options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
        </select>
    </div>
    {#if error}<span class="error" role="alert">{error}</span>{/if}
</div>

<style>
    .field { display: flex; flex-direction: column; gap: .28rem; margin-bottom: .5rem; }
    .label { font-size: .68rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .req { color: var(--primary); }
    .wrap { border: 1.5px solid rgba(100,116,139,.22); border-radius: 9px; background: rgba(255,255,255,.65); transition: border-color .2s, box-shadow .2s; }
    .wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .wrap.has-error { border-color: var(--error); }
    .select { width: 100%; padding: .68rem .85rem; font-family: inherit; font-size: .87rem; color: var(--ink); background: transparent; border: none; outline: none; border-radius: 9px; appearance: none; cursor: pointer; }
    .error { font-size: .7rem; color: var(--error); }
</style>
