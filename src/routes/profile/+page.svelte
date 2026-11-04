<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import {
        apiGetMyProfile, apiUpdateMyProfile, apiDeleteMyProfile,
        apiDeleteMe, apiGetTagsAtivas, apiUploadImagem, resolveImageUrl,
        type Genero, type Interesse, type PessoaPayload, type TagResponse, type ImagemResponse
    } from '$lib/services/api';
    import { validateAge, handleApiError, normalizarData } from '$lib/utils/errorUtils';
    import { MAX_TAGS, type Foto } from '$lib/data/perfil';
    import Alert         from '$lib/components/ui/Alert.svelte';
    import AppHeader     from '$lib/components/ui/AppHeader.svelte';
    import Button        from '$lib/components/ui/Button.svelte';
    import ConfirmModal  from '$lib/components/ui/ConfirmModal.svelte';
    import HeaderButton  from '$lib/components/ui/HeaderButton.svelte';
    import Icon          from '$lib/components/ui/Icon.svelte';
    import InputField    from '$lib/components/ui/InputField.svelte';
    import LoadingState  from '$lib/components/ui/LoadingState.svelte';
    import Section       from '$lib/components/ui/Section.svelte';
    import TextareaField from '$lib/components/ui/TextareaField.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';
    import CursoAutocomplete     from '$lib/components/perfil/CursoAutocomplete.svelte';
    import GeneroInteresseFields from '$lib/components/perfil/GeneroInteresseFields.svelte';
    import ProfileHero   from '$lib/components/perfil/ProfileHero.svelte';
    import RedesSociaisFields    from '$lib/components/perfil/RedesSociaisFields.svelte';
    import TagPicker     from '$lib/components/perfil/TagPicker.svelte';

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

    // Reconcilia selectedTags quando availableTags carregam depois do perfil
    // (PessoaCompletaDTO.tags traz NOMES, não IDs)
    $: if (pendingTagIds.length > 0 && availableTags.length > 0) {
        selectedTags  = availableTags.filter(t => pendingTagIds.includes(t.nome));
        pendingTagIds = [];
    }

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

        // PessoaCompletaDTO.tags é List<String> de NOMES
        if (p.tags?.length && availableTags.length > 0) {
            selectedTags = availableTags.filter(t => (p.tags ?? []).includes(t.nome));
        } else if (p.tags?.length) {
            pendingTagIds = p.tags;
        }

        fotos = fotosDoServidor(p.imagens);

        loading = false;
    });

    const fotosDoServidor = (imagens?: ImagemResponse[]): Foto[] =>
        (imagens ?? [])
            .filter(img => img.ativa !== false)
            .map(img => ({
                id:        img.id,
                url:       resolveImageUrl(img.url),
                principal: img.perfil,
            }));

    const handleSave = async () => {
        errors = {};
        saving = true;
        saveSuccess = false;
        globalError = '';

        if (!formData.nome.trim())    errors.nome      = 'Nome obrigatório';
        if (!formData.curso.trim())   errors.curso     = 'Curso obrigatório';
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
            cienciaResponsabilidade: true,
            tags:                    selectedTags.map(t => t.id),
        };

        try {
            const res = await apiUpdateMyProfile(payload);
            if (res.error) throw new Error(res.error);

            // Upload apenas de fotos novas (que têm File associado)
            const novas = fotos.filter(f => f.file instanceof File);
            const falhas: string[] = [];
            for (const foto of novas) {
                const upRes = await apiUploadImagem(foto.file as File, foto.principal);
                if (upRes.error) falhas.push(upRes.error);
            }

            // Recarrega do servidor: as fotos enviadas ganham id real e perdem o File,
            // senão cada novo "Salvar" reenviaria as mesmas fotos (duplicadas).
            if (novas.length > 0) {
                const atualizado = await apiGetMyProfile();
                if (atualizado.data) fotos = fotosDoServidor(atualizado.data.imagens);
            }
            if (falhas.length > 0) throw new Error(`Falha ao enviar foto: ${falhas[0]}`);

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
        showDeleteConfirm = false;
        loading = true;
        globalError = '';
        try {
            const perfilRes = await apiDeleteMyProfile();
            if (perfilRes.error) throw new Error(perfilRes.error);
            const contaRes = await apiDeleteMe();
            if (contaRes.error) throw new Error(contaRes.error);
            authStore.logout();
            await goto('/');
        } catch (e) {
            globalError = handleApiError(e);
            loading = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    $: fotoAtual  = fotos.find(f => f.principal) ?? fotos[0] ?? null;
</script>

<div class="page">
    <AppHeader backHref="/home">
        <HeaderButton label="Sair" danger on:click={() => showLogoutConfirm = true}>
            <Icon name="logout" />
        </HeaderButton>
    </AppHeader>

    {#if loading}
        <LoadingState text="Carregando seu perfil..." />
    {:else}
        <ProfileHero nome={formData.nome} curso={formData.curso} foto={fotoAtual?.url ?? ''} tags={selectedTags.map(t => t.nome)} />

        <main class="main">
            {#if saveSuccess}<Alert tone="success">Perfil salvo com sucesso!</Alert>{/if}
            {#if globalError}<Alert>{globalError}</Alert>{/if}

            <Section icon="📷" title="Fotos">
                <FotosUploader bind:fotos {errors} />
            </Section>

            <Section icon="👤" title="Informações Pessoais">
                <InputField type="text"  label="Nome"   placeholder="Nome completo" bind:value={formData.nome}  error={errors.nome} required />
                <InputField type="email" label="E-mail" placeholder="seu@email.com" bind:value={formData.email} readonly />
                <CursoAutocomplete bind:value={formData.curso} error={errors.curso} />
                <InputField type="date"  label="Data de Nascimento" bind:value={formData.dataNasc} error={errors.dataNasc} required />
                <GeneroInteresseFields bind:genero={formData.genero} bind:interesse={formData.interesse} {errors} />
            </Section>

            <Section icon="✍️" title="Sobre você">
                <TextareaField rows={4} bind:value={formData.descricao} placeholder="Conte um pouco sobre você..." />
            </Section>

            <Section icon="✦" title="Interesses">
                <TagPicker tags={availableTags} loading={tagsLoading} max={MAX_TAGS} bind:selected={selectedTags} />
            </Section>

            <Section icon="💬" title="Contatos">
                <RedesSociaisFields bind:instagram={formData.instagram} bind:whatsapp={formData.whatsapp} bind:telegram={formData.telegram} />
            </Section>
        </main>

        <div class="footer">
            <div class="footer-inner">
                <Button block on:click={handleSave} loading={saving} loadingText="Salvando...">Salvar alterações</Button>
                <Button block variant="danger-outline" on:click={() => showDeleteConfirm = true}>🗑️ Deletar minha conta</Button>
            </div>
        </div>
    {/if}

    {#if showLogoutConfirm}
        <ConfirmModal
            icon="👋"
            title="Sair da conta?"
            message="Você precisará fazer login novamente."
            confirmLabel="Sair"
            onConfirm={handleLogout}
            onCancel={() => showLogoutConfirm = false}
        />
    {/if}

    {#if showDeleteConfirm}
        <ConfirmModal
            icon="⚠️"
            title="Deletar conta?"
            message="Ação irreversível. Seu perfil, fotos e todos os dados serão apagados."
            confirmLabel="Deletar tudo"
            onConfirm={handleDeleteAccount}
            onCancel={() => showDeleteConfirm = false}
        />
    {/if}
</div>

<style>
    .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
    .main { flex: 1; padding: 1rem; max-width: 480px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: .85rem; }
    .footer { background: rgba(244,246,251,.92); backdrop-filter: blur(12px); border-top: 1px solid var(--border); padding: .85rem 1rem; flex-shrink: 0; }
    .footer-inner { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: .5rem; }
</style>
