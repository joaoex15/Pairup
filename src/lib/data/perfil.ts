// $lib/data/perfil.ts
// Opções e limites do formulário de perfil (onboarding e /profile).
import type { Genero, Interesse } from '$lib/services/types';

export const MAX_TAGS = 5;   // PessoaRequestDTO.MAX_TAGS

export const GENEROS: { value: Genero; label: string }[] = [
    { value: 'MASCULINO',   label: 'Masculino'   },
    { value: 'FEMININO',    label: 'Feminino'    },
    { value: 'NAO_BINARIO', label: 'Não-binário' },
    { value: 'OUTRO',       label: 'Outro'       },
];

export const INTERESSES: { value: Interesse; label: string }[] = [
    { value: 'HOMENS',       label: 'Homens'       },
    { value: 'MULHERES',     label: 'Mulheres'     },
    { value: 'TODOS',        label: 'Todos'        },
    { value: 'NAO_DEFINIDO', label: 'Não definido' },
];

/** Foto no formulário. `file` presente = ainda não enviada; id "temp-*" = só local. */
export interface Foto {
    id:        string;
    url:       string;
    file?:     File;
    principal: boolean;
}
