---
name: abrindo-pr
description: Abre um pull request no padrão da Expert (título em Conventional Commits, corpo com Resumo, Como testar, Riscos e Closes #N), colhe os aprendizados da entrega e, com testes e checagens passando, faz o merge por squash sozinho e apaga a branch. Use quando a pessoa pedir "abre o PR", "entrega isso" ou "faz o merge".
---

# Abrindo o PR

## Procedimento

1. **Conferir a branch.**
   - Não estamos na `main`. Árvore limpa (se não, use `commitando` antes).
   - Branch atualizada: `git fetch origin && git log --oneline HEAD..origin/main`. Se a `main`
     andou, traga as mudanças com `git merge origin/main` (não reescreve o que já foi enviado),
     rode a suíte e envie de novo.
   - Branch enviada: `git push -u origin HEAD` (a trava roda os testes).
   - Já existe PR para a branch? `gh pr view --json url,state`. Se sim, só atualize e pule para o passo 4.

2. **Montar o texto.** Leia `git log --oneline origin/main..HEAD` e `git diff --stat origin/main...HEAD`.
   - Título no padrão do commit, em português: `feat(alunos): permite baixar certificado em PDF`.
   - Corpo:
     ```markdown
     ## Resumo
     - <o que muda, para quem usa, em 1 a 3 itens>

     ## Como testar
     - [ ] <passo que alguém consegue repetir>
     - [ ] Suíte inteira passando (`<comando de teste>`: N testes)

     ## Riscos
     - <o que pode quebrar, migration, mudança de configuração ou segredo novo; "Nenhum conhecido" se for o caso>

     Closes #N
     ```
   - PR acima de ~400 linhas alteradas: justifique no Resumo ou proponha dividir.
   - Sem linha de atribuição ao Claude ("Generated with Claude Code" ou `Co-Authored-By`) no corpo.

3. **Abrir.**
   ```bash
   gh pr create --base main --title "<título>" --body-file <arquivo-temporario>
   ```

4. **Colher aprendizados.** Rode a skill `colhendo-aprendizados`. Se ela mudar arquivos do
   projeto, commite na mesma branch (`docs: registra aprendizados da entrega`) e envie.

5. **Mesclar** (seção abaixo), sem esperar aprovação: ninguém revisa PR na Expert, o PR é o registro.

6. **Relatório:** link do PR, se foi mesclado e, em uma linha, o que a colheita atualizou.

## Merge (automático quando está tudo certo)

O merge acontece logo depois de abrir o PR, sem pedir confirmação, quando **todas** as condições valem:

- A suíte inteira passou (a trava do push já rodou; sem testes no projeto, vale a linha de base `sem-testes`).
- Checagens do GitHub: `gh pr checks` sem falha. Sem checagens configuradas, passa. Com checagem
  pendente, espere com `gh pr checks --watch`; falhou, não mescle.
- Sem conflito: `gh pr view --json mergeable -q .mergeable` é `MERGEABLE`.
- A pessoa não pediu para segurar ("não mescla", "deixa aberto").

Então:

1. `gh pr merge --squash --delete-branch`.
2. Prove o merge antes de qualquer limpeza: `gh pr view --json state -q .state` deve ser `MERGED`.
3. `git switch main && git pull --ff-only`.
4. Se sobrou a branch local, apague com `git branch -D <branch>` (só depois do passo 2).
5. Avise: "Mesclado na main. Quer publicar?" (skill `publicando`).

Condição que falhou: **não mescle**, diga qual foi (teste, checagem ou conflito) em uma linha e
pare. Corrigir e tentar de novo é com a pessoa ou no próximo pedido.

## Nunca

- `gh pr merge --admin` ou qualquer forma de passar por cima de uma regra.
- Mesclar com teste ou checagem falhando, ou com conflito.
- Apagar branch sem provar o merge.
