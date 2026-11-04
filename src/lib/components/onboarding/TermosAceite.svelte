<!-- $lib/components/onboarding/TermosAceite.svelte -->
<script lang="ts">
    export let aceito = false;
    export let error = '';
</script>

<div class="block" class:block--error={!!error}>
    <label class="label">
        <input type="checkbox" bind:checked={aceito} class="check" aria-required="true" />
        <span class="text">
            Li e aceito os
            <a href="/termos" target="_blank" rel="noopener noreferrer" class="link">Termos de Uso</a>
            e a
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" class="link">Política de Privacidade</a>
            da Pairup. Confirmo que tenho pelo menos 18 anos e que sou estudante universitário(a).
        </span>
    </label>
    {#if error}<p class="error" role="alert">⚠️ {error}</p>{/if}
</div>

<style>
    .block { margin-top: 1rem; background: var(--primary-l); border: 1.5px solid var(--border); border-radius: 12px; padding: .9rem 1rem; }
    .block--error { border-color: var(--error); background: #FEF2F2; }
    .label { display: flex; align-items: flex-start; gap: .65rem; cursor: pointer; }
    .check { margin-top: .18rem; width: 16px; height: 16px; accent-color: var(--primary); flex-shrink: 0; cursor: pointer; }
    .text { font-size: .78rem; color: var(--muted); line-height: 1.55; }
    .link { color: var(--primary); text-decoration: underline; font-weight: 600; }
    .link:hover { color: var(--primary-d); }
    .error { font-size: .74rem; color: var(--error); margin-top: .45rem; }
</style>
