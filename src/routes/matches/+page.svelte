<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    interface Match {
        id: string;
        nome: string;
        idade: number;
        curso: string;
        periodo: string;
        foto: string;
        instagram?: string;
        whatsapp?: string;
        telegram?: string;
        matchDate: string;
    }

    interface Like {
        id: string;
        nome: string;
        idade: number;
        curso: string;
        periodo: string;
        foto: string;
    }

    let activeTab: 'matches' | 'likes' = 'matches';
    let matches: Match[] = [];
    let likesPendentes: Like[] = [];
    let loading = true;

    const API = 'http://localhost:8080';
    const MEU_ID = 'MEU_ID'; // TODO: substituir pelo ID do usuário logado

    onMount(async () => {
        try {
            const [matchRes, likesRes] = await Promise.all([
                fetch(`${API}/matches/${MEU_ID}`),
                fetch(`${API}/likes/recebidos/${MEU_ID}`)
            ]);
            if (matchRes.ok)  matches        = await matchRes.json();
            if (likesRes.ok)  likesPendentes = await likesRes.json();
        } catch {
            // fallback mock
            matches = [
                { id: '1', nome: 'Ana Silva', idade: 23, curso: 'Medicina', periodo: '8° período',
                  foto: 'https://randomuser.me/api/portraits/women/44.jpg',
                  instagram: '@ana_silva', whatsapp: '(79) 99999-9999', telegram: '@ana_silva', matchDate: '2 dias atrás' },
                { id: '2', nome: 'Mariana Costa', idade: 22, curso: 'Direito', periodo: '6° período',
                  foto: 'https://randomuser.me/api/portraits/women/63.jpg',
                  instagram: '@mariana_costa', matchDate: '5 dias atrás' }
            ];
            likesPendentes = [
                { id: '3', nome: 'Pedro Lima', idade: 26, curso: 'Arquitetura', periodo: '8° período',
                  foto: 'https://randomuser.me/api/portraits/men/52.jpg' }
            ];
        } finally {
            loading = false;
        }
    });

    const desfazerMatch = async (matchId: string) => {
        try {
            await fetch(`${API}/matches/desfazer/${matchId}`, { method: 'PUT' });
            matches = matches.filter(m => m.id !== matchId);
        } catch { /* ignora */ }
    };
</script>

<div class="page">
    <!-- Header -->
    <header class="header">
        <button class="back-btn" on:click={() => goto('/home')} aria-label="Voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="header-logo">
            <span class="header-star">✦</span>
            <span class="header-brand">PairUp</span>
        </div>
        <div style="width: 36px"></div><!-- spacer -->
    </header>

    <!-- Tabs -->
    <div class="tabs-bar">
        <button
            class="tab" class:active={activeTab === 'matches'}
            on:click={() => activeTab = 'matches'}
        >
            <svg viewBox="0 0 24 24" fill={activeTab === 'matches' ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            Matches
            <span class="tab-count">{matches.length}</span>
        </button>
        <button
            class="tab" class:active={activeTab === 'likes'}
            on:click={() => activeTab = 'likes'}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            Likes recebidos
            <span class="tab-count">{likesPendentes.length}</span>
        </button>
    </div>

    <main class="main">
        {#if loading}
            <div class="loading-wrap">
                <div class="loading-ring"></div>
                <p class="loading-text">Carregando...</p>
            </div>

        {:else if activeTab === 'matches'}
            {#if matches.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">💘</div>
                    <h2 class="empty-title">Nenhum match ainda</h2>
                    <p class="empty-sub">Continue dando likes para encontrar sua conexão.</p>
                    <button class="btn-primary" on:click={() => goto('/home')}>Explorar pessoas</button>
                </div>
            {:else}
                <div class="match-list">
                    {#each matches as match (match.id)}
                        <div class="match-card">
                            <!-- Avatar + info -->
                            <div class="match-top">
                                <div class="match-avatar">
                                    <img src={match.foto} alt={match.nome} />
                                </div>
                                <div class="match-info">
                                    <h3 class="match-name">{match.nome}, {match.idade}</h3>
                                    <p class="match-meta">{match.curso} · {match.periodo}</p>
                                    <p class="match-date">Match {match.matchDate}</p>
                                </div>
                                <button
                                    class="unmatch-btn"
                                    on:click={() => desfazerMatch(match.id)}
                                    aria-label="Desfazer match"
                                    title="Desfazer match"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>

                            <!-- Contatos -->
                            {#if match.instagram || match.whatsapp || match.telegram}
                                <div class="contact-row">
                                    {#if match.instagram}
                                        <a
                                            href="https://instagram.com/{match.instagram.replace('@','')}"
                                            target="_blank" rel="noopener noreferrer"
                                            class="contact-btn contact-ig"
                                            aria-label="Instagram de {match.nome}"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                            {match.instagram}
                                        </a>
                                    {/if}
                                    {#if match.whatsapp}
                                        <a
                                            href="https://wa.me/55{match.whatsapp.replace(/\D/g,'')}"
                                            target="_blank" rel="noopener noreferrer"
                                            class="contact-btn contact-wa"
                                            aria-label="WhatsApp de {match.nome}"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WhatsApp
                                        </a>
                                    {/if}
                                    {#if match.telegram}
                                        <a
                                            href="https://t.me/{match.telegram.replace('@','')}"
                                            target="_blank" rel="noopener noreferrer"
                                            class="contact-btn contact-tg"
                                            aria-label="Telegram de {match.nome}"
                                        >
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
            {#if likesPendentes.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">⭐</div>
                    <h2 class="empty-title">Nenhum like recebido</h2>
                    <p class="empty-sub">Quando alguém curtir seu perfil, aparecerá aqui.</p>
                </div>
            {:else}
                <div class="likes-grid">
                    {#each likesPendentes as like (like.id)}
                        <div class="like-card">
                            <div class="like-photo">
                                <img src={like.foto} alt={like.nome} />
                                <div class="like-badge">❤️ Like</div>
                            </div>
                            <div class="like-info">
                                <p class="like-name">{like.nome}, {like.idade}</p>
                                <p class="like-meta">{like.curso}</p>
                                <p class="like-period">{like.periodo}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
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
        padding: .9rem 1.25rem;
        background: rgba(250,247,242,0.9); backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border, rgba(201,169,110,.22));
        position: sticky; top: 0; z-index: 10;
    }
    .back-btn {
        background: none; border: none; cursor: pointer;
        color: var(--muted, #8A7F79); padding: .3rem;
        transition: color .2s; border-radius: 8px;
    }
    .back-btn:hover { color: var(--rose, #D94F6B); }
    .back-btn svg { width: 22px; height: 22px; display: block; }
    .header-logo { display: flex; align-items: center; gap: .35rem; }
    .header-star { font-size: 1.1rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    @keyframes pk { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    .header-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -.02em; }

    /* ── Tabs ── */
    .tabs-bar {
        display: flex;
        background: #fff; border-bottom: 1px solid rgba(138,127,121,.12);
        position: sticky; top: 57px; z-index: 9;
    }
    .tab {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: .4rem;
        padding: .85rem .5rem; border: none; background: none; cursor: pointer;
        font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 500;
        color: var(--muted, #8A7F79);
        border-bottom: 2px solid transparent;
        transition: color .2s, border-color .2s;
    }
    .tab svg { width: 16px; height: 16px; flex-shrink: 0; }
    .tab.active { color: var(--rose, #D94F6B); border-bottom-color: var(--rose, #D94F6B); }
    .tab-count {
        background: rgba(217,79,107,.12); color: var(--rose, #D94F6B);
        font-size: .65rem; font-weight: 600;
        padding: .15rem .45rem; border-radius: 20px; min-width: 20px; text-align: center;
    }
    .tab.active .tab-count { background: var(--rose, #D94F6B); color: #fff; }

    /* ── Main ── */
    .main { flex: 1; padding: 1.25rem 1rem 2rem; max-width: 480px; margin: 0 auto; width: 100%; }

    /* ── Loading ── */
    .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; }
    .loading-ring {
        width: 40px; height: 40px;
        border: 3px solid rgba(217,79,107,.15); border-top-color: var(--rose, #D94F6B);
        border-radius: 50%; animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: .8rem; color: var(--muted, #8A7F79); }

    /* ── Empty ── */
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 4rem 1rem; text-align: center; }
    .empty-icon  { font-size: 2.8rem; }
    .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 700; color: var(--ink, #1A1410); }
    .empty-sub   { font-size: .8rem; color: var(--muted, #8A7F79); max-width: 220px; }
    .btn-primary {
        margin-top: .5rem; padding: .7rem 1.6rem; border: none; border-radius: 12px;
        background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F); color: #fff;
        font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500;
        cursor: pointer; box-shadow: 0 4px 16px rgba(217,79,107,.3); transition: opacity .2s;
    }
    .btn-primary:hover { opacity: .88; }

    /* ── Match list ── */
    .match-list { display: flex; flex-direction: column; gap: .85rem; }

    .match-card {
        background: rgba(255,255,255,.82); backdrop-filter: blur(10px);
        border: 1px solid var(--border, rgba(201,169,110,.22));
        border-radius: 16px;
        box-shadow: 0 2px 14px rgba(26,20,16,.05);
        overflow: hidden;
        animation: fade-up .3s ease both;
    }
    @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

    .match-top {
        display: flex; align-items: center; gap: .85rem;
        padding: .9rem 1rem;
    }
    .match-avatar {
        width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
        border: 2px solid var(--rose, #D94F6B);
    }
    .match-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .match-info { flex: 1; min-width: 0; }
    .match-name { font-size: .92rem; font-weight: 500; color: var(--ink, #1A1410); }
    .match-meta { font-size: .72rem; color: var(--muted, #8A7F79); margin-top: .1rem; }
    .match-date { font-size: .67rem; color: rgba(138,127,121,.6); margin-top: .2rem; }

    .unmatch-btn {
        background: none; border: none; cursor: pointer;
        color: rgba(138,127,121,.4); padding: .3rem; border-radius: 8px;
        transition: color .2s, background .2s; flex-shrink: 0;
    }
    .unmatch-btn:hover { color: #ef4444; background: rgba(239,68,68,.06); }
    .unmatch-btn svg { width: 16px; height: 16px; display: block; }

    /* Contact row */
    .contact-row {
        display: flex; flex-wrap: wrap; gap: .45rem;
        padding: .65rem 1rem .85rem;
        border-top: 1px solid rgba(138,127,121,.08);
    }
    .contact-btn {
        display: inline-flex; align-items: center; gap: .35rem;
        padding: .32rem .85rem; border-radius: 20px;
        font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 500;
        text-decoration: none; transition: opacity .2s, transform .15s;
    }
    .contact-btn:hover { opacity: .88; transform: translateY(-1px); }
    .contact-btn svg { width: 12px; height: 12px; flex-shrink: 0; }

    .contact-ig { background: linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045); color: #fff; }
    .contact-wa { background: #25D366; color: #fff; }
    .contact-tg { background: #0088cc; color: #fff; }

    /* ── Likes grid ── */
    .likes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .like-card  {
        background: rgba(255,255,255,.82); border: 1px solid var(--border, rgba(201,169,110,.22));
        border-radius: 14px; overflow: hidden;
        box-shadow: 0 2px 12px rgba(26,20,16,.05);
        animation: fade-up .3s ease both;
    }
    .like-photo { position: relative; aspect-ratio: 1; }
    .like-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .like-badge {
        position: absolute; top: .6rem; right: .6rem;
        background: var(--rose, #D94F6B); color: #fff;
        font-size: .62rem; font-weight: 600;
        padding: .2rem .55rem; border-radius: 20px;
    }
    .like-info   { padding: .65rem .75rem; }
    .like-name   { font-size: .82rem; font-weight: 500; color: var(--ink, #1A1410); }
    .like-meta   { font-size: .7rem; color: var(--muted, #8A7F79); margin-top: .1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .like-period { font-size: .67rem; color: rgba(138,127,121,.6); margin-top: .1rem; }
</style>