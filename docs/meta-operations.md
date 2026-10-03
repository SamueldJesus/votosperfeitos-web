# Operação Meta Ads — VotosPerfeitos

## Dados que o código já entrega

- Pixel no navegador apenas após consentimento de marketing.
- `PageView` após o Pixel carregar.
- `InitiateCheckout` após o link de checkout Pix do Pagar.me ser criado com sucesso, no navegador e na Conversions API com o mesmo ID de evento.
- `Purchase` apenas depois de o webhook `order.paid` levar o Worker a confirmar o pagamento de R$ 47,00 na API do Pagar.me. Pedidos antigos do Mercado Pago continuam seguindo a confirmação própria.
- Reenvio diário de compras que não chegaram à Conversions API.
- Campanha criada por `npm run meta:launch` sempre com status `PAUSED`.

## Configuração no Cloudflare

Em **Workers & Pages → votosperfeitos-web → Settings → Variables and Secrets**, crie:

| Nome | Tipo | Origem |
|---|---|---|
| `META_PIXEL_ID` | Texto | ID do Dataset/Pixel do Votos Perfeitos no Events Manager |
| `META_CAPI_ACCESS_TOKEN` | Secret | Token da Conversions API do mesmo Dataset/Pixel |
| `META_TEST_EVENT_CODE` | Secret opcional | Código temporário do Events Manager para validar eventos; remova após o teste |

O Pixel ID é público no navegador. Os dois tokens nunca são enviados ao navegador.

## Configuração local para criar a campanha

Acrescente ao arquivo `/home/samuel/.env`:

```env
META_ACCESS_TOKEN=token_com_ads_read_e_ads_management
META_ACCOUNT_ID=act_id_da_conta_de_anuncios
META_PAGE_ID=id_da_pagina_votos_perfeitos
META_PIXEL_ID=id_do_mesmo_dataset_pixel
```

Em seguida execute, a partir da raiz do projeto:

```bash
set -a; . /home/samuel/.env; set +a
npm run meta:launch
```

O lançador consulta Conta, Página, Pixel e campanhas existentes antes da primeira escrita. Em seguida envia os seis criativos aprovados e cria uma campanha de vendas para o Brasil, R$50/dia, um conjunto amplo de 23–44 anos e três anúncios. Campanha, conjunto e anúncios ficam pausados.

## Validação antes de ativar

1. Use `META_TEST_EVENT_CODE` para validar `PageView`, `InitiateCheckout` e `Purchase` no Events Manager.
2. Abra um checkout Pix hospedado do Pagar.me em sandbox por R$ 47,00 e confirme uma compra de teste. Valide que o Worker consulta o pedido na API do Pagar.me antes de enviar `Purchase` e que o evento não se repete após reenviar o webhook.
3. Confirme no Ads Manager que há uma campanha, um conjunto e três anúncios com `PAUSED`/`effective_status` não ativo.
4. Remova `META_TEST_EVENT_CODE` quando a validação terminar.
5. Deixe a campanha rodar sete dias sem mudar orçamento, criativos ou público; depois ajuste no máximo 10–15% a cada 48 horas.
