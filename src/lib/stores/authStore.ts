// $lib/stores/authStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

interface User {
    id: string;
    email: string;
    nome?: string;
    token: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

function createAuthStore() {
    const initial: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: true,
    };

    const { subscribe, set, update } = writable<AuthState>(initial);

    if (browser) {
        try {
            const raw = localStorage.getItem('user');
            if (raw) {
                const user: User = JSON.parse(raw);
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                set({ ...initial, isLoading: false });
            }
        } catch {
            localStorage.removeItem('user');
            set({ ...initial, isLoading: false });
        }
    }

    return {
        subscribe,

        login(user: User) {
            if (browser) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            set({ user, isAuthenticated: true, isLoading: false });
        },

        async logout() {
            if (browser) {
                localStorage.removeItem('user');
            }
            set({ user: null, isAuthenticated: false, isLoading: false });
            await goto('/');
        },

        updateUser(partial: Partial<User>) {
            update(state => {
                if (!state.user) return state;
                const updated = { ...state.user, ...partial };
                if (browser) {
                    localStorage.setItem('user', JSON.stringify(updated));
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