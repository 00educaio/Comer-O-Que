# Guia de desenvolvimento — Comer O Quê?

Este é um documento vivo e deve continuar válido depois que o roadmap inicial for
concluído. Ele registra as decisões atuais do produto e as regras permanentes de
desenvolvimento. O arquivo `.codex/ROADMAP_Comer_O_Que (1).md` detalha a sequência
original de implementação, mas não substitui este guia.

## Fontes de verdade e precedência

Em caso de conflito, siga esta ordem:

1. A decisão mais recente e explícita do responsável pelo produto.
2. Este `AGENTS.md`.
3. O roadmap em `.codex/`.
4. O comportamento já existente no código.

Não trate uma ideia de pós-MVP como tarefa autorizada. Quando uma solicitação
alterar escopo, stack, arquitetura ou decisão de produto, atualize este arquivo na
mesma entrega e indique claramente qual regra anterior foi substituída. Não mude
decisões de produto por iniciativa própria.

Antes de iniciar uma tarefa:

- Leia este arquivo e as partes relevantes de `.codex/`.
- Confira o estado real do repositório; o roadmap não é um relatório de progresso.
- Preserve alterações locais do usuário e não refatore fora do escopo.
- Se a solicitação conflitar com este guia, confirme que se trata de uma mudança
  intencional de escopo e atualize o guia junto com a implementação.

## Estado atual do produto

- Nome: **Comer O Quê?**
- Plataforma inicial: **Android**.
- Stack: **Expo + React Native + TypeScript**.
- Navegação: **Expo Router**.
- Backend: **Supabase**.
- Diretório de rotas atual: `src/app/`.
- Direção visual: cartunesca, alegre, com vermelho desejo como cor principal,
  cards grandes, cantos arredondados, sombras leves e poucas animações.

## Escopo do MVP

O MVP inclui:

- Home com acesso ao Modo Entrevista, Roleta e aviso do ModoMatch.
- Catálogo e configuração lidos do Supabase.
- Cache local e fallback para o app continuar útil sem internet ou sem Supabase.
- Quatro grupos de roleta: sobremesa, fome grande, culinária regional e culinária
  estrangeira.
- Sorteio ponderado por `weight`, com suspense curto e sem roleta circular.
- Modo Entrevista local, baseado em perguntas fixas, tags e pontuação, sem IA
  externa.
- Botão **Ver lugares próximos**, abrindo uma busca do Google Maps por URL.
- Tela informativa **ModoMatch em breve**.

Durante o MVP, o Supabase é usado somente para catálogo e configuração.

## Fora do MVP

Os itens abaixo são candidatos a fases posteriores. Eles devem permanecer
desacoplados quando possível, mas não devem ser implementados sem uma decisão
explícita de início da respectiva fase:

- Login, cadastro, perfis e demais fluxos de autenticação.
- ModoMatch real, incluindo salas, likes/dislikes, consenso e realtime.
- Monetização e integração com AdMob.
- APIs pagas de mapas, Google Places, localização interna ou API key de mapas.

O aviso “ModoMatch em breve” pertence ao MVP; a funcionalidade completa não.
Preparar o código para evolução significa manter limites claros e código simples,
não criar abstrações especulativas ou funcionalidades desativadas.

Quando uma funcionalidade passar do pós-MVP para o escopo ativo, mova-a para uma
seção de escopo vigente neste arquivo e registre suas restrições antes de
implementá-la.

## Expo e dependências

O Expo mudou. Antes de escrever ou alterar código relacionado ao Expo:

1. Identifique a versão instalada em `package.json`.
2. Leia a documentação oficial exata dessa versão. Para o SDK atual, use
   `https://docs.expo.dev/versions/v57.0.0/`.
3. Não presuma que exemplos de outras versões ou da documentação sem versão são
   compatíveis.

Use a versão do Node declarada em `.nvmrc`. Prefira:

- `npx expo install <pacote>` para pacotes do ecossistema Expo/React Native que
  precisam ser compatíveis com o SDK.
- `npm install <pacote>` para dependências JavaScript sem versão gerenciada pelo
  Expo.
- `npx supabase ...` para a CLI local do Supabase.

Não adicione dependências sem necessidade e justificativa. Antes de adicionar uma
biblioteca, verifique se Expo, React Native ou a plataforma já oferecem uma solução
suficiente. Não atualize dependências fora do escopo da tarefa.

## Organização e código

- Use TypeScript estrito e tipos de domínio explícitos.
- Mantenha telas e rotas em `src/app/`.
- Mantenha código reutilizável e sem UI em `src/`, organizado por responsabilidade:
  `components`, `data`, `lib`, `services`, `theme` e `types`.
- Componentes devem ser pequenos e focados; regras de negócio não devem ficar
  acopladas à renderização.
- Centralize tokens visuais no tema. Evite espalhar cores, espaçamentos e raios
  arbitrários pelas telas.
- Prefira soluções simples e legíveis. Não crie infraestrutura para requisitos que
  ainda não existem.
- Não faça refatorações amplas durante uma tarefa pequena.
- Não altere a arquitetura, mova arquivos ou renomeie APIs públicas sem necessidade
  clara.
- Não esconda erros técnicos com `any`, casts inseguros ou tratamento vazio.

## Dados, cache e comportamento offline

- O catálogo remoto é a fonte preferencial de dados em execução.
- A ordem de recuperação é: Supabase, último cache válido e fallback local.
- Uma falha de rede não deve impedir o uso básico do app.
- Dados remotos devem ser validados antes de substituir um cache válido.
- Estados de loading, vazio e erro devem existir nas telas que carregam dados.
- Não exponha mensagens técnicas ao usuário final; use mensagens curtas e
  amigáveis, mantendo detalhes úteis nos logs de desenvolvimento.
- O fallback deve acompanhar mudanças estruturais do catálogo para não ficar
  incompatível.

## Supabase e banco de dados

Todo schema deve ser versionado:

- Schema e alterações estruturais ficam em `supabase/migrations/`.
- Dados iniciais ficam em `supabase/seed.sql` enquanto o produto estiver em fase
  inicial.
- Crie uma nova migration para cada mudança; não edite migrations já aplicadas.
- Não altere schema pelo SQL Editor ou Table Editor do projeto remoto.
- Preserve dados existentes e mantenha RLS habilitado e seguro.
- Teste migrations e seed localmente com Docker aberto e
  `npx supabase db reset`.
- Só execute `supabase link`, login, push ou qualquer mudança remota quando a tarefa
  autorizar isso e o projeto de destino estiver confirmado.

No aplicativo móvel:

- Use apenas URL e chave pública/publishable do Supabase.
- Nunca use nem exponha a `service_role` key.
- Variáveis prefixadas com `EXPO_PUBLIC_` fazem parte do bundle do cliente e não
  podem conter segredos.
- Mantenha arquivos locais de ambiente fora do controle de versão sempre que
  possível. Documente apenas os nomes necessários em `.env.example`, sem valores
  reais ou credenciais.
- Se um arquivo de ambiente já estiver versionado, não acrescente nenhum valor
  secreto e trate sua remoção ou substituição como uma mudança de segurança
  deliberada.
- Não registre tokens, credenciais ou conteúdo sensível em logs.
- Não implemente autenticação enquanto ela estiver fora do escopo vigente.

## Mapas

`Ver lugares próximos` deve abrir:

`https://www.google.com/maps/search/?api=1&query=[query encoded]`

Use `expo-linking`, codifique a consulta e não peça localização dentro do app. Não
adicione Google Places API, SDK nativo de mapas ou API key sem mudança explícita de
escopo.

## UX e acessibilidade

- Priorize Android e valide legibilidade em telas pequenas.
- Use áreas de toque confortáveis, contraste adequado e textos claros.
- Botões principais devem ser grandes e estados desabilitados devem ser visíveis.
- Respeite safe areas, teclado e rolagem.
- Animações devem ser breves, funcionais e não bloquear a interação além do
  necessário.
- Mantenha o tom divertido sem sacrificar clareza.

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
- Inclua estados de erro e vazio quando a mudança envolver dados.
- Atualize tipos, fallback, migrations e documentação quando a mudança exigir.
- Não faça operações remotas, publique ou envie alterações sem autorização.

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
interface ou comportamento nativo. Não corrija automaticamente avisos preexistentes
ou não relacionados; registre-os e mantenha o escopo.

Uma entrega está pronta quando:

- O TypeScript não apresenta erros introduzidos pela mudança.
- O app abre e o fluxo alterado funciona no Android/Expo.
- Loading, vazio, offline e erro foram considerados quando aplicáveis.
- Nenhum segredo foi adicionado ao repositório ou ao bundle.
- Não houve implementação acidental de itens pós-MVP.
- A documentação foi atualizada se alguma decisão mudou.

## Manutenção deste guia

Revise e atualize este arquivo quando ocorrer qualquer uma destas situações:

- Mudança no escopo do MVP ou início de uma fase pós-MVP.
- Inclusão ou remoção de plataforma, backend ou serviço externo.
- Atualização do Expo SDK, React Native, Node ou ferramenta de build.
- Mudança na arquitetura de pastas, estratégia de dados ou fluxo de deploy.
- Nova regra de segurança, autenticação, monetização ou privacidade.
- Uma decisão explícita tornar qualquer instrução deste arquivo obsoleta.

Ao atualizar, mantenha as seções de escopo atual e pós-MVP coerentes. Remova regras
obsoletas em vez de acumular exceções contraditórias. O histórico detalhado pertence
ao Git; este arquivo deve descrever a forma correta de trabalhar no presente.
