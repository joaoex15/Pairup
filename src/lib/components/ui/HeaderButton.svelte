<!-- $lib/components/ui/HeaderButton.svelte
     Botão de ícone do cabeçalho, com badge opcional. O ícone vem pelo slot. -->
<script lang="ts">
    export let label: string;
    export let active = false;
    export let danger = false;
    export let expanded: boolean | undefined = undefined;
    export let badge: number | string | null = null;
    export let badgeTone: 'primary' | 'warning' = 'primary';
</script>

<button class="btn" class:active class:danger type="button" aria-label={label} aria-expanded={expanded} on:click>
    <slot />
    {#if badge !== null}
        <span class="badge badge--{badgeTone}" aria-hidden="true">{badge}</span>
    {/if}
</button>

<style>
    .btn { position: relative; background: none; border: none; cursor: pointer; padding: .4rem; color: var(--muted); border-radius: 9px; transition: color .2s, background .2s; }
    .btn:hover { color: var(--primary); }
    .btn.danger:hover { color: var(--error); }
    .active { color: var(--primary); background: rgba(79,70,229,.08); }
    .badge { position: absolute; top: 0; right: 0; color: #fff; font-size: .6rem; font-weight: 600; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg); }
    .badge--primary { background: var(--primary); }
    .badge--warning { background: #f59e0b; }
</style>
