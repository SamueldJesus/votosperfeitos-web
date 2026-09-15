# VotosPerfeitos

Landing page e fluxo de compra para três variações de votos de casamento no tom escolhido. O navegador coleta a história, exibe o QR Code Pix criado pelo Mercado Pago e, após uma confirmação autenticada, o Worker gera os textos, cria três PDFs e os envia para o e-mail do comprador.

## Desenvolvimento

```bash
npm install
npm test
npm run build
```

Para executar o Worker com os endpoints `/api/*`, copie `.dev.vars.example` para `.dev.vars`, preencha os valores apenas na sua máquina e rode:

```bash
npx wrangler dev
```

O `npm run dev` serve somente a interface Next.js; ele não inclui D1, R2, Queue nem os endpoints de pagamento.

## Configuração Cloudflare

Crie os recursos na conta que fará a publicação:

```bash
npx wrangler d1 create votosperfeitos-orders
npx wrangler r2 bucket create votosperfeitos-files
npx wrangler queues create votosperfeitos-vow-jobs
```

Copie o ID retornado pelo D1 para `database_id` em `wrangler.toml`. Depois aplique o esquema e inclua os segredos no ambiente remoto:

```bash
npx wrangler d1 migrations apply votosperfeitos-orders --remote
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put MP_ACCESS_TOKEN
npx wrangler secret put MP_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put EMAIL_FROM
npm run build
npx wrangler deploy
```

Use `https://votosperfeitos.avancoai.com.br` como endereço público. O hostname `workers.dev` fica desativado para reduzir a superfície exposta.

```toml
[[routes]]
pattern = "votosperfeitos.avancoai.com.br"
custom_domain = true
```

Não inclua valores de segredos em `wrangler.toml`, Git ou no cliente.

## Teste de pagamento

1. No Mercado Pago, configure Checkout Transparente com API Orders, Pix e o evento `Order (Mercado Pago)`. Use a URL de notificação `https://SEU-DOMINIO/api/webhooks/mercado-pago`.
2. No Resend, verifique o domínio usado em `EMAIL_FROM`; isso permite enviar e-mails ao comprador fora da lista de teste.
3. Faça uma compra Pix de sandbox e confirme que o pedido chega a `sent` no D1, que a fila teve um trabalho e que o e-mail contém três PDFs.
4. Publique em produção somente depois de esse fluxo funcionar de ponta a ponta.

O Worker cria uma Order Pix de R$ 47,00 com uma chave de idempotência por pedido. O QR Code e o código copia e cola são exibidos no modal; cartões não fazem parte deste fluxo.

## Dados e reprocessamento

Os PDFs ficam no R2 em `orders/<orderId>/` sem URL pública. Cada e-mail usa uma chave de idempotência baseada no pedido. A fila faz até três tentativas antes de marcar uma entrega como falha. O Cron diário do Worker remove PDFs e registros de pedidos com mais de 30 dias, em lotes de 100.
