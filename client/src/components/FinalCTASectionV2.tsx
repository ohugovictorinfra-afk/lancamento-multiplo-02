import { Check } from "lucide-react";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { Button } from "@/components/ui/button";

const benefits = [
  "3 horas de treinamento estratégico ao vivo",
  "O mapa completo do Lançamento Múltiplo",
  "Bastidores reais de lançamentos de 8 dígitos",
  "3 modelos de front-end validados para copiar e colar",
];

export default function FinalCTASectionV2() {
  const { trackInitiateCheckout } = useFacebookPixel();

  const handleCheckoutClick = () => {
    trackInitiateCheckout(47, 'BRL');
  };

  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Treinamento Lançamento Múltiplo
              </h2>
              <p className="text-base font-bold text-accent uppercase tracking-[0.25em]">
                1ª edição
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">
                Quando?
              </p>
              <p
                className="text-2xl md:text-3xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                24 de Junho, das 15h às 18h
              </p>
              <p className="text-sm text-muted-foreground">
                Ao vivo · 3 horas · Transmissão Privada
              </p>
            </div>

            <div className="bg-accent/15 border-l-4 border-accent rounded-r-md px-5 py-4">
              <p className="text-sm md:text-base italic text-foreground">
                Quem estiver lá, pega o código. Quem não estiver, continua na montanha-russa.
              </p>
            </div>
          </div>

          <div className="bg-card border-2 border-accent/60 rounded-2xl p-7 md:p-9 shadow-[0_0_40px_-10px_rgba(255,68,68,0.4)]">
            <h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Garanta seu lugar na sala
            </h3>

            <p className="text-xs font-bold text-accent uppercase tracking-[0.25em] mb-2">
              Lote 01 — por tempo limitado
            </p>

            <div className="mb-6 mt-2 flex items-baseline gap-3">
              <p
                className="text-5xl md:text-6xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                R$ 47,00
              </p>
              <p className="text-sm text-muted-foreground line-through">
                R$ 297,00
              </p>
            </div>

            <ul className="space-y-3 mb-7">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                  </span>
                  <span className="text-sm md:text-base text-muted-foreground">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              className="w-full h-14 text-base md:text-lg font-bold tracking-wide rounded-lg bg-accent hover:bg-accent/90 text-white"
              style={{
                boxShadow:
                  "0 0 30px rgba(255, 68, 68, 0.6), 0 0 60px rgba(255, 68, 68, 0.3)",
                fontFamily: "var(--font-body)",
              }}
              onClick={handleCheckoutClick}
            >
              <a href="https://pay.onprofit.com.br/P5JlkAul?off=2M6zVD" target="_blank" rel="noopener noreferrer">
                GARANTIR MEU INGRESSO — R$ 47
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
