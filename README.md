# Comer O Quê?

Aplicativo mobile para ajudar quem está com fome, mas não consegue decidir o que comer.

O MVP terá dois modos de escolha:

- **Modo Entrevista:** perguntas rápidas para sugerir pratos.
- **Roleta:** sorteio entre categorias e comidas.

O **ModoMatch**, para decidir em grupo, aparece no aplicativo como uma funcionalidade futura.

## Tecnologias

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Router
- Supabase

## Requisitos

- Node.js 22.13 ou superior, ainda dentro da versão 22
- npm
- Expo Go ou um emulador Android/iOS

O projeto fixa a versão recomendada no arquivo `.nvmrc`. Com o NVM:

```bash
nvm install
nvm use
```

## Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Use somente a chave pública no aplicativo. Nunca adicione uma `service_role` ao cliente mobile.

## Executando o aplicativo

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Atalhos disponíveis:

```bash
npm run android
npm run ios
npm run web
```

## Estrutura principal

```text
src/
├── app/            # Rotas e telas do Expo Router
├── data/           # Catálogo local de fallback
├── lib/            # Integrações, como Supabase e mapas
├── services/       # Regras de acesso aos dados
├── theme/          # Cores, espaçamentos e tipografia
└── types/          # Tipos compartilhados
```

As rotas atuais são:

- `/` — Home
- `/interview` — Modo Entrevista
- `/roulette` — Roleta
- `/match-coming-soon` — aviso do ModoMatch

## Validação

Verifique os tipos e a compatibilidade das dependências:

```bash
npx tsc --noEmit
npx expo install --check
```

## Estado do projeto

A fundação visual e a navegação estão prontas. As regras completas da entrevista, da roleta e o carregamento remoto do catálogo serão implementados nas próximas fases do roadmap.
