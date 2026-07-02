import { useState, useRef, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Check, X, MapPin, Calendar, Users } from "lucide-react";

// ── Design tokens — igual ao CodigoEscalaV3 ───────────────────────────────────
const T = {
  bg:          "#07070F",
  white:       "#FAFAFA",
  accent:      "#E31B23",
  accentLight: "#FF4444",
  accentDim:   "#8B0E13",
  border:      "rgba(227,27,35,0.28)",
  surface:     "rgba(255,255,255,0.04)",
  muted:       "rgba(250,250,250,0.55)",
  veryMuted:   "rgba(250,250,250,0.38)",
  ctaGrad:     "linear-gradient(135deg,#E31B23 0%,#8B0E13 100%)",
  gold:        "#C8A96E",
  goldMid:     "rgba(200,169,110,0.25)",
  goldDim:     "rgba(200,169,110,0.1)",
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";
const ease  = [0.22, 1, 0.36, 1] as const;
const vp    = { once: true, margin: "-60px 0px" };

const TICKET_DIAMOND = "https://pay.onprofit.com.br/g0D1rHuQ?off=uJEn7P";
const REJECTION_URL  = "#"; // TODO: link da página de obrigado do Padrão

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

function useLenis() {
  useEffect(() => {
    if (window.innerWidth < 640) return;
    let rafId: number;
    let lenisInstance: { raf: (t: number) => void; destroy: () => void } | null = null;
    import("lenis").then(({ default: Lenis }) => {
      lenisInstance = new Lenis({ lerp: 0.08, smoothWheel: true });
      const raf = (time: number) => { lenisInstance!.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
    });
    return () => { lenisInstance?.destroy(); cancelAnimationFrame(rafId); };
  }, []);
}

function useInViewOnce(ref: React.RefObject<Element>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return inView;
}

// ── VSL Placeholder ───────────────────────────────────────────────────────────
function VSLPlaceholder() {
  return (
    <div style={{ position: "relative", borderRadius: 4, overflow: "hidden",
      border: `1px solid ${T.border}`, height: "clamp(160px, 26vh, 230px)",
      background: "radial-gradient(ellipse at 50% 60%, rgba(227,27,35,0.07) 0%, rgba(7,7,15,0.0) 70%), #0D0D18",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      {/* Grid sutil */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(250,250,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px" }} />
      <svg width={48} height={48} viewBox="0 0 24 24" fill="none"
        stroke="rgba(250,250,250,0.18)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 10l4.553-2.069A1 1 0 0121 8.862v6.276a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
      <p style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
        color: "rgba(250,250,250,0.22)", textTransform: "uppercase" }}>
        VSL em breve
      </p>
    </div>
  );
}

// ── CTA Button ────────────────────────────────────────────────────────────────
function CTA({ href, label, fullWidth = false, gold = false }: {
  href: string; label: string; fullWidth?: boolean; gold?: boolean;
}) {
  const bg     = gold ? "linear-gradient(135deg,#C8A96E 0%,#8B6A2F 100%)" : T.ctaGrad;
  const shadow = gold ? "0 18px 52px rgba(200,169,110,0.35)" : "0 18px 52px rgba(227,27,35,0.42)";
  return (
    <motion.a href={href}
      whileHover={{ y: -3, boxShadow: shadow }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22 }}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "18px 48px", background: bg, color: gold ? "#07070F" : T.white,
        fontFamily: INTER, fontSize: 14, fontWeight: 800, letterSpacing: "0.17em",
        textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
        position: "relative", overflow: "hidden",
        width: fullWidth ? "100%" : undefined, whiteSpace: "nowrap" }}>
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%)", pointerEvents: "none" }} />
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      <svg style={{ position: "relative", zIndex: 1, flexShrink: 0 }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    </motion.a>
  );
}

// ── CheckRow ──────────────────────────────────────────────────────────────────
function CheckRow({ label, included, gold = false }: { label: string; included: boolean; gold?: boolean }) {
  const color = included ? (gold ? T.gold : "#4ADE80") : "rgba(250,250,250,0.25)";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
        background: included ? (gold ? T.goldMid : "rgba(74,222,128,0.15)") : "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {included
          ? <Check size={11} color={color} strokeWidth={3} />
          : <X size={10} color="rgba(250,250,250,0.2)" strokeWidth={2.5} />}
      </div>
      <p style={{ fontFamily: INTER, fontSize: 14, color: included ? T.white : "rgba(250,250,250,0.3)",
        lineHeight: 1.5, textDecoration: included ? "none" : "line-through" }}>
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function UpsellDiamond() {
  useLenis();
  const isMobile = useIsMobile();

  const offerRef   = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const offerIn    = useInViewOnce(offerRef as React.RefObject<Element>);
  const compareIn  = useInViewOnce(compareRef as React.RefObject<Element>);
  const galleryIn  = useInViewOnce(galleryRef as React.RefObject<Element>);

  function scrollToOffer() {
    offerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const DIAMOND_EXTRAS = [
    "Jantar exclusivo na casa do Luiz, em Alphaville",
    "Acesso às melhores cadeiras do evento",
    "Prioridade nas perguntas ao vivo",
    "Contato direto e conversa cara a cara com o Luiz",
    "Networking com quem já está gerando resultado de verdade",
  ];

  const GALLERY = [
    { src: "/assets/jantar_ambiente.webp", alt: "Chegada dos convidados na casa do Luiz", label: "O ambiente" },
    { src: "/assets/jantar_conversa.webp", alt: "Participantes trocando experiência à mesa", label: "As conexões" },
    { src: "/assets/jantar_momento.webp",  alt: "Momento do jantar na edição anterior", label: "Os momentos" },
  ];

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>

        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          img, video { display: block; max-width: 100%; }
          a { color: inherit; text-decoration: none; }
          button { border: none; background: none; cursor: pointer; font: inherit; }
        `}</style>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "48px 24px 32px" : "40px 24px 28px", textAlign: "center" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>

            {/* Confirmed badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 99,
                background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                marginBottom: 14 }}>
              <Check size={13} color="#4ADE80" strokeWidth={3} />
              <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700,
                color: "#4ADE80", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Compra confirmada! Ingresso Padrão garantido.
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
              style={{ fontFamily: BEBAS,
                fontSize: isMobile ? "clamp(60px,18vw,84px)" : "clamp(64px,8vw,96px)",
                letterSpacing: "0.04em", lineHeight: 0.9,
                color: T.accentLight, marginBottom: 14 }}>
              ESPERA!
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.2 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 17, fontWeight: 500,
                color: T.white, lineHeight: 1.5,
                maxWidth: 580, margin: "0 auto 6px" }}>
              Antes de acessar seu Ingresso Padrão, existe uma experiência
              que não vai chegar para todo mundo.
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.28 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 13 : 14, color: T.muted,
                lineHeight: 1.6, maxWidth: 520, margin: "0 auto 18px" }}>
              Veja abaixo o que está incluído — e decida se é pra você.
            </motion.p>

            {/* VSL Placeholder */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.35 }}
              style={{ marginBottom: 18 }}>
              <VSLPlaceholder />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.55 }}>
              <CTA href={TICKET_DIAMOND} label="Quero o Ingresso Diamond" gold />
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              style={{ marginTop: 14, fontFamily: INTER, fontSize: 12,
                color: T.veryMuted, cursor: "pointer" }}
              onClick={scrollToOffer}>
              ↓ Entenda o que está incluído antes de decidir
            </motion.p>
          </div>
        </section>

        {/* ── O JANTAR ──────────────────────────────────────────────── */}
        <section ref={offerRef} style={{ padding: isMobile ? "64px 24px" : "96px 32px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>

            <motion.div initial="hidden" animate={offerIn ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>

              {/* Eyebrow */}
              <motion.div variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 24 }}>
                <span style={{ width: 28, height: 1.5, background: T.gold, flexShrink: 0 }} />
                <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: T.gold }}>Ingresso Diamond</span>
                <span style={{ width: 28, height: 1.5, background: T.gold, flexShrink: 0 }} />
              </motion.div>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(42px,12vw,64px)" : "clamp(52px,5vw,84px)",
                  letterSpacing: "0.02em", lineHeight: 0.95,
                  textAlign: "center", color: T.white, marginBottom: 52 }}>
                UM JANTAR QUE<br />
                <span style={{ color: T.gold }}>NINGUÉM MAIS VAI TER.</span>
              </motion.h2>

              {/* Foto da mesa + copy */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
                style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 48, alignItems: "start" }}>

                {/* Foto da mesa posta */}
                <div style={{ position: "relative", borderRadius: 6, overflow: "hidden",
                  border: `1px solid ${T.goldMid}`,
                  boxShadow: "0 0 80px rgba(200,169,110,0.12)" }}>
                  <img src="/assets/jantar_mesa.webp" loading="lazy"
                    alt="Mesa posta para o jantar na casa do Luiz"
                    style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 55%, rgba(7,7,15,0.75) 100%)" }} />
                  <div style={{ position: "absolute", bottom: 16, left: 18, right: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <MapPin size={12} color={T.gold} />
                      <span style={{ fontFamily: INTER, fontSize: 11, color: T.gold,
                        letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                        Alphaville, São Paulo
                      </span>
                    </div>
                    <p style={{ fontFamily: BEBAS, fontSize: 20, letterSpacing: "0.08em", color: T.white }}>
                      NA CASA DO LUIZ
                    </p>
                  </div>
                </div>

                {/* Copy + Quote */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <p style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted, lineHeight: 1.8 }}>
                    Dois dias imersos no evento e um jantar exclusivo na casa do Luiz, em Alphaville.
                    Uma noite reservada para sentar na mesa com ele, tirar suas dúvidas cara a cara
                    e trocar ideia com a turma que já está no campo de batalha gerando resultado de verdade.
                  </p>
                  <p style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted, lineHeight: 1.8 }}>
                    É o momento de fazer o networking que você não faz em lugar nenhum, em um ambiente
                    de proximidade total para quem decidiu parar de brincar e quer escalar o negócio
                    com quem opera o novo jogo todo santo dia.
                  </p>

                  {/* Quote do Luiz */}
                  <div style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 20,
                    background: T.goldDim, padding: "18px 20px",
                    borderRadius: "0 4px 4px 0" }}>
                    <p style={{ fontFamily: INTER, fontSize: 14, fontStyle: "italic",
                      color: "rgba(250,250,250,0.8)", lineHeight: 1.7, marginBottom: 10 }}>
                      "Eu passo de mesa em mesa para trocar experiência, mostrar visão, trazer o que fazer.
                      É um ambiente mais íntimo — fica melhor pra gente poder conectar."
                    </p>
                    <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700,
                      color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      — Luiz Filho, sobre o jantar
                    </p>
                  </div>

                  {/* Mini stats */}
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={15} color={T.gold} />
                      <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600,
                        color: "rgba(250,250,250,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Vagas ultralimitadas
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={15} color={T.gold} />
                      <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600,
                        color: "rgba(250,250,250,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        22 de Julho, 2026
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── GALERIA — COMO FOI NA EDIÇÃO ANTERIOR ─────────────────── */}
        <section ref={galleryRef} style={{ padding: isMobile ? "0 24px 64px" : "0 32px 80px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>

            <motion.div initial="hidden" animate={galleryIn ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

              <motion.p variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: T.muted, textAlign: "center", marginBottom: 24 }}>
                Como foi na edição anterior
              </motion.p>

              <div style={{ display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 12 }}>
                {GALLERY.map((item, i) => (
                  <motion.div key={i}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: i * 0.08 } } }}
                    style={{ position: "relative", borderRadius: 4, overflow: "hidden",
                      border: `1px solid ${T.border}` }}>
                    <img src={item.src} alt={item.alt} loading="lazy"
                      style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, transparent 50%, rgba(7,7,15,0.75) 100%)" }} />
                    <p style={{ position: "absolute", bottom: 12, left: 14,
                      fontFamily: INTER, fontSize: 11, fontWeight: 600,
                      color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {item.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── O QUE ESTÁ INCLUÍDO ───────────────────────────────────── */}
        <section ref={compareRef} style={{ padding: isMobile ? "64px 24px" : "80px 32px",
          background: "rgba(255,255,255,0.02)" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            <motion.div initial="hidden" animate={compareIn ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(36px,10vw,56px)" : "clamp(44px,4vw,68px)",
                  letterSpacing: "0.02em", textAlign: "center", color: T.white, marginBottom: 40 }}>
                O QUE ESTÁ INCLUÍDO NO <span style={{ color: T.gold }}>DIAMOND</span>
              </motion.h2>

              <motion.div variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                style={{ border: `1px solid ${T.goldMid}`, borderRadius: 6,
                  background: T.goldDim, overflow: "hidden",
                  boxShadow: "0 0 60px rgba(200,169,110,0.1)" }}>
                <div style={{ padding: "20px 28px", borderBottom: `1px solid ${T.goldMid}`,
                  background: "linear-gradient(135deg, rgba(200,169,110,0.15) 0%, transparent 100%)" }}>
                  <p style={{ fontFamily: BEBAS, fontSize: 22, letterSpacing: "0.1em", color: T.gold }}>
                    INGRESSO DIAMOND
                  </p>
                </div>
                <div style={{ padding: "20px 28px" }}>
                  {DIAMOND_EXTRAS.map((item, i) => <CheckRow key={i} label={item} included gold />)}
                </div>
                <div style={{ padding: "0 28px 28px", textAlign: "center" }}>
                  <p style={{ fontFamily: BEBAS, fontSize: 36, color: T.gold, letterSpacing: "0.02em" }}>R$ 2.000,00</p>
                  <p style={{ fontFamily: INTER, fontSize: 12, color: T.gold, opacity: 0.6 }}>ou 12x R$ 166,67</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── EXCLUSIVIDADE + CTA ───────────────────────────────────── */}
        <section style={{ padding: isMobile ? "64px 24px" : "96px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>

              <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } } }}
                style={{ display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "10px 22px", borderRadius: 4,
                  background: T.goldDim, border: `1px solid ${T.goldMid}`, marginBottom: 36 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold,
                  boxShadow: `0 0 8px ${T.gold}` }} />
                <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700,
                  color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Experiência exclusiva · vagas contadas
                </span>
              </motion.div>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(40px,12vw,64px)" : "clamp(52px,5vw,80px)",
                  letterSpacing: "0.02em", lineHeight: 0.95, color: T.white, marginBottom: 20 }}>
                NÃO É PARA<br />
                <span style={{ color: T.gold }}>TODO MUNDO.</span>
              </motion.h2>

              <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 17, color: T.muted,
                  lineHeight: 1.7, marginBottom: 48 }}>
                O jantar tem vagas contadas para garantir que todo mundo que esteja na mesa
                tenha atenção real. Não é um coquetel de networking genérico — é uma noite
                em ambiente íntimo, para quem veio para jogar de verdade.
              </motion.p>

              {/* Preço */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                style={{ padding: "32px 24px", border: `1px solid ${T.goldMid}`,
                  borderRadius: 6, background: T.goldDim, marginBottom: 40 }}>
                <p style={{ fontFamily: BEBAS, fontSize: isMobile ? 52 : 72, letterSpacing: "0.02em",
                  color: T.white, lineHeight: 1, marginBottom: 8 }}>
                  <span style={{ fontSize: "0.45em", verticalAlign: "top", marginTop: 8,
                    display: "inline-block", color: T.gold }}>R$</span>
                  2.000
                  <span style={{ fontSize: "0.35em", color: T.gold }}>,00</span>
                </p>
                <p style={{ fontFamily: INTER, fontSize: 14, color: T.gold, opacity: 0.7 }}>
                  ou 12x R$ 166,67
                </p>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}
                style={{ marginBottom: 20 }}>
                <CTA href={TICKET_DIAMOND} label="Sim! Quero o Ingresso Diamond" gold fullWidth />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }}>
                <a href={REJECTION_URL}
                  style={{ fontFamily: INTER, fontSize: 12, color: T.veryMuted,
                    textDecoration: "underline", textUnderlineOffset: 3,
                    letterSpacing: "0.04em", cursor: "pointer" }}>
                  Não, obrigado. Prefiro ficar apenas com o meu Ingresso Padrão.
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── LOCAL + DATA ──────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "0 24px 64px" : "0 32px 96px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
              style={{ position: "relative", borderRadius: 6, overflow: "hidden",
                border: `1px solid ${T.border}` }}>

              <img src="/assets/alphaville.webp" alt="Alphaville, São Paulo" loading="lazy"
                style={{ width: "100%", aspectRatio: isMobile ? "4/3" : "16/5",
                  objectFit: "cover", display: "block" }} />

              <div style={{ position: "absolute", inset: 0,
                background: "linear-gradient(to right, rgba(7,7,15,0.9) 0%, rgba(7,7,15,0.55) 50%, rgba(7,7,15,0.2) 100%)" }} />

              <div style={{ position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: isMobile ? "24px" : "40px 56px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <MapPin size={14} color={T.accentLight} />
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700,
                    color: T.accentLight, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Localização
                  </span>
                </div>
                <p style={{ fontFamily: BEBAS,
                  fontSize: isMobile ? "clamp(28px,9vw,40px)" : "clamp(36px,3.5vw,56px)",
                  letterSpacing: "0.04em", color: T.white, lineHeight: 1.05, marginBottom: 8 }}>
                  ALPHAVILLE, SÃO PAULO
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={13} color={T.muted} />
                  <p style={{ fontFamily: INTER, fontSize: 14, color: T.muted }}>
                    22 e 23 de Julho de 2026
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "40px 24px 80px" : "40px 32px 100px",
          textAlign: "center", borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>

            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

              <motion.p variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                style={{ fontFamily: BEBAS,
                  fontSize: isMobile ? "clamp(32px,9vw,48px)" : "clamp(40px,4vw,60px)",
                  letterSpacing: "0.04em", color: T.white, marginBottom: 12 }}>
                PARA QUEM ESTÁ PRONTO.
              </motion.p>

              <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                style={{ fontFamily: INTER, fontSize: 15, color: T.muted, lineHeight: 1.7, marginBottom: 36 }}>
                O jantar não é para quem ainda está em cima do muro.
                É para quem entendeu o jogo e quer jogar de verdade.
              </motion.p>

              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                style={{ marginBottom: 18 }}>
                <CTA href={TICKET_DIAMOND} label="Quero o Ingresso Diamond" gold fullWidth />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }}>
                <a href={REJECTION_URL}
                  style={{ fontFamily: INTER, fontSize: 12, color: T.veryMuted,
                    textDecoration: "underline", textUnderlineOffset: 3, letterSpacing: "0.04em" }}>
                  Não, obrigado. Quero apenas o meu Ingresso Padrão.
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────── */}
        <footer style={{ padding: "20px 24px", textAlign: "center",
          borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <p style={{ fontFamily: INTER, fontSize: 11, color: T.veryMuted }}>
            © {new Date().getFullYear()} Código da Escala · Luiz Filho. Todos os direitos reservados.
          </p>
        </footer>

      </div>
    </MotionConfig>
  );
}
