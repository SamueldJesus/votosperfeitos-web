# Notificações do Mercado Pago

O VotosPerfeitos cria cobranças pela **Orders API** (`POST /v1/orders`). Para que um Pix confirmado gere e envie os PDFs imediatamente, configure a notificação abaixo em **Suas integrações → Webhooks** no Mercado Pago:

- **Tópico:** `Order (Mercado Pago)` / `orders`
- **URL de produção:** `https://votosperfeitos.avancoai.com.br/api/webhooks/mercado-pago`
- **Assinatura secreta:** o mesmo valor configurado no segredo Cloudflare `MP_WEBHOOK_SECRET`

Não selecione apenas `Pagamentos (legacy)`: esse tópico não cobre as atualizações das Orders criadas por esta integração.

O Worker confirma cada aviso consultando a Order no Mercado Pago e só libera a geração quando o Pix está `processed/accredited`, em BRL, por R$ 1,00 e vinculado ao pedido correto. Como recuperação, a cada cinco minutos ele também reconcilia Orders pendentes, caso uma notificação se perca.
