// $lib/utils/errorUtils.ts

export function handleApiError(error: unknown): string {
    if (error instanceof Error) {
        if (error.message.includes('401')) return 'Credenciais inválidas';
        if (error.message.includes('403')) return 'Acesso negado';
        if (error.message.includes('404')) return 'Recurso não encontrado';
        if (error.message.includes('409')) return 'E-mail já cadastrado';
        if (error.message.includes('413')) return 'Arquivo muito grande (máx 5 MB)';
        return error.message;
    }
    if (typeof error === 'string') return error;
    return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateAge(birthDate: string): boolean {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18;
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
}

/** Normaliza data de qualquer formato para yyyy-MM-dd */
export function normalizarData(raw: string | null | undefined): string {
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return '';
}