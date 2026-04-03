# Worked Example - Cinematic Interactive Experience

> [!IMPORTANT]
> Este arquivo é um exemplo de referencia/historico. Nao e um resultado entregue pelo projeto atual nem uma diretriz operacional.
> Ele deve ser lido como prova de capacidade ou estudo arquitetural, nao como escopo ativo.

## Status

- `reference opportunity`
- `architecture study`
- `not a delivered client result`
- `offer_fit`: `Adjacency`
- `client_language`: `en-US`
- `internal_language`: `pt-BR`

## 1. Intake e Fit

| Campo | Valor |
| --- | --- |
| `lead_id` | `upwork-022039072035433923026` |
| `source_url` | `https://www.upwork.com/jobs/~022039072035433923026` |
| `client_name` | `não identificado na postagem da oportunidade` |
| `budget_range` | `US$ 1.200 - US$ 1.500 total` |
| `problem_summary` | experiência web interativa cinematográfica com vídeo, áudio, hotspots e narração lip-synced |
| `offer_fit` | `Adjacency` |
| `proposal_status` | `New` |
| `localized_artifact_status` | `Not Started` |

Leitura:

- problema real, com assets já existentes
- cliente quer reconstrução ou melhoria, não só design
- alta exigência de mídia e interatividade
- bom valor como prova técnica
- não é a melhor porta de entrada para `AI Systems Audit Sprint`

Decisão:

- seguir como `Adjacency`
- usar como caso de capability proof e oportunidade arquitetural

## 2. Viabilidade e Capacidade

### Stack e Competências Necessárias

- React ou Next.js
- player de vídeo customizado
- controlador de áudio por cena e evento
- sistema de hotspots
- animação de transições
- possível integração com avatar / lip-sync

### Recursos Necessários

| Recurso | Status | Observação |
| --- | --- | --- |
| máquina local de desenvolvimento | disponível | suficiente para build e QA inicial |
| hospedagem estática | necessária | AWS S3 + CloudFront |
| assets finais do cliente | pendente | vídeos, áudios, visuais em organização clara |
| guia técnico do cliente | pendente | citado na vaga |
| protótipo atual | pendente | citado na vaga |
| serviços de avatar / IA | opcional | ElevenLabs, D-ID, HeyGen se a fase exigir |

### Decisão de Viabilidade

- `feasibility_status`: `Go with Constraints`

Constraints:

- depende de acesso aos assets reais
- depende de definição clara de suporte a browsers e devices
- performance precisa ser tratada como requisito de produto, não detalhe de frontend

## 3. Escopo e Discovery

Objetivo recomendado para fase 1:

- validar arquitetura para `1` ou `2` mundos
- confirmar sincronização entre vídeo, áudio e hotspots
- definir base reutilizável para os demais mundos

Perguntas obrigatórias antes de estimar em definitivo:

1. O app precisa rodar em mobile ou somente desktop e tablet?
2. O protótipo atual já possui estrutura de cenas ou será refeito do zero?
3. O personagem narrador já existe como asset final ou ainda depende de pipeline de geração?
4. Há analytics, métricas de interação ou tracking esperado?
5. O deploy estático precisa conviver com CMS ou conteúdo externo?

## 4. Estimativa, Custos e Precificação

### Leitura Comercial

O budget publicado está apertado para um escopo cinematográfico completo, mas pode funcionar como fase de validação técnica se o recorte for realmente controlado.

### Estimativa Inicial

| Bloco | Horas |
| --- | --- |
| discovery técnico | 6 |
| arquitetura base | 8 |
| implementação fase 1 | 24 |
| QA e ajustes | 8 |
| documentação e handoff | 4 |
| buffer | 6 |
| total | 56 |

### Custos Externos

| Item | Estimativa | Observação |
| --- | --- | --- |
| hospedagem | baixo | S3 + CloudFront |
| serviços de IA | variável | só se o personagem ainda depender disso |
| compressão / pipeline de mídia | variável | depende do estado dos assets |

### Leitura de Pricing

- `target_price`: discovery + arquitetura curta ou fase técnica muito bem recortada
- `price_floor`: não aceitar fase aberta com budget que destrói margem
- modelo recomendado: fase fixa pequena com entregáveis explícitos

## 5. Proposta-Base em PT-BR

Hipótese comercial:

- não vender rebuild total sem discovery
- vender uma fase técnica curta para validar arquitetura, performance e sistema de cenas

Mensagem-mestra:

- o risco não está só em codar a interface
- o risco está em coordenar mídia, interações, transições e narrativa sem comprometer performance e escalabilidade

Oferta sugerida:

- `Architecture + Interactive Foundation Sprint`
- foco em `1-2 mundos`
- saída: base técnica reutilizável

## 6. Versão Localizada para o Cliente

### Cover Letter Curta em Inglês

```text
Hi,

This is not a standard website build. The technical risk is in coordinating scene state, video, audio, hotspots, transitions, and character-led narration without making the experience fragile or hard to extend.

I would structure phase 1 as a focused foundation sprint for 1-2 worlds: define the scene architecture, build the media and interaction layer, and validate a reusable system before scaling the rest of the experience.

That gives you a cleaner path for the remaining worlds and reduces rebuild risk later.
```

### Resposta Curta para a Pergunta Técnica

```text
I would structure it around a scene manifest plus a client-side media controller. Each world would define its assets, hotspots, audio cues, and transitions in data, while React handles rendering and state. Video, audio, and narration would be synchronized through a shared interaction layer so the app stays scalable across multiple pages instead of hard-coding behavior per scene.
```

`localized_artifact_status`: `Approved for Send`

## 7. Kickoff e Solicitações ao Cliente

Itens a solicitar:

- guia do desenvolvedor
- protótipo atual
- assets finais organizados por mundo
- browsers e devices suportados
- regra de aceite da fase 1
- expectativa sobre performance e loading

## 8. Registro de Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| assets pesados demais | alto | pipeline de compressão e preload seletivo |
| narrativa e lip-sync mal desacoplados | alto | tratar avatar como camada modular |
| hotspots acoplados à UI | médio | manifest por cena |
| escopo crescer para “jogo completo” | alto | change order formal |
| budget não sustentar refinamento visual | alto | recortar fase 1 por entregáveis técnicos |

## 9. Checkpoints de Delivery

1. manifesto de cenas e assets
2. media controller base
3. hotspots e eventos por cena
4. transição entre mundos
5. QA técnico da fase 1
6. handoff e decisão sobre escala

## 10. Expansão Comercial

Oportunidades de fase 2:

- expansão para mundos restantes
- otimização de performance
- camada de analytics de interação
- pipeline de conteúdo / assets
- evolução do personagem narrador

Ativos gerados:

- prova de capacidade em experiências web imersivas
- referência arquitetural reutilizável
- base para portfólio de projetos interativos
