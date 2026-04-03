// src/lib/services/api.ts
// ✅ Todas as requisições ao backend passam por aqui.
//    O token JWT é injetado automaticamente em cada chamada.
//    Nunca chame fetch() diretamente nas páginas — use este módulo.

import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const API = 'https://pairup-production-b9ee.up.railway.app';

// ── Recupera o token salvo ──────────────────────────────────────────────────
export const getToken = (): string | null => {
    if (!browser) return null;
    return localStorage.getItem('token');
};

// ── Monta os headers padrão (com JWT quando disponível) ────────────────────
const buildHeaders = (extra: HeadersInit = {}): HeadersInit => {
    const token = getToken();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
};

// ── Wrapper de fetch autenticado ────────────────────────────────────────────
export const apiFetch = async (
    path: string,
    options: RequestInit = {}
): Promise<Response> => {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: buildHeaders(
            isFormData
                ? (options.headers ?? {})                          // FormData: não forçar Content-Type
                : { 'Content-Type': 'application/json', ...(options.headers ?? {}) }
        ),
    });

    // Token expirado ou inválido → redireciona para login
    if (res.status === 401) {
        if (browser) {
            localStorage.clear();
            goto('/');
        }
    }

    return res;
};

// ── Helpers semânticos ──────────────────────────────────────────────────────
export const apiGet    = (path: string)                          => apiFetch(path, { method: 'GET' });
export const apiPost   = (path: string, body?: unknown)          => apiFetch(path, { method: 'POST',   body: body ? JSON.stringify(body) : undefined });
export const apiPut    = (path: string, body?: unknown)          => apiFetch(path, { method: 'PUT',    body: body ? JSON.stringify(body) : undefined });
export const apiPatch  = (path: string, body?: unknown)          => apiFetch(path, { method: 'PATCH',  body: body ? JSON.stringify(body) : undefined });
export const apiDelete = (path: string)                          => apiFetch(path, { method: 'DELETE' });
export const apiUpload = (path: string, formData: FormData)      => apiFetch(path, { method: 'POST',   body: formData });