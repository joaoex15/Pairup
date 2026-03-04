<script lang="ts">
    // Reaproveitando componentes existentes
    import LoginSection from '$lib/components/login/LoginSection.svelte';
    import InputField from '$lib/components/login/InputField.svelte';
    import SubmitButton from '$lib/components/login/SubmitButton.svelte';
    
    // Novos componentes específicos
    import TagsSelector from '$lib/components/TagsSelector.svelte';
    
    type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'PREFIRO_NAO_DIZER';
    type Sexualidade = 'HETEROSSEXUAL' | 'HOMOSSEXUAL' | 'BISSEXUAL' | 'ASSEXUAL' | 'OUTRO';
    
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
        tags: any[];
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
        ativo: true
    };
    
    let errors: Record<string, string> = {};
    
    // IDs para associar labels aos selects
    const generoSelectId = `genero-${Math.random().toString(36).substr(2, 9)}`;
    const sexualidadeSelectId = `sexualidade-${Math.random().toString(36).substr(2, 9)}`;
    const descricaoId = `descricao-${Math.random().toString(36).substr(2, 9)}`;
    
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
        
        return Object.keys(errors).length === 0;
    };
    
    const nextStep = () => {
        if (validateStep()) {
            step++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const prevStep = () => {
        step--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleSubmit = async () => {
        loading = true;
        try {
            console.log('Dados completos:', formData);
            await new Promise(r => setTimeout(r, 1500));
            // submit real aqui
        } catch (error) {
            errors.submit = 'Erro ao salvar';
        } finally {
            loading = false;
        }
    };
</script>

<LoginSection maxWidth="lg" title="Complete seu Perfil">
    <!-- Progress Steps -->
    <div class="flex justify-between mb-6 px-3">
        {#each [1, 2, 3, 4] as s}
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
                    {s === 1 ? 'Pessoal' : s === 2 ? 'Contato' : s === 3 ? 'Interesses' : 'Descrição'}
                </span>
            </div>
        {/each}
    </div>
    
    <!-- Step 1: Informações Pessoais -->
    {#if step === 1}
        <form on:submit|preventDefault={nextStep} class="space-y-2">
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
                        {#each generos as g}
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
                        {#each sexualidades as s}
                            <option value={s.value}>{s.label}</option>
                        {/each}
                    </select>
                    {#if errors.sexualidade}
                        <span class="text-xs text-red-500">{errors.sexualidade}</span>
                    {/if}
                </div>
            </div>
            
            <SubmitButton text="Próximo" />
        </form>
    {/if}
    
    <!-- Step 2: Contatos -->
    {#if step === 2}
        <form on:submit|preventDefault={nextStep} class="space-y-2">
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
                <!-- VOLTAR TAMBÉM USA SUBMITBUTTON - com cor cinza -->
                <SubmitButton 
                    text="Voltar"
                    on:click={prevStep}
                    customClass="bg-gray-500 hover:bg-gray-400 focus:ring-gray-300"
                />
                
                <!-- PRÓXIMO USA SUBMITBUTTON NORMAL -->
                <SubmitButton text="Próximo" />
            </div>
        </form>
    {/if}
    
    <!-- Step 3: Tags -->
    {#if step === 3}
        <form on:submit|preventDefault={nextStep} class="space-y-2">
            <TagsSelector bind:selectedTags={formData.tags} />
            
            <div class="flex gap-2 mt-4">
                <!-- VOLTAR TAMBÉM USA SUBMITBUTTON - com cor cinza -->
                <SubmitButton 
                    text="Voltar"
                    on:click={prevStep}
                    customClass="bg-gray-500 hover:bg-gray-400 focus:ring-gray-300"
                />
                
                <!-- PRÓXIMO USA SUBMITBUTTON NORMAL -->
                <SubmitButton text="Próximo" />
            </div>
        </form>
    {/if}
    
    <!-- Step 4: Descrição -->
    {#if step === 4}
        <form on:submit|preventDefault={handleSubmit} class="space-y-2">
            <div class="relative flex flex-col mt-2">
                <label for={descricaoId} class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Sobre você
                </label>
                <textarea
                    id={descricaoId}
                    bind:value={formData.descricao}
                    rows="5"
                    placeholder="Conte um pouco sobre seus hobbies, interesses, personalidade..."
                    class="block w-full py-2 text-sm text-gray-700 bg-white border rounded-lg px-3 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                ></textarea>
                <span class="text-xs text-gray-500 mt-0.5 text-right">
                    {formData.descricao?.length || 0}/500
                </span>
            </div>
            
            <!-- Preview simples -->
            <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <p class="font-medium mb-1">Preview do perfil:</p>
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
                <!-- VOLTAR TAMBÉM USA SUBMITBUTTON - com cor cinza -->
                <SubmitButton 
                    text="Voltar"
                    on:click={prevStep}
                    disabled={loading}
                    customClass="bg-gray-500 hover:bg-gray-400 focus:ring-gray-300"
                />
                
                <!-- FINALIZAR USA SUBMITBUTTON NORMAL -->
                <SubmitButton 
                    text="Finalizar" 
                    {loading} 
                    disabled={loading}
                />
            </div>
        </form>
    {/if}
</LoginSection>