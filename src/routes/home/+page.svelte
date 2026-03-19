<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    interface Pessoa {
        id: string;
        nome: string;
        idade: number;
        curso: string;
        periodo: string;
        distancia: string;
        fotos: string[];
        tags: string[];
        descricao: string;
    }

    let pessoas: Pessoa[] = [];
    let currentIndex = 0;
    let loading = true;
    let swipeDir: 'like' | 'dislike' | '' = '';
    let fotoIndex = 0;

    const API = 'http://localhost:8080';

    onMount(async () => {
        try {
            const res = await fetch(`${API}/pessoas`);
            if (res.ok) {
                const data = await res.json();
                pessoas = data;
            }
        } catch {
            // fallback para dados mock em desenvolvimento
            pessoas = [
                {
                    id: '1', nome: 'Ana Silva', idade: 23, curso: 'Medicina',
                    periodo: '8° período', distancia: '2km',
                    fotos: ['https://randomuser.me/api/portraits/women/44.jpg','https://randomuser.me/api/portraits/women/45.jpg'],
                    tags: ['Música', 'Viagem', 'Cinema'],
                    descricao: 'Amo música e viajar. Busco alguém para compartilhar momentos especiais.'
                },
                {
                    id: '2', nome: 'João Santos', idade: 25, curso: 'Engenharia',
                    periodo: '10° período', distancia: '5km',
                    fotos: ['https://randomuser.me/api/portraits/men/32.jpg'],
                    tags: ['Esportes', 'Tecnologia', 'Jogos'],
                    descricao: 'Apaixonado por tecnologia e esportes. Vamos jogar um futebol?'
                }
            ];
        } finally {
            loading = false;
        }
    });

    $: pessoaAtual = pessoas[currentIndex] ?? null;

    const avancar = () => {
        setTimeout(() => {
            fotoIndex = 0;
            swipeDir = '';
            currentIndex = currentIndex < pessoas.length - 1 ? currentIndex + 1 : -1;
        }, 320);
    };

    const like = async () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'like';
        try {
            // TODO: substituir pelo ID do usuário logado
            await fetch(`${API}/likes?origemId=MEU_ID&destinoId=${pessoaAtual.id}`, { method: 'POST' });
        } catch { /* ignora erro de rede */ }
        avancar();
    };

    const dislike = () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'dislike';
        avancar();
    };

    // Swipe por teclado
    const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') like();
        if (e.key === 'ArrowLeft')  dislike();
    };

    // Touch/drag
    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx > 60)       like();
        else if (dx < -60) dislike();
    };
</script>

<svelte:window on:keydown={onKeydown} />

<div class="page">
    <!-- Header -->
    <header class="header">
        <div class="header-logo">
            <span class="header-star">✦</span>
            <span class="header-brand">PairUp</span>
        </div>

        <nav class="header-nav">
            <button class="nav-btn" on:click={() => goto('/matches')} aria-label="Ver matches" title="Matches">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                <span class="nav-badge">3</span>
            </button>
            <button class="nav-btn" on:click={() => goto('/profile')} aria-label="Perfil" title="Perfil">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </button>
        </nav>
    </header>

    <main class="main">
        {#if loading}
            <div class="loading-wrap" aria-live="polite">
                <div class="loading-ring"></div>
                <p class="loading-text">Encontrando pessoas...</p>
            </div>

        {:else if currentIndex === -1}
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h2 class="empty-title">Você viu todo mundo!</h2>
                <p class="empty-sub">Novas pessoas aparecem todo dia. Volte mais tarde.</p>
                <button class="btn-reload" on:click={() => { currentIndex = 0; fotoIndex = 0; }}>
                    Recarregar
                </button>
            </div>

        {:else if pessoaAtual}
            <!-- Card -->
            <div
                class="card-wrap"
                class:swipe-like={swipeDir === 'like'}
                class:swipe-dislike={swipeDir === 'dislike'}
                on:touchstart={onTouchStart}
                on:touchend={onTouchEnd}
            >
                <!-- Feedback overlays -->
                <div class="overlay-like"    class:visible={swipeDir === 'like'}>LIKE ❤️</div>
                <div class="overlay-dislike" class:visible={swipeDir === 'dislike'}>PASS ✕</div>

                <div class="card">
                    <!-- Foto -->
                    <div class="card-photo">
                        <img src={pessoaAtual.fotos[fotoIndex]} alt={pessoaAtual.nome} />

                        <!-- Tap zones -->
                        <button class="tap-zone tap-left"  type="button" on:click={() => { if (fotoIndex > 0) fotoIndex--; }}                                          aria-label="Foto anterior"></button>
                        <button class="tap-zone tap-right" type="button" on:click={() => { if (fotoIndex < pessoaAtual.fotos.length - 1) fotoIndex++; }} aria-label="Próxima foto"></button>

                        <!-- Foto dots -->
                        {#if pessoaAtual.fotos.length > 1}
                            <div class="photo-dots" aria-hidden="true">
                                {#each pessoaAtual.fotos as _, i (i)}
                                    <div class="photo-dot" class:active={i === fotoIndex}></div>
                                {/each}
                            </div>
                        {/if}

                        <!-- Distância -->
                        <div class="distance-badge">📍 {pessoaAtual.distancia}</div>

                        <!-- Gradient -->
                        <div class="photo-gradient" aria-hidden="true"></div>

                        <!-- Info sobreposta à foto -->
                        <div class="card-info-overlay">
                            <h2 class="card-name">{pessoaAtual.nome}, {pessoaAtual.idade}</h2>
                            <p class="card-course">{pessoaAtual.curso} · {pessoaAtual.periodo}</p>
                            <div class="card-tags">
                                {#each pessoaAtual.tags as tag (tag)}
                                    <span class="card-tag">{tag}</span>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <!-- Descrição -->
                    {#if pessoaAtual.descricao}
                        <div class="card-desc">
                            <p>{pessoaAtual.descricao}</p>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Botões -->
            <div class="action-row">
                <button class="action-btn action-dislike" on:click={dislike} aria-label="Não curtir" title="Pass">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <button class="action-btn action-like" on:click={like} aria-label="Curtir" title="Like">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
            </div>

            <p class="swipe-hint">← deslize ou use as setas do teclado →</p>
        {/if}
    </main>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

    :global(body) { background: var(--cream, #FAF7F2); font-family: 'DM Sans', sans-serif; }

    .page { min-height: 100vh; display: flex; flex-direction: column; background: var(--cream, #FAF7F2); }

    /* ── Header ── */
    .header {
        display: flex; justify-content: space-between; align-items: center;
        padding: .9rem 1.5rem;
        background: rgba(250,247,242,0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border, rgba(201,169,110,.22));
        position: sticky; top: 0; z-index: 10;
    }
    .header-logo { display: flex; align-items: center; gap: .35rem; }
    .header-star  { font-size: 1.2rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    @keyframes pk { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    .header-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -.02em; }
    .header-nav  { display: flex; gap: .75rem; align-items: center; }
    .nav-btn     { position: relative; background: none; border: none; cursor: pointer; padding: .4rem; color: var(--muted, #8A7F79); transition: color .2s; }
    .nav-btn:hover { color: var(--rose, #D94F6B); }
    .nav-btn svg { width: 22px; height: 22px; display: block; }
    .nav-badge   {
        position: absolute; top: 0; right: 0;
        background: var(--rose, #D94F6B); color: #fff;
        font-size: .6rem; font-weight: 600;
        width: 16px; height: 16px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--cream, #FAF7F2);
    }

    /* ── Main ── */
    .main {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 1.5rem 1rem 2rem;
        gap: 1.25rem;
    }

    /* ── Loading ── */
    .loading-wrap  { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .loading-ring  {
        width: 44px; height: 44px;
        border: 3px solid rgba(217,79,107,.15);
        border-top-color: var(--rose, #D94F6B);
        border-radius: 50%;
        animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text  { font-size: .82rem; color: var(--muted, #8A7F79); }

    /* ── Empty state ── */
    .empty-state { text-align: center; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
    .empty-icon  { font-size: 3rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink, #1A1410); }
    .empty-sub   { font-size: .82rem; color: var(--muted, #8A7F79); max-width: 220px; }
    .btn-reload  {
        margin-top: .5rem; padding: .72rem 1.75rem; border: none; border-radius: 12px;
        background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F);
        color: #fff; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
        cursor: pointer; box-shadow: 0 4px 16px rgba(217,79,107,.3);
        transition: opacity .2s;
    }
    .btn-reload:hover { opacity: .88; }

    /* ── Card ── */
    .card-wrap {
        width: 100%; max-width: 380px;
        position: relative;
        transition: transform .32s cubic-bezier(.22,1,.36,1), opacity .32s ease;
    }
    .card-wrap.swipe-like    { transform: translateX(220px) rotate(18deg); opacity: 0; }
    .card-wrap.swipe-dislike { transform: translateX(-220px) rotate(-18deg); opacity: 0; }

    /* Feedback overlays */
    .overlay-like, .overlay-dislike {
        position: absolute; top: 1.2rem; z-index: 5;
        font-size: 1.1rem; font-weight: 700; letter-spacing: .05em;
        padding: .4rem .9rem; border-radius: 8px; border: 3px solid;
        opacity: 0; transition: opacity .15s ease;
        pointer-events: none;
    }
    .overlay-like    { left: 1.2rem; color: #22c55e; border-color: #22c55e; background: rgba(34,197,94,.1); }
    .overlay-dislike { right: 1.2rem; color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,.1); }
    .overlay-like.visible, .overlay-dislike.visible { opacity: 1; }

    .card {
        border-radius: 20px; overflow: hidden;
        box-shadow: 0 12px 50px rgba(26,20,16,.14), 0 4px 16px rgba(217,79,107,.08);
        background: #fff;
    }

    .card-photo { position: relative; aspect-ratio: 3/4; overflow: hidden; }
    .card-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .tap-zone  { position: absolute; top: 0; bottom: 0; width: 50%; background: transparent; border: none; cursor: pointer; }
    .tap-left  { left: 0; }
    .tap-right { right: 0; }

    .photo-dots {
        position: absolute; top: .85rem; left: 0; right: 0;
        display: flex; justify-content: center; gap: .3rem;
    }
    .photo-dot {
        height: 3px; width: 20px; border-radius: 99px;
        background: rgba(255,255,255,.4); transition: all .25s;
    }
    .photo-dot.active { width: 28px; background: #fff; }

    .distance-badge {
        position: absolute; top: .85rem; right: .85rem;
        background: rgba(0,0,0,.45); backdrop-filter: blur(4px);
        color: #fff; font-size: .68rem; padding: .25rem .65rem; border-radius: 20px;
    }

    .photo-gradient {
        position: absolute; bottom: 0; left: 0; right: 0; height: 60%;
        background: linear-gradient(to top, rgba(10,6,4,.85) 0%, transparent 100%);
    }

    .card-info-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        padding: 1.25rem 1.1rem 1rem;
    }
    .card-name   { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 700; color: #fff; letter-spacing: -.01em; margin-bottom: .2rem; }
    .card-course { font-size: .78rem; color: rgba(255,255,255,.7); margin-bottom: .55rem; }
    .card-tags   { display: flex; flex-wrap: wrap; gap: .35rem; }
    .card-tag    {
        font-size: .67rem; padding: .22rem .65rem; border-radius: 20px;
        background: rgba(255,255,255,.15); backdrop-filter: blur(4px);
        color: #fff; border: 1px solid rgba(255,255,255,.25);
    }

    .card-desc {
        padding: .85rem 1.1rem;
        font-size: .82rem; color: var(--muted, #8A7F79); line-height: 1.55;
        border-top: 1px solid rgba(138,127,121,.1);
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* ── Action buttons ── */
    .action-row { display: flex; gap: 1.5rem; align-items: center; }
    .action-btn {
        border: none; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: transform .15s, box-shadow .2s;
    }
    .action-btn:hover { transform: scale(1.1); }
    .action-btn:active { transform: scale(.95); }
    .action-btn svg { width: 26px; height: 26px; display: block; }

    .action-dislike {
        width: 58px; height: 58px;
        background: #fff;
        color: #ef4444;
        box-shadow: 0 4px 18px rgba(239,68,68,.2);
        border: 1.5px solid rgba(239,68,68,.15);
    }
    .action-dislike:hover { box-shadow: 0 6px 24px rgba(239,68,68,.3); }

    .action-like {
        width: 68px; height: 68px;
        background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F);
        color: #fff;
        box-shadow: 0 6px 24px rgba(217,79,107,.4);
    }
    .action-like:hover { box-shadow: 0 8px 30px rgba(217,79,107,.55); }

    .swipe-hint { font-size: .68rem; color: rgba(138,127,121,.55); letter-spacing: .03em; }
</style>