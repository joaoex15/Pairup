// $lib/services/api.ts
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// ─── BASE URL ─────────────────────────────────────────────────────────────────

const getBaseUrl = (): string => {
    if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
    if (import.meta.env.VITE_API_URL)  return import.meta.env.VITE_API_URL;
    if (import.meta.env.VERCEL_URL) {
        const proto = import.meta.env.VERCEL_ENV === 'production' ? 'https' : 'http';
        return `${proto}://${import.meta.env.VERCEL_URL}`;
    }
    if (import.meta.env.DEV) {
        console.warn('[api] Usando localhost. Configure VITE_API_BASE no .env');
        return 'http://localhost:8080';
    }
    console.warn('[api] Usando fallback de producao. Configure VITE_API_BASE.');
    return 'https://pairup-production-b9ee.up.railway.app';
};

const BASE_URL = getBaseUrl();
if (import.meta.env.DEV) console.log(`[api] Base URL: ${BASE_URL}`);

// ─── Rate limiting client-side ────────────────────────────────────────────────

const rateLimiter = new Map<string, number[]>();
const RL_WINDOW   = 60_000;
const RL_MAX      = 30;

const checkRateLimit = (endpoint: string): boolean => {
    const now    = Date.now();
    const recent = (rateLimiter.get(endpoint) ?? []).filter(t => now - t < RL_WINDOW);
    if (recent.length >= RL_MAX) {
        console.warn(`[api] Rate limit excedido: ${endpoint}`);
        return false;
    }
    recent.push(now);
    rateLimiter.set(endpoint, recent);
    return true;
};

// ─── Enums espelhando os enums Java ──────────────────────────────────────────

export type Genero    = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
export type Interesse = 'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';

// ─── Interfaces espelhando os DTOs Java ──────────────────────────────────────

export interface LoginRequest {
    email:    string;
    password: string;
}

export interface LoginResponse {
    token:  string;
    userId: string;
    email:  string;
}

export interface UserResponse {
    id:        string;
    email:     string;
    nome?:     string;
    provider?: string;
}

export interface TagResponse {
    id:         string;
    nome:       string;
    descricao?: string;
    categoria:  string;
    ativa:      boolean;
}

export interface ImagemUploadResponse {
    id?:           string;
    url?:          string;
    nomeOriginal?: string;
    perfil:        boolean;
    tamanhoBytes?: number;
    mensagem?:     string;
    sucesso:       boolean;
}

export interface ImagemResponse {
    id:            string;
    url:           string;
    publicId?:     string;
    folderPath?:   string;
    perfil:        boolean;
    dataUpload?:   string;
    tamanhoBytes?: number;
    mimeType?:     string;
    ativa?:        boolean;
}

export interface PessoaPerfilDTO {
    id:             string;
    nome:           string;
    curso?:         string;
    dataNasc?:      string;
    email:          string;
    genero?:        Genero;
    interesse?:     Interesse;
    descricao?:     string;
    tags?:          string[];
    imagens?:       ImagemResponse[];
    fotoPerfilUrl?: string;
}

export interface PessoaCompletaDTO {
    id:                      string;
    nome:                    string;
    curso?:                  string;
    dataNasc?:               string;
    email:                   string;
    genero?:                 Genero;
    interesse?:              Interesse;
    descricao?:              string;
    tags?:                   string[];
    cienciaResponsabilidade: boolean;
    instagram?:              string;
    whatsapp?:               string;
    telegram?:               string;
    imagens?:                ImagemResponse[];
    fotoPerfilUrl?:          string;
}

export interface PessoaRedesSociaisDTO {
    id?:        string;
    instagram?: string;
    whatsapp?:  string;
    telegram?:  string;
}

export interface PessoaPayload {
    nome:                    string;
    email:                   string;
    curso?:                  string;
    dataNasc?:               string;
    genero:                  Genero | string;
    interesse:               Interesse | string;
    descricao?:              string;
    instagram?:              string;
    whatsapp?:               string;
    telegram?:               string;
    ativo?:                  boolean;
    cienciaResponsabilidade: boolean;
    tags?:                   string[];
}

export interface MatchResponse {
    id:        string;
    pessoaId1: string;
    pessoaId2: string;
    ativo:     boolean;
}

export interface LikeResponse {
    id:              string;
    pessoaOrigemId:  string;
    pessoaDestinoId: string;
    ativo:           boolean;
}

export interface LikeResultResponse {
    match:   boolean;
    message: string;
}

export interface PageResponse<T> {
    content:       T[];
    totalElements: number;
    totalPages:    number;
    number:        number;
    size:          number;
}

export interface ApiResponse<T = unknown> {
    data?:   T;
    error?:  string;
    status?: number;
}

// ─── Helpers de token ─────────────────────────────────────────────────────────

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

// ✅ NOVA FUNÇÃO: Valida se o token existe e não expirou
export function isTokenValid(): boolean {
    if (!browser) return false;
    
    const token = getToken();
    if (!token) return false;
    
    try {
        // Decodifica o payload do JWT (sem verificar assinatura)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Verifica se o token expirou (exp é timestamp em segundos)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.log('[api] Token expirado, removendo...');
            removeToken();
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('[api] Erro ao validar token:', e);
        removeToken();
        return false;
    }
}

// ✅ NOVA FUNÇÃO: Verifica auth e redireciona se necessário
export function checkAuthAndRedirect(): boolean {
    if (!browser) return false;
    
    const isValid = isTokenValid();
    if (!isValid) {
        removeToken();
        const path = window.location.pathname;
        if (!path.includes('/auth') && path !== '/') {
            goto('/');
        }
        return false;
    }
    return true;
}

// ─── Request base ─────────────────────────────────────────────────────────────

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisicoes. Aguarde um momento.', status: 429 };
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

        // ✅ MELHORADO: Verifica token válido ANTES de qualquer ação
        if (res.status === 401 && browser) {
            console.log('[api] Recebido 401, token inválido/expirado');
            removeToken();
            
            // Limpa também o user do localStorage
            try {
                localStorage.removeItem('auth_user');
            } catch {}
            
            const path = window.location.pathname;
            if (!path.includes('/auth') && path !== '/') {
                await goto('/');
            }
        }

        if (res.status === 204 || res.status === 205) return { status: res.status };

        const text = await res.text();
        let body: unknown;
        try   { body = JSON.parse(text); }
        catch { body = text; }

        if (!res.ok) {
            const msg =
                typeof body === 'string'
                    ? body
                    : (body as Record<string, string>)?.erro
                    ?? (body as Record<string, string>)?.error
                    ?? (body as Record<string, string>)?.message
                    ?? `HTTP ${res.status}`;
            return { error: msg, status: res.status };
        }

        return { data: body as T, status: res.status };

    } catch (err) {
        console.error(`[api] Falha: ${endpoint}`, err);
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            return { error: 'Erro de conexao. Verifique sua internet.', status: 0 };
        }
        return { error: err instanceof Error ? err.message : 'Erro inesperado', status: 0 };
    }
}

// ─── Upload multipart ─────────────────────────────────────────────────────────

async function requestMultipart<T>(
    endpoint: string,
    body: FormData
): Promise<ApiResponse<T>> {
    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisicoes. Aguarde um momento.', status: 429 };
    }
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method:      'POST',
            headers:     authHeaders(),
            mode:        'cors',
            credentials: 'omit',
            body,
        });

        // ✅ MELHORADO: Mesma validação para uploads
        if (res.status === 401 && browser) {
            console.log('[api] Upload: Recebido 401, token inválido');
            removeToken();
            try { localStorage.removeItem('auth_user'); } catch {}
            if (!window.location.pathname.includes('/auth')) goto('/');
        }

        if (!res.ok) {
            const text = await res.text();
            try {
                const parsed = JSON.parse(text) as { mensagem?: string };
                return { error: parsed.mensagem ?? `HTTP ${res.status}`, status: res.status };
            } catch {
                return { error: text || `HTTP ${res.status}`, status: res.status };
            }
        }

        return { data: await res.json() as T, status: res.status };

    } catch (err) {
        console.error(`[api] Upload falhou: ${endpoint}`, err);
        return { error: err instanceof Error ? err.message : 'Erro no upload', status: 0 };
    }
}

// ─── UserController ───────────────────────────────────────────────────────────

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

export const apiForgotPassword = (email: string) =>
    request('/users/forgot-password', {
        method: 'POST',
        body:   JSON.stringify({ email }),
    });

export const apiGetMe = () => request<UserResponse>('/users/me');

export const apiUpdateMe = (user: Partial<Pick<UserResponse, 'email' | 'nome'>>) =>
    request<UserResponse>('/users/me', {
        method: 'PUT',
        body:   JSON.stringify(user),
    });

export const apiDeleteMe = () => request('/users/me', { method: 'DELETE' });

// ─── PessoaController ─────────────────────────────────────────────────────────

export const apiGetPessoas = (params?: {
    interesse?: Interesse | string;
    genero?:    Genero    | string;
    page?:      number;
    size?:      number;
}) => {
    const qs = new URLSearchParams();
    if (params?.interesse) qs.set('interesse', params.interesse);
    if (params?.genero)    qs.set('genero',    params.genero);
    qs.set('page', String(params?.page ?? 0));
    qs.set('size', String(params?.size ?? 20));
    return request<PageResponse<PessoaPerfilDTO>>(`/pessoas?${qs}`);
};

export const apiGetPessoa = (id: string) =>
    request<PessoaPerfilDTO>(`/pessoas/${id}/perfil`);

export const apiGetMyProfile = () =>
    request<PessoaCompletaDTO>('/pessoas/me');

export const apiCreatePessoa = (pessoa: PessoaPayload) =>
    request<PessoaPerfilDTO>('/pessoas', {
        method: 'POST',
        body:   JSON.stringify(pessoa),
    });

export const apiUpdateMyProfile = (pessoa: PessoaPayload) =>
    request<PessoaPerfilDTO>('/pessoas/me', {
        method: 'PUT',
        body:   JSON.stringify(pessoa),
    });

export const apiDeleteMyProfile = () =>
    request('/pessoas/me', { method: 'DELETE' });

export const apiMarcarCiencia = () =>
    request<PessoaPerfilDTO>('/pessoas/me/ciencia-responsabilidade', { method: 'PATCH' });

// ─── MatchController ──────────────────────────────────────────────────────────

export const apiGetMyMatches = (page = 0, size = 20) =>
    request<PageResponse<MatchResponse>>(`/matches/meus?page=${page}&size=${size}`);

export const apiGetMatchRedesSociais = (matchId: string) =>
    request<PessoaRedesSociaisDTO>(`/matches/${matchId}/redes-sociais`);

export const apiDesfazerMatch = (matchId: string) =>
    request(`/matches/desfazer/${matchId}`, { method: 'PUT' });

// ─── LikeController ───────────────────────────────────────────────────────────

export const apiDarLike = (destinoId: string) =>
    request<LikeResultResponse>(
        `/likes?destinoId=${encodeURIComponent(destinoId)}`,
        { method: 'POST' }
    );

export const apiGetLikesDados = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/dados?page=${page}&size=${size}`);

export const apiGetLikesRecebidos = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/recebidos?page=${page}&size=${size}`);

// ─── ImagemController ─────────────────────────────────────────────────────────

export const apiUploadImagem = (
    file: File,
    perfil: boolean
): Promise<ApiResponse<ImagemUploadResponse>> => {
    const MAX_BYTES     = 5 * 1024 * 1024;
    const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

    if (!TIPOS_ACEITOS.includes(file.type)) {
        return Promise.resolve({
            error: 'Tipo nao permitido. Use JPEG, PNG ou WebP.',
            status: 400,
        });
    }
    if (file.size > MAX_BYTES) {
        return Promise.resolve({
            error: 'Arquivo muito grande (max 5 MB).',
            status: 413,
        });
    }

    const form = new FormData();
    form.append('file',   file);
    form.append('perfil', String(perfil));
    return requestMultipart<ImagemUploadResponse>('/api/imagens/upload', form);
};

export const apiDeleteImagem = (imagemId: string) =>
    request<ImagemUploadResponse>(`/api/imagens/${imagemId}`, { method: 'DELETE' });

export const apiListMinhasImagens = () =>
    request<ImagemUploadResponse[]>('/api/imagens/minhas-imagens');

// ─── TagController ────────────────────────────────────────────────────────────

export const apiGetTags = () => request<TagResponse[]>('/tags');

export const apiGetTagsAtivas = () => request<TagResponse[]>('/tags/ativas');

export const apiCreateTag = (tag: Omit<TagResponse, 'id'>) =>
    request<TagResponse>('/tags', {
        method: 'POST',
        body:   JSON.stringify(tag),
    });

// ─── Utilitarios ─────────────────────────────────────────────────────────────

export const getApiBaseUrl  = (): string => BASE_URL;
export const apiSetToken    = setToken;
export const apiRemoveToken = removeToken;
export const apiGetToken    = getToken;

// ─── OAuth2 ───────────────────────────────────────────────────────────────────

export const getGoogleOAuthUrl = (): string =>
    `${BASE_URL}/oauth2/authorization/google`;

export const redirectToGoogleOAuth = (): void => {
    if (!browser) return;
    window.location.href = getGoogleOAuthUrl();
};