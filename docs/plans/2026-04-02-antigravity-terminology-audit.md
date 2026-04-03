# Task

Concluir a auditoria de nomenclatura do repositório, removendo os ultimos usos internos de `job/jobs` em favor de `opportunity/opportunities`, sem alterar contratos externos do Upwork.

> [!IMPORTANT]
> Este plano e de cleanup documental e consistencia de linguagem. Ele nao faz parte do caminho critico de evidencia end-to-end da aplicacao.

# Objective

O repositório ja passou por uma limpeza grande de vocabulário. Ainda restam alguns residuos em documentação histórica e exemplos. O objetivo desta tarefa é fechar essa padronização para que a superfície documental e os exemplos internos usem uma linguagem consistente com o sistema atual.

# Scope

- Corrigir residuos internos de `job/jobs` ainda presentes em docs e exemplos.
- Corrigir nomes de variaveis e linguagem de exemplo quando forem apenas material documental.
- Preservar referencias que sejam contrato externo do Upwork ou dado historico literal.

- Nao reabrir a arquitetura do projeto.
- Nao refatorar runtime ativo sem necessidade.
- Nao tocar em codigo fora do escopo textual/documental, exceto se um exemplo local claramente precisar de consistencia minima.

# Relevant Files

- `README.md`
  Contexto de superficie do projeto.
- `docs/02_Guides/Roadmap.md`
  Roadmap operacional e linguagem canonica atual.
- `docs/01_Architecture/User_Guide.md`
  Ainda tem pelo menos um residuo interno: `const jobs = await this.extractJobsWithCaptchaHandling();`
- `docs/01_Architecture/Technical_Paper.md`
  Ainda tem residuos textuais como `accepted jobs vs. rejected` e `job requirements`.
- `docs/04_Archive/Worked_Example_Cinematic_Adjacency.md`
  Contem `job post` em contexto historico; avaliar se deve virar `opportunity post` mantendo URLs intactas.
- `legacy/gmail-flow/services/upwork-scraper.ts`
  Exemplo claro de contrato externo que deve ser preservado: seletor `job-description-text`.
- `legacy/gmail-flow/services/email-parser.ts`
  Exemplo claro de contrato externo que deve ser preservado: regex para URL `/jobs/`.

# Current Findings

- `docs/01_Architecture/User_Guide.md:134`
  `const jobs = await this.extractJobsWithCaptchaHandling();`
- `docs/01_Architecture/Technical_Paper.md:298`
  `Average score of accepted jobs vs. rejected`
- `docs/01_Architecture/Technical_Paper.md:396`
  `match to job requirements`
- `docs/04_Archive/Worked_Example_Cinematic_Adjacency.md:22`
  `nao identificado no job post`

Itens que devem ficar como estao por serem contrato externo:

- URLs `https://www.upwork.com/jobs/...`
- regex para `/jobs/`
- seletor `[data-test="job-description-text"]`

# Constraints

- Preserve contratos externos do Upwork.
- Nao renomeie seletores, URLs, atributos `data-*` ou chaves que reflitam a superficie do site.
- Nao reverta mudancas locais existentes.
- Mantenha a linguagem documental em `pt-BR` quando o arquivo estiver nessa lingua.
- Prefira mudancas pequenas, defensaveis e consistentes com a limpeza ja feita.

# Acceptance Criteria

- Nenhum residuo interno relevante de `job/jobs` permanece nos arquivos-alvo, exceto contratos externos do Upwork.
- Os exemplos e docs historicos continuam semanticamente corretos apos a troca.
- O resultado deixa claro o que foi preservado por contrato externo.

# Validation

- Rodar:
  - `rg -n "\\bjob\\b|\\bjobs\\b|jobId|job_id|scoreJob|analyzeJob\\(|collectJobs|JobsList|selectedJob|Job[A-Z]\\w*|jobHistory|jobsPosted" docs legacy README.md research\\README.md`
- Se houver alteracao em TypeScript fora de docs, rodar:
  - `npm run typecheck`
- Resumir os matches restantes e justificar os que forem preservados.

# Output Format

- Resumo curto do que foi ajustado.
- Lista de arquivos alterados.
- Lista de residuos preservados por serem contrato externo.
- Riscos ou pendencias restantes, se houver.
