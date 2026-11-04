<script lang="ts">
    import './layout.css';
</script>

<slot />

<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap');

    :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
    :global(body) { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); }
</style>
