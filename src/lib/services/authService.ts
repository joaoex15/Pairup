// $lib/services/authService.ts
// CORREÇÃO: authService agora usa as funções de api.ts (apiLogin, apiRegister…)
// em vez de chamar fetch/apiPost/apiGet diretamente — mantém single source of truth.

import { apiLogin, apiRegister, apiForgotPassword, apiGetMe, getGoogleOAuthUrl } from './api';
import { authStore } from '$lib/stores/authStore';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

export interface LoginRequest {
    email:    string;
    password: string;
}

export interface RegisterRequest {
    email:    string;
    password: string;
    name?:    string;
}

export interface UserResponse {
    id:    string;
    email: string;
    nome?: string;
}

// ─── Validações locais ────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password: string): string | null {
    if (!password || password.length < 6) {
        return 'Senha deve ter pelo menos 6 caracteres';
    }
    return null;
}

// ─── AuthService ──────────────────────────────────────────────────────────────

class AuthService {

    async login(data: LoginRequest): Promise<UserResponse> {
        if (!validateEmail(data.email))       throw new Error('EMAIL_INVALIDO');
        const pwErr = validatePassword(data.password);
        if (pwErr)                            throw new Error(pwErr);

        const res = await apiLogin(data.email.trim(), data.password);

        if (res.error || !res.data) {
            throw new Error(res.error ?? 'LOGIN_FAILED');
        }

        const { token, userId, email } = res.data;

        // Salva token (via api.ts) e user (via authStore) em chaves separadas
        authStore.login({ id: userId, email }, token);

        return { id: userId, email };
    }

    async register(data: RegisterRequest): Promise<UserResponse> {
        if (!validateEmail(data.email))       throw new Error('EMAIL_INVALIDO');
        const pwErr = validatePassword(data.password);
        if (pwErr)                            throw new Error(pwErr);

        const res = await apiRegister({
            email:    data.email.trim(),
            password: data.password,
            nome:     data.name ?? '',
        });

        if (res.error || !res.data) {
            if (res.status === 409) throw new Error('EMAIL_EXISTENTE');
            throw new Error(res.error ?? 'REGISTRO_FALHOU');
        }

        // Auto-login após registro bem-sucedido
        return this.login({ email: data.email, password: data.password });
    }

    async forgotPassword(email: string): Promise<void> {
        if (!validateEmail(email)) throw new Error('EMAIL_INVALIDO');

        const res = await apiForgotPassword(email.trim());
        if (res.error) throw new Error(res.error ?? 'RECUPERACAO_FALHOU');
    }

    async getCurrentUser(): Promise<UserResponse | null> {
        const res = await apiGetMe();

        if (res.status === 401) {
            authStore.logout();
            return null;
        }

        if (res.error || !res.data) {
            throw new Error(res.error ?? 'ERRO_BUSCAR_USUARIO');
        }

        return res.data;
    }

    loginWithGoogle(): void {
        if (!browser) return;
        window.location.href = getGoogleOAuthUrl();
    }

    logout(): void {
        authStore.logout();
        // goto('/') já é chamado dentro de authStore.logout()
    }
}

export const authService = new AuthService();