<!-- $lib/components/perfil/CursoAutocomplete.svelte
     Busca na lista de cursos, mas aceita texto livre (curso fora da lista). -->
<script lang="ts">
    import { uid } from '$lib/utils/uid';
    import { CURSOS } from '$lib/data/cursos';

    export let value = '';
    export let error = '';

    const id = uid();
    const listId = `${id}-lista`;

    let focado = false;
    let selecionado = false;

    $: termo = value.trim().toLowerCase();
    $: sugestoes = (termo ? CURSOS.filter((c: string) => c.toLowerCase().includes(termo)) : CURSOS).slice(0, 8);
    $: foraDaLista = !!termo && !CURSOS.some((c: string) => c.toLowerCase() === termo);
    $: aberto = focado && (sugestoes.length > 0 || foraDaLista);

    const selecionar = (curso: string) => {
        value = curso;
        selecionado = true;
        focado = false;
    };
</script>

<div class="field">
    <label class="label" for={id}>Curso <span class="req" aria-hidden="true">*</span></label>
    <div class="wrap" class:open={aberto}>
        <div class="row">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
            </svg>
            <input
                {id}
                type="text"
                placeholder="Buscar curso..."
                bind:value
                on:input={() => { selecionado = false; }}
                on:focus={() => { focado = true; selecionado = false; }}
                on:blur={() => setTimeout(() => { focado = false; }, 150)}
                class="input"
                autocomplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={aberto}
                aria-controls={listId}
                aria-required="true"
                aria-invalid={!!error}
            />
            {#if value}
                <button type="button" class="clear" on:click={() => { value = ''; selecionado = false; }} aria-label="Limpar curso">✕</button>
            {/if}
        </div>
        {#if aberto}
            <ul class="dropdown" id={listId} role="listbox" aria-label="Sugestões de curso">
                {#each sugestoes as c (c)}
                    <li class="option" class:option--selected={value === c} role="option" aria-selected={value === c}
                        on:mousedown|preventDefault={() => selecionar(c)}>
                        {c}
                    </li>
                {/each}
                {#if foraDaLista}
                    <li class="option option--custom" role="option" aria-selected="false"
                        on:mousedown|preventDefault={() => selecionar(value)}>
                        Usar "<strong>{value}</strong>"
                    </li>
                {/if}
            </ul>
        {/if}
    </div>
    {#if error}<p class="error-message" role="alert">{error}</p>{/if}
    {#if value && selecionado}
        <span class="badge">✓ {value}</span>
    {/if}
</div>

<style>
    .field { display: flex; flex-direction: column; gap: .28rem; margin-bottom: .5rem; }
    .label { font-size: .68rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .req { color: var(--primary); }
    .error-message { font-size: .7rem; color: var(--error); }
    .wrap { position: relative; }
    .row { display: flex; align-items: center; gap: .5rem; padding: .55rem .85rem; border: 1.5px solid rgba(100,116,139,.22); border-radius: 9px; background: rgba(255,255,255,.65); transition: border-color .2s, box-shadow .2s; }
    .open .row { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); border-radius: 9px 9px 0 0; }
    .search-icon { width: 15px; height: 15px; color: var(--muted); flex-shrink: 0; }
    .input { flex: 1; min-width: 0; padding: 0; border: none; background: transparent; outline: none; box-shadow: none; font-family: inherit; font-size: .87rem; color: var(--ink); }
    .input:focus { box-shadow: none; }
    .input::placeholder { color: #94A3B8; }
    .clear { background: none; border: none; cursor: pointer; color: var(--muted); padding: 0; font-size: .8rem; }
    .clear:hover { color: #ef4444; }
    .dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1.5px solid var(--primary); border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 8px 20px rgba(15,22,36,.12); z-index: 50; max-height: 220px; overflow-y: auto; padding: .25rem 0; list-style: none; }
    .option { padding: .6rem .9rem; font-size: .85rem; color: var(--ink); cursor: pointer; transition: background .1s; }
    .option:hover { background: rgba(79,70,229,.07); }
    .option--selected { color: var(--primary); font-weight: 600; background: rgba(79,70,229,.06); }
    .option--custom { color: var(--muted); font-size: .82rem; border-top: 1px solid rgba(100,116,139,.1); margin-top: .25rem; }
    .option--custom strong { color: var(--ink); }
    .badge { align-self: flex-start; margin-top: .1rem; font-size: .72rem; color: #16a34a; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 20px; padding: .18rem .6rem; font-weight: 500; }
</style>
