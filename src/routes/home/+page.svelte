<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    interface Pessoa {
        id: string;
        nome: string;
        idade: number;
        curso: string;
        periodo: string;
        distancia: string;
        fotos: string[];
        tags: string[];
        descricao: string;
    }
    
    let pessoas: Pessoa[] = [];
    let currentIndex = 0;
    let loading = true;
    let animacao = '';
    let fotoIndex = 0;
    
    onMount(async () => {
        loading = true;
        await new Promise(r => setTimeout(r, 1000));
        
        pessoas = [
            {
                id: '1',
                nome: 'Ana Silva',
                idade: 23,
                curso: 'Medicina',
                periodo: '8° período',
                distancia: '2km',
                fotos: [
                    'https://randomuser.me/api/portraits/women/44.jpg',
                    'https://randomuser.me/api/portraits/women/45.jpg',
                    'https://randomuser.me/api/portraits/women/46.jpg'
                ],
                tags: ['Música', 'Viagem', 'Cinema'],
                descricao: 'Amo música e viajar. Busco alguém para compartilhar momentos especiais.'
            },
            {
                id: '2',
                nome: 'João Santos',
                idade: 25,
                curso: 'Engenharia',
                periodo: '10° período',
                distancia: '5km',
                fotos: [
                    'https://randomuser.me/api/portraits/men/32.jpg',
                    'https://randomuser.me/api/portraits/men/33.jpg'
                ],
                tags: ['Esportes', 'Tecnologia', 'Jogos'],
                descricao: 'Apaixonado por tecnologia e esportes. Vamos jogar um futebol?'
            }
        ];
        
        loading = false;
    });
    
    $: pessoaAtual = pessoas[currentIndex];
    
    const like = () => {
        animacao = 'animate-like';
        console.log('Like:', pessoaAtual?.id);
        
        setTimeout(() => {
            if (currentIndex < pessoas.length - 1) {
                currentIndex++;
                fotoIndex = 0;
            } else {
                currentIndex = -1;
            }
            animacao = '';
        }, 300);
    };
    
    const dislike = () => {
        animacao = 'animate-dislike';
        console.log('Dislike:', pessoaAtual?.id);
        
        setTimeout(() => {
            if (currentIndex < pessoas.length - 1) {
                currentIndex++;
                fotoIndex = 0;
            } else {
                currentIndex = -1;
            }
            animacao = '';
        }, 300);
    };
    
    const proximaFoto = () => {
        if (pessoaAtual && fotoIndex < pessoaAtual.fotos.length - 1) {
            fotoIndex++;
        }
    };
    
    const fotoAnterior = () => {
        if (fotoIndex > 0) {
            fotoIndex--;
        }
    };
    
    const handleKeyDownFotoAnterior = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fotoAnterior();
        }
    };
    
    const handleKeyDownFotoProxima = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            proximaFoto();
        }
    };
    
    const irParaMatches = () => {
        goto('/matches', { replaceState: true });
    };
    
    const irParaPerfil = () => {
        goto('/profile', { replaceState: true });
    };
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-pink-600">PairUp</h1>
        
        <div class="flex gap-4">
            <button 
                on:click={irParaMatches}
                class="relative"
                aria-label="Ver matches"
                title="Matches"
            >
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            
            <button 
                on:click={irParaPerfil}
                aria-label="Ver perfil"
                title="Perfil"
            >
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </button>
        </div>
    </header>
    
    <main class="p-4 max-w-md mx-auto">
        {#if loading}
            <div class="flex justify-center items-center h-[70vh]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        {:else if currentIndex === -1}
            <div class="text-center py-20">
                <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Não há mais pessoas</h2>
                <p class="text-gray-500 dark:text-gray-400 mb-6">Volte mais tarde</p>
                <button 
                    on:click={() => currentIndex = 0}
                    class="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                    Recarregar
                </button>
            </div>
        {:else}
            <div class="relative {animacao} transition-transform duration-300">
                <div class="relative rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-800">
                    <div class="aspect-3/4 relative">
                        <img 
                            src={pessoaAtual.fotos[fotoIndex]} 
                            alt={pessoaAtual.nome}
                            class="w-full h-full object-cover"
                        />
                        
                        <div class="absolute inset-0 flex">
                            <button 
                                type="button"
                                on:click={fotoAnterior}
                                on:keydown={handleKeyDownFotoAnterior}
                                class="w-1/2 h-full cursor-pointer focus:outline-none"
                                aria-label="Foto anterior"
                                title="Foto anterior"
                            ></button>
                            <button 
                                type="button"
                                on:click={proximaFoto}
                                on:keydown={handleKeyDownFotoProxima}
                                class="w-1/2 h-full cursor-pointer focus:outline-none"
                                aria-label="Próxima foto"
                                title="Próxima foto"
                            ></button>
                        </div>
                        
                        {#if pessoaAtual.fotos.length > 1}
                            <div class="absolute top-4 left-0 right-0 flex justify-center gap-1">
                                {#each pessoaAtual.fotos as _, index (index)}
                                    <div 
                                        class={`
                                            h-1 rounded-full transition-all duration-300
                                            ${index === fotoIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}
                                        `}
                                        aria-label={`Foto ${index + 1} de ${pessoaAtual.fotos.length}`}
                                    ></div>
                                {/each}
                            </div>
                        {/if}
                        
                        <div class="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            📍 {pessoaAtual.distancia}
                        </div>
                    </div>
                    
                    <div class="p-4">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {pessoaAtual.nome}, {pessoaAtual.idade}
                        </h2>
                        
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {pessoaAtual.curso} • {pessoaAtual.periodo}
                        </p>
                        
                        <div class="flex flex-wrap gap-1 mb-3">
                            {#each pessoaAtual.tags as tag (tag)}
                                <span class="px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-xs rounded-full">
                                    {tag}
                                </span>
                            {/each}
                        </div>
                        
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {pessoaAtual.descricao}
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-center gap-6 mt-6">
                <button 
                    on:click={dislike}
                    class="w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-red-500 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Dislike"
                    title="Dislike"
                >
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <button 
                    on:click={like}
                    class="w-16 h-16 bg-pink-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Like"
                    title="Like"
                >
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
        {/if}
    </main>
</div>

<style>
    .animate-like {
        animation: like 0.3s ease-out;
    }
    
    .animate-dislike {
        animation: dislike 0.3s ease-out;
    }
    
    @keyframes like {
        0% { transform: translateX(0) rotate(0); opacity: 1; }
        100% { transform: translateX(200px) rotate(20deg); opacity: 0; }
    }
    
    @keyframes dislike {
        0% { transform: translateX(0) rotate(0); opacity: 1; }
        100% { transform: translateX(-200px) rotate(-20deg); opacity: 0; }
    }
</style>