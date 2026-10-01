import { describe, expect, it } from "vitest";
import { ORDER_AMOUNT_CENTS, parseCheckoutInput } from "../../src/worker/orders";

const validInput = {
  email: "ana@example.com",
  who: "noiva-noivo",
  speakerName: "Ana",
  partnerName: "João",
  howMet: "Nos conhecemos em uma padaria em um sábado de chuva.",
  insideJoke: "Ele sempre esquece a chave de casa.",
  certainMoment: "Quando ele cuidou de mim durante uma gripe.",
  admiration: "Admiro a calma e o cuidado dele nos detalhes.",
  deepPromise: "Prometo caminhar ao seu lado nos dias bons e difíceis.",
  tone: "lagrimas",
};

describe("parseCheckoutInput", () => {
  it("accepts a complete buyer story and selected tone", () => {
    expect(parseCheckoutInput(validInput)).toMatchObject(validInput);
  });

  it("rejects an invalid buyer email", () => {
    expect(() => parseCheckoutInput({ ...validInput, email: "ana" })).toThrow("E-mail inválido");
  });

  it("rejects missing story answers and unknown tones", () => {
    expect(() => parseCheckoutInput({ ...validInput, howMet: "" })).toThrow("Como vocês se conheceram");
    expect(() => parseCheckoutInput({ ...validInput, admiration: "" })).toThrow("O que você mais admira nessa pessoa");
    expect(() => parseCheckoutInput({ ...validInput, tone: "romantico" })).toThrow("Tom inválido");
  });
});

it("keeps the sale amount server-owned", () => {
  expect(ORDER_AMOUNT_CENTS).toBe(4700);
});
