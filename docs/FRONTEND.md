# PairUp — Front-end

Aplicação web do PairUp. São as telas que a pessoa usa no navegador: login, cadastro do
perfil, deck de perfis, matches e edição do perfil. Todos os dados vêm da API
(`Tinder_ufs/`).

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | SvelteKit | 2.50 |
| UI | Svelte | 5.51 |
| Linguagem | TypeScript | 5.9 |
| Estilo | Tailwind CSS (+ forms, typography), CSS por componente | 4.1 |
| Componentes base | Skeleton (instalado) + componentes próprios em `lib/components/ui` | 4.12 |
| Build / dev server | Vite | 7.3 |
| Qualidade | svelte-check, ESLint 9, Prettier 3 | — |
| Deploy | `@sveltejs/adapter-auto`, que detecta a Vercel | — |
| Fonte | Plus Jakarta Sans (Google Fonts) | — |

## Estrutura

```
tinder/
├── package.json, vite.config.ts, svelte.config.js, tailwind.config.js, tsconfig.json
├── .env.example                 VITE_API_BASE
├── static/                      arquivos servidos como estão
└── src/
    ├── app.html, app.css, app.d.ts
    ├── routes/                  uma pasta por tela
    │   ├── +layout.svelte       fonte e reset global
    │   ├── (auth)/+page.svelte  "/"  login e cadastro
    │   ├── auth/callback/       recebe o token do login Google
    │   ├── onboarding/          cadastro do perfil em 4 passos
    │   ├── home/                deck de perfis
    │   ├── matches/             matches, contatos e curtidas dadas
    │   ├── profile/             edição do perfil, sair, excluir conta
    │   └── termos/, privacidade/  textos legais
    └── lib/
        ├── services/
        │   ├── api.ts           ÚNICO arquivo que faz requisições
        │   └── types.ts         formato dos dados da API (o contrato)
        ├── stores/authStore.ts  sessão: quem está logado
        ├── components/
        │   ├── ui/              botão, alerta, modal, campos, ícones, header, estados vazios
        │   ├── login/           formulários de login, cadastro e botão Google
        │   ├── onboarding/      progresso dos passos e aceite dos termos
        │   ├── home/            card de pessoa, ações de swipe, filtros, aviso de match
        │   ├── matches/         abas, card de match, contatos, card de like
        │   ├── perfil/          campos de perfil, tags, curso, redes sociais
        │   └── FotosUploader.svelte, BrandPanel.svelte
        ├── utils/               regras sem estado: pessoa.ts, máscaras, erros, uid
        └── data/                listas fixas: cursos, limites do formulário
```

Tamanho aproximado: 5,2 mil linhas entre `.svelte` e `.ts`.

## Camada de API (`lib/services/api.ts`)

- **URL base:** vem de `VITE_API_BASE`, e o build falha sem ela.
- **Token:** fica no `localStorage` e vai em todo request como `Authorization: Bearer`.
- **401:** qualquer resposta 401, exceto no próprio login, encerra a sessão (`onUnauthorized` →
  `authStore`) e volta para `/`.
- **Erros:** `extrairErro` entende os quatro formatos de erro do back (`erro`, `error`,
  `mensagem`, `message`).
- **Limite local de chamadas:** no máximo 30 por endpoint por minuto, para evitar loops de
  requisição. É só uma proteção do cliente; o back não tem rate limit.
- **Retorno:** toda função devolve `{ data?, error?, status? }`, sem lançar exceção por erro
  HTTP.
- **`buscarTodasPaginas`:** percorre todas as páginas de um endpoint paginado. Os likes, os
  dislikes e os matches são lidos assim.

## Funcionalidades por tela

### `/` — Login e cadastro
- Login com e-mail e senha, ou com Google, que redireciona para o back.
- O cadastro cria a conta e volta para o login.
- Os erros do login Google chegam como `?erro=`: `conta_com_senha` e `email_nao_verificado`
  viram mensagens na tela.
- Quem já está logado vai direto para `/home`.

### `/auth/callback`
- Guarda o token recebido na URL e apaga esse parâmetro do histórico.
- Busca a conta e o perfil, e manda para `/home` ou `/onboarding`.

### `/onboarding`
Cadastro do perfil em quatro passos:
1. dados: nome, curso, nascimento, gênero e interesse;
2. contatos: redes sociais;
3. interesses: até 5 tags;
4. fotos.

O aceite dos termos é obrigatório. O front valida 18 anos ou mais, assim como o back.

### `/home` — Deck
- **Abertura:** carrega o perfil da pessoa, as tags e, completos, os matches, likes dados, likes
  recebidos e dislikes.
- **Busca de perfis:** sob demanda, em páginas de 100 (`sort=id`, para a ordem ser estável),
  sempre que restam menos de 5 cards.
- **Quem sai do deck:**
  - quem já foi curtido ou dispensado, ou já deu match;
  - quem não é compatível: cada lado precisa ter interesse no gênero do outro;
  - com o filtro de tags ativo, quem não tem nenhuma tag em comum.
- **Ordem:** quem já curtiu a pessoa aparece primeiro, dentro dos perfis já carregados.
- **Ações:** curtir (`POST /likes`) mostra o aviso de match quando há reciprocidade. Passar
  (`POST /dislikes`) é salvo no back. As duas funcionam por arrastar, por botão ou pelas setas
  do teclado.

### `/matches`
- Lista os matches e mostra os contatos (Instagram, WhatsApp, Telegram) de cada um.
- Permite desfazer um match e ver as curtidas dadas.

### `/profile`
- Edita dados, tags, redes sociais e fotos.
- Sair e excluir a conta: apaga o perfil e depois a conta, e o back limpa o resto em cascata.

## Regras de negócio no front (`lib/utils/pessoa.ts`)

| Função | Regra |
|---|---|
| `perfilPendente` | Manda para o onboarding se `GET /pessoas/me` dá 404 ou `perfilCompleto=false`. |
| `compativeis` | Interesse mútuo de gênero; dado faltando conta como compatível. |
| `fotosParaPessoa` | Foto principal primeiro, depois o resto da galeria. |

## Rodar e verificar

```bash
cp .env.example .env        # VITE_API_BASE=http://localhost:8080
npm install
npm run dev                 # http://localhost:5173
npm run check               # svelte-check (tipos)
npm run lint                # Prettier + ESLint
npm run build               # exige VITE_API_BASE
```

## Limitações conhecidas

- **Testes:** não há testes automatizados (nem Vitest nem Playwright); só checagem de tipos e
  build.
- **Filtragem do deck:** é feita no navegador. A prioridade de "quem me curtiu" só vale entre os
  perfis já carregados.
- **Sessão:** o token expira em 15 minutos, sem renovação, e então a pessoa volta ao login.
- **Foto principal:** não há como trocar a principal de uma foto já enviada (falta endpoint no
  back).
