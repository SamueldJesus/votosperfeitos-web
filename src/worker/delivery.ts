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

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Seus votos estão prontos para o altar</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f2ed;color:#1c1917;font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Seus três votos personalizados estão prontos para o altar.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f6f2ed;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fffdf9;border:1px solid #e9dfd2;border-radius:20px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:32px 32px 24px;border-bottom:1px solid #eee5da;">
                <p style="margin:0 0 8px;color:#b28a42;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">VotosPerfeitos</p>
                <p style="margin:0;color:#6d625a;font-family:Arial,sans-serif;font-size:13px;line-height:20px;">Palavras à altura da história de vocês</p>
              </td>
            </tr>
            <tr>
              <td style="padding:42px 40px 28px;">
                <p style="margin:0 0 16px;color:#b28a42;font-size:24px;line-height:24px;">✦</p>
                <h1 style="margin:0 0 18px;color:#1c1917;font-size:34px;font-weight:600;letter-spacing:-0.6px;line-height:42px;">Que bonito chegar até aqui.</h1>
                <p style="margin:0 0 18px;color:#423b35;font-size:18px;line-height:29px;">${names}, vocês transformaram lembranças, risos e promessas em palavras para um dos momentos mais especiais da vida de vocês.</p>
                <p style="margin:0;color:#423b35;font-size:18px;line-height:29px;">Três versões foram preparadas para vocês. Leiam com calma, marquem os trechos que tocam mais fundo e escolham aquela que parece ter sido escrita pelo coração de vocês.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#fbf7f0;border:1px solid #eadfce;border-radius:14px;">
                  <tr>
                    <td style="padding:24px 24px 20px;">
                      <h2 style="margin:0 0 12px;color:#1c1917;font-size:20px;font-weight:600;line-height:27px;">Seus 3 PDFs estão anexados</h2>
                      <p style="margin:0;color:#645b53;font-family:Arial,sans-serif;font-size:15px;line-height:23px;">Cada arquivo traz uma abordagem diferente, mantendo o tom que vocês escolheram: uma história para guardar, promessas que ficam e uma versão direta para dizer no altar.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 34px;">
                <h2 style="margin:0 0 12px;color:#1c1917;font-size:21px;font-weight:600;line-height:28px;">Como escolher a sua versão</h2>
                <ol style="margin:0;padding-left:22px;color:#423b35;font-size:16px;line-height:26px;">
                  <li style="padding-left:4px;margin-bottom:6px;">Leiam cada uma em voz alta, sem pressa.</li>
                  <li style="padding-left:4px;margin-bottom:6px;">Guardem as frases que soam mais como vocês.</li>
                  <li style="padding-left:4px;">Façam os ajustes que deixem o texto ainda mais pessoal.</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 42px;">
                <p style="margin:0;color:#423b35;font-size:18px;font-style:italic;line-height:29px;">Hoje, vocês têm algumas palavras a menos para procurar e mais um momento para viver.</p>
                <p style="margin:22px 0 0;color:#1c1917;font-size:17px;line-height:26px;">Com carinho,<br><strong>VotosPerfeitos</strong></p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 32px;background:#1c1917;color:#e9d6ae;font-family:Arial,sans-serif;font-size:12px;line-height:19px;">
                Guarde este e-mail: seus votos estarão sempre aqui quando vocês quiserem reler esse capítulo.
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
  return `VOTOSPERFEITOS

Que bonito chegar até aqui.

${names}, vocês transformaram lembranças, risos e promessas em palavras para um dos momentos mais especiais da vida de vocês.

Seus 3 PDFs anexados foram preparados no tom que vocês escolheram. Leiam com calma, marquem os trechos que tocam mais fundo e escolham aquela versão que parece ter sido escrita pelo coração de vocês.

Como escolher a sua versão:
1. Leiam cada uma em voz alta, sem pressa.
2. Guardem as frases que soam mais como vocês.
3. Façam os ajustes que deixem o texto ainda mais pessoal.

Hoje, vocês têm algumas palavras a menos para procurar e mais um momento para viver.

Com carinho,
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
      subject: "Seus votos estão prontos para o altar",
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
