import type { Env } from "./env";
import type { StoredOrder } from "./types";

export interface PdfFile {
  filename: string;
  bytes: Uint8Array;
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
      subject: "Seus 3 votos personalizados chegaram",
      html: "<p>Seus três PDFs estão anexados a esta mensagem.</p>",
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
