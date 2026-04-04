// $lib/services/api.ts
// ✅ ÚNICO arquivo de requisições — não faça fetch em nenhum outro lugar.
// ✅ BASE_URL vem de .env (VITE_API_BASE). Nunca hardcode a URL.

import { browser } from '$app/environment';

const BASE_URL = import.meta.env.VITE_API_BASE as string;

if (!BASE_URL) {
    console.error('[api] VITE_API_BASE não definido no .env');
}

// ─── Tipos de resposta ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    status?: number;
}

export interface LoginResponse {
    token: string;
    userId: string;
    email: string;
}

export interface UserResponse {
    id: string;
    email: string;
    nome?: string;
    provider?: string;
}

export interface PessoaResponse {
    id: string;
    nome: string;
    email: string;
    curso?: string;
    dataNasc?: string;
    genero?: 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    interesse?: 'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';
    descricao?: string;
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
    ativo?: boolean;
    cienciaResponsabilidade?: boolean;
    usuarioId?: string;
    tags?: TagResponse[];
}

export interface PessoaPayload {
    nome: string;
    email: string;
    curso?: string;
    dataNasc?: string;
    genero: string;
    interesse: string;
    descricao?: string;
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
    ativo?: boolean;
    usuarioId?: string;
    tags?: { id: string; nome: string }[];
    id?: string;
}

export interface TagResponse {
    id: string;
    nome: string;
    descricao?: string;
    categoria: string;
    ativa: boolean;
}

export interface ImagemResponse {
    id: string;
    url: string;
    publicId: string;
    perfil: boolean;
}

export interface MatchResponse {
    id: string;
    pessoaId1: string;
    pessoaId2: string;
    ativo: boolean;
}

export interface RedesSociaisResponse {
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
}

export interface LikeResponse {
    id: string;
    pessoaOrigemId: string;
    pessoaDestinoId: string;
    ativo: boolean;
}

export interface LikeResultResponse {
    like?: LikeResponse;
    match?: MatchResponse;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// ─── Helpers internos ───────────────────────────────────────────────────────

function getToken(): string | null {
    if (!browser) return null;
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        return JSON.parse(raw)?.token ?? null;
    } catch {
        return null;
    }
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options.headers as Record<string, string> ?? {}),
    };

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

        // Respostas sem corpo (204, 205)
        if (res.status === 204 || res.status === 205) {
            return { status: res.status };
        }

        const text = await res.text();
        let body: unknown;
        try { body = JSON.parse(text); } catch { body = text; }

        if (!res.ok) {
            const msg = typeof body === 'string'
                ? body
                : (body as any)?.erro ?? (body as any)?.message ?? `HTTP ${res.status}`;
            return { error: msg, status: res.status };
        }

        return { data: body as T, status: res.status };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Erro de rede' };
    }
}

// Multipart (sem Content-Type para o browser definir boundary)
async function requestMultipart<T>(
    endpoint: string,
    body: FormData
): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: authHeaders(),
            body,
        });

        if (!res.ok) {
            const text = await res.text();
            return { error: text || `HTTP ${res.status}`, status: res.status };
        }

        const data = await res.json();
        return { data, status: res.status };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Erro de rede' };
    }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const apiLogin = (email: string, password: string) =>
    request<LoginResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const apiRegister = (user: { nome: string; email: string; password: string }) =>
    request<UserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(user),
    });

/** Rota não existe no backend — retorna erro controlado sem quebrar. */
export const apiForgotPassword = (_email: string): Promise<ApiResponse> =>
    Promise.resolve({ error: 'Recuperação de senha não disponível no momento.' });

export const apiGetMe = () =>
    request<UserResponse>('/users/me');

export const apiUpdateMe = (user: Partial<UserResponse>) =>
    request<UserResponse>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(user),
    });

export const apiDeleteMe = () =>
    request('/users/me', { method: 'DELETE' });

// ─── Pessoas ────────────────────────────────────────────────────────────────

/**
 * Lista perfis com filtros opcionais.
 * Retorna Page<PessoaPerfilDTO> — use .content para o array.
 */
export const apiGetPessoas = (params?: {
    interesse?: string;
    genero?: string;
    page?: number;
    size?: number;
}) => {
    const qs = new URLSearchParams();
    if (params?.interesse) qs.set('interesse', params.interesse);
    if (params?.genero)    qs.set('genero',    params.genero);
    qs.set('page', String(params?.page ?? 0));
    qs.set('size', String(params?.size ?? 50));
    return request<PageResponse<PessoaResponse>>(`/pessoas?${qs}`);
};

export const apiGetPessoa = (id: string) =>
    request<PessoaResponse>(`/pessoas/${id}/perfil`);

export const apiGetMyProfile = () =>
    request<PessoaResponse>('/pessoas/me');

export const apiCreatePessoa = (pessoa: PessoaPayload) =>
    request<PessoaResponse>('/pessoas', {
        method: 'POST',
        body: JSON.stringify(pessoa),
    });

export const apiUpdateMyProfile = (pessoa: PessoaPayload) =>
    request<PessoaResponse>('/pessoas/me', {
        method: 'PUT',
        body: JSON.stringify(pessoa),
    });

export const apiDeleteMyProfile = () =>
    request('/pessoas/me', { method: 'DELETE' });

export const apiMarcarCiencia = () =>
    request<PessoaResponse>('/pessoas/me/ciencia-responsabilidade', { method: 'PATCH' });

// ─── Matches ────────────────────────────────────────────────────────────────

export const apiGetMyMatches = (page = 0, size = 20) =>
    request<PageResponse<MatchResponse>>(`/matches/meus?page=${page}&size=${size}`);

export const apiGetMatchRedesSociais = (matchId: string) =>
    request<RedesSociaisResponse>(`/matches/${matchId}/redes-sociais`);

export const apiDesfazerMatch = (matchId: string) =>
    request(`/matches/desfazer/${matchId}`, { method: 'PUT' });

// ─── Likes ──────────────────────────────────────────────────────────────────

export const apiDarLike = (destinoId: string) =>
    request<LikeResultResponse>(`/likes?destinoId=${destinoId}`, { method: 'POST' });

export const apiGetLikesDados = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/dados?page=${page}&size=${size}`);

export const apiGetLikesRecebidos = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/recebidos?page=${page}&size=${size}`);

// ─── Imagens ────────────────────────────────────────────────────────────────

export const apiUploadImagem = (file: File, perfil: boolean) => {
    const form = new FormData();
    form.append('file', file);
    form.append('perfil', String(perfil));
    return requestMultipart<ImagemResponse>('/imagens/upload', form);
};

export const apiDeleteImagem = (imagemId: string) =>
    request(`/imagens/${imagemId}`, { method: 'DELETE' });

/**
 * Retorna a URL pública do proxy (sem fazer download do blob).
 * Use direto no src da <img>.
 */
export const apiImagemProxyUrl = (publicId: string): string =>
    `${BASE_URL}/api/imagens/proxy/${publicId}?token=${getToken() ?? ''}`;

// ─── Tags ───────────────────────────────────────────────────────────────────

export const apiGetTags = () =>
    request<TagResponse[]>('/tags');

export const apiGetTagsAtivas = () =>
    request<TagResponse[]>('/tags/ativas');

// ─── OAuth2 ─────────────────────────────────────────────────────────────────

export const getGoogleOAuthUrl = (): string =>
    `${BASE_URL}/oauth2/authorization/google`;