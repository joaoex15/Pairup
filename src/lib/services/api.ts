// $lib/services/api.ts
// Único arquivo que faz requisições. Os tipos do contrato ficam em ./types.

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type {
    ApiResponse, Genero, ImagemUploadResponse, Interesse, LikeResponse, LikeResultResponse,
    LoginResponse, MatchResponse, PageResponse, PessoaCompletaDTO, PessoaPayload, PessoaPerfilDTO,
    PessoaRedesSociaisDTO, TagResponse, UserResponse
} from './types';

export type * from './types';

// ─── BASE URL ─────────────────────────────────────────────────────────────────

const getBaseUrl = (): string => {
    const url = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL;
    if (url) return url;
    console.warn('[api] VITE_API_BASE não configurada, usando http://localhost:8080');
    return 'http://localhost:8080';
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

// ─── Token ────────────────────────────────────────────────────────────────────

export function getToken(): string | null {
    if (!browser) return null;
    try   { return localStorage.getItem('token'); }
    catch { return null; }
}

export function setToken(token: string): void {
    if (!browser) return;
    try   { localStorage.setItem('token', token); }
    catch (e) { console.error('[api] Falha ao salvar token:', e); }
}

export function removeToken(): void {
    if (!browser) return;
    try   { localStorage.removeItem('token'); }
    catch (e) { console.error('[api] Falha ao remover token:', e); }
}

// ─── Validação de token ──────────────────────────────────────────────────────

/**
 * Verifica se o token existe e não está expirado
 */
export function isTokenValid(): boolean {
    if (!browser) return false;
    
    const token = getToken();
    if (!token) return false;
    
    try {
        // Decodifica o payload do JWT (sem verificar assinatura)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Verifica se o token expirou (exp é timestamp em segundos)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
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

// O authStore registra aqui o seu logout: assim, quando o backend responde 401
// (token expirado — dura 15 min e nao ha refresh), o estado da store tambem e limpo.
// Sem isso a store continuava "autenticada" e / ⇄ /home entravam em loop.
let unauthorizedHandler: (() => void) | null = null;

export function onUnauthorized(handler: () => void): void {
    unauthorizedHandler = handler;
}

function handleUnauthorized(): void {
    if (!browser) return;
    removeToken();
    try { localStorage.removeItem('auth_user'); } catch {}
    if (unauthorizedHandler) {
        unauthorizedHandler();
    } else if (!window.location.pathname.includes('/auth') && window.location.pathname !== '/') {
        goto('/');
    }
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Request base ─────────────────────────────────────────────────────────────

/**
 * O backend devolve erro em quatro formatos: { erro } (GlobalExceptionHandler, JwtFilter),
 * { erro, campos[] } (validação), { error } (PessoaController) e { mensagem } (imagens).
 */
function extrairErro(body: unknown, status: number): string {
    if (typeof body === 'string') return body || `HTTP ${status}`;
    const b = (body ?? {}) as {
        erro?: string; error?: string; mensagem?: string; message?: string; campos?: string[];
    };
    const msg = b.erro ?? b.error ?? b.mensagem ?? b.message ?? `HTTP ${status}`;
    return b.campos?.length ? `${msg}: ${b.campos.join('; ')}` : msg;
}

async function enviar<T>(endpoint: string, init: RequestInit): Promise<ApiResponse<T>> {
    if (!checkRateLimit(endpoint)) {
        return { error: 'Muitas requisicoes. Aguarde um momento.', status: 429 };
    }

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...init,
            mode:        'cors',
            credentials: 'omit',
        });

        // /users/login responde 401 para senha errada — isso nao e sessao expirada.
        if (res.status === 401 && endpoint !== '/users/login') {
            handleUnauthorized();
        }

        if (res.status === 204 || res.status === 205) return { status: res.status };

        const text = await res.text();
        let body: unknown;
        try   { body = JSON.parse(text); }
        catch { body = text; }

        if (!res.ok) return { error: extrairErro(body, res.status), status: res.status };
        return { data: body as T, status: res.status };

    } catch (err) {
        console.error(`[api] Falha: ${endpoint}`, err);
        if (err instanceof TypeError) {
            return { error: 'Erro de conexao. Verifique sua internet.', status: 0 };
        }
        return { error: err instanceof Error ? err.message : 'Erro inesperado', status: 0 };
    }
}

function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return enviar<T>(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers as Record<string, string> ?? {}),
        },
    });
}

/** Sem Content-Type: o navegador define o boundary do multipart. */
function requestMultipart<T>(endpoint: string, body: FormData): Promise<ApiResponse<T>> {
    return enviar<T>(endpoint, { method: 'POST', headers: authHeaders(), body });
}

// ─── UserController ───────────────────────────────────────────────────────────

/** POST /users/login */
export const apiLogin = (email: string, password: string) =>
    request<LoginResponse>('/users/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
    });

/** POST /users */
export const apiRegister = (user: { nome: string; email: string; password: string }) =>
    request<UserResponse>('/users', {
        method: 'POST',
        body:   JSON.stringify(user),
    });

/** GET /users/me */
export const apiGetMe = () => request<UserResponse>('/users/me');

/** PUT /users/me */
export const apiUpdateMe = (user: Partial<Pick<UserResponse, 'email' | 'nome'>>) =>
    request<UserResponse>('/users/me', {
        method: 'PUT',
        body:   JSON.stringify(user),
    });

/** DELETE /users/me */
export const apiDeleteMe = () => request('/users/me', { method: 'DELETE' });

// ─── PessoaController ─────────────────────────────────────────────────────────

/** GET /pessoas?interesse=&genero=&page=&size= → Page<PessoaPerfilDTO> */
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

/** GET /pessoas/{id}/perfil → PessoaPerfilDTO. SEM redes sociais. */
export const apiGetPessoa = (id: string) =>
    request<PessoaPerfilDTO>(`/pessoas/${id}/perfil`);

/** GET /pessoas/me → PessoaCompletaDTO (com redes sociais e imagens). */
export const apiGetMyProfile = () =>
    request<PessoaCompletaDTO>('/pessoas/me');

/**
 * POST /pessoas — cienciaResponsabilidade DEVE ser true.
 * 409 se perfil ja existe para este usuario.
 */
export const apiCreatePessoa = (pessoa: PessoaPayload) =>
    request<PessoaPerfilDTO>('/pessoas', {
        method: 'POST',
        body:   JSON.stringify(pessoa),
    });

/** PUT /pessoas/me — id e usuarioId setados pelo controller via JWT. */
export const apiUpdateMyProfile = (pessoa: PessoaPayload) =>
    request<PessoaPerfilDTO>('/pessoas/me', {
        method: 'PUT',
        body:   JSON.stringify(pessoa),
    });

/** DELETE /pessoas/me */
export const apiDeleteMyProfile = () =>
    request('/pessoas/me', { method: 'DELETE' });

/** PATCH /pessoas/me/ciencia-responsabilidade */
export const apiMarcarCiencia = () =>
    request<PessoaPerfilDTO>('/pessoas/me/ciencia-responsabilidade', { method: 'PATCH' });

// ─── MatchController ──────────────────────────────────────────────────────────

/** GET /matches/meus?page=&size= */
export const apiGetMyMatches = (page = 0, size = 20) =>
    request<PageResponse<MatchResponse>>(`/matches/meus?page=${page}&size=${size}`);

/** GET /matches/{matchId}/redes-sociais → PessoaRedesSociaisDTO */
export const apiGetMatchRedesSociais = (matchId: string) =>
    request<PessoaRedesSociaisDTO>(`/matches/${matchId}/redes-sociais`);

/** PUT /matches/desfazer/{matchId} */
export const apiDesfazerMatch = (matchId: string) =>
    request(`/matches/desfazer/${matchId}`, { method: 'PUT' });

// ─── LikeController ───────────────────────────────────────────────────────────

/**
 * POST /likes?destinoId={id}
 * origemId vem do JWT — NAO enviar no body.
 * Retorna { match: boolean, message: string }
 */
export const apiDarLike = (destinoId: string) =>
    request<LikeResultResponse>(
        `/likes?destinoId=${encodeURIComponent(destinoId)}`,
        { method: 'POST' }
    );

/** GET /likes/dados?page=&size= */
export const apiGetLikesDados = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/dados?page=${page}&size=${size}`);

/** GET /likes/recebidos?page=&size= */
export const apiGetLikesRecebidos = (page = 0, size = 20) =>
    request<PageResponse<LikeResponse>>(`/likes/recebidos?page=${page}&size=${size}`);

// ─── ImagemController ─────────────────────────────────────────────────────────

/**
 * POST /api/imagens/upload
 * @ModelAttribute ImagemUploadDTO { file: MultipartFile, perfil: boolean }
 */
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

/** DELETE /api/imagens/{imagemId} */
export const apiDeleteImagem = (imagemId: string) =>
    request<ImagemUploadResponse>(`/api/imagens/${imagemId}`, { method: 'DELETE' });

/** GET /api/imagens/minhas-imagens */
export const apiListMinhasImagens = () =>
    request<ImagemUploadResponse[]>('/api/imagens/minhas-imagens');

// ─── TagController ────────────────────────────────────────────────────────────

/** GET /tags — publico, sem JWT */
export const apiGetTags = () => request<TagResponse[]>('/tags');

/** GET /tags/ativas — publico, sem JWT */
export const apiGetTagsAtivas = () => request<TagResponse[]>('/tags/ativas');

/** POST /tags — exige JWT */
export const apiCreateTag = (tag: Omit<TagResponse, 'id'>) =>
    request<TagResponse>('/tags', {
        method: 'POST',
        body:   JSON.stringify(tag),
    });

// ─── Utilitarios ─────────────────────────────────────────────────────────────

/**
 * Sem CF_R2_PUBLIC_URL o backend grava URLs relativas ("/api/imagens/proxy/...").
 * No <img> elas resolveriam contra a origem do front — prefixa com a URL da API.
 * (Obs.: o proxy exige header Authorization, que <img> nao envia; esse modo so
 * funciona se o backend aceitar outra forma de autenticacao para imagens.)
 */
export const resolveImageUrl = (url?: string | null): string => {
    if (!url) return '';
    return url.startsWith('/') ? `${BASE_URL}${url}` : url;
};

// ─── OAuth2 ───────────────────────────────────────────────────────────────────

/**
 * Retorna a URL de autenticação do Google via Spring Security OAuth2.
 * O backend redireciona para o Google e após autenticação chama
 * OAuth2SuccessHandler que gera o JWT e redireciona para /auth/callback?token=...
 */
export const getGoogleOAuthUrl = (): string =>
    `${BASE_URL}/oauth2/authorization/google`;

export const redirectToGoogleOAuth = (): void => {
    if (!browser) return;
    window.location.href = getGoogleOAuthUrl();
};