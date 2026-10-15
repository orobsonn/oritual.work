---
name: organizando-contexto
description: Cria ou audita o conhecimento do projeto no modelo da Expert (CLAUDE.md raiz curto com tabela de pastas, CLAUDE.md por pasta, CONTEXT.md, memória em .claude/memory/ e docs/). Use depois de instalar o harness, quando o início de sessão avisar que o projeto não foi mapeado ou que o mapeamento está velho, quando o CLAUDE.md passar de ~200 linhas, ou quando a pessoa pedir "organiza o contexto".
---

# Organizando o contexto

Avise no início: "Vou organizar o conhecimento do projeto. Guardo uma cópia de tudo antes e,
no fim, mostro o que foi para onde."

## Onde cada coisa mora

| Arquivo | O que guarda |
| --- | --- |
| `CLAUDE.md` (raiz) | O que é o projeto, as regras, comandos e a tabela "pasta → o que mora lá". Até ~80 linhas |
| `<pasta>/CLAUDE.md` | O que só vale naquela pasta |
| `CONTEXT.md` (raiz) | Glossário do negócio: os termos que o código e as pessoas usam |
| `.claude/memory/MEMORY.md` | Índice da memória: uma linha por padrão ou armadilha do projeto |
| `.claude/memory/<nome>.md` | Um padrão ou armadilha, com o porquê e como aplicar |
| `docs/` | Runbooks (`docs/runbooks/`), incidentes (`docs/incidentes/`), decisões (`docs/decisoes/`) |

**Onde isso é verdade?** É a pergunta que decide o destino:

| Vale para | Destino |
| --- | --- |
| Uma pasta só | `CLAUDE.md` daquela pasta + uma linha na tabela da raiz |
| O projeto inteiro, em várias pastas | arquivo em `.claude/memory/` + linha no `MEMORY.md` |
| Todo projeto da empresa | sugestão no repositório da metodologia (skill `colhendo-aprendizados`) |
| Só esta tarefa | lugar nenhum; fica no git |

**Teste de durabilidade:** só guarde o que é **reutilizável** (vai ajudar numa tarefa futura) e
**não óbvio** (não dá para tirar do código, do git ou de um CLAUDE.md que já existe).
Escolha sempre o destino mais estreito que ainda cobre o conhecimento.

## Procedimento

1. **Guardar cópia.** Copie todo `CLAUDE.md`, `AGENTS.md` e `CONTEXT.md` existentes para
   `.claude/backup-<AAAA-MM-DD>/contexto/`, mantendo o caminho de cada um.

2. **Mapear as pastas principais.** Liste as pastas de código e de configuração que importam
   (não as geradas: `node_modules`, `dist`, `.wrangler`). Para cada uma, entenda o papel em uma frase.
   Isso orienta; não vira inventário de arquivos.

3. **Auditar o que existe** (`CLAUDE.md`, `AGENTS.md`, outros arquivos de instrução). Classifique
   **cada trecho**:

   | Tipo de trecho | O que fazer |
   | --- | --- |
   | Regra válida e específica do projeto | Fica, no lugar certo (raiz, pasta, memória ou rule do projeto) |
   | Regra que contradiz a política da empresa (ex.: "push direto na main", "merge com --admin") | Substituir pela política e avisar a pessoa do que mudou e por quê |
   | Histórico, diário de incidente, runbook, decisão | Mover para `docs/` |
   | Desatualizado ou duplicado (inclusive o que as rules do harness já dizem) | Remover e registrar no relatório |
   | Dado pessoal ou identificador sensível (telefone, e-mail, caminho da máquina de alguém, token) | Remover. Se for segredo, avisar que precisa ser trocado |

   Confira com o código antes de manter uma regra: se o código não segue, pergunte.
   `AGENTS.md` com o mesmo conteúdo do `CLAUDE.md`: mantenha só um e faça o outro apontar para ele.

4. **Escrever o `CLAUDE.md` raiz** a partir do `CLAUDE.base.md` do harness: o que é o projeto,
   as regras da empresa, regras do projeto, comando de teste e a tabela
   `| Pasta | O que mora lá | Veja |`. Até ~80 linhas. Detalhe vai para a pasta ou para `docs/`.

5. **CLAUDE.md por pasta.** Para cada pasta principal com regra própria, crie `<pasta>/CLAUDE.md`
   curto (convenções e armadilhas daquela pasta) e a linha correspondente na tabela da raiz.
   Pasta sem regra própria não precisa de arquivo.

6. **`CONTEXT.md`.** Glossário em tabela `| Termo | Significado |`, com os termos do negócio que
   se repetem em tipos, rotas, tabelas e telas.
   - Diga o que o termo **é para o negócio**, nunca qual arquivo o implementa.
   - Só termos com significado próprio. Vocabulário genérico de programação não entra.
   - Dois nomes para a mesma coisa: escolha um e diga para que o outro aponta.
   - Já existe: só acrescente o que falta. Nunca reescreva definição existente.
   - Na dúvida sobre um termo, pergunte à pessoa.

7. **Memória do projeto.** `.claude/memory/MEMORY.md` com uma linha por arquivo:
   `- [nome](nome.md): resumo em uma frase`. Cada arquivo:
   ```markdown
   ---
   name: <nome curto>
   description: <uma linha: o que é e quando importa>
   ---

   **Por quê:** <a restrição, decisão ou falha que torna isso importante>

   **Como aplicar:** <a ação concreta: arquivo, função ou padrão a usar ou evitar>
   ```
   Um assunto por arquivo. Fontes: o que a auditoria classificou como "vale para o projeto todo" e
   o que a leitura do código mostrou (utilitário que já existe e seria reinventado, convenção que
   o código segue sem estar escrita, armadilha embutida). Nunca segredo ou dado pessoal.

8. **`docs/`.** Crie só as subpastas que tiverem conteúdo. Cada arquivo movido ganha um título e a
   data de quando aconteceu, se houver.

9. **Registrar.** Em `.claude/expert-governanca.json`, grave `mapeamento.organizadoEm` (data de hoje,
   `AAAA-MM-DD`). O início de sessão usa essa data para avisar quando o mapeamento envelheceu.

10. **Relatório.** Mostre a tabela `| Trecho | Era em | Foi para | Por quê |` e liste o que foi
    removido. Dê destaque às regras que contradiziam a política e aos dados sensíveis removidos.
    Entregue por `commitando` (`docs: organiza contexto do projeto`) e `abrindo-pr`.

## Nunca

- Inventar regra que o código não segue.
- Apagar conteúdo sem registrar no relatório.
- Deixar o `CLAUDE.md` raiz como diário de incidentes.
