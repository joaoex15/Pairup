<!-- src/routes/matches/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        apiGetMyProfile, apiGetMyMatches, apiGetPessoa,
        apiGetMatchRedesSociais, apiDesfazerMatch,
        apiGetLikesDados, resolveImageUrl,
        type PessoaPerfilDTO, type PessoaRedesSociaisDTO
    } from '$lib/services/api';
    import { handleApiError } from '$lib/utils/errorUtils';
    import Alert        from '$lib/components/ui/Alert.svelte';
    import AppHeader    from '$lib/components/ui/AppHeader.svelte';
    import Button       from '$lib/components/ui/Button.svelte';
    import EmptyState   from '$lib/components/ui/EmptyState.svelte';
    import LoadingState from '$lib/components/ui/LoadingState.svelte';
    import LikeCard     from '$lib/components/matches/LikeCard.svelte';
    import MatchCard    from '$lib/components/matches/MatchCard.svelte';
    import MatchesTabs  from '$lib/components/matches/MatchesTabs.svelte';
    import type { LikeView, MatchView } from '$lib/components/matches/types';

    let activeTab: 'matches' | 'likes' = 'matches';
    let matches:    MatchView[] = [];
    let likesDados: LikeView[]  = [];
    let loading    = true;
    let globalError = '';
    let actionError = '';
    let matchCount = 0;
    let likeCount  = 0;
    let minhaPessoaId = '';

    onMount(async () => {
        loading = true;
        globalError = '';
        try {
            const meRes = await apiGetMyProfile();
            if (!meRes.data) {
                globalError = 'Perfil não encontrado. Complete seu cadastro.';
                loading = false;
                return;
            }
            minhaPessoaId = meRes.data.id;

            const matchRes = await apiGetMyMatches(0, 50);
            if (matchRes.data) {
                const ativos = (matchRes.data.content ?? []).filter(m => m.ativo);
                matchCount = ativos.length;
                matches = await Promise.all(
                    ativos.map(async m => {
                        const outroId = m.pessoaId1 === minhaPessoaId ? m.pessoaId2 : m.pessoaId1;
                        const [pesRes, redesRes] = await Promise.all([
                            apiGetPessoa(outroId),
                            apiGetMatchRedesSociais(m.id),
                        ]);
                        const pessoa: PessoaPerfilDTO | undefined = pesRes.data;
                        const redes:  PessoaRedesSociaisDTO | undefined = redesRes.data;
                        return {
                            matchId:   m.id,
                            pessoaId:  outroId,
                            nome:      pessoa?.nome  ?? 'Pessoa',
                            curso:     pessoa?.curso ?? '',
                            fotoUrl:   resolveImageUrl(pessoa?.fotoPerfilUrl),
                            instagram: redes?.instagram ?? '',
                            whatsapp:  redes?.whatsapp  ?? '',
                            telegram:  redes?.telegram  ?? '',
                        };
                    })
                );
            }

            const likesRes = await apiGetLikesDados(0, 50);
            if (likesRes.data) {
                const ativos = (likesRes.data.content ?? []).filter(l => l.ativo);
                likeCount = ativos.length;
                likesDados = await Promise.all(
                    ativos.map(async l => {
                        const pesRes = await apiGetPessoa(l.pessoaDestinoId);
                        const pessoa: PessoaPerfilDTO | undefined = pesRes.data;
                        return {
                            likeId:   l.id,
                            pessoaId: l.pessoaDestinoId,
                            nome:     pessoa?.nome  ?? 'Pessoa',
                            curso:    pessoa?.curso ?? '',
                            fotoUrl:  resolveImageUrl(pessoa?.fotoPerfilUrl),
                        };
                    })
                );
            }
        } catch (e) {
            globalError = handleApiError(e);
        } finally {
            loading = false;
        }
    });

    const desfazerMatch = async (matchId: string) => {
        actionError = '';
        const res = await apiDesfazerMatch(matchId);
        if (res.error) {
            // Não troca a lista inteira pela tela de erro: o resto continua utilizável
            actionError = handleApiError(res.error);
        } else {
            matches    = matches.filter(m => m.matchId !== matchId);
            matchCount = matches.length;
        }
    };
</script>

<div class="page">
    <AppHeader backHref="/home" />

    <MatchesTabs bind:active={activeTab} {matchCount} {likeCount} />

    <main class="main">
        {#if loading}
            <LoadingState />

        {:else if globalError}
            <EmptyState icon="⚠️" message={globalError}>
                <Button on:click={() => goto('/profile')}>Completar perfil</Button>
            </EmptyState>

        {:else if activeTab === 'matches'}
            {#if actionError}<Alert>{actionError}</Alert>{/if}
            {#if matches.length === 0}
                <EmptyState icon="💙" title="Nenhum match ainda" message="Continue dando likes para encontrar sua conexão.">
                    <Button on:click={() => goto('/home')}>Explorar pessoas</Button>
                </EmptyState>
            {:else}
                <div class="match-list">
                    {#each matches as match (match.matchId)}
                        <MatchCard {match} onDesfazer={desfazerMatch} />
                    {/each}
                </div>
            {/if}

        {:else}
            {#if likesDados.length === 0}
                <EmptyState icon="💫" title="Nenhum like dado ainda" message="As pessoas que você curtiu aparecerão aqui.">
                    <Button on:click={() => goto('/home')}>Explorar pessoas</Button>
                </EmptyState>
            {:else}
                <div class="likes-grid">
                    {#each likesDados as like (like.likeId)}
                        <LikeCard {like} />
                    {/each}
                </div>
            {/if}
        {/if}
    </main>
</div>

<style>
    .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
    .main { flex: 1; padding: 1.25rem 1rem 2rem; max-width: 480px; margin: 0 auto; width: 100%; }
    .match-list { display: flex; flex-direction: column; gap: .85rem; }
    .likes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
</style>
