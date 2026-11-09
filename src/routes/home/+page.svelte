<!-- src/routes/home/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import {
        apiGetPessoas, apiGetMyProfile, apiGetMyMatches,
        apiDarLike, apiGetTagsAtivas, apiGetLikesDados, apiGetLikesRecebidos,
        type PessoaPerfilDTO, type TagResponse
    } from '$lib/services/api';
    import { perfilPendente, compativeis, fotosParaPessoa, type PessoaView } from '$lib/utils/pessoa';
    import AppHeader     from '$lib/components/ui/AppHeader.svelte';
    import Button        from '$lib/components/ui/Button.svelte';
    import EmptyState    from '$lib/components/ui/EmptyState.svelte';
    import HeaderButton  from '$lib/components/ui/HeaderButton.svelte';
    import Icon          from '$lib/components/ui/Icon.svelte';
    import LoadingState  from '$lib/components/ui/LoadingState.svelte';
    import FiltrosAtivos from '$lib/components/home/FiltrosAtivos.svelte';
    import FiltrosPanel  from '$lib/components/home/FiltrosPanel.svelte';
    import MatchAviso    from '$lib/components/home/MatchAviso.svelte';
    import PessoaCard    from '$lib/components/home/PessoaCard.svelte';
    import SwipeActions  from '$lib/components/home/SwipeActions.svelte';

    let todasPessoas: PessoaView[] = [];
    let pessoas:       PessoaView[] = [];
    let currentIndex  = 0;
    let loading       = true;
    let swipeDir: 'like' | 'dislike' | '' = '';
    let matchCount    = 0;
    let matchComNome  = '';
    let minhaPessoaId = '';
    let minhaPessoa:  PessoaPerfilDTO | null = null;
    let avaliadosIds  = new Set<string>();

    // Sets para filtrar pessoas já interagidas
    let matchedIds   = new Set<string>();
    let likedByIds   = new Set<string>();
    // Quem já me curtiu NÃO sai do deck (senão o match recíproco nunca acontece);
    // só é usado para mostrar essas pessoas primeiro.
    let likedMeIds   = new Set<string>();

    let showFilters    = false;
    let filtroTags:    TagResponse[] = [];
    let availableTags: TagResponse[] = [];
    let tagsLoading    = true;

    const temTagEmComum = (p: PessoaView): boolean => {
        if (filtroTags.length === 0) return true;
        // PessoaPerfilDTO.tags traz os NOMES das tags
        const nomes = (p.tags ?? []);
        return filtroTags.some(ft => nomes.includes(ft.nome));
    };

    const jaTeveInteracao = (pessoaId: string): boolean => {
        return matchedIds.has(pessoaId) || likedByIds.has(pessoaId);
    };

    const aplicarFiltros = () => {
        pessoas = todasPessoas
            .filter(p =>
                !avaliadosIds.has(p.id) &&
                !jaTeveInteracao(p.id) &&
                (!minhaPessoa || compativeis(minhaPessoa, p)) &&
                temTagEmComum(p)
            )
            .sort((a, b) => Number(likedMeIds.has(b.id)) - Number(likedMeIds.has(a.id)));
        currentIndex = pessoas.length > 0 ? 0 : -1;
        showFilters  = false;
    };

    const aplicarSelecao = (tags: TagResponse[]) => { filtroTags = tags; aplicarFiltros(); };
    const limparFiltros  = () => aplicarSelecao([]);

    $: filtroAtivo     = filtroTags.length > 0;
    let carregado = false;
    let erroCarregamento = false;

    onMount(() => {
        const unsub = authStore.subscribe(async state => {
            if (state.isLoading) return;

            if (!state.isAuthenticated) {
                await goto('/');
                return;
            }

            // A store pode emitir de novo — carrega só uma vez
            if (carregado) return;
            carregado = true;

            try {
                const meRes = await apiGetMyProfile();
                if (meRes.status === 401) return;
                // Login Google cria uma Pessoa mínima: existe, mas sem gênero/interesse/termos
                if (perfilPendente(meRes)) {
                    await goto('/onboarding');
                    return;
                }
                if (!meRes.data) throw new Error(meRes.error);
                minhaPessoaId = meRes.data.id;
                minhaPessoa   = meRes.data;
            } catch {
                erroCarregamento = true;
                loading = false;
                return;
            }

            const [tagsRes, matchRes, likesDadosRes, likesRecebidosRes, pesRes] = await Promise.all([
                apiGetTagsAtivas(),
                apiGetMyMatches(0, 100),
                apiGetLikesDados(0, 100),
                apiGetLikesRecebidos(0, 100),
                apiGetPessoas({ size: 100 }),
            ]);

            if (tagsRes.data) availableTags = tagsRes.data;
            tagsLoading = false;

            if (matchRes.data) {
                matchCount = matchRes.data.totalElements;
                const matches = matchRes.data.content ?? [];
                for (const m of matches) {
                    const outroId = m.pessoaId1 === minhaPessoaId ? m.pessoaId2 : m.pessoaId1;
                    matchedIds.add(outroId);
                }
            }

            if (likesDadosRes.data) {
                const likesDados = likesDadosRes.data.content ?? [];
                for (const l of likesDados) {
                    if (l.ativo) likedByIds.add(l.pessoaDestinoId);
                }
            }

            if (likesRecebidosRes.data) {
                const likesRecebidos = likesRecebidosRes.data.content ?? [];
                for (const l of likesRecebidos) {
                    if (l.ativo) likedMeIds.add(l.pessoaOrigemId);
                }
            }

            if (pesRes.data) {
                todasPessoas = (pesRes.data.content ?? [])
                    .filter(p => p.id !== minhaPessoaId)
                    .map(p => ({
                        ...p,
                        tagObjs: availableTags.filter(t => (p.tags ?? []).includes(t.nome)),
                        fotos:   fotosParaPessoa(p),
                        idade:   p.idade ?? 0,
                    }));
                aplicarFiltros();
            } else {
                currentIndex = -1;
            }

            loading = false;
        });
        return unsub;
    });

    $: pessoaAtual = currentIndex >= 0 ? (pessoas[currentIndex] ?? null) : null;

    const avancar = () => {
        setTimeout(() => {
            swipeDir = '';
            if (pessoaAtual) pessoas = pessoas.filter(p => p.id !== pessoaAtual!.id);
            currentIndex = pessoas.length > 0 ? 0 : -1;
        }, 320);
    };

    const like = async () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'like';
        const curtida = pessoaAtual;
        avaliadosIds.add(pessoaAtual.id);
        likedByIds.add(pessoaAtual.id);
        
        try {
            const res = await apiDarLike(pessoaAtual.id);
            if (res.error) console.warn('[like]', res.error);
            if (res.data?.match) {
                matchCount++;
                matchedIds.add(curtida.id);
                matchComNome = curtida.nome;
            }
        } catch (e) { 
            console.error('[like]', e); 
        }
        avancar();
    };

    const dislike = () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'dislike';
        avaliadosIds.add(pessoaAtual.id);
        avancar();
    };

    const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') showFilters = false;
    };
</script>

<svelte:window on:keydown={onKeydown} />

<div class="page">
    <AppHeader>
        <HeaderButton
            label="Filtros{filtroAtivo ? ` (${filtroTags.length} ativo${filtroTags.length > 1 ? 's' : ''})` : ''}"
            active={filtroAtivo}
            expanded={showFilters}
            badge={filtroAtivo ? filtroTags.length : null}
            badgeTone="warning"
            on:click={() => showFilters = !showFilters}
        >
            <Icon name="filter" />
        </HeaderButton>
        <HeaderButton
            label="Matches{matchCount > 0 ? ` (${matchCount})` : ''}"
            badge={matchCount > 0 ? matchCount : null}
            on:click={() => goto('/matches')}
        >
            <Icon name="heart" />
        </HeaderButton>
        <HeaderButton label="Meu perfil" on:click={() => goto('/profile')}>
            <Icon name="user" />
        </HeaderButton>
    </AppHeader>

    {#if showFilters}
        <FiltrosPanel
            tags={availableTags}
            selecionadas={filtroTags}
            loading={tagsLoading}
            compatibilidadeAtiva={!!(minhaPessoa?.genero && minhaPessoa?.interesse)}
            onAplicar={aplicarSelecao}
            onLimpar={limparFiltros}
            onFechar={() => showFilters = false}
        />
    {/if}

    <main class="main">
        {#if loading}
            <LoadingState text="Encontrando pessoas..." />

        {:else if erroCarregamento}
            <EmptyState icon="⚠️" title="Não foi possível carregar" message="Verifique sua conexão e tente de novo.">
                <Button on:click={() => window.location.reload()}>Tentar de novo</Button>
            </EmptyState>

        {:else if currentIndex === -1 || !pessoaAtual}
            <EmptyState
                icon="🎓"
                title={filtroAtivo ? 'Nenhuma pessoa com esses interesses' : 'Você viu todo mundo!'}
                message={filtroAtivo ? 'Tente remover alguns filtros.' : 'Novas pessoas aparecem todo dia.'}
            >
                {#if filtroAtivo}
                    <Button on:click={limparFiltros}>Limpar filtros</Button>
                {:else}
                    <Button on:click={() => window.location.reload()}>Recarregar</Button>
                {/if}
            </EmptyState>

        {:else}
            {#if filtroAtivo}
                <FiltrosAtivos nomes={filtroTags.map(t => t.nome)} onLimpar={limparFiltros} />
            {/if}

            {#key pessoaAtual.id}
                <PessoaCard
                    pessoa={pessoaAtual}
                    {swipeDir}
                    atalhos={!showFilters && !matchComNome}
                    tagsDestacadas={filtroTags.map(t => t.id)}
                    onLike={like}
                    onDislike={dislike}
                />
            {/key}

            <SwipeActions nome={pessoaAtual.nome} onLike={like} onDislike={dislike} />

            <p class="swipe-hint" aria-hidden="true">← arraste o card ou use as setas →</p>
        {/if}
    </main>

    {#if matchComNome}
        <MatchAviso
            nome={matchComNome}
            onVerMatches={() => goto('/matches')}
            onFechar={() => matchComNome = ''}
        />
    {/if}
</div>

<style>
    .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
    .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.25rem 1rem 1.5rem; gap: 1rem; }
    .swipe-hint { font-size: .68rem; color: rgba(100,116,139,.45); letter-spacing: .03em; }
</style>
