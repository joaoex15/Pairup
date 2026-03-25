<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import InputField from '$lib/components/login/InputField.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';

    type Genero      = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    type Sexualidade = 'HETERO' | 'GAY' | 'BI' | 'PAN' | 'ASSEXUAL' | 'OUTRO';

    interface ApiTag  { id: string; nome: string; categoria?: string; }
    interface Foto    { id: string; url: string; file?: File; principal: boolean; }

    const API = 'http://localhost:8080';

    const storedUser = browser ? JSON.parse(localStorage.getItem('user') ?? 'null') : null;
    const MEU_USER_ID: string = storedUser?.id ?? '';

    let loading = true;
    let saving  = false;
    let saveSuccess = false;
    let showLogoutConfirm = false;
    let globalError = '';
    let errors: Record<string, string> = {};

    let pessoaId = '';

    let formData = {
        nome: '',
        curso: '',
        dataNasc: '',
        email: '',
        genero: '' as Genero | '',
        sexualidade: '' as Sexualidade | '',
        descricao: '',
        instagram: '',
        whatsapp: '',
        telegram: '',
    };

    let fotos: Foto[] = [];

    let availableTags: ApiTag[] = [];
    let selectedTags: ApiTag[]  = [];
    let tagsLoading = true;
    let searchTerm  = '';

    $: filteredTags = availableTags.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isSelected = (id: string) => selectedTags.some(t => t.id === id);
    const toggleTag  = (tag: ApiTag) => {
        if (isSelected(tag.id)) selectedTags = selectedTags.filter(t => t.id !== tag.id);
        else if (selectedTags.length < 5) selectedTags = [...selectedTags, tag];
    };

    const generoId      = `g-${Math.random().toString(36).substr(2,9)}`;
    const sexualidadeId = `s-${Math.random().toString(36).substr(2,9)}`;

    const generos = [
        { value: 'MASCULINO',   label: 'Masculino'   },
        { value: 'FEMININO',    label: 'Feminino'    },
        { value: 'NAO_BINARIO', label: 'Não-binário' },
        { value: 'OUTRO',       label: 'Outro'       }
    ];
    const sexualidades = [
        { value: 'HETERO',   label: 'Heterossexual' },
        { value: 'GAY',      label: 'Gay / Lésbica'  },
        { value: 'BI',       label: 'Bissexual'      },
        { value: 'PAN',      label: 'Pansexual'      },
        { value: 'ASSEXUAL', label: 'Assexual'       },
        { value: 'OUTRO',    label: 'Outro'          }
    ];

    const normalizarData = (raw: string | null | undefined): string => {
        if (!raw) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match) return `${match[3]}-${match[2]}-${match[1]}`;
        return '';
    };

    // Converte caminho "google-drive:<id>" → URL de exibição direta
    const driveUrl = (caminho: string): string => {
        if (!caminho) return '';
        const id = caminho.startsWith('google-drive:')
            ? caminho.replace('google-drive:', '')
            : caminho;
        return `http://localhost:8080/api/imagens/proxy/${id}`;
    };

    onMount(async () => {
        await Promise.all([loadPessoa(), loadTags()]);
        loading = false;
    });

    const loadPessoa = async () => {
        try {
            const res = await fetch(`${API}/pessoas`);
            if (!res.ok) throw new Error();
            const lista = await res.json();

            const minha = lista.find((p: any) =>
                p.email === storedUser?.email || p.id === MEU_USER_ID
            );

            if (!minha) return;

            pessoaId = minha.id;

            formData = {
                nome:        minha.nome        ?? '',
                curso:       minha.curso       ?? '',
                dataNasc:    normalizarData(minha.dataNasc),
                email:       minha.email       ?? storedUser?.email ?? '',
                genero:      minha.genero      ?? '',
                sexualidade: minha.sexualidade ?? '',
                descricao:   minha.descricao   ?? '',
                instagram:   minha.instagram   ?? '',
                whatsapp:    minha.whatsapp    ?? '',
                telegram:    minha.telegram    ?? '',
            };

            if (minha.tags?.length) {
                selectedTags = minha.tags.map((t: any) => ({ id: t.id, nome: t.nome ?? '' }));
            }

            // ── Fotos: converte caminho → URL do Drive ──
            const imgRes = await fetch(`${API}/api/imagens/pessoa/${pessoaId}`);
            if (imgRes.ok) {
                const imagens = await imgRes.json();
                fotos = imagens.map((img: any) => ({
                    id:        img.id,
                    url:       driveUrl(img.caminho ?? ''),
                    principal: img.perfil ?? false,
                    file:      undefined,
                }));
            }
        } catch {
            globalError = 'Não foi possível carregar seu perfil.';
        }
    };

    const loadTags = async () => {
        tagsLoading = true;
        try {
            const res = await fetch(`${API}/tags/ativas`);
            if (res.ok) availableTags = await res.json();
        } finally {
            tagsLoading = false;
        }
    };

    const handleSave = async () => {
        errors = {};
        saving = true;
        saveSuccess = false;
        globalError = '';

        try {
            const res = await fetch(`${API}/pessoas/${pessoaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome:        formData.nome,
                    curso:       formData.curso,
                    dataNasc:    formData.dataNasc,
                    email:       formData.email,
                    genero:      formData.genero,
                    sexualidade: formData.sexualidade,
                    descricao:   formData.descricao,
                    instagram:   formData.instagram,
                    whatsapp:    formData.whatsapp,
                    telegram:    formData.telegram,
                    ativo:       true,
                    tags:        selectedTags.map(t => ({ id: t.id })),
                })
            });
            if (!res.ok) throw new Error();

            // Upload apenas das fotos novas (com file)
            const fotosNovas = fotos.filter(f => f.file instanceof File);
            console.log(`[profile] ${fotosNovas.length} foto(s) nova(s) para upload`);

            for (const foto of fotosNovas) {
                const fd = new FormData();
                fd.append('arquivo',  foto.file as File);
                fd.append('pessoaId', pessoaId);
                fd.append('perfil',   String(foto.principal));

                const uploadRes = await fetch(`${API}/api/imagens/upload`, {
                    method: 'POST',
                    body: fd
                });

                if (!uploadRes.ok) {
                    const errText = await uploadRes.text().catch(() => '');
                    console.error('[profile] Erro no upload:', uploadRes.status, errText);
                    errors.submit = `Erro ao enviar imagem: ${uploadRes.status}`;
                } else {
                    // Atualiza a URL da foto com a retornada pela API
                    const resultado = await uploadRes.json().catch(() => ({}));
                    if (resultado.googleDriveUrl) {
                        fotos = fotos.map(f =>
                            f.file === foto.file
                                ? { ...f, id: resultado.id, url: driveUrl(resultado.caminho), file: undefined }
                                : f
                        );
                    }
                    console.log('[profile] Upload OK:', resultado);
                }
            }

            saveSuccess = true;
            setTimeout(() => saveSuccess = false, 3000);
        } catch {
            errors.submit = 'Erro ao salvar. Tente novamente.';
        } finally {
            saving = false;
        }
    };

    const handleLogout = () => {
        if (browser) localStorage.clear();
        goto('/');
    };

    $: fotoAtual = fotos.find(f => f.principal) ?? fotos[0] ?? null;
    $: descCount = formData.descricao.length;
</script>

<div class="page">
    <!-- Header -->
    <header class="header">
        <button class="icon-btn" on:click={() => goto('/home')} aria-label="Voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="header-logo">
            <span class="header-star">✦</span>
            <span class="header-brand">PairUp</span>
        </div>
        <button class="icon-btn icon-btn--danger" on:click={() => showLogoutConfirm = true} aria-label="Sair">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
    </header>

    {#if loading}
        <div class="loading-page">
            <div class="loading-ring"></div>
            <p>Carregando seu perfil...</p>
        </div>
    {:else}
        <!-- Hero -->
        <div class="profile-hero">
            <div class="hero-avatar">
                {#if fotoAtual?.url}
                    <img src={fotoAtual.url} alt={formData.nome} />
                {:else}
                    <span class="hero-initial">{formData.nome?.charAt(0)?.toUpperCase() || '?'}</span>
                {/if}
            </div>
            <div class="hero-info">
                <h2 class="hero-name">{formData.nome || 'Seu nome'}</h2>
                <p class="hero-meta">{formData.curso || ''}</p>
                {#if selectedTags.length > 0}
                    <div class="hero-tags">
                        {#each selectedTags.slice(0, 3) as tag (tag.id)}
                            <span class="hero-tag">{tag.nome}</span>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <main class="main">
            <!-- Toasts -->
            {#if saveSuccess}
                <div class="toast toast--success" role="status">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Perfil salvo com sucesso!
                </div>
            {/if}
            {#if errors.submit || globalError}
                <div class="toast toast--error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                    {errors.submit || globalError}
                </div>
            {/if}

            <!-- Fotos -->
            <section class="section">
                <h3 class="section-title"><span>📷</span> Fotos</h3>
                <FotosUploader bind:fotos {errors} />
            </section>

            <!-- Informações -->
            <section class="section">
                <h3 class="section-title"><span>👤</span> Informações Pessoais</h3>
                <InputField type="text"  label="Nome"  placeholder="Nome completo" bind:value={formData.nome} />
                <InputField type="email" label="Email" placeholder="seu@email.com" bind:value={formData.email} />
                <InputField type="text"  label="Curso" placeholder="Medicina..."   bind:value={formData.curso} />
                <InputField type="date"  label="Data de Nascimento"                bind:value={formData.dataNasc} />

                <div class="row-2">
                    <div class="select-field">
                        <label for={generoId} class="select-label">Gênero</label>
                        <div class="select-wrap">
                            <select id={generoId} bind:value={formData.genero} class="select-el">
                                <option value="">Selecione...</option>
                                {#each generos as g (g.value)}
                                    <option value={g.value}>{g.label}</option>
                                {/each}
                            </select>
                            <svg class="select-caret" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                        </div>
                    </div>
                    <div class="select-field">
                        <label for={sexualidadeId} class="select-label">Sexualidade</label>
                        <div class="select-wrap">
                            <select id={sexualidadeId} bind:value={formData.sexualidade} class="select-el">
                                <option value="">Selecione...</option>
                                {#each sexualidades as s (s.value)}
                                    <option value={s.value}>{s.label}</option>
                                {/each}
                            </select>
                            <svg class="select-caret" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Sobre -->
            <section class="section">
                <h3 class="section-title"><span>✍️</span> Sobre você</h3>
                <div class="textarea-wrap">
                    <textarea bind:value={formData.descricao} rows="4" maxlength="500"
                        placeholder="Conte um pouco sobre você..." class="textarea-el"></textarea>
                    <span class="char-count" class:near-limit={descCount > 420}>{descCount}/500</span>
                </div>
            </section>

            <!-- Interesses -->
            <section class="section">
                <h3 class="section-title"><span>✦</span> Interesses</h3>

                {#if tagsLoading}
                    <div class="tags-loading">
                        <div class="loading-ring loading-ring--sm"></div>
                        <span>Carregando...</span>
                    </div>
                {:else}
                    <div class="tags-bar">
                        <span class="tags-count">{selectedTags.length}/5 selecionados</span>
                    </div>

                    {#if selectedTags.length > 0}
                        <div class="selected-chips">
                            {#each selectedTags as tag (tag.id)}
                                <button type="button" class="chip chip-on"
                                    on:click={() => toggleTag(tag)}
                                    aria-label="Remover {tag.nome}">
                                    {tag.nome} ✕
                                </button>
                            {/each}
                        </div>
                    {/if}

                    <div class="search-wrap">
                        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>
                        <input type="text" placeholder="Buscar interesses..." bind:value={searchTerm} class="search-input" />
                    </div>

                    <div class="tags-pool">
                        {#each filteredTags as tag (tag.id)}
                            <button type="button"
                                class="chip"
                                class:chip-on={isSelected(tag.id)}
                                class:chip-disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                                on:click={() => toggleTag(tag)}
                                aria-pressed={isSelected(tag.id)}
                                disabled={!isSelected(tag.id) && selectedTags.length >= 5}>
                                {tag.nome}
                            </button>
                        {/each}
                        {#if filteredTags.length === 0}
                            <p class="no-results">Nenhum interesse encontrado</p>
                        {/if}
                    </div>
                {/if}
            </section>

            <!-- Contatos -->
            <section class="section">
                <h3 class="section-title"><span>💬</span> Contatos</h3>
                <div class="social-field">
                    <span class="social-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </span>
                    <InputField type="text" label="Instagram" placeholder="@usuario" bind:value={formData.instagram} />
                </div>
                <div class="social-field">
                    <span class="social-icon social-icon--green">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </span>
                    <InputField type="text" label="WhatsApp" placeholder="(00) 00000-0000" bind:value={formData.whatsapp} />
                </div>
                <div class="social-field">
                    <span class="social-icon social-icon--blue">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </span>
                    <InputField type="text" label="Telegram" placeholder="@usuario" bind:value={formData.telegram} />
                </div>
            </section>

            <div style="height:4.5rem"></div>
        </main>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-inner">
                <button class="btn-save" on:click={handleSave} disabled={saving || !pessoaId}>
                    {#if saving}
                        <span class="btn-spinner"></span> Salvando...
                    {:else if !pessoaId}
                        Perfil não encontrado
                    {:else}
                        Salvar alterações
                    {/if}
                </button>
            </div>
        </div>
    {/if}

    <!-- Modal logout -->
    {#if showLogoutConfirm}
        <div class="modal-overlay" on:click|self={() => showLogoutConfirm = false}
            role="dialog" aria-modal="true" aria-label="Confirmar saída">
            <div class="modal">
                <div class="modal-icon">👋</div>
                <h3 class="modal-title">Sair da conta?</h3>
                <p class="modal-sub">Você precisará fazer login novamente para acessar o PairUp.</p>
                <div class="modal-actions">
                    <button class="btn-cancel" on:click={() => showLogoutConfirm = false}>Cancelar</button>
                    <button class="btn-logout" on:click={handleLogout}>Sair</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

    :global(body) { background: var(--cream, #FAF7F2); font-family: 'DM Sans', sans-serif; }
    .page { min-height: 100vh; display: flex; flex-direction: column; background: var(--cream, #FAF7F2); }

    .header { display: flex; justify-content: space-between; align-items: center; padding: .9rem 1.25rem; background: rgba(250,247,242,.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border, rgba(201,169,110,.22)); position: sticky; top: 0; z-index: 10; }
    .header-logo  { display: flex; align-items: center; gap: .35rem; }
    .header-star  { font-size: 1.1rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    @keyframes pk { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    .header-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -.02em; }
    .icon-btn { background: none; border: none; cursor: pointer; color: var(--muted, #8A7F79); padding: .35rem; border-radius: 8px; transition: color .2s, background .2s; }
    .icon-btn svg { width: 22px; height: 22px; display: block; }
    .icon-btn:hover { color: var(--rose, #D94F6B); }
    .icon-btn--danger:hover { color: #ef4444; background: rgba(239,68,68,.07); }

    .loading-page { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--muted, #8A7F79); font-size: .85rem; }
    .loading-ring { width: 40px; height: 40px; border: 3px solid rgba(217,79,107,.15); border-top-color: var(--rose, #D94F6B); border-radius: 50%; animation: spin .8s linear infinite; }
    .loading-ring--sm { width: 18px; height: 18px; border-width: 2px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .profile-hero { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: #fff; border-bottom: 1px solid var(--border, rgba(201,169,110,.22)); }
    .hero-avatar { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2.5px solid var(--rose, #D94F6B); background: linear-gradient(135deg,#F4B8C8,#D94F6B); display: flex; align-items: center; justify-content: center; }
    .hero-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .hero-initial { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: #fff; }
    .hero-info  { flex: 1; min-width: 0; }
    .hero-name  { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 700; color: var(--ink, #1A1410); }
    .hero-meta  { font-size: .75rem; color: var(--muted, #8A7F79); margin-top: .1rem; }
    .hero-tags  { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .4rem; }
    .hero-tag   { font-size: .63rem; padding: .18rem .5rem; border-radius: 20px; background: var(--rose-pale, #FDE8EE); color: var(--rose, #D94F6B); font-weight: 500; }

    .main { flex: 1; padding: 1rem; max-width: 480px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: .85rem; }

    .toast { display: flex; align-items: center; gap: .5rem; font-size: .8rem; padding: .65rem .9rem; border-radius: 10px; animation: slide-in .3s ease; }
    .toast svg { width: 16px; height: 16px; flex-shrink: 0; }
    .toast--success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; }
    .toast--error   { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
    @keyframes slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }

    .section { background: rgba(255,255,255,.82); backdrop-filter: blur(10px); border: 1px solid var(--border, rgba(201,169,110,.22)); border-radius: 16px; padding: 1.1rem; box-shadow: 0 2px 12px rgba(26,20,16,.04); }
    .section-title { font-size: .7rem; font-weight: 500; text-transform: uppercase; letter-spacing: .07em; color: var(--muted, #8A7F79); margin-bottom: .9rem; display: flex; align-items: center; gap: .4rem; }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }

    .select-field { display: flex; flex-direction: column; gap: .28rem; }
    .select-label { font-size: .68rem; font-weight: 500; color: var(--muted, #8A7F79); text-transform: uppercase; letter-spacing: .06em; }
    .select-wrap  { position: relative; border: 1.5px solid rgba(138,127,121,.22); border-radius: 9px; background: rgba(255,255,255,.65); transition: border-color .2s, box-shadow .2s; }
    .select-wrap:focus-within { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }
    .select-el    { width: 100%; padding: .68rem .85rem; padding-right: 2rem; font-family: 'DM Sans', sans-serif; font-size: .87rem; color: var(--ink, #1A1410); background: transparent; border: none; outline: none; border-radius: 9px; appearance: none; cursor: pointer; }
    .select-caret { position: absolute; right: .7rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--muted, #8A7F79); pointer-events: none; }

    .textarea-wrap { position: relative; }
    .textarea-el   { width: 100%; padding: .7rem .9rem; font-family: 'DM Sans', sans-serif; font-size: .87rem; color: var(--ink, #1A1410); background: rgba(255,255,255,.65); border: 1.5px solid rgba(138,127,121,.22); border-radius: 9px; outline: none; resize: none; line-height: 1.6; transition: border-color .2s, box-shadow .2s; }
    .textarea-el::placeholder { color: rgba(138,127,121,.5); }
    .textarea-el:focus { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }
    .char-count { font-size: .68rem; color: var(--muted, #8A7F79); text-align: right; display: block; margin-top: .25rem; }
    .char-count.near-limit { color: var(--rose, #D94F6B); }

    .tags-loading { display: flex; align-items: center; gap: .6rem; font-size: .8rem; color: var(--muted, #8A7F79); padding: .5rem 0; }
    .tags-bar     { display: flex; justify-content: flex-end; margin-bottom: .5rem; }
    .tags-count   { font-size: .7rem; color: var(--rose, #D94F6B); font-weight: 500; }
    .selected-chips { display: flex; flex-wrap: wrap; gap: .35rem; padding: .55rem; border-radius: 10px; background: var(--rose-pale, #FDE8EE); margin-bottom: .65rem; }
    .search-wrap  { position: relative; margin-bottom: .6rem; }
    .search-icon  { position: absolute; left: .7rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--muted, #8A7F79); pointer-events: none; }
    .search-input { width: 100%; padding: .58rem .85rem .58rem 2.1rem; border: 1.5px solid rgba(138,127,121,.2); border-radius: 9px; background: rgba(255,255,255,.65); font-family: 'DM Sans', sans-serif; font-size: .83rem; color: var(--ink, #1A1410); outline: none; transition: border-color .2s, box-shadow .2s; }
    .search-input::placeholder { color: rgba(138,127,121,.5); }
    .search-input:focus { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }
    .tags-pool    { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 140px; overflow-y: auto; padding: .45rem; border: 1.5px solid rgba(138,127,121,.13); border-radius: 9px; background: rgba(255,255,255,.4); }
    .no-results   { font-size: .78rem; color: var(--muted, #8A7F79); }
    .chip         { padding: .28rem .75rem; border-radius: 20px; border: 1.5px solid rgba(138,127,121,.22); background: #fff; color: var(--ink, #1A1410); font-family: 'DM Sans', sans-serif; font-size: .75rem; cursor: pointer; white-space: nowrap; transition: all .15s; }
    .chip:hover:not(:disabled) { border-color: var(--rose, #D94F6B); color: var(--rose, #D94F6B); }
    .chip-on      { background: var(--rose, #D94F6B); border-color: var(--rose, #D94F6B); color: #fff; }
    .chip-on:hover { background: #C0394F; border-color: #C0394F; }
    .chip-disabled { opacity: .4; cursor: not-allowed; }

    .social-field { display: grid; grid-template-columns: 2.4rem 1fr; gap: .5rem; align-items: end; margin-bottom: .1rem; }
    .social-icon  { width: 2.4rem; height: 2.4rem; border-radius: 9px; background: rgba(138,127,121,.1); display: flex; align-items: center; justify-content: center; margin-bottom: .85rem; flex-shrink: 0; }
    .social-icon svg { width: 15px; height: 15px; color: var(--muted, #8A7F79); }
    .social-icon--green { background: rgba(37,211,102,.1); } .social-icon--green svg { color: #25D366; }
    .social-icon--blue  { background: rgba(0,136,204,.1);  } .social-icon--blue svg  { color: #0088cc; }

    .footer       { background: rgba(250,247,242,.92); backdrop-filter: blur(12px); border-top: 1px solid var(--border, rgba(201,169,110,.22)); padding: .85rem 1rem; flex-shrink: 0; }
    .footer-inner { max-width: 480px; margin: 0 auto; }
    .btn-save     { width: 100%; padding: .8rem; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F); color: #fff; font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500; cursor: pointer; box-shadow: 0 4px 16px rgba(217,79,107,.3); display: flex; align-items: center; justify-content: center; gap: .45rem; transition: opacity .2s; }
    .btn-save:hover:not(:disabled) { opacity: .91; }
    .btn-save:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
    .btn-spinner  { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }

    .modal-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(26,20,16,.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fade-in .2s ease; }
    @keyframes fade-in { from{opacity:0} to{opacity:1} }
    .modal        { background: #fff; border-radius: 20px; padding: 2rem 1.75rem; max-width: 320px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(26,20,16,.18); animation: modal-in .25s cubic-bezier(.22,1,.36,1); }
    @keyframes modal-in { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:none} }
    .modal-icon   { font-size: 2.5rem; margin-bottom: .75rem; }
    .modal-title  { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 700; color: var(--ink, #1A1410); margin-bottom: .35rem; }
    .modal-sub    { font-size: .8rem; color: var(--muted, #8A7F79); line-height: 1.5; margin-bottom: 1.5rem; }
    .modal-actions{ display: flex; gap: .65rem; }
    .btn-cancel   { flex: 1; padding: .72rem; border: 1.5px solid rgba(138,127,121,.25); border-radius: 11px; background: transparent; font-family: 'DM Sans', sans-serif; font-size: .85rem; color: var(--muted, #8A7F79); cursor: pointer; transition: border-color .2s, color .2s; }
    .btn-cancel:hover { border-color: var(--muted, #8A7F79); color: var(--ink, #1A1410); }
    .btn-logout   { flex: 1; padding: .72rem; border: none; border-radius: 11px; background: #ef4444; color: #fff; font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500; cursor: pointer; transition: opacity .2s; }
    .btn-logout:hover { opacity: .88; }
</style>