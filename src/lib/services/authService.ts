// src/lib/services/authService.ts
import { apiPost, apiGet } from './api';
import { authStore } from '$lib/stores/authStore';
import { goto } from '$app/navigation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pairup-production-b9ee.up.railway.app';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

export interface UserResponse {
    id: string;
    email: string;
    token?: string;
}

class AuthService {
    private validateEmail(email: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    private validatePassword(password: string): { valid: boolean; error?: string } {
        if (password.length < 6) {
            return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
        }
        return { valid: true };
    }
    
    async login(data: LoginRequest): Promise<UserResponse> {
        // Validação cliente
        if (!this.validateEmail(data.email)) {
            throw new Error('EMAIL_INVALIDO');
        }
        
        if (!data.password || data.password.length < 6) {
            throw new Error('SENHA_INVALIDA');
        }
        
        const response = await apiPost('/users/login', data);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'LOGIN_FAILED');
        }
        
        const result = await response.json();
        
        // Salva no store
        if (result.token && result.userId) {
            authStore.login({ id: result.userId, email: data.email }, result.token);
        }
        
        return result;
    }
    
    async register(data: RegisterRequest): Promise<UserResponse> {
        // Validações
        if (!this.validateEmail(data.email)) {
            throw new Error('EMAIL_INVALIDO');
        }
        
        const passwordValidation = this.validatePassword(data.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }
        
        const response = await apiPost('/users', {
            email: data.email,
            password: data.password,
            nome: data.name || ''
        });
        
        if (!response.ok) {
            if (response.status === 409) {
                throw new Error('EMAIL_EXISTENTE');
            }
            throw new Error('REGISTRO_FALHOU');
        }
        
        const result = await response.json();
        
        // Auto-login após registro
        return this.login({ email: data.email, password: data.password });
    }
    
    async forgotPassword(email: string): Promise<void> {
        if (!this.validateEmail(email)) {
            throw new Error('EMAIL_INVALIDO');
        }
        
        const response = await apiPost('/users/forgot-password', { email });
        
        if (!response.ok) {
            throw new Error('RECUPERACAO_FALHOU');
        }
    }
    
    async getCurrentUser(): Promise<UserResponse | null> {
        const response = await apiGet('/users/me');
        
        if (!response.ok) {
            if (response.status === 401) {
                authStore.logout();
                return null;
            }
            throw new Error('ERRO_BUSCAR_USUARIO');
        }
        
        return response.json();
    }
    
    loginWithGoogle(): void {
        // Redireciona para OAuth2
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    }
    
    logout(): void {
        authStore.logout();
        goto('/');
    }
}

export const authService = new AuthService();