import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const expertImg = "/manus-storage/expert-real_a9b88540.jpg";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HeroSectionV2() {
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

            <div className="flex-shrink-0 text-right">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Quando?</p>
              <p className="text-sm font-bold text-foreground leading-tight">24 de Junho</p>
              <p className="text-xs text-muted-foreground leading-none">15h às 18h</p>
              <p className="text-xs text-accent font-bold leading-none">Ao vivo</p>
            </div>
          </div>

          {/* Mobile banner */}
          <div className="lg:hidden flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase leading-none">Edição Especial</div>
              <div className="text-sm font-bold text-foreground leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                Lançamento Múltiplo
              </div>
            </div>

            <div className="bg-accent/10 border-2 border-accent rounded-lg px-3 py-1">
              <div className="flex items-center gap-1">
                {units.map((it, i) => (
                  <div key={it.l} className="flex items-center gap-1">
                    <div className="text-center">
                      <div className="text-sm font-black text-accent leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {it.v.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs font-bold text-accent uppercase tracking-wider leading-none">{it.l}</div>
                    </div>
                    {i < 3 && <span className="text-accent font-black">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 lg:pt-48 lg:pb-20 bg-background overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4">
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Como Chegar no Dia do Lançamento Já no Lucro por Lead
                </h1>
                <p className="text-base md:text-lg text-accent font-semibold">
                  Rodando Gravações que Você Já Tem, com Aquisição a Custo Zero, Sem Uma Única Live Nova
                </p>
              </div>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Estrategista de 128 lançamentos e R$300M gerados revela o sistema do Lançamento Múltiplo. O mesmo modelo usado na operação do Pablo Marçal que gerou R$1,5 milhão de lucro antes da primeira live começar, usando gravações que já existiam e sem depender de orgânico.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://pay.onprofit.com.br/P5JlkAul?off=2M6zVD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-accent hover:bg-accent/90 text-white font-bold text-base md:text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(255,68,68,0.6)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Garantir meu Ingresso | Lote 01
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              <div className="pt-4 space-y-3 border-t border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Quem vai te ensinar:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-1">✓</span>
                    <span>Operou mais de 128 lançamentos de grande escala</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-1">✓</span>
                    <span>Estrategista de players como Pablo Marçal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-1">✓</span>
                    <span>Mentor de centenas de infoprodutores de sucesso</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={expertImg}
                  alt="Luiz Filho"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute top-1/3 -right-4 md:right-0 bg-card border-2 border-accent/60 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">Milhões Gerados</p>
                <p
                  className="text-2xl md:text-3xl font-bold text-accent"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  R$ 300M+
                </p>
              </div>

              <div className="absolute bottom-1/4 -left-4 md:left-0 bg-card border-2 border-accent/60 rounded-xl p-4 shadow-lg backdrop-blur-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">Lançamentos Operados</p>
                <p
                  className="text-2xl md:text-3xl font-bold text-accent"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  128+
                </p>
              </div>
            </div>
          </div>

          {/* Sales Progress */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-3">
              {Math.round(salesProgress)}% dos ingressos vendidos
            </p>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full transition-all duration-500"
                style={{ width: `${salesProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-semibold text-accent">R$ 47,00</span>
              <span className="text-xs text-muted-foreground">{soldCount} ingressos vendidos • Vagas limitadas</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
