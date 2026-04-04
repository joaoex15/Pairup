// $lib/services/api.ts
// ✅ ÚNICO arquivo de requisições — não faça fetch em nenhum outro lugar.
// ✅ BASE_URL vem de .env (VITE_API_BASE). Nunca hardcode a URL.

import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// ─── Configuração da BASE_URL com fallbacks seguros ─────────────────────────

const getBaseUrl = (): string => {
    // Prioridade 1: Variável do .env (Vercel/Railway/Cloud)
    if (import.meta.env.VITE_API_BASE) {
        return import.meta.env.VITE_API_BASE;
    }
    
    // Prioridade 2: VITE_API_URL (fallback compatível)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Prioridade 3: URL do deployment atual (Vercel)
    if (import.meta.env.VERCEL_URL) {
        const protocol = import.meta.env.VERCEL_ENV === 'production' ? 'https' : 'http';
        return `${protocol}://${import.meta.env.VERCEL_URL}`;
    }
    
    // Prioridade 4: Ambiente de desenvolvimento local
    if (import.meta.env.DEV) {
        console.warn('[api] Usando URL de desenvolvimento local. Configure VITE_API_BASE no .env');
        return 'http://localhost:8080';
    }
    
    // Prioridade 5: Fallback para produção (Railway)
    console.warn('[api] Usando URL de fallback. Configure VITE_API_BASE no ambiente.');
    return 'https://pairup-production-b9ee.up.railway.app';
};

const BASE_URL = getBaseUrl();

if (import.meta.env.DEV) {
    console.log(`[api] API Base URL: ${BASE_URL}`);
}

// ─── Rate Limiting (client-side) ───────────────────────────────────────────

const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 30;

const checkRateLimit = (endpoint: string): boolean => {
    const now = Date.now();
    const timestamps = rateLimiter.get(endpoint) || [];
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    
    if (recent.length >= RATE_LIMIT_MAX) {
        console.warn(`[api] Rate limit exceeded for ${endpoint}`);
        return false;
    }
    
    recent.push(now);
    rateLimiter.set(endpoint, recent);
    return true;
};

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
        const token = localStorage.getItem('token');
        if (token) return token;
        
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const user = JSON.parse(raw);
        return user?.token ?? null;
    } catch {
        return null;
    }
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// ⚠️ CORS FIX: Removido header 'X-Requested-With' que causava problema
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisições. Aguarde um momento.', status: 429 };
    }
    
    // Headers básicos - sem X-Requested-With para evitar CORS
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options.headers as Record<string, string> ?? {}),
    };

    try {
        const url = `${BASE_URL}${endpoint}`;
        
        const res = await fetch(url, { 
            ...options, 
            headers,
            mode: 'cors', // Explicitamente CORS
            credentials: 'omit' // Mude para 'include' se precisar de cookies
        });

        if (res.status === 401 && browser) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            if (!window.location.pathname.includes('/auth') && window.location.pathname !== '/') {
                goto('/');
            }
        }

        if (res.status === 204 || res.status === 205) {
            return { status: res.status };
        }

        const text = await res.text();
        let body: unknown;
        try { 
            body = JSON.parse(text); 
        } catch { 
            body = text; 
        }

        if (!res.ok) {
            const msg = typeof body === 'string'
                ? body
                : (body as any)?.erro ?? (body as any)?.message ?? `HTTP ${res.status}`;
            return { error: msg, status: res.status };
        }

        return { data: body as T, status: res.status };
    } catch (err) {
        console.error(`[api] Request failed: ${endpoint}`, err);
        
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            return { error: 'Erro de conexão. Verifique sua internet.', status: 0 };
        }
        
        return { error: err instanceof Error ? err.message : 'Erro inesperado', status: 0 };
    }
}

// Multipart sem headers problemáticos
async function requestMultipart<T>(
    endpoint: string,
    body: FormData
): Promise<ApiResponse<T>> {
    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisições. Aguarde um momento.', status: 429 };
    }
    
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: authHeaders(), // Sem Content-Type (FormData define)
            mode: 'cors',
            credentials: 'omit',
            body,
        });

        if (res.status === 401 && browser) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/auth')) {
                goto('/');
            }
        }

        if (!res.ok) {
            const text = await res.text();
            return { error: text || `HTTP ${res.status}`, status: res.status };
        }

        const data = await res.json();
        return { data, status: res.status };
    } catch (err) {
        console.error(`[api] Upload failed: ${endpoint}`, err);
        return { error: err instanceof Error ? err.message : 'Erro no upload', status: 0 };
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

export const apiForgotPassword = (email: string): Promise<ApiResponse> =>
    request('/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

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

export const apiImagemProxyUrl = (publicId: string): string => {
    const token = getToken();
    const base = `${BASE_URL}/api/imagens/proxy/${publicId}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
};

// ─── Tags ───────────────────────────────────────────────────────────────────

export const apiGetTags = () =>
    request<TagResponse[]>('/tags');

export const apiGetTagsAtivas = () =>
    request<TagResponse[]>('/tags/ativas');

// ─── OAuth2 ─────────────────────────────────────────────────────────────────

export const getGoogleOAuthUrl = (): string =>
    `${BASE_URL}/oauth2/authorization/google`;

export const getApiBaseUrl = (): string => BASE_URL;