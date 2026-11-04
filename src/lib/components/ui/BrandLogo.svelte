<!-- $lib/components/ui/BrandLogo.svelte -->
<script lang="ts">
    export let size: 'md' | 'lg' = 'md';
</script>

<span class="logo logo--{size}">
    <span class="icon" aria-hidden="true">🎓</span>
    <span class="brand">Pairup</span>
</span>

<style>
    .logo { display: inline-flex; align-items: center; gap: .4rem; }
    .icon { font-size: 1.2rem; animation: pulse 3s ease-in-out infinite; }
    .brand { font-size: 1.4rem; font-weight: 800; color: var(--ink); letter-spacing: -.03em; }
    .logo--lg .icon  { font-size: 1.5rem; }
    .logo--lg .brand { font-size: 1.65rem; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
</style>
