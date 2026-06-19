import { Check, X } from "lucide-react";
import CTAButtonV1 from "./CTAButtonV1";

const left = [
  "Acha que o problema é o algoritmo do Instagram",
  "Só vende quando abre o carrinho (picos aleatórios)",
  "Entra em desespero quando o especialista para de postar",
  "Fatura muito, mas o lucro fica todo no Facebook Ads",
  "Passa o dia inteiro operando o caos",
  "Decide com base no \"sentimento\" do lançamento",
];

const right = [
  "Sabe que o tráfego pago é a única fonte de escala real",
  "Vende todos os dias com funis automáticos de entrada",
  "Tem um time comercial que faz vendas ativas todos os dias",
  "Lucra antes mesmo do lançamento começar",
  "Sabe que o tráfego está agora em campanha de escala",
  "Roda um lançamento gravado com previsibilidade",
];

export default function ComparisonSection() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A diferença entre o Lançador Amador e o Profissional:
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="space-y-3">
            <div className="bg-accent/15 border-2 border-accent rounded-lg py-3 px-4 text-center">
              <p className="text-xs md:text-sm font-bold text-accent uppercase tracking-[0.2em]">
                Quem é Amador
              </p>
            </div>
            {left.map((item, i) => (
              <div
                key={i}
                className="bg-card/60 border border-border rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
                  <X className="w-3 h-3 text-accent" strokeWidth={3} />
                </span>
                <span className="text-sm text-muted-foreground leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="bg-emerald-500/15 border-2 border-emerald-500 rounded-lg py-3 px-4 text-center">
              <p className="text-xs md:text-sm font-bold text-emerald-400 uppercase tracking-[0.2em]">
                Quem é Estrategista (Novo Jogo)
              </p>
            </div>
            {right.map((item, i) => (
              <div
                key={i}
                className="bg-card/60 border border-border rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                </span>
                <span className="text-sm text-foreground leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-10 md:mt-12">
          <CTAButtonV1 label="Quero entrar no Novo Jogo" />
        </div>
      </div>
    </section>
  );
}
