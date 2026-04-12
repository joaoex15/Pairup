<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import {
        apiGetMyProfile, apiUpdateMyProfile, apiDeleteMyProfile,
        apiDeleteMe, apiGetTagsAtivas, apiUploadImagem, apiDeleteImagem,
        type PessoaPayload, type TagResponse
    } from '$lib/services/api';
    import InputField from '$lib/components/login/InputField.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';
    import { validateAge, handleApiError, normalizarData } from '$lib/utils/errorUtils';
    import { CURSOS } from '$lib/data/cursos';

    // Máscara WhatsApp: (XX) XXXXX-XXXX
    const mascaraWhatsApp = (valor: string): string => {
        const d = valor.replace(/\D/g, '').slice(0, 11);
        if (d.length <= 2)  return d.length ? `(${d}` : '';
        if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
        if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
        return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    };

    const handleWhatsApp = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const masked = mascaraWhatsApp(input.value);
        formData.whatsapp = masked;
        input.value = masked;
    };

    type Genero    = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    type Interesse = 'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';

    interface Foto { id: string; url: string; file?: File; principal: boolean; }

    let loading = true;
    let saving  = false;
    let saveSuccess = false;
    let showLogoutConfirm = false;
    let showDeleteConfirm = false;
    let globalError = '';
    let errors: Record<string, string> = {};

    let pessoaId = '';

    let formData = {
        nome: '', curso: '', dataNasc: '', email: '',
        genero:    '' as Genero | '',
        interesse: '' as Interesse | '',
        descricao: '', instagram: '', whatsapp: '', telegram: '',
    };

    let fotos:         Foto[]       = [];
    let availableTags: TagResponse[] = [];
    let selectedTags:  TagResponse[] = [];
    let pendingTagIds: string[]      = [];
    let tagsLoading = true;
    let searchTerm  = '';

    // Reconcilia selectedTags quando availableTags carregam depois do perfil
    $: if (pendingTagIds.length > 0 && availableTags.length > 0) {
        selectedTags  = availableTags.filter(t => pendingTagIds.includes(t.id));
        pendingTagIds = [];
    }

    const generos = [
        { value: 'MASCULINO',  label: 'Masculino'    },
        { value: 'FEMININO',   label: 'Feminino'     },
        { value: 'NAO_BINARIO',label: 'Não-binário'  },
        { value: 'OUTRO',      label: 'Outro'        },
    ];

    const interesses = [
        { value: 'HOMENS',      label: 'Homens'         },
        { value: 'MULHERES',    label: 'Mulheres'       },
        { value: 'TODOS',       label: 'Todos'          },
        { value: 'NAO_DEFINIDO',label: 'Não definido'   },
    ];

    $: filteredTags = availableTags.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isSelected  = (id: string) => selectedTags.some(t => t.id === id);
    const toggleTag   = (tag: TagResponse) => {
        selectedTags = isSelected(tag.id)
            ? selectedTags.filter(t => t.id !== tag.id)
            : selectedTags.length < 5 ? [...selectedTags, tag] : selectedTags;
    };

    onMount(async () => {
        // Tags
        const tagsRes = await apiGetTagsAtivas();
        if (tagsRes.data) availableTags = tagsRes.data;
        tagsLoading = false;

        // Perfil completo (GET /pessoas/me retorna PessoaCompletaDTO)
        const res = await apiGetMyProfile();
        if (res.error || !res.data) {
            globalError = 'Não foi possível carregar seu perfil.';
            loading = false;
            return;
        }

        const p = res.data;
        pessoaId = p.id;

        formData = {
            nome:      p.nome       ?? '',
            curso:     p.curso      ?? '',
            dataNasc:  normalizarData(p.dataNasc),
            email:     p.email      ?? '',
            genero:    (p.genero    ?? '') as Genero | '',
            interesse: (p.interesse ?? '') as Interesse | '',
            descricao: p.descricao  ?? '',
            // PessoaCompletaDTO inclui redes sociais diretamente
            instagram: p.instagram  ?? '',
            whatsapp:  p.whatsapp   ?? '',
            telegram:  p.telegram   ?? '',
        };

        // PessoaCompletaDTO.tags é List<String> de IDs
        if (p.tags?.length && availableTags.length > 0) {
            selectedTags = availableTags.filter(t => (p.tags ?? []).includes(t.id));
        } else if (p.tags?.length) {
            pendingTagIds = p.tags;
        }

        // Carrega fotos existentes do perfil
        if (p.imagens && p.imagens.length > 0) {
            fotos = p.imagens
                .filter(img => img.ativa !== false)
                .map(img => ({
                    id:        img.id,
                    url:       img.url,
                    principal: img.perfil,
                }));
        }

        loading = false;
    });

    const handleSave = async () => {
        errors = {};
        saving = true;
        saveSuccess = false;
        globalError = '';

        if (!formData.nome.trim())    errors.nome      = 'Nome obrigatório';
        if (!formData.dataNasc)       errors.dataNasc  = 'Data obrigatória';
        else if (!validateAge(formData.dataNasc)) errors.dataNasc = 'Você deve ter pelo menos 18 anos';
        if (!formData.genero)         errors.genero    = 'Obrigatório';
        if (!formData.interesse)      errors.interesse = 'Obrigatório';

        if (Object.keys(errors).length > 0) { saving = false; return; }

        // CORREÇÃO: PessoaPayload.tags é string[] de IDs — não enviar objetos Tag
        // CORREÇÃO: não enviar 'id' no payload — controller usa JWT para identificar
        const payload: PessoaPayload = {
            nome:                    formData.nome,
            email:                   formData.email,
            curso:                   formData.curso,
            dataNasc:                formData.dataNasc,
            genero:                  formData.genero,
            interesse:               formData.interesse,
            descricao:               formData.descricao,
            instagram:               formData.instagram,
            whatsapp:                formData.whatsapp,
            telegram:                formData.telegram,
            ativo:                   true,
            cienciaResponsabilidade: true,
            tags:                    selectedTags.map(t => t.id),
        };

        try {
            const res = await apiUpdateMyProfile(payload);
            if (res.error) throw new Error(res.error);

            // Upload apenas de fotos novas (que têm File associado)
            for (const foto of fotos.filter(f => f.file instanceof File)) {
                await apiUploadImagem(foto.file as File, foto.principal);
            }

            saveSuccess = true;
            setTimeout(() => saveSuccess = false, 3000);
        } catch (e) {
            globalError = handleApiError(e);
        } finally {
            saving = false;
        }
    };

    const handleLogout = () => { authStore.logout(); goto('/'); };

    const handleDeleteAccount = async () => {
        loading = true;
        globalError = '';
        try {
            await apiDeleteMyProfile();
            await apiDeleteMe();
            authStore.logout();
            await goto('/');
        } catch (e) {
            globalError = handleApiError(e);
            loading = false;
        }
    };

    $: fotoAtual  = fotos.find(f => f.principal) ?? fotos[0] ?? null;
    $: descCount  = formData.descricao.length;
</script>

<div class="page">
    <header class="header">
        <button class="back-btn" on:click={() => goto('/home')} aria-label="Voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
        </button>
        <div class="header-logo">
            <span class="header-star">✦</span>
            <span class="header-brand">UneSe</span>
        </div>
        <button class="logout-btn" on:click={() => showLogoutConfirm = true} aria-label="Sair">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
        </button>
    </header>

    {#if loading}
        <div class="loading-page"><div class="loading-ring"></div><p>Carregando seu perfil...</p></div>
    {:else}
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
            {#if saveSuccess}
                <div class="toast toast--success" role="status">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Perfil salvo com sucesso!
                </div>
            {/if}
            {#if globalError}
                <div class="toast toast--error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                    {globalError}
                </div>
            {/if}

            <section class="section">
                <h3 class="section-title"><span>📷</span> Fotos</h3>
                <FotosUploader bind:fotos {errors} />
            </section>

            <section class="section">
                <h3 class="section-title"><span>👤</span> Informações Pessoais</h3>
                <InputField type="text"  label="Nome"               placeholder="Nome completo"  bind:value={formData.nome}     error={errors.nome}     required />
                <InputField type="email" label="E-mail"             placeholder="seu@email.com"  bind:value={formData.email}    readonly />
                <div class="select-field">
                    <label class="select-label" for="curso">Curso</label>
                    <div class="select-wrap">
                        <select id="curso" bind:value={formData.curso} class="select-el">
                            <option value="">Selecione seu curso...</option>
                            {#each CURSOS as c (c)}<option value={c}>{c}</option>{/each}
                        </select>
                    </div>
                </div>
                <InputField type="date"  label="Data de Nascimento" bind:value={formData.dataNasc} error={errors.dataNasc} required />

                <div class="row-2">
                    <div class="select-field">
                        <label class="select-label">Gênero <span class="req">*</span></label>
                        <div class="select-wrap" class:has-error={!!errors.genero}>
                            <select bind:value={formData.genero} class="select-el">
                                <option value="">Selecione...</option>
                                {#each generos as g (g.value)}<option value={g.value}>{g.label}</option>{/each}
                            </select>
                        </div>
                        {#if errors.genero}<span class="field-error">{errors.genero}</span>{/if}
                    </div>
                    <div class="select-field">
                        <label class="select-label">Interesse <span class="req">*</span></label>
                        <div class="select-wrap" class:has-error={!!errors.interesse}>
                            <select bind:value={formData.interesse} class="select-el">
                                <option value="">Selecione...</option>
                                {#each interesses as i (i.value)}<option value={i.value}>{i.label}</option>{/each}
                            </select>
                        </div>
                        {#if errors.interesse}<span class="field-error">{errors.interesse}</span>{/if}
                    </div>
                </div>
            </section>

            <section class="section">
                <h3 class="section-title"><span>✍️</span> Sobre você</h3>
                <div class="textarea-wrap">
                    <textarea bind:value={formData.descricao} rows="4" maxlength="500" placeholder="Conte um pouco sobre você..." class="textarea-el"></textarea>
                    <span class="char-count" class:near-limit={descCount > 420}>{descCount}/500</span>
                </div>
            </section>

            <section class="section">
                <h3 class="section-title"><span>✦</span> Interesses</h3>
                {#if tagsLoading}
                    <div class="tags-loading">Carregando interesses...</div>
                {:else}
                    <div class="tags-bar"><span class="tags-count">{selectedTags.length}/5 selecionados</span></div>
                    {#if selectedTags.length > 0}
                        <div class="selected-chips">
                            {#each selectedTags as tag (tag.id)}
                                <button type="button" class="chip chip-selected" on:click={() => toggleTag(tag)}>{tag.nome} ✕</button>
                            {/each}
                        </div>
                    {/if}
                    <div class="search-wrap">
                        <input type="text" placeholder="Buscar interesses..." bind:value={searchTerm} class="search-input" />
                    </div>
                    <div class="tags-pool">
                        {#each filteredTags as tag (tag.id)}
                            <button type="button" class="chip"
                                class:chip-selected={isSelected(tag.id)}
                                class:chip-disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                                on:click={() => toggleTag(tag)}
                                disabled={!isSelected(tag.id) && selectedTags.length >= 5}>
                                {tag.nome}
                            </button>
                        {/each}
                        {#if filteredTags.length === 0}<p class="no-results">Nenhum interesse encontrado</p>{/if}
                    </div>
                {/if}
            </section>

            <section class="section">
                <h3 class="section-title"><span>💬</span> Contatos</h3>
                <div class="social-field">
                    <span class="social-icon">📷</span>
                    <InputField type="text" label="Instagram" placeholder="@usuario"         bind:value={formData.instagram} />
                </div>
                <div class="social-field">
                    <span class="social-icon social-icon--green">💬</span>
                    <div class="input-wrap">
                        <label class="select-label" for="whatsapp">WhatsApp</label>
                        <input
                            id="whatsapp"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={formData.whatsapp}
                            on:input={handleWhatsApp}
                            maxlength="15"
                            class="masked-input"
                        />
                    </div>
                </div>
                <div class="social-field">
                    <span class="social-icon social-icon--blue">✈️</span>
                    <InputField type="text" label="Telegram"  placeholder="@usuario"         bind:value={formData.telegram} />
                </div>
            </section>

            <div style="height:5rem"></div>
        </main>

        <div class="footer">
            <div class="footer-inner">
                <button class="btn-save" on:click={handleSave} disabled={saving}>
                    {#if saving}<span class="btn-spinner"></span> Salvando...{:else}Salvar alterações{/if}
                </button>
                <button class="btn-delete-account" on:click={() => showDeleteConfirm = true}>🗑️ Deletar minha conta</button>
            </div>
        </div>
    {/if}

    {#if showLogoutConfirm}
        <div class="modal-overlay" on:click|self={() => showLogoutConfirm = false} role="dialog" aria-modal="true">
            <div class="modal">
                <div class="modal-icon">👋</div>
                <h3 class="modal-title">Sair da conta?</h3>
                <p class="modal-sub">Você precisará fazer login novamente.</p>
                <div class="modal-actions">
                    <button class="btn-cancel" on:click={() => showLogoutConfirm = false}>Cancelar</button>
                    <button class="btn-confirm btn-confirm--red" on:click={handleLogout}>Sair</button>
                </div>
            </div>
        </div>
    {/if}

    {#if showDeleteConfirm}
        <div class="modal-overlay" on:click|self={() => showDeleteConfirm = false} role="dialog" aria-modal="true">
            <div class="modal">
                <div class="modal-icon">⚠️</div>
                <h3 class="modal-title">Deletar conta?</h3>
                <p class="modal-sub">Ação irreversível. Seu perfil, fotos e todos os dados serão apagados.</p>
                <div class="modal-actions">
                    <button class="btn-cancel" on:click={() => showDeleteConfirm = false}>Cancelar</button>
                    <button class="btn-confirm btn-confirm--red" on:click={handleDeleteAccount}>Deletar tudo</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
    :global(body){background:var(--cream,#FAF7F2);font-family:'DM Sans',sans-serif;}
    .page{min-height:100vh;display:flex;flex-direction:column;background:var(--cream,#FAF7F2);}
    .header{display:flex;justify-content:space-between;align-items:center;padding:.9rem 1.25rem;background:rgba(250,247,242,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border,rgba(201,169,110,.22));position:sticky;top:0;z-index:10;}
    .back-btn,.logout-btn{background:none;border:none;cursor:pointer;color:var(--muted,#8A7F79);padding:.3rem;border-radius:8px;transition:color .2s;}
    .back-btn:hover{color:var(--rose,#D94F6B);}
    .logout-btn:hover{color:#ef4444;}
    .back-btn svg,.logout-btn svg{width:22px;height:22px;display:block;}
    .header-logo{display:flex;align-items:center;gap:.35rem;}
    .header-star{font-size:1.1rem;color:var(--rose,#D94F6B);animation:pk 3s ease-in-out infinite;}
    @keyframes pk{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
    .header-brand{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:var(--ink,#1A1410);letter-spacing:-.02em;}
    .loading-page{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;color:var(--muted,#8A7F79);font-size:.85rem;}
    .loading-ring{width:40px;height:40px;border:3px solid rgba(217,79,107,.15);border-top-color:var(--rose,#D94F6B);border-radius:50%;animation:spin .8s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .profile-hero{display:flex;align-items:center;gap:1rem;padding:1.25rem;background:#fff;border-bottom:1px solid var(--border,rgba(201,169,110,.22));}
    .hero-avatar{width:64px;height:64px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2.5px solid var(--rose,#D94F6B);background:linear-gradient(135deg,#F4B8C8,#D94F6B);display:flex;align-items:center;justify-content:center;}
    .hero-avatar img{width:100%;height:100%;object-fit:cover;}
    .hero-initial{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:#fff;}
    .hero-info{flex:1;min-width:0;}
    .hero-name{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;color:var(--ink,#1A1410);}
    .hero-meta{font-size:.75rem;color:var(--muted,#8A7F79);margin-top:.1rem;}
    .hero-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.4rem;}
    .hero-tag{font-size:.63rem;padding:.18rem .5rem;border-radius:20px;background:var(--rose-pale,#FDE8EE);color:var(--rose,#D94F6B);font-weight:500;}
    .main{flex:1;padding:1rem;max-width:480px;margin:0 auto;width:100%;display:flex;flex-direction:column;gap:.85rem;}
    .toast{display:flex;align-items:center;gap:.5rem;font-size:.8rem;padding:.65rem .9rem;border-radius:10px;animation:slide-in .3s ease;}
    .toast svg{width:16px;height:16px;flex-shrink:0;}
    .toast--success{background:#F0FDF4;border:1px solid #BBF7D0;color:#15803D;}
    .toast--error{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;}
    @keyframes slide-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
    .section{background:rgba(255,255,255,.82);backdrop-filter:blur(10px);border:1px solid var(--border,rgba(201,169,110,.22));border-radius:16px;padding:1.1rem;box-shadow:0 2px 12px rgba(26,20,16,.04);}
    .section-title{font-size:.7rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--muted,#8A7F79);margin-bottom:.9rem;display:flex;align-items:center;gap:.4rem;}
    .row-2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;}
    .select-field{display:flex;flex-direction:column;gap:.28rem;margin-bottom:.1rem;}
    .select-label{font-size:.68rem;font-weight:500;color:var(--muted,#8A7F79);text-transform:uppercase;letter-spacing:.06em;}
    .req{color:var(--rose,#D94F6B);}
    .select-wrap{position:relative;border:1.5px solid rgba(138,127,121,.22);border-radius:9px;background:rgba(255,255,255,.65);transition:border-color .2s,box-shadow .2s;}
    .select-wrap:focus-within{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .select-wrap.has-error{border-color:var(--rose,#D94F6B);}
    .select-el{width:100%;padding:.68rem .85rem;font-family:'DM Sans',sans-serif;font-size:.87rem;color:var(--ink,#1A1410);background:transparent;border:none;outline:none;border-radius:9px;appearance:none;cursor:pointer;}
    .field-error{font-size:.7rem;color:var(--rose,#D94F6B);}
    .textarea-wrap{position:relative;}
    .textarea-el{width:100%;padding:.7rem .9rem;font-family:'DM Sans',sans-serif;font-size:.87rem;color:var(--ink,#1A1410);background:rgba(255,255,255,.65);border:1.5px solid rgba(138,127,121,.22);border-radius:9px;outline:none;resize:none;line-height:1.6;transition:border-color .2s,box-shadow .2s;}
    .textarea-el:focus{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .char-count{font-size:.68rem;color:var(--muted,#8A7F79);text-align:right;display:block;margin-top:.25rem;}
    .char-count.near-limit{color:var(--rose,#D94F6B);}
    .tags-loading{text-align:center;padding:1rem;color:var(--muted,#8A7F79);}
    .tags-bar{display:flex;justify-content:flex-end;margin-bottom:.5rem;}
    .tags-count{font-size:.7rem;color:var(--rose,#D94F6B);font-weight:500;}
    .selected-chips{display:flex;flex-wrap:wrap;gap:.35rem;padding:.55rem;border-radius:10px;background:var(--rose-pale,#FDE8EE);margin-bottom:.65rem;}
    .search-wrap{margin-bottom:.6rem;}
    .search-input{width:100%;padding:.58rem .85rem;border:1.5px solid rgba(138,127,121,.2);border-radius:9px;background:rgba(255,255,255,.65);font-family:'DM Sans',sans-serif;font-size:.83rem;color:var(--ink,#1A1410);outline:none;transition:border-color .2s,box-shadow .2s;}
    .search-input:focus{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .tags-pool{display:flex;flex-wrap:wrap;gap:.35rem;max-height:140px;overflow-y:auto;padding:.45rem;border:1.5px solid rgba(138,127,121,.13);border-radius:9px;background:rgba(255,255,255,.4);}
    .no-results{font-size:.78rem;color:var(--muted,#8A7F79);text-align:center;padding:.5rem;}
    .chip{padding:.28rem .75rem;border-radius:20px;border:1.5px solid rgba(138,127,121,.22);background:#fff;color:var(--ink,#1A1410);font-family:'DM Sans',sans-serif;font-size:.75rem;cursor:pointer;white-space:nowrap;transition:all .15s;}
    .chip:hover:not(:disabled){border-color:var(--rose,#D94F6B);color:var(--rose,#D94F6B);}
    .chip-selected{background:var(--rose,#D94F6B);border-color:var(--rose,#D94F6B);color:#fff;}
    .chip-selected:hover{background:#C0394F;border-color:#C0394F;color:#fff;}
    .chip-disabled{opacity:.4;cursor:not-allowed;}
    .social-field{display:grid;grid-template-columns:2.4rem 1fr;gap:.5rem;align-items:end;margin-bottom:.1rem;}
    .social-icon{width:2.4rem;height:2.4rem;border-radius:9px;background:rgba(138,127,121,.1);display:flex;align-items:center;justify-content:center;margin-bottom:.85rem;flex-shrink:0;font-size:1.1rem;}
    .social-icon--green{background:rgba(37,211,102,.1);}
    .social-icon--blue{background:rgba(0,136,204,.1);}
    .input-wrap { flex: 1; display: flex; flex-direction: column; gap: .28rem; }
    .masked-input { width:100%;padding:.68rem .85rem;font-family:'DM Sans',sans-serif;font-size:.87rem;color:var(--ink,#1A1410);background:rgba(255,255,255,.65);border:1.5px solid rgba(138,127,121,.22);border-radius:9px;outline:none;transition:border-color .2s,box-shadow .2s; }
    .masked-input:focus{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .footer{background:rgba(250,247,242,.92);backdrop-filter:blur(12px);border-top:1px solid var(--border,rgba(201,169,110,.22));padding:.85rem 1rem;flex-shrink:0;}
    .footer-inner{max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:.5rem;}
    .btn-save{width:100%;padding:.8rem;border:none;border-radius:12px;background:linear-gradient(135deg,var(--rose,#D94F6B),#C0394F);color:#fff;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(217,79,107,.3);display:flex;align-items:center;justify-content:center;gap:.45rem;transition:opacity .2s;}
    .btn-save:hover:not(:disabled){opacity:.91;}
    .btn-save:disabled{opacity:.55;cursor:not-allowed;}
    .btn-delete-account{width:100%;padding:.65rem;border:1.5px solid rgba(239,68,68,.3);border-radius:12px;background:transparent;color:#ef4444;font-family:'DM Sans',sans-serif;font-size:.82rem;cursor:pointer;transition:background .2s,border-color .2s;}
    .btn-delete-account:hover{background:rgba(239,68,68,.06);border-color:#ef4444;}
    .btn-spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
    .modal-overlay{position:fixed;inset:0;z-index:50;background:rgba(26,20,16,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:fade-in .2s ease;}
    @keyframes fade-in{from{opacity:0}to{opacity:1}}
    .modal{background:#fff;border-radius:20px;padding:2rem 1.75rem;max-width:320px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(26,20,16,.18);animation:modal-in .25s cubic-bezier(.22,1,.36,1);}
    @keyframes modal-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
    .modal-icon{font-size:2.5rem;margin-bottom:.75rem;}
    .modal-title{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:700;color:var(--ink,#1A1410);margin-bottom:.35rem;}
    .modal-sub{font-size:.8rem;color:var(--muted,#8A7F79);line-height:1.5;margin-bottom:1.5rem;}
    .modal-actions{display:flex;gap:.65rem;}
    .btn-cancel{flex:1;padding:.72rem;border:1.5px solid rgba(138,127,121,.25);border-radius:11px;background:transparent;font-family:'DM Sans',sans-serif;font-size:.85rem;color:var(--muted,#8A7F79);cursor:pointer;transition:border-color .2s,color .2s;}
    .btn-confirm{flex:1;padding:.72rem;border:none;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;transition:opacity .2s;}
    .btn-confirm--red{background:#ef4444;color:#fff;}
    .btn-confirm--red:hover{opacity:.88;}
</style>