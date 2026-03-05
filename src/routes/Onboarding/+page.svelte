<script lang="ts">
    // Reaproveitando componentes existentes
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import InputField from '$lib/components/login/InputField.svelte';
    
    // Novos componentes específicos
    import TagsSelector from '$lib/components/TagsSelector.svelte';
    import FotosUploader from '$lib/components/FotosUploader.svelte';
    
    type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'PREFIRO_NAO_DIZER';
    type Sexualidade = 'HETEROSSEXUAL' | 'HOMOSSEXUAL' | 'BISSEXUAL' | 'ASSEXUAL' | 'OUTRO';
    
    interface Tag {
        id: string;
        nome: string;
        categoria?: string;
    }
    
    interface Foto {
        id: string;
        url: string;
        file?: File;
        principal: boolean;
    }
    
    interface PessoaData {
        nome: string;
        curso: string;
        dataNasc: string;
        periodo: string;
        email: string;
        genero: Genero | '';
        sexualidade: Sexualidade | '';
        descricao: string;
        instagram: string;
        whatsapp: string;
        telegram: string;
        tags: Tag[];
        fotos: Foto[];
        ativo: boolean;
    }
    
    let step = 1;
    let loading = false;
    
    let formData: PessoaData = {
        nome: '',
        curso: '',
        dataNasc: '',
        periodo: '',
        email: '',
        genero: '',
        sexualidade: '',
        descricao: '',
        instagram: '',
        whatsapp: '',
        telegram: '',
        tags: [],
        fotos: [],
        ativo: true
    };
    
    let errors: Record<string, string> = {};
    
    // IDs para associar labels aos selects
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
    
    const validateStep = () => {
        errors = {};
        
        if (step === 1) {
            if (!formData.nome?.trim()) errors.nome = 'Nome obrigatório';
            if (!formData.email?.trim()) errors.email = 'Email obrigatório';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = 'Email inválido';
            }
            if (!formData.dataNasc) errors.dataNasc = 'Data de nascimento obrigatória';
            if (!formData.genero) errors.genero = 'Gênero obrigatório';
            if (!formData.sexualidade) errors.sexualidade = 'Sexualidade obrigatória';
        }
        
        if (step === 4) {
            if (formData.fotos.length === 0) {
                errors.foto = 'Adicione pelo menos uma foto';
            }
        }
        
        return Object.keys(errors).length === 0;
    };
    
    const nextStep = () => {
        if (validateStep()) {
            step++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const prevStep = () => {
        if (step > 1) {
            step--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const handleSubmit = async () => {
        // Validar fotos antes de enviar
        if (formData.fotos.length === 0) {
            errors.foto = 'Adicione pelo menos uma foto';
            return;
        }
        
        loading = true;
        try {
            console.log('Dados completos:', {
                ...formData,
                fotos: formData.fotos.map(f => ({
                    id: f.id,
                    principal: f.principal,
                    url: f.url.substring(0, 50) + '...'
                }))
            });
            await new Promise(r => setTimeout(r, 1500));
            // submit real aqui
        } catch {
            errors.submit = 'Erro ao salvar';
        } finally {
            loading = false;
        }
    };
</script>

<LoginSection maxWidth="lg" title="Complete seu Perfil">
    <!-- Progress Steps -->
    <div class="flex justify-between mb-6 px-3">
        {#each [1, 2, 3, 4] as s (s)}
            <div 
                class="flex-1 text-center {s <= step ? 'text-pink-600' : 'text-gray-400'}"
            >
                <div class={`
                    w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm
                    ${s < step ? 'bg-pink-600 text-white' : 
                      s === step ? 'border-2 border-pink-600 text-pink-600' : 
                      'bg-gray-200 text-gray-500'}
                `}>
                    {s}
                </div>
                <span class="text-xs hidden sm:block mt-1">
                    {s === 1 ? 'Pessoal' : s === 2 ? 'Contato' : s === 3 ? 'Interesses' : 'Fotos'}
                </span>
            </div>
        {/each}
    </div>
    
    <!-- Step 1: Informações Pessoais -->
    {#if step === 1}
        <div class="space-y-2">
            <InputField 
                type="text"
                placeholder="Nome completo"
                label="Nome"
                bind:value={formData.nome}
                error={errors.nome}
                required
            />
            
            <InputField 
                type="email"
                placeholder="seu@email.com"
                label="Email"
                bind:value={formData.email}
                error={errors.email}
                required
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
                    placeholder="5° período"
                    label="Período"
                    bind:value={formData.periodo}
                />
            </div>
            
            <InputField 
                type="text"
                placeholder="dd/mm/aaaa"
                label="Data de Nascimento"
                bind:value={formData.dataNasc}
                error={errors.dataNasc}
                required
            />
            
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for={generoSelectId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 block">
                        Gênero <span class="text-red-500">*</span>
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
                    {#if errors.genero}
                        <span class="text-xs text-red-500">{errors.genero}</span>
                    {/if}
                </div>
                
                <div>
                    <label for={sexualidadeSelectId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 block">
                        Sexualidade <span class="text-red-500">*</span>
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
                    {#if errors.sexualidade}
                        <span class="text-xs text-red-500">{errors.sexualidade}</span>
                    {/if}
                </div>
            </div>
            
            <div class="flex gap-2 mt-4">
                <div class="flex-1"></div>
                <button
                    type="button"
                    on:click={nextStep}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-pink-600 rounded-lg hover:bg-pink-500 focus:outline-none focus:ring focus:ring-pink-300 focus:ring-opacity-50"
                >
                    Próximo
                </button>
            </div>
        </div>
    {/if}
    
    <!-- Step 2: Contatos -->
    {#if step === 2}
        <div class="space-y-2">
            <InputField 
                type="text"
                placeholder="@usuario"
                label="Instagram (opcional)"
                bind:value={formData.instagram}
            />
            
            <InputField 
                type="text"
                placeholder="(00) 00000-0000"
                label="WhatsApp (opcional)"
                bind:value={formData.whatsapp}
            />
            
            <InputField 
                type="text"
                placeholder="@usuario"
                label="Telegram (opcional)"
                bind:value={formData.telegram}
            />
            
            <div class="flex gap-2 mt-4">
                <button 
                    type="button"
                    on:click={prevStep}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-500 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
                >
                    Voltar
                </button>
                
                <button
                    type="button"
                    on:click={nextStep}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-pink-600 rounded-lg hover:bg-pink-500 focus:outline-none focus:ring focus:ring-pink-300 focus:ring-opacity-50"
                >
                    Próximo
                </button>
            </div>
        </div>
    {/if}
    
    <!-- Step 3: Tags -->
    {#if step === 3}
        <div class="space-y-2">
            <TagsSelector bind:selectedTags={formData.tags} />
            
            <div class="flex gap-2 mt-4">
                <button 
                    type="button"
                    on:click={prevStep}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-500 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
                >
                    Voltar
                </button>
                
                <button
                    type="button"
                    on:click={nextStep}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-pink-600 rounded-lg hover:bg-pink-500 focus:outline-none focus:ring focus:ring-pink-300 focus:ring-opacity-50"
                >
                    Próximo
                </button>
            </div>
        </div>
    {/if}
    
    <!-- Step 4: Fotos -->
    {#if step === 4}
        <div class="space-y-2">
            <!-- Componente de upload de fotos -->
            <FotosUploader bind:fotos={formData.fotos} {errors} />
            
            <!-- Preview do perfil com as fotos -->
            <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <p class="font-medium mb-2">Preview do perfil:</p>
                
                {#if formData.fotos.length > 0}
                    <div class="flex gap-1 mb-2 overflow-x-auto pb-1">
                        {#each formData.fotos.slice(0, 5) as foto (foto.id)}
                            <div class={`
                                w-10 h-10 rounded-full overflow-hidden border-2 shrink-0
                                ${foto.principal ? 'border-pink-500' : 'border-gray-300'}
                            `}>
                                <img src={foto.url} alt="Preview" class="w-full h-full object-cover">
                            </div>
                        {/each}
                        {#if formData.fotos.length > 5}
                            <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 shrink-0">
                                +{formData.fotos.length - 5}
                            </div>
                        {/if}
                    </div>
                {/if}
                
                <p><span class="text-gray-600 dark:text-gray-400">Nome:</span> {formData.nome || '-'}</p>
                <p><span class="text-gray-600 dark:text-gray-400">Curso:</span> {formData.curso || '-'}</p>
                <p><span class="text-gray-600 dark:text-gray-400">Tags:</span> 
                    {formData.tags?.map(t => t.nome).join(', ') || 'Nenhuma'}
                </p>
            </div>
            
            {#if errors.submit}
                <div class="text-xs text-red-500 text-center">{errors.submit}</div>
            {/if}
            
            <div class="flex gap-2 mt-4">
                <button 
                    type="button"
                    on:click={prevStep}
                    disabled={loading}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-500 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Voltar
                </button>
                
                <button
                    type="button"
                    on:click={handleSubmit}
                    disabled={loading}
                    class="flex-1 px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-pink-600 rounded-lg hover:bg-pink-500 focus:outline-none focus:ring focus:ring-pink-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Enviando...' : 'Finalizar'}
                </button>
            </div>
        </div>
    {/if}
</LoginSection>