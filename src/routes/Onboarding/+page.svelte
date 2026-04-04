<!-- src/routes/onboarding/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import {
        apiCreatePessoa, apiUploadImagem, apiGetTagsAtivas, apiMarcarCiencia,
        type PessoaPayload, type TagResponse
    } from '$lib/services/api';
    import InputField    from '$lib/components/InputField.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';
    import { validateAge, handleApiError } from '$lib/utils/errorUtils';

    type Genero    = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    type Interesse = 'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';

    interface Foto { id: string; url: string; file?: File; principal: boolean; }

    const TOTAL_STEPS = 4;
    let step = 1;
    let loading = false;
    let globalError = '';

    let currentUser: { id: string; email: string; nome?: string; token: string } | null = null;
    authStore.subscribe(s => { currentUser = s.user as typeof currentUser; });

    let formData = {
        nome:      currentUser?.nome  ?? '',
        curso:     '',
        dataNasc:  '',
        email:     currentUser?.email ?? '',
        genero:    '' as Genero | '',
        interesse: '' as Interesse | '',
        descricao: '',
        instagram: '', whatsapp: '', telegram: '',
    };

    let selectedTags:  TagResponse[] = [];
    let availableTags: TagResponse[] = [];
    let tagsLoading = true;
    let searchTerm  = '';
    let fotos:       Foto[] = [];
    let errors:      Record<string, string> = {};

    const loadTags = async () => {
        tagsLoading = true;
        const res = await apiGetTagsAtivas();
        if (res.data) availableTags = res.data;
        tagsLoading = false;
    };
    loadTags();

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
        { label: 'Pessoal',   icon: '👤' },
        { label: 'Contatos',  icon: '💬' },
        { label: 'Interesses',icon: '✦'  },
        { label: 'Fotos',     icon: '📷' },
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
        if (step === 4 && fotos.length === 0) errors.foto = 'Adicione pelo menos uma foto';
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

        loading = true;
        globalError = '';

        try {
            const payload: PessoaPayload = {
                nome:      formData.nome,
                email:     formData.email,
                curso:     formData.curso,
                dataNasc:  formData.dataNasc,
                genero:    formData.genero,
                interesse: formData.interesse,      // ✅ campo correto
                descricao: formData.descricao,
                instagram: formData.instagram,
                whatsapp:  formData.whatsapp,
                telegram:  formData.telegram,
                ativo:     true,
                usuarioId: currentUser?.id ?? '',
                tags:      selectedTags.map(t => ({ id: t.id, nome: t.nome })),
            };

            const res = await apiCreatePessoa(payload);
            if (res.error) throw new Error(res.error);

            // Upload de fotos
            for (const foto of fotos) {
                if (foto.file) {
                    await apiUploadImagem(foto.file, foto.principal);
                }
            }

            // Marcar ciência de responsabilidade automaticamente no onboarding
            await apiMarcarCiencia();

            await goto('/home');
        } catch (e: unknown) {
            globalError = e instanceof Error ? e.message : 'Erro ao salvar perfil.';
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
                    {step === 1 ? 'Dados pessoais' : step === 2 ? 'Seus contatos' : step === 3 ? 'Seus interesses' : 'Fotos do perfil'}
                </h1>
                <p class="ob-sub">
                    {step === 1 ? 'Conte um pouco sobre você' : step === 2 ? 'Como as pessoas podem te encontrar?' : step === 3 ? 'Escolha até 5 interesses' : 'Adicione pelo menos uma foto'}
                </p>
            </div>

            <div class="progress-wrap">
                <div class="progress-track">
                    <div class="progress-fill" style="width:{progress}%"></div>
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
                    <InputField type="text"  label="Nome"               placeholder="Nome completo"  bind:value={formData.nome}     error={errors.nome}     required />
                    <InputField type="email" label="E-mail"             placeholder="seu@email.com"  bind:value={formData.email}    error={errors.email}    required readonly />
                    <InputField type="text"  label="Curso"              placeholder="Medicina..."    bind:value={formData.curso} />
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

                    <div class="textarea-wrap">
                        <label class="select-label">Descrição (opcional)</label>
                        <textarea bind:value={formData.descricao} rows="3" placeholder="Conte um pouco sobre você..." class="textarea-el"></textarea>
                    </div>
                </div>
            {/if}

            {#if step === 2}
                <div class="step-body">
                    <p class="step-desc">Adicione suas redes para que os matches possam te encontrar. Tudo é opcional.</p>
                    <div class="social-field"><span class="social-icon">📷</span><InputField type="text" label="Instagram" placeholder="@usuario"         bind:value={formData.instagram} /></div>
                    <div class="social-field"><span class="social-icon social-icon--green">💬</span><InputField type="text" label="WhatsApp"  placeholder="(00) 00000-0000" bind:value={formData.whatsapp} /></div>
                    <div class="social-field"><span class="social-icon social-icon--blue">✈️</span><InputField type="text" label="Telegram"  placeholder="@usuario"         bind:value={formData.telegram} /></div>
                </div>
            {/if}

            {#if step === 3}
                <div class="step-body">
                    {#if tagsLoading}
                        <div class="tags-loading">Carregando interesses...</div>
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
    :global(body){background:var(--cream,#FAF7F2);font-family:'DM Sans',sans-serif;}
    .page{min-height:100vh;display:flex;flex-direction:column;background:var(--cream,#FAF7F2);}
    .header{display:flex;justify-content:space-between;align-items:center;padding:.9rem 1.5rem;background:rgba(250,247,242,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--border,rgba(201,169,110,.22));position:sticky;top:0;z-index:10;}
    .header-logo{display:flex;align-items:center;gap:.35rem;}
    .header-star{font-size:1.1rem;color:var(--rose,#D94F6B);animation:pk 3s ease-in-out infinite;}
    @keyframes pk{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
    .header-brand{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:var(--ink,#1A1410);letter-spacing:-.02em;}
    .header-step{font-size:.75rem;color:var(--muted,#8A7F79);}
    .main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:1.5rem 1rem 3rem;}
    .card{width:100%;max-width:440px;background:rgba(255,255,255,.82);backdrop-filter:blur(16px);border:1px solid var(--border,rgba(201,169,110,.22));border-radius:20px;box-shadow:0 8px 40px rgba(217,79,107,.1);padding:1.75rem;animation:card-in .4s cubic-bezier(.22,1,.36,1) both;}
    @keyframes card-in{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
    .ob-header{text-align:center;margin-bottom:1.4rem;}
    .ob-title{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:var(--ink,#1A1410);letter-spacing:-.01em;margin-bottom:.2rem;}
    .ob-sub{font-size:.8rem;color:var(--muted,#8A7F79);}
    .progress-wrap{margin-bottom:1.5rem;}
    .progress-track{height:3px;background:rgba(138,127,121,.15);border-radius:99px;margin-bottom:.7rem;position:relative;overflow:hidden;}
    .progress-fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,var(--rose,#D94F6B),#C0394F);border-radius:99px;transition:width .4s cubic-bezier(.22,1,.36,1);}
    .step-dots{display:flex;justify-content:space-between;}
    .step-dot-wrap{display:flex;flex-direction:column;align-items:center;gap:.28rem;flex:1;}
    .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:500;border:2px solid rgba(138,127,121,.22);color:var(--muted,#8A7F79);background:rgba(255,255,255,.6);transition:all .25s;}
    .step-dot svg{width:12px;height:12px;}
    .step-dot.done{background:var(--rose,#D94F6B);border-color:var(--rose,#D94F6B);color:#fff;}
    .step-dot.active{border-color:var(--rose,#D94F6B);color:var(--rose,#D94F6B);box-shadow:0 0 0 4px rgba(217,79,107,.1);}
    .step-label{font-size:.62rem;color:var(--muted,#8A7F79);transition:color .2s;}
    .step-label.active{color:var(--rose,#D94F6B);font-weight:500;}
    .global-error{display:flex;align-items:center;gap:.5rem;background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;font-size:.8rem;padding:.6rem .85rem;border-radius:10px;margin-bottom:1rem;}
    .global-error svg{width:15px;height:15px;flex-shrink:0;}
    .step-body{display:flex;flex-direction:column;gap:.15rem;margin-bottom:.5rem;}
    .step-desc{font-size:.8rem;color:var(--muted,#8A7F79);margin-bottom:.75rem;line-height:1.5;}
    .row-2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;}
    .select-field{display:flex;flex-direction:column;gap:.28rem;margin-bottom:.1rem;}
    .select-label{font-size:.68rem;font-weight:500;color:var(--muted,#8A7F79);text-transform:uppercase;letter-spacing:.06em;}
    .req{color:var(--rose,#D94F6B);}
    .select-wrap{position:relative;border:1.5px solid rgba(138,127,121,.22);border-radius:9px;background:rgba(255,255,255,.65);transition:border-color .2s,box-shadow .2s;}
    .select-wrap:focus-within{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .select-wrap.has-error{border-color:var(--rose,#D94F6B);}
    .select-el{width:100%;padding:.68rem .85rem;font-family:'DM Sans',sans-serif;font-size:.87rem;color:var(--ink,#1A1410);background:transparent;border:none;outline:none;border-radius:9px;appearance:none;cursor:pointer;}
    .field-error{font-size:.7rem;color:var(--rose,#D94F6B);}
    .textarea-wrap{display:flex;flex-direction:column;gap:.28rem;margin-top:.1rem;}
    .textarea-el{width:100%;padding:.7rem .85rem;font-family:'DM Sans',sans-serif;font-size:.87rem;color:var(--ink,#1A1410);background:rgba(255,255,255,.65);border:1.5px solid rgba(138,127,121,.22);border-radius:9px;outline:none;resize:none;line-height:1.6;transition:border-color .2s,box-shadow .2s;}
    .textarea-el:focus{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .social-field{display:grid;grid-template-columns:2.4rem 1fr;gap:.5rem;align-items:end;margin-bottom:.1rem;}
    .social-icon{width:2.4rem;height:2.4rem;border-radius:9px;background:rgba(138,127,121,.1);display:flex;align-items:center;justify-content:center;margin-bottom:.85rem;flex-shrink:0;font-size:1.1rem;}
    .social-icon--green{background:rgba(37,211,102,.1);}
    .social-icon--blue{background:rgba(0,136,204,.1);}
    .tags-loading{text-align:center;padding:1.5rem 0;color:var(--muted,#8A7F79);}
    .tags-header{display:flex;justify-content:flex-end;margin-bottom:.5rem;}
    .tags-count{font-size:.7rem;color:var(--rose,#D94F6B);font-weight:500;}
    .selected-chips{display:flex;flex-wrap:wrap;gap:.35rem;padding:.55rem;border-radius:10px;background:var(--rose-pale,#FDE8EE);margin-bottom:.75rem;}
    .search-wrap{margin-bottom:.65rem;}
    .search-input{width:100%;padding:.6rem .85rem;border:1.5px solid rgba(138,127,121,.2);border-radius:9px;background:rgba(255,255,255,.65);font-family:'DM Sans',sans-serif;font-size:.83rem;color:var(--ink,#1A1410);outline:none;transition:border-color .2s,box-shadow .2s;}
    .search-input:focus{border-color:var(--rose,#D94F6B);box-shadow:0 0 0 3px rgba(217,79,107,.1);}
    .tags-pool{display:flex;flex-wrap:wrap;gap:.38rem;max-height:160px;overflow-y:auto;padding:.5rem;border:1.5px solid rgba(138,127,121,.15);border-radius:10px;background:rgba(255,255,255,.4);margin-bottom:.4rem;}
    .no-results{font-size:.8rem;color:var(--muted,#8A7F79);padding:.5rem;text-align:center;}
    .tags-tip{font-size:.68rem;color:var(--muted,#8A7F79);}
    .chip{padding:.3rem .8rem;border-radius:20px;border:1.5px solid rgba(138,127,121,.22);background:#fff;color:var(--ink,#1A1410);font-family:'DM Sans',sans-serif;font-size:.77rem;cursor:pointer;white-space:nowrap;transition:all .15s;}
    .chip:hover:not(:disabled){border-color:var(--rose,#D94F6B);color:var(--rose,#D94F6B);}
    .chip-selected{background:var(--rose,#D94F6B);border-color:var(--rose,#D94F6B);color:#fff;}
    .chip-selected:hover{background:#C0394F;border-color:#C0394F;color:#fff;}
    .chip-disabled{opacity:.4;cursor:not-allowed;}
    .nav-row{display:flex;justify-content:space-between;align-items:center;gap:.75rem;margin-top:1.5rem;}
    .btn-back{background:none;border:1.5px solid rgba(138,127,121,.28);padding:.72rem 1.2rem;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:.85rem;color:var(--muted,#8A7F79);cursor:pointer;transition:border-color .2s,color .2s;white-space:nowrap;}
    .btn-back:hover:not(:disabled){border-color:var(--rose,#D94F6B);color:var(--rose,#D94F6B);}
    .btn-back:disabled{opacity:.5;cursor:not-allowed;}
    .btn-next{flex:1;padding:.78rem 1.5rem;border:none;border-radius:11px;background:linear-gradient(135deg,var(--rose,#D94F6B),#C0394F);color:#fff;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(217,79,107,.3);display:flex;align-items:center;justify-content:center;gap:.45rem;transition:opacity .2s;}
    .btn-next:hover:not(:disabled){opacity:.91;}
    .btn-next:disabled{opacity:.55;cursor:not-allowed;}
    .btn-spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}
    @keyframes spin{to{transform:rotate(360deg)}}
</style>