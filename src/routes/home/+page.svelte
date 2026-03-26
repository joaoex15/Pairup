<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';

    type Genero      = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    type Sexualidade = 'HETERO' | 'HOMOSEXUAL' | 'BI' | 'PAN' | 'ASSEXUAL' | 'OUTRO';

    interface Pessoa {
        id: string; nome: string; email?: string;
        genero?: Genero; sexualidade?: Sexualidade;
        curso?: string; periodo?: string;
        fotos?: string[];
        tags?: { id: string; nome: string }[] | string[];
        descricao?: string;
    }
    interface ApiTag { id: string; nome: string; }

    let todasPessoas: Pessoa[] = [];
    let pessoas: Pessoa[]      = [];
    let currentIndex = 0;
    let loading = true;
    let swipeDir: 'like' | 'dislike' | '' = '';
    let matchCount = 0;
    let fotoIndex = 0;
    let minhaPessoaId = '';
    let minhaPessoa: Pessoa | null = null;

    // IDs já avaliados nesta sessão (like ou dislike)
    let avaliadosIds = new Set<string>();

    let showFilters = false;
    let filtroTags: ApiTag[] = [];
    let availableTags: ApiTag[] = [];
    let tagsLoading = true;
    let searchTagTerm = '';

    const API = 'https://pairup-production-b9ee.up.railway.app';
    const storedUser = browser ? JSON.parse(localStorage.getItem('user') ?? 'null') : null;
    const MEU_EMAIL: string = storedUser?.email ?? '';

    const driveUrl = (caminho: string): string => {
        if (!caminho) return '';
        const id = caminho.startsWith('google-drive:') ? caminho.replace('google-drive:', '') : caminho;
        return `${API}/api/imagens/proxy/${id}`;
    };

    const fetchFotos = async (pessoaId: string): Promise<string[]> => {
        try {
            const res = await fetch(`${API}/api/imagens/pessoa/${pessoaId}`);
            if (!res.ok) return [];
            const imagens: { caminho: string; perfil: boolean }[] = await res.json();
            return imagens
                .sort((a, b) => (b.perfil ? 1 : 0) - (a.perfil ? 1 : 0))
                .map(i => driveUrl(i.caminho))
                .filter(Boolean);
        } catch { return []; }
    };

    const normalizarTags = (tags: any): ApiTag[] => {
        if (!tags || !Array.isArray(tags)) return [];
        return tags.map((t: any) =>
            typeof t === 'string' ? { id: t, nome: t } : { id: t.id ?? t.nome, nome: t.nome ?? '' }
        ).filter(t => t.nome);
    };

    // ── Compatibilidade corrigida ──
    const pessoasCompativeis = (eu: Pessoa, outra: Pessoa): boolean => {
        const meuG  = eu.genero;
        const meuS  = eu.sexualidade;
        const outG  = outra.genero;
        const outS  = outra.sexualidade;

        if (!meuG || !meuS || !outG || !outS) return true;

        // Eu me interesso por outra?
        const euMeInteresso = (): boolean => {
            switch (meuS) {
                case 'BI': case 'PAN': case 'ASSEXUAL': case 'OUTRO': return true;
                case 'HETERO':
                    if (meuG === 'MASCULINO') return outG === 'FEMININO';
                    if (meuG === 'FEMININO')  return outG === 'MASCULINO';
                    return true;
                case 'HOMOSEXUAL':
                    if (meuG === 'MASCULINO') return outG === 'MASCULINO';
                    if (meuG === 'FEMININO')  return outG === 'FEMININO';
                    return true;
                default: return true;
            }
        };

        // Outra se interessa por mim?
        const outraSeInteressa = (): boolean => {
            switch (outS) {
                case 'BI': case 'PAN': case 'ASSEXUAL': case 'OUTRO': return true;
                case 'HETERO':
                    if (outG === 'MASCULINO') return meuG === 'FEMININO';
                    if (outG === 'FEMININO')  return meuG === 'MASCULINO';
                    return true;
                case 'HOMOSEXUAL':
                    if (outG === 'MASCULINO') return meuG === 'MASCULINO';
                    if (outG === 'FEMININO')  return meuG === 'FEMININO';
                    return true;
                default: return true;
            }
        };

        return euMeInteresso() && outraSeInteressa();
    };

    const temTagEmComum = (pessoa: Pessoa): boolean => {
        if (filtroTags.length === 0) return true;
        const tagsPessoa = normalizarTags(pessoa.tags).map(t => t.id);
        return filtroTags.some(ft => tagsPessoa.includes(ft.id));
    };

    const aplicarFiltros = () => {
        if (!minhaPessoa) {
            pessoas = todasPessoas.filter(p => !avaliadosIds.has(p.id));
        } else {
            pessoas = todasPessoas.filter(p =>
                !avaliadosIds.has(p.id) &&
                pessoasCompativeis(minhaPessoa!, p) &&
                temTagEmComum(p)
            );
        }
        currentIndex = pessoas.length > 0 ? 0 : -1;
        fotoIndex = 0;
        showFilters = false;
    };

    const limparFiltros = () => { filtroTags = []; aplicarFiltros(); };

    $: filtroAtivo = filtroTags.length > 0;
    $: tagsDisponiveis = availableTags.filter(t =>
        t.nome.toLowerCase().includes(searchTagTerm.toLowerCase())
    );
    const isTagFiltro = (id: string) => filtroTags.some(t => t.id === id);
    const toggleFiltroTag = (tag: ApiTag) => {
        if (isTagFiltro(tag.id)) filtroTags = filtroTags.filter(t => t.id !== tag.id);
        else filtroTags = [...filtroTags, tag];
    };

    onMount(async () => {
        fetch(`${API}/tags/ativas`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { availableTags = data; })
            .finally(() => { tagsLoading = false; });

        try {
            if (MEU_EMAIL) {
                const res = await fetch(`${API}/pessoas`);
                if (res.ok) {
                    const lista = await res.json();
                    const minha = lista.find((p: any) => p.email === MEU_EMAIL);
                    if (minha) {
                        minhaPessoaId = minha.id;
                        minhaPessoa   = minha;
                        const matchRes = await fetch(`${API}/matches/${minha.id}`);
                        if (matchRes.ok) {
                            const matches = await matchRes.json();
                            matchCount = Array.isArray(matches) ? matches.length : 0;
                        }
                    }
                }
            }
        } catch { /* ignora */ }

        try {
            const res = await fetch(`${API}/pessoas`);
            if (res.ok) {
                const data: any[] = await res.json();
                const semEu = MEU_EMAIL ? data.filter((p: any) => p.email !== MEU_EMAIL) : data;

                todasPessoas = await Promise.all(
                    semEu.map(async (p: any) => ({
                        ...p,
                        fotos: await fetchFotos(p.id),
                        tags:  normalizarTags(p.tags),
                    }))
                );
                aplicarFiltros();
            } else {
                currentIndex = -1;
            }
        } catch {
            currentIndex = -1;
        } finally {
            loading = false;
        }
    });

    $: pessoaAtual = currentIndex >= 0 ? (pessoas[currentIndex] ?? null) : null;
    $: totalFotos  = pessoaAtual?.fotos?.length ?? 0;

    const avancar = () => {
        setTimeout(() => {
            fotoIndex = 0;
            swipeDir = '';
            // Remove a pessoa avaliada da lista e avança
            if (pessoaAtual) pessoas = pessoas.filter(p => p.id !== pessoaAtual!.id);
            currentIndex = pessoas.length > 0 ? 0 : -1;
        }, 320);
    };

    const like = async () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'like';
        avaliadosIds = new Set([...avaliadosIds, pessoaAtual.id]);
        try {
            if (minhaPessoaId) {
                await fetch(`${API}/likes?origemId=${minhaPessoaId}&destinoId=${pessoaAtual.id}`, { method: 'POST' });
            }
        } catch { /* ignora */ }
        avancar();
    };

    const dislike = () => {
        if (!pessoaAtual || swipeDir) return;
        swipeDir = 'dislike';
        avaliadosIds = new Set([...avaliadosIds, pessoaAtual.id]);
        avancar();
    };

    const fotoAnterior = () => { if (fotoIndex > 0) fotoIndex--; };
    const proximaFoto  = () => { if (fotoIndex < totalFotos - 1) fotoIndex++; };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragging = false;
    let dragX = 0;

    const onTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now(); isDragging = false; dragX = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
            isDragging = true; dragX = dx; e.preventDefault();
        }
    };
    const onTouchEnd = (e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const duration = Date.now() - touchStartTime;
        const speed = Math.abs(dx) / duration;
        dragX = 0;
        if (!isDragging && Math.abs(dx) < 10 && Math.abs(dy) < 10 && duration < 250) {
            const cardEl = e.currentTarget as HTMLElement;
            const tapX = e.changedTouches[0].clientX - cardEl.getBoundingClientRect().left;
            if (tapX < cardEl.offsetWidth / 2) fotoAnterior(); else proximaFoto();
            isDragging = false; return;
        }
        if (isDragging && (Math.abs(dx) > 80 || speed > 0.4)) {
            if (dx > 0) like(); else dislike();
        }
        isDragging = false;
    };

    const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') like();
        if (e.key === 'ArrowLeft')  dislike();
        if (e.key === 'ArrowUp')    proximaFoto();
        if (e.key === 'ArrowDown')  fotoAnterior();
        if (e.key === 'Escape')     showFilters = false;
    };

    $: cardStyle = isDragging
        ? `transform: translateX(${dragX}px) rotate(${dragX * 0.04}deg); transition: none;`
        : '';
</script>