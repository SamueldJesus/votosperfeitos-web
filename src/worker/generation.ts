import type { Env } from "./env";
import type { GeneratedVow, StoredOrder } from "./types";

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}

const vowSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    variations: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", enum: ["1", "2", "3"] },
          title: { type: "string" },
          subtitle: { type: "string" },
          body: { type: "string" },
        },
        required: ["id", "title", "subtitle", "body"],
      },
    },
  },
  required: ["variations"],
} as const;

function extractOutputText(response: OpenAIResponse): string | null {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

function parseGeneratedVows(value: unknown): GeneratedVow[] {
  const variations =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as { variations?: unknown }).variations
      : undefined;

  if (!Array.isArray(variations) || variations.length !== 3) {
    throw new Error("A geração precisa conter 3 variações");
  }

  const expectedIds = new Set(["1", "2", "3"]);
  const ids = new Set<string>();
  const bodies = new Set<string>();

  const vows = variations.map((variation) => {
    if (!variation || typeof variation !== "object" || Array.isArray(variation)) {
      throw new Error("Resposta da IA inválida");
    }

    const item = variation as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : "";
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const subtitle = typeof item.subtitle === "string" ? item.subtitle.trim() : "";
    const body = typeof item.body === "string" ? item.body.trim() : "";

    if (!expectedIds.has(id) || !title || !subtitle || !body) {
      throw new Error("Resposta da IA inválida");
    }

    ids.add(id);
    bodies.add(body);
    return { id: id as GeneratedVow["id"], title, subtitle, body };
  });

  if (ids.size !== 3 || bodies.size !== 3) {
    throw new Error("A geração precisa conter 3 variações únicas");
  }

  return vows;
}

export async function generateVows(env: Env, order: StoredOrder): Promise<GeneratedVow[]> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "Você escreve votos de casamento em português brasileiro. Use apenas os fatos fornecidos pela pessoa compradora; nunca invente memórias, locais, datas ou promessas. Escreva três variações inéditas no mesmo tom selecionado. A variação 1 foca na história, a 2 nas promessas e a 3 tem leitura direta e íntima. Cada uma deve ser calorosa, específica e pronta para ser lida no altar.",
        },
        {
          role: "user",
          content: JSON.stringify({
            tomSelecionado: order.tone,
            historia: order.answers,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "votos_personalizados",
          strict: true,
          schema: vowSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível gerar seus votos agora");
  }

  const outputText = extractOutputText((await response.json()) as OpenAIResponse);
  if (!outputText) {
    throw new Error("Resposta da IA inválida");
  }

  try {
    return parseGeneratedVows(JSON.parse(outputText));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("A geração precisa")) {
      throw error;
    }
    throw new Error("Resposta da IA inválida");
  }
}
