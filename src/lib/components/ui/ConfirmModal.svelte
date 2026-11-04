<!-- $lib/components/ui/ConfirmModal.svelte -->
<script lang="ts">
    import Button from './Button.svelte';

    export let icon: string;
    export let title: string;
    export let message: string;
    export let confirmLabel: string;
    export let onConfirm: () => void;
    export let onCancel: () => void;

    const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
</script>

<svelte:window on:keydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -- o teclado fecha via Escape na janela -->
<div class="overlay" on:click|self={onCancel}>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="icon" aria-hidden="true">{icon}</div>
        <h3 class="title" id="modal-title">{title}</h3>
        <p class="message">{message}</p>
        <div class="actions">
            <Button variant="ghost" block on:click={onCancel}>Cancelar</Button>
            <Button variant="danger" block on:click={onConfirm}>{confirmLabel}</Button>
        </div>
    </div>
</div>

<style>
    .overlay { position: fixed; inset: 0; z-index: 50; background: rgba(15,22,36,.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fade-in .2s ease; }
    .modal { background: #fff; border-radius: 20px; padding: 2rem 1.75rem; max-width: 320px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(15,22,36,.18); animation: modal-in .25s cubic-bezier(.22,1,.36,1); }
    .icon { font-size: 2.5rem; margin-bottom: .75rem; }
    .title { font-size: 1.25rem; font-weight: 700; color: var(--ink); margin-bottom: .35rem; }
    .message { font-size: .8rem; color: var(--muted); line-height: 1.5; margin-bottom: 1.5rem; }
    .actions { display: flex; gap: .65rem; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modal-in { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
</style>
