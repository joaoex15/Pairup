// src/lib/stores/authStore.ts
// ✅ Salva { user, token } no localStorage.
//    O token é lido pelo api.ts e injetado em todas as requisições.

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface User {
    id: string;
    nome?: string;
    name?: string;
    email?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const STORAGE_KEY_USER  = 'user';
const STORAGE_KEY_TOKEN = 'token';

// ── Lê estado inicial do localStorage ────────────────────────────────────
const loadInitialState = (): AuthState => {
    if (!browser) return { user: null, token: null, isAuthenticated: false };
    try {
        const user  = JSON.parse(localStorage.getItem(STORAGE_KEY_USER)  ?? 'null');
        const token = localStorage.getItem(STORAGE_KEY_TOKEN);
        return { user, token, isAuthenticated: !!(user && token) };
    } catch {
        return { user: null, token: null, isAuthenticated: false };
    }
};

const { subscribe, set, update } = writable<AuthState>(loadInitialState());

export const authStore = {
    subscribe,

    // ✅ login agora recebe user + token separados
    login(user: User, token: string) {
        if (browser) {
            localStorage.setItem(STORAGE_KEY_USER,  JSON.stringify(user));
            localStorage.setItem(STORAGE_KEY_TOKEN, token);
        }
        set({ user, token, isAuthenticated: true });
    },

    logout() {
        if (browser) {
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
};