import { afterEach, describe, expect, it, vi } from "vitest";
import { generateVows } from "../../src/worker/generation";

const order = {
  id: "order-123",
  email: "ana@example.com",
  tone: "lagrimas" as const,
  answers: {
    email: "ana@example.com",
    who: "noiva-noivo",
    speakerName: "Ana",
    partnerName: "João",
    howMet: "Nos conhecemos em uma padaria em um sábado de chuva.",
    insideJoke: "Ele sempre esquece a chave de casa.",
    certainMoment: "Quando ele cuidou de mim durante uma gripe.",
    admiration: "Admiro a calma, a generosidade e o jeito como ele transforma dias comuns em casa.",
    deepPromise: "Prometo caminhar ao seu lado nos dias bons e difíceis.",
    tone: "lagrimas" as const,
  },
};

const threeVows = {
  variations: [
    { id: "1", title: "Nossa história", subtitle: "Uma narrativa para o altar", body: "Meu amor, nossa história começou na chuva. [pausa breve] Lembro da padaria, do sábado molhado e do jeito como uma conversa simples abriu espaço para uma vida inteira. Desde então, a chave esquecida virou riso, cuidado e uma lembrança nossa. Quando você cuidou de mim naquela gripe, eu entendi que amor também é presença quieta, copo de água, paciência e companhia. Eu admiro sua calma e sua generosidade. Prometo escolher você nos dias bons e nos dias difíceis, ouvir com atenção, proteger nossa leveza e construir uma casa onde a gente possa descansar o coração. [respire] Hoje eu venho dizer, diante de quem amamos, que quero continuar encontrando beleza nos nossos pequenos gestos." },
    { id: "2", title: "Minhas promessas", subtitle: "Compromissos para a vida", body: "João, eu prometo escolher você nas manhãs e nas noites. [pausa breve] Prometo lembrar da nossa padaria de sábado, da chuva e da forma como tudo começou sem pressa. Prometo rir quando a chave ficar para trás, cuidar quando o corpo pesar e conversar quando a vida pedir calma. Eu admiro o jeito como você transforma cuidado em atitude, sem precisar de grandes discursos. Ao seu lado, aprendi que amor se prova no detalhe repetido todos os dias. Prometo ser presença, parceria e abrigo. Prometo defender nossa alegria e respeitar nossos silêncios. [respire] Que a nossa vida seja feita dessa escolha renovada: eu por você, você por mim, nós dois pelo que estamos construindo." },
    { id: "3", title: "Direto do coração", subtitle: "Uma leitura íntima", body: "João, eu amo a nossa vida construída em pequenos gestos. [pausa breve] Amo lembrar que tudo começou em uma padaria, em um sábado de chuva, e que daquele encontro nasceu esse caminho que hoje nos trouxe até aqui. Amo até as nossas manias, como a chave esquecida, porque elas contam a verdade da nossa rotina. Quando você cuidou de mim durante aquela gripe, eu vi o tipo de amor que quero para a vida: simples, presente e constante. Eu admiro sua calma, sua generosidade e o jeito como você faz casa onde chega. Prometo caminhar ao seu lado, te ouvir com carinho, rir com você e cuidar do nosso amor sem deixar que ele vire costume. [respire] Hoje eu digo sim para você de novo." },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateVows", () => {
  it("asks OpenAI for three distinct variations in the selected tone", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ output_text: JSON.stringify(threeVows) }), { status: 200 }),
    );

    await expect(generateVows({ OPENAI_API_KEY: "openai-test" } as never, order)).resolves.toEqual(threeVows.variations);

    const requestBody = JSON.stringify(fetchSpy.mock.calls[0]?.[1]?.body);
    expect(requestBody).toContain("lagrimas");
    expect(requestBody).toContain("oQueAdmiraNaPessoa");
    expect(requestBody).toContain("pausas de leitura");
    const payload = JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body));
    const history = JSON.parse(payload.input[1].content);
    expect(history.historia).not.toHaveProperty("email");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer openai-test" }) }),
    );
  });

  it("rejects a response that does not contain all three variations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ output_text: JSON.stringify({ variations: threeVows.variations.slice(0, 2) }) }), {
        status: 200,
      }),
    );

    await expect(generateVows({ OPENAI_API_KEY: "openai-test" } as never, order)).rejects.toThrow(
      "A geração precisa conter 3 variações",
    );
  });
});
