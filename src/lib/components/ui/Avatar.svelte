<!-- $lib/components/ui/Avatar.svelte -->
<script lang="ts">
    import { inicial } from '$lib/utils/pessoa';

    export let nome = '';
    export let foto = '';
    export let size = 56;
</script>

<div class="avatar" style="width:{size}px;height:{size}px;font-size:{size * 0.4}px">
    {#if foto}
        <img src={foto} alt={nome} />
    {:else}
        <span aria-hidden="true">{inicial(nome)}</span>
    {/if}
</div>

<style>
    .avatar { border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid var(--primary); background: linear-gradient(135deg, #818CF8, #4F46E5); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; }
    img { width: 100%; height: 100%; object-fit: cover; }
</style>
