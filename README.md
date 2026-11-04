# PairUp — front

Interface web do PairUp (SvelteKit + Svelte 5 + TypeScript). A API fica no repositório
`Tinder_ufs`; o contrato entre os dois está em `docs/CONTRATO_FRONT_BACK.md`, lá.

## Como rodar

1. Suba o backend (porta 8080 por padrão).
2. Copie `.env.example` para `.env` e ajuste `VITE_API_BASE`. O `npm run build` falha sem essa variável.
3. Rode:

   ```bash
   npm install
   npm run dev      # http://localhost:5173
   ```

O login com Google exige que a origem do front esteja na lista de CORS do backend
(`SecurityConfig`) e que `FRONTEND_URL` aponte para ela.

| Comando | Para quê |
|---|---|
| `npm run check` | Tipos e avisos de acessibilidade do Svelte |
| `npm run build` | Build de produção |
| `npm run lint` | Prettier e ESLint |

## Estrutura

```
src/
├── routes/                 telas: carregam dados e guardam o estado
│   ├── (auth)/             login e cadastro, com o painel da marca
│   ├── auth/callback/      retorno do login Google
│   ├── onboarding/         cadastro do perfil em 4 passos
│   ├── home/               deck de pessoas
│   ├── matches/            matches e likes dados
│   └── profile/            editar perfil, sair, excluir conta
└── lib/
    ├── components/
    │   ├── ui/             peças genéricas, sem regra de negócio
    │   ├── perfil/         campos usados no onboarding e em /profile
    │   ├── home/           card e filtros do deck
    │   ├── matches/        cartões e abas de /matches
    │   ├── onboarding/     progresso e aceite de termos
    │   └── login/          formulários de autenticação
    ├── services/
    │   ├── api.ts          o único arquivo que chama o backend
    │   └── types.ts        espelho dos DTOs Java
    ├── stores/authStore.ts sessão (token e usuário)
    ├── data/               listas fixas: cursos, gêneros, interesses
    └── utils/              funções puras: idade, compatibilidade, máscaras
```

## Convenções

- **Quem chama a API são as páginas.** Os componentes recebem dados por props e avisam por
  callbacks (`onLike`, `onConfirm`). As exceções são `FotosUploader`, que remove a foto no
  servidor, e `SocialLogin`, que inicia o login Google.
- **Cores e tema** vêm dos tokens em `src/routes/layout.css` (`var(--primary)` etc.), sem hex
  de marca nos componentes.
- **Campos de formulário**: use `ui/InputField`, `ui/SelectField` e `ui/TextareaField`, que já
  ligam o label, mostram o erro e aplicam o tema.
- **Ícones repetidos** ficam em `ui/icons.ts` e são usados por `<Icon name="..." />`.
- **Mudou um DTO no backend?** Atualize `services/types.ts`: nada gera esse arquivo.

## Componentes de `ui/`

| Componente | Uso |
|---|---|
| `AppHeader` | Cabeçalho das telas logadas; `backHref` mostra o voltar, o slot é o lado direito |
| `HeaderButton` | Botão de ícone do cabeçalho, com `badge` opcional |
| `Button` | Variantes `primary`, `ghost`, `danger`, `danger-outline`; `loading` e `block` |
| `Alert` | Mensagem `success`, `error` ou `info` |
| `LoadingState` / `EmptyState` | Carregando e tela sem conteúdo (ação pelo slot) |
| `ConfirmModal` | Confirmação; `Escape` e clique fora cancelam |
| `InputField` / `SelectField` / `TextareaField` | Campos; `InputField` aceita `mask` |
| `Avatar` / `BrandLogo` / `Icon` / `Section` | Foto ou inicial, logo, ícone, bloco com título |
