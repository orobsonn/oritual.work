# src/routes/api/stripe

- Pagamento único (não é assinatura). O webhook trata `checkout.session.completed` e marca `users.is_premium = 1`.
- O webhook confere a assinatura (`stripe-signature`) antes de qualquer coisa; não remova.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e o ID do preço são secrets (`wrangler secret put`), nunca em `vars`.
