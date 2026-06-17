import { X, Check } from "lucide-react";

const items = [
  {
    type: "no" as const,
    title: "Não é curso de \"diquinha\" de Instagram",
    desc: "Não vou te ensinar a fazer dancinha ou hack de algoritmo de rede social.",
  },
  {
    type: "no" as const,
    title: "Não é aula teórica massante",
    desc: "Vou abrir as ferramentas e o Gerenciador de Anúncios. É campo de batalha puro.",
  },
  {
    type: "no" as const,
    title: "Não é promessa de dinheiro fácil",
    desc: "O sistema funciona, mas você tem que aplicar de fato.",
  },
  {
    type: "yes" as const,
    title: "É sobre o Novo Jogo",
    desc: "Você vai ser treinado a olhar para o seu lançamento como um ecossistema de lucro previsível. Do funil de entrada ao comercial, da live ao high ticket.",
  },
];

export default function ObjectionsSection() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em]">
            Antes que você prossiga
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            O que essa aula NÃO é:
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {items.map((item, i) => {
            const isYes = item.type === "yes";
            return (
              <div
                key={i}
                className={`rounded-xl p-6 md:p-7 border-2 ${
                  isYes
                    ? "bg-emerald-500/10 border-emerald-500/60"
                    : "bg-card/60 border-border"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                      isYes
                        ? "bg-emerald-500/20 border border-emerald-500"
                        : "bg-accent/20 border border-accent"
                    }`}
                  >
                    {isYes ? (
                      <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                    ) : (
                      <X className="w-4 h-4 text-accent" strokeWidth={3} />
                    )}
                  </span>
                  <h3
                    className="text-lg md:text-xl font-bold text-foreground leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm md:text-base text-muted-foreground italic mt-10 max-w-2xl mx-auto">
          Se você sabe seguir um processo validado, você tem tudo o que precisa. O burro sempre ganha do inteligente porque ele não tenta inventar, ele apenas executa o que funciona.
        </p>
      </div>
    </section>
  );
}
