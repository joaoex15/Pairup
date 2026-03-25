// src/lib/stores/authStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserResponse } from '$lib/services/authService';

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
}

function createAuthStore() {
    const storedUser  = browser ? localStorage.getItem('user')  : null;
    const storedToken = browser ? localStorage.getItem('token') : null;

    const { subscribe, set } = writable<AuthState>({
        user:            storedUser ? JSON.parse(storedUser) : null,
        token:           storedToken ?? null,
        isAuthenticated: !!(storedUser && storedToken)
    });

    return {
        subscribe,
        login: (user: UserResponse, token?: string) => {
            if (browser) {
                localStorage.setItem('user', JSON.stringify(user));
                if (token) localStorage.setItem('token', token);
            }
            set({ user, token: token ?? null, isAuthenticated: true });
        },
        logout: () => {
            if (browser) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            set({ user: null, token: null, isAuthenticated: false });
        }
    };
}

export const authStore = createAuthStore();