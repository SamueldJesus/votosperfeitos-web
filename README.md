# VotosPerfeitos

Landing page e compra de três variações de votos de casamento. O comprador responde ao questionário e abre o checkout hospedado do Pagar.me para pagar **R$ 0,50 por Pix durante os testes reais**. Após a confirmação do pagamento pelo Worker, a fila gera três PDFs e os envia por e-mail.

## Desenvolvimento

```bash
npm install
npm test
npm run build
```

Para executar o Worker e os endpoints `/api/*` localmente, copie `.dev.vars.example` para `.dev.vars`, preencha os segredos com credenciais **de teste** e rode:

```bash
npx wrangler d1 migrations apply votosperfeitos-orders --local
npx wrangler dev
```

O arquivo `.dev.vars` deve usar `PAGARME_BASE_URL=https://sdx-api.pagar.me/core/v5` e uma `PAGARME_SECRET_KEY` de teste. O `npm run dev` serve somente a interface Next.js; ele não inclui D1, R2, Queue nem os endpoints de pagamento.

## Recursos Cloudflare

Na primeira publicação, crie os recursos na conta correspondente e copie o ID retornado pelo D1 para `database_id` em `wrangler.toml`:

```bash
npx wrangler d1 create votosperfeitos-orders
npx wrangler r2 bucket create votosperfeitos-files
npx wrangler queues create votosperfeitos-vow-jobs
```

O Worker de produção usa `PAGARME_BASE_URL=https://api.pagar.me/core/v5`, definido em `wrangler.toml`. Mantenha a chave secreta fora do repositório e do navegador.

## Preparação de produção — etapas manuais

Antes de publicar uma nova versão do Worker, aplique a migração aditiva à base remota:

```bash
npx wrangler d1 migrations apply votosperfeitos-orders --remote
```

A migração `0004_pagarme_payment_links.sql` acrescenta IDs do link, pedido e cobrança do Pagar.me, sem remover os campos ou registros do Mercado Pago. Configure os novos segredos do Worker separadamente:

```bash
npx wrangler secret put PAGARME_SECRET_KEY
npx wrangler secret put PAGARME_WEBHOOK_TOKEN
```

Na primeira instalação, configure também `OPENAI_API_KEY`, `RESEND_API_KEY` e `META_CAPI_ACCESS_TOKEN` como Secrets; `EMAIL_FROM` e `META_PIXEL_ID` já são variáveis em `wrangler.toml`. Use uma chave secreta **de produção** do Pagar.me e um token aleatório longo para o webhook. O mesmo token deve constar no parâmetro `?token=` da URL configurada na dashboard do Pagar.me. Preserve `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` enquanto houver pedidos antigos pendentes; o webhook e a reconciliação do Mercado Pago continuam necessários para esses pedidos.

Configure o evento `order.paid` em `https://votosperfeitos.avancoai.com.br/api/webhooks/pagarme?token=<PAGARME_WEBHOOK_TOKEN>`. As instruções de configuração, validação e testes estão em [Operação Pagar.me](docs/pagarme-operations.md).

### Publicação do código — etapa separada

Depois de aplicar a migração, configurar os segredos e validar o fluxo em sandbox, faça a publicação manualmente:

```bash
npm run build
npx wrangler deploy
```

Use `https://votosperfeitos.avancoai.com.br` como endereço público. A rota de domínio personalizado está em `wrangler.toml` e `workers.dev` está desativado. Nenhum comando de migração ou publicação é executado automaticamente por este repositório.

## Teste do pagamento

1. Em um ambiente de teste, use a chave `sk_test_...`, a base `https://sdx-api.pagar.me/core/v5` e um endpoint HTTPS de webhook de teste com seu próprio token.
2. Gere um link de checkout e confira que ele oferece somente Pix por R$ 0,50. O comprador preenche os dados exigidos no checkout do Pagar.me.
3. Conclua uma transação de sandbox e confira a notificação `order.paid`. O Worker deve consultar a API do Pagar.me antes de marcar o pedido como pago.
4. Confira no D1 que o pedido passou a `sent`, na Queue que houve um trabalho e no e-mail que chegaram três PDFs. Reenvie a mesma notificação para verificar que não há entrega duplicada.
5. No Resend, verifique o domínio usado em `EMAIL_FROM` para permitir e-mails a compradores fora da lista de teste.

## Dados e reprocessamento

Os PDFs ficam no R2 em `orders/<orderId>/` sem URL pública. Cada e-mail usa uma chave de idempotência baseada no pedido. A fila tenta novamente entregas com falha antes de marcar o pedido como `failed`. O Cron diário remove PDFs e registros de pedidos com mais de 30 dias, em lotes de 100. A reconciliação periódica consulta pedidos pendentes do Pagar.me e continua consultando os pedidos antigos do Mercado Pago durante a transição.
