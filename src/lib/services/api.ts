// $lib/services/api.ts
// ✅ ÚNICO arquivo de requisições — não faça fetch em nenhum outro lugar.
// ✅ BASE_URL vem de .env (VITE_API_BASE). Nunca hardcode a URL.

import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// ─── Configuração da BASE_URL ─────────────────────────────────────────────────

const getBaseUrl = (): string => {
    if (import.meta.env.VITE_API_BASE)  return import.meta.env.VITE_API_BASE;
    if (import.meta.env.VITE_API_URL)   return import.meta.env.VITE_API_URL;
    if (import.meta.env.VERCEL_URL) {
        const protocol = import.meta.env.VERCEL_ENV === 'production' ? 'https' : 'http';
        return `${protocol}://${import.meta.env.VERCEL_URL}`;
    }
    if (import.meta.env.DEV) {
        console.warn('[api] Usando URL de desenvolvimento local. Configure VITE_API_BASE no .env');
        return 'http://localhost:8080';
    }
    console.warn('[api] Usando URL de fallback. Configure VITE_API_BASE no ambiente.');
    return 'https://pairup-production-b9ee.up.railway.app';
};

const BASE_URL = getBaseUrl();

if (import.meta.env.DEV) {
    console.log(`[api] API Base URL: ${BASE_URL}`);
}

// ─── Rate Limiting (client-side) ──────────────────────────────────────────────
// NOTA: isso complementa (não substitui) o rate limiting server-side.

const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX    = 30;

const checkRateLimit = (endpoint: string): boolean => {
    const now       = Date.now();
    const recent    = (rateLimiter.get(endpoint) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW);
    if (recent.length >= RATE_LIMIT_MAX) {
        console.warn(`[api] Rate limit excedido para ${endpoint}`);
        return false;
    }
    recent.push(now);
    rateLimiter.set(endpoint, recent);
    return true;
};

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    data?:   T;
    error?:  string;
    status?: number;
}

export interface LoginResponse {
    token:  string;
    userId: string;
    email:  string;
}

export interface UserResponse {
    id:       string;
    email:    string;
    nome?:    string;
    provider?: string;
}

export interface TagResponse {
    id:         string;
    nome:       string;
    descricao?: string;
    categoria:  string;
    ativa:      boolean;
}

export interface ImagemResponse {
    id:            string;
    url:           string;
    publicId:      string;
    folderPath?:   string;
    perfil:        boolean;
    dataUpload?:   string;
    tamanhoBytes?: number;
    mimeType?:     string;
    ativa?:        boolean;
}

// CORREÇÃO: PessoaResponse (perfil público) NÃO expõe redes sociais —
// elas só chegam via GET /matches/{matchId}/redes-sociais (RedesSociaisResponse).
export interface PessoaResponse {
    id:                      string;
    nome:                    string;
    email:                   string;
    curso?:                  string;
    dataNasc?:               string;
    genero?:                 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    interesse?:              'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';
    descricao?:              string;
    ativo?:                  boolean;
    cienciaResponsabilidade?: boolean;
    usuarioId?:              string;
    tags?:                   string[];
    imagens?:                ImagemPerfilResponse[];   // somente id + url + isPerfil
    fotoPerfilUrl?:          string;
}

// Subconjunto de Imagem exposto no perfil público (sem campos internos)
export interface ImagemPerfilResponse {
    id:     string;
    url:    string;
    perfil: boolean;
}

// PessoaCompletaResponse = próprio perfil autenticado (inclui redes sociais)
export interface PessoaCompletaResponse {
    id:                      string;
    nome:                    string;
    email:                   string;
    curso?:                  string;
    dataNasc?:               string;
    genero?:                 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
    interesse?:              'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';
    descricao?:              string;
    instagram?:              string;
    whatsapp?:               string;
    telegram?:               string;
    cienciaResponsabilidade?: boolean;
    tags?:                   string[];
    imagens?:                ImagemResponse[];
    fotoPerfilUrl?:          string;
    perfilCompleto?:         boolean;
}

export interface PessoaPayload {
    nome:                    string;
    email:                   string;
    curso?:                  string;
    dataNasc?:               string;
    genero:                  string;
    interesse:               string;
    descricao?:              string;
    instagram?:              string;
    whatsapp?:               string;
    telegram?:               string;
    ativo?:                  boolean;
    cienciaResponsabilidade?: boolean;
    tags?:                   string[];
}

export interface MatchResponse {
    id:       string;
    pessoaId1: string;
    pessoaId2: string;
    ativo:    boolean;
}

// Redes sociais: APENAS via /matches/{matchId}/redes-sociais
export interface RedesSociaisResponse {
    id?:        string;
    instagram?: string;
    whatsapp?:  string;
    telegram?:  string;
}

export interface LikeResponse {
    id:              string;
    pessoaOrigemId:  string;
    pessoaDestinoId: string;
    ativo:           boolean;
}

export interface LikeResultResponse {
    like?:  LikeResponse;
    match?: MatchResponse;
}

export interface PageResponse<T> {
    content:       T[];
    totalElements: number;
    totalPages:    number;
    number:        number;
    size:          number;
}

// ─── Helpers de token ──────────────────────────────────────────────────────────
// Token e objeto user ficam em chaves separadas para evitar dessincronização.

function getToken(): string | null {
    if (!browser) return null;
    try   { return localStorage.getItem('token'); }
    catch { return null; }
}

function setToken(token: string): void {
    if (!browser) return;
    try   { localStorage.setItem('token', token); }
    catch (e) { console.error('[api] Falha ao salvar token:', e); }
}

function removeToken(): void {
    if (!browser) return;
    try   { localStorage.removeItem('token'); }
    catch (e) { console.error('[api] Falha ao remover token:', e); }
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Request base ──────────────────────────────────────────────────────────────

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {

    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisições. Aguarde um momento.', status: 429 };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(options.headers as Record<string, string> ?? {}),
    };

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
            mode:        'cors',
            credentials: 'omit',
        });

        // Token expirado → limpa e redireciona (exceto se já estiver na raiz/auth)
        if (res.status === 401 && browser) {
            removeToken();
            const path = window.location.pathname;
            if (!path.includes('/auth') && path !== '/') {
                goto('/');
            }
        }

        if (res.status === 204 || res.status === 205) {
            return { status: res.status };
        }

        const text = await res.text();
        let body: unknown;
        try   { body = JSON.parse(text); }
        catch { body = text; }

        if (!res.ok) {
            const msg =
                typeof body === 'string'
                    ? body
                    : (body as Record<string, string>)?.erro
                    ?? (body as Record<string, string>)?.message
                    ?? `HTTP ${res.status}`;
            return { error: msg, status: res.status };
        }

        return { data: body as T, status: res.status };

    } catch (err) {
        console.error(`[api] Falha na requisição: ${endpoint}`, err);
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            return { error: 'Erro de conexão. Verifique sua internet.', status: 0 };
        }
        return { error: err instanceof Error ? err.message : 'Erro inesperado', status: 0 };
    }
}

// ─── Upload multipart ──────────────────────────────────────────────────────────

async function requestMultipart<T>(
    endpoint: string,
    body: FormData
): Promise<ApiResponse<T>> {

    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisições. Aguarde um momento.', status: 429 };
    }

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method:      'POST',
            headers:     authHeaders(),   // sem Content-Type → browser define boundary
            mode:        'cors',
            credentials: 'omit',
            body,
        });

        if (res.status === 401 && browser) {
            removeToken();
            if (!window.location.pathname.includes('/auth')) goto('/');
        }

        if (!res.ok) {
            const text = await res.text();
            return { error: text || `HTTP ${res.status}`, status: res.status };
        }

        return { data: await res.json() as T, status: res.status };

    } catch (err) {
        console.error(`[api] Upload falhou: ${endpoint}`, err);
        return { error: err instanceof Error ? err.message : 'Erro no upload', status: 0 };
    }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const apiLogin = (email: string, password: string) =>
    request<LoginResponse>('/users/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
    });

export const apiRegister = (user: { nome: string; email: string; password: string }) =>
    request<UserResponse>('/users', {
        method: 'POST',
        body:   JSON.stringify(user),
    });

// NOTA: o endpoint /users/forgot-password pode não existir no backend atual.
// Verifique antes de usar em produção.
export const apiForgotPassword = (email: string) =>
    request('/users/forgot-password', {
        method: 'POST',
        body:   JSON.stringify({ email }),
    });

export const apiGetMe = () =>
    request<UserResponse>('/users/me');

export const apiUpdateMe = (user: Partial<Pick<UserResponse, 'email' | 'nome'>>) =>
    request<UserResponse>('/users/me', {
        method: 'PUT',
        body:   JSON.stringify(user),
    });

export const apiDeleteMe = () =>
    request('/users/me', { method: 'DELETE' });

// ─── Pessoas ───────────────────────────────────────────────────────────────────

export const apiGetPessoas = (params?: {
    interesse?: string;
    genero?:    string;
    page?:      number;
    size?:      number;
}) => {
    const qs = new URLSearchParams();
    if (params?.interesse) qs.set('interesse', params.interesse);
    if (params?.genero)    qs.set('genero',    params.genero);
    qs.set('page', String(params?.page ?? 0));
    qs.set('size', String(params?.size ?? 20));   // alinhado ao @PageableDefault do backend
    return request<PageResponse<PessoaResponse>>(`/pessoas?${qs}`);
};

export const apiGetPessoa = (id: string) =>
    request<PessoaResponse>(`/pessoas/${id}/perfil`);

// Retorna PessoaCompletaResponse (próprio perfil + redes sociais)
export const apiGetMyProfile = () =>
    request<PessoaCompletaResponse>('/pessoas/me');

export const apiCreatePessoa = (pessoa: PessoaPayload) =>
    request<PessoaResponse>('/pessoas', {
        method: 'POST',
        body:   JSON.stringify(pessoa),
    });

export const apiUpdateMyProfile = (pessoa: PessoaPayload) =>
    request<PessoaResponse>('/pessoas/me', {
        method: 'PUT',
        body:   JSON.stringify(pessoa),
    });

export const apiDeleteMyProfile = () =>
    request('/pessoas/me', { method: 'DELETE' });

export const apiMarcarCiencia = () =>
    request<PessoaResponse>('/pessoas/me/ciencia-responsabilidade', { method: 'PATCH' });

// ─── Matches ───────────────────────────────────────────────────────────────────

export const apiGetMyMatches = (page = 0, size = 20) =>
    request<PageResponse<MatchResponse>>(`/matches/meus?page=${page}&size=${size}`);

// Redes sociais de outra pessoa — APENAS via match ativo
export const apiGetMatchRedesSociais = (matchId: string) =>
    request<RedesSociaisResponse>(`/matches/${matchId}/redes-sociais`);

export const apiDesfazerMatch = (matchId: string) =>
    request(`/matches/desfazer/${matchId}`, { method: 'PUT' });

// ─── Likes ─────────────────────────────────────────────────────────────────────

// destinoId vai como query param (alinhado ao backend: @RequestParam)
export const apiDarLike = (destinoId: string) =>
    request<LikeResultResponse>(`/likes?destinoId=${encodeURIComponent(destinoId)}`, {
        method: 'POST',
    });

export const apiGetLikesDados = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/dados?page=${page}&size=${size}`);

export const apiGetLikesRecebidos = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/recebidos?page=${page}&size=${size}`);

// ─── Imagens ───────────────────────────────────────────────────────────────────

// CORREÇÃO: validação de tamanho e tipo ANTES do upload (server valida também)
export const apiUploadImagem = (file: File, perfil: boolean): Promise<ApiResponse<ImagemResponse>> => {
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;   // 5 MB (espelhado no backend)
    const TIPOS_ACEITOS  = ['image/jpeg', 'image/png', 'image/webp'];

    if (!TIPOS_ACEITOS.includes(file.type)) {
        return Promise.resolve({ error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.', status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
        return Promise.resolve({ error: 'Arquivo muito grande (máx 5 MB).', status: 413 });
    }

    const form = new FormData();
    form.append('file',   file);
    form.append('perfil', String(perfil));
    return requestMultipart<ImagemResponse>('/api/imagens/upload', form);
};

export const apiDeleteImagem = (imagemId: string) =>
    request(`/api/imagens/${imagemId}`, { method: 'DELETE' });

export const apiListMinhasImagens = () =>
    request<ImagemResponse[]>('/api/imagens/minhas-imagens');

// ─── Tags ──────────────────────────────────────────────────────────────────────

export const apiGetTags      = () => request<TagResponse[]>('/tags');
export const apiGetTagsAtivas = () => request<TagResponse[]>('/tags/ativas');

// ─── Utilitários exportados ───────────────────────────────────────────────────

export const getApiBaseUrl   = (): string => BASE_URL;
export const apiSetToken     = setToken;
export const apiRemoveToken  = removeToken;
export const apiGetToken     = getToken;

// ─── OAuth2 ───────────────────────────────────────────────────────────────────

export const getGoogleOAuthUrl = (): string =>
    `${BASE_URL}/oauth2/authorization/google`;

export const redirectToGoogleOAuth = (): void => {
    if (!browser) return;
    window.location.href = getGoogleOAuthUrl();
};