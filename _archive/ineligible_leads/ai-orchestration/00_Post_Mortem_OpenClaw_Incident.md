# 🚨 Post-Mortem (Root Cause Analysis - RCA)
**Incidente:** Falha de Escopo Crítica - Projeto "OpenClaw AI Orchestration"
**Data do Incidente:** 05 de Abril de 2026
**Severidade:** CRÍTICA (Desperdício Total de Recursos de Engenharia)

## 1. Sumário Executivo do Erro
A operação gastou horas projetando, codificando e provisionando uma arquitetura de Backend corporativa (Gateway NodeJS, Barramento RabbitMQ, Limitador Redis) sob a Falsa Premissa de que o "OpenClaw" era uma plataforma SaaS B2B de orquestração em nuvem sofrendo gargalos de latência. 
A verdade (descoberta tardiamente) é que o OpenClaw é um **assistente pessoal Open-Source** rodando localmente na máquina física dos usuários. A necessidade real do cliente era um plugin/skill em TypeScript de US$ 150 para conectar seus scripts locais, e não uma infraestrutura DevOps.

## 2. A Ferramenta dos "5 Porquês" (The 5 Whys)

1.  **Por que gastamos horas construindo uma infraestrutura RabbitMQ/Redis descartável?**
    *   Porque estruturamos a "Fase 2 de Implementação" projetada para resolver problemas de tempo de tolerância (timeout) em chamadas pesadas de API.
2.  **Por que projetamos a solução para resolver timeouts de alta volumetria?**
    *   Porque avaliamos a vaga sob o conceito genérico de "AI Orchestration", assumindo que o cliente estava lidando com orquestração de alto fluxo B2B.
3.  **Por que assumimos que era uma arquitetura B2B?**
    *   Porque o intake inicial focou cegamente no título ("OpenClaw Integration"), e o termo "OpenClaw" soou (alucinação lógica do Agente) como um framework corporativo, prescindindo de investigação empírica.
4.  **Por que não investigamos (Due Diligence) o que o "OpenClaw" realmente era?**
    *   Porque avançamos a etapa de "Intake" para a "Tese Estratégica" sem possuir em mãos o **texto original completo** do cliente. Baseamo-nos apenas no título da vaga e em um resumo vago.
5.  **Por que não tínhamos o texto original e não buscamos a fonte?**
    *   *(CAUSA RAIZ)*: **Ausência de um Protocolo de Validação de Objeto de Estudo no Flow de Research.** O nosso processo carecia de uma instrução obrigatória que impedisse o Agente/Engenheiro de formular qualquer arquitetura antes de (A) ler a descrição canônica do cliente na íntegra e (B) varrer a internet para entender os domínios tecnológicos contidos no texto original.

## 3. Melhoria no Fluxo Operacional (Correções)

Para garantir que "*isso nunca, em hipótese alguma, aconteça novamente*", a partir de agora o processo `Research Handoff ➔ Intake` recebe um **Hard Lock (Trava de Segurança)**.

### Novo Protocolo de Segurança (Due Diligence Obrigatório):
1.  **Requirement Lock:** É terminantemente proibido redigir estratégias ou simular engenharias de código sem antes ancorar o Texto de Descrição do Cliente na Íntegra (Source of Truth) na seção de Intake. 
2.  **Keyword Investigation (Web Search Act):** Antes de iniciar qualquer desenho de solução (HLD/LLD), o Agente **TEM A OBRIGAÇÃO** de identificar nomes próprios (Nomes de Produtos, Softwares, "OpenClaw", "Auto-Repair Pro", etc.) e utilizar ferramentas de internet (`read_url_content` ou `search_web`) para indexar o que a ferramenta realmente faz na vida real.
3.  **Discovery Checkpoint:** O documento de Intake deve possuir um bloco validando que a tecnologia do cliente foi compreendida ("What is Product X?"). Nenhuma linha de código deve ser provisoriamente construída sem passar por este Checkpoint.

## 4. Conclusão Final e Assinatura
O erro foi crasso pois investiu-se engenharia pesada baseada em achismo e não em validação de requisitos primários. O fluxo será atualizado para garantir "Pesquisa de Requisitos de Domínio" antes do desenho técnico, barrando a Assimetria de Informação e desperdício de OPEX.

---
**Status:** Reconhecido, Auditado e Regras Atualizadas.
