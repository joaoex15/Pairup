<!-- src/routes/matches/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        apiGetMyProfile, apiGetMyMatches, apiGetPessoa,
        apiGetMatchRedesSociais, apiDesfazerMatch,
        apiGetLikesDados,
        type PessoaResponse, type RedesSociaisResponse
    } from '$lib/services/api';
    import { handleApiError } from '$lib/utils/errorUtils';

    interface MatchView {
        matchId:   string;
        pessoaId:  string;
        nome:      string;
        curso:     string;
        fotoUrl:   string;
        instagram: string;
        whatsapp:  string;
        telegram:  string;
    }

    interface LikeView {
        likeId:   string;
        pessoaId: string;
        nome:     string;
        curso:    string;
        fotoUrl:  string;
    }

    let activeTab: 'matches' | 'likes' = 'matches';
    let matches:    MatchView[] = [];
    let likesDados: LikeView[]  = [];
    let loading    = true;
    let globalError = '';
    let matchCount = 0;
    let likeCount  = 0;
    let minhaPessoaId = '';

    const fotoUrl = (_pessoaId: string): string => '';

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
                        const pessoa: PessoaResponse | undefined = pesRes.data;
                        const redes:  RedesSociaisResponse | undefined = redesRes.data;
                        return {
                            matchId:   m.id,
                            pessoaId:  outroId,
                            nome:      pessoa?.nome  ?? 'Pessoa',
                            curso:     pessoa?.curso ?? '',
                            fotoUrl:   fotoUrl(outroId),
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
                        const pessoa = pesRes.data;
                        return {
                            likeId:   l.id,
                            pessoaId: l.pessoaDestinoId,
                            nome:     pessoa?.nome  ?? 'Pessoa',
                            curso:    pessoa?.curso ?? '',
                            fotoUrl:  fotoUrl(l.pessoaDestinoId),
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
        const res = await apiDesfazerMatch(matchId);
        if (!res.error) {
            matches    = matches.filter(m => m.matchId !== matchId);
            matchCount = matches.length;
        }
    };
</script>

<div class="page">
    <header class="header">
        <button class="back-btn" on:click={() => goto('/home')} aria-label="Voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
        </button>
        <div class="header-logo">
            <span class="header-icon">🎓</span>
            <span class="header-brand">UNeSe</span>
        </div>
        <div style="width:36px"></div>
    </header>

    <div class="tabs-bar">
        <button class="tab" class:active={activeTab === 'matches'} on:click={() => activeTab = 'matches'}>
            <svg viewBox="0 0 24 24" fill={activeTab==='matches'?'currentColor':'none'} stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Matches <span class="tab-count">{matchCount}</span>
        </button>
        <button class="tab" class:active={activeTab === 'likes'} on:click={() => activeTab = 'likes'}>
            <svg viewBox="0 0 24 24" fill={activeTab==='likes'?'currentColor':'none'} stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Likes dados <span class="tab-count">{likeCount}</span>
        </button>
    </div>

    <main class="main">
        {#if loading}
            <div class="loading-wrap">
                <div class="loading-ring"></div>
                <p class="loading-text">Carregando...</p>
            </div>

        {:else if globalError}
            <div class="error-state">
                <div class="empty-icon">⚠️</div>
                <p class="empty-sub">{globalError}</p>
                <button class="btn-primary" on:click={() => goto('/profile')}>Completar perfil</button>
            </div>

        {:else if activeTab === 'matches'}
            {#if matches.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">💙</div>
                    <h2 class="empty-title">Nenhum match ainda</h2>
                    <p class="empty-sub">Continue dando likes para encontrar sua conexão.</p>
                    <button class="btn-primary" on:click={() => goto('/home')}>Explorar pessoas</button>
                </div>
            {:else}
                <div class="match-list">
                    {#each matches as match (match.matchId)}
                        <div class="match-card">
                            <div class="match-top">
                                <div class="match-avatar">
                                    {#if match.fotoUrl}
                                        <img src={match.fotoUrl} alt={match.nome} />
                                    {:else}
                                        <span class="avatar-initial">{match.nome.charAt(0).toUpperCase()}</span>
                                    {/if}
                                </div>
                                <div class="match-info">
                                    <h3 class="match-name">{match.nome}</h3>
                                    {#if match.curso}<p class="match-meta">{match.curso}</p>{/if}
                                </div>
                                <button class="unmatch-btn" on:click={() => desfazerMatch(match.matchId)} aria-label="Desfazer match">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>

                            {#if match.instagram || match.whatsapp || match.telegram}
                                <div class="contact-row">
                                    {#if match.instagram}
                                        <a href={`https://instagram.com/${match.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" class="contact-btn contact-ig">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                            {match.instagram}
                                        </a>
                                    {/if}
                                    {#if match.whatsapp}
                                        <a href={`https://wa.me/55${match.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" class="contact-btn contact-wa">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WhatsApp
                                        </a>
                                    {/if}
                                    {#if match.telegram}
                                        <a href={`https://t.me/${match.telegram.replace('@','')}`} target="_blank" rel="noopener noreferrer" class="contact-btn contact-tg">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                            {match.telegram}
                                        </a>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}

        {:else}
            {#if likesDados.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">💫</div>
                    <h2 class="empty-title">Nenhum like dado ainda</h2>
                    <p class="empty-sub">As pessoas que você curtiu aparecerão aqui.</p>
                    <button class="btn-primary" on:click={() => goto('/home')}>Explorar pessoas</button>
                </div>
            {:else}
                <div class="likes-grid">
                    {#each likesDados as like (like.likeId)}
                        <div class="like-card">
                            <div class="like-photo">
                                {#if like.fotoUrl}
                                    <img src={like.fotoUrl} alt={like.nome} />
                                {:else}
                                    <div class="like-placeholder"><span>{like.nome.charAt(0).toUpperCase()}</span></div>
                                {/if}
                                <div class="like-badge">💙 Like</div>
                            </div>
                            <div class="like-info">
                                <p class="like-name">{like.nome}</p>
                                {#if like.curso}<p class="like-meta">{like.curso}</p>{/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </main>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    :global(body){background:var(--bg,#F4F6FB);font-family:'Plus Jakarta Sans',sans-serif;}
    .page{min-height:100vh;display:flex;flex-direction:column;background:var(--bg,#F4F6FB);}
    .header{display:flex;justify-content:space-between;align-items:center;padding:.9rem 1.25rem;background:rgba(244,246,251,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border,rgba(79,70,229,.15));position:sticky;top:0;z-index:10;}
    .back-btn{background:none;border:none;cursor:pointer;color:var(--muted,#64748B);padding:.3rem;transition:color .2s;border-radius:8px;}
    .back-btn:hover{color:var(--primary,#4F46E5);}
    .back-btn svg{width:22px;height:22px;display:block;}
    .header-logo{display:flex;align-items:center;gap:.4rem;}
    .header-icon{font-size:1.2rem;animation:pk 3s ease-in-out infinite;}
    @keyframes pk{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
    .header-brand{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.4rem;font-weight:800;color:var(--ink,#0F1624);letter-spacing:-.03em;}
    .tabs-bar{display:flex;background:#fff;border-bottom:1px solid rgba(100,116,139,.12);position:sticky;top:57px;z-index:9;}
    .tab{flex:1;display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.85rem .5rem;border:none;background:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:.82rem;font-weight:500;color:var(--muted,#64748B);border-bottom:2px solid transparent;transition:color .2s,border-color .2s;}
    .tab svg{width:16px;height:16px;flex-shrink:0;}
    .tab.active{color:var(--primary,#4F46E5);border-bottom-color:var(--primary,#4F46E5);}
    .tab-count{background:rgba(79,70,229,.12);color:var(--primary,#4F46E5);font-size:.65rem;font-weight:600;padding:.15rem .45rem;border-radius:20px;min-width:20px;text-align:center;}
    .tab.active .tab-count{background:var(--primary,#4F46E5);color:#fff;}
    .main{flex:1;padding:1.25rem 1rem 2rem;max-width:480px;margin:0 auto;width:100%;}
    .loading-wrap{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:4rem 0;}
    .loading-ring{width:40px;height:40px;border:3px solid rgba(79,70,229,.15);border-top-color:var(--primary,#4F46E5);border-radius:50%;animation:spin .8s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .loading-text{font-size:.8rem;color:var(--muted,#64748B);}
    .empty-state,.error-state{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:4rem 1rem;text-align:center;}
    .empty-icon{font-size:2.8rem;}
    .empty-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.3rem;font-weight:700;color:var(--ink,#0F1624);}
    .empty-sub{font-size:.8rem;color:var(--muted,#64748B);max-width:220px;}
    .btn-primary{margin-top:.5rem;padding:.7rem 1.6rem;border:none;border-radius:12px;background:linear-gradient(135deg,var(--primary,#4F46E5),var(--accent,#7C3AED));color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(79,70,229,.3);transition:opacity .2s;}
    .btn-primary:hover{opacity:.88;}
    .match-list{display:flex;flex-direction:column;gap:.85rem;}
    .match-card{background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border:1px solid var(--border,rgba(79,70,229,.15));border-radius:16px;box-shadow:0 2px 14px rgba(15,22,36,.05);overflow:hidden;animation:fade-up .3s ease both;}
    @keyframes fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .match-top{display:flex;align-items:center;gap:.85rem;padding:.9rem 1rem;}
    .match-avatar{width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2px solid var(--primary,#4F46E5);background:linear-gradient(135deg,#818CF8,#4F46E5);display:flex;align-items:center;justify-content:center;}
    .match-avatar img{width:100%;height:100%;object-fit:cover;}
    .avatar-initial{font-family:'Plus Jakarta Sans',sans-serif;font-size:1.3rem;font-weight:800;color:#fff;}
    .match-info{flex:1;min-width:0;}
    .match-name{font-size:.92rem;font-weight:600;color:var(--ink,#0F1624);}
    .match-meta{font-size:.72rem;color:var(--muted,#64748B);margin-top:.1rem;}
    .unmatch-btn{background:none;border:none;cursor:pointer;color:rgba(100,116,139,.4);padding:.3rem;border-radius:8px;transition:color .2s,background .2s;flex-shrink:0;}
    .unmatch-btn:hover{color:#ef4444;background:rgba(239,68,68,.06);}
    .unmatch-btn svg{width:16px;height:16px;display:block;}
    .contact-row{display:flex;flex-wrap:wrap;gap:.45rem;padding:.65rem 1rem .85rem;border-top:1px solid rgba(100,116,139,.08);}
    .contact-btn{display:inline-flex;align-items:center;gap:.35rem;padding:.32rem .85rem;border-radius:20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:500;text-decoration:none;transition:opacity .2s,transform .15s;}
    .contact-btn:hover{opacity:.88;transform:translateY(-1px);}
    .contact-btn svg{width:12px;height:12px;flex-shrink:0;}
    .contact-ig{background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;}
    .contact-wa{background:#25D366;color:#fff;}
    .contact-tg{background:#0088cc;color:#fff;}
    .likes-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;}
    .like-card{background:rgba(255,255,255,.9);border:1px solid var(--border,rgba(79,70,229,.15));border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(15,22,36,.05);animation:fade-up .3s ease both;}
    .like-photo{position:relative;aspect-ratio:1;background:linear-gradient(135deg,#818CF8,#4F46E5);}
    .like-photo img{width:100%;height:100%;object-fit:cover;display:block;}
    .like-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
    .like-placeholder span{font-family:'Plus Jakarta Sans',sans-serif;font-size:2.5rem;font-weight:800;color:rgba(255,255,255,.8);}
    .like-badge{position:absolute;top:.6rem;right:.6rem;background:var(--primary,#4F46E5);color:#fff;font-size:.62rem;font-weight:600;padding:.2rem .55rem;border-radius:20px;}
    .like-info{padding:.65rem .75rem;}
    .like-name{font-size:.82rem;font-weight:600;color:var(--ink,#0F1624);}
    .like-meta{font-size:.7rem;color:var(--muted,#64748B);margin-top:.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
</style>