<!-- $lib/components/home/PessoaCard.svelte
     Card do deck: fotos, arrastar para curtir/passar e atalhos de teclado.
     Use dentro de {#key pessoa.id} para o índice da foto voltar a zero a cada pessoa. -->
<script lang="ts">
    import Icon from '$lib/components/ui/Icon.svelte';
    import { inicial, type PessoaView } from '$lib/utils/pessoa';

    export let pessoa: PessoaView;
    /** Direção da saída, controlada pela página enquanto a ação termina. */
    export let swipeDir: 'like' | 'dislike' | '' = '';
    export let atalhos = true;
    /** IDs das tags em destaque (as do filtro ativo). */
    export let tagsDestacadas: string[] = [];
    export let onLike: () => void;
    export let onDislike: () => void;

    let fotoIndex = 0;
    $: totalFotos = pessoa.fotos.length;

    const fotoAnterior = () => { if (fotoIndex > 0) fotoIndex--; };
    const proximaFoto  = () => { if (fotoIndex < totalFotos - 1) fotoIndex++; };

    let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
    let isDragging = false, dragX = 0;

    const onTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now(); isDragging = false; dragX = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
            isDragging = true; dragX = dx; e.preventDefault();
        }
    };

    const onTouchEnd = (e: TouchEvent) => {
        const dx  = e.changedTouches[0].clientX - touchStartX;
        const dur = Date.now() - touchStartTime;
        const speed = Math.abs(dx) / dur;
        dragX = 0;
        if (!isDragging && Math.abs(dx) < 10 && dur < 250) {
            // O botão de foto recebe o próprio click depois deste toque
            if ((e.target as Element).closest('button')) return;
            const el = e.currentTarget as HTMLElement;
            const tapX = e.changedTouches[0].clientX - el.getBoundingClientRect().left;
            if (tapX < el.offsetWidth / 2) fotoAnterior();
            else proximaFoto();
            return;
        }
        if (isDragging && (Math.abs(dx) > 80 || speed > 0.4)) {
            if (dx > 0) onLike(); else onDislike();
        }
        isDragging = false;
    };

    const onKeydown = (e: KeyboardEvent) => {
        // Setas em campos ou com o painel de filtros aberto não podem curtir/passar
        if (!atalhos || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === 'ArrowRight') onLike();
        if (e.key === 'ArrowLeft')  onDislike();
        if (e.key === 'ArrowUp')    proximaFoto();
        if (e.key === 'ArrowDown')  fotoAnterior();
    };
</script>

<svelte:window on:keydown={onKeydown} />

<div class="card-wrap"
    class:swipe-like={swipeDir === 'like'}
    class:swipe-dislike={swipeDir === 'dislike'}
    style="transform:translateX({dragX}px) rotate({dragX * 0.04}deg);transition:{isDragging ? 'none' : 'transform .32s cubic-bezier(.22,1,.36,1),opacity .32s ease'};"
    on:touchstart={onTouchStart}
    on:touchmove|nonpassive={onTouchMove}
    on:touchend={onTouchEnd}
    role="region"
    aria-label="Perfil de {pessoa.nome}"
>
    <div class="overlay-like"    class:visible={swipeDir === 'like'    || (isDragging && dragX >  40)} aria-hidden="true">CURTIR 💙</div>
    <div class="overlay-dislike" class:visible={swipeDir === 'dislike' || (isDragging && dragX < -40)} aria-hidden="true">PASSAR ✕</div>

    <div class="card">
        <div class="card-photo">
            {#if totalFotos > 0}
                <img src={pessoa.fotos[fotoIndex]} alt="Foto de {pessoa.nome}" draggable="false" />
            {:else}
                <div class="foto-placeholder" role="img" aria-label="Sem foto — inicial: {inicial(pessoa.nome)}">
                    <span aria-hidden="true">{inicial(pessoa.nome)}</span>
                </div>
            {/if}

            {#if totalFotos > 1}
                <button class="foto-btn foto-btn--prev" on:click|stopPropagation={fotoAnterior}
                    disabled={fotoIndex === 0} aria-label="Foto anterior">
                    <Icon name="chevronLeft" size={18} strokeWidth={2.5} />
                </button>
                <button class="foto-btn foto-btn--next" on:click|stopPropagation={proximaFoto}
                    disabled={fotoIndex === totalFotos - 1} aria-label="Próxima foto">
                    <Icon name="chevronRight" size={18} strokeWidth={2.5} />
                </button>
                <div class="photo-bars" aria-hidden="true">
                    {#each Array(totalFotos) as _, i (i)}
                        <div class="photo-bar">
                            <div class="photo-bar-fill" class:full={i < fotoIndex} class:active={i === fotoIndex}></div>
                        </div>
                    {/each}
                </div>
                <div class="foto-counter" aria-hidden="true">{fotoIndex + 1}/{totalFotos}</div>
            {/if}

            <div class="photo-gradient" aria-hidden="true"></div>
            <div class="card-info-overlay">
                <h2 class="card-name">
                    {pessoa.nome}
                    {#if pessoa.idade > 0}
                        <span class="card-age">{pessoa.idade} anos</span>
                    {/if}
                </h2>
                {#if pessoa.curso}<p class="card-course">{pessoa.curso}</p>{/if}
                {#if pessoa.tagObjs.length > 0}
                    <div class="card-tags" aria-label="Interesses">
                        {#each pessoa.tagObjs as tag (tag.id)}
                            <span class="card-tag" class:card-tag--match={tagsDestacadas.includes(tag.id)}>{tag.nome}</span>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        {#if pessoa.descricao}
            <div class="card-desc">{pessoa.descricao}</div>
        {/if}
    </div>
</div>

{#if totalFotos > 1}<p class="foto-hint" aria-hidden="true">Toque nos lados da foto para navegar</p>{/if}

<style>
    .card-wrap { width: 100%; max-width: 380px; position: relative; will-change: transform; touch-action: pan-y; }
    .card-wrap.swipe-like    { transform: translateX(120vw) rotate(22deg) !important; opacity: 0; }
    .card-wrap.swipe-dislike { transform: translateX(-120vw) rotate(-22deg) !important; opacity: 0; }
    .overlay-like,.overlay-dislike { position: absolute; top: 1.2rem; z-index: 5; font-size: 1rem; font-weight: 700; letter-spacing: .05em; padding: .4rem .9rem; border-radius: 8px; border: 3px solid; opacity: 0; transition: opacity .1s ease; pointer-events: none; }
    .overlay-like    { left: 1.2rem; color: #22c55e; border-color: #22c55e; background: rgba(34,197,94,.12); }
    .overlay-dislike { right: 1.2rem; color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,.12); }
    .overlay-like.visible,.overlay-dislike.visible { opacity: 1; }
    .card { border-radius: 20px; overflow: hidden; box-shadow: 0 12px 50px rgba(15,22,36,.14), 0 4px 16px rgba(79,70,229,.08); background: #fff; user-select: none; -webkit-user-select: none; }
    .card-photo { position: relative; aspect-ratio: 3/4; overflow: hidden; background: linear-gradient(135deg, #818CF8, #4F46E5); }
    .card-photo img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; -webkit-user-drag: none; }
    .foto-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .foto-placeholder span { font-size: 5rem; font-weight: 800; color: rgba(255,255,255,.8); }
    .foto-btn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 4; background: rgba(0,0,0,.35); border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; opacity: 0; transition: opacity .2s; }
    .foto-btn--prev { left: .65rem; }
    .foto-btn--next { right: .65rem; }
    .foto-btn:disabled { opacity: 0 !important; pointer-events: none; }
    .card-photo:hover .foto-btn:not(:disabled) { opacity: 1; }
    .photo-bars { position: absolute; top: .65rem; left: .65rem; right: .65rem; display: flex; gap: 3px; z-index: 4; }
    .photo-bar { flex: 1; height: 3px; border-radius: 99px; background: rgba(255,255,255,.3); overflow: hidden; }
    .photo-bar-fill { height: 100%; width: 0; border-radius: 99px; background: #fff; transition: width .2s ease; }
    .photo-bar-fill.full   { width: 100%; }
    .photo-bar-fill.active { width: 100%; opacity: .85; }
    .foto-counter { position: absolute; top: .7rem; right: .7rem; z-index: 5; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); color: #fff; font-size: .65rem; font-weight: 600; padding: .2rem .55rem; border-radius: 20px; display: none; }
    @media (hover: none) { .foto-counter { display: block; } .photo-bars { display: none; } }
    .photo-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 65%; background: linear-gradient(to top, rgba(10,6,4,.88) 0%, transparent 100%); }
    .card-info-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem 1.1rem 1rem; }
    .card-name { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -.02em; margin-bottom: .2rem; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; }
    .card-age { font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.35); padding: 0.2rem 0.7rem; border-radius: 30px; display: inline-block; backdrop-filter: blur(4px); }
    .card-course { font-size: .78rem; color: rgba(255,255,255,.7); margin-bottom: .55rem; }
    .card-tags   { display: flex; flex-wrap: wrap; gap: .35rem; }
    .card-tag    { font-size: .67rem; padding: .22rem .65rem; border-radius: 20px; background: rgba(255,255,255,.15); backdrop-filter: blur(4px); color: #fff; border: 1px solid rgba(255,255,255,.25); }
    .card-tag--match { background: var(--primary); border-color: var(--primary); }
    .card-desc { padding: .85rem 1.1rem; font-size: .82rem; color: var(--muted); line-height: 1.55; border-top: 1px solid rgba(100,116,139,.1); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .foto-hint  { font-size: .67rem; color: rgba(100,116,139,.5); letter-spacing: .02em; margin-top: -.25rem; }
    @media (hover: hover) { .foto-hint { display: none; } }
</style>
