import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Lenis from "lenis";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Calendar, Check, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";

// ─── Motion config ────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const;
const vp = { once: true, margin: "-80px 0px" };

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease } },
};
const staggerFast = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const staggerSlow = { hidden: {}, visible: { transition: { staggerChildren: 0.14 } } };

// ─── Lenis ───────────────────────────────────────────────────────────────────

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    let rafId: number;
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
  }, []);
}

// ─── Spotlight (Aceternity UI) ────────────────────────────────────────────────
// Gradiente radial que segue o cursor — dá profundidade ao hero

function Spotlight() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          left: pos.x - 300,
          top: pos.y - 300,
          background: "radial-gradient(circle, rgba(255,68,68,0.08) 0%, transparent 70%)",
        }}
        animate={{ left: pos.x - 300, top: pos.y - 300 }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
      />
    </div>
  );
}

// ─── WordRotate (Magic UI) ────────────────────────────────────────────────────
// Palavras que rotacionam no headline — impacto visual no hero

function WordRotate({ words, className }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span className="inline-flex overflow-hidden" style={{ verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.38, ease }}
          className={className}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Marquee (Magic UI) ───────────────────────────────────────────────────────
// Banner rolante infinito — separa seções e reforça a marca

function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const items = Array(14).fill(text);
  return (
    <div className="py-3 overflow-hidden border-y border-accent/15" style={{ background: "rgba(255,68,68,0.03)" }}>
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((t, idx) => (
          <span key={idx} className="mx-8 text-accent/40 text-[11px] uppercase tracking-[0.35em] font-bold flex-shrink-0">
            {t} <span className="text-accent/20 mx-2">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── NumberTicker (Magic UI) ──────────────────────────────────────────────────
// Contador animado que vai de 0 ao valor ao entrar na tela

function NumberTicker({ value, prefix = "", suffix = "", className }: {
  value: number; prefix?: string; suffix?: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const curr = Math.floor(eased * value);
      if (ref.current) ref.current.textContent = prefix + curr.toLocaleString("pt-BR") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// ─── ShimmerCTA (Magic UI Shimmer Button) ─────────────────────────────────────
// CTA com efeito de luz deslizando — substitui o botão padrão

function ShimmerCTA({ href, label, size = "md", fullWidth = false }: {
  href: string; label: string; size?: "sm" | "md" | "lg"; fullWidth?: boolean;
}) {
  const sz =
    size === "lg" ? "h-14 px-10 text-base md:text-lg" :
    size === "sm" ? "h-9 px-5 text-sm" :
    "h-12 px-8 text-sm md:text-base";

  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`relative inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-lg bg-accent text-white overflow-hidden transition-colors ${sz} ${fullWidth ? "w-full" : ""}`}
      style={{
        boxShadow: "0 0 24px rgba(255,68,68,0.45), 0 0 48px rgba(255,68,68,0.18)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Shimmer sweep */}
      <motion.span
        className="absolute inset-y-0 w-[55%] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {label}
        {!fullWidth && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
      </span>
    </motion.a>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <motion.p variants={fadeLeft} className="text-xs font-bold text-accent uppercase tracking-[0.3em] mb-3">
      {children}
    </motion.p>
  );
}

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

// ─── Tickets ─────────────────────────────────────────────────────────────────

function TicketCard({ tier, subtitle, installments, installmentPrice, cashPrice, features, href, highlighted = false }: {
  tier: string; subtitle?: string; installments: number; installmentPrice: string;
  cashPrice: string; features: string[]; href: string; highlighted?: boolean;
}) {
  return (
    <motion.div variants={scaleIn} className="flex flex-col">
      <CompassIcon />
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease }}
        className={`relative flex-1 rounded-2xl pt-10 pb-8 px-7 flex flex-col backdrop-blur-sm ${
          highlighted ? "bg-card/80 border-2 border-accent/50" : "bg-card/50 border border-border"
        }`}
        style={highlighted ? { boxShadow: "0 0 50px -10px rgba(255,68,68,0.35)" } : undefined}
      >
        {highlighted && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{ boxShadow: ["0 0 30px -10px rgba(255,68,68,0.2)", "0 0 70px -10px rgba(255,68,68,0.45)", "0 0 30px -10px rgba(255,68,68,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <p className="text-lg font-bold text-accent uppercase tracking-widest text-center mb-1" style={{ fontFamily: "var(--font-display)" }}>
          INGRESSO {tier}
        </p>
        {subtitle && <p className="text-[11px] text-muted-foreground uppercase tracking-wider text-center mb-4">{subtitle}</p>}

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
          <ShimmerCTA href={href} label="QUERO MEU INGRESSO" fullWidth />
        </div>
      </motion.div>
    </motion.div>
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
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="text-center mb-14">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground uppercase mb-3" style={{ fontFamily: "var(--font-display)" }}>
            TEM ALGUMA <span className="text-accent">DÚVIDA?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-base">
            Separamos as <span className="text-accent">dúvidas</span> mais frequentes sobre o evento
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="border border-border rounded-xl overflow-hidden transition-colors hover:border-accent/40"
              style={{ background: open === i ? "rgba(255,68,68,0.05)" : "rgba(255,255,255,0.03)" }}
            >
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                <span className="text-sm md:text-base font-semibold text-accent pr-4">{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="flex-shrink-0 w-6 h-6 rounded-full border border-accent/60 flex items-center justify-center text-accent font-bold text-lg leading-none"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-6 pb-5 border-t border-border/50">
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} className="mt-10 rounded-2xl bg-card border border-border px-8 py-7 text-center">
          <p className="text-base md:text-lg font-bold text-foreground uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Está com dúvidas ou precisando de ajuda?
          </p>
          <p className="text-accent font-semibold italic text-base">Fale com nossa equipe!</p>
          <div className="mt-5 inline-flex items-center gap-2 border border-border rounded-xl px-5 py-3">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-muted-foreground">[email@codigoescala.com.br]</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials com Embla Carousel ─────────────────────────────────────────
// Substitui o scroll manual — autoplay + loop nativo

const EVENT_PHOTOS = [1, 2, 3, 4, 5, 6];

function TestimonialsSection() {
  const autoplay = useRef(Autoplay({ delay: 2800, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-20 md:py-28 px-6 bg-background overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="text-center mb-14">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-accent uppercase leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            VEJA QUEM JÁ PARTICIPOU<br className="hidden sm:block" /> DOS NOSSOS EVENTOS PRESENCIAIS
          </motion.h2>
        </motion.div>

        {/* Staggered portrait photos */}
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerFast} className="flex items-end justify-center gap-4 md:gap-6 mb-14">
          {[
            { mb: "2rem", border: "border-accent/40", w: "w-36 md:w-48" },
            { mb: "0", border: "border-accent/70", w: "w-44 md:w-56", shadow: "0 0 40px rgba(255,68,68,0.2)" },
            { mb: "2rem", border: "border-accent/40", w: "w-36 md:w-48" },
          ].map((photo, n) => (
            <motion.div
              key={n}
              variants={fadeUp}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.3 }}
              className={`${photo.w} rounded-2xl overflow-hidden border-2 ${photo.border} flex-shrink-0`}
              style={{ marginBottom: photo.mb, boxShadow: photo.shadow }}
            >
              <div className="aspect-[3/4] bg-card flex items-center justify-center text-muted-foreground/20 text-xs">[Foto {n + 1}]</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} className="text-center text-2xl md:text-3xl font-bold italic text-accent mb-12" style={{ fontFamily: "var(--font-display)" }}>
          "Eu nunca vi um evento como esse"
        </motion.p>

        {/* Embla Carousel — fotos do evento com autoplay */}
        <div className="relative">
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-accent/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="overflow-hidden mx-6" ref={emblaRef}>
            <div className="flex gap-3">
              {EVENT_PHOTOS.map((n) => (
                <div
                  key={n}
                  className="flex-[0_0_224px] md:flex-[0_0_256px] aspect-[4/3] rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground/20 text-xs"
                >
                  [Foto evento {n}]
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-accent/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} className="flex justify-center mt-12">
          <ShimmerCTA href="#ingressos" label="QUERO MEU INGRESSO" size="lg" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Countdown com FlipDigit ─────────────────────────────────────────────────

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

function FlipDigit({ value }: { value: string }) {
  return (
    <div className="overflow-hidden h-[1.15em] flex items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 28, opacity: 0 }}
          transition={{ duration: 0.22, ease }}
          className="block text-3xl md:text-5xl font-bold text-foreground tabular-nums leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function UltimoAvisoSection() {
  const { days, hours, mins, secs } = useCountdown(EVENT_DATE);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative overflow-hidden">
      <div className="relative py-20 px-6 text-center bg-secondary/10">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <span className="text-[20vw] font-black text-foreground uppercase">AVISO</span>
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="relative z-10 max-w-2xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-bold italic text-foreground mb-6 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            !!ÚLTIMO AVISO!!
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            <span className="font-bold text-foreground underline underline-offset-2">Se você continuar tomando as mesmas decisões</span>
            {", vai continuar tendo os mesmos resultados. O Código da Escala é o ambiente para quem decidiu mudar isso."}
          </motion.p>
          <motion.div variants={scaleIn}>
            <ShimmerCTA href="#ingressos" label="Quero garantir meu ingresso agora!" size="lg" />
          </motion.div>
        </motion.div>
      </div>

      <div className="h-px bg-border mx-6 md:mx-16" />

      <div className="py-16 px-6 bg-secondary/10">
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-16">
          <motion.div variants={fadeLeft} className="flex-shrink-0 text-center md:text-left">
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>Nos vemos em:</p>
            <p className="text-muted-foreground text-sm">22 e 23 de Julho de 2026</p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex gap-3 md:gap-4">
            {[{ value: pad(days), label: "DIAS" }, { value: pad(hours), label: "HORAS" }, { value: pad(mins), label: "MIN" }, { value: pad(secs), label: "SEG" }].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center w-20 h-24 md:w-28 md:h-32 rounded-2xl bg-card border border-border" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
                <FlipDigit value={value} />
                <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-2 font-semibold">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Exit Intent ──────────────────────────────────────────────────────────────

function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (fired.current || e.clientY > 10) return;
      fired.current = true;
      setVisible(true);
    };
    document.addEventListener("mouseleave", handle);
    return () => document.removeEventListener("mouseleave", handle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease }}
            className="relative w-full max-w-md"
          >
            <button onClick={() => setVisible(false)} className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-accent/50 transition-colors">
              <X className="w-4 h-4 text-foreground" />
            </button>
            <div className="rounded-2xl overflow-hidden border border-border">
              <div className="px-6 py-3 text-center text-sm font-semibold text-white" style={{ background: "linear-gradient(90deg, var(--color-accent) 0%, #ff6b35 100%)" }}>
                Código da Escala — Alphaville, 22 e 23 de Julho de 2026
              </div>
              <div className="bg-card px-8 py-8 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "var(--font-display)" }}>Dúvidas?</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
                  Caso ainda tenha alguma dúvida sobre o Código da Escala, fale agora com nosso time de suporte.
                </p>
                <a
                  href="https://wa.me/[NUMERO]"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-full text-white font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CodigoEscalaV2() {
  useLenis();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Spotlight />

      {/* ── NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-md border-b border-border"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-accent text-white">CE</div>
          <span className="font-bold text-sm uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-display)" }}>Código da Escala</span>
        </div>
        <ShimmerCTA href="#ingressos" label="Garantir Ingresso" size="sm" />
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Ambient orbs */}
        <motion.div
          className="absolute top-1/3 right-0 w-96 h-96 rounded-full blur-[120px] z-0 bg-accent"
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-[100px] z-0 bg-accent"
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0 hidden lg:block">
          <div className="w-full h-full flex items-center justify-center bg-card/30">
            <div className="text-center text-muted-foreground/20 text-xs uppercase tracking-wider">[Foto do Palestrante]</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div initial="hidden" animate="visible" variants={staggerSlow} className="max-w-2xl">
            <SectionLabel>Evento Presencial · Alphaville, SP · 22 e 23 de Julho</SectionLabel>

            {/* H1 com WordRotate — a palavra-chave gira */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-6 text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              O único evento que vai te ensinar a{" "}
              <WordRotate
                words={["escalar.", "lançar.", "lucrar.", "crescer."]}
                className="text-accent"
              />
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
              2 dias presenciais para infoprodutores, estrategistas e gestores de tráfego que querem sair do lançamento que oscila e aplicar o sistema que já gerou mais de R$300 milhões em operações reais.
            </motion.p>

            <motion.div variants={scaleIn}>
              <ShimmerCTA href="#ingressos" label="Quero meu ingresso" size="lg" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE 1 ── */}
      <Marquee text="Código da Escala · Alphaville · 22 e 23 de Julho de 2026" />

      {/* ── "ISSO NÃO É..." ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerFast} className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <motion.div
                  key={n}
                  variants={scaleIn}
                  whileHover={{ scale: 1.04, borderColor: "rgba(255,68,68,0.4)" }}
                  transition={{ duration: 0.3 }}
                  className="aspect-square rounded-xl flex items-center justify-center text-muted-foreground/30 text-xs bg-card border border-border"
                >
                  [Foto {n}]
                </motion.div>
              ))}
            </motion.div>
            <div>
              <SectionLabel>O que é o Código da Escala?</SectionLabel>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Isso não é mais um<br />
                <span className="text-accent">evento de marketing digital.</span>
              </motion.h2>
              <motion.div variants={fadeLeft} className="w-12 h-1 rounded-full my-4 bg-accent/60" />
              <motion.div variants={staggerFast} className="space-y-4 text-muted-foreground text-base leading-relaxed">
                {[
                  'Aqui não tem aula de "diquinha" de Instagram, hack de algoritmo ou promessa de fórmula mágica. O Código da Escala é o bastidor real de operações que já geraram mais de R$300 milhões — com o gerenciador de anúncios aberto e os números reais na tela, sem filtro.',
                  "Você vai sair de lá sabendo exatamente como construir um negócio que fatura com previsibilidade, antes mesmo do lançamento começar. Com comercial trabalhando todos os dias da semana, não só no carrinho aberto.",
                  "É pra você que já faz lançamento, mas vive de mês bom e mês ruim sem entender por quê. Que tem uma lista de leads parada e não sabe o que fazer com ela. Que sente que o negócio só funciona enquanto você está na frente da câmera.",
                ].map((p, i) => <motion.p key={i} variants={fadeUp}>{p}</motion.p>)}
              </motion.div>
              <motion.div variants={scaleIn} className="mt-8">
                <ShimmerCTA href="#ingressos" label="Quero participar" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE 2 (reverso) ── */}
      <Marquee text="Luiz Filho · Mateus Ribeiro · 128+ Lançamentos · R$300M Gerados" reverse />

      {/* ── QUANDO E ONDE ── */}
      <section className="py-12 px-6 bg-secondary/10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={scaleIn} className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-card/60" />
            <div className="absolute inset-0 bg-card/30 flex items-center justify-center text-muted-foreground/20 text-sm">[Foto do local do evento]</div>
            <div className="absolute inset-0 bg-gradient-to-r from-card/95 via-card/70 to-card/30" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-accent/60 bg-card flex items-center justify-center z-10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
                <path d="M8.5 8.5l2.5 5 2.5-5-5 2.5z" fill="currentColor" stroke="none" />
              </svg>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-10 pt-12">
              <div className="space-y-5">
                <motion.p variants={fadeLeft} className="text-[11px] font-bold text-accent uppercase tracking-[0.3em]">Quando e onde vai acontecer?</motion.p>
                <motion.div variants={fadeLeft} className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>22 e 23 de Julho de 2026</p>
                    <p className="text-sm text-muted-foreground">Quarta e quinta-feira · 09h às 18h</p>
                  </div>
                </motion.div>
                <motion.div variants={fadeLeft} className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <p className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Alphaville — São Paulo / SP</p>
                </motion.div>
              </div>
              <motion.div variants={scaleIn} className="flex-shrink-0">
                <ShimmerCTA href="#ingressos" label="QUERO MEU INGRESSO" size="md" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PROGRAMAÇÃO ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="text-center mb-14">
            <SectionLabel>Programação</SectionLabel>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              O que vai acontecer<br /><span className="text-accent">nos dois dias.</span>
            </motion.h2>
          </motion.div>

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
            <motion.div key={dia.label} initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="mb-10">
              <motion.div variants={fadeLeft} className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-accent">{di + 1}</div>
                <div>
                  <p className="font-bold text-lg uppercase tracking-widest text-foreground leading-none" style={{ fontFamily: "var(--font-display)" }}>{dia.label}</p>
                  <p className="text-muted-foreground text-xs">{dia.date}</p>
                </div>
                <div className="flex-1 h-px bg-border" />
              </motion.div>

              <div className="pl-11 relative">
                <div className="absolute left-[1.625rem] top-0 bottom-0 w-px bg-border/50" />
                <div className="space-y-3">
                  {dia.sessions.map((s, si) => (
                    <motion.div
                      key={s.time}
                      variants={fadeLeft}
                      custom={si}
                      whileHover={{ x: 4, borderColor: "rgba(255,68,68,0.4)" }}
                      transition={{ duration: 0.2 }}
                      className="relative flex items-start gap-4 p-4 rounded-xl bg-card/70 border border-border backdrop-blur-sm"
                    >
                      <div className="absolute -left-[1.625rem] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent border-2 border-background" />
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
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PALESTRANTES com NumberTicker ── */}
      <section className="py-24 px-6 bg-secondary/10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="text-center mb-14">
            <SectionLabel>Quem vai falar</SectionLabel>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Conheça os <span className="text-accent">palestrantes.</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerFast} className="flex flex-col sm:flex-row gap-8 max-w-3xl mx-auto items-start">
            {/* Luiz Filho */}
            <motion.div variants={scaleIn} whileHover={{ y: -6 }} transition={{ duration: 0.3, ease }} className="flex-1 text-center">
              <motion.div
                whileHover={{ borderColor: "rgba(255,68,68,0.5)", boxShadow: "0 0 30px rgba(255,68,68,0.15)" }}
                transition={{ duration: 0.3 }}
                className="aspect-square rounded-2xl mb-5 flex items-center justify-center text-muted-foreground/20 text-xs bg-card border border-border max-w-[240px] mx-auto"
              >
                [Foto Luiz Filho]
              </motion.div>
              <p className="font-bold text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>Luiz Filho</p>
              <p className="text-accent text-xs font-semibold uppercase tracking-wider mt-0.5 mb-4">Estrategista de Lançamentos</p>
              {/* NumberTicker para as estatísticas */}
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    <NumberTicker value={128} suffix="+" />
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Lançamentos</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    R$<NumberTicker value={300} suffix="M+" />
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Gerados</p>
                </div>
              </div>
            </motion.div>

            {/* Mateus Ribeiro — offset */}
            <motion.div variants={scaleIn} whileHover={{ y: -6 }} transition={{ duration: 0.3, ease }} className="flex-1 text-center sm:mt-12">
              <motion.div
                whileHover={{ borderColor: "rgba(255,68,68,0.5)", boxShadow: "0 0 30px rgba(255,68,68,0.15)" }}
                transition={{ duration: 0.3 }}
                className="aspect-square rounded-2xl mb-5 flex items-center justify-center text-muted-foreground/20 text-xs bg-card border border-border max-w-[240px] mx-auto"
              >
                [Foto Mateus Ribeiro]
              </motion.div>
              <p className="font-bold text-foreground text-lg" style={{ fontFamily: "var(--font-display)" }}>Mateus Ribeiro</p>
              <p className="text-accent text-xs font-semibold uppercase tracking-wider mt-0.5 mb-4">Especialista em Funis de Quiz</p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    R$<NumberTicker value={13} suffix=",4M" />
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Em vendas</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    R$<NumberTicker value={47} />
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Produto único</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── INGRESSOS ── */}
      <section id="ingressos" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
        <motion.div
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[150px] bg-accent"
          animate={{ opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerSlow} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-foreground uppercase" style={{ fontFamily: "var(--font-display)" }}>
              VAGAS ABERTAS
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base mt-3">Vagas limitadas. Garanta agora antes que acabem.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={staggerFast} className="grid md:grid-cols-2 gap-8 items-start">
            <TicketCard
              tier="PADRÃO"
              installments={12}
              installmentPrice="R$ 41,42"
              cashPrice="R$ 497,00"
              features={["Acesso presencial aos 2 dias do evento", "Material de apoio impresso", "Coffee break incluso", "Acesso à gravação completa do evento por 30 dias"]}
              href="#"
            />
            <TicketCard
              tier="DIAMOND"
              subtitle="APROVEITE MUITO MAIS A NOSSA IMERSÃO."
              installments={12}
              installmentPrice="R$ 208,08"
              cashPrice="R$ 2.497,00"
              features={["Acesso presencial aos 2 dias do evento", "Material de apoio impresso", "Coffee break incluso", "Acesso à gravação completa do evento por 30 dias", "Acesso privilegiado às melhores cadeiras", "Dúvidas respondidas ao vivo", "Jantar exclusivo na casa do Luiz Filho"]}
              href="#"
              highlighted
            />
          </motion.div>
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
        <p className="text-muted-foreground/40 text-xs">© 2026 Código da Escala. Todos os direitos reservados.</p>
      </footer>

      <ExitIntentPopup />
    </div>
  );
}
