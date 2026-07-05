# AGENTS.md — Comer O Quê?

Este é o guia operacional atual do projeto **Comer O Quê?**.

O roadmap inicial não é mais usado como fonte de verdade. Este arquivo substitui o
roadmap para decisões de produto, escopo vigente, restrições técnicas e regras de
implementação. Quando houver dúvida, confira o estado real do repositório e siga
este arquivo.

## Fontes de verdade e precedência

Em caso de conflito, siga esta ordem:

1. A decisão mais recente e explícita do responsável pelo produto.
2. Este `AGENTS.md`.
3. O comportamento já existente no código.
4. Documentação oficial das ferramentas usadas, na versão instalada no projeto.

Não use mais arquivos de roadmap como base para decidir escopo, progresso ou
próximas tarefas. Um roadmap antigo pode servir apenas como contexto histórico se o
responsável pelo produto pedir explicitamente.

Antes de iniciar uma tarefa:

- Leia este arquivo.
- Confira o estado real do repositório.
- Preserve alterações locais do usuário.
- Não refatore fora do escopo.
- Não implemente ideias futuras sem decisão explícita.
- Se uma solicitação alterar escopo, stack, arquitetura ou regra de produto,
  atualize este arquivo na mesma entrega.

## Estado atual do produto

- Nome: **Comer O Quê?**
- Plataforma inicial: **Android**.
- Stack: **Expo + React Native + TypeScript**.
- Navegação: **Expo Router**.
- Backend: **Supabase**.
- Visual: cartunesco, alegre, vermelho desejo como cor principal, cards grandes,
  cantos arredondados, sombras leves e poucas animações.
- O MVP principal já foi concluído.
- O **ModoMatch v1 online** faz parte do produto atual.

## Funcionalidades já existentes

O app já possui:

- Home com acesso ao Modo Entrevista, Roleta e ModoMatch.
- Área de **Sugestões** para enviar nome e mensagem com sugestão, elogio ou problema.
- Catálogo e configuração lidos do Supabase.
- Cache local e fallback para uso sem internet ou sem Supabase.
- Quatro grupos de roleta:
  - sobremesa;
  - fome grande;
  - culinária regional;
  - culinária estrangeira.
- Roleta com sorteio ponderado por `weight`.
- Suspense simples na Roleta, sem roleta circular.
- Botão **Ver lugares próximos**, abrindo Google Maps por URL.
- Modo Entrevista local, com perguntas fixas, tags e pontuação.
- ModoMatch online com sala por código e link compartilhável.
- ModoMatch com apelido temporário, começo manual pelo criador e expiração de 2 horas.
- Match quando as 2 pessoas curtirem a mesma comida do catálogo filtrado.
- A rodada do ModoMatch continua mesmo depois de um match, acumulando histórico na sala.
- Resultados de comida devem preferir imagem remota via Supabase Storage e cair para emoji quando necessário.
- Mensagens da área de Sugestões devem ser salvas no Supabase apenas com `name` e `message`.

## Escopo vigente — ModoMatch v1 online

O ModoMatch vigente é o **ModoMatch v1 online entre celulares diferentes**.

Decisões obrigatórias:

- O ModoMatch v1 será online entre celulares diferentes.
- Não terá login.
- Cada participante entra com apelido temporário.
- O convite terá:
  - código curto digitável;
  - link compartilhável.
- A interface v1 será limitada a 2 pessoas.
- O banco deve ser modelado como grupo, para permitir mais participantes no futuro.
- A interação será por cards em sequência.
- Cada participante vota:
  - **Gostei**;
  - **Passo**.
- Quando os 2 participantes derem **Gostei** na mesma comida, aparece **Deu match!**.
- Depois de um match, a sala continua ativa para permitir novos matches e mostrar histórico.
- A lista de comidas deve vir do catálogo existente.
- Ao criar a sala, o usuário escolhe um filtro:
  - `tudo`;
  - `sobremesa`;
  - `fome-grande`;
  - `regional`;
  - `estrangeira`.
- A sala não começa automaticamente quando a segunda pessoa entra.
- Apenas o criador pode apertar **Começar**.
- Salas expiram depois de 2 horas.
- O ModoMatch precisa de conexão com Supabase. Não use fallback local para partidas
  online.

## Fluxo esperado do ModoMatch v1

Fluxo de criação:

1. Usuário abre ModoMatch.
2. Toca em **Criar sala**.
3. Informa apelido.
4. Escolhe filtro da rodada.
5. App cria sala no Supabase.
6. App mostra código e link compartilhável.
7. Segunda pessoa entra por link ou código.
8. Criador aperta **Começar**.
9. Os dois votam nos cards.
10. Quando ambos curtirem a mesma comida, os dois veem **Deu match!**.
11. A sala registra esse match no histórico e continua ativa para mais votos.
12. O último match mostra botão **Ver lugares próximos**.

Fluxo de entrada:

1. Usuário abre link ou toca em **Entrar com código**.
2. Informa apelido.
3. Informa código, se necessário.
4. Entra na sala se ela existir, não estiver expirada e não estiver cheia.
5. Aguarda o criador começar.

## Banco de dados — regras permanentes

Todo schema deve ser versionado:

- Schema e alterações estruturais ficam em `supabase/migrations/`.
- Dados iniciais ficam em `supabase/seed.sql` enquanto o produto estiver em fase
  inicial.
- Crie uma nova migration para cada mudança.
- Não edite migrations antigas já aplicadas.
- Não altere schema pelo SQL Editor ou Table Editor do projeto remoto.
- Preserve dados existentes.
- Mantenha RLS habilitado e seguro.
- Teste migrations e seed localmente com Docker aberto usando:

```bash
npx supabase db reset
```

No aplicativo móvel:

- Use apenas URL e chave pública/publishable do Supabase.
- Nunca use nem exponha a `service_role` key.
- Variáveis `EXPO_PUBLIC_*` entram no bundle do cliente e não podem conter segredos.
- Não registre tokens, credenciais ou conteúdo sensível em logs.
- Não implemente autenticação sem decisão explícita.

## Banco de dados — ModoMatch v1

A implementação do ModoMatch deve usar novas migrations.

Tabelas esperadas:

- `match_rooms`
- `match_participants`
- `match_room_items`
- `match_votes`
- `match_room_matches`

Requisitos:

- Habilitar RLS nas tabelas novas.
- Não exigir login.
- Usar token local do participante para validar ações.
- Salvar apenas hash do token no banco, nunca o token puro.
- Preferir mutations por funções RPC `security definer`.
- Permitir leitura anônima apenas do necessário para salas não expiradas.
- Manter dados mínimos: sala, apelido, votos e comida.
- Não armazenar dados pessoais além do apelido temporário.

Status de sala:

- `waiting`
- `active`
- `matched`
- `expired`

Votos:

- `like`
- `dislike`

RPCs esperadas:

- `create_match_room(p_nickname text, p_filter_slug text, p_client_token text)`
- `join_match_room(p_code text, p_nickname text, p_client_token text)`
- `start_match_room(p_room_id uuid, p_participant_id uuid, p_client_token text)`
- `cast_match_vote(p_room_id uuid, p_participant_id uuid, p_client_token text, p_food_id uuid, p_vote text)`

As RPCs devem validar:

- apelido;
- filtro;
- código;
- status da sala;
- expiração;
- lotação;
- token do participante;
- permissão do criador para iniciar;
- se a comida pertence aos itens da sala;
- se houve match.

## Realtime e WebSocket

Use **Supabase Realtime** pelo próprio `@supabase/supabase-js`.

Não instale bibliotecas externas de WebSocket, como:

- `socket.io-client`;
- `ws`;
- `react-use-websocket`.

A implementação deve usar:

```ts
supabase
  .channel(`match-room-${roomId}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "match_rooms",
      filter: `id=eq.${roomId}`,
    },
    callback,
  )
  .subscribe();
```

Para o ModoMatch v1, prefira Postgres Changes porque o estado importante da sala
já estará salvo no banco. Presence e Broadcast podem ser avaliados depois, se
houver necessidade real.

O app deve atualizar via realtime:

- entrada de participantes;
- mudança de status da sala;
- match encontrado.
- histórico de matches da sala.

Sempre faça cleanup das subscriptions ao desmontar telas.

## Convite e deep link

O ModoMatch deve oferecer:

- código curto digitável;
- link compartilhável.

O link deve abrir a rota da sala quando possível. Se for necessário configurar deep
link, use o mecanismo do Expo e um scheme simples, por exemplo:

```json
{
  "scheme": "comeroque"
}
```

Não quebre a configuração Android existente.

Mensagem sugerida de compartilhamento:

```txt
Bora decidir o que comer? Entra no meu ModoMatch do Comer O Quê?: [link] Código: ABC123
```

O código manual deve continuar funcionando mesmo se o deep link falhar.

## Rotas e telas esperadas do ModoMatch

Use Expo Router e mantenha o padrão de rotas já usado no projeto.

Telas esperadas:

- tela inicial do ModoMatch;
- tela de criação de sala;
- tela de entrada por código;
- tela da sala por código.

A tela da sala deve tratar os estados:

### `waiting`

- Mostrar código da sala.
- Mostrar botão **Compartilhar convite**.
- Mostrar participantes conectados.
- Se só houver 1 participante: mostrar “Aguardando a outra pessoa entrar...”.
- Se houver 2 participantes:
  - para criador: mostrar botão **Começar**;
  - para convidado: mostrar “Esperando o criador começar”.

### `active`

- Mostrar cards em sequência.
- Cada card deve mostrar imagem da comida quando disponível, com fallback para emoji,
  além de nome e descrição.
- Mostrar botões **Passo** e **Gostei**.
- Depois do voto, avançar para o próximo card ainda não votado pelo participante.
- Desabilitar botões durante envio do voto.
- Continuar ouvindo realtime para detectar match.
- Quando houver match, destacar o último **Deu match!** sem encerrar a rodada.
- Mostrar botão **Ver lugares próximos** para o último match.
- Mostrar histórico de matches feitos na sala.
- Se o participante acabar todos os cards sem match, mostrar mensagem amigável e
  continuar ouvindo atualizações da sala.

### `matched`

- Se alguma sala legada ainda chegar com status `matched`, trate esse estado como a
  mesma experiência do estado `active`, com o último match em destaque e a rodada
  ainda disponível para render novos matches.

### `expired`

- Mostrar “Essa sala saiu do forno faz tempo. Crie uma nova.”
- Mostrar botão **Criar nova sala**.
- Mostrar botão **Voltar para Home**.

## Catálogo, cache e offline

- O catálogo remoto é a fonte preferencial de dados.
- Para fluxos normais do app, a ordem de recuperação é:
  1. Supabase;
  2. último cache válido;
  3. fallback local.
- Uma falha de rede não deve impedir Roleta e Entrevista quando houver cache ou
  fallback.
- O ModoMatch online é exceção: ele precisa de conexão e deve mostrar erro
  amigável quando Supabase ou realtime estiverem indisponíveis.
- Dados remotos devem ser validados antes de substituir um cache válido.
- O fallback deve acompanhar mudanças estruturais do catálogo.

## Imagens das comidas

- As imagens das comidas devem ficar no **Supabase Storage**, em bucket público,
  e o catálogo deve apontar para elas por `foods.asset_key`.
- O app deve tentar carregar a imagem primeiro e usar o emoji como fallback quando
  o arquivo não existir ou falhar.
- Não salve binários de imagem em tabelas Postgres do catálogo.

## Mapas

O botão **Ver lugares próximos** deve abrir:

```txt
https://www.google.com/maps/search/?api=1&query=[query encoded]
```

Regras:

- Use `expo-linking`.
- Codifique a consulta.
- Não peça localização dentro do app.
- Não use Google Places API.
- Não adicione SDK nativo de mapas.
- Não adicione API key de mapas.

## Expo e dependências

Antes de alterar código relacionado ao Expo:

1. Identifique a versão instalada em `package.json`.
2. Use a documentação oficial da versão instalada.
3. Não presuma compatibilidade de exemplos de outras versões.

Use a versão do Node declarada em `.nvmrc`.

Prefira:

- `npx expo install <pacote>` para pacotes do ecossistema Expo/React Native;
- `npm install <pacote>` para dependências JavaScript sem versão gerenciada pelo
  Expo;
- `npx supabase ...` para a CLI local do Supabase.

Não adicione dependências sem necessidade e justificativa. Antes de adicionar uma
biblioteca, verifique se Expo, React Native, Supabase ou a plataforma já oferecem
uma solução suficiente.

## Organização e código

- Use TypeScript estrito e tipos de domínio explícitos.
- Mantenha telas e rotas no diretório de rotas já usado pelo projeto.
- Mantenha código reutilizável e sem UI em `src/`, organizado por responsabilidade:
  `components`, `data`, `lib`, `services`, `theme` e `types`.
- Componentes devem ser pequenos e focados.
- Regras de negócio não devem ficar acopladas à renderização.
- Centralize tokens visuais no tema.
- Evite espalhar cores, espaçamentos e raios arbitrários pelas telas.
- Prefira soluções simples e legíveis.
- Não crie infraestrutura para requisitos que ainda não existem.
- Não faça refatorações amplas durante uma tarefa pequena.
- Não altere arquitetura, mova arquivos ou renomeie APIs públicas sem necessidade
  clara.
- Não esconda erros técnicos com `any`, casts inseguros ou tratamento vazio.

## UX e acessibilidade

- Priorize Android.
- Valide legibilidade em telas pequenas.
- Use áreas de toque confortáveis.
- Garanta contraste adequado.
- Use textos claros e amigáveis.
- Botões principais devem ser grandes.
- Estados desabilitados devem ser visíveis.
- Respeite safe areas, teclado e rolagem.
- Animações devem ser breves, funcionais e não bloquear interação além do
  necessário.
- Mantenha o tom divertido sem sacrificar clareza.

## Fora do escopo atual

Não implemente sem decisão explícita:

- Login, cadastro, autenticação ou perfis.
- ModoMatch com mais de 2 pessoas na interface.
- Chat.
- Push notifications.
- Histórico global de partidas por usuário.
- Lista de amigos.
- Ranking social.
- Monetização.
- AdMob.
- Compras dentro do app.
- Parcerias locais.
- Google Places API.
- Localização interna.
- API key de mapas.
- IA externa para recomendar comida.
- Painel administrativo.
- Backend próprio fora do Supabase.

## Fluxo de trabalho por tarefa

Cada mudança deve ter:

1. Objetivo pequeno e verificável.
2. Arquivos esperados.
3. Limites do que não será feito.
4. Critério de pronto.
5. Validação proporcional ao risco.

Ao implementar:

- Faça a menor alteração que resolva o objetivo.
- Preserve compatibilidade com o SDK e com a arquitetura atual.
- Inclua estados de loading, vazio e erro quando a mudança envolver dados.
- Atualize tipos, fallback, migrations e documentação quando a mudança exigir.
- Não faça operações remotas, publique ou envie alterações sem autorização.
- Não use roadmap para marcar progresso.

## Critérios de qualidade

Antes de considerar uma tarefa concluída, execute o que for aplicável:

```bash
npx tsc --noEmit
npx expo install --check
npm run lint
```

Para alterações de banco, com Docker disponível:

```bash
npx supabase db reset
```

Também verifique manualmente o fluxo alterado no Android/Expo quando a tarefa afetar
interface ou comportamento nativo.

Uma entrega está pronta quando:

- O TypeScript não apresenta erros introduzidos pela mudança.
- O app abre e o fluxo alterado funciona no Android/Expo.
- Loading, vazio, offline e erro foram considerados quando aplicáveis.
- Nenhum segredo foi adicionado ao repositório ou ao bundle.
- Não houve implementação acidental de itens fora do escopo.
- A documentação foi atualizada se alguma decisão mudou.

Para o ModoMatch v1, a entrega só está pronta quando:

- Um celular cria sala com apelido e filtro.
- O app mostra código e permite compartilhar convite.
- Outro celular entra pelo código.
- Sala cheia bloqueia terceiro participante.
- Sala expirada não permite entrada.
- A sala só começa quando o criador aperta **Começar**.
- Os dois celulares veem cards em sequência.
- Cada pessoa consegue votar **Gostei** ou **Passo**.
- Quando ambos dão **Gostei** na mesma comida, os dois celulares veem **Deu match!**.
- O botão **Ver lugares próximos** abre Google Maps por URL com `search_query`.

## Manutenção deste arquivo

Atualize este arquivo quando ocorrer qualquer uma destas situações:

- Mudança no escopo vigente.
- Início ou encerramento de uma fase do produto.
- Inclusão ou remoção de plataforma, backend ou serviço externo.
- Atualização do Expo SDK, React Native, Node ou ferramenta de build.
- Mudança na arquitetura de pastas, estratégia de dados ou fluxo de deploy.
- Nova regra de segurança, autenticação, monetização ou privacidade.
- Uma decisão explícita tornar qualquer instrução deste arquivo obsoleta.

Mantenha este arquivo como descrição do presente. O histórico detalhado pertence ao
Git, não a este documento.
