# Mercado Pago — pedidos anteriores à troca de checkout

Novas compras usam o checkout Pix hospedado do Pagar.me por R$ 0,50 durante os testes reais. Esta integração do Mercado Pago permanece apenas para confirmar e entregar pedidos criados antes da troca, inclusive aqueles que ainda estejam pendentes. Não crie novos checkouts do Mercado Pago.

Mantenha a notificação em **Suas integrações → Webhooks** no Mercado Pago enquanto houver pedidos legados pendentes:

- **Tópico:** `Order (Mercado Pago)` / `orders`
- **URL de produção:** `https://votosperfeitos.avancoai.com.br/api/webhooks/mercado-pago`
- **Assinatura secreta:** o mesmo valor configurado no Cloudflare Secret `MP_WEBHOOK_SECRET`

Preserve também o Cloudflare Secret `MP_ACCESS_TOKEN`. A rota acima e a reconciliação do Cron a cada cinco minutos continuam processando esses pedidos. Não selecione apenas `Pagamentos (legacy)`: esse tópico não cobre as atualizações das Orders usadas pela integração anterior.

Para cada pedido antigo, o Worker consulta a Order na API do Mercado Pago e só libera a entrega quando o Pix estiver `processed/accredited`, em BRL, vinculado ao identificador salvo no D1 e com valor igual a `orders.amount_cents` daquela linha. O valor histórico pode variar entre pedidos; o preço atual do Pagar.me não deve ser aplicado retroativamente.
