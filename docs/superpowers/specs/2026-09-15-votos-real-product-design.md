# Produto real VotosPerfeitos

## Objetivo

Transformar o questionário atual em uma compra e entrega reais. Após um pagamento Pix de R$ 29,90 aprovado, o comprador recebe por e-mail três PDFs de votos de casamento personalizados.

## Oferta e entrega

- O comprador responde seis perguntas, informa seu e-mail e escolhe um tom: **Lágrimas e Coração**, **Sorrisos e Cumplicidade** ou **Clássica e Atemporal**.
- A IA gera três variações inéditas no tom escolhido. Elas devem ter construções diferentes — foco na história, nas promessas ou numa leitura mais direta — sem mudar o tom selecionado.
- O sistema envia um único e-mail ao comprador com os três PDFs anexados. Os votos não são mostrados no site.
- Cada compra gera o pacote uma vez. Não há regeneração gratuita no lançamento.

## Arquitetura

O Cloudflare Worker único serve os ativos estáticos atuais e expõe a API no mesmo domínio.

| Componente | Responsabilidade |
| --- | --- |
| Worker | Servir o site, criar pedidos, criar Checkout Pro, receber o webhook e processar a fila. |
| D1 | Guardar pedido, respostas, tom, referências de pagamento, estado da entrega e tentativas. |
| Queue | Executar a geração e entrega fora do webhook, com retentativas. |
| R2 | Armazenar os três PDFs privados durante 30 dias para reenvio. |
| OpenAI Responses API | Gerar três textos em JSON estruturado. |
| Mercado Pago Checkout Pro | Cobrar R$ 29,90 via Pix. |
| Resend | Enviar o e-mail transacional com os três PDFs. |

## Fluxo de compra

1. O front-end valida as seis respostas, o e-mail e o tom.
2. `POST /api/checkout` cria um pedido `pending` no D1 e cria uma preferência do Checkout Pro no Mercado Pago. O valor é fixado no servidor em 2990 centavos e o checkout aceita somente Pix.
3. O navegador é redirecionado ao `init_point` retornado pelo Mercado Pago.
4. `POST /api/webhooks/mercado-pago` valida a assinatura do webhook e confirma o pagamento consultando a API do Mercado Pago. Só pagamentos `approved` mudam o pedido para `paid`.
5. A transição para `paid` publica uma mensagem com o identificador do pedido na fila. Repetições do webhook não publicam uma segunda mensagem.
6. O consumidor da fila muda o pedido para `processing`, chama a OpenAI, gera três PDFs, guarda-os no R2 e envia o e-mail com uma chave de idempotência baseada no pedido.
7. Depois de o Resend aceitar o envio, o pedido passa para `sent`. Depois de três falhas de processamento, passa para `failed` e fica visível nos logs para atendimento manual.
8. A página de retorno apenas confirma que o pagamento foi recebido e mostra o e-mail de entrega; nunca revela os votos.

## Modelo de pedido

Cada pedido terá ao menos:

- `id`, `created_at`, `updated_at`
- `email`
- `answers_json` e `tone`
- `amount_cents` com valor 2990
- `status`: `pending`, `paid`, `processing`, `sent` ou `failed`
- `mercado_pago_preference_id` e `mercado_pago_payment_id`
- `resend_email_id`, `attempt_count` e `failure_reason`

Os objetos R2 ficam no prefixo do pedido e são removidos após 30 dias.

## Mudanças na página

- Adicionar campo de e-mail obrigatório ao questionário.
- A etapa do tom passa a explicar: “Receba três variações inéditas nesse mesmo tom”.
- Trocar todas as menções a “três estilos diferentes” por “três variações no tom escolhido”.
- Remover QR Code/código Pix falso, temporizador de geração e tela de conclusão simulada.
- Após a última pergunta, o botão cria o checkout e redireciona para o Mercado Pago.
- Após retorno, mostrar uma confirmação de entrega por e-mail, sem conteúdo dos votos.

## Segurança e privacidade

- `OPENAI_API_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `RESEND_API_KEY` e `EMAIL_FROM` são segredos do Worker, nunca variáveis enviadas ao navegador.
- Validar o webhook do Mercado Pago antes de entregar qualquer conteúdo.
- Não aceitar preço ou estado de pagamento enviados pelo cliente.
- Validar e-mail e limites de tamanho das respostas antes de criar o pedido.
- Os PDFs e as respostas são privados; não haverá URL pública para download.

## Testes

- Testes unitários para validação do pedido, preço fixo, escolha de tom e três variações no mesmo tom.
- Testes de transição de estado que bloqueiam geração e e-mail duplicados.
- Testes de assinatura do webhook e rejeição de pagamentos não aprovados.
- Teste do consumidor da fila com integrações simuladas para OpenAI, Mercado Pago e Resend.
- Teste manual em modo sandbox do Mercado Pago antes de produção.

## Configuração necessária antes da produção

1. Criar conta/aplicação no Mercado Pago e configurar Checkout Pro, Pix e webhook HTTPS.
2. Criar uma chave de API da OpenAI com crédito disponível.
3. Criar conta no Resend e verificar o domínio do remetente por SPF e DKIM.
4. Criar e vincular D1, Queue e R2 no projeto Cloudflare.
5. Cadastrar os segredos no Worker.
