// $lib/stores/authStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { isTokenValid, getToken, setToken, removeToken, apiGetMe, onUnauthorized } from '$lib/services/api';

export interface AuthUser {
    id: string;
    email: string;
    nome?: string;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const USER_KEY = 'auth_user';

function saveUser(user: AuthUser): void {
    if (!browser) return;
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.error('[authStore] Falha ao salvar usuário:', e);
    }
}

function loadUser(): AuthUser | null {
    if (!browser) return null;
    try {
        const saved = localStorage.getItem(USER_KEY);
        const user = saved ? JSON.parse(saved) : null;
        if (user?.id && user?.email) return user;
    } catch {
        // JSON corrompido: cai na limpeza abaixo
    }
    localStorage.removeItem(USER_KEY);
    return null;
}

function createAuthStore() {
    const { subscribe, set } = writable<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });

    const signedOut: AuthState = { user: null, isAuthenticated: false, isLoading: false };

    function clearSession(): void {
        removeToken();
        localStorage.removeItem(USER_KEY);
        set(signedOut);
    }

    async function initialize(): Promise<void> {
        if (!browser) {
            set(signedOut);
            return;
        }

        if (!isTokenValid() || !getToken()) {
            clearSession();
            return;
        }

        const saved = loadUser();
        if (saved) {
            set({ user: saved, isAuthenticated: true, isLoading: false });
            return;
        }

        // Tem token mas não tem usuário salvo: busca no backend
        set({ user: null, isAuthenticated: true, isLoading: false });
        const res = await apiGetMe();
        if (res.data) {
            const user = { id: res.data.id, email: res.data.email, nome: res.data.nome };
            saveUser(user);
            set({ user, isAuthenticated: true, isLoading: false });
        } else if (res.status !== 0) {
            // status 0 = falha de rede: mantém autenticado sem usuário
            clearSession();
        }
    }

    function login(user: AuthUser, token: string): void {
        if (!browser) return;
        setToken(token);
        saveUser(user);
        set({ user, isAuthenticated: true, isLoading: false });
    }

    function logout(redirectToHome: boolean = true): void {
        if (!browser) return;
        clearSession();
        if (redirectToHome) goto('/');
    }

    // 401 em qualquer requisição → limpa a store (não só o localStorage)
    onUnauthorized(() => {
        const path = browser ? window.location.pathname : '/';
        logout(!path.includes('/auth') && path !== '/');
    });

    initialize();

    return { subscribe, login, logout };
}

export const authStore = createAuthStore();
