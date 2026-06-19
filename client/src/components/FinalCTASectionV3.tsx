import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCTASectionV3() {
  return (
    <section className="relative py-20 md:py-24 lg:py-28 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-secondary/10" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8">
        <div className="bg-card/70 border border-border rounded-2xl p-8 md:p-12 lg:p-16 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Treinamento Lançamento Múltiplo
            </h2>

            <div className="space-y-3">
              <p className="text-base md:text-lg text-muted-foreground">
                Comece agora no seu próprio ritmo
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-black text-accent" style={{ fontFamily: "var(--font-display)" }}>
                  R$ 19,90
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                24 de Junho, 15h às 18h (Ao vivo)
              </p>

              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white font-bold text-lg h-14 px-12 rounded-lg group relative overflow-hidden inline-flex"
                style={{
                  boxShadow:
                    "0 0 30px rgba(255, 68, 68, 0.6), 0 0 60px rgba(255, 68, 68, 0.3)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <a href="https://pay.onprofit.com.br/P5JlkAul?off=HdAKm1" target="_blank" rel="noopener noreferrer">
                  Garantir meu Ingresso
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground">
              Acesso ao treinamento ao vivo + Gravação disponível por 30 dias
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
