import type { Env } from "./env";
import type { GeneratedVow, StoredOrder, Tone } from "./types";

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}

const toneGuidance: Record<Tone, string> = {
  lagrimas:
    "emocional, íntimo e elegante; use gratidão, memória afetiva e promessas maduras, sem melodrama excessivo",
  sorrisos:
    "leve, cúmplice e romântico; inclua humor sutil quando houver material, sem piadas constrangedoras ou sarcasmo",
  classica:
    "solene, atemporal e direto; privilegie promessas claras, frases limpas e uma cadência de cerimônia",
};

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

    if (body.length < 600) {
      throw new Error("Cada variação precisa ter conteúdo suficiente para leitura no altar");
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
          content: [
            "Você é uma pessoa especialista em escrever votos de casamento em português brasileiro para serem lidos em cerimônia.",
            "Entregue um produto final digno de compra: pessoal, específico, elegante e pronto para revisão final pela pessoa compradora.",
            "Use somente os fatos fornecidos. Nunca invente datas, cidades, familiares, viagens, profissões, perdas, pedidos de casamento, filhos, religião ou promessas que não estejam nas respostas.",
            "Não escreva como IA. Evite frases genéricas como 'desde o primeiro dia', 'minha alma gêmea', 'você é meu porto seguro' ou 'te amo mais que tudo' a menos que a resposta sustente isso.",
            "Cada variação deve ter entre 430 e 650 palavras, com parágrafos curtos, cadência oral e marcações discretas de pausa como [pausa breve] ou [respire].",
            "Inclua: abertura com endereço direto à pessoa amada, 2 ou 3 detalhes concretos fornecidos, uma virada emocional, admiração explícita, 3 a 5 promessas concretas e fechamento memorável.",
            "A variação 1 deve priorizar a história do casal. A variação 2 deve priorizar promessas e futuro. A variação 3 deve ser mais direta, íntima e fácil de ler no altar.",
            "Não mencione que o texto foi gerado por IA, não explique o processo e não inclua comentários fora do JSON.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            tomSelecionado: order.tone,
            direcaoDoTom: toneGuidance[order.tone],
            instrucoesDeEntrega: {
              quantidade: "3 variações completas e diferentes entre si",
              uso: "votos de casamento para leitura em voz alta no altar",
              idioma: "português brasileiro natural, caloroso e sem exageros",
              formatoDoCorpo: "texto corrido com parágrafos, pausas de leitura e sem listas",
            },
            historia: {
              quemFala: order.answers.who,
              nomeDeQuemFala: order.answers.speakerName,
              nomeDaPessoaAmada: order.answers.partnerName,
              comoSeConheceram: order.answers.howMet,
              lembrancaEspecialOuCumplicidade: order.answers.insideJoke,
              momentoEmQueTeveCerteza: order.answers.certainMoment,
              oQueAdmiraNaPessoa: order.answers.admiration,
              promessaPrincipal: order.answers.deepPromise,
            },
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
