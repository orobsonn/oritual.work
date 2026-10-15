---
name: criando-issue
description: Escreve uma issue de tarefa no padrão da Expert (resumo com o porquê, critérios de aceite testáveis, escopo, domínio sensível e tamanho pequeno) a partir de um pedido solto, mostra o texto e só publica com um "sim". Use quando a pessoa pedir "cria uma issue", "registra essa tarefa", "abre uma issue para isso" ou quando um trabalho for grande demais para uma entrega só. Para sugestão de melhoria da metodologia, use `colhendo-aprendizados`.
---

# Criando uma issue de tarefa

A issue é o **contrato da entrega**: quem pegar a tarefa (pessoa ou Claude) deve conseguir
resolver sem perguntar nada, e os critérios de aceite viram os testes (teste vem primeiro).

Repositório: o do projeto atual (`gh repo view --json nameWithOwner -q .nameWithOwner`).

## Procedimento

1. **Entender o pedido.** Se faltar algo que muda o resultado (quem usa, o que é "pronto"), pergunte
   uma vez, em uma mensagem. O que o código ou o git respondem, descubra sozinho.

2. **Procurar duplicada:** `gh issue list --state open --search "<palavras-chave>"`. Achou parecida:
   mostre o link e pergunte se comenta nela em vez de criar outra.

3. **Montar o texto** com estes títulos (o `tarefa.yml`, ao lado desta skill, usa os mesmos; para quem abre pelo GitHub, ele vai em `.github/ISSUE_TEMPLATE/` do projeto):

   ```markdown
   ### Resumo e por quê
   <o que é e por que importa, em 1 a 3 linhas>

   ### Critérios de aceite
   - [ ] #ac-1: dado <situação>, quando <ação>, então <resultado com valor concreto>
   - [ ] #ac-2: ...

   ### Escopo
   Pode: <arquivos ou áreas>
   Não tocar: <o que fica de fora>

   ### Mexe em área sensível?
   <não | segredos | dado pessoal | pagamento | login e permissões | banco (migration)>

   ### Tamanho
   <S (1 a 2 arquivos) | M | L>
   ```

   Regras de qualidade:
   - Critério **observável e com valor concreto** ("mostra `id 3`", não "mostra o id certo"). Cada
     um tem que virar um teste; se não dá para testar, reescreva.
   - **Pequena:** uma issue é uma coisa que entra e volta sozinha (até ~400 linhas). Se dá para
     nomear duas entregas separadas, são duas issues; cite a ordem no resumo.
   - Área sensível diferente de "não": diga no escopo que a mudança precisa de cuidado extra e
     não deve ser feita sem a pessoa acompanhar.
   - Sem segredo, dado pessoal, nome de cliente ou trecho de dado real. Descreva o caso de forma geral.

4. **Mostrar o texto inteiro** (título, corpo e labels) e **só publicar com um "sim" explícito**: a
   issue fica no repositório e o histórico de edição guarda o texto mesmo depois de apagado.

5. **Publicar:**
   ```bash
   gh issue create --title "<tipo>: <resumo em uma linha>" --body-file <arquivo-temporario>
   ```
   Título no mesmo estilo do commit, em português (`fix: id da unidade aparece como "?" no test_connection`).
   Sem inventar labels: use só as que existem (`gh label list`).

6. **Relatório em uma linha:** o link da issue. Se a pessoa pedir para resolver agora, siga com
   `commitando` e `abrindo-pr`, e o PR leva `Closes #N`.

## Nunca

- Publicar sem mostrar o texto e receber o "sim".
- Critério de aceite que não dá para testar.
- Issue com mais de uma entrega independente.
