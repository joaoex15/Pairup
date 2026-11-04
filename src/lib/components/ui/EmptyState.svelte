<!-- $lib/components/ui/EmptyState.svelte
     Tela sem conteúdo (lista vazia, erro). A ação, se houver, vem pelo slot. -->
<script lang="ts">
    export let icon: string;
    export let title = '';
    export let message = '';
</script>

<div class="empty">
    <div class="icon" aria-hidden="true">{icon}</div>
    {#if title}<h2 class="title">{title}</h2>{/if}
    {#if message}<p class="message">{message}</p>{/if}
    {#if $$slots.default}<div class="action"><slot /></div>{/if}
</div>

<style>
    .empty { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 4rem 1rem; text-align: center; }
    .icon { font-size: 2.8rem; }
    .title { font-size: 1.3rem; font-weight: 700; color: var(--ink); }
    .message { font-size: .82rem; color: var(--muted); max-width: 240px; }
    .action { margin-top: .5rem; }
</style>
