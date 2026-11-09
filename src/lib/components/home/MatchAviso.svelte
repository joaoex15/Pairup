<!-- $lib/components/home/MatchAviso.svelte -->
<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';

    export let nome: string;
    export let onVerMatches: () => void;
    export let onFechar: () => void;

    const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
</script>

<svelte:window on:keydown={onKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -- o teclado fecha via Escape -->
<div class="overlay" on:click|self={onFechar}>
    <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="match-titulo" aria-describedby="match-texto">
        <div class="icon" aria-hidden="true">💙</div>
        <h2 class="title" id="match-titulo">É um match!</h2>
        <p class="message" id="match-texto">Você e {nome} curtiram um ao outro.</p>
        <div class="actions">
            <Button variant="ghost" block on:click={onFechar}>Continuar</Button>
            <Button block on:click={onVerMatches}>Ver matches</Button>
        </div>
    </div>
</div>

<style>
    .overlay { position: fixed; inset: 0; z-index: 50; background: rgba(15,22,36,.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fade-in .2s ease; }
    .modal { background: #fff; border-radius: 20px; padding: 2rem 1.75rem; max-width: 340px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(15,22,36,.18); animation: modal-in .25s cubic-bezier(.22,1,.36,1); }
    .icon { font-size: 2.5rem; margin-bottom: .75rem; }
    .title { font-size: 1.35rem; font-weight: 700; color: var(--ink); margin-bottom: .35rem; }
    .message { font-size: .85rem; color: var(--muted); line-height: 1.5; margin-bottom: 1.5rem; }
    .actions { display: flex; gap: .65rem; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modal-in { from { opacity: 0; transform: translateY(16px) scale(.97); } to { opacity: 1; transform: none; } }
</style>
