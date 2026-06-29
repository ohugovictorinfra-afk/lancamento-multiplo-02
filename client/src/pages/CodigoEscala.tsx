import { useState, useRef, useEffect, type ReactNode } from "react";
import { ArrowRight, MapPin, Calendar, Users, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AccentCTA({ href, label, size = "md", fullWidth = false }: { href: string; label: string; size?: "sm" | "md" | "lg"; fullWidth?: boolean }) {
  const sizeClass =
    size === "lg" ? "h-14 px-10 text-base md:text-lg" :
    size === "sm" ? "h-9 px-5 text-sm" :
    "h-12 px-8 text-sm md:text-base";
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-lg bg-accent hover:bg-accent/90 text-white transition-all active:scale-[0.98] ${sizeClass} ${fullWidth ? "w-full" : ""}`}
      style={{
        boxShadow: "0 0 24px rgba(255, 68, 68, 0.5), 0 0 48px rgba(255, 68, 68, 0.2)",
        fontFamily: "var(--font-body)",
      }}
    >
      {label}
      {!fullWidth && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
    </a>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mb-3">
      {children}
    </p>
  );
}

// ─── Tickets ─────────────────────────────────────────────────────────────────

function CompassIcon() {
  return (
    <div className="w-14 h-14 rounded-full border-2 border-accent/60 bg-card flex items-center justify-center mx-auto -mb-7 relative z-10 shadow-lg">
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
        <path d="M8.5 8.5l2.5 5 2.5-5-5 2.5z" fill="currentColor" stroke="none" />
        <path d="M15.5 15.5l-2.5-5-2.5 5 5-2.5z" fill="currentColor" stroke="none" opacity="0.4" />
      </svg>
    </div>
  );
}

function TicketCard({
  tier,
  subtitle,
  installments,
  installmentPrice,
  cashPrice,
  features,
  href,
  highlighted = false,
}: {
  tier: string;
  subtitle?: string;
  installments: number;
  installmentPrice: string;
  cashPrice: string;
  features: string[];
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <CompassIcon />
      <div
        className={`flex-1 rounded-2xl pt-10 pb-8 px-7 flex flex-col backdrop-blur-sm ${
          highlighted
            ? "bg-card/80 border-2 border-accent/50"
            : "bg-card/50 border border-border"
        }`}
        style={highlighted ? { boxShadow: "0 0 40px -10px rgba(255,68,68,0.3)" } : undefined}
      >
        <p
          className="text-lg font-bold text-accent uppercase tracking-widest text-center mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          INGRESSO {tier}
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider text-center mb-4">
            {subtitle}
          </p>
        )}

        <div className="text-center mt-4 mb-2">
          <p className="text-foreground/60 text-xs mb-1 uppercase tracking-widest">em até</p>
          <p className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-sm font-semibold mr-1">{installments}x</span>
            <span className="text-4xl md:text-5xl font-bold">{installmentPrice}</span>
          </p>
          <p className="text-muted-foreground text-sm mt-1">ou {cashPrice} à vista</p>
        </div>

        <div className="w-full h-px bg-border my-6" />

        <ul className="space-y-3 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <AccentCTA href={href} label="QUERO MEU INGRESSO" fullWidth />
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Quando será o evento?", a: "22 e 23 de julho de 2026, das 09h às 18h." },
  { q: "Onde será o evento?", a: "Alphaville, São Paulo — SP. O endereço completo é enviado por e-mail e WhatsApp após a confirmação da compra." },
  { q: "Para quem é o Código da Escala?", a: "Para infoprodutores, estrategistas, co-produtores e gestores de tráfego que já fazem lançamento (ou estão prontos pra começar) e querem sair do modelo que depende de sorte, de aparecer toda semana, ou só de orgânico." },
  { q: "Sou menor de 18 anos, posso participar?", a: "Não. O evento é voltado exclusivamente para maiores de 18 anos." },
  { q: "Como funciona o ingresso Diamond?", a: "O ingresso Diamond garante tudo do ingresso Padrão, além de acesso às melhores cadeiras, prioridade nas perguntas ao vivo e uma experiência exclusiva: jantar na casa do Luiz Filho ao final do segundo dia." },
  { q: "Como recebo meu ingresso?", a: "Assim que a compra for confirmada, você recebe por e-mail e WhatsApp a confirmação com todas as instruções de acesso ao evento." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-5xl font-bold text-foreground uppercase mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TEM ALGUMA <span className="text-accent">DÚVIDA?</span>
          </h2>
          <p className="text-muted-foreground text-base">
            Separamos as <span className="text-accent">dúvidas</span> mais frequentes sobre o evento
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="border border-border rounded-xl overflow-hidden transition-colors hover:border-accent/40"
              style={{ background: open === i ? "rgba(255,68,68,0.05)" : "rgba(255,255,255,0.03)" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span
                  className="text-sm md:text-base font-semibold text-accent pr-4"
                  style={open !== i ? { color: "var(--color-accent)" } : undefined}
                >
                  {faq.q}
                </span>
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-accent/60 flex items-center justify-center text-accent font-bold text-lg leading-none">
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-border/50">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support card */}
        <div className="mt-10 rounded-2xl bg-card border border-border px-8 py-7 text-center">
          <p
            className="text-base md:text-lg font-bold text-foreground uppercase tracking-wider mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Está com dúvidas ou precisando de ajuda?
          </p>
          <p className="text-accent font-semibold italic text-base">Fale com nossa equipe!</p>
          <div className="mt-5 inline-flex items-center gap-2 border border-border rounded-xl px-5 py-3">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-muted-foreground">[email@codigoescala.com.br]</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials (Social proof) ──────────────────────────────────────────────

const EVENT_PHOTOS = [1, 2, 3, 4, 5, 6];

function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28 px-6 bg-background overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-5xl font-bold text-accent uppercase leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            VEJA QUEM JÁ PARTICIPOU<br className="hidden sm:block" /> DOS NOSSOS EVENTOS PRESENCIAIS
          </h2>
        </div>

        {/* 3 staggered portrait photos */}
        <div className="flex items-end justify-center gap-4 md:gap-6 mb-14">
          {/* Left — slightly lower */}
          <div
            className="w-36 md:w-48 rounded-2xl overflow-hidden border-2 border-accent/40 flex-shrink-0"
            style={{ marginBottom: "2rem" }}
          >
            <div className="aspect-[3/4] bg-card flex items-center justify-center text-muted-foreground/20 text-xs">
              [Foto 1]
            </div>
          </div>
          {/* Center — tallest, raised */}
          <div className="w-44 md:w-56 rounded-2xl overflow-hidden border-2 border-accent/70 flex-shrink-0 shadow-[0_0_30px_rgba(255,68,68,0.2)]">
            <div className="aspect-[3/4] bg-card flex items-center justify-center text-muted-foreground/20 text-xs">
              [Foto 2]
            </div>
          </div>
          {/* Right — slightly lower */}
          <div
            className="w-36 md:w-48 rounded-2xl overflow-hidden border-2 border-accent/40 flex-shrink-0"
            style={{ marginBottom: "2rem" }}
          >
            <div className="aspect-[3/4] bg-card flex items-center justify-center text-muted-foreground/20 text-xs">
              [Foto 3]
            </div>
          </div>
        </div>

        {/* Italic quote */}
        <p
          className="text-center text-2xl md:text-3xl font-bold italic text-accent mb-12"
          style={{ fontFamily: "var(--font-display)" }}
        >
          "Eu nunca vi um evento como esse"
        </p>

        {/* Event photo carousel */}
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-accent/50 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto mx-6"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {EVENT_PHOTOS.map((n) => (
              <div
                key={n}
                className="flex-shrink-0 w-56 md:w-64 aspect-[4/3] rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground/20 text-xs"
                style={{ scrollSnapAlign: "start" }}
              >
                [Foto evento {n}]
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-accent/50 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
          <AccentCTA href="#ingressos" label="QUERO MEU INGRESSO" size="lg" />
        </div>
      </div>
    </section>
  );
}

// ─── Último Aviso + Countdown ────────────────────────────────────────────────

const EVENT_DATE = new Date("2026-07-22T09:00:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function UltimoAvisoSection() {
  const { days, hours, mins, secs } = useCountdown(EVENT_DATE);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative overflow-hidden">
      {/* Top — Último Aviso */}
      <div className="relative py-20 px-6 text-center bg-secondary/10">
        {/* Faded watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <span className="text-[20vw] font-black text-foreground uppercase">AVISO</span>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2
            className="text-5xl md:text-7xl font-bold italic text-foreground mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            !!ÚLTIMO AVISO!!
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            <span className="font-bold text-foreground underline underline-offset-2">
              Se você continuar tomando as mesmas decisões
            </span>
            {", vai continuar tendo os mesmos resultados. O Código da Escala é o ambiente para quem decidiu mudar isso."}
          </p>
          <a
            href="#ingressos"
            className="inline-flex items-center justify-center px-10 h-14 rounded-full text-white font-bold text-base md:text-lg transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, var(--color-accent) 0%, #ff6b35 100%)",
              boxShadow: "0 0 30px rgba(255,68,68,0.4)",
              fontFamily: "var(--font-body)",
            }}
          >
            Quero garantir meu ingresso agora!
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-6 md:mx-16" />

      {/* Bottom — Countdown */}
      <div className="py-16 px-6 bg-secondary/10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-16">
          <div className="flex-shrink-0 text-center md:text-left">
            <p
              className="text-2xl md:text-3xl font-bold text-foreground mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nos vemos em:
            </p>
            <p className="text-muted-foreground text-sm">22 e 23 de Julho de 2026</p>
          </div>

          <div className="flex gap-3 md:gap-4">
            {[
              { value: pad(days), label: "DIAS" },
              { value: pad(hours), label: "HORAS" },
              { value: pad(mins), label: "MIN" },
              { value: pad(secs), label: "SEG" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center w-20 h-24 md:w-28 md:h-32 rounded-2xl bg-card border border-border"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
              >
                <span
                  className="text-3xl md:text-5xl font-bold text-foreground tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Exit Intent Popup ────────────────────────────────────────────────────────

function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (fired.current || e.clientY > 10) return;
      fired.current = true;
      setVisible(true);
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
    >
      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-accent/50 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden border border-border">
          {/* Top banner */}
          <div
            className="px-6 py-3 text-center text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, var(--color-accent) 0%, #ff6b35 100%)" }}
          >
            Código da Escala — Alphaville, 22 e 23 de Julho de 2026
          </div>

          {/* Body */}
          <div className="bg-card px-8 py-8 text-center">
            <h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Dúvidas?
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
              Caso ainda tenha alguma dúvida sobre o Código da Escala, fale agora com nosso time de suporte.
            </p>
            <a
              href="https://wa.me/[NUMERO]"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-full text-white font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(90deg, var(--color-accent) 0%, #ff6b35 100%)" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.85L0 24l6.337-1.502A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.368l-.359-.214-3.722.882.936-3.618-.234-.372A9.818 9.818 0 1112 21.818z" />
              </svg>
              Fale com nosso time no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CodigoEscala() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-accent text-white">
            CE
          </div>
          <span className="font-bold text-sm uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Código da Escala
          </span>
        </div>
        <AccentCTA href="#ingressos" label="Garantir Ingresso" size="sm" />
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20 z-0 bg-accent" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10 z-0 bg-accent" />

        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0 hidden lg:block">
          <div className="w-full h-full flex items-center justify-center bg-card/30">
            <div className="text-center text-muted-foreground/30">
              <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm tracking-wider uppercase">[Foto do Palestrante]</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <SectionLabel>Evento Presencial · Alphaville, SP · 22 e 23 de Julho</SectionLabel>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-6 text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              O único evento que vai te ensinar a{" "}
              <span className="text-accent">escalar do jeito certo.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
              2 dias presenciais para infoprodutores, estrategistas e gestores de tráfego que querem sair do lançamento que oscila e aplicar o sistema que já gerou mais de R$300 milhões em operações reais.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <AccentCTA href="#ingressos" label="Quero meu ingresso" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── "ISSO NÃO É..." ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-square rounded-xl flex items-center justify-center text-muted-foreground/30 text-xs bg-card border border-border">
                  [Foto {n}]
                </div>
              ))}
            </div>
            <div>
              <SectionLabel>O que é o Código da Escala?</SectionLabel>
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Isso não é mais um<br />
                <span className="text-accent">evento de marketing digital.</span>
              </h2>
              <div className="w-12 h-1 rounded-full my-4 bg-accent/60" />
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>Aqui não tem aula de "diquinha" de Instagram, hack de algoritmo ou promessa de fórmula mágica. O Código da Escala é o bastidor real de operações que já geraram mais de R$300 milhões — com o gerenciador de anúncios aberto e os números reais na tela, sem filtro.</p>
                <p>Você vai sair de lá sabendo exatamente como construir um negócio que fatura com previsibilidade, antes mesmo do lançamento começar. Com comercial trabalhando todos os dias da semana, não só no carrinho aberto.</p>
                <p>É pra você que já faz lançamento, mas vive de mês bom e mês ruim sem entender por quê. Que tem uma lista de leads parada e não sabe o que fazer com ela. Que sente que o negócio só funciona enquanto você está na frente da câmera. Se você quer parar de adivinhar e começar a operar com método validado, esse é o seu lugar nos dias 22 e 23 de julho.</p>
              </div>
              <div className="mt-8">
                <AccentCTA href="#ingressos" label="Quero participar" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUANDO E ONDE ── */}
      <section className="py-12 px-6 bg-secondary/10">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            {/* Venue photo placeholder / background */}
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-card/60" />
            <div className="absolute inset-0 flex items-center justify-end opacity-30">
              <div className="w-full h-full bg-card flex items-center justify-center text-muted-foreground/20 text-sm">
                [Foto do local do evento]
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-card/95 via-card/70 to-card/30" />

            {/* Compass icon top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-accent/60 bg-card flex items-center justify-center z-10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                <path d="M8.5 8.5l2.5 5 2.5-5-5 2.5z" fill="currentColor" stroke="none" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-10 pt-12">
              <div className="space-y-5">
                <p className="text-[11px] font-bold text-accent uppercase tracking-[0.3em]">Quando e onde vai acontecer?</p>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                      22 e 23 de Julho de 2026
                    </p>
                    <p className="text-sm text-muted-foreground">Quarta e quinta-feira · 09h às 18h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <p className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    Alphaville — São Paulo / SP
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <AccentCTA href="#ingressos" label="QUERO MEU INGRESSO" size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMAÇÃO ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Programação</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              O que vai acontecer<br />
              <span className="text-accent">nos dois dias.</span>
            </h2>
          </div>

          {[
            {
              label: "Dia 1", date: "22 de Julho", sessions: [
                { time: "09h", title: "O Novo Jogo dos Lançamentos", speaker: "Luiz Filho", desc: "Por que o modelo antigo de lançamento quebrou, e a estrutura do sistema que substitui ele." },
                { time: "13h", title: "Posicionamento e Esteira de Produto", speaker: "Luiz Filho", desc: "Como definir seu público certo, precificar sem medo e montar o comercial sem inflar custo." },
                { time: "16h", title: "O Funil que Substitui o Lançamento Gratuito", speaker: "Luiz Filho", desc: "A lógica do low ticket, o lançamento pago e a introdução ao funil de quiz." },
              ],
            },
            {
              label: "Dia 2", date: "23 de Julho", sessions: [
                { time: "09h", title: "A Aula Completa do Funil de Quiz", speaker: "Mateus Ribeiro", desc: "A estrutura que gerou R$13,4 milhões em vendas com um produto de R$47." },
                { time: "13h", title: "Lançamento Aberto, Secreto e Semanal", speaker: "Luiz Filho", desc: "Debriefing real de lançamentos de oito dígitos, com os números na tela." },
                { time: "16h", title: "Escala e Liberdade sem Depender de Você Aparecer", speaker: "Mateus Ribeiro", desc: "Como construir uma operação que fatura com previsibilidade, mesmo sem fazer live ao vivo." },
              ],
            },
          ].map((dia, di) => (
            <div key={dia.label} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-accent">
                  {di + 1}
                </div>
                <div>
                  <p className="font-bold text-lg uppercase tracking-widest text-foreground leading-none" style={{ fontFamily: "var(--font-display)" }}>{dia.label}</p>
                  <p className="text-muted-foreground text-xs">{dia.date}</p>
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-3 pl-11">
                {dia.sessions.map((s) => (
                  <div key={s.time} className="flex items-start gap-4 p-4 rounded-xl bg-card/70 border border-border backdrop-blur-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                      <span className="text-accent text-xs font-bold">{s.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm mb-0.5">{s.title}</p>
                      <p className="text-muted-foreground text-xs">{s.speaker} · {s.desc}</p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                      <span className="text-muted-foreground/30 text-[9px]">[Foto]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PALESTRANTES ── */}
      <section className="py-24 px-6 bg-secondary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Quem vai falar</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Conheça os <span className="text-accent">palestrantes.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              { name: "Luiz Filho", role: "Estrategista de Lançamentos", bio: "128+ lançamentos operados. Mais de R$300 milhões gerados em operações reais." },
              { name: "Mateus Ribeiro", role: "Especialista em Funis de Quiz", bio: "A estrutura que gerou R$13,4 milhões em vendas com um único produto de R$47." },
            ].map((s) => (
              <div key={s.name} className="text-center">
                <div className="aspect-square rounded-2xl mb-4 flex items-center justify-center text-muted-foreground/20 text-xs bg-card border border-border max-w-[240px] mx-auto">
                  [Foto {s.name}]
                </div>
                <p className="font-bold text-foreground text-base">{s.name}</p>
                <p className="text-accent text-xs font-semibold uppercase tracking-wider mt-0.5 mb-2">{s.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INGRESSOS ── */}
      <section id="ingressos" className="py-24 px-6 relative overflow-hidden">
        {/* Background gradient matching reference */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[150px] opacity-10 bg-accent" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-bold text-foreground uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              VAGAS ABERTAS
            </h2>
            <p className="text-muted-foreground text-base mt-3">Vagas limitadas. Garanta agora antes que acabem.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <TicketCard
              tier="PADRÃO"
              installments={12}
              installmentPrice="R$ 41,42"
              cashPrice="R$ 497,00"
              features={[
                "Acesso presencial aos 2 dias do evento",
                "Material de apoio impresso",
                "Coffee break incluso",
                "Acesso à gravação completa do evento por 30 dias",
              ]}
              href="#"
            />
            <TicketCard
              tier="DIAMOND"
              subtitle="APROVEITE MUITO MAIS A NOSSA IMERSÃO."
              installments={12}
              installmentPrice="R$ 208,08"
              cashPrice="R$ 2.497,00"
              features={[
                "Acesso presencial aos 2 dias do evento",
                "Material de apoio impresso",
                "Coffee break incluso",
                "Acesso à gravação completa do evento por 30 dias",
                "Acesso privilegiado às melhores cadeiras",
                "Dúvidas respondidas ao vivo",
                "Jantar exclusivo na casa do Luiz Filho",
              ]}
              href="#"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <TestimonialsSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── ÚLTIMO AVISO + COUNTDOWN ── */}
      <UltimoAvisoSection />

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-border text-center bg-background">
        <p className="text-muted-foreground/40 text-xs">
          © 2026 Código da Escala. Todos os direitos reservados.
        </p>
      </footer>

      <ExitIntentPopup />
    </div>
  );
}
