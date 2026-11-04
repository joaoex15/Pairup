<!-- $lib/components/perfil/GeneroInteresseFields.svelte -->
<script lang="ts">
    import SelectField from '$lib/components/ui/SelectField.svelte';
    import { GENEROS, INTERESSES } from '$lib/data/perfil';
    import type { Genero, Interesse } from '$lib/services/api';

    export let genero: Genero | '' = '';
    export let interesse: Interesse | '' = '';
    export let errors: Record<string, string> = {};
</script>

<div class="row">
    <SelectField label="Gênero" required options={GENEROS} bind:value={genero} error={errors.genero} />
    <SelectField label="Interesse" required options={INTERESSES} bind:value={interesse} error={errors.interesse} />
</div>

<style>
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
</style>
