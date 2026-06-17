import { ChevronDown } from "lucide-react";
import { useState } from "react";

const luizImg = "/manus-storage/luiz-filho_34458625.webp";

const faqs = [
  {
    question: "Já comprei curso de lançamento antes e não saiu do papel.",
    answer:
      "Entendo. E provavelmente o problema não foi falta de informação.\n\nFoi falta de um modelo validado + pressão para executar.\n\nO que vou te mostrar aqui não é teoria de livro. São os bastidores reais de operações que geraram R$12 milhões em um único lançamento. Números, ferramentas, erros, o que funcionou.\n\nMas preciso ser honesto: se você compra e não assiste, se assiste e não aplica — não tem aula no mundo que resolve isso.",
  },
  {
    question: "Preciso ter um time montado para aplicar o que você vai ensinar?",
    answer:
      "Não.\n\nO modelo começa com você. O time comercial vem depois — e vou te mostrar como montar um com custo controlado, começando com comissão pura.\n\nO erro é esperar ter tudo pronto para começar. Vende primeiro. Estrutura depois. Essa é a lógica que usei em todo negócio que montei.",
  },
  {
    question: "Tenho uma lista de leads parada há meses. Ainda tem salvação?",
    answer:
      "Tem.\n\nLead parado não é lead morto — é lead sem oferta certa. Vou te mostrar exatamente como reativar uma lista e transformá-la em receita, usando o modelo de lançamento secreto com gravações que você já tem.\n\nEsse é um dos pontos que mais gera resultado imediato em quem aplica.",
  },
  {
    question: "Isso funciona para o meu nicho?",
    answer:
      "O modelo foi validado em costura, prosperidade, home sales, liderança corporativa, saúde, tráfego pago e portaria remota.\n\nA estrutura é a mesma. O que muda é o diagnóstico que você aplica ao seu público.\n\nSe você tem um conhecimento que gera resultado real para alguém, o modelo funciona.",
  },
  {
    question: "Preciso ter muita audiência para aplicar o que vai ser ensinado?",
    answer:
      "Não.\n\nO Luiz nunca dependeu de seguidores para lançar. Vários mentorados saíram do zero — sem perfil, sem lista, sem produto gravado — e chegaram a R$ 1 milhão por mês com esse sistema.",
  },
  {
    question: "Não tenho produto gravado ainda. Posso aplicar?",
    answer:
      "Sim. E na aula você vai entender por que gravar o produto antes de vender é um dos maiores erros do mercado.\n\nO modelo ensina a vender primeiro e entregar depois. É assim que funciona na prática.",
  },
];

export default function AboutLuizSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="mb-12 md:mb-16 text-center">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-[1.2]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quem é Luiz Filho?
          </h2>
          <p className="text-lg md:text-xl text-accent font-semibold">
            De carvoeiro endividado a estrategista de 8 dígitos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <img
              src={luizImg}
              alt="Luiz Filho"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Bio */}
          <div className="order-1 lg:order-2 space-y-4">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Há 7 anos, o cenário do Luiz era de caos: uma empresa de carvão com R$ 10 milhões em dívidas, ligações de cobrança às 7h da manhã...
            </p>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              A virada veio em 2019, quando ele decidiu parar de "namorar o digital" e passou a executar. Em 6 meses, sua primeira operação de dropshipping faturava mais que a empresa de 20 anos da família.
            </p>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Hoje, Luiz Filho é o nome por trás dos bastidores de operações gigantescas. Com mais de <span className="font-semibold text-foreground">128 lançamentos operados</span> e <span className="font-semibold text-foreground">R$ 300 milhões gerados</span>, ele é o estrategista de confiança de nomes como Pablo Marçal e Rafa Tarso.
            </p>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Diferente dos "gurus" que pregam fórmulas mágicas, Luiz trabalha com o <span className="font-semibold text-foreground">campo de batalha</span>. Ele é o criador do método que une o tráfego pago, funis de entrada e o time comercial para criar lucro previsível — o sistema que permitiu que ele viajasse por 40 dias enquanto sua empresa continuava faturando milhões.
            </p>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Sua missão agora é transbordar esse código: transformar lançadores amadores em empresários digitais que possuem liberdade de tempo e previsibilidade de caixa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="max-w-3xl mx-auto px-4">
        <h3
          className="text-xl md:text-2xl font-bold text-foreground mb-8 text-center"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Perguntas Frequentes
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-colors"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
              >
                <span className="text-base md:text-lg font-semibold text-foreground text-left">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-accent flex-shrink-0 ml-4 transition-transform ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-6 py-4 border-t border-border bg-background/50">
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
