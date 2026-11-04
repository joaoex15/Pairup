<!-- src/routes/onboarding/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore';
    import {
        apiCreatePessoa, apiUpdateMyProfile, apiUploadImagem, apiGetTagsAtivas, apiMarcarCiencia,
        apiGetMyProfile,
        type Genero, type Interesse, type PessoaPayload, type TagResponse
    } from '$lib/services/api';
    import { validateAge, handleApiError, normalizarData } from '$lib/utils/errorUtils';
    import { perfilPendente } from '$lib/utils/pessoa';
    import { MAX_TAGS, type Foto } from '$lib/data/perfil';
    import Alert          from '$lib/components/ui/Alert.svelte';
    import AppHeader      from '$lib/components/ui/AppHeader.svelte';
    import Button         from '$lib/components/ui/Button.svelte';
    import InputField     from '$lib/components/ui/InputField.svelte';
    import LoadingState   from '$lib/components/ui/LoadingState.svelte';
    import TextareaField  from '$lib/components/ui/TextareaField.svelte';
    import FotosUploader  from '$lib/components/FotosUploader.svelte';
    import EmptyState     from '$lib/components/ui/EmptyState.svelte';
    import CursoAutocomplete     from '$lib/components/perfil/CursoAutocomplete.svelte';
    import GeneroInteresseFields from '$lib/components/perfil/GeneroInteresseFields.svelte';
    import RedesSociaisFields    from '$lib/components/perfil/RedesSociaisFields.svelte';
    import TagPicker      from '$lib/components/perfil/TagPicker.svelte';
    import StepProgress   from '$lib/components/onboarding/StepProgress.svelte';
    import TermosAceite   from '$lib/components/onboarding/TermosAceite.svelte';

    let step        = 1;
    let loading     = false;
    let isChecking  = true;   // ✅ spinner enquanto verifica perfil existente
    let globalError = '';

    let currentUser: { id: string; email: string; nome?: string } | null = null;

    // Login com Google já cria uma Pessoa mínima no backend: nesse caso POST /pessoas
    // daria 409, e o cadastro precisa ser completado com PUT /pessoas/me.
    let perfilExistente = false;
    let carregado       = false;
    let erroCarregamento = false;

    // ✅ onMount único: verifica auth e se já tem perfil (se sim → home)
    onMount(() => {
        const unsub = authStore.subscribe(async state => {
            if (state.isLoading) return;

            // Não autenticado → login
            if (!state.isAuthenticated) {
                await goto('/');
                return;
            }

            currentUser = state.user;

            if (carregado) return;
            carregado = true;

            try {
                const res = await apiGetMyProfile();
                if (res.status === 401) return;
                if (res.error && !perfilPendente(res)) {
                    erroCarregamento = true;
                    isChecking = false;
                    return;
                }
                if (res.data && !res.error) {
                    // ✅ Perfil completo → vai direto para home
                    if (res.data.perfilCompleto) {
                        await goto('/home');
                        return;
                    }
                    // Perfil incompleto (Google) → pré-preenche e completa via PUT
                    perfilExistente = true;
                    const p = res.data;
                    formData.nome      = p.nome      ?? formData.nome;
                    formData.email     = p.email     ?? formData.email;
                    formData.curso     = p.curso     ?? '';
                    formData.dataNasc  = normalizarData(p.dataNasc);
                    formData.genero    = p.genero    ?? '';
                    formData.interesse = p.interesse ?? '';
                    formData.descricao = p.descricao ?? '';
                }
            } catch {
                erroCarregamento = true;
                isChecking = false;
                return;
            }

            // Pré-carrega tags
            const tagsRes = await apiGetTagsAtivas();
            if (tagsRes.data) availableTags = tagsRes.data;
            tagsLoading = false;

            isChecking = false;
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

    let fotos:  Foto[] = [];
    let errors: Record<string, string> = {};
    let aceitouTermos = false;

    const validate = (): boolean => {
        errors = {};
        if (step === 1) {
            if (!formData.nome.trim())    errors.nome      = 'Nome obrigatório';
            if (!formData.email.trim())   errors.email     = 'E-mail obrigatório';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'E-mail inválido';
            if (!formData.curso.trim())   errors.curso     = 'Curso obrigatório';
            if (!formData.dataNasc)       errors.dataNasc  = 'Data obrigatória';
            else if (!validateAge(formData.dataNasc)) errors.dataNasc = 'Você deve ter pelo menos 18 anos';
            if (!formData.genero)         errors.genero    = 'Obrigatório';
            if (!formData.interesse)      errors.interesse = 'Obrigatório';
        }
        if (step === 4) {
            if (fotos.length === 0) errors.foto   = 'Adicione pelo menos uma foto';
            if (!aceitouTermos)     errors.termos = 'Você deve aceitar os termos para continuar';
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
                curso:                   formData.curso.trim(),
                dataNasc:                formData.dataNasc,
                genero:                  formData.genero,
                interesse:               formData.interesse,
                descricao:               formData.descricao.trim() || undefined,
                instagram:               formData.instagram.trim() || undefined,
                whatsapp:                formData.whatsapp.trim() || undefined,
                telegram:                formData.telegram.trim() || undefined,
                cienciaResponsabilidade: true,
                tags:                    selectedTags.map(t => t.id),
            };

            const res = perfilExistente
                ? await apiUpdateMyProfile(payload)
                : await apiCreatePessoa(payload);
            if (res.error) throw new Error(res.error);
            // Se algo abaixo falhar, uma nova tentativa precisa usar PUT (POST daria 409)
            perfilExistente = true;

            // PUT /pessoas/me não altera cienciaResponsabilidade — precisa do PATCH
            const cienciaRes = await apiMarcarCiencia();
            if (cienciaRes.error) throw new Error(cienciaRes.error);

            const falhas: string[] = [];
            for (const foto of fotos) {
                if (!foto.file) continue;
                const upRes = await apiUploadImagem(foto.file, foto.principal);
                if (upRes.error) falhas.push(upRes.error);
                else foto.file = undefined;   // não reenviar numa nova tentativa
            }
            if (falhas.length > 0) {
                throw new Error(`Perfil salvo, mas ${falhas.length} foto(s) não foram enviadas: ${falhas[0]}. Tente de novo ou remova-as.`);
            }

            await goto('/home');
        } catch (e) {
            globalError = handleApiError(e);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            loading = false;
        }
    };

    const STEPS = [
        { label: 'Pessoal',    title: 'Dados pessoais',  sub: 'Conte um pouco sobre você' },
        { label: 'Contatos',   title: 'Seus contatos',   sub: 'Como as pessoas podem te encontrar?' },
        { label: 'Interesses', title: 'Seus interesses', sub: `Escolha até ${MAX_TAGS} interesses` },
        { label: 'Fotos',      title: 'Fotos do perfil', sub: 'Adicione pelo menos uma foto' },
    ];
    const TOTAL_STEPS = STEPS.length;
</script>

<div class="page">
    <AppHeader>
        <p class="header-step" aria-live="polite">Etapa {step} de {TOTAL_STEPS}</p>
    </AppHeader>

    <main class="main">
        {#if isChecking}
            <LoadingState text="Verificando seu cadastro..." />

        {:else if erroCarregamento}
            <EmptyState icon="⚠️" title="Não foi possível carregar" message="Verifique sua conexão e tente de novo.">
                <Button on:click={() => window.location.reload()}>Tentar de novo</Button>
            </EmptyState>

        {:else}
            <div class="card">
                <div class="ob-header">
                    <h1 class="ob-title">{STEPS[step - 1].title}</h1>
                    <p class="ob-sub">{STEPS[step - 1].sub}</p>
                </div>

                <StepProgress {step} labels={STEPS.map(s => s.label)} />

                {#if globalError}<Alert>{globalError}</Alert>{/if}

                {#if step === 1}
                    <InputField type="text"  label="Nome" placeholder="Nome completo" bind:value={formData.nome} error={errors.nome} required autocomplete="name" />
                    <InputField type="email" label="E-mail" placeholder="seu@email.com" bind:value={formData.email} error={errors.email} required readonly autocomplete="email" />
                    <CursoAutocomplete bind:value={formData.curso} error={errors.curso} />
                    <InputField type="date" label="Data de Nascimento" bind:value={formData.dataNasc} error={errors.dataNasc} required />
                    <GeneroInteresseFields bind:genero={formData.genero} bind:interesse={formData.interesse} {errors} />
                    <TextareaField label="Descrição (opcional)" bind:value={formData.descricao}
                        placeholder="Conte um pouco sobre você, seus hobbies e o que você busca..." />

                {:else if step === 2}
                    <Alert tone="info">
                        Suas redes sociais só ficam visíveis para quem tiver <strong>match</strong> com você. Tudo é opcional.
                    </Alert>
                    <RedesSociaisFields bind:instagram={formData.instagram} bind:whatsapp={formData.whatsapp} bind:telegram={formData.telegram} />

                {:else if step === 3}
                    <TagPicker tags={availableTags} loading={tagsLoading} max={MAX_TAGS} bind:selected={selectedTags} />

                {/if}

                <!-- Fica montado ao voltar de passo: desmontar revogaria as prévias das fotos -->
                <div hidden={step !== TOTAL_STEPS}>
                    <FotosUploader bind:fotos {errors} />
                    <TermosAceite bind:aceito={aceitouTermos} error={errors.termos} />
                </div>

                <div class="nav-row">
                    {#if step > 1}
                        <Button variant="ghost" on:click={prevStep} disabled={loading}>← Voltar</Button>
                    {/if}
                    <div class="nav-next">
                        {#if step < TOTAL_STEPS}
                            <Button block on:click={nextStep}>Próximo →</Button>
                        {:else}
                            <Button block on:click={handleSubmit} {loading} loadingText="Criando perfil..." disabled={!aceitouTermos}>
                                Criar perfil 🎓
                            </Button>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </main>
</div>

<style>
    .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
    .header-step { font-size: .75rem; color: var(--muted); }
    .main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 1.5rem 1rem 3rem; }
    .card { width: 100%; max-width: 440px; background: rgba(255,255,255,.9); backdrop-filter: blur(16px); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 8px 40px rgba(79,70,229,.1); padding: 1.75rem; animation: card-in .4s cubic-bezier(.22,1,.36,1) both; }
    .ob-header { text-align: center; margin-bottom: 1.4rem; }
    .ob-title { font-size: 1.45rem; font-weight: 800; color: var(--ink); letter-spacing: -.02em; margin-bottom: .2rem; }
    .ob-sub { font-size: .8rem; color: var(--muted); }
    .nav-row { display: flex; align-items: center; gap: .75rem; margin-top: 1.5rem; }
    .nav-next { flex: 1; }
    @keyframes card-in { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
</style>
