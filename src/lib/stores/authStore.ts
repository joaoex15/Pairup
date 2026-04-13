// $lib/stores/authStore.ts
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { 
    isTokenValid, 
    getToken, 
    removeToken,
    apiGetMe 
} from '$lib/services/api';

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

// Função para salvar usuário no localStorage
function saveUserToLocalStorage(user: AuthUser): void {
    if (!browser) return;
    try {
        localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (e) {
        console.error('[authStore] Falha ao salvar usuário:', e);
    }
}

// Função para carregar usuário do localStorage
function loadUserFromLocalStorage(): AuthUser | null {
    if (!browser) return null;
    try {
        const saved = localStorage.getItem('auth_user');
        if (!saved) return null;
        const user = JSON.parse(saved);
        // Valida se o user tem os campos necessários
        if (user?.id && user?.email) {
            return user;
        }
        localStorage.removeItem('auth_user');
        return null;
    } catch {
        localStorage.removeItem('auth_user');
        return null;
    }
}

function createAuthStore() {
    // Estado inicial
    const initialState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: true
    };
    
    const { subscribe, set, update } = writable<AuthState>(initialState);
    
    // ✅ FUNÇÃO PRINCIPAL: Inicializa validando token
    async function initialize(): Promise<void> {
        if (!browser) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }
        
        console.log('[authStore] Inicializando...');
        
        // 1. Verifica se o token existe e é válido
        const tokenValid = isTokenValid();
        const token = getToken();
        
        if (!tokenValid || !token) {
            // Token inválido ou inexistente - limpa tudo
            console.log('[authStore] Token inválido ou inexistente, limpando estado');
            removeToken();
            localStorage.removeItem('auth_user');
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }
        
        // 2. Token existe - tenta carregar usuário do localStorage
        let user = loadUserFromLocalStorage();
        
        if (user) {
            // Usuário já salvo, estado autenticado
            console.log('[authStore] Usuário restaurado do localStorage:', user.email);
            set({ user, isAuthenticated: true, isLoading: false });
        } else {
            // Tem token mas não tem user salvo - busca do backend
            console.log('[authStore] Token válido mas sem user local, buscando do backend...');
            set({ user: null, isAuthenticated: true, isLoading: false });
            
            // Tenta buscar o usuário do backend
            try {
                const res = await apiGetMe();
                if (res.data && !res.error) {
                    user = { id: res.data.id, email: res.data.email, nome: res.data.nome };
                    saveUserToLocalStorage(user);
                    set({ user, isAuthenticated: true, isLoading: false });
                    console.log('[authStore] Usuário carregado do backend:', user.email);
                } else {
                    // Usuário não encontrado no backend, token inválido
                    console.log('[authStore] Usuário não encontrado no backend');
                    removeToken();
                    localStorage.removeItem('auth_user');
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            } catch (error) {
                console.error('[authStore] Erro ao buscar usuário:', error);
                // Mantém como autenticado mas sem user
                set({ user: null, isAuthenticated: true, isLoading: false });
            }
        }
    }
    
    // ✅ LOGIN: Salva token e usuário
    function login(user: AuthUser, token: string): void {
        if (!browser) return;
        
        console.log('[authStore] Login:', user.email);
        
        // Salva token
        try {
            localStorage.setItem('token', token);
        } catch (e) {
            console.error('[authStore] Falha ao salvar token:', e);
        }
        
        // Salva usuário
        saveUserToLocalStorage(user);
        
        // Atualiza estado
        set({
            user,
            isAuthenticated: true,
            isLoading: false
        });
    }
    
    // ✅ LOGOUT: Limpa tudo
    function logout(redirectToHome: boolean = true): void {
        if (!browser) return;
        
        console.log('[authStore] Logout');
        
        // Limpa storage
        removeToken();
        localStorage.removeItem('auth_user');
        
        // Atualiza estado
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
        
        // Redireciona para home
        if (redirectToHome) {
            goto('/');
        }
    }
    
    // ✅ VALIDAÇÃO MANUAL: Força revalidação do token
    async function validateToken(): Promise<boolean> {
        if (!browser) return false;
        
        const isValid = isTokenValid();
        
        if (!isValid) {
            console.log('[authStore] validateToken: token inválido, fazendo logout');
            logout(true);
            return false;
        }
        
        // Token válido, verifica se o usuário ainda existe no backend
        try {
            const res = await apiGetMe();
            if (res.data && !res.error) {
                const user = { id: res.data.id, email: res.data.email, nome: res.data.nome };
                
                // Atualiza o user no store se mudou
                update(state => {
                    if (state.user?.id !== user.id || state.user?.email !== user.email) {
                        saveUserToLocalStorage(user);
                        return { ...state, user, isAuthenticated: true };
                    }
                    return state;
                });
                return true;
            } else {
                // Usuário não encontrado
                console.log('[authStore] validateToken: usuário não encontrado no backend');
                logout(true);
                return false;
            }
        } catch (error) {
            console.error('[authStore] validateToken: erro ao buscar usuário:', error);
            // Mantém como autenticado, mas retorna false para indicar erro
            return false;
        }
    }
    
    // ✅ UPDATE USER: Atualiza dados do usuário
    function updateUser(updates: Partial<AuthUser>): void {
        update(state => {
            if (!state.user) return state;
            
            const updatedUser = { ...state.user, ...updates };
            saveUserToLocalStorage(updatedUser);
            
            return {
                ...state,
                user: updatedUser
            };
        });
    }
    
    // ✅ FORÇA CHECK: Limpa estado se token for inválido
    function forceCheck(): void {
        if (!browser) return;
        
        const isValid = isTokenValid();
        const token = getToken();
        
        if (!isValid || !token) {
            console.log('[authStore] forceCheck: token inválido, limpando estado');
            removeToken();
            localStorage.removeItem('auth_user');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    }
    
    // Inicializa o store
    initialize();
    
    // Retorna a store com os métodos
    return {
        subscribe,
        login,
        logout,
        updateUser,
        validateToken,
        forceCheck,
        // Getter síncrono para verificar autenticação (útil em componentes)
        isAuthenticated: () => {
            if (!browser) return false;
            const tokenValid = isTokenValid();
            const token = getToken();
            return tokenValid && !!token;
        }
    };
}

export const authStore = createAuthStore();