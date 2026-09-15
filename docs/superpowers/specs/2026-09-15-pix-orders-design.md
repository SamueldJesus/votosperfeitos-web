# Pix Transparente via Orders

## Objetivo

Cobrar R$47,00 exclusivamente por Pix no próprio modal, confirmar a Order aprovada pelo webhook do Mercado Pago e então enfileirar a geração e o envio dos três PDFs por e-mail.

## Fluxo

1. O modal envia as respostas e o e-mail para `POST /api/checkout`.
2. O Worker cria um pedido local pendente e uma Order do Mercado Pago em `POST /v1/orders`, com `processing_mode: automatic`, Pix e chave de idempotência igual ao pedido local.
3. O Worker devolve o identificador da Order, QR Code Base64, código Pix copia-e-cola e URL alternativa de pagamento.
4. O modal substitui o formulário pelo QR Code e pelo botão de cópia. Ele informa que a entrega ocorrerá por e-mail após a confirmação.
5. O webhook assinado recebe o tópico `order`, consulta `GET /v1/orders/{id}`, exige `status: processed`, `status_detail: accredited`, BRL, R$47,00 e a referência local esperada.
6. A transição pendente para paga é atômica; a fila gera os PDFs e envia o e-mail como já implementado.

## Dados e segurança

- O preço é definido exclusivamente no servidor como 4.700 centavos.
- A Order do Mercado Pago é persistida no pedido local.
- O QR Code pode ser exibido ao visitante; segredos jamais são enviados ao navegador.
- A assinatura `x-signature` continua obrigatória para qualquer webhook.
- A migração preserva pedidos existentes e remove a validação antiga que aceitava apenas R$29,90.

## Validação

- Testes do endpoint devem validar corpo, idempotência, valor e resposta Pix.
- Testes de webhook devem aceitar apenas Order processada e acreditada.
- Teste do modal deve validar a renderização e a cópia do código Pix.
