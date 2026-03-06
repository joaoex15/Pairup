<script lang="ts">
    import { goto } from '$app/navigation';
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import InputField from '$lib/components/login/InputField.svelte';
    import SubmitButton from '$lib/components/login/SubmitButton.svelte';
    import TagsSelector from '$lib/components/TagsSelector.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';
    
    type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'PREFIRO_NAO_DIZER';
    type Sexualidade = 'HETEROSSEXUAL' | 'HOMOSSEXUAL' | 'BISSEXUAL' | 'ASSEXUAL' | 'OUTRO';
    
    interface Foto {
        id: string;
        url: string;
        file?: File;
        principal: boolean;
    }
    
    interface Tag {
        id: string;
        nome: string;
        categoria?: string;
    }
    
    let saving = false;
    let showLogoutConfirm = false;
    
    let formData = {
        nome: 'Ana Silva',
        curso: 'Medicina',
        dataNasc: '15/03/2001',
        periodo: '8° período',
        email: 'ana.silva@email.com',
        genero: 'FEMININO' as Genero,
        sexualidade: 'HETEROSSEXUAL' as Sexualidade,
        descricao: 'Amo música e viajar. Busco alguém para compartilhar momentos especiais.',
        instagram: '@ana_silva',
        whatsapp: '(79) 99999-9999',
        telegram: '@ana_silva',
        tags: [
            { id: '1', nome: 'Música' },
            { id: '2', nome: 'Viagem' },
            { id: '3', nome: 'Cinema' }
        ] as Tag[],
        fotos: [
            {
                id: 'foto1',
                url: 'https://randomuser.me/api/portraits/women/44.jpg',
                principal: true
            },
            {
                id: 'foto2',
                url: 'https://randomuser.me/api/portraits/women/45.jpg',
                principal: false
            }
        ] as Foto[]
    };
    
    let errors: Record<string, string> = {};
    
    const generoSelectId = `genero-${Math.random().toString(36).substr(2, 9)}`;
    const sexualidadeSelectId = `sexualidade-${Math.random().toString(36).substr(2, 9)}`;
    
    const generos = [
        { value: 'MASCULINO', label: 'Masculino' },
        { value: 'FEMININO', label: 'Feminino' },
        { value: 'OUTRO', label: 'Outro' },
        { value: 'PREFIRO_NAO_DIZER', label: 'Prefiro não dizer' }
    ];
    
    const sexualidades = [
        { value: 'HETEROSSEXUAL', label: 'Heterossexual' },
        { value: 'HOMOSSEXUAL', label: 'Homossexual' },
        { value: 'BISSEXUAL', label: 'Bissexual' },
        { value: 'ASSEXUAL', label: 'Assexual' },
        { value: 'OUTRO', label: 'Outro' }
    ];
    
    const irParaHome = () => {
        goto('/home', { replaceState: true });
    };
    
    const handleSave = async () => {
        saving = true;
        try {
            await new Promise(r => setTimeout(r, 1500));
            console.log('Perfil salvo:', formData);
        } catch {
            errors.submit = 'Erro ao salvar';
        } finally {
            saving = false;
        }
    };
    
    const handleLogout = () => {
        localStorage.clear();
        goto('/login', { replaceState: true });
    };
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center gap-4">
        <button 
            on:click={irParaHome}
            class="p-2"
            aria-label="Voltar para home"
            title="Voltar"
        >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <h1 class="text-xl font-bold text-pink-600">PairUp - Editar Perfil</h1>
    </header>
    
    <main class="max-w-md mx-auto p-4 pb-24">
        <!-- Fotos -->
        <LoginSection maxWidth="lg" title="Fotos">
            <FotosUploader bind:fotos={formData.fotos} {errors} />
        </LoginSection>
        
        <!-- Informações Pessoais -->
        <div class="mt-4">
            <LoginSection maxWidth="lg" title="Informações Pessoais">
                <InputField 
                    type="text"
                    placeholder="Nome completo"
                    label="Nome"
                    bind:value={formData.nome}
                />
                
                <InputField 
                    type="email"
                    placeholder="seu@email.com"
                    label="Email"
                    bind:value={formData.email}
                />
                
                <div class="grid grid-cols-2 gap-2">
                    <InputField 
                        type="text"
                        placeholder="Curso"
                        label="Curso"
                        bind:value={formData.curso}
                    />
                    
                    <InputField 
                        type="text"
                        placeholder="Período"
                        label="Período"
                        bind:value={formData.periodo}
                    />
                </div>
                
                <InputField 
                    type="text"
                    placeholder="dd/mm/aaaa"
                    label="Data de Nascimento"
                    bind:value={formData.dataNasc}
                />
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label for={generoSelectId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 block">
                            Gênero
                        </label>
                        <select 
                            id={generoSelectId}
                            bind:value={formData.genero}
                            class="block w-full py-2 text-sm text-gray-700 bg-white border rounded-lg px-3 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        >
                            <option value="">Selecione...</option>
                            {#each generos as g (g.value)}
                                <option value={g.value}>{g.label}</option>
                            {/each}
                        </select>
                    </div>
                    
                    <div>
                        <label for={sexualidadeSelectId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 block">
                            Sexualidade
                        </label>
                        <select 
                            id={sexualidadeSelectId}
                            bind:value={formData.sexualidade}
                            class="block w-full py-2 text-sm text-gray-700 bg-white border rounded-lg px-3 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        >
                            <option value="">Selecione...</option>
                            {#each sexualidades as s (s.value)}
                                <option value={s.value}>{s.label}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </LoginSection>
        </div>
        
        <!-- Sobre -->
        <div class="mt-4">
            <LoginSection maxWidth="lg" title="Sobre você">
                <div class="relative flex flex-col">
                    <textarea
                        bind:value={formData.descricao}
                        rows="4"
                        placeholder="Conte um pouco sobre você..."
                        class="block w-full py-2 text-sm text-gray-700 bg-white border rounded-lg px-3 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    ></textarea>
                    <span class="text-xs text-gray-500 mt-1 text-right">
                        {formData.descricao.length}/500
                    </span>
                </div>
            </LoginSection>
        </div>
        
        <!-- Interesses -->
        <div class="mt-4">
            <LoginSection maxWidth="lg" title="Interesses">
                <TagsSelector bind:selectedTags={formData.tags} />
            </LoginSection>
        </div>
        
        <!-- Contatos -->
        <div class="mt-4">
            <LoginSection maxWidth="lg" title="Contatos">
                <InputField 
                    type="text"
                    placeholder="@usuario"
                    label="Instagram"
                    bind:value={formData.instagram}
                />
                
                <InputField 
                    type="text"
                    placeholder="(00) 00000-0000"
                    label="WhatsApp"
                    bind:value={formData.whatsapp}
                />
                
                <InputField 
                    type="text"
                    placeholder="@usuario"
                    label="Telegram"
                    bind:value={formData.telegram}
                />
            </LoginSection>
        </div>
        
        {#if errors.submit}
            <div class="text-xs text-red-500 text-center mt-4">{errors.submit}</div>
        {/if}
    </main>
    
    <!-- Botões fixos - AMBOS IGUAIS usando div com flex-1 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="max-w-md mx-auto flex gap-2">
            <!-- BOTÃO SAIR - igual ao Salvar, só muda a cor -->
            <div class="flex-1">
                <SubmitButton 
                    text="Sair"
                    onclick={() => showLogoutConfirm = true}
                    customClass="bg-red-500 hover:bg-red-400 focus:ring-red-300"
                />
            </div>
            
            <!-- BOTÃO SALVAR - igual ao Sair -->
            <div class="flex-1">
                <SubmitButton 
                    text="Salvar"
                    onclick={handleSave}
                    loading={saving}
                    disabled={saving}
                    customClass="bg-green-500 hover:bg-green-400 focus:ring-green-300"
                />
            </div>
        </div>
    </div>
    
    <!-- Modal de logout -->
    {#if showLogoutConfirm}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Sair da conta</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Tem certeza que deseja sair?</p>
                
                <div class="flex gap-2">
                    <!-- BOTÃO CANCELAR -->
                    <div class="flex-1">
                        <SubmitButton 
                            text="Cancelar"
                            onclick={() => showLogoutConfirm = false}
                            customClass="bg-gray-500 hover:bg-gray-400 focus:ring-gray-300"
                        />
                    </div>
                    
                    <!-- BOTÃO CONFIRMAR -->
                    <div class="flex-1">
                        <SubmitButton 
                            text="Sair"
                            onclick={handleLogout}
                            customClass="bg-red-500 hover:bg-red-400 focus:ring-red-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>