<!-- src/routes/onboarding/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore';
    import {
        apiCreatePessoa, apiUploadImagem, apiGetTagsAtivas, apiMarcarCiencia,
        type PessoaPayload, type TagResponse
    } from '$lib/services/api';
    import InputField    from '$lib/components/login/InputField.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';
    import { validateAge, handleApiError } from '$lib/utils/errorUtils';
    import { CURSOS } from '$lib/data/cursos.ts';

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

    const TOTAL_STEPS = 4;
    let step        = 1;
    let loading     = false;
    let globalError = '';

    let currentUser: { id: string; email: string; nome?: string } | null = null;

    // CORREÇÃO: usa onMount para subscrever o store com cleanup adequado
    onMount(() => {
        const unsub = authStore.subscribe(s => {
            currentUser = s.user;
            if (!s.isLoading && !s.isAuthenticated) goto('/');
        });
        return unsub;
    });

    let formData = {
        nome:      '',
        curso:     '',
        dataNasc:  '',
        email:     '',
        genero:    '' as Genero | '',
        interesse: '' as Interesse | '',
        descricao: '',
        instagram: '', whatsapp: '', telegram: '',
    };

    // Preenche email e nome quando o store carregar
    $: if (currentUser) {
        if (!formData.email && currentUser.email) formData.email = currentUser.email;
        if (!formData.nome  && currentUser.nome)  formData.nome  = currentUser.nome;
    }

    let selectedTags:  TagResponse[] = [];
    let availableTags: TagResponse[] = [];
    let tagsLoading = true;
    let searchTerm  = '';
    let fotos:       Foto[] = [];
    let errors:      Record<string, string> = {};
    let aceitouTermos = false;

    onMount(async () => {
        const res = await apiGetTagsAtivas();
        if (res.data) availableTags = res.data;
        tagsLoading = false;
    });

    $: filteredTags = availableTags.filter(t =>
        t.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isSelected = (id: string) => selectedTags.some(t => t.id === id);
    const toggleTag  = (tag: TagResponse) => {
        selectedTags = isSelected(tag.id)
            ? selectedTags.filter(t => t.id !== tag.id)
            : selectedTags.length < 5 ? [...selectedTags, tag] : selectedTags;
    };

    const generos = [
        { value: 'MASCULINO',   label: 'Masculino'   },
        { value: 'FEMININO',    label: 'Feminino'    },
        { value: 'NAO_BINARIO', label: 'Não-binário' },
        { value: 'OUTRO',       label: 'Outro'       },
    ];

    const interesses = [
        { value: 'HOMENS',       label: 'Homens'       },
        { value: 'MULHERES',     label: 'Mulheres'     },
        { value: 'TODOS',        label: 'Todos'        },
        { value: 'NAO_DEFINIDO', label: 'Não definido' },
    ];

    const stepMeta = [
        { label: 'Pessoal',    icon: '👤' },
        { label: 'Contatos',   icon: '💬' },
        { label: 'Interesses', icon: '🎓' },
        { label: 'Fotos',      icon: '📷' },
    ];

    const validate = (): boolean => {
        errors = {};
        if (step === 1) {
            if (!formData.nome.trim())    errors.nome      = 'Nome obrigatório';
            if (!formData.email.trim())   errors.email     = 'E-mail obrigatório';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'E-mail inválido';
            if (!formData.dataNasc)       errors.dataNasc  = 'Data obrigatória';
            else if (!validateAge(formData.dataNasc)) errors.dataNasc = 'Você deve ter pelo menos 18 anos';
            if (!formData.genero)         errors.genero    = 'Obrigatório';
            if (!formData.interesse)      errors.interesse = 'Obrigatório';
        }
        if (step === 4) {
            if (fotos.length === 0)  errors.foto   = 'Adicione pelo menos uma foto';
            if (!aceitouTermos)      errors.termos = 'Você deve aceitar os termos para continuar';
        }
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
        loading     = true;
        globalError = '';
        try {
            const payload: PessoaPayload = {
                nome:                    formData.nome.trim(),
                email:                   formData.email.trim(),
                curso:                   formData.curso.trim() || undefined,
                dataNasc:                formData.dataNasc,
                genero:                  formData.genero,
                interesse:               formData.interesse,
                descricao:               formData.descricao.trim() || undefined,
                instagram:               formData.instagram.trim() || undefined,
                whatsapp:                formData.whatsapp.trim() || undefined,
                telegram:                formData.telegram.trim() || undefined,
                ativo:                   true,
                // CORREÇÃO: cienciaResponsabilidade enviada no payload de criação
                // (o backend exige true para criar o perfil — PessoaController)
                cienciaResponsabilidade: true,
                tags:                    selectedTags.map(t => t.id),
            };

            const res = await apiCreatePessoa(payload);
            if (res.error) throw new Error(res.error);

            // Upload sequencial para garantir ordem e detectar erros individuais
            for (const foto of fotos) {
                if (foto.file) {
                    const upRes = await apiUploadImagem(foto.file, foto.principal);
                    if (upRes.error) console.warn('[onboarding] upload parcial:', upRes.error);
                }
            }

            // CORREÇÃO: apiMarcarCiencia é PATCH /pessoas/me/ciencia-responsabilidade
            // Chamado após criar o perfil para confirmar aceite no backend
            await apiMarcarCiencia();
            await goto('/home');
        } catch (e) {
            globalError = handleApiError(e);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            loading = false;
        }
    };

    $: progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

    const stepTitles = [
        'Dados pessoais',
        'Seus contatos',
        'Seus interesses',
        'Fotos do perfil',
    ];
    const stepSubs = [
        'Conte um pouco sobre você',
        'Como as pessoas podem te encontrar?',
        'Escolha até 5 interesses',
        'Adicione pelo menos uma foto',
    ];
</script>

<div class="page">
    <header class="header">
        <div class="header-logo">
            <span class="header-icon" aria-hidden="true">🎓</span>
            <span class="header-brand">UNeSe</span>
        </div>
        <p class="header-step" aria-live="polite">Etapa {step} de {TOTAL_STEPS}</p>
    </header>

    <main class="main">
        <div class="card">
            <div class="ob-header">
                <h1 class="ob-title">{stepTitles[step - 1]}</h1>
                <p class="ob-sub">{stepSubs[step - 1]}</p>
            </div>

            <!-- Barra de progresso -->
            <div class="progress-wrap" aria-label="Progresso do cadastro">
                <div class="progress-track" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
                    <div class="progress-fill" style="width:{progress}%"></div>
                </div>
                <div class="step-dots">
                    {#each stepMeta as meta, i (i)}
                        {@const s = i + 1}
                        <div class="step-dot-wrap">
                            <div
                                class="step-dot"
                                class:done={s < step}
                                class:active={s === step}
                                aria-label="{meta.label} — {s < step ? 'concluído' : s === step ? 'atual' : 'pendente'}"
                            >
                                {#if s < step}
                                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5z"/></svg>
                                {:else}
                                    <span aria-hidden="true">{s}</span>
                                {/if}
                            </div>
                            <span class="step-label" class:active={s === step}>{meta.label}</span>
                        </div>
                    {/each}
                </div>
            </div>

            {#if globalError}
                <div class="global-error" role="alert">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
                    {globalError}
                </div>
            {/if}

            <!-- STEP 1: Dados pessoais -->
            {#if step === 1}
                <div class="step-body">
                    <InputField type="text"  label="Nome"               placeholder="Nome completo"  bind:value={formData.nome}     error={errors.nome}     required autocomplete="name" />
                    <InputField type="email" label="E-mail"             placeholder="seu@email.com"  bind:value={formData.email}    error={errors.email}    required readonly autocomplete="email" />
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
                            <label class="select-label" for="genero">Gênero <span class="req" aria-hidden="true">*</span></label>
                            <div class="select-wrap" class:has-error={!!errors.genero}>
                                <select id="genero" bind:value={formData.genero} class="select-el" aria-required="true">
                                    <option value="">Selecione...</option>
                                    {#each generos as g (g.value)}<option value={g.value}>{g.label}</option>{/each}
                                </select>
                            </div>
                            {#if errors.genero}<span class="field-error" role="alert">{errors.genero}</span>{/if}
                        </div>
                        <div class="select-field">
                            <label class="select-label" for="interesse">Interesse <span class="req" aria-hidden="true">*</span></label>
                            <div class="select-wrap" class:has-error={!!errors.interesse}>
                                <select id="interesse" bind:value={formData.interesse} class="select-el" aria-required="true">
                                    <option value="">Selecione...</option>
                                    {#each interesses as i (i.value)}<option value={i.value}>{i.label}</option>{/each}
                                </select>
                            </div>
                            {#if errors.interesse}<span class="field-error" role="alert">{errors.interesse}</span>{/if}
                        </div>
                    </div>

                    <div class="textarea-wrap">
                        <label class="select-label" for="descricao">Descrição (opcional)</label>
                        <textarea id="descricao" bind:value={formData.descricao} rows="3" maxlength="500" placeholder="Conte um pouco sobre você..." class="textarea-el"></textarea>
                        <span class="char-count">{formData.descricao.length}/500</span>
                    </div>
                </div>
            {/if}

            <!-- STEP 2: Contatos — visíveis APENAS após match (explicado ao usuário) -->
            {#if step === 2}
                <div class="step-body">
                    <div class="info-box">
                        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                        <span>Suas redes sociais só ficam visíveis para quem tiver <strong>match</strong> com você. Tudo é opcional.</span>
                    </div>
                    <div class="social-field"><span class="social-icon" aria-hidden="true">📷</span><InputField type="text" label="Instagram" placeholder="@usuario"         bind:value={formData.instagram} autocomplete="off" /></div>
                    <div class="social-field"><span class="social-icon social-icon--green" aria-hidden="true">💬</span>
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
                                autocomplete="tel"
                            />
                        </div>
                    </div>
                    <div class="social-field"><span class="social-icon social-icon--blue"  aria-hidden="true">✈️</span><InputField type="text" label="Telegram"  placeholder="@usuario"         bind:value={formData.telegram}  autocomplete="off" /></div>
                </div>
            {/if}

            <!-- STEP 3: Tags — carregadas da API -->
            {#if step === 3}
                <div class="step-body">
                    {#if tagsLoading}
                        <div class="tags-loading" aria-live="polite">Carregando interesses...</div>
                    {:else}
                        <div class="tags-header">
                            <span class="tags-count" aria-live="polite">{selectedTags.length}/5 selecionados</span>
                        </div>
                        {#if selectedTags.length > 0}
                            <div class="selected-chips" aria-label="Tags selecionadas">
                                {#each selectedTags as tag (tag.id)}
                                    <button type="button" class="chip chip-selected" on:click={() => toggleTag(tag)} aria-label="Remover {tag.nome}">
                                        {tag.nome} <span aria-hidden="true">✕</span>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                        <div class="search-wrap">
                            <input type="text" placeholder="Buscar interesses..." bind:value={searchTerm} class="search-input" aria-label="Buscar interesses" />
                        </div>
                        <div class="tags-pool" aria-label="Interesses disponíveis">
                            {#if filteredTags.length === 0}
                                <p class="no-results">Nenhum interesse encontrado</p>
                            {:else}
                                {#each filteredTags as tag (tag.id)}
                                    <button type="button" class="chip"
                                        class:chip-selected={isSelected(tag.id)}
                                        class:chip-disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                                        on:click={() => toggleTag(tag)}
                                        disabled={!isSelected(tag.id) && selectedTags.length >= 5}
                                        aria-pressed={isSelected(tag.id)}>
                                        {tag.nome}
                                    </button>
                                {/each}
                            {/if}
                        </div>
                        <p class="tags-tip">Máximo de 5 interesses</p>
                    {/if}
                </div>
            {/if}

            <!-- STEP 4: Fotos + termos -->
            {#if step === 4}
                <div class="step-body">
                    <FotosUploader bind:fotos {errors} />

                    <div class="terms-block" class:terms-block--error={!!errors.termos}>
                        <label class="terms-label">
                            <input
                                type="checkbox"
                                bind:checked={aceitouTermos}
                                class="terms-check"
                                aria-required="true"
                            />
                            <span class="terms-text">
                                Li e aceito os
                                <a href="/termos" target="_blank" rel="noopener noreferrer" class="terms-link">Termos de Uso</a>
                                e a
                                <a href="/privacidade" target="_blank" rel="noopener noreferrer" class="terms-link">Política de Privacidade</a>
                                da UNeSe. Confirmo que tenho pelo menos 18 anos e que sou estudante universitário(a).
                            </span>
                        </label>
                        {#if errors.termos}
                            <p class="terms-error" role="alert">⚠️ {errors.termos}</p>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Navegação -->
            <div class="nav-row">
                {#if step > 1}
                    <button type="button" class="btn-back" on:click={prevStep} disabled={loading}>← Voltar</button>
                {:else}
                    <div></div>
                {/if}
                {#if step < TOTAL_STEPS}
                    <button type="button" class="btn-next" on:click={nextStep}>Próximo →</button>
                {:else}
                    <button
                        type="button"
                        class="btn-next"
                        on:click={handleSubmit}
                        disabled={loading || !aceitouTermos}
                        aria-busy={loading}
                    >
                        {#if loading}
                            <span class="btn-spinner" aria-hidden="true"></span> Criando perfil...
                        {:else}
                            Criar perfil 🎓
                        {/if}
                    </button>
                {/if}
            </div>
        </div>
    </main>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    :global(body) { background: var(--bg, #F4F6FB); font-family: 'Plus Jakarta Sans', sans-serif; }

    .page { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg, #F4F6FB); }

    .header { display: flex; justify-content: space-between; align-items: center; padding: .9rem 1.5rem; background: rgba(244,246,251,.88); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border, rgba(79,70,229,.15)); position: sticky; top: 0; z-index: 10; }
    .header-logo { display: flex; align-items: center; gap: .4rem; }
    .header-icon { font-size: 1.2rem; animation: pk 3s ease-in-out infinite; }
    @keyframes pk { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
    .header-brand { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.4rem; font-weight: 800; color: var(--ink, #0F1624); letter-spacing: -.03em; }
    .header-step { font-size: .75rem; color: var(--muted, #64748B); }

    .main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 1.5rem 1rem 3rem; }
    .card { width: 100%; max-width: 440px; background: rgba(255,255,255,.9); backdrop-filter: blur(16px); border: 1px solid var(--border, rgba(79,70,229,.15)); border-radius: 20px; box-shadow: 0 8px 40px rgba(79,70,229,.1); padding: 1.75rem; animation: card-in .4s cubic-bezier(.22,1,.36,1) both; }
    @keyframes card-in { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }

    .ob-header { text-align: center; margin-bottom: 1.4rem; }
    .ob-title { font-size: 1.45rem; font-weight: 800; color: var(--ink, #0F1624); letter-spacing: -.02em; margin-bottom: .2rem; }
    .ob-sub   { font-size: .8rem; color: var(--muted, #64748B); }

    .progress-wrap { margin-bottom: 1.5rem; }
    .progress-track { height: 4px; background: rgba(79,70,229,.12); border-radius: 99px; margin-bottom: .7rem; position: relative; overflow: hidden; }
    .progress-fill  { position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, var(--primary, #4F46E5), var(--accent, #7C3AED)); border-radius: 99px; transition: width .4s cubic-bezier(.22,1,.36,1); }
    .step-dots      { display: flex; justify-content: space-between; }
    .step-dot-wrap  { display: flex; flex-direction: column; align-items: center; gap: .28rem; flex: 1; }
    .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 600; border: 2px solid rgba(100,116,139,.22); color: var(--muted, #64748B); background: rgba(255,255,255,.6); transition: all .25s; }
    .step-dot svg   { width: 12px; height: 12px; }
    .step-dot.done  { background: var(--primary, #4F46E5); border-color: var(--primary, #4F46E5); color: #fff; }
    .step-dot.active { border-color: var(--primary, #4F46E5); color: var(--primary, #4F46E5); box-shadow: 0 0 0 4px rgba(79,70,229,.1); }
    .step-label        { font-size: .62rem; color: var(--muted, #64748B); transition: color .2s; }
    .step-label.active { color: var(--primary, #4F46E5); font-weight: 600; }

    .global-error { display: flex; align-items: center; gap: .5rem; background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; font-size: .8rem; padding: .6rem .85rem; border-radius: 10px; margin-bottom: 1rem; }
    .global-error svg { width: 15px; height: 15px; flex-shrink: 0; }

    .step-body { display: flex; flex-direction: column; gap: .15rem; margin-bottom: .5rem; }

    .info-box { display: flex; align-items: flex-start; gap: .5rem; background: rgba(79,70,229,.06); border: 1px solid rgba(79,70,229,.18); border-radius: 10px; padding: .65rem .85rem; font-size: .78rem; color: var(--primary, #4F46E5); line-height: 1.5; margin-bottom: .5rem; }
    .info-box svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
    .select-field { display: flex; flex-direction: column; gap: .28rem; margin-bottom: .1rem; }
    .select-label { font-size: .68rem; font-weight: 600; color: var(--muted, #64748B); text-transform: uppercase; letter-spacing: .06em; }
    .req { color: var(--primary, #4F46E5); }
    .select-wrap { position: relative; border: 1.5px solid rgba(100,116,139,.22); border-radius: 9px; background: rgba(255,255,255,.65); transition: border-color .2s, box-shadow .2s; }
    .select-wrap:focus-within { border-color: var(--primary, #4F46E5); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .select-wrap.has-error { border-color: #DC2626; }
    .select-el { width: 100%; padding: .68rem .85rem; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .87rem; color: var(--ink, #0F1624); background: transparent; border: none; outline: none; border-radius: 9px; appearance: none; cursor: pointer; }
    .field-error { font-size: .7rem; color: #DC2626; }

    .textarea-wrap { display: flex; flex-direction: column; gap: .28rem; margin-top: .1rem; }
    .textarea-el { width: 100%; padding: .7rem .85rem; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .87rem; color: var(--ink, #0F1624); background: rgba(255,255,255,.65); border: 1.5px solid rgba(100,116,139,.22); border-radius: 9px; outline: none; resize: none; line-height: 1.6; transition: border-color .2s, box-shadow .2s; }
    .textarea-el:focus { border-color: var(--primary, #4F46E5); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .char-count { font-size: .68rem; color: var(--muted, #64748B); text-align: right; }

    .social-field { display: grid; grid-template-columns: 2.4rem 1fr; gap: .5rem; align-items: end; margin-bottom: .1rem; }
    .social-icon { width: 2.4rem; height: 2.4rem; border-radius: 9px; background: rgba(100,116,139,.1); display: flex; align-items: center; justify-content: center; margin-bottom: .85rem; flex-shrink: 0; font-size: 1.1rem; }
    .social-icon--green { background: rgba(37,211,102,.1); }
    .social-icon--blue  { background: rgba(0,136,204,.1); }
    .input-wrap { flex: 1; display: flex; flex-direction: column; gap: .28rem; }
    .masked-input { width:100%;padding:.68rem .85rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:.87rem;color:var(--ink,#0F1624);background:rgba(255,255,255,.65);border:1.5px solid rgba(100,116,139,.22);border-radius:9px;outline:none;transition:border-color .2s,box-shadow .2s; }
    .masked-input:focus{border-color:var(--primary,#4F46E5);box-shadow:0 0 0 3px rgba(79,70,229,.1);}

    .tags-loading { text-align: center; padding: 1.5rem 0; color: var(--muted, #64748B); }
    .tags-header  { display: flex; justify-content: flex-end; margin-bottom: .5rem; }
    .tags-count   { font-size: .7rem; color: var(--primary, #4F46E5); font-weight: 600; }
    .selected-chips { display: flex; flex-wrap: wrap; gap: .35rem; padding: .55rem; border-radius: 10px; background: var(--primary-l, #EEF2FF); margin-bottom: .75rem; }
    .search-wrap    { margin-bottom: .65rem; }
    .search-input   { width: 100%; padding: .6rem .85rem; border: 1.5px solid rgba(100,116,139,.2); border-radius: 9px; background: rgba(255,255,255,.65); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .83rem; color: var(--ink, #0F1624); outline: none; transition: border-color .2s, box-shadow .2s; }
    .search-input:focus { border-color: var(--primary, #4F46E5); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .tags-pool { display: flex; flex-wrap: wrap; gap: .38rem; max-height: 160px; overflow-y: auto; padding: .5rem; border: 1.5px solid rgba(100,116,139,.15); border-radius: 10px; background: rgba(255,255,255,.4); margin-bottom: .4rem; }
    .no-results { font-size: .8rem; color: var(--muted, #64748B); padding: .5rem; text-align: center; }
    .tags-tip   { font-size: .68rem; color: var(--muted, #64748B); }
    .chip { padding: .3rem .8rem; border-radius: 20px; border: 1.5px solid rgba(100,116,139,.22); background: #fff; color: var(--ink, #0F1624); font-family: 'Plus Jakarta Sans', sans-serif; font-size: .77rem; cursor: pointer; white-space: nowrap; transition: all .15s; }
    .chip:hover:not(:disabled) { border-color: var(--primary, #4F46E5); color: var(--primary, #4F46E5); }
    .chip-selected { background: var(--primary, #4F46E5); border-color: var(--primary, #4F46E5); color: #fff; }
    .chip-selected:hover { background: var(--primary-d, #3730A3); }
    .chip-disabled { opacity: .4; cursor: not-allowed; }

    .terms-block { margin-top: 1rem; background: var(--primary-l, #EEF2FF); border: 1.5px solid var(--border, rgba(79,70,229,.15)); border-radius: 12px; padding: .9rem 1rem; }
    .terms-block--error { border-color: #DC2626; background: #FEF2F2; }
    .terms-label { display: flex; align-items: flex-start; gap: .65rem; cursor: pointer; }
    .terms-check { margin-top: .18rem; width: 16px; height: 16px; accent-color: var(--primary, #4F46E5); flex-shrink: 0; cursor: pointer; }
    .terms-text  { font-size: .78rem; color: var(--muted, #64748B); line-height: 1.55; }
    .terms-link  { color: var(--primary, #4F46E5); text-decoration: underline; font-weight: 600; }
    .terms-link:hover { color: var(--primary-d, #3730A3); }
    .terms-error { font-size: .74rem; color: #DC2626; margin-top: .45rem; }

    .nav-row { display: flex; justify-content: space-between; align-items: center; gap: .75rem; margin-top: 1.5rem; }
    .btn-back { background: none; border: 1.5px solid rgba(100,116,139,.28); padding: .72rem 1.2rem; border-radius: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .85rem; color: var(--muted, #64748B); cursor: pointer; transition: border-color .2s, color .2s; white-space: nowrap; }
    .btn-back:hover:not(:disabled) { border-color: var(--primary, #4F46E5); color: var(--primary, #4F46E5); }
    .btn-back:disabled { opacity: .5; cursor: not-allowed; }
    .btn-next { flex: 1; padding: .78rem 1.5rem; border: none; border-radius: 11px; background: linear-gradient(135deg, var(--primary, #4F46E5), var(--accent, #7C3AED)); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .88rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(79,70,229,.3); display: flex; align-items: center; justify-content: center; gap: .45rem; transition: opacity .2s; }
    .btn-next:hover:not(:disabled) { opacity: .91; }
    .btn-next:disabled { opacity: .45; cursor: not-allowed; }
    .btn-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
</style>