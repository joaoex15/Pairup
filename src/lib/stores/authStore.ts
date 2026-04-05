// $lib/stores/authStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { apiSetToken, apiRemoveToken } from '$lib/services/api';

// CORREÇÃO: token não fica embutido no objeto user no localStorage —
// fica em chave separada 'token', gerenciada por api.ts.
// Isso evita que o token apareça em múltiplos lugares e fique dessincronizado.
interface User {
    id:    string;
    email: string;
    nome?: string;
}

interface AuthState {
    user:            User | null;
    isAuthenticated: boolean;
    isLoading:       boolean;
}

const USER_KEY = 'user';

function readUserFromStorage(): User | null {
    if (!browser) return null;
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<User>;
        // Valida campos mínimos antes de aceitar
        if (parsed?.id && parsed?.email) return parsed as User;
        localStorage.removeItem(USER_KEY);
        return null;
    } catch {
        localStorage.removeItem(USER_KEY);
        return null;
    }
}

function createAuthStore() {
    const initial: AuthState = {
        user:            null,
        isAuthenticated: false,
        isLoading:       true,
    };

    const { subscribe, set, update } = writable<AuthState>(initial);

    // Hidratação síncrona a partir do localStorage
    const storedUser = readUserFromStorage();
    if (storedUser) {
        set({ user: storedUser, isAuthenticated: true, isLoading: false });
    } else {
        set({ ...initial, isLoading: false });
    }

    return {
        subscribe,

        // CORREÇÃO: login recebe user e token separadamente.
        // O token é persistido via apiSetToken (api.ts), não embutido no user.
        login(user: User, token: string) {
            if (browser) {
                apiSetToken(token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
            }
            set({ user, isAuthenticated: true, isLoading: false });
        },

        async logout() {
            if (browser) {
                apiRemoveToken();
                localStorage.removeItem(USER_KEY);
            }
            set({ user: null, isAuthenticated: false, isLoading: false });
            await goto('/');
        },

        updateUser(partial: Partial<User>) {
            update(state => {
                if (!state.user) return state;
                const updated = { ...state.user, ...partial };
                if (browser) {
                    localStorage.setItem(USER_KEY, JSON.stringify(updated));
                }
                return { ...state, user: updated };
            });
        },

        setLoading(isLoading: boolean) {
            update(state => ({ ...state, isLoading }));
        },
    };
}

export const authStore = createAuthStore();