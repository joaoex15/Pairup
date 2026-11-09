// $lib/services/types.ts
// Contrato com o backend: cada interface espelha um DTO Java (ver docs/CONTRATO_FRONT_BACK.md
// no repositório do backend). Mudou um DTO? Mude aqui também.

// ─── Enums espelhando os enums Java ──────────────────────────────────────────

export type Genero    = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO';
export type Interesse = 'HOMENS' | 'MULHERES' | 'TODOS' | 'NAO_DEFINIDO';

// ─── Interfaces espelhando os DTOs Java ──────────────────────────────────────

/**
 * LoginRequestDTO { email: String, password: String }
 * Usado em: POST /users/login
 */
export interface LoginRequest {
    email:    string;
    password: string;
}

/**
 * Retorno de POST /users/login
 * Backend: Map.of("token", token, "userId", user.getId(), "email", user.getEmail())
 */
export interface LoginResponse {
    token:  string;
    userId: string;
    email:  string;
}

/**
 * Retorno de GET /users/me, PUT /users/me, POST /users
 * Backend serializa User com password=null.
 */
export interface UserResponse {
    id:        string;
    email:     string;
    nome?:     string;
    provider?: string;
}

/**
 * Tag model — retornado por GET /tags e GET /tags/ativas
 */
export interface TagResponse {
    id:         string;
    nome:       string;
    descricao?: string;
    categoria:  string;
    ativa:      boolean;
}

/**
 * ImagemUploadResponseDTO — retornado por POST /api/imagens/upload,
 * DELETE /api/imagens/{id}, GET /api/imagens/minhas-imagens.
 */
export interface ImagemUploadResponse {
    id?:           string;
    url?:          string;
    nomeOriginal?: string;
    perfil:        boolean;
    tamanhoBytes?: number;
    mensagem?:     string;
    sucesso:       boolean;
}

/**
 * Modelo Imagem serializado dentro de PessoaPerfilDTO e PessoaCompletaDTO.
 */
export interface ImagemResponse {
    id:            string;
    url:           string;
    publicId?:     string;
    folderPath?:   string;
    perfil:        boolean;
    dataUpload?:   string;
    tamanhoBytes?: number;
    mimeType?:     string;
    ativa?:        boolean;
}

/**
 * PessoaPerfilDTO — retornado por:
 *   GET /pessoas                (Page<PessoaPerfilDTO>)
 *   GET /pessoas/{id}/perfil    (PessoaPerfilDTO)
 *
 * NAO contem redes sociais (instagram/whatsapp/telegram).
 * tags: List<String> — NOMES das tags (PessoaService usa Tag::getNome).
 */
export interface PessoaPerfilDTO {
    id:             string;
    nome:           string;
    curso?:         string;
    idade?:         number;
    genero?:        Genero;
    interesse?:     Interesse;
    descricao?:     string;
    tags?:          string[];
    imagens?:       ImagemResponse[];
    fotoPerfilUrl?: string;
}

/**
 * PessoaCompletaDTO — retornado por GET /pessoas/me (perfil proprio).
 * Contem TUDO: dados pessoais + redes sociais + imagens + cienciaResponsabilidade.
 * tags: List<String> (NOMES das tags).
 */
export interface PessoaCompletaDTO {
    id:                      string;
    nome:                    string;
    curso?:                  string;
    dataNasc?:               string;
    email:                   string;
    genero?:                 Genero;
    interesse?:              Interesse;
    descricao?:              string;
    tags?:                   string[];
    cienciaResponsabilidade: boolean;
    instagram?:              string;
    whatsapp?:               string;
    telegram?:               string;
    imagens?:                ImagemResponse[];
    fotoPerfilUrl?:          string;
    // Getters calculados de PessoaCompletaDTO (serializados pelo Jackson)
    perfilCompleto:          boolean;
    quantidadeGaleria?:      number;
    imagensGaleria?:         ImagemResponse[];
}

/**
 * PessoaRedesSociaisDTO — retornado EXCLUSIVAMENTE por:
 *   GET /matches/{matchId}/redes-sociais
 */
export interface PessoaRedesSociaisDTO {
    id?:        string;
    instagram?: string;
    whatsapp?:  string;
    telegram?:  string;
}

/**
 * PessoaRequestDTO: payload de POST /pessoas e PUT /pessoas/me.
 * cienciaResponsabilidade: DEVE ser true no POST /pessoas.
 * usuarioId: NAO enviar — controller seta via JWT.
 * Backend: PessoaRequestDTO. tags = IDs (ate 5, so ativas; senao 400) — nas respostas
 * voltam como NOMES. No PUT: string vazia apaga a rede social, campo ausente mantem.
 */
export interface PessoaPayload {
    nome:                    string;
    email:                   string;
    curso?:                  string;
    dataNasc?:               string;
    genero:                  Genero | string;
    interesse:               Interesse | string;
    descricao?:              string;
    instagram?:              string;
    whatsapp?:               string;
    telegram?:               string;
    cienciaResponsabilidade: boolean;
    tags?:                   string[];
}

/**
 * Match model — retornado por GET /matches/meus (Page<Match>).
 */
export interface MatchResponse {
    id:        string;
    pessoaId1: string;
    pessoaId2: string;
    ativo:     boolean;
}

/**
 * Like model — retornado por GET /likes/dados e GET /likes/recebidos.
 */
export interface LikeResponse {
    id:              string;
    pessoaOrigemId:  string;
    pessoaDestinoId: string;
    ativo:           boolean;
}

/**
 * Retorno de POST /likes?destinoId=...
 */
export interface LikeResultResponse {
    match:   boolean;
    message: string;
}

/** Wrapper de paginacao Spring Page<T> */
export interface PageResponse<T> {
    content:       T[];
    totalElements: number;
    totalPages:    number;
    number:        number;
    size:          number;
}

/** Wrapper padrao de todas as respostas da camada api.ts */
export interface ApiResponse<T = unknown> {
    data?:   T;
    error?:  string;
    status?: number;
}
