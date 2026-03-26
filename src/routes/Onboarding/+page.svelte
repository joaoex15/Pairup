<script lang="ts">
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import InputField from '$lib/components/login/InputField.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';

    const API = 'https://pairup-production-b9ee.up.railway.app';

    type Genero      = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    type Sexualidade = 'HETERO' | 'HOMOSEXUAL' | 'BI' | 'PAN' | 'ASSEXUAL' | 'OUTRO';

    interface ApiTag { id: string; nome: string; categoria?: string; ativo?: boolean; }
    interface Foto   { id: string; url: string; file?: File; principal: boolean; }

    interface PessoaData {
        nome: string; curso: string; dataNasc: string;
        email: string; genero: Genero | ''; sexualidade: Sexualidade | '';
        descricao: string; instagram: string; whatsapp: string; telegram: string;
    }

    const TOTAL_STEPS = 4;
    let step = 1;
    let loading = false;
    let globalError = '';

    let currentUser: { id: string; nome: string; email: string } | null = null;
    authStore.subscribe(s => { currentUser = s.user; });

    let formData: PessoaData = {
        nome:        currentUser?.nome  ?? '',
        curso:       '',
        dataNasc:    '',
        email:       currentUser?.email ?? '',
        genero:      '',
        sexualidade: '',
        descricao:   '',
        instagram:   '',
        whatsapp:    '',
        telegram:    ''
    };

    let selectedTags: ApiTag[] = [];
    let availableTags: ApiTag[] = [];
    let tagsLoading = true;
    let tagsError = '';
    let searchTerm = '';

    let fotos: Foto[] = [];
    let errors: Record<string, string> = {};

    const loadTags = async () => {
        tagsLoading = true;
        tagsError = '';
        try {
            const res = await fetch(`${API}/tags/ativas`);
            if (!res.ok) throw new Error();
            availableTags = await res.json();
        } catch {
            tagsError = 'Não foi possível carregar os interesses.';
        } finally {
            tagsLoading = false;
        }
    };
    loadTags();

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
        { value: 'HETERO',      label: 'Heterossexual'  },
        { value: 'HOMOSEXUAL',  label: 'Homossexual'    },
        { value: 'BI',          label: 'Bissexual'      },
        { value: 'PAN',         label: 'Pansexual'      },
        { value: 'ASSEXUAL',    label: 'Assexual'       },
        { value: 'OUTRO',       label: 'Outro'          }
    ];

    const stepMeta = [
        { label: 'Pessoal',    icon: '👤' },
        { label: 'Contatos',   icon: '💬' },
        { label: 'Interesses', icon: '✦'  },
        { label: 'Fotos',      icon: '📷' },
    ];

    const validate = (): boolean => {
        errors = {};
        if (step === 1) {
            if (!formData.nome.trim())  errors.nome = 'Nome obrigatório';
            if (!formData.email.trim()) errors.email = 'Email obrigatório';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                errors.email = 'Email inválido';
            if (!formData.dataNasc)    errors.dataNasc = 'Data obrigatória';
            if (!formData.genero)      errors.genero = 'Obrigatório';
            if (!formData.sexualidade) errors.sexualidade = 'Obrigatório';
        }
        if (step === 4 && fotos.length === 0)
            errors.foto = 'Adicione pelo menos uma foto';
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validate()) { step++; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };
    const prevStep = () => {
        if (step > 1) { step--; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (fotos.length === 0) { errors.foto = 'Adicione pelo menos uma foto'; return; }

        loading = true;
        globalError = '';

        try {
            const pessoaPayload = {
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
                usuarioId:   currentUser?.id ?? '',
                tags:        selectedTags.map(t => ({ id: t.id }))
            };

            const pessoaRes = await fetch(`${API}/pessoas`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(pessoaPayload)
            });

            if (!pessoaRes.ok) {
                const err = await pessoaRes.json().catch(() => ({}));
                throw new Error(err.erro ?? 'Erro ao criar perfil');
            }

            const pessoa = await pessoaRes.json();

            const fotosParaUpload = fotos.filter(f => f.file instanceof File);
            for (const foto of fotosParaUpload) {
                const fd = new FormData();
                fd.append('arquivo',  foto.file as File);
                fd.append('pessoaId', pessoa.id);
                fd.append('perfil',   String(foto.principal));
                await fetch(`${API}/api/imagens/upload`, { method: 'POST', body: fd });
            }

            await goto('/home');
        } catch (e: unknown) {
            globalError = e instanceof Error ? e.message : 'Erro ao salvar perfil. Tente novamente.';
        } finally {
            loading = false;
        }
    };

    $: progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
</script>

<div class="page">
    <header class="header">
        <div class="header-logo">
            <span class="header-star">✦</span>
            <span class="header-brand">PairUp</span>
        </div>
        <p class="header-step">Etapa {step} de {TOTAL_STEPS}</p>
    </header>

    <main class="main">
        <div class="card">
            <div class="ob-header">
                <h1 class="ob-title">
                    {step === 1 ? 'Dados pessoais'    :
                     step === 2 ? 'Seus contatos'     :
                     step === 3 ? 'Seus interesses'   : 'Fotos do perfil'}
                </h1>
                <p class="ob-sub">
                    {step === 1 ? 'Conte um pouco sobre você'           :
                     step === 2 ? 'Como as pessoas podem te encontrar?' :
                     step === 3 ? 'Escolha até 5 interesses'            : 'Adicione pelo menos uma foto'}
                </p>
            </div>

            <div class="progress-wrap">
                <div class="progress-track">
                    <div class="progress-fill" style="width: {progress}%"></div>
                </div>
                <div class="step-dots">
                    {#each stepMeta as meta, i (i)}
                        {@const s = i + 1}
                        <div class="step-dot-wrap">
                            <div class="step-dot" class:done={s < step} class:active={s === step}>
                                {#if s < step}
                                    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5z"/></svg>
                                {:else}
                                    <span>{s}</span>
                                {/if}
                            </div>
                            <span class="step-label" class:active={s === step}>{meta.label}</span>
                        </div>
                    {/each}
                </div>
            </div>

            {#if globalError}
                <div class="global-error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                    {globalError}
                </div>
            {/if}

            {#if step === 1}
                <div class="step-body">
                    <InputField type="text"  label="Nome"               placeholder="Nome completo" bind:value={formData.nome}     error={errors.nome}     required />
                    <InputField type="email" label="Email"              placeholder="seu@email.com" bind:value={formData.email}    error={errors.email}    required readonly />
                    <InputField type="text"  label="Curso"              placeholder="Medicina..."   bind:value={formData.curso} />
                    <InputField type="date"  label="Data de Nascimento"                             bind:value={formData.dataNasc} error={errors.dataNasc} required />
                    <div class="row-2">
                        <div class="select-field">
                            <label for={generoId} class="select-label">Gênero <span class="req">*</span></label>
                            <div class="select-wrap" class:has-error={!!errors.genero}>
                                <select id={generoId} bind:value={formData.genero} class="select-el">
                                    <option value="">Selecione...</option>
                                    {#each generos as g (g.value)}<option value={g.value}>{g.label}</option>{/each}
                                </select>
                                <svg class="select-caret" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                            </div>
                            {#if errors.genero}<span class="field-error">{errors.genero}</span>{/if}
                        </div>
                        <div class="select-field">
                            <label for={sexualidadeId} class="select-label">Sexualidade <span class="req">*</span></label>
                            <div class="select-wrap" class:has-error={!!errors.sexualidade}>
                                <select id={sexualidadeId} bind:value={formData.sexualidade} class="select-el">
                                    <option value="">Selecione...</option>
                                    {#each sexualidades as s (s.value)}<option value={s.value}>{s.label}</option>{/each}
                                </select>
                                <svg class="select-caret" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                            </div>
                            {#if errors.sexualidade}<span class="field-error">{errors.sexualidade}</span>{/if}
                        </div>
                    </div>
                    <div class="textarea-wrap">
                        <label class="select-label">Descrição (opcional)</label>
                        <textarea bind:value={formData.descricao} rows="3" placeholder="Conte um pouco sobre você..." class="textarea-el"></textarea>
                    </div>
                </div>
            {/if}

            {#if step === 2}
                <div class="step-body">
                    <p class="step-desc">Adicione suas redes para que os matches possam te encontrar. Tudo é opcional.</p>
                    <div class="social-field">
                        <span class="social-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></span>
                        <InputField type="text" label="Instagram" placeholder="@usuario" bind:value={formData.instagram} />
                    </div>
                    <div class="social-field">
                        <span class="social-icon social-icon--green"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>
                        <InputField type="text" label="WhatsApp" placeholder="(00) 00000-0000" bind:value={formData.whatsapp} />
                    </div>
                    <div class="social-field">
                        <span class="social-icon social-icon--blue"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></span>
                        <InputField type="text" label="Telegram" placeholder="@usuario" bind:value={formData.telegram} />
                    </div>
                </div>
            {/if}

            {#if step === 3}
                <div class="step-body">
                    {#if tagsLoading}
                        <div class="tags-loading"><div class="loading-ring"></div><span>Carregando interesses...</span></div>
                    {:else if tagsError}
                        <div class="global-error" role="alert">
                            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                            {tagsError}
                            <button class="retry-btn" on:click={loadTags}>Tentar novamente</button>
                        </div>
                    {:else}
                        <div class="tags-header"><span class="tags-count">{selectedTags.length}/5 selecionados</span></div>
                        {#if selectedTags.length > 0}
                            <div class="selected-chips">
                                {#each selectedTags as tag (tag.id)}
                                    <button type="button" class="chip chip-selected" on:click={() => toggleTag(tag)}>{tag.nome} ✕</button>
                                {/each}
                            </div>
                        {/if}
                        <div class="search-wrap">
                            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>
                            <input type="text" placeholder="Buscar interesses..." bind:value={searchTerm} class="search-input" />
                        </div>
                        <div class="tags-pool">
                            {#if filteredTags.length === 0}
                                <p class="no-results">Nenhum interesse encontrado</p>
                            {:else}
                                {#each filteredTags as tag (tag.id)}
                                    <button type="button" class="chip"
                                        class:chip-selected={isSelected(tag.id)}
                                        class:chip-disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                                        on:click={() => toggleTag(tag)}
                                        disabled={!isSelected(tag.id) && selectedTags.length >= 5}>
                                        {tag.nome}
                                    </button>
                                {/each}
                            {/if}
                        </div>
                        <p class="tags-tip">Máximo de 5 interesses</p>
                    {/if}
                </div>
            {/if}

            {#if step === 4}
                <div class="step-body">
                    <FotosUploader bind:fotos {errors} />
                    {#if formData.nome || fotos.length > 0}
                        <div class="profile-preview">
                            <div class="preview-avatar">
                                {#if fotos.find(f => f.principal)}
                                    <img src={fotos.find(f => f.principal)?.url} alt="Perfil" />
                                {:else if fotos[0]}
                                    <img src={fotos[0].url} alt="Perfil" />
                                {:else}
                                    <span class="preview-initial">{formData.nome?.charAt(0)?.toUpperCase() || '?'}</span>
                                {/if}
                            </div>
                            <div class="preview-info">
                                <p class="preview-name">{formData.nome || '—'}</p>
                                <p class="preview-meta">{formData.curso || ''}</p>
                                {#if selectedTags.length > 0}
                                    <div class="preview-tags">
                                        {#each selectedTags.slice(0, 3) as tag (tag.id)}
                                            <span class="preview-tag">{tag.nome}</span>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}

            <div class="nav-row">
                {#if step > 1}
                    <button type="button" class="btn-back" on:click={prevStep} disabled={loading}>← Voltar</button>
                {:else}
                    <div></div>
                {/if}
                {#if step < TOTAL_STEPS}
                    <button type="button" class="btn-next" on:click={nextStep}>Próximo →</button>
                {:else}
                    <button type="button" class="btn-next" on:click={handleSubmit} disabled={loading}>
                        {#if loading}<span class="btn-spinner"></span> Criando perfil...{:else}Criar perfil ✦{/if}
                    </button>
                {/if}
            </div>
        </div>
    </main>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
    :global(body) { background: var(--cream, #FAF7F2); font-family: 'DM Sans', sans-serif; }
    .page { min-height: 100vh; display: flex; flex-direction: column; background: var(--cream, #FAF7F2); }
    .header { display: flex; justify-content: space-between; align-items: center; padding: .9rem 1.5rem; background: rgba(250,247,242,.88); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border, rgba(201,169,110,.22)); position: sticky; top: 0; z-index: 10; }
    .header-logo { display: flex; align-items: center; gap: .35rem; }
    .header-star  { font-size: 1.1rem; color: var(--rose, #D94F6B); animation: pk 3s ease-in-out infinite; }
    @keyframes pk { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    .header-brand { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -.02em; }
    .header-step  { font-size: .75rem; color: var(--muted, #8A7F79); }
    .main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 1.5rem 1rem 3rem; }
    .card { width: 100%; max-width: 440px; background: rgba(255,255,255,.82); backdrop-filter: blur(16px); border: 1px solid var(--border, rgba(201,169,110,.22)); border-radius: 20px; box-shadow: 0 8px 40px rgba(217,79,107,.1); padding: 1.75rem; animation: card-in .4s cubic-bezier(.22,1,.36,1) both; }
    @keyframes card-in { from{opacity:0;transform:translateY(14px) scale(.98)} to{opacity:1;transform:none} }
    .ob-header { text-align: center; margin-bottom: 1.4rem; }
    .ob-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink, #1A1410); letter-spacing: -.01em; margin-bottom: .2rem; }
    .ob-sub   { font-size: .8rem; color: var(--muted, #8A7F79); }
    .progress-wrap { margin-bottom: 1.5rem; }
    .progress-track { height: 3px; background: rgba(138,127,121,.15); border-radius: 99px; margin-bottom: .7rem; position: relative; overflow: hidden; }
    .progress-fill  { position: absolute; left:0; top:0; bottom:0; background: linear-gradient(90deg, var(--rose, #D94F6B), #C0394F); border-radius: 99px; transition: width .4s cubic-bezier(.22,1,.36,1); }
    .step-dots { display: flex; justify-content: space-between; }
    .step-dot-wrap { display: flex; flex-direction: column; align-items: center; gap: .28rem; flex: 1; }
    .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 500; border: 2px solid rgba(138,127,121,.22); color: var(--muted, #8A7F79); background: rgba(255,255,255,.6); transition: all .25s; }
    .step-dot svg { width: 12px; height: 12px; }
    .step-dot.done   { background: var(--rose, #D94F6B); border-color: var(--rose, #D94F6B); color: #fff; }
    .step-dot.active { border-color: var(--rose, #D94F6B); color: var(--rose, #D94F6B); box-shadow: 0 0 0 4px rgba(217,79,107,.1); }
    .step-label { font-size: .62rem; color: var(--muted, #8A7F79); transition: color .2s; }
    .step-label.active { color: var(--rose, #D94F6B); font-weight: 500; }
    .global-error { display: flex; align-items: center; gap: .5rem; background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; font-size: .8rem; padding: .6rem .85rem; border-radius: 10px; margin-bottom: 1rem; animation: shake .35s ease; }
    .global-error svg { width: 15px; height: 15px; flex-shrink: 0; }
    .retry-btn { margin-left: auto; background: none; border: none; font-size: .75rem; color: #991B1B; text-decoration: underline; cursor: pointer; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
    .step-body { display: flex; flex-direction: column; gap: .15rem; margin-bottom: .5rem; }
    .step-desc { font-size: .8rem; color: var(--muted, #8A7F79); margin-bottom: .75rem; line-height: 1.5; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
    .select-field { display: flex; flex-direction: column; gap: .28rem; margin-bottom: .1rem; }
    .select-label { font-size: .68rem; font-weight: 500; color: var(--muted, #8A7F79); text-transform: uppercase; letter-spacing: .06em; }
    .req { color: var(--rose, #D94F6B); }
    .select-wrap { position: relative; border: 1.5px solid rgba(138,127,121,.22); border-radius: 9px; background: rgba(255,255,255,.65); transition: border-color .2s, box-shadow .2s; }
    .select-wrap:focus-within { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }
    .select-wrap.has-error { border-color: var(--rose, #D94F6B); }
    .select-el { width: 100%; padding: .68rem .85rem; padding-right: 2rem; font-family: 'DM Sans', sans-serif; font-size: .87rem; color: var(--ink, #1A1410); background: transparent; border: none; outline: none; border-radius: 9px; appearance: none; cursor: pointer; }
    .select-caret { position: absolute; right: .7rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--muted, #8A7F79); pointer-events: none; }
    .field-error { font-size: .7rem; color: var(--rose, #D94F6B); }
    .textarea-wrap { display: flex; flex-direction: column; gap: .28rem; margin-top: .1rem; }
    .textarea-el { width: 100%; padding: .7rem .85rem; font-family: 'DM Sans', sans-serif; font-size: .87rem; color: var(--ink, #1A1410); background: rgba(255,255,255,.65); border: 1.5px solid rgba(138,127,121,.22); border-radius: 9px; outline: none; resize: none; line-height: 1.6; transition: border-color .2s, box-shadow .2s; }
    .textarea-el::placeholder { color: rgba(138,127,121,.5); }
    .textarea-el:focus { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }
    .social-field { display: grid; grid-template-columns: 2.4rem 1fr; gap: .5rem; align-items: end; margin-bottom: .1rem; }
    .social-icon { width: 2.4rem; height: 2.4rem; border-radius: 9px; background: rgba(138,127,121,.1); display: flex; align-items: center; justify-content: center; margin-bottom: .85rem; flex-shrink: 0; }
    .social-icon svg { width: 16px; height: 16px; color: var(--muted, #8A7F79); }
    .social-icon--green { background: rgba(37,211,102,.1); } .social-icon--green svg { color: #25D366; }
    .social-icon--blue  { background: rgba(0,136,204,.1);  } .social-icon--blue svg  { color: #0088cc; }
    .tags-loading { display: flex; align-items: center; gap: .65rem; padding: 1.5rem 0; justify-content: center; font-size: .82rem; color: var(--muted, #8A7F79); }
    .loading-ring { width: 20px; height: 20px; border: 2px solid rgba(217,79,107,.2); border-top-color: var(--rose, #D94F6B); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .tags-header { display: flex; justify-content: flex-end; margin-bottom: .5rem; }
    .tags-count  { font-size: .7rem; color: var(--rose, #D94F6B); font-weight: 500; }
    .selected-chips { display: flex; flex-wrap: wrap; gap: .35rem; padding: .55rem; border-radius: 10px; background: var(--rose-pale, #FDE8EE); margin-bottom: .75rem; }
    .search-wrap { position: relative; margin-bottom: .65rem; }
    .search-icon { position: absolute; left: .7rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--muted, #8A7F79); pointer-events: none; }
    .search-input { width: 100%; padding: .6rem .85rem .6rem 2.1rem; border: 1.5px solid rgba(138,127,121,.2); border-radius: 9px; background: rgba(255,255,255,.65); font-family: 'DM Sans', sans-serif; font-size: .83rem; color: var(--ink, #1A1410); outline: none; transition: border-color .2s, box-shadow .2s; }
    .search-input::placeholder { color: rgba(138,127,121,.5); }
    .search-input:focus { border-color: var(--rose, #D94F6B); box-shadow: 0 0 0 3px rgba(217,79,107,.1); }
    .tags-pool { display: flex; flex-wrap: wrap; gap: .38rem; max-height: 160px; overflow-y: auto; padding: .5rem; border: 1.5px solid rgba(138,127,121,.15); border-radius: 10px; background: rgba(255,255,255,.4); margin-bottom: .4rem; }
    .no-results { font-size: .8rem; color: var(--muted, #8A7F79); padding: .5rem; }
    .tags-tip   { font-size: .68rem; color: var(--muted, #8A7F79); }
    .chip { padding: .3rem .8rem; border-radius: 20px; border: 1.5px solid rgba(138,127,121,.22); background: #fff; color: var(--ink, #1A1410); font-family: 'DM Sans', sans-serif; font-size: .77rem; cursor: pointer; white-space: nowrap; transition: all .15s; }
    .chip:hover:not(:disabled) { border-color: var(--rose, #D94F6B); color: var(--rose, #D94F6B); }
    .chip-selected { background: var(--rose, #D94F6B); border-color: var(--rose, #D94F6B); color: #fff; }
    .chip-selected:hover { background: #C0394F; border-color: #C0394F; color: #fff; }
    .chip-disabled { opacity: .4; cursor: not-allowed; }
    .profile-preview { display: flex; align-items: center; gap: .85rem; background: rgba(255,255,255,.5); border: 1px solid var(--border, rgba(201,169,110,.22)); border-radius: 12px; padding: .85rem; margin-top: .85rem; }
    .preview-avatar  { width: 50px; height: 50px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: linear-gradient(135deg,#F4B8C8,#D94F6B); display: flex; align-items: center; justify-content: center; border: 2px solid var(--rose, #D94F6B); }
    .preview-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .preview-initial { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 700; color: #fff; }
    .preview-name { font-size: .88rem; font-weight: 500; color: var(--ink, #1A1410); }
    .preview-meta { font-size: .72rem; color: var(--muted, #8A7F79); margin-top: .08rem; }
    .preview-tags { display: flex; flex-wrap: wrap; gap: .28rem; margin-top: .35rem; }
    .preview-tag  { font-size: .63rem; padding: .18rem .5rem; border-radius: 20px; background: var(--rose-pale, #FDE8EE); color: var(--rose, #D94F6B); font-weight: 500; }
    .nav-row { display: flex; justify-content: space-between; align-items: center; gap: .75rem; margin-top: 1.5rem; }
    .btn-back { background: none; border: 1.5px solid rgba(138,127,121,.28); padding: .72rem 1.2rem; border-radius: 11px; font-family: 'DM Sans', sans-serif; font-size: .85rem; color: var(--muted, #8A7F79); cursor: pointer; transition: border-color .2s, color .2s; white-space: nowrap; }
    .btn-back:hover:not(:disabled) { border-color: var(--rose, #D94F6B); color: var(--rose, #D94F6B); }
    .btn-back:disabled { opacity: .5; cursor: not-allowed; }
    .btn-next { flex: 1; padding: .78rem 1.5rem; border: none; border-radius: 11px; background: linear-gradient(135deg, var(--rose, #D94F6B), #C0394F); color: #fff; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500; cursor: pointer; box-shadow: 0 4px 16px rgba(217,79,107,.3); display: flex; align-items: center; justify-content: center; gap: .45rem; transition: opacity .2s; }
    .btn-next:hover:not(:disabled) { opacity: .91; }
    .btn-next:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
    .btn-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
</style>