import { useState, useRef, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Check, X, MapPin, Calendar, Users, Play, Volume2, VolumeX } from "lucide-react";

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
const REJECTION_URL  = "#"; // TODO: substituir pelo link da página de obrigado do Padrão
const VSL_SRC        = "/assets/vsl.mp4"; // TODO: substituir pela VSL específica do upsell

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

// ── VSL ───────────────────────────────────────────────────────────────────────
function VSLVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
  }, []);

  function handlePlay() {
    const v = videoRef.current; if (!v) return;
    v.muted = false; v.currentTime = 0;
    v.play().catch(() => {});
    setPlaying(true); setMuted(false);
  }

  function handleMuteToggle(e: React.MouseEvent) {
    e.stopPropagation();
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  }

  return (
    <div
      onClick={!playing ? handlePlay : undefined}
      style={{ position: "relative", borderRadius: 4, overflow: "hidden",
        border: `1px solid ${T.border}`, cursor: playing ? "default" : "pointer",
        boxShadow: "0 0 60px rgba(227,27,35,0.08)" }}
    >
      <video
        ref={videoRef}
        src={VSL_SRC}
        playsInline
        preload="none"
        poster="/assets/vsl-poster.webp"
        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
      />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(7,7,15,0.5)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.ctaGrad,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(227,27,35,0.4)" }}>
            <Play size={28} fill={T.white} color={T.white} style={{ marginLeft: 4 }} />
          </div>
        </div>
      )}
      {playing && (
        <button
          aria-label={muted ? "Ativar som" : "Silenciar"}
          onClick={handleMuteToggle}
          style={{ position: "absolute", bottom: 14, right: 14, zIndex: 10,
            width: 36, height: 36, borderRadius: 4,
            border: `1px solid rgba(227,27,35,0.4)`,
            background: "rgba(227,27,35,0.15)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.accentLight }}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      )}
    </div>
  );
}

// ── CTA Button ────────────────────────────────────────────────────────────────
function CTA({ href, label, fullWidth = false, gold = false }: {
  href: string; label: string; fullWidth?: boolean; gold?: boolean;
}) {
  const bg = gold
    ? "linear-gradient(135deg,#C8A96E 0%,#8B6A2F 100%)"
    : T.ctaGrad;
  const shadow = gold
    ? "0 18px 52px rgba(200,169,110,0.35)"
    : "0 18px 52px rgba(227,27,35,0.42)";

  return (
    <motion.a
      href={href}
      whileHover={{ y: -3, boxShadow: shadow }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22 }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "18px 48px", background: bg, color: gold ? "#07070F" : T.white,
        fontFamily: INTER, fontSize: 14, fontWeight: 800,
        letterSpacing: "0.17em", textTransform: "uppercase",
        textDecoration: "none", cursor: "pointer",
        position: "relative", overflow: "hidden",
        width: fullWidth ? "100%" : undefined,
        whiteSpace: "nowrap",
      }}
    >
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
  const offerIn    = useInViewOnce(offerRef as React.RefObject<Element>);
  const compareIn  = useInViewOnce(compareRef as React.RefObject<Element>);

  function scrollToOffer() {
    offerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const PADRAO_ITEMS = [
    "Acesso completo aos 2 dias de evento presencial",
    "Todos os palestrantes e sessões ao vivo",
    "Networking com os participantes",
  ];

  const DIAMOND_EXTRAS = [
    "Jantar exclusivo na casa do Luiz, em Alphaville",
    "Acesso às melhores cadeiras do evento",
    "Prioridade nas perguntas ao vivo",
    "Contato direto e conversa cara a cara com o Luiz",
    "Networking com quem já está gerando resultado de verdade",
  ];

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>

        {/* ── CSS global ────────────────────────────────────────────── */}
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          img, video { display: block; max-width: 100%; }
          a { color: inherit; text-decoration: none; }
          button { border: none; background: none; cursor: pointer; font: inherit; }
        `}</style>

        {/* ── STICKY URGENCY BAR ────────────────────────────────────── */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: T.ctaGrad, padding: "10px 20px", textAlign: "center" }}>
          <p style={{ fontFamily: INTER, fontSize: isMobile ? 11 : 13, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase", color: T.white }}>
            ⚡ OFERTA EXCLUSIVA · DISPONÍVEL APENAS AGORA · NÃO ESTARÁ DISPONÍVEL DEPOIS
          </p>
        </div>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section style={{ paddingTop: 44, padding: "80px 24px 64px", textAlign: "center" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>

            {/* Confirmed badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 18px", borderRadius: 99,
                background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                marginBottom: 28 }}>
              <Check size={14} color="#4ADE80" strokeWidth={3} />
              <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700,
                color: "#4ADE80", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Compra confirmada! Ingresso Padrão garantido.
              </span>
            </motion.div>

            {/* ESPERA! */}
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
              style={{ fontFamily: BEBAS,
                fontSize: isMobile ? "clamp(72px,22vw,100px)" : "clamp(80px,12vw,130px)",
                letterSpacing: "0.04em", lineHeight: 0.9,
                color: T.accentLight, marginBottom: 20 }}>
              ESPERA!
            </motion.h1>

            {/* Hook */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.2 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 16 : 19, fontWeight: 500,
                color: T.white, lineHeight: 1.55, marginBottom: 12,
                maxWidth: 620, margin: "0 auto 12px" }}>
              Antes de acessar seu Ingresso Padrão, existe uma experiência
              que não vai chegar para todo mundo.
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.28 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 14 : 16, color: T.muted,
                lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}>
              Assista o vídeo abaixo para entender o que está em jogo.
            </motion.p>

            {/* VSL */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.38 }}
              style={{ marginBottom: 36 }}>
              <VSLVideo />
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.55 }}>
              <CTA href={TICKET_DIAMOND} label="Quero fazer o upgrade para Diamond" gold />
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              style={{ marginTop: 20, fontFamily: INTER, fontSize: 12,
                color: T.veryMuted, cursor: "pointer" }}
              onClick={scrollToOffer}>
              ↓ Entenda o que está incluído antes de decidir
            </motion.p>
          </div>
        </section>

        {/* ── O QUE É O DIAMOND ─────────────────────────────────────── */}
        <section ref={offerRef} style={{ padding: isMobile ? "64px 24px" : "96px 32px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>

            <motion.div
              initial="hidden" animate={offerIn ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>

              {/* Eyebrow */}
              <motion.div variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 24 }}>
                <span style={{ width: 28, height: 1.5, background: T.gold, flexShrink: 0 }} />
                <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: T.gold }}>
                  Ingresso Diamond
                </span>
                <span style={{ width: 28, height: 1.5, background: T.gold, flexShrink: 0 }} />
              </motion.div>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(42px,12vw,64px)" : "clamp(52px,5vw,84px)",
                  letterSpacing: "0.02em", lineHeight: 0.95,
                  textAlign: "center", color: T.white, marginBottom: 48 }}>
                UM JANTAR QUE<br />
                <span style={{ color: T.gold }}>NINGUÉM MAIS VAI TER.</span>
              </motion.h2>

              {/* Photo + copy */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
                style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 40, alignItems: "center" }}>

                {/* Photo */}
                <div style={{ position: "relative", borderRadius: 6, overflow: "hidden",
                  border: `1px solid ${T.goldMid}`,
                  boxShadow: "0 0 80px rgba(200,169,110,0.12)" }}>
                  <img
                    src="/assets/jantar.webp"
                    alt="Jantar exclusivo na casa do Luiz"
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 40%, rgba(7,7,15,0.7) 100%)" }} />
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

                {/* Copy */}
                <div>
                  <p style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted,
                    lineHeight: 1.8, marginBottom: 28 }}>
                    Dois dias imersos no evento e um jantar exclusivo na casa do Luiz, em Alphaville.
                    Uma noite reservada para sentar na mesa com ele, tirar suas dúvidas cara a cara
                    e trocar ideia com a turma que já está no campo de batalha gerando resultado de verdade.
                  </p>
                  <p style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted,
                    lineHeight: 1.8, marginBottom: 32 }}>
                    É o momento de fazer o networking que você não faz em lugar nenhum, em um ambiente
                    de proximidade total para quem decidiu parar de brincar e quer escalar o negócio
                    com quem opera o novo jogo todo santo dia.
                  </p>

                  {/* Mini stats */}
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    {[
                      { icon: <Users size={15} color={T.gold} />, label: "Vagas ultralimitadas" },
                      { icon: <Calendar size={15} color={T.gold} />, label: "22 de Julho, 2026" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {item.icon}
                        <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600,
                          color: "rgba(250,250,250,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── COMPARAÇÃO ────────────────────────────────────────────── */}
        <section ref={compareRef} style={{ padding: isMobile ? "64px 24px" : "80px 32px",
          background: "rgba(255,255,255,0.02)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            <motion.div
              initial="hidden" animate={compareIn ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

              <motion.p variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}
                style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: T.muted, textAlign: "center", marginBottom: 16 }}>
                Compare os ingressos
              </motion.p>

              <motion.h2 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(36px,10vw,56px)" : "clamp(44px,4vw,68px)",
                  letterSpacing: "0.02em", textAlign: "center",
                  color: T.white, marginBottom: 48 }}>
                O QUE MUDA COM O <span style={{ color: T.gold }}>DIAMOND</span>
              </motion.h2>

              <motion.div variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>

                {/* Padrão */}
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 6,
                  background: T.surface, overflow: "hidden" }}>
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
                    textAlign: "center" }}>
                    <p style={{ fontFamily: BEBAS, fontSize: 24, letterSpacing: "0.1em", color: T.muted }}>
                      INGRESSO PADRÃO
                    </p>
                    <p style={{ fontFamily: INTER, fontSize: 11, color: T.veryMuted,
                      letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>
                      Já garantido ✓
                    </p>
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    {PADRAO_ITEMS.map((item, i) => (
                      <CheckRow key={i} label={item} included />
                    ))}
                    {DIAMOND_EXTRAS.map((item, i) => (
                      <CheckRow key={i} label={item} included={false} />
                    ))}
                  </div>
                  <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
                    <p style={{ fontFamily: BEBAS, fontSize: 36, color: T.white, letterSpacing: "0.02em" }}>
                      R$ 497,00
                    </p>
                    <p style={{ fontFamily: INTER, fontSize: 12, color: T.veryMuted }}>
                      ou 12x R$ 41,42
                    </p>
                  </div>
                </div>

                {/* Diamond */}
                <div style={{ border: `1px solid ${T.goldMid}`, borderRadius: 6,
                  background: T.goldDim, overflow: "hidden",
                  boxShadow: "0 0 60px rgba(200,169,110,0.1)" }}>
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.goldMid}`,
                    textAlign: "center",
                    background: "linear-gradient(135deg, rgba(200,169,110,0.15) 0%, transparent 100%)" }}>
                    <p style={{ fontFamily: BEBAS, fontSize: 24, letterSpacing: "0.1em", color: T.gold }}>
                      INGRESSO DIAMOND
                    </p>
                    <p style={{ fontFamily: INTER, fontSize: 11, color: T.gold,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      fontWeight: 600, marginTop: 4, opacity: 0.7 }}>
                      Tudo do Padrão + a experiência exclusiva
                    </p>
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    {PADRAO_ITEMS.map((item, i) => (
                      <CheckRow key={i} label={item} included gold />
                    ))}
                    {DIAMOND_EXTRAS.map((item, i) => (
                      <CheckRow key={i} label={item} included gold />
                    ))}
                  </div>
                  <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
                    <p style={{ fontFamily: BEBAS, fontSize: 36, color: T.gold, letterSpacing: "0.02em" }}>
                      R$ 2.497,00
                    </p>
                    <p style={{ fontFamily: INTER, fontSize: 12, color: T.gold, opacity: 0.6 }}>
                      ou 12x R$ 208,08
                    </p>
                  </div>
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

              {/* Badge */}
              <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } } }}
                style={{ display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "10px 22px", borderRadius: 4,
                  background: T.goldDim, border: `1px solid ${T.goldMid}`,
                  marginBottom: 36 }}>
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

              {/* Price highlight */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                style={{ padding: "32px 24px", border: `1px solid ${T.goldMid}`,
                  borderRadius: 6, background: T.goldDim, marginBottom: 40 }}>
                <p style={{ fontFamily: INTER, fontSize: 11, color: T.gold, opacity: 0.8,
                  letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>
                  Upgrade para o Diamond
                </p>
                <p style={{ fontFamily: BEBAS, fontSize: isMobile ? 52 : 72, letterSpacing: "0.02em",
                  color: T.white, lineHeight: 1, marginBottom: 8 }}>
                  <span style={{ fontSize: "0.45em", verticalAlign: "top", marginTop: 8,
                    display: "inline-block", color: T.gold }}>R$</span>
                  2.497
                  <span style={{ fontSize: "0.35em", color: T.gold }}>,00</span>
                </p>
                <p style={{ fontFamily: INTER, fontSize: 14, color: T.gold, opacity: 0.7 }}>
                  ou 12x R$ 208,08 · cobrança única agora
                </p>
              </motion.div>

              {/* Primary CTA */}
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}
                style={{ marginBottom: 20 }}>
                <CTA href={TICKET_DIAMOND} label="Sim! Quero fazer o upgrade para Diamond" gold fullWidth />
              </motion.div>

              {/* Rejection */}
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

              <img src="/assets/alphaville.webp" alt="Alphaville, São Paulo"
                loading="lazy"
                style={{ width: "100%", aspectRatio: isMobile ? "4/3" : "16/5",
                  objectFit: "cover", display: "block" }} />

              <div style={{ position: "absolute", inset: 0,
                background: "linear-gradient(to right, rgba(7,7,15,0.9) 0%, rgba(7,7,15,0.55) 50%, rgba(7,7,15,0.2) 100%)" }} />

              <div style={{ position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: isMobile ? "24px 24px" : "40px 56px" }}>
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
                <CTA href={TICKET_DIAMOND} label="Quero fazer o upgrade para Diamond" gold fullWidth />
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
