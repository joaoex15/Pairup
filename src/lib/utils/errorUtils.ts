// $lib/utils/errorUtils.ts

// CORREÇÃO: handleApiError agora trata também os códigos de erro
// retornados por ApiResponse.error (strings como "HTTP 403"), além de
// objetos Error tradicionais — cobrindo ambos os padrões de api.ts.
export function handleApiError(error: unknown): string {
    // Objeto Error padrão (lançado por authService / código legado)
    if (error instanceof Error) {
        const msg = error.message;
        if (msg === 'EMAIL_INVALIDO')       return 'E-mail inválido';
        if (msg === 'EMAIL_EXISTENTE')      return 'E-mail já cadastrado';
        if (msg === 'LOGIN_FAILED')         return 'Credenciais inválidas';
        if (msg === 'REGISTRO_FALHOU')      return 'Não foi possível criar a conta. Tente novamente.';
        if (msg === 'RECUPERACAO_FALHOU')   return 'Não foi possível enviar o e-mail. Tente novamente.';
        if (msg === 'ERRO_BUSCAR_USUARIO')  return 'Erro ao buscar dados do usuário.';
        if (msg.includes('401'))            return 'Credenciais inválidas';
        if (msg.includes('403'))            return 'Acesso negado';
        if (msg.includes('404'))            return 'Recurso não encontrado';
        if (msg.includes('409'))            return 'E-mail já cadastrado';
        if (msg.includes('413'))            return 'Arquivo muito grande (máx 5 MB)';
        return msg;
    }

    // String de erro (retornada por ApiResponse.error)
    if (typeof error === 'string') {
        if (error.includes('401'))  return 'Credenciais inválidas';
        if (error.includes('403'))  return 'Acesso negado';
        if (error.includes('409'))  return 'E-mail já cadastrado';
        if (error.includes('413'))  return 'Arquivo muito grande (máx 5 MB)';
        return error;
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Valida maioridade (≥ 18 anos) — alinhado com a regra de negócio
export function validateAge(birthDate: string): boolean {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18;
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
}

/** Normaliza data de qualquer formato para yyyy-MM-dd (esperado pelo backend) */
export function normalizarData(raw: string | null | undefined): string {
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return '';
}

/**
 * Sanitiza entrada de texto simples — remove caracteres de controle
 * que poderiam ser interpretados de forma inesperada.
 */
export function sanitizeText(input: string): string {
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}