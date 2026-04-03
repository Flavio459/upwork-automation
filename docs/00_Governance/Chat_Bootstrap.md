# Chat Bootstrap

> [!IMPORTANT]
> Um chat novo nao herda as regras desta conversa por padrao.
> Ele so segue o sistema se for iniciado com este bootstrap e com a ordem canônica de leitura.

## O Problema Que Este Documento Resolve

Quando uma nova conversa começa, o modelo ainda nao sabe:

- qual e a oferta principal
- quais documentos sao fonte de verdade
- quais arquivos sao legado
- qual e a ordem correta de leitura
- quais padroes de operacao devem ser preservados

Este documento fecha essa lacuna.

## Como O Motor Deve Entender

O motor nao "descobre" sozinho as regras do vault.
Ele precisa ser orientado a ler os documentos certos, na ordem certa, antes de tomar qualquer decisao operacional.

Se a conversa nova nao tiver esse contexto, ela deve ser tratada como sem bootstrap e a primeira acao e carregar este arquivo.

## Ordem De Leitura Para Um Chat Novo

1. [[docs/00_Governance/Reference_Map|Mapa de Referências]]
2. [[docs/00_Governance/Constitution|Constituição Global]]
3. [[docs/Home|Home]]
4. [[docs/02_Guides/Development_Handoff_Log|Development Handoff Log]]
5. [[docs/02_Guides/Roadmap|Roadmap Operacional]]
6. [[docs/02_Guides/Delivery_Methodology|Delivery Methodology]]
7. [[research/README|Research Canonical Flow]]
8. [[docs/05_Ideation/AI_Systems_Audit_Sprint|AI Systems Audit Sprint]]
9. [[docs/05_Ideation/AI_Qualification_Framework|AI Qualification Framework]]
10. Templates operacionais em [[docs/03_Templates/Opportunity_Intake_and_Fit|Templates operacionais]]

## Regras Que Um Chat Novo Deve Respeitar

- operar em `pt-BR` internamente
- localizar artefatos externos para a lingua do cliente
- tratar `AI Systems Audit Sprint` como oferta principal
- tratar referências a outros projetos como contexto histórico ou benchmark, não como escopo ativo
- ler `docs/02_Guides/Development_Handoff_Log.md` antes de assumir onde o projeto parou
- nao enviar proposta sem qualificacao, viabilidade, pricing e revisao de localizacao
- nao confundir documento legado com fonte de verdade
- seguir o mapa de referencias antes de abrir arquivos historicos

## Prompt Canonico Para Iniciar Um Chat Novo

Use este texto quando quiser abrir uma conversa nova sem perder o padrao:

```text
Leia primeiro docs/00_Governance/Chat_Bootstrap.md, depois siga docs/00_Governance/Reference_Map.md.
Depois disso, leia docs/02_Guides/Development_Handoff_Log.md para recuperar o ponto exato da execucao.
Use docs/Home.md como painel principal e siga a ordem canônica do vault.
Nao assuma contexto anterior. Se algo estiver ambíguo, consulte os documentos canônicos antes de responder.
```

## Relacao Com O Vault

Este arquivo nao substitui a Home, o Roadmap ou a Constitution.
Ele existe para garantir que um novo chat entre no sistema do jeito certo.

## Regra Final

Se houver conflito entre um chat anterior e este bootstrap, este bootstrap vence.
