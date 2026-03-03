<script lang="ts">
    export let title: string = "";
    export let maxWidth: 'sm' | 'md' | 'lg' | 'xl' = "md";
    
    const widthClasses: Record<string, string> = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl"
    };
</script>

<div class="w-full {widthClasses[maxWidth]} bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3"> <!-- p-3 reduzido -->
    {#if title}
        <h2 class="font-bold text-center text-gray-800 dark:text-white text-lg mb-2">
            {title}
        </h2>
    {/if}
    <slot />
</div>