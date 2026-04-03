# Espaço de Ideias

> [!IMPORTANT]
> Este arquivo é espaço de brainstorming e histórico de ideação. Ele não define o fluxo operacional ativo do vault.
> Use-o para registrar hipóteses, decisões antigas e contexto exploratório.

Este é o espaço oficial para discutir ideias antes de virarem implementação.

## Como usar

Escreva sua ideia de forma curta, mesmo que ainda esteja crua. O objetivo aqui é separar:

- problema real
- hipótese
- alternativa(s)
- riscos
- decisão

## Template de Discussão

### 1. Ideia

Descreva a ideia em 1 a 3 frases.

### 2. Por que isso existe?

Qual dor, necessidade ou oportunidade estamos tentando resolver?

### 3. Contexto atual

O que já existe no código, na documentação ou no fluxo?

### 4. Restrições

Liste limites conhecidos:

- tempo
- escopo
- risco técnico
- risco operacional
- segurança / privacidade

### 5. Opções

Liste 2 a 3 caminhos possíveis.

### 6. Critério de sucesso

Como vamos saber que essa ideia vale a pena?

### 7. Decisão

Registre a decisão quando houver consenso:

- aprovado
- adiado
- rejeitado

### 8. Próximo passo

Se a ideia for aprovada, qual é o menor passo seguinte?

## Registro

### Ideias em discussão

- Pesquisa de campo no Upwork para identificar categorias de serviço com maior demanda, maior valor agregado e melhor alinhamento com nossa capacidade de produção.
- Estimativa de custo real para entregar cada tipo de serviço antes de escolher a oferta de entrada.
- Seleção de uma oferta pela melhor combinação entre lucratividade, capacidade operacional e facilidade de execução no nosso ambiente.
- Transformação de problemas reais de clientes em cases próprios, mesmo sem vender inicialmente, para montar um showroom/produto demonstrável.
- Ajuste do perfil no Upwork para a oferta escolhida.
- Estruturação do sistema operacional para resolver esse tipo de solicitação a partir da entrada do cliente.
- Medição de demanda baseada em observação de campo no Upwork e, quando possível, em dados públicos oficiais da própria plataforma.
- Definição de valor agregado com base em:
  - menor custo de tokens
  - maior ticket pago
  - menor concorrência
  - menor complexidade inicial
  - geração rápida de caixa
  - possibilidade de escalar depois
- Restrição inegociável: a IA precisa ser capaz de executar o trabalho ponta a ponta sem que o custo de execução ultrapasse o valor negociado.
- Os cases poderão ser reais ou híbridos, dependendo do material disponível.
- Clarificação conceitual: o que está sendo observado no Perplexity AI não é scraping.
  - Nome mais correto: `Browser Automation` / `Web Automation`
  - Versão mais moderna: `Agentic Browsing`
  - Categoria acima: `Web Agent` / `Autonomous Browser Agent`
  - Implicação estratégica: a IA não só coleta dados, ela decide, navega e executa ações no navegador como um operador humano
- Hipótese de produto ligada a essa clarificação:
  - usar automação de navegador para executar tarefas reais no Upwork ou em fluxos adjacentes
  - tratar o navegador como interface operacional, não como fonte de dados
  - avaliar se o valor está em execução assistida por agente, e não em extração de conteúdo
- Proposta de mudança de abordagem: parar de depender de scraping como caminho principal e migrar para `Browser Automation` / `Web Automation`.
  - Motivo: scraping tende a quebrar com frequência em sites dinâmicos, login, anti-bot e mudanças de layout
  - Vantagem: automação de navegador opera mais perto do comportamento humano e pode executar fluxos completos
  - Versão mais ambiciosa: `Agentic Browsing`, onde a IA decide o próximo passo e executa no navegador
  - Risco: maior custo operacional, maior complexidade de controle e maior necessidade de observabilidade
  - Tese: se o objetivo é entregar trabalho real, a interface correta pode ser o navegador, não o HTML
- Pergunta de direção para a discussão:
- `Devemos otimizar primeiro para um fluxo específico no Upwork, validar tração e ROI, e só depois abstrair para uma plataforma reutilizável de automação de navegador?`

> [!NOTE]
> As discussões abaixo preservam a linguagem histórica do projeto. O fluxo operacional atual usa `offer`, `fit`, `feasibility`, `pricing` e `localization` como vocabulário canônico.

### Discussão: Browser Automation como caminho principal

#### 1. Ideia

Parar de depender de scraping como abordagem principal e usar `Browser Automation` / `Web Automation`, com evolução posterior para `Agentic Browsing` quando fizer sentido.

#### 2. Por que isso existe?

Estamos tendo dificuldade com scraping porque ele quebra com frequência em sites dinâmicos, login, anti-bot e mudanças de layout.
O navegador já é a interface real do trabalho no Upwork e em muitos fluxos de cliente.
Se a meta é executar trabalho de ponta a ponta, faz mais sentido operar o navegador como humano do que tentar depender do HTML.

#### 3. Contexto atual

O código já usa Playwright e uma sessão autenticada:

- `scripts/research.ts`
- `services/upwork-feed-collector.ts`
- `services/upwork-research-agent.ts`

Hoje o sistema está mais próximo de um coletor guiado por navegador do que de uma automação de coleta pura.
Existe base para navegação autenticada, detecção de challenge e leitura de sinais do feed.

#### 4. Restrições

- Tempo: a solução precisa continuar viável para validação rápida
- Escopo: não abrir uma plataforma genérica cedo demais
- Risco técnico: automação de navegador é mais lenta e mais difícil de depurar do que scraping simples
- Risco operacional: anti-bot, challenge e mudanças de fluxo continuam existindo
- Segurança / privacidade: sessões autenticadas e ações em sites de terceiros exigem controle rígido de credenciais e logs

#### 5. Opções

1. Continuar focando em scraping
   - Menor complexidade inicial
   - Maior fragilidade em sites dinâmicos

2. Usar `Browser Automation` no fluxo específico do Upwork
   - Melhor equilíbrio entre pragmatismo e validação
   - Permite medir valor real antes de generalizar

3. Construir uma base genérica de `Agentic Browsing`
   - Mais reutilizável no longo prazo
   - Maior custo, maior risco e mais abstração antes da validação

#### 6. Critério de sucesso

- O fluxo consegue operar com confiabilidade suficiente no Upwork
- O sistema entrega sinais úteis ou ações úteis sem depender de parsing frágil
- O trabalho do nicho pode ser executado de ponta a ponta com IA em pelo menos 90% do fluxo
- O custo de execução continua abaixo do valor negociado
- O tempo de validação é curto o bastante para justificar a abordagem
- O primeiro caso de uso gera aprendizado ou receita antes da generalização

#### 7. Decisão

- Status: aprovado para validação
- Direção escolhida: começar pelo fluxo específico do Upwork e só depois abstrair
- Primeiro fluxo vertical: pesquisa, classificação e qualificação de oportunidades no Upwork usando automação de navegador
- Motivo: esse fluxo já existe no código, é mensurável e permite validar valor antes de construir uma plataforma genérica

#### 8. Próximo passo

Instrumentar o fluxo do Upwork com métricas de execução e confiabilidade:

- taxa de sucesso por execução
- tempo médio por tarefa
- taxa de falha por challenge / mudança de layout
- custo estimado por execução
- valor potencial gerado por oportunidade qualificada

Depois disso, revisar se vale abstrair para uma camada reutilizável de `agentic browsing`.

### Decisões registradas

- Primeira decisão: usar o Upwork como fluxo vertical inicial para validar browser automation antes de generalizar.
  - Alternativas consideradas: continuar em scraping; criar uma plataforma genérica de agentic browsing
  - Motivo da escolha: menor risco, validação mais rápida e melhor leitura de ROI

### Discussão: Resultado da primeira rodada de pesquisa de campo

#### 1. Ideia

Usar a primeira rodada de navegação autenticada no Upwork para selecionar um nicho de entrada com base em demanda observada e unit economics reais.

#### 2. Por que isso existe?

A discussão sobre browser automation só faz sentido se ela levar a um nicho viável economicamente. Sem isso, a automação vira apenas um exercício técnico.

#### 3. Contexto atual

A primeira coleta real terminou com:

- `Candidates evaluated: 5`
- `Pursue: 0`
- `Watch: 0`
- `Reject: 5`

Os sinais mais fortes foram `automation`, `python` e `chatbot`, mas todos ficaram com margem negativa com o custo interno assumido.

#### 4. Restrições

- O custo interno por hora ainda está alto para tickets pequenos
- Os cards observados no feed têm valores baixos demais para sustentar entrega sob medida
- A seleção precisa continuar baseada em dados reais do feed autenticado, não em hipótese
- Um nicho só entra em disputa se a IA conseguir executar pelo menos 90% do trabalho ponta a ponta com o stack atual ou com automação viável

#### 5. Opções

1. Forçar a escolha de um nicho mesmo com margem negativa
   - Rápido, mas financeiramente incoerente

2. Recalibrar o modelo econômico e repetir a coleta
   - Permite testar se o problema é a oferta, o preço ou o custo interno

3. Mudar a tese para uma oferta productized de maior ticket
   - Aumenta a chance de fechar conta com menos dependência de oportunidades pequenas

#### 6. Critério de sucesso

- Pelo menos um nicho com margem positiva e decisão `Pursue`
- Ticket observado compatível com o custo de entrega
- Sinal de demanda suficientemente recorrente para justificar o foco
- Capacidade de executar o trabalho com IA em pelo menos 90% do fluxo ponta a ponta

#### 7. Decisão

- Status: adiado
- Motivo: a primeira rodada validou demanda, mas não validou economics
- Conclusão: ainda não existe nicho vencedor com os critérios atuais

#### 8. Próximo passo

Recalibrar a oferta e o modelo de custo antes da próxima rodada:

- revisar o custo interno assumido
- testar uma oferta mais productized
- repetir a coleta com o novo critério
- só então escolher o nicho de entrada

### Decisões registradas

- Segunda decisão: adiar a seleção de nicho porque a rodada atual mostrou demanda, mas não mostrou margem.
  - Alternativas consideradas: escolher mesmo assim; mudar para uma oferta productized; recalibrar custos e repetir
  - Motivo da escolha: não faz sentido escalar um nicho com unit economics negativos
- Terceira decisão: exigir viabilidade de automação com IA em pelo menos 90% do fluxo antes de considerar um nicho como válido.
  - Alternativas consideradas: validar apenas demanda; validar apenas margem; validar demanda + margem + automação
  - Motivo da escolha: demanda sozinha não basta se o trabalho não pode ser executado de ponta a ponta pelo sistema com o nível de automação esperado
- Quarta decisão: adotar `python` como foco provisório de execução enquanto a validação continua.
  - Alternativas consideradas: manter a busca em aberto; escolher `automation`; escolher `chatbot`; esperar mais dados
  - Motivo da escolha: na rodada mais recente, `python` foi o único candidato que passou simultaneamente pelo gate de IA e pelo gate econômico em modo productized, então é o melhor ponto de partida para aprofundar a tese sem fingir que já existe um vencedor definitivo
  - Status: aprovado para foco provisório
  - Próximo passo: repetir e refinar a validação específica de `python` até que o sinal deixe de ser apenas `WATCH` e possa sustentar um `PURSUE`

### Sprint de validação: `python`

#### Objetivo

Validar se `python` sustenta uma oferta productized com:

- viabilidade de automação com IA em pelo menos 90% do fluxo
- margem positiva
- repetibilidade suficiente para justificar foco comercial

#### Hipótese de trabalho

- O melhor recorte inicial de `python` é o de automações, integrações e tarefas operacionais repetitivas que podem ser entregues quase integralmente com IA.
- A demanda observada no mercado é suficiente para testar uma oferta focada, mas ainda precisa de amostra maior antes de virar decisão final.

#### Gates de saída

- `PURSUE` se a próxima rodada mantiver:
  - AI Exec >= 90%
  - margem positiva
  - ticket compatível com a entrega productized
  - volume suficiente para não depender de uma única oportunidade
- `WATCH` se o sinal continuar bom, mas ainda faltar consistência de volume ou confiança estatística
- `REJECT` se a nova amostra enfraquecer a tese ou mostrar que a oferta não fecha conta na prática

#### Entregáveis esperados

- nova amostra focada em `python`
- shortlist revisado com o mesmo critério econômico
- conclusão objetiva sobre avanço, espera ou descarte

#### Observação da rodada de refinamento

- O floor de budget foi normalizado para evitar faixas invertidas.
- Após a correção, `python` permaneceu como `REJECT`, agora com faixa `50-50` e valor negociado estimado de `62.5`.
- Conclusão provisória: o problema não era só a leitura do ticket; a oferta ainda não fecha economicamente com a amostra atual.

#### Leitura do documento enviado

- O material histórico da Fase 01 reforça a necessidade de automação robusta de login, busca e geração de relatório.
- Ele é coerente com a base técnica do projeto, mas ainda opera num nível operacional, não num nível de tese de negócio.
- A interpretação prática é: a infraestrutura já passou da fase de script simples; agora o critério de decisão precisa ser productized economics + executabilidade com IA.
- Portanto, o documento apoia o caminho atual, mas não muda o veredito econômico do recorte `python`.

#### Leitura do relatório macro

- O relatório enviado valida a direção macro: IA está ampliando o mercado freelance, não eliminando a demanda.
- O texto também reforça que o valor está migrando para integração de sistemas, orquestração de fluxos, multi-agentes, dados, compliance e consultoria estratégica.
- Isso enfraquece a leitura de `python` como nicho por si só. `Python` deve ser tratado como meio de entrega, não como proposta comercial principal.
- O ajuste de tese mais coerente é mover o foco para uma oferta productized de `AI integration / orchestration`, com `python` como stack de implementação.
- Em termos de posicionamento, o próximo filtro não é "oportunidades Python", mas "oportunidades que pagam por integração, automação de alto risco, orquestração ou descoberta de valor".

#### Atualização da tese após rerodagem

- A nova rodagem já validou um candidato `PURSUE` em `audit`, dentro de `Consulting & Strategy / AI Advisory`.
- `workflow automation` e `rag` aparecem como `WATCH`, o que confirma a trilha de oferta mais cara e mais arquitetural.
- `automation` genérico continua sendo ruído relativo, porque a demanda existe mas o fit com IA ponta a ponta não sustenta o corte atual.
- A direção prática passa a ser: vender auditoria, discovery e arquitetura de IA como pacote productized, usando `python` apenas como stack de implementação.
- Próxima ação lógica: refinar a oferta em torno de `AI advisory`, `workflow automation` e `RAG orchestration`, com `audit` como entrada principal do funil.

#### Oferta productized inicial

**Nome da oferta**

`AI Systems Audit Sprint`

**Promessa**

Mapear onde a operação do cliente pode ganhar produtividade, reduzir risco e acelerar entrega com IA, e transformar isso em um plano executável de automação e arquitetura.

**Quem compra**

- times pequenos com processo manual demais
- founders e operadores que já usam ferramentas de IA, mas não têm arquitetura
- empresas com CRM, automações, documentação e backoffice fragmentados

**O que entrega**

- diagnóstico do fluxo atual
- mapa de oportunidades de automação
- priorização por impacto, esforço e risco
- proposta de arquitetura recomendada
- roadmap de implementação em fases
- estimativa de esforço e faixa de investimento

**O que não entrega**

- implementação completa
- manutenção contínua
- automação genérica sem contexto de negócio
- soluções de baixo ticket que não pagam a complexidade da arquitetura

**Formato**

- discovery inicial
- audit técnico e operacional
- proposta de roadmap
- opcional: fase 2 de implementação

**Preço inicial**

- Sprint de audit: `US$ 5,000`
- Discovery ampliado com arquitetura e roadmap: `US$ 7,500`
- Implementação fase 2: orçamento separado, depois do audit

**Hipótese comercial**

O cliente não compra “python” nem “automação”. Ele compra clareza, redução de risco e uma rota concreta para transformar trabalho manual em fluxo assistido por IA.

**Próximo teste**

- validar se o mercado responde melhor ao nome `AI Systems Audit Sprint` ou a uma variação mais consultiva
- testar a proposta contra oportunidades que mencionam `audit`, `strategy`, `architecture`, `orchestration`, `workflow automation` e `RAG`
- confirmar se o ticket de entrada sustenta aquisição e entrega sem depender de volume alto

#### Decisão formal de incorporação

- Status: `INCORPORADA COMO TESE OPERACIONAL`
- Data: `2026-04-01`
- Leitura: a oferta `AI Systems Audit Sprint` já é madura o suficiente para orientar pesquisa, copy, qualificação e proposta.
- Justificativa: a tese ficou consistente entre mercado, pricing, stack e posicionamento; o stack técnico passou a servir a oferta, e não o inverso.
- Limite: a decisão ainda não é doutrina final de mercado. Ela permanece como hipótese forte até provar repetibilidade em leads reais.
- Critério de revisão: revisar o status após 3 a 5 execuções reais com sinais consistentes de demanda, margem e fit.
