import Link from "next/link";

const updatedAt = "19 de setembro de 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-12 text-[#1C1917] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#F0EAE1] bg-white p-6 shadow-luxury sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#9C7836] underline underline-offset-4">
          Voltar para a página inicial
        </Link>

        <div className="mt-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B38E46]">Política de Privacidade</p>
          <h1 className="font-serif-luxury text-4xl font-medium tracking-tight sm:text-5xl">
            Como tratamos suas respostas
          </h1>
          <p className="text-sm text-[#78716C]">Última atualização: {updatedAt}.</p>
        </div>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-[#57534E]">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">1. Dados coletados</h2>
            <p>
              Coletamos o e-mail informado no checkout, as respostas enviadas no formulário, dados necessários para pagamento Pix e informações técnicas básicas para segurança, prevenção de fraude e funcionamento do site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">2. Como usamos esses dados</h2>
            <p>
              Usamos suas informações para gerar os votos, criar os PDFs, enviar a entrega por e-mail, processar pagamento, prestar suporte e cumprir obrigações legais ou operacionais.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">3. Privacidade da sua história</h2>
            <p>
              Suas respostas podem conter detalhes pessoais. Por isso, exemplos públicos devem ser anonimizados, editados ou ilustrativos. Não exibimos nomes, histórias completas ou dados de compradores sem autorização.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">4. Serviços de terceiros</h2>
            <p>
              O fluxo pode usar provedores de pagamento, e-mail, armazenamento, processamento de IA e mensuração de anúncios. Esses provedores recebem apenas os dados necessários para executar suas funções.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">5. Retenção</h2>
            <p>
              Os dados de pedido e arquivos podem ser mantidos pelo período necessário para entrega, suporte, reembolso, prevenção de abuso e obrigações legais. Quando possível, os arquivos de entrega são removidos após o prazo operacional definido pelo serviço.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#1C1917]">6. Seus direitos</h2>
            <p>
              Você pode solicitar acesso, correção ou exclusão de dados, observados os limites legais e técnicos aplicáveis. Para isso, escreva para{" "}
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
