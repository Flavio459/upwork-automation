# Checklist de Revisão de Localização

> [!IMPORTANT]
> Este gate valida a versão localizada que sai do `Proposal_and_Localization_Pack`.
> A fonte de verdade continua sendo o artefato mestre em `pt-BR`.
> O idioma interno de trabalho continua sendo `pt-BR`; o idioma do cliente só precisa ser resolvido no momento do envio externo.

## Identificação

| Campo | Valor |
| --- | --- |
| `lead_id` |  |
| `client_name` |  |
| `client_language` | resolvido no envio |
| `localized_artifact_status` | `Under Review` / `Approved for Send` |

## Fonte De Verdade

- artefato mestre em `pt-BR`
- versão localizada derivada do mestre quando o cliente estiver identificado
- glossário do projeto
- dados de pricing e prazo vindos do workspace operacional

## Gate Obrigatório

- [ ] artefato mestre em `pt-BR` existe
- [ ] versão localizada preserva o escopo
- [ ] tom comercial preservado
- [ ] linguagem natural para o idioma do cliente definido no envio
- [ ] termos do glossário respeitados
- [ ] CTA preservado
- [ ] números, prazo e pricing conferidos
- [ ] não há tradução literal ruim
- [ ] pronto para envio
- [ ] `proposal_status` e `localized_artifact_status` batem com o estado real

## Revisão

- revisor:
- data:
- observações:
- decisão final:

## Regra Operacional

- enquanto o cliente não estiver identificado, o artefato mestre permanece em `pt-BR`
- quando a oportunidade for confirmada para envio, o conteúdo é localizado para o idioma do cliente
- `client_language` desconhecido não bloqueia o desenvolvimento interno, apenas o envio externo
