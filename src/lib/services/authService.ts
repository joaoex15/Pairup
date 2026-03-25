const API_BASE_URL = 'https://pairup-production-b9ee.up.railway.app';

export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}
export interface UserResponse {
    id: string;
    nome: string;
    email: string;
}

class AuthService {
    private async apiFetch<T>(path: string, body: object): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw response;
        return await response.json();
    }

    async login(data: LoginRequest): Promise<UserResponse> {
        return this.apiFetch<UserResponse>('/users/login', data);
    }
    async register(data: RegisterRequest): Promise<UserResponse> {
        return this.apiFetch<UserResponse>('/users', data);
    }
    async forgotPassword(email: string): Promise<void> {
        await this.apiFetch('/users/forgot-password', { email });
    }

    // NOVO: redireciona para o Google
    loginWithGoogle(): void {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    }
}

export const authService = new AuthService();