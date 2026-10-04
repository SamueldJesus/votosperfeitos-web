# Operação do checkout Pix Pagar.me

## Fluxo e valor

O Worker cria um [Link de Pagamento v5](https://docs.pagar.me/reference/criar-link) do tipo `order` para cada pedido local, com um item de **50 centavos (R$ 0,50) durante os testes reais** e somente Pix. O link expira após 7 dias, antes da remoção dos pedidos locais após 30 dias. Cada código Pix gerado no checkout expira após uma hora. O navegador abre a URL hospedada retornada pelo Pagar.me; o comprador preenche os dados exigidos e paga naquele checkout. O identificador local acompanha o link para correlacionar o pedido gerado pelo Pagar.me ao registro no D1.

| Ambiente | `PAGARME_BASE_URL` | `PAGARME_SECRET_KEY` |
| --- | --- | --- |
| Teste local/sandbox | `https://sdx-api.pagar.me/core/v5` em `.dev.vars` | Chave secreta de teste (`sk_test_...`) em `.dev.vars` |
| Worker de teste isolado | `https://sdx-api.pagar.me/core/v5` em `wrangler.staging.toml` | Chave secreta de teste (`sk_test_...`) em Cloudflare Secret do Worker `votosperfeitos-web-staging` |
| Produção | `https://api.pagar.me/core/v5` em `wrangler.toml` | Chave secreta de produção em Cloudflare Secret |

`PAGARME_SECRET_KEY` nunca pertence a `wrangler.toml`, ao Git nem ao cliente. O Worker usa a chave em autenticação HTTP Basic ao acessar a API. Confira a [referência de autenticação](https://docs.pagar.me/reference/autentica%C3%A7%C3%A3o-2) e as [configurações do checkout](https://docs.pagar.me/reference/checkout-link).

## Webhook de produção

Na dashboard do Pagar.me, configure o evento **`order.paid`** e a URL HTTPS:

```text
https://votosperfeitos.avancoai.com.br/api/webhooks/pagarme?token=<PAGARME_WEBHOOK_TOKEN>
```

Substitua o trecho entre `<>` por um token aleatório longo, armazenado também como Cloudflare Secret `PAGARME_WEBHOOK_TOKEN`. A URL completa contém uma credencial: mantenha-a restrita à configuração do Pagar.me, evite incluí-la em capturas de tela e rotacione o token se for exposta. Use um token diferente em sandbox. [Eventos de webhook do Pagar.me](https://docs.pagar.me/docs/webhooks).

A notificação serve para identificar o pedido a consultar. Antes de liberar a geração, o Worker deve obter o pedido pela API autenticada do Pagar.me e confirmar o status `paid`, BRL, 4.700 centavos, a referência do pedido local e uma cobrança Pix paga. Uma notificação isolada, mesmo com o token correto, não é prova suficiente de pagamento. O Worker registra a transição do pedido apenas uma vez, para que notificações repetidas não gerem PDFs ou e-mails duplicados. A API também permite [consultar uma cobrança](https://docs.pagar.me/reference/obter-cobran%C3%A7a).

## Migração e publicação

1. Aplique as migrações D1 à base remota com `npx wrangler d1 migrations apply ORDERS --remote --config wrangler.toml`. A migração `0004_pagarme_payment_links.sql` adiciona IDs do link, pedido e cobrança do Pagar.me e índices únicos, preservando os pedidos antigos. Use `--config wrangler.staging.toml` para migrar apenas a base de teste.
2. Cadastre `PAGARME_SECRET_KEY` e `PAGARME_WEBHOOK_TOKEN` usando `npx wrangler secret put NOME_DO_SEGREDO --config wrangler.toml`, um por vez. Configure a URL do webhook com o mesmo token no Pagar.me.
3. Valide primeiro o fluxo completo em sandbox; depois, em uma etapa de publicação separada, execute `npm run build` e `npx wrangler deploy` para produção.
4. Preserve `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, o endpoint `/api/webhooks/mercado-pago` e o Cron de reconciliação enquanto pedidos antigos do Mercado Pago puderem estar pendentes. A troca afeta apenas novas compras.

Estes comandos são instruções de operação; editar o código não aplica a migração, não cadastra segredos e não publica o Worker.

## Teste em sandbox

1. Use uma conta de teste, `PAGARME_SECRET_KEY` de teste e `PAGARME_BASE_URL=https://sdx-api.pagar.me/core/v5`. O Worker isolado é publicado com `npx wrangler deploy --config wrangler.staging.toml` em `https://votosperfeitos-web-staging.progression-os.workers.dev`, usando D1, R2 e Queue próprios. A URL de webhook de teste é `https://votosperfeitos-web-staging.progression-os.workers.dev/api/webhooks/pagarme?token=<PAGARME_WEBHOOK_TOKEN>`. `localhost` não recebe notificações externas.
2. Cadastre no Worker de teste os segredos `PAGARME_SECRET_KEY`, `PAGARME_WEBHOOK_TOKEN`, `OPENAI_API_KEY` e `RESEND_API_KEY` pelo painel ou com `npx wrangler secret put NOME_DO_SEGREDO --config wrangler.staging.toml`, um por vez. A Cloudflare criptografa os segredos por Worker e não revela nem compartilha automaticamente os valores do Worker de produção. O token do webhook de teste deve ser diferente do de produção.
3. Abra o site de teste, conclua o questionário e confirme que o link hospedado mostra somente Pix por R$ 0,50.
4. Conclua a transação de teste conforme os recursos da sua conta Pagar.me. Verifique o recebimento de `order.paid`, a consulta autenticada ao pedido e a transição do registro local para `paid` e depois `sent`.
5. Confira um único trabalho na Queue, um único e-mail com três PDFs e os arquivos privados no R2. Reenvie a mesma notificação e confira que a entrega não se repete.
6. Teste token ausente/incorreto e pedido de outro valor ou referência: nenhum deles deve liberar a entrega.

O [simulador de Pix](https://docs.pagar.me/docs/simulador-pix) descreve cenários de sucesso e falha para contas Gateway; confirme na sua conta de teste qual simulador está disponível. Pedidos de sandbox não substituem uma compra real de valor mínimo em produção após a publicação.
