// src/lib/utils/errorUtils.ts
export function handleApiError(error: unknown): string {
    if (error instanceof Response) {
        const status = error.status;
        
        if (status === 401) return 'Email ou senha incorretos.';
        if (status === 409) return 'Este email já está cadastrado.';
        if (status === 404) return 'Email não encontrado.';
        if (status === 400) return 'Dados inválidos. Verifique as informações.';
        if (status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';
        
        return `Erro ${status}: Algo deu errado.`;
    }
    
    return 'Erro de conexão. Verifique sua internet.';
}