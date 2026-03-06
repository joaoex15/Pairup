<script lang="ts">
    import { goto } from '$app/navigation';
    
    interface Match {
        id: string;
        nome: string;
        idade: number;
        curso: string;
        periodo: string;
        foto: string;
        instagram?: string;
        whatsapp?: string;
        telegram?: string;
        matchDate: string;
    }
    
    interface Like {
        id: string;
        nome: string;
        idade: number;
        curso: string;
        periodo: string;
        foto: string;
        likeReciproco: boolean;
    }
    
    let activeTab: 'matches' | 'likes' = 'matches';
    
    let matches: Match[] = [
        {
            id: '1',
            nome: 'Ana Silva',
            idade: 23,
            curso: 'Medicina',
            periodo: '8° período',
            foto: 'https://randomuser.me/api/portraits/women/44.jpg',
            instagram: '@ana_silva',
            whatsapp: '(79) 99999-9999',
            telegram: '@ana_silva',
            matchDate: '2 dias atrás'
        },
        {
            id: '2',
            nome: 'Mariana Costa',
            idade: 22,
            curso: 'Direito',
            periodo: '6° período',
            foto: 'https://randomuser.me/api/portraits/women/63.jpg',
            instagram: '@mariana_costa',
            matchDate: '5 dias atrás'
        }
    ];
    
    let likes: Like[] = [
        {
            id: '3',
            nome: 'João Santos',
            idade: 25,
            curso: 'Engenharia',
            periodo: '10° período',
            foto: 'https://randomuser.me/api/portraits/men/32.jpg',
            likeReciproco: true
        },
        {
            id: '4',
            nome: 'Pedro Lima',
            idade: 26,
            curso: 'Arquitetura',
            periodo: '8° período',
            foto: 'https://randomuser.me/api/portraits/men/52.jpg',
            likeReciproco: false
        },
        {
            id: '5',
            nome: 'Carla Souza',
            idade: 24,
            curso: 'Psicologia',
            periodo: '7° período',
            foto: 'https://randomuser.me/api/portraits/women/68.jpg',
            likeReciproco: true
        }
    ];
    
    $: likesPendentes = likes.filter(l => !l.likeReciproco);
    $: todosMatches = [
        ...matches,
        ...likes.filter(l => l.likeReciproco).map(l => ({
            id: l.id,
            nome: l.nome,
            idade: l.idade,
            curso: l.curso,
            periodo: l.periodo,
            foto: l.foto,
            matchDate: 'Hoje'
        }))
    ];
    
    const irParaHome = () => {
        goto('/home', { replaceState: true });
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
        <h1 class="text-xl font-bold text-pink-600">PairUp - Matches</h1>
    </header>
    
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex max-w-md mx-auto">
            <button 
                on:click={() => activeTab = 'matches'}
                class={`
                    flex-1 py-3 text-sm font-medium relative
                    ${activeTab === 'matches' ? 'text-pink-600' : 'text-gray-500'}
                `}
            >
                Matches ({todosMatches.length})
                {#if activeTab === 'matches'}
                    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
                {/if}
            </button>
            
            <button 
                on:click={() => activeTab = 'likes'}
                class={`
                    flex-1 py-3 text-sm font-medium relative
                    ${activeTab === 'likes' ? 'text-pink-600' : 'text-gray-500'}
                `}
            >
                Likes ({likesPendentes.length})
                {#if activeTab === 'likes'}
                    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
                {/if}
            </button>
        </div>
    </div>
    
    <main class="max-w-md mx-auto p-4">
        {#if activeTab === 'matches'}
            {#if todosMatches.length === 0}
                <div class="text-center py-20">
                    <svg class="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 mb-2">Nenhum match ainda</p>
                    <p class="text-sm text-gray-400">Continue dando likes para encontrar pessoas</p>
                </div>
            {:else}
                <div class="space-y-4">
                    {#each todosMatches as match (match.id)}
                        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <div class="flex items-center gap-3 mb-3">
                                <img 
                                    src={match.foto} 
                                    alt={match.nome} 
                                    class="w-16 h-16 rounded-full object-cover border-2 border-pink-500"
                                />
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-800 dark:text-white">
                                        {match.nome}, {match.idade}
                                    </h3>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                        {match.curso} • {match.periodo}
                                    </p>
                                    <p class="text-xs text-gray-400 mt-1">
                                        Match {match.matchDate}
                                    </p>
                                </div>
                            </div>
                            
                            <div class="border-t border-gray-100 dark:border-gray-700 pt-3">
                                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Contatos disponíveis:
                                </p>
                                <div class="flex flex-wrap gap-2">
                                    {#if match.instagram}
                                        <a 
                                            href={`https://instagram.com/${match.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full hover:opacity-90"
                                        >
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                                            </svg>
                                            {match.instagram}
                                        </a>
                                    {/if}
                                    
                                    {#if match.whatsapp}
                                        <a 
                                            href={`https://wa.me/55${match.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600"
                                        >
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.98.58 3.91 1.67 5.56L2.09 22l4.66-1.61c1.59.91 3.41 1.4 5.28 1.4 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.73 14.3c-.22.61-1.27 1.12-2.08 1.19-.54.05-1.18.09-2.02-.13-2.71-.72-4.97-3.05-5.13-3.21-.16-.16-2.36-2.7-2.36-5.15 0-2.45 1.6-3.62 2.15-4.11.27-.24.61-.33.96-.33h.3c.27 0 .53.01.77.05.36.06.84.45 1.05 1.04.21.59.71 2.04.77 2.19.06.15.12.37.02.58-.1.21-.18.31-.34.51-.16.2-.32.36-.48.58-.15.19-.3.4-.14.73.16.33.73 1.33 1.56 2.15 1.07 1.06 1.97 1.4 2.27 1.55.3.15.49.12.67-.07.18-.19.77-.91.98-1.22.21-.31.42-.27.72-.15.3.12 1.92.92 2.25 1.09.33.17.55.26.63.41.08.15.05.83-.17 1.44z"/>
                                            </svg>
                                            WhatsApp
                                        </a>
                                    {/if}
                                    
                                    {#if match.telegram}
                                        <a 
                                            href={`https://t.me/${match.telegram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600"
                                        >
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.43.52-.47-.01-1.37-.26-2.04-.48-.82-.27-1.47-.42-1.42-.89.03-.24.27-.49.74-.75 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.36-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                            </svg>
                                            {match.telegram}
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {:else}
            {#if likesPendentes.length === 0}
                <div class="text-center py-20">
                    <svg class="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 mb-2">Nenhum like recebido</p>
                    <p class="text-sm text-gray-400">Continue dando likes para aparecer aqui</p>
                </div>
            {:else}
                <div class="grid grid-cols-2 gap-3">
                    {#each likesPendentes as like (like.id)}
                        <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                            <div class="relative">
                                <img 
                                    src={like.foto} 
                                    alt={like.nome} 
                                    class="w-full aspect-square object-cover"
                                />
                                <div class="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                                    Like
                                </div>
                            </div>
                            <div class="p-3">
                                <h3 class="font-semibold text-gray-800 dark:text-white text-sm">
                                    {like.nome}, {like.idade}
                                </h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {like.curso}
                                </p>
                                <p class="text-xs text-gray-400 mt-1">
                                    {like.periodo}
                                </p>
                                <div class="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                    ⏳ Aguardando match...
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </main>
</div>