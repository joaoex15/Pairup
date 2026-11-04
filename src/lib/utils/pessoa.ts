// $lib/utils/pessoa.ts
// Regras de pessoa usadas pelo deck e pelas listas (sem estado, fáceis de testar).
import { resolveImageUrl, type PessoaPerfilDTO, type TagResponse } from '$lib/services/api';

/** Pessoa pronta para exibir no deck. */
export interface PessoaView extends PessoaPerfilDTO {
    fotos:   string[];
    tagObjs: TagResponse[];
    idade:   number;
}

/**
 * Decide se a pessoa precisa passar pelo onboarding a partir de GET /pessoas/me.
 * Só 404 significa "sem perfil": erro de rede ou 500 não pode parecer cadastro novo.
 */
export const perfilPendente = (res: { data?: { perfilCompleto: boolean }; status?: number }): boolean =>
    res.status === 404 || (!!res.data && !res.data.perfilCompleto);

export const calcularIdade = (dataNasc?: string): number => {
    if (!dataNasc) return 0;
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mesDiff = hoje.getMonth() - nasc.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
};

/** Foto de perfil primeiro, depois o resto da galeria. */
export const fotosParaPessoa = (p: PessoaPerfilDTO): string[] => {
    const urls: string[] = [];
    if (p.fotoPerfilUrl) urls.push(p.fotoPerfilUrl);
    for (const img of p.imagens ?? []) {
        if (img.url && img.url !== p.fotoPerfilUrl) urls.push(img.url);
    }
    return urls.map(resolveImageUrl);
};

const quer = (interesse: PessoaPerfilDTO['interesse'], genero: PessoaPerfilDTO['genero']): boolean => {
    if (interesse === 'HOMENS')   return genero === 'MASCULINO';
    if (interesse === 'MULHERES') return genero === 'FEMININO';
    return true;
};

/** Os dois lados precisam querer o gênero do outro. Dado faltando = compatível. */
export const compativeis = (eu: PessoaPerfilDTO, outra: PessoaPerfilDTO): boolean => {
    if (!eu.genero || !eu.interesse || !outra.genero || !outra.interesse) return true;
    return quer(eu.interesse, outra.genero) && quer(outra.interesse, eu.genero);
};

export const inicial = (nome?: string): string => nome?.charAt(0)?.toUpperCase() || '?';
