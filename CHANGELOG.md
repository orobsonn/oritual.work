# Changelog

Este arquivo segue o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e a [versão semântica](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.1.0] - 2026-10-15

### Added
- Diário diário com gratidão, intenção, tarefas e reflexão noturna, mais histórico dos últimos dias e navegação (somente leitura) para dias anteriores.
- Hábitos semanais e mensais com acompanhamento de progresso, e metas com barra de progresso.
- Login com Google, onboarding em etapas e app instalável (PWA).
- Modo Casal (Premium): metas e hábitos compartilhados, com edição, exclusão, pausa e retomada, e sincronização automática entre parceiros.
- Compra do Premium pelo Stripe, com página de upgrade e convite de casal para quem não é Premium.
- Agenda de tarefas futuras, exibidas também na página de hoje, com botão "+ Agendar".
- Integração com Google Calendar: conectar nas configurações e sincronizar tarefas agendadas.
- Tema claro e escuro, landing page e páginas de Política de Privacidade e Termos de Uso.
- Novo logo, favicon e ícone do PWA.

### Changed
- O app passou a se chamar Ritual.
- Seletor de tema simplificado: alterna direto entre claro e escuro.
- Telas ajustadas para celular: toggles, listas e formulários mais fáceis de usar.

### Fixed
- Corrigidas falhas de segurança: acesso a dados de outras pessoas, injeção de HTML e validação da sessão.
- Corrigido o redirecionamento infinito para o login.
- A página de hoje e o painel não quebram mais quando os dias de um hábito estão corrompidos.
- Corrigido o cálculo de semana e de hábitos esperados, e as datas passam a seguir o fuso de São Paulo.
- Hábitos semanais de casal agora mostram os dias escolhidos.
- Campos de texto salvam ao sair do campo, sem pular o cursor.
- Login e cookies funcionam no domínio de produção e em localhost.
- Credenciais do Google são lidas em execução, e não no build.
