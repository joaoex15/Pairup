// $lib/utils/errorUtils.ts
export function handleApiError(error: unknown): string {
    if (error instanceof Error) {
        // Erros específicos da API
        if (error.message.includes('401')) return 'Credenciais inválidas';
        if (error.message.includes('403')) return 'Acesso negado';
        if (error.message.includes('404')) return 'Recurso não encontrado';
        if (error.message.includes('409')) return 'E-mail já cadastrado';
        if (error.message.includes('413')) return 'Arquivo muito grande (máx 5MB)';
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

export function formatWhatsApp(phone: string): string {
    return phone.replace(/\D/g, '');
}

export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validateAge(birthDate: string): boolean {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
}