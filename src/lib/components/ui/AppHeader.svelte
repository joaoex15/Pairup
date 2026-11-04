<!-- $lib/components/ui/AppHeader.svelte
     Cabeçalho das telas logadas. `backHref` mostra o botão voltar; o slot é o lado direito. -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import BrandLogo from './BrandLogo.svelte';
    import HeaderButton from './HeaderButton.svelte';
    import Icon from './Icon.svelte';

    export let backHref: string | null = null;
</script>

<header class="header">
    {#if backHref}
        <HeaderButton label="Voltar" on:click={() => goto(backHref ?? '/')}>
            <Icon name="chevronLeft" />
        </HeaderButton>
    {/if}
    <BrandLogo />
    <div class="right">
        <slot />
    </div>
</header>

<style>
    .header { display: flex; justify-content: space-between; align-items: center; padding: .9rem 1.25rem; background: rgba(244,246,251,.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 20; }
    /* min-width equilibra o logo quando há botão voltar e nada à direita */
    .right { display: flex; gap: .6rem; align-items: center; min-width: 30px; justify-content: flex-end; }
</style>
