import type { Env } from "./env";
import type { StoredOrder } from "./types";

export interface PdfFile {
  filename: string;
  bytes: Uint8Array;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function coupleNames(order: StoredOrder): string {
  return `${order.answers.speakerName} e ${order.answers.partnerName}`;
}

function buildEmailHtml(order: StoredOrder): string {
  const names = escapeHtml(coupleNames(order));
  const orderId = escapeHtml(order.id);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Seus votos VotosPerfeitos estão anexados</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f2ed;color:#1c1917;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Entrega do pedido ${orderId}: três PDFs com votos personalizados estão anexados a este e-mail.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f6f2ed;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fffdf9;border:1px solid #e9dfd2;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:26px 30px 20px;border-bottom:1px solid #eee5da;">
                <p style="margin:0 0 6px;color:#9c7836;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">VotosPerfeitos</p>
                <p style="margin:0;color:#6d625a;font-size:13px;line-height:20px;">Entrega digital do seu pedido</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 30px 22px;">
                <h1 style="margin:0 0 14px;color:#1c1917;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:600;letter-spacing:-0.4px;line-height:38px;">Seus votos estão prontos.</h1>
                <p style="margin:0 0 16px;color:#423b35;font-size:16px;line-height:26px;">Olá, ${names}. Os três PDFs do seu pedido estão anexados a este e-mail.</p>
                <p style="margin:0;color:#423b35;font-size:16px;line-height:26px;">Cada versão usa as respostas que você enviou para criar um caminho diferente: uma versão mais narrativa, uma focada nas promessas e uma leitura mais direta para o altar.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#fbf7f0;border:1px solid #eadfce;border-radius:14px;">
                  <tr>
                    <td style="padding:20px 20px 18px;">
                      <p style="margin:0 0 8px;color:#1c1917;font-size:16px;font-weight:700;line-height:23px;">O que fazer agora</p>
                      <ol style="margin:0;padding-left:20px;color:#645b53;font-size:14px;line-height:22px;">
                        <li style="padding-left:3px;margin-bottom:5px;">Abra os três anexos e leia em voz alta.</li>
                        <li style="padding-left:3px;margin-bottom:5px;">Marque as frases que soam mais naturais para você.</li>
                        <li style="padding-left:3px;">Ajuste nomes, apelidos ou palavras antes de levar ao altar.</li>
                      </ol>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 28px;">
                <p style="margin:0 0 12px;color:#423b35;font-size:15px;line-height:24px;"><strong>Pedido:</strong> ${orderId}</p>
                <p style="margin:0;color:#645b53;font-size:13px;line-height:21px;">Se você não encontrar os anexos, responda este e-mail informando o número do pedido. Este é um e-mail transacional de entrega, enviado porque o pagamento do pedido foi confirmado.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 30px;background:#1c1917;color:#e9d6ae;font-size:12px;line-height:19px;">
                VotosPerfeitos — suporte: contato@avancoai.com.br<br>
                Guarde este e-mail para acessar os arquivos novamente quando precisar.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildEmailText(order: StoredOrder): string {
  const names = coupleNames(order);
  return `VotosPerfeitos - entrega do pedido ${order.id}

Seus votos estão prontos.

Olá, ${names}. Os três PDFs do seu pedido estão anexados a este e-mail.

Cada versão usa as respostas que você enviou para criar um caminho diferente: uma versão mais narrativa, uma focada nas promessas e uma leitura mais direta para o altar.

O que fazer agora:
1. Abra os três anexos e leia em voz alta.
2. Marque as frases que soam mais naturais para você.
3. Ajuste nomes, apelidos ou palavras antes de levar ao altar.

Pedido: ${order.id}

Se você não encontrar os anexos, responda este e-mail informando o número do pedido. Este é um e-mail transacional de entrega, enviado porque o pagamento do pedido foi confirmado.

Suporte: contato@avancoai.com.br
VotosPerfeitos`;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

export async function sendVowEmail(env: Env, order: StoredOrder, files: PdfFile[]): Promise<string> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `votos-${order.id}`,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [order.email],
      reply_to: ["contato@avancoai.com.br"],
      subject: `VotosPerfeitos: seus 3 PDFs estão anexados`,
      html: buildEmailHtml(order),
      text: buildEmailText(order),
      attachments: files.map(({ filename, bytes }) => ({ filename, content: toBase64(bytes) })),
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível enviar os votos por e-mail");
  }

  const result = (await response.json()) as { id?: string };
  if (!result.id) {
    throw new Error("O serviço de e-mail retornou uma resposta inválida");
  }

  return result.id;
}
