
<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';

    type Genero      = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    type Sexualidade = 'HETERO' | 'HOMOSEXUAL' | 'BI' | 'PAN' | 'ASSEXUAL' | 'OUTRO';

    interface Pessoa {
        id: string; nome: string; email?: string;
        genero?: Genero; sexualidade?: Sexualidade;
        curso?: string; periodo?: string;
        fotos?: string[];
        tags?: { id: string; nome: string }[] | string[];
        descricao?: string;
    }
    interface ApiTag { id: string; nome: string; }

    let todasPessoas: Pessoa[] = [];
    let pessoas: Pessoa[]      = [];
    let currentIndex = 0;
    let loading = true;
    let swipeDir: 'like' | 'dislike' | '' = '';
    let matchCount = 0;
    let fotoIndex = 0;
    let minhaPessoaId = '';
    let minhaPessoa: Pessoa | null = null;

    // IDs já avaliados nesta sessão (like ou dislike)
    let avaliadosIds = new Set<string>();

    let showFilters = false;
    let filtroTags: ApiTag[] = [];
    let availableTags: ApiTag[] = [];
    let tagsLoading = true;
    let searchTagTerm = '';

    const API = 'https://pairup-production-b9ee.up.railway.app';
    const storedUser = browser ? JSON.parse(localStorage.getItem('user') ?? 'null') : null;
    const MEU_EMAIL: string = storedUser?.email ?? '';

    const driveUrl = (caminho: string): string => {
        if (!caminho) return '';
        const id = caminho.startsWith('google-drive:') ? caminho.replace('google-drive:', '') : caminho;
        return `${API}/api/imagens/proxy/${id}`;
    };

    const fetchFotos = async (pessoaId: string): Promise<string[]> => {
        try {
            const res = await fetch(`${API}/api/imagens/pessoa/${pessoaId}`);
            if (!res.ok) return [];
            const imagens: { caminho: string; perfil: boolean }[] = await res.json();
            return imagens
                .sort((a, b) => (b.perfil ? 1 : 0) - (a.perfil ? 1 : 0))
                .map(i => driveUrl(i.caminho))
                .filter(Boolean);
        } catch { return []; }
    };

    const normalizarTags = (tags: any): ApiTag[] => {
        if (!tags || !Array.isArray(tags)) return [];
        return tags.map((t: any) =>
            typeof t === 'string' ? { id: t, nome: t } : { id: t.id ?? t.nome, nome: t.nome ?? '' }
        ).filter(t => t.nome);
    };

    // ── Compatibilidade corrigida ──
    const pessoasCompativeis = (eu: Pessoa, outra: Pessoa): boolean => {
        const meuG  = eu.genero;
        const meuS  = eu.sexualidade;
        const outG  = outra.genero;
        const outS  = outra.sexualidade;

        if (!meuG || !meuS || !outG || !outS) return true;

        // Eu me interesso por outra?
        const euMeInteresso = (): boolean => {
            switch (meuS) {
                case 'BI': case 'PAN': case 'ASSEXUAL': case 'OUTRO': return true;
                case 'HETERO':
                    if (meuG === 'MASCULINO') return outG === 'FEMININO';
                    if (meuG === 'FEMININO')  return outG === 'MASCULINO';
                    return true;
                case 'HOMOSEXUAL':
                    if (meuG === 'MASCULINO') return outG === 'MASCULINO';
                    if (meuG === 'FEMININO')  return outG === 'FEMININO';
                    return true;
                default: return true;
            }
        };

        // Outra se interessa por mim?
        const outraSeInteressa = (): boolean => {
            switch (outS) {
                case 'BI': case 'PAN': case 'ASSEXUAL': case 'OUTRO': return true;
                case 'HETERO':
                    if (outG === 'MASCULINO') return meuG === 'FEMININO';
                    if (outG === 'FEMININO')  return meuG === 'MASCULINO';
                    return true;
                case 'HOMOSEXUAL':
                    if (outG === 'MASCULINO') return meuG === 'MASCULINO';
                    if (outG === 'FEMININO')  return meuG === 'FEMININO';
                    return true;
                default: return true;
            }
        };

        return euMeInteresso() && outraSeInteressa();
    };

    const temTagEmComum = (pessoa: Pessoa): boolean => {
        if (filtroTags.length === 0) return true;
        const tagsPessoa = normalizarTags(pessoa.tags).map(t => t.id);
        return filtroTags.some(ft => tagsPessoa.includes(ft.id));
    };

    const aplicarFiltros = () => {
        if (!minhaPessoa) {
            pessoas = todasPessoas.filter(p => !avaliadosIds.has(p.id));
        } else {
            pessoas = todasPessoas.filter(p =>
                !avaliadosIds.has(p.id) &&
                pessoasCompativeis(minhaPessoa!, p) &&
                temTagEmComum(p)
            );
        }
        currentIndex = pessoas.length > 0 ? 0 : -1;
        fotoIndex = 0;
        showFilters = false;
    };

    const limparFiltros = () => { filtroTags = []; aplicarFiltros(); };

    $: filtroAtivo = filtroTags.length > 0;
    $: tagsDisponiveis = availableTags.filter(t =>
        t.nome.toLowerCase().includes(searchTagTerm.toLowerCase())
    );
    const isTagFiltro = (id: string) => filtroTags.some(t => t.id === id);
    const toggleFiltroTag = (tag: ApiTag) => {
        if (isTagFiltro(tag.id)) filtroTags = filtroTags.filter(t => t.id !== tag.id);
        else filtroTags = [...filtroTags, tag];
    };

    onMount(async () => {
        fetch(`${API}/tags/ativas`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { availableTags = data; })
            .finally(() => { tagsLoading = false; });

        try {
            if (MEU_EMAIL) {
                const res = await fetch(`${API}/pessoas`);
                if (res.ok) {
                    const lista = await res.json();
                    const minha = lista.find((p: any) => p.email === MEU_EMAIL);
                    if (minha) {
                        minhaPessoaId = minha.id;
                        minhaPessoa   = minha;
                        const matchRes = await fetch(`${API}/matches/${minha.id}`);
                        if (matchRes.ok) {
                            const matches = await matchRes.json();
                            matchCount = Array.isArray(matches) ? matches.length : 0;
                        }
                    }
                }
            }
        } catch { /* ignora */ }

        try {
            const res = await fetch(`${API}/pessoas`);
            if (res.ok) {
                const data: any[] = await res.json();
                const semEu = MEU_EMAIL ? data.filter((p: any) => p.email !== MEU_EMAIL) : data;

                todasPessoas = await Promise.all(
                    semEu.map(async (p: any) => ({
                        ...p,
                        fotos: await fetchFotos(p.id),
                        tags:  normalizarTags(p.tags),
                    }))
                );
                aplicarFiltros();
            } else {
                currentIndex = -1;
            }
        } catch {
            currentIndex = -1;
        } finally {
            loading = false;
        }
    });

    $: pessoaAtual = currentIndex >= 0 ? (pessoas[currentIndex] ?? null) : null;
    $: totalFotos  = pessoaAtual?.fotos?.length ?? 0;

    const avancar = () => {
        setTimeout(() => {
            fotoIndex = 0;
            swipeDir = '';
            // Remove a pessoa avaliada da lista e avança
            if (pessoaAtual) pessoas = pessoas.filter(p => p.id !== pessoaAtual!.id);
            currentIndex = pessoas.length > 0 ? 0 : -1;
        }, 320);
    };

    const like = async () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'like';
        avaliadosIds = new Set([...avaliadosIds, pessoaAtual.id]);
        try {
            if (minhaPessoaId) {
                await fetch(`${API}/likes?origemId=${minhaPessoaId}&destinoId=${pessoaAtual.id}`, { method: 'POST' });
            }
        } catch { /* ignora */ }
        avancar();
    };

    const dislike = () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'dislike';
        avaliadosIds = new Set([...avaliadosIds, pessoaAtual.id]);
        avancar();
    };

    const fotoAnterior = () => { if (fotoIndex > 0) fotoIndex--; };
    const proximaFoto  = () => { if (fotoIndex < totalFotos - 1) fotoIndex++; };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragging = false;
    let dragX = 0;

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
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const duration = Date.now() - touchStartTime;
        const speed = Math.abs(dx) / duration;
        dragX = 0;
        if (!isDragging && Math.abs(dx) < 10 && Math.abs(dy) < 10 && duration < 250) {
            const cardEl = e.currentTarget as HTMLElement;
            const tapX = e.changedTouches[0].clientX - cardEl.getBoundingClientRect().left;
            if (tapX < cardEl.offsetWidth / 2) fotoAnterior(); else proximaFoto();
            isDragging = false; return;
        }
        if (isDragging && (Math.abs(dx) > 80 || speed > 0.4)) {
            if (dx > 0) like(); else dislike();
        }
        isDragging = false;
    };

    const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') like();
        if (e.key === 'ArrowLeft')  dislike();
        if (e.key === 'ArrowUp')    proximaFoto();
        if (e.key === 'ArrowDown')  fotoAnterior();
        if (e.key === 'Escape')     showFilters = false;
    };

    $: cardStyle = isDragging
        ? `transform: translateX(${dragX}px) rotate(${dragX * 0.04}deg); transition: none;`
        : '';
</script>
<svelte:window on:keydown={onKeydown} />

<div class="page">
    <header class="header">
        <div class="header-logo">
            <span class="header-star">✦</span>
            <span class="header-brand">PairUp</span>
        </div>
        <nav class="header-nav">
            <!-- Botão filtros -->
            <button
                class="nav-btn"
                class:nav-btn--active={filtroAtivo}
                on:click={() => showFilters = !showFilters}
                aria-label="Filtros"
                title="Filtros"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h18M7 12h10M11 20h2"/>
                </svg>
                {#if filtroAtivo}
                    <span class="nav-badge nav-badge--filter">{filtroTags.length}</span>
                {/if}
            </button>
            <button class="nav-btn" on:click={() => goto('/matches')} aria-label="Matches">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {#if matchCount > 0}<span class="nav-badge">{matchCount}</span>{/if}
            </button>
            <button class="nav-btn" on:click={() => goto('/profile')} aria-label="Perfil">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
            </button>
        </nav>
    </header>

    <!-- ── Painel de filtros ── -->
    {#if showFilters}
        <!-- Overlay -->
        <div class="filter-overlay" on:click={() => showFilters = false} aria-hidden="true"></div>

        <div class="filter-panel" role="dialog" aria-label="Filtros">
            <div class="filter-header">
                <h3 class="filter-title">Filtros</h3>
                <div class="filter-header-actions">
                    {#if filtroAtivo}
                        <button class="filter-clear" on:click={limparFiltros}>Limpar</button>
                    {/if}
                    <button class="filter-close" on:click={() => showFilters = false} aria-label="Fechar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Info de compatibilidade -->
            {#if minhaPessoa?.genero && minhaPessoa?.sexualidade}
                <div class="filter-compat-info">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    Filtro de compatibilidade por gênero e sexualidade aplicado automaticamente.
                </div>
            {/if}

            <!-- Filtro por tags -->
            <div class="filter-section">
                <p class="filter-section-title">Interesses em comum</p>
                <p class="filter-section-sub">Mostrar pessoas com pelo menos um interesse selecionado</p>

                {#if filtroTags.length > 0}
                    <div class="filter-selected-chips">
                        {#each filtroTags as tag (tag.id)}
                            <button type="button" class="chip chip-on"
                                on:click={() => toggleFiltroTag(tag)}>
                                {tag.nome} ✕
                            </button>
                        {/each}
                    </div>
                {/if}

                {#if tagsLoading}
                    <div class="tags-loading">
                        <div class="mini-ring"></div>
                        <span>Carregando...</span>
                    </div>
                {:else}
                    <div class="filter-search-wrap">
                        <svg class="filter-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input type="text" placeholder="Buscar interesse..."
                            bind:value={searchTagTerm} class="filter-search-input" />
                    </div>
                    <div class="filter-tags-pool">
                        {#each tagsDisponiveis as tag (tag.id)}
                            <button type="button" class="chip"
                                class:chip-on={isTagFiltro(tag.id)}
                                on:click={() => toggleFiltroTag(tag)}>
                                {tag.nome}
                            </button>
                        {/each}
                        {#if tagsDisponiveis.length === 0}
                            <p class="no-results">Nenhum interesse encontrado</p>
                        {/if}
                    </div>
                {/if}
            </div>

            <button class="btn-aplicar" on:click={aplicarFiltros}>
                Aplicar filtros
                {#if filtroTags.length > 0}
                    · {filtroTags.length} tag{filtroTags.length > 1 ? 's' : ''}
                {/if}
            </button>
        </div>
    {/if}

    <main class="main">
        {#if loading}
            <div class="loading-wrap">
                <div class="loading-ring"></div>
                <p class="loading-text">Encontrando pessoas...</p>
            </div>

        {:else if currentIndex === -1 || !pessoaAtual}
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <h2 class="empty-title">
                    {filtroAtivo ? 'Nenhuma pessoa com esses interesses' : 'Você viu todo mundo!'}
                </h2>
                <p class="empty-sub">
                    {filtroAtivo ? 'Tente remover alguns filtros.' : 'Novas pessoas aparecem todo dia.'}
                </p>
                {#if filtroAtivo}
                    <button class="btn-reload" on:click={limparFiltros}>Limpar filtros</button>
                {:else}
                    <button class="btn-reload" on:click={() => { currentIndex = 0; fotoIndex = 0; }}>
                        Recarregar
                    </button>
                {/if}
            </div>

        {:else}
            <!-- Badge de filtros ativos -->
            {#if filtroAtivo}
                <div class="active-filters-bar">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V17a1 1 0 01-.553.894l-4-2A1 1 0 018 15v-4.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd"/>
                    </svg>
                    <span>
                        {filtroTags.map(t => t.nome).join(', ')}
                    </span>
                    <button on:click={limparFiltros} aria-label="Remover filtros">✕</button>
                </div>
            {/if}

            <div
                class="card-wrap"
                class:swipe-like={swipeDir === 'like'}
                class:swipe-dislike={swipeDir === 'dislike'}
                style={cardStyle}
                on:touchstart={onTouchStart}
                on:touchmove|nonpassive={onTouchMove}
                on:touchend={onTouchEnd}
            >
                <div class="overlay-like"    class:visible={swipeDir === 'like' || (isDragging && dragX > 40)}>LIKE ❤️</div>
                <div class="overlay-dislike" class:visible={swipeDir === 'dislike' || (isDragging && dragX < -40)}>PASS ✕</div>

                <div class="card">
                    <div class="card-photo">
                        {#if pessoaAtual.fotos && pessoaAtual.fotos.length > 0}
                            <img src={pessoaAtual.fotos[fotoIndex]} alt={pessoaAtual.nome}
                                draggable="false"
                                on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        {:else}
                            <div class="foto-placeholder">
                                <span>{pessoaAtual.nome?.charAt(0)?.toUpperCase() || '?'}</span>
                            </div>
                        {/if}

                        {#if totalFotos > 1}
                            <button class="foto-btn foto-btn--prev" type="button"
                                on:click|stopPropagation={fotoAnterior}
                                disabled={fotoIndex === 0} aria-label="Foto anterior">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <button class="foto-btn foto-btn--next" type="button"
                                on:click|stopPropagation={proximaFoto}
                                disabled={fotoIndex === totalFotos - 1} aria-label="Próxima foto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>

                            <div class="photo-bars" aria-hidden="true">
                                {#each Array(totalFotos) as _, i (i)}
                                    <div class="photo-bar">
                                        <div class="photo-bar-fill"
                                            class:full={i < fotoIndex}
                                            class:active={i === fotoIndex}></div>
                                    </div>
                                {/each}
                            </div>

                            <div class="foto-counter">{fotoIndex + 1}/{totalFotos}</div>
                        {/if}

                        <div class="photo-gradient" aria-hidden="true"></div>

                        <div class="card-info-overlay">
                            <h2 class="card-name">
                                {pessoaAtual.nome}
                            </h2>
                            {#if pessoaAtual.curso}
                                <p class="card-course">
                                    {pessoaAtual.curso}{pessoaAtual.periodo ? ` · ${pessoaAtual.periodo}` : ''}
                                </p>
                            {/if}
                            {#if pessoaAtual.tags && pessoaAtual.tags.length > 0}
                                <div class="card-tags">
                                    {#each (pessoaAtual.tags as ApiTag[]) as tag (tag.id)}
                                        <span class="card-tag"
                                            class:card-tag--match={isTagFiltro(tag.id)}>
                                            {tag.nome}
                                        </span>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>

                    {#if pessoaAtual.descricao}
                        <div class="card-desc">{pessoaAtual.descricao}</div>
                    {/if}
                </div>
            </div>

            {#if totalFotos > 1}
                <p class="foto-hint">Toque nos lados da foto para navegar</p>
            {/if}

            <div class="action-row">
                <button class="action-btn action-dislike" on:click={dislike} aria-label="Pass">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <button class="action-btn action-like" on:click={like} aria-label="Like">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>
            </div>

            <p class="swipe-hint">← arraste o card ou use as setas →</p>
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
        background: rgba(250,247,242,0.85); backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border, rgba(201,169,110,.22));
        position: sticky; top: 0; z-index: 20;
    }
    .header-logo  { display: flex; align-items: center; gap: .35rem; }
    .header-star  { font-size: 1.2rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    @keyframes pk { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    .header-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -.02em; }
    .header-nav   { display: flex; gap: .6rem; align-items: center; }
    .nav-btn      { position: relative; background: none; border: none; cursor: pointer; padding: .4rem; color: var(--muted, #8A7F79); border-radius: 9px; transition: color .2s, background .2s; }
    .nav-btn:hover { color: var(--rose, #D94F6B); }
    .nav-btn--active { color: var(--rose, #D94F6B); background: rgba(217,79,107,.08); }
    .nav-btn svg  { width: 22px; height: 22px; display: block; }
    .nav-badge    {
        position: absolute; top: 0; right: 0;
        background: var(--rose, #D94F6B); color: #fff;
        font-size: .6rem; font-weight: 600;
        width: 16px; height: 16px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--cream, #FAF7F2);
    }
    .nav-badge--filter { background: #f59e0b; }

    /* ── Filter overlay ── */
    .filter-overlay {
        position: fixed; inset: 0; z-index: 29;
        background: rgba(26,20,16,.3); backdrop-filter: blur(2px);
        animation: fade-in .2s ease;
    }
    @keyframes fade-in { from{opacity:0} to{opacity:1} }

    /* ── Filter panel ── */
    .filter-panel {
        position: fixed; top: 58px; right: 0; left: 0;
        z-index: 30; background: #fff;
        border-bottom: 1px solid var(--border, rgba(201,169,110,.22));
        border-radius: 0 0 20px 20px;
        box-shadow: 0 8px 32px rgba(26,20,16,.12);
        padding: 1rem 1.25rem 1.25rem;
        max-height: 70vh; overflow-y: auto;
        animation: slide-down .25s cubic-bezier(.22,1,.36,1);
        max-width: 480px; margin: 0 auto;
    }
    @keyframes slide-down { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }

    .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .85rem; }
    .filter-title  { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 700; color: var(--ink, #1A1410); }
    .filter-header-actions { display: flex; align-items: center; gap: .5rem; }
    .filter-clear  { background: none; border: none; font-size: .75rem; color: var(--rose, #D94F6B); cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: underline; }
    .filter-close  { background: none; border: none; cursor: pointer; color: var(--muted, #8A7F79); padding: .2rem; border-radius: 6px; }
    .filter-close svg { width: 18px; height: 18px; display: block; }
    .filter-close:hover { color: var(--rose, #D94F6B); }

    .filter-compat-info {
        display: flex; align-items: flex-start; gap: .45rem;
        background: rgba(217,79,107,.07); border: 1px solid rgba(217,79,107,.18);
        border-radius: 10px; padding: .55rem .75rem;
        font-size: .74rem; color: var(--rose, #D94F6B); line-height: 1.5;
        margin-bottom: .85rem;
    }
    .filter-compat-info svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; }

    .filter-section { margin-bottom: 1rem; }
    .filter-section-title { font-size: .8rem; font-weight: 500; color: var(--ink, #1A1410); margin-bottom: .15rem; }
    .filter-section-sub   { font-size: .72rem; color: var(--muted, #8A7F79); margin-bottom: .65rem; }

    .filter-selected-chips { display: flex; flex-wrap: wrap; gap: .35rem; margin-bottom: .6rem; padding: .5rem; background: rgba(217,79,107,.06); border-radius: 10px; }

    .filter-search-wrap { position: relative; margin-bottom: .6rem; }
    .filter-search-icon { position: absolute; left: .7rem; top: 50%; transform: translateY(-50%); width: 13px; height: 13px; color: var(--muted, #8A7F79); pointer-events: none; }
    .filter-search-input {
        width: 100%; padding: .55rem .85rem .55rem 2rem;
        border: 1.5px solid rgba(138,127,121,.2); border-radius: 9px;
        background: rgba(255,255,255,.7); font-family: 'DM Sans', sans-serif;
        font-size: .82rem; color: var(--ink, #1A1410); outline: none;
        transition: border-color .2s, box-shadow .2s;
    }
    .filter-search-input::placeholder { color: rgba(138,127,121,.5); }
    .filter-search-input:focus { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }

    .filter-tags-pool {
        display: flex; flex-wrap: wrap; gap: .35rem;
        max-height: 130px; overflow-y: auto;
        padding: .45rem; border: 1.5px solid rgba(138,127,121,.13);
        border-radius: 9px; background: rgba(255,255,255,.4);
    }
    .no-results { font-size: .78rem; color: var(--muted, #8A7F79); }

    .tags-loading { display: flex; align-items: center; gap: .5rem; font-size: .78rem; color: var(--muted, #8A7F79); padding: .5rem 0; }
    .mini-ring    { width: 16px; height: 16px; border: 2px solid rgba(217,79,107,.2); border-top-color: var(--rose, #D94F6B); border-radius: 50%; animation: spin .7s linear infinite; }

    .btn-aplicar {
        width: 100%; padding: .78rem; border: none; border-radius: 12px;
        background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F); color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
        cursor: pointer; box-shadow: 0 4px 14px rgba(217,79,107,.3);
        transition: opacity .2s;
    }
    .btn-aplicar:hover { opacity: .9; }

    /* Chips */
    .chip {
        padding: .28rem .75rem; border-radius: 20px;
        border: 1.5px solid rgba(138,127,121,.22); background: #fff;
        color: var(--ink, #1A1410); font-family: 'DM Sans', sans-serif;
        font-size: .75rem; cursor: pointer; white-space: nowrap; transition: all .15s;
    }
    .chip:hover { border-color: var(--rose, #D94F6B); color: var(--rose, #D94F6B); }
    .chip-on    { background: var(--rose, #D94F6B); border-color: var(--rose, #D94F6B); color: #fff; }
    .chip-on:hover { background: #C0394F; border-color: #C0394F; }

    /* ── Active filters bar ── */
    .active-filters-bar {
        display: flex; align-items: center; gap: .5rem;
        background: rgba(217,79,107,.08); border: 1px solid rgba(217,79,107,.2);
        border-radius: 20px; padding: .35rem .75rem;
        font-size: .72rem; color: var(--rose, #D94F6B); max-width: 380px; width: 100%;
    }
    .active-filters-bar svg { width: 13px; height: 13px; flex-shrink: 0; }
    .active-filters-bar span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .active-filters-bar button { background: none; border: none; cursor: pointer; color: var(--rose, #D94F6B); font-size: .75rem; padding: 0; flex-shrink: 0; }

    /* ── Main ── */
    .main {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 1.25rem 1rem 1.5rem; gap: 1rem;
    }

    /* ── Loading ── */
    .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .loading-ring {
        width: 44px; height: 44px;
        border: 3px solid rgba(217,79,107,.15); border-top-color: var(--rose, #D94F6B);
        border-radius: 50%; animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: .82rem; color: var(--muted, #8A7F79); }

    /* ── Empty ── */
    .empty-state { text-align: center; display: flex; flex-direction: column; align-items: center; gap: .75rem; }
    .empty-icon  { font-size: 3rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink, #1A1410); }
    .empty-sub   { font-size: .82rem; color: var(--muted, #8A7F79); max-width: 240px; }
    .btn-reload  {
        margin-top: .5rem; padding: .72rem 1.75rem; border: none; border-radius: 12px;
        background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F); color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
        cursor: pointer; box-shadow: 0 4px 16px rgba(217,79,107,.3); transition: opacity .2s;
    }
    .btn-reload:hover { opacity: .88; }

    /* ── Card ── */
    .card-wrap {
        width: 100%; max-width: 380px; position: relative;
        transition: transform .32s cubic-bezier(.22,1,.36,1), opacity .32s ease;
        will-change: transform; touch-action: pan-y;
    }
    .card-wrap.swipe-like    { transform: translateX(120vw) rotate(22deg) !important; opacity: 0; }
    .card-wrap.swipe-dislike { transform: translateX(-120vw) rotate(-22deg) !important; opacity: 0; }

    .overlay-like, .overlay-dislike {
        position: absolute; top: 1.2rem; z-index: 5;
        font-size: 1.1rem; font-weight: 700; letter-spacing: .05em;
        padding: .4rem .9rem; border-radius: 8px; border: 3px solid;
        opacity: 0; transition: opacity .1s ease; pointer-events: none;
    }
    .overlay-like    { left: 1.2rem; color: #22c55e; border-color: #22c55e; background: rgba(34,197,94,.12); }
    .overlay-dislike { right: 1.2rem; color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,.12); }
    .overlay-like.visible, .overlay-dislike.visible { opacity: 1; }

    .card { border-radius: 20px; overflow: hidden; box-shadow: 0 12px 50px rgba(26,20,16,.14), 0 4px 16px rgba(217,79,107,.08); background: #fff; user-select: none; -webkit-user-select: none; }

    .card-photo { position: relative; aspect-ratio: 3/4; overflow: hidden; background: linear-gradient(135deg, #F4B8C8, #D94F6B); }
    .card-photo img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; -webkit-user-drag: none; }

    .foto-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .foto-placeholder span { font-family: 'Cormorant Garamond', serif; font-size: 5rem; font-weight: 700; color: rgba(255,255,255,.8); }

    .foto-btn {
        position: absolute; top: 50%; transform: translateY(-50%);
        z-index: 4; background: rgba(0,0,0,.35); border: none; border-radius: 50%;
        width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #fff; opacity: 0; transition: opacity .2s;
    }
    .foto-btn svg { width: 18px; height: 18px; }
    .foto-btn--prev { left: .65rem; }
    .foto-btn--next { right: .65rem; }
    .foto-btn:disabled { opacity: 0 !important; pointer-events: none; }
    .card-photo:hover .foto-btn:not(:disabled) { opacity: 1; }

    .photo-bars { position: absolute; top: .65rem; left: .65rem; right: .65rem; display: flex; gap: 3px; z-index: 4; }
    .photo-bar  { flex: 1; height: 3px; border-radius: 99px; background: rgba(255,255,255,.3); overflow: hidden; }
    .photo-bar-fill { height: 100%; width: 0; border-radius: 99px; background: #fff; transition: width .2s ease; }
    .photo-bar-fill.full   { width: 100%; }
    .photo-bar-fill.active { width: 100%; opacity: .85; }

    .foto-counter { position: absolute; top: .7rem; right: .7rem; z-index: 5; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); color: #fff; font-size: .65rem; font-weight: 600; padding: .2rem .55rem; border-radius: 20px; display: none; }
    @media (hover: none) { .foto-counter { display: block; } .photo-bars { display: none; } }

    .photo-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 65%; background: linear-gradient(to top, rgba(10,6,4,.88) 0%, transparent 100%); }

    .card-info-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem 1.1rem 1rem; }
    .card-name   { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; font-weight: 700; color: #fff; letter-spacing: -.01em; margin-bottom: .2rem; }
    .card-course { font-size: .78rem; color: rgba(255,255,255,.7); margin-bottom: .55rem; }
    .card-tags   { display: flex; flex-wrap: wrap; gap: .35rem; }
    .card-tag    { font-size: .67rem; padding: .22rem .65rem; border-radius: 20px; background: rgba(255,255,255,.15); backdrop-filter: blur(4px); color: #fff; border: 1px solid rgba(255,255,255,.25); transition: background .2s; }
    /* Tag em comum com filtro = destaque */
    .card-tag--match { background: var(--rose, #D94F6B); border-color: var(--rose, #D94F6B); }

    .card-desc { padding: .85rem 1.1rem; font-size: .82rem; color: var(--muted, #8A7F79); line-height: 1.55; border-top: 1px solid rgba(138,127,121,.1); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .foto-hint  { font-size: .67rem; color: rgba(138,127,121,.5); letter-spacing: .02em; margin-top: -.25rem; }
    .swipe-hint { font-size: .68rem; color: rgba(138,127,121,.45); letter-spacing: .03em; }
    @media (hover: hover) { .foto-hint { display: none; } }

    .action-row { display: flex; gap: 1.5rem; align-items: center; }
    .action-btn { border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .15s, box-shadow .2s; -webkit-tap-highlight-color: transparent; }
    .action-btn:hover  { transform: scale(1.1); }
    .action-btn:active { transform: scale(.93); }
    .action-btn svg { width: 26px; height: 26px; display: block; }

    .action-dislike { width: 60px; height: 60px; background: #fff; color: #ef4444; box-shadow: 0 4px 18px rgba(239,68,68,.2); border: 1.5px solid rgba(239,68,68,.15); }
    .action-dislike:hover { box-shadow: 0 6px 24px rgba(239,68,68,.3); }
    .action-like    { width: 70px; height: 70px; background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F); color: #fff; box-shadow: 0 6px 24px rgba(217,79,107,.4); }
    .action-like:hover { box-shadow: 0 8px 30px rgba(217,79,107,.55); }
</style>