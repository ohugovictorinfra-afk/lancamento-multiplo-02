const pillars = [
  {
    label: "Pilar 01",
    title: "O jogo mudou (e ninguém te avisou)",
    points: [
      "Por que o custo por lead explodiu — e o que isso significa pra quem ainda depende só de orgânico ou lançamento gratuito",
      "A razão real de players com menos autoridade que você estarem faturando o triplo",
      "O erro de ignorar o comercial e a falsa ilusão de que \"o vídeo de vendas faz tudo sozinho\"",
      "Quanto tempo você ainda tem antes do modelo antigo quebrar o seu caixa de vez",
    ],
  },
  {
    label: "Pilar 02",
    title: "O sistema Lançamento Múltiplo",
    points: [
      "Como usar o Funil de Entrada para qualificar o lead enquanto ele se diverte respondendo",
      "O segredo para capturar leads com 64% de conversão e já converter 10% em compradores de imediato",
      "Como criar uma esteira onde o low ticket paga o seu tráfego e o lançamento vira lucro puro",
      "O passo a passo da personalização: como fazer o cliente sentir que o produto foi feito pra ele",
    ],
  },
  {
    label: "Pilar 03",
    title: "Escala e Liberdade sem o Especialista",
    points: [
      "Como rodar o Lançamento Secreto: vendas no automático com gravações que você já tem",
      "O modelo de Lançamento Múltiplo que coloca 5x mais gente na sala do que o evento gratuito",
      "Como montar um time comercial que faz vendas ativas todos os dias, mesmo quando você está viajando",
      "Exemplos reais de operações de mentorados e da própria operação",
    ],
  },
];

import CTAButtonV4 from "./CTAButtonV4";

export default function WhatYouLearnSectionV4() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8">
        <div className="mb-14 space-y-5">
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em]">
            O que vai acontecer na aula
          </p>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-[1.15]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No dia 24 de junho, eu vou te mostrar o que o mercado digital
            mudou e que você ainda não percebeu. O modelo antigo de
            "lançar e rezar" morreu.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Vou te entregar o mapa do Lançamento Múltiplo: como usar o
            Funil de Entrada para lucrar antes mesmo da live começar. É
            isso que traz previsibilidade — e te devolve a liberdade que
            a operação de lançamento te roubou. Três horas, ao vivo, com
            os números reais dos bastidores que geraram R$ 12 milhões em
            um único lançamento.
          </p>
        </div>

        <div className="relative pl-8 md:pl-12">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-accent/40" />

          <div className="space-y-8 md:space-y-10">
            {pillars.map((pillar, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[40px] md:-left-[56px] top-[26px] md:top-[34px] w-4 h-4 rounded-full border-2 border-accent bg-background" />

                <div className="bg-card/70 border border-border rounded-xl p-6 md:p-8 backdrop-blur-sm">
                  <p className="text-[11px] font-bold text-accent uppercase tracking-[0.3em] mb-2">
                    {pillar.label}
                  </p>
                  <h3
                    className="text-xl md:text-2xl font-bold text-foreground mb-5 leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pillar.title}
                  </h3>
                  <ul className="space-y-3">
                    {pillar.points.map((point, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-accent font-bold flex-shrink-0 mt-1">
                          ▸
                        </span>
                        <span className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <CTAButtonV4 />
        </div>
      </div>
    </section>
  );
}
