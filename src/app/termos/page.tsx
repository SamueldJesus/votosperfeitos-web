import Link from "next/link";

const updatedAt = "19 de setembro de 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-12 text-[#1C1917] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#F0EAE1] bg-white p-6 shadow-luxury sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#9C7836] underline underline-offset-4">
          Voltar para a página inicial
        </Link>

        <div className="mt-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B38E46]">Termos de Uso</p>
          <h1 className="font-serif-luxury text-4xl font-medium tracking-tight sm:text-5xl">
            Como funciona o VotosPerfeitos
          </h1>
          <p className="text-sm text-[#78716C]">Última atualização: {updatedAt}.</p>
        </div>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-[#57534E]">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">1. O serviço</h2>
            <p>
              O VotosPerfeitos ajuda você a transformar respostas pessoais em três versões de votos de casamento. O material entregue é digital e serve como ponto de partida para leitura, revisão e adaptação pelo comprador.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">2. Pagamento e entrega</h2>
            <p>
              A compra é feita por pagamento único via Pix. Após a confirmação do pagamento, o sistema gera os textos e envia os PDFs para o e-mail informado no checkout. O prazo pode variar conforme a confirmação do provedor de pagamento e a fila de processamento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">3. Revisão pelo comprador</h2>
            <p>
              Os votos são criados a partir das respostas enviadas. Antes de usar no casamento, leia tudo com calma e ajuste palavras, nomes, detalhes ou promessas para garantir que o texto represente você.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">4. Garantia de 7 dias</h2>
            <p>
              Se os textos não representarem a história de vocês, entre em contato em até 7 dias após a compra para solicitar o reembolso. O reembolso é feito pelo mesmo meio disponível no processamento do pagamento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">5. Uso adequado</h2>
            <p>
              Não use o serviço para enviar informações falsas, ofensivas, ilegais ou de terceiros sem autorização. O comprador é responsável pelas informações que envia e pela revisão final do texto entregue.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">6. Contato</h2>
            <p>
              Para suporte, dúvidas sobre pagamento, entrega ou reembolso, escreva para{" "}
              <a className="font-semibold text-[#9C7836] underline underline-offset-4" href="mailto:contato@avancoai.com.br">
                contato@avancoai.com.br
              </a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
