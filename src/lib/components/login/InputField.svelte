<script lang="ts">
    export let type: string = "text";
    export let placeholder: string = "";
    export let label: string = "";
    export let id: string = "";
    export let value: string = "";
    export let error: string = "";
    export let required: boolean = false;
</script>

<div class="relative flex flex-col mt-2">
    {#if label}
        <label for={id} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            {label}
            {#if required}<span class="text-red-500">*</span>{/if}
        </label>
    {/if}
    
    <input
        {type}
        {placeholder}
        {id}
        bind:value
        {required}
        class="block w-full py-2 text-sm text-gray-700 bg-white border rounded-lg px-3
        dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600
        focus:border-blue-400 dark:focus:border-blue-300
        focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40
        {error ? 'border-red-500 dark:border-red-500' : ''}"
    />
    
    {#if error}
        <span class="text-xs text-red-500 mt-0.5">{error}</span>
    {/if}
</div>