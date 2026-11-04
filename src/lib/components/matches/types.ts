// $lib/components/matches/types.ts

export interface MatchView {
    matchId:   string;
    pessoaId:  string;
    nome:      string;
    curso:     string;
    fotoUrl:   string;
    instagram: string;
    whatsapp:  string;
    telegram:  string;
}

export interface LikeView {
    likeId:   string;
    pessoaId: string;
    nome:     string;
    curso:    string;
    fotoUrl:  string;
}
