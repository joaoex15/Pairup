<!-- $lib/components/ui/TextareaField.svelte -->
<script lang="ts">
    import { uid } from '$lib/utils/uid';

    export let label = '';
    export let value = '';
    export let placeholder = '';
    export let rows = 3;
    export let maxlength = 500;

    const id = uid();

    $: quaseNoLimite = value.length > maxlength * 0.9;
</script>

<div class="field">
    {#if label}<label class="label" for={id}>{label}</label>{/if}
    <textarea {id} bind:value {rows} {maxlength} {placeholder} class="textarea" aria-label={label ? undefined : placeholder}></textarea>
    <span class="count" class:warn={quaseNoLimite}>{value.length}/{maxlength}</span>
</div>

<style>
    .field { display: flex; flex-direction: column; gap: .28rem; }
    .label { font-size: .68rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .textarea { width: 100%; padding: .7rem .85rem; font-family: inherit; font-size: .87rem; color: var(--ink); background: rgba(255,255,255,.65); border: 1.5px solid rgba(100,116,139,.22); border-radius: 9px; outline: none; resize: none; line-height: 1.6; transition: border-color .2s, box-shadow .2s; }
    .textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .count { font-size: .68rem; color: var(--muted); text-align: right; }
    .warn { color: #f59e0b; font-weight: 600; }
</style>
