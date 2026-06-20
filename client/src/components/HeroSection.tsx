import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const expertImg = "/images/expert-real.webp";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HeroSection() {
  const [salesProgress, setSalesProgress] = useState(42);
  const [soldCount] = useState(128);
  const [maxProgress, setMaxProgress] = useState(68);
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateMaxProgress = () => {
      const targetDate = new Date("2026-06-24T15:00:00-03:00").getTime();
      const now = new Date().getTime();
      const totalTime = targetDate - new Date("2026-06-17T18:30:00-03:00").getTime();
      const elapsedTime = now - new Date("2026-06-17T18:30:00-03:00").getTime();
      const progressPercentage = Math.min((elapsedTime / totalTime) * 100, 100);
      return Math.max(42, Math.floor(progressPercentage));
    };
    
    setMaxProgress(calculateMaxProgress());
    setSalesProgress(calculateMaxProgress());
    
    const progressInterval = setInterval(() => {
      setSalesProgress((prev) => {
        const newMax = calculateMaxProgress();
        setMaxProgress(newMax);
        return Math.min(prev + 0.5, newMax);
      });
    }, 1000);
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date("2026-06-24T15:00:00-03:00").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { v: countdown.days, l: "dias" },
    { v: countdown.hours, l: "horas" },
    { v: countdown.minutes, l: "min" },
    { v: countdown.seconds, l: "seg" },
  ];

  return (
    <>
      {/* Fixed Timer Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-accent py-2">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop banner */}
          <div className="hidden lg:flex items-center justify-between gap-6">
            <div className="flex-shrink-0">
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase leading-none">Edição Especial</div>
              <div className="text-base font-bold text-foreground leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                Lançamento Múltiplo
              </div>
              <div className="text-xs text-muted-foreground leading-none">Primeira Edição</div>
            </div>

            <div className="bg-accent/10 border-2 border-accent rounded-lg px-5 py-2">
              <div className="flex items-center gap-2">
                {units.map((it, i) => (
                  <div key={it.l} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="text-xl font-black text-accent leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {it.v.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs font-bold text-accent uppercase tracking-wider leading-none">{it.l}</div>
                    </div>
                    {i < 3 && <span className="text-accent font-black text-xl">:</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 border border-accent/40 rounded-lg px-4 py-2 bg-accent/5">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold leading-none">Quando:</div>
                  <div className="text-sm font-bold text-foreground leading-tight">24 de Junho</div>
                </div>
                <div className="self-stretch border-l border-accent/40" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold leading-none">Horario:</div>
                  <div className="text-sm font-bold text-accent leading-tight">15h as 18h</div>
                  <div className="text-xs text-muted-foreground leading-none">Ao vivo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile banner: only timer */}
          <div className="flex lg:hidden justify-center">
            <div className="bg-accent/10 border-2 border-accent rounded-lg px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                {units.map((it, i) => (
                  <div key={it.l} className="flex items-center gap-1.5">
                    <div className="text-center">
                      <div className="text-base font-black text-accent leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {it.v.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-bold text-accent uppercase tracking-wider leading-none">{it.l}</div>
                    </div>
                    {i < 3 && <span className="text-accent font-black text-base">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-24 lg:pt-32">
        {/* Desktop: photo on right half with left->right fade */}
        <div className="hidden lg:block absolute top-0 right-0 h-full w-1/2 z-0">
          <img
            src={expertImg}
            alt="Especialista em lançamentos"
            className="w-full h-full object-cover object-top"
            style={{ filter: "brightness(1.1) contrast(1.1)" }}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent pointer-events-none" />
        </div>

        {/* Mobile: photo as full background with strong fade */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src={expertImg}
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-top opacity-40"
            style={{ filter: "brightness(0.9) contrast(1.1)" }}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background pointer-events-none" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4">
            {/* Mobile-only event info on the first fold */}
            <div className="lg:hidden mb-6 border border-accent/40 rounded-lg px-4 py-3 bg-background/70 backdrop-blur-sm">
              <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase leading-none mb-1">Edição Especial</div>
              <div className="text-lg font-bold text-foreground leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Lançamento Múltiplo · Primeira Edição
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider font-semibold leading-none">Quando</div>
                  <div className="font-bold text-foreground mt-0.5">24 de Junho</div>
                </div>
                <div className="self-stretch border-l border-accent/40" />
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider font-semibold leading-none">Horário</div>
                  <div className="font-bold text-accent mt-0.5">15h às 18h · Ao vivo</div>
                </div>
              </div>
            </div>

            <div className="flex items-stretch gap-0">
              <div className="flex-1 space-y-8 flex flex-col justify-center animate-fade-in lg:pr-8">
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    Como Chegar no Dia do Lançamento Já no Lucro por Lead
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-accent leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                    Rodando Gravações que Você Já Tem, com Aquisição a Custo Zero, Sem Uma Única Live Nova
                  </p>
                </div>

                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Estrategista de 128 lançamentos e R$300M gerados revela o sistema do Lançamento Múltiplo. O mesmo modelo usado na operação do Pablo Marçal que gerou R$1,5 milhão de lucro antes da primeira live começar, usando gravações que já existiam e sem depender de orgânico.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-bold text-lg h-14 px-8 rounded-lg group relative overflow-hidden w-fit"
                    style={{
                      boxShadow: "0 0 30px rgba(255, 68, 68, 0.6), 0 0 60px rgba(255, 68, 68, 0.3)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <a href="https://pay.onprofit.com.br/P5JlkAul?off=P0CRCX" target="_blank" rel="noopener noreferrer">
                      Garantir meu Ingresso | Lote 01
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>

                <div className="space-y-3 pt-4 max-w-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {salesProgress}% dos ingressos vendidos
                    </span>
                    <span className="text-sm font-semibold text-accent">R$ 97,00</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-accent/20">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${salesProgress}%`,
                        background: "linear-gradient(90deg, #ffffff 0%, #ff4444 100%)",
                        boxShadow: "0 0 20px rgba(255, 68, 68, 0.5)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {soldCount} ingressos vendidos • Vagas limitadas
                  </p>
                </div>
              </div>

              <div className="hidden lg:block flex-1 relative">
                <div className="absolute top-1/3 right-0 bg-card/95 border border-border rounded-lg p-4 shadow-lg backdrop-blur-md z-20">
                  <p className="text-xs text-muted-foreground mb-2">Milhões Gerados</p>
                  <p className="text-2xl font-bold text-accent" style={{ fontFamily: "var(--font-display)" }}>R$ 300M+</p>
                </div>

                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-card/95 border border-border rounded-lg p-4 shadow-lg backdrop-blur-md z-20">
                  <p className="text-xs text-muted-foreground mb-2">Lançamentos Operados</p>
                  <p className="text-2xl font-bold text-accent" style={{ fontFamily: "var(--font-display)" }}>128+</p>
                </div>

                <div className="absolute bottom-8 right-0 bg-card/95 border border-border rounded-lg p-4 shadow-lg backdrop-blur-md max-w-xs z-20">
                  <p className="text-sm font-semibold text-foreground mb-3">Quem vai te ensinar:</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-accent font-bold flex-shrink-0">✓</span><span>Operou mais de 128 lançamentos de grande escala</span></li>
                    <li className="flex items-start gap-2"><span className="text-accent font-bold flex-shrink-0">✓</span><span>Estrategista de players como Pablo Marçal</span></li>
                    <li className="flex items-start gap-2"><span className="text-accent font-bold flex-shrink-0">✓</span><span>Mentor de centenas de infoprodutores de sucesso</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
      `}</style>
    </>
  );
}
