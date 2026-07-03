# Guia Vivo — Comer O Quê?

Versão: v0.2  
Data-base: 2026-07-02

---

## 0. Decisões atuais do produto

**Nome:** Comer O Quê?  
**Plataforma inicial:** Android  
**Stack:** Expo + React Native + TypeScript  
**Navegação:** Expo Router  
**Backend:** Supabase  
**Uso do Supabase no MVP:** apenas catálogo/configuração  
**Login:** não entra no MVP  
**Modo Match:** não entra no MVP, apenas aviso “ModoMatch em breve”  
**Mapas:** botão **Ver lugares próximos**, abrindo Google Maps por URL, sem API paga  
**Monetização:** não implementar ainda; preparar o app para AdMob depois  
**Visual:** cartunesco, vermelho desejo, cores vivas, cards grandes, cantos arredondados e poucas animações

---

## 1. Regra de ouro para usar o Codex

Cada pedido ao Codex deve ter:

1. Objetivo pequeno
2. Arquivos esperados
3. O que não deve ser feito
4. Critério de pronto
5. Pedido para não refatorar além do necessário

Modelo padrão:

```txt
Você está trabalhando no app Expo React Native "Comer O Quê?".

Tarefa:
[descrever tarefa pequena]

Arquivos esperados:
[listar arquivos]

Não faça:
- Não implemente login.
- Não implemente ModoMatch completo.
- Não adicione dependências sem justificar.
- Não altere arquitetura fora do escopo.

Critério de pronto:
- O app compila.
- TypeScript não acusa erro.
- A tela funciona no Android/Expo.
- O código está organizado e simples.
```

---

## 2. Fase 1 — Fundação do projeto

### Task 1.1 — Criar projeto Expo

Execute:

```bash
npx create-expo-app@latest comer-o-que
cd comer-o-que
```

Depois:

```bash
npm install @supabase/supabase-js react-native-url-polyfill
npx expo install expo-linking @react-native-async-storage/async-storage
```

Crie `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

### Task 1.2 — Criar estrutura base

Prompt para o Codex:

```txt
Crie a estrutura base do app "Comer O Quê?" em Expo React Native com TypeScript.

Arquivos/pastas:
- app/_layout.tsx
- app/index.tsx
- app/roulette.tsx
- app/interview.tsx
- app/match-coming-soon.tsx
- src/theme/theme.ts
- src/types/catalog.ts
- src/lib/supabase.ts
- src/lib/maps.ts
- src/data/fallbackCatalog.ts
- src/services/catalogService.ts

Requisitos:
- Usar Expo Router.
- Criar uma Home simples com três botões:
  1. Modo Entrevista
  2. Roleta
  3. ModoMatch em breve
- Não implementar lógica profunda ainda.
- Criar tema com vermelho desejo como cor principal.
- Manter visual cartunesco, cards grandes e botões arredondados.

Não faça:
- Não implemente login.
- Não implemente anúncios.
- Não implemente ModoMatch real.
```

Critério de pronto:

```bash
npx expo start
```

O app deve abrir sem erro.

---

## 3. Fase 2 — Supabase com migrations e catálogo

**Decisão:** não criar schema manualmente pelo Dashboard.  
O banco será versionado com **Supabase CLI + migrations**, e os dados iniciais do catálogo ficarão em `supabase/seed.sql`.

Fluxo padrão:

```txt
schema → supabase/migrations/
dados iniciais → supabase/seed.sql
teste local → npx supabase db reset
deploy remoto → npx supabase db push --include-seed
```

### [x] Task 2.1 — Instalar Supabase CLI como dependência de desenvolvimento

Execute dentro da raiz do projeto:

```bash
npm install supabase --save-dev
```

Observações importantes:

```txt
- Prefira usar `npx supabase ...`.
- Não use service role key no app mobile.
- Para rodar Supabase localmente, você precisa ter Docker instalado e aberto.
- O schema do banco deve ser alterado por migrations, não pelo SQL Editor do projeto remoto.
```

Critério de pronto:

```bash
npx supabase --version
```

### [x] Task 2.2 — Inicializar Supabase no projeto

Execute:

```bash
npx supabase init
```

Isso deve criar:

```txt
supabase/
├── config.toml
├── migrations/
└── seed.sql
```

Critério de pronto:

```txt
A pasta supabase/ existe e será versionada no Git.
```

### [x] Task 2.3 — Criar migration do schema de catálogo

Execute:

```bash
npx supabase migration new create_catalog_schema
```

Isso criará um arquivo parecido com:

```txt
supabase/migrations/20260702123456_create_catalog_schema.sql
```

Cole na migration:

```sql
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  emoji text,
  asset_key text,
  search_query text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.food_tags (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  tag text not null
);

create table public.roulette_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  emoji text,
  is_active boolean not null default true
);

create table public.roulette_group_foods (
  group_id uuid not null references public.roulette_groups(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  weight int not null default 1,
  primary key (group_id, food_id)
);

alter table public.foods enable row level security;
alter table public.food_tags enable row level security;
alter table public.roulette_groups enable row level security;
alter table public.roulette_group_foods enable row level security;

create policy "public read active foods"
on public.foods
for select
to anon
using (is_active = true);

create policy "public read food tags"
on public.food_tags
for select
to anon
using (true);

create policy "public read active roulette groups"
on public.roulette_groups
for select
to anon
using (is_active = true);

create policy "public read roulette group foods"
on public.roulette_group_foods
for select
to anon
using (true);
```

Critério de pronto:

```txt
A migration existe dentro de supabase/migrations/ e contém todo o schema inicial.
```

### [x] Task 2.4 — Criar seed.sql com catálogo inicial

O catálogo inicial fica em:

```txt
supabase/seed.sql
```

Comece com aproximadamente **20 opções por roleta**.

Roletas:

```txt
sobremesa
fome-grande
regional
estrangeira
```

Prompt para o Codex:

```txt
Gere o arquivo supabase/seed.sql para o app "Comer O Quê?".

Contexto:
- O schema já existe em uma migration.
- Não crie tabelas novas.
- Não altere policies.
- Gere apenas inserts de dados iniciais.

Requisitos:
- Inserir 4 roletas:
  1. Sobremesa / slug sobremesa / emoji 🍰
  2. Fome grande / slug fome-grande / emoji 🍔
  3. Culinária regional / slug regional / emoji 🇧🇷
  4. Culinária estrangeira / slug estrangeira / emoji 🌍

- Criar aproximadamente 20 comidas por roleta.
- Algumas comidas podem aparecer em mais de uma roleta.
- Evitar comidas duplicadas na tabela foods.
- Cada comida deve ter:
  - name
  - description curta e divertida
  - emoji
  - search_query no formato "[comida] perto de mim"
- Criar tags relevantes na tabela food_tags.
- Criar vínculos em roulette_group_foods.
- Usar weight para comidas mais populares aparecerem mais.

Regras:
- Use CTEs ou selects por slug/nome para criar vínculos sem depender de UUID fixo.
- Não use imagens externas.
- Não use dados de restaurantes reais.
```

Critério de pronto:

```txt
O arquivo supabase/seed.sql existe e contém roletas, comidas, tags e vínculos.
```

### Task 2.5 — Testar banco local com migrations e seed

Com Docker aberto, execute:

```bash
npx supabase start
npx supabase db reset
```

Critério de pronto:

```txt
- As migrations rodam sem erro.
- O seed roda sem erro.
- O Supabase Studio local mostra as tabelas foods, food_tags, roulette_groups e roulette_group_foods populadas.
```

### Task 2.6 — Linkar projeto remoto do Supabase

Depois que o local estiver funcionando, conecte ao projeto remoto:

```bash
npx supabase login
npx supabase link
```

Critério de pronto:

```txt
O projeto local está linkado ao projeto remoto correto.
```

### Task 2.7 — Enviar migrations e seed para o Supabase remoto

Execute:

```bash
npx supabase db push --include-seed
```

Critério de pronto:

```txt
- O projeto remoto tem as mesmas tabelas do local.
- O catálogo inicial aparece no Table Editor.
- O app mobile consegue ler o catálogo usando a anon/publishable key.
```

### Regra permanente para banco

Depois de adotar migrations:

```txt
- Não altere o schema direto no SQL Editor remoto.
- Não crie colunas pelo Table Editor remoto.
- Toda mudança de schema deve virar uma nova migration.
- Mudanças no catálogo inicial devem ser feitas no seed enquanto o app ainda está em fase inicial.
- Depois que houver usuários reais, alterações de catálogo devem ser feitas com cuidado para não apagar dados importantes.
```

Prompt padrão para futuras mudanças de banco:

```txt
Crie uma nova migration Supabase para a seguinte mudança:

[MUDANÇA]

Requisitos:
- Não editar migrations antigas.
- Criar uma nova migration em supabase/migrations/.
- Manter RLS seguro.
- Não quebrar dados existentes.
- Explicar como testar com npx supabase db reset.
```

---

## 4. Fase 3 — Carregamento de catálogo no app

### Task 3.1 — Tipos e fallback local

Prompt para o Codex:

```txt
Implemente os tipos e o fallback local do catálogo.

Arquivos:
- src/types/catalog.ts
- src/data/fallbackCatalog.ts

Requisitos:
- Criar tipos Food, RouletteGroup e RouletteGroupFood.
- Criar fallback local com as 4 roletas.
- Cada roleta deve ter pelo menos 8 comidas no fallback.
- O fallback deve permitir o app funcionar sem internet ou sem Supabase.
- Manter search_query em cada comida.
```

### Task 3.2 — Supabase client

Prompt:

```txt
Implemente o client do Supabase.

Arquivo:
- src/lib/supabase.ts

Requisitos:
- Importar react-native-url-polyfill/auto.
- Usar createClient de @supabase/supabase-js.
- Ler:
  - process.env.EXPO_PUBLIC_SUPABASE_URL
  - process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- Lançar erro claro em desenvolvimento se faltar variável.
- Não usar service role key.
```

### Task 3.3 — Catalog service com cache

Prompt:

```txt
Implemente o serviço de catálogo.

Arquivo:
- src/services/catalogService.ts

Requisitos:
- Buscar roletas e comidas do Supabase.
- Montar a estrutura final por grupo de roleta.
- Usar AsyncStorage para cachear o último catálogo válido.
- Ordem de carregamento:
  1. Tentar Supabase.
  2. Se funcionar, salvar no cache e retornar.
  3. Se falhar, tentar cache.
  4. Se não houver cache, retornar fallback local.
- Exportar uma função getCatalog().
- Não implementar login.
```

---

## 5. Fase 4 — Home e identidade visual

### Task 4.1 — Tema visual

Prompt:

```txt
Crie o tema visual do app "Comer O Quê?".

Arquivo:
- src/theme/theme.ts

Direção visual:
- Cartunesco.
- Cores vivas.
- Vermelho desejo como cor principal.
- Fundo claro e alegre.
- Cards grandes.
- Cantos arredondados.
- Sombras leves.
- Pouquíssimas animações.

Exportar:
- colors
- spacing
- radius
- typography
```

### Task 4.2 — Home

Prompt:

```txt
Implemente a Home do app.

Arquivo:
- app/index.tsx

Requisitos:
- Título: Comer O Quê?
- Subtítulo divertido para indecisos.
- Card/botão para Modo Entrevista.
- Card/botão para Roleta.
- Card/botão para ModoMatch em breve.
- Visual cartunesco com vermelho desejo.
- Navegar usando Expo Router.
- O card do ModoMatch deve indicar que está em breve.
```

---

## 6. Fase 5 — Roleta

### Task 5.1 — Seleção das quatro roletas

Prompt:

```txt
Implemente a tela inicial da Roleta.

Arquivo:
- app/roulette.tsx

Requisitos:
- Carregar catálogo usando getCatalog().
- Mostrar 4 cards:
  1. Sobremesa
  2. Fome grande
  3. Culinária regional
  4. Culinária estrangeira
- Cada card deve ter emoji, nome e descrição.
- Ao tocar em um card, selecionar aquela roleta.
- Mostrar estados de loading e erro/fallback de forma amigável.
```

### Task 5.2 — Sorteio ponderado

Prompt:

```txt
Implemente o sorteio ponderado da Roleta.

Requisitos:
- Cada comida vinculada à roleta tem weight.
- O sorteio deve respeitar o peso.
- Criar função utilitária para sortear uma Food com base no weight.
- Evitar sortear undefined.
- Se a roleta estiver vazia, mostrar mensagem amigável.
```

### Task 5.3 — Suspense simples

Prompt:

```txt
Implemente a experiência de suspense da Roleta.

Requisitos:
- Não criar roleta circular.
- Ao tocar em "Girar", alternar rapidamente entre emojis/nomes por cerca de 1,5 segundo.
- Desabilitar o botão durante o sorteio.
- No fim, mostrar resultado final.
- Mostrar:
  - "Deu:"
  - emoji grande
  - nome
  - descrição
  - botão "Ver lugares próximos"
  - botão "Girar de novo"
- Usar animação mínima.
- Não adicionar biblioteca de animação.
```

### Task 5.4 — Ver lugares próximos

Prompt:

```txt
Implemente a função "Ver lugares próximos".

Arquivos:
- src/lib/maps.ts
- app/roulette.tsx

Requisitos:
- Criar função openNearbyPlaces(searchQuery: string).
- Usar expo-linking para abrir:
  https://www.google.com/maps/search/?api=1&query=[query encoded]
- O botão deve ter exatamente o texto "Ver lugares próximos".
- Não pedir localização dentro do app.
- Não usar Google Places API.
- Não usar API key.
```

---

## 7. Fase 6 — Modo Entrevista

### Task 6.1 — Definir perguntas fixas

Minha recomendação para o MVP: 8 perguntas fixas.

Perguntas iniciais:

```txt
1. Você quer doce ou salgado?
2. Sua fome está pequena, média ou grande?
3. Quer algo mais leve ou mais pesado?
4. Quer algo quente ou frio?
5. Quer comida brasileira ou de fora?
6. Quer algo mais barato ou tanto faz?
7. Quer algo rápido ou pode ser mais elaborado?
8. Tem alguma restrição importante?
```

### Task 6.2 — Modelo de pontuação por tags

Prompt:

```txt
Implemente o modelo do Modo Entrevista.

Arquivos:
- src/types/interview.ts
- src/data/interviewQuestions.ts
- src/services/interviewService.ts

Requisitos:
- Criar perguntas fixas.
- Cada resposta deve adicionar pontos para tags.
- Ao final, ranquear comidas do catálogo com base nas tags.
- Retornar 5 opções.
- A primeira opção é o "melhor palpite".
- Não usar IA externa.
- Não usar backend para calcular.
```

### Task 6.3 — UI da entrevista

Prompt:

```txt
Implemente a tela do Modo Entrevista.

Arquivo:
- app/interview.tsx

Requisitos:
- Mostrar uma pergunta por vez.
- Botões grandes para respostas.
- Mostrar progresso, exemplo: 3/8.
- Permitir voltar uma pergunta.
- No final, mostrar 5 opções.
- A primeira opção deve aparecer como card grande com texto "Melhor palpite".
- As outras 4 aparecem como cards menores.
- Cada opção deve ter botão "Ver lugares próximos".
```

---

## 8. Fase 7 — ModoMatch em breve

### Task 7.1 — Tela simples

Prompt:

```txt
Implemente a tela "ModoMatch em breve".

Arquivo:
- app/match-coming-soon.tsx

Texto:
"ModoMatch em breve!

Escolha comida junto com seu par ou com a galera. Todo mundo dá like ou dislike nas opções, e quando todos curtirem o mesmo prato… deu match!

Essa funcionalidade ainda está no forno."

Requisitos:
- Visual divertido.
- Botão para voltar para Home.
- Não implementar salas.
- Não implementar realtime.
- Não implementar login.
```

---

## 9. Fase 8 — Qualidade do MVP

### Task 8.1 — Estados vazios e erros

Prompt:

```txt
Revise o app para estados vazios, erros e loading.

Requisitos:
- Toda tela que carrega dados deve ter loading.
- Se o Supabase falhar, o app deve continuar com cache/fallback.
- Mensagens devem ser amigáveis e no tom do app.
- Não mostrar erros técnicos para usuário final.
```

### Task 8.2 — Revisão visual

Prompt:

```txt
Faça uma revisão visual geral do app.

Requisitos:
- Manter UI cartunesca.
- Usar vermelho desejo como cor principal.
- Cores vivas, mas sem poluição visual.
- Botões grandes.
- Cards arredondados.
- Textos curtos e divertidos.
- Poucas animações.
- Garantir boa leitura em Android.
```

### Task 8.3 — Checklist manual

Antes de pensar em publicar:

```txt
[ ] App abre sem crash
[ ] Home navega para todas as telas
[ ] Roleta carrega as quatro categorias
[ ] Roleta funciona com Supabase
[ ] Roleta funciona sem Supabase
[ ] Sorteio ponderado funciona
[ ] Botão Ver lugares próximos abre Google Maps
[ ] Modo Entrevista responde todas as perguntas
[ ] Modo Entrevista mostra 5 opções
[ ] ModoMatch mostra aviso em breve
[ ] Nenhum erro técnico aparece para o usuário
```

---

## 10. Fase 9 — Preparação Android

### Task 9.1 — Configurar app.json/app.config.ts

Prompt:

```txt
Configure o app para build Android.

Requisitos:
- Nome visível: Comer O Quê?
- Slug: comer-o-que
- Android package: com.seunome.comeroque
- Ícone temporário simples.
- Splash screen coerente com o tema.
- Configurar permissões mínimas.
- Não pedir localização.
```

### Task 9.2 — Primeiro build interno

Comandos:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

---

## 11. Fase 10 — Monetização, depois do MVP funcional

Não implemente anúncios antes de o app estar divertido. Primeiro prove uso.

Ordem recomendada:

1. Interstitial leve depois de algumas roletas, nunca a cada giro.
2. Rewarded ad para recurso extra, por exemplo “girar sem repetir” ou “ver mais sugestões”.
3. Remover anúncios via compra futura.
4. Parcerias locais só depois de ter usuários.

---

## 12. Ordem exata de execução

```txt
1. Criar projeto Expo
2. Criar estrutura base
3. Instalar Supabase CLI como dev dependency
4. Rodar npx supabase init
5. Criar migration create_catalog_schema
6. Criar supabase/seed.sql com catálogo inicial
7. Testar local com npx supabase start e npx supabase db reset
8. Linkar projeto remoto com npx supabase link
9. Enviar migrations e seed com npx supabase db push --include-seed
10. Implementar fallback local
11. Implementar Supabase client
12. Implementar catalogService com cache
13. Implementar Home
14. Implementar seleção das roletas
15. Implementar sorteio ponderado
16. Implementar suspense simples
17. Implementar Ver lugares próximos
18. Implementar ModoMatch em breve
19. Implementar perguntas do Modo Entrevista
20. Implementar ranking de 5 opções
21. Implementar resultado da entrevista
22. Revisar estados vazios/loading/erro
23. Revisar UI
24. Testar manualmente
25. Fazer build Android preview
```

---

## 13. Decision Log

```txt
- 2026-07-02: Nome definido como "Comer O Quê?"
- 2026-07-02: MVP Android primeiro
- 2026-07-02: MVP terá Modo Entrevista e Roleta
- 2026-07-02: ModoMatch fica como "em breve"
- 2026-07-02: Supabase será usado apenas para catálogo/configuração
- 2026-07-02: Banco será versionado com Supabase CLI + migrations; seed inicial ficará em supabase/seed.sql
- 2026-07-02: Ver lugares próximos abre Google Maps por URL
- 2026-07-02: Roleta terá 4 grupos: sobremesa, fome grande, regional e estrangeira
- 2026-07-02: Roleta usará suspense simples, sem roleta circular real
- 2026-07-02: Modo Entrevista retorna lista com 5 opções; primeira é o melhor palpite
```

---

## 14. Como manter este guia mutável

Toda vez que uma decisão mudar, adicione no Decision Log.

Depois peça ao Codex:

```txt
Atualize o ROADMAP.md com esta nova decisão e ajuste as tasks impactadas, sem alterar tarefas não relacionadas.
```

---

## 15. Próxima decisão pendente

Executar as tasks da Fase 1 e depois inicializar o Supabase CLI com migrations.

Recomendação atual: começar pelo app Expo com fallback local primeiro e, em seguida, configurar migrations antes de conectar o catálogo remoto.
