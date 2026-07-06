import { useState, useEffect, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import { MapPin, Calendar, Users, Check, Play, Volume2, VolumeX } from "lucide-react";

// Estética própria — separada do Código da Escala de propósito (evento
// independente, vendido direto, não é upsell). Tom quente/íntimo, dourado
// como cor primária, serif elegante em vez do Bebas Neue condensado.
const T = {
  bg:        "#0F0B08",
  white:     "#FAF6EF",
  gold:      "#C8A96E",
  goldLight: "#E0C89A",
  border:    "rgba(200,169,110,0.25)",
  surface:   "rgba(255,255,255,0.03)",
  muted:     "rgba(250,246,239,0.6)",
  veryMuted: "rgba(250,246,239,0.4)",
  ctaGrad:   "linear-gradient(135deg,#C8A96E 0%,#8B6A2F 100%)",
};

const SERIF = "'Playfair Display', Georgia, serif";
const INTER = "'Inter', sans-serif";
const ease  = [0.22, 1, 0.36, 1] as const;
const vp    = { once: true, margin: "-60px 0px" };

// TODO: substituir pelos links reais de checkout na Onprofit (1 e 2 cadeiras)
const CHECKOUT_URL_1 = "#";
const CHECKOUT_URL_2 = "#";

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

function CTA({ href, label, fullWidth = false }: { href: string; label: string; fullWidth?: boolean }) {
  return (
    <motion.a href={href}
      whileHover={{ y: -3, boxShadow: "0 18px 52px rgba(200,169,110,0.35)" }}
      whileTap={{ scale: 0.98 }} transition={{ duration: 0.22 }}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "18px 46px", background: T.ctaGrad, color: "#0F0B08",
        fontFamily: INTER, fontSize: 13, fontWeight: 800, letterSpacing: "0.14em",
        textTransform: "uppercase", textDecoration: "none", width: fullWidth ? "100%" : undefined,
        whiteSpace: "nowrap" }}>
      {label}
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    </motion.a>
  );
}

function JantarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(true);
  const [started, setStarted] = useState(false);

  // Clique alterna play/pause sempre — não só na primeira vez.
  function handleToggle() {
    const v = videoRef.current; if (!v) return;
    if (v.paused) {
      if (!started) { v.muted = false; v.currentTime = 0; setMuted(false); setStarted(true); }
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }
  function handleMuteToggle(e: React.MouseEvent) {
    e.stopPropagation();
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  }

  return (
    <div onClick={handleToggle}
      style={{ position: "relative", borderRadius: 4, overflow: "hidden", maxWidth: 320, margin: "0 auto",
        border: `1px solid ${T.border}`, cursor: "pointer",
        boxShadow: "0 0 60px rgba(200,169,110,0.08)" }}>
      {/* vídeo original é vertical (9:16) — respeita a proporção real, sem cortar o enquadramento */}
      <video ref={videoRef} src="/assets/abertura_jantar.mp4" playsInline preload="none"
        poster="/assets/abertura_jantar_poster.webp"
        style={{ width: "100%", aspectRatio: "9/16", objectFit: "cover", display: "block" }} />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(15,11,8,0.4)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: T.ctaGrad,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(200,169,110,0.5)" }}>
              <Play size={26} fill="#0F0B08" color="#0F0B08" style={{ marginLeft: 3 }} />
            </div>
            <p style={{ fontFamily: INTER, fontSize: 12, color: "rgba(250,246,239,0.75)",
              letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
              {started ? "Pausado" : "Assista o Luiz Filho"}
            </p>
          </div>
        </div>
      )}
      {started && (
        <button aria-label={muted ? "Ativar som" : "Silenciar"} onClick={handleMuteToggle}
          style={{ position: "absolute", bottom: 14, right: 14, width: 36, height: 36, borderRadius: 4,
            border: `1px solid ${T.border}`, background: "rgba(200,169,110,0.15)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", color: T.gold }}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      )}
    </div>
  );
}

const INCLUI = [
  "Jantar exclusivo na casa do Luiz, em Tamboré 2, Alphaville",
  "Conversa cara a cara com o Luiz, sem palco, sem plateia",
  "Networking com quem já está gerando resultado de verdade",
  "Ambiente íntimo, vagas ultralimitadas",
];

export default function CasaDoLuiz() {
  useLenis();
  const isMobile = useIsMobile();

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          img, video { display: block; max-width: 100%; }
          a { color: inherit; text-decoration: none; }
        `}</style>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "56px 24px 48px" : "72px 32px 64px" }}>
          <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr", gap: isMobile ? 32 : 56, alignItems: "center" }}>

            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 12, marginBottom: 22 }}>
                <span style={{ width: 24, height: 1, background: T.gold }} />
                <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, letterSpacing: "0.24em",
                  textTransform: "uppercase", color: T.gold }}>Evento exclusivo</span>
                {isMobile && <span style={{ width: 24, height: 1, background: T.gold }} />}
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: 0.1 }}
                style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                  fontSize: isMobile ? "clamp(34px,10vw,46px)" : "clamp(42px,4.2vw,58px)",
                  lineHeight: 1.15, color: T.white, marginBottom: 20 }}>
                Um jantar na casa do <span style={{ color: T.gold }}>Luiz Filho</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
                style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 17, color: T.muted,
                  lineHeight: 1.65, maxWidth: 480, margin: isMobile ? "0 auto 32px" : "0 0 32px" }}>
                Uma noite em Tamboré 2, Alphaville, pra sentar na mesa com o Luiz e trocar ideia
                cara a cara, sem palco, sem plateia, só quem decidiu que quer proximidade de verdade.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.4 }}>
                <CTA href={CHECKOUT_URL_1} label="Quero minha vaga no jantar" fullWidth={isMobile} />
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.55 }}
                style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 8,
                  fontFamily: INTER, fontSize: 13, color: T.veryMuted }}>
                <Calendar size={13} color={T.gold} /> 22 de Julho, 2026 · Tamboré 2, Alphaville
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}>
              <JantarVideo />
            </motion.div>
          </div>
        </section>

        {/* ── A EXPERIÊNCIA ────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "48px 24px" : "80px 32px", background: "rgba(255,255,255,0.015)" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <motion.h2 initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
              style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                fontSize: isMobile ? "clamp(28px,8vw,38px)" : "clamp(36px,4vw,50px)",
                textAlign: "center", color: T.white, marginBottom: 44 }}>
              Não é um evento. <span style={{ color: T.gold }}>É a mesa dele.</span>
            </motion.h2>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 40 }}>
              {[
                { src: "/assets/jantar_mesa.webp", label: "A mesa" },
                { src: "/assets/jantar_ambiente.webp", label: "O ambiente" },
                { src: "/assets/jantar_conversa.webp", label: "As conversas" },
              ].map((item, i) => (
                <motion.div key={item.src} initial="hidden" whileInView="visible" viewport={vp}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: i * 0.08 } } }}
                  style={{ position: "relative", borderRadius: 4, overflow: "hidden", border: `1px solid ${T.border}` }}>
                  <img src={item.src} alt={item.label} loading="lazy"
                    style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 50%, rgba(15,11,8,0.8) 100%)" }} />
                  <p style={{ position: "absolute", bottom: 12, left: 14, fontFamily: INTER, fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.goldLight }}>
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
              style={{ maxWidth: 620, margin: "0 auto", textAlign: "center",
                borderLeft: `2px solid ${T.gold}`, padding: "4px 0 4px 22px" }}>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 18 : 21,
                color: T.goldLight, lineHeight: 1.6, textAlign: "left" }}>
                "Eu passo de mesa em mesa pra trocar experiência, mostrar visão, trazer o que fazer.
                É um ambiente mais íntimo, fica melhor pra gente poder conectar."
              </p>
              <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: T.veryMuted,
                letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 10, textAlign: "left" }}>
                Luiz Filho
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── SOBRE O LUIZ ──────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "48px 24px" : "80px 32px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto", display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "280px 1fr", gap: isMobile ? 28 : 48, alignItems: "center" }}>

            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } } }}
              style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}`,
                boxShadow: "0 0 60px rgba(200,169,110,0.1)" }}>
              <img src="/assets/luiz.webp" alt="Luiz Filho" loading="lazy"
                style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              style={{ textAlign: isMobile ? "center" : "left" }}>
              <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}
                style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: T.gold, marginBottom: 14 }}>
                Sobre o Luiz
              </motion.p>
              <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                  fontSize: isMobile ? "clamp(26px,7.5vw,34px)" : "clamp(30px,3vw,40px)",
                  color: T.white, marginBottom: 18, lineHeight: 1.2 }}>
                Estrategista por trás de lançamentos que a maioria só vê de fora.
              </motion.h2>
              <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}
                style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted, lineHeight: 1.75, marginBottom: 14 }}>
                Luiz constrói e opera a estrutura por trás de lançamentos de sete e oito dígitos, ao lado
                de nomes como Pablo Marçal. Mais de 128 lançamentos operados, R$300 milhões em vendas
                geradas. Não é teoria de curso. É o que ele faz, operando, toda semana.
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } }}
                style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted, lineHeight: 1.75 }}>
                No jantar, ele não sobe num palco pra repetir slide. Senta na sua mesa, ouve o seu cenário
                específico e responde ali, na hora. É o tipo de acesso que normalmente só existe dentro
                de uma sala de operação.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── O QUE ESTÁ INCLUÍDO ──────────────────────────────────── */}
        <section style={{ padding: isMobile ? "48px 24px" : "80px 32px", background: "rgba(255,255,255,0.015)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <motion.h2 initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
              style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                fontSize: isMobile ? "clamp(26px,7.5vw,34px)" : "clamp(32px,3.5vw,42px)",
                textAlign: "center", color: T.white, marginBottom: 32 }}>
              O que está incluído
            </motion.h2>
            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              style={{ border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface, padding: "8px 24px" }}>
              {INCLUI.map((item, i) => (
                <motion.div key={i}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } } }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 0",
                    borderBottom: i < INCLUI.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    background: "rgba(200,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} color={T.gold} strokeWidth={3} />
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: 14.5, color: T.white, lineHeight: 1.5 }}>{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PREÇO + CTA ───────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "48px 24px 64px" : "72px 32px 96px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } } }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 4,
                background: "rgba(200,169,110,0.08)", border: `1px solid ${T.border}`, marginBottom: 24 }}>
              <Users size={13} color={T.gold} />
              <span style={{ fontFamily: INTER, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: T.gold }}>Vagas ultralimitadas</span>
            </motion.div>

            <motion.p initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 14.5 : 15.5, color: T.muted, lineHeight: 1.7,
                maxWidth: 540, margin: "0 auto 36px" }}>
              Uma hora a sós com o Luiz custaria mais de R$100 mil. Nessa noite, você não tem uma hora,
              tem a noite inteira, na mesa dele, ao lado de quem também constrói em escala grande.
            </motion.p>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={vp}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
                style={{ padding: "28px 22px", border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface }}>
                <p style={{ fontFamily: INTER, fontSize: 11, color: T.gold, letterSpacing: "0.16em",
                  textTransform: "uppercase", marginBottom: 10 }}>1 Cadeira</p>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                  fontSize: isMobile ? 38 : 46, color: T.white, lineHeight: 1, marginBottom: 8 }}>
                  R$ 2.500
                </p>
                <p style={{ fontFamily: INTER, fontSize: 12.5, color: T.muted, marginBottom: 18 }}>
                  sua vaga no jantar
                </p>
                <CTA href={CHECKOUT_URL_1} label="Quero minha vaga" fullWidth />
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={vp}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease, delay: 0.08 } } }}
                style={{ padding: "28px 22px", border: `1px solid ${T.gold}`, borderRadius: 6,
                  background: "rgba(200,169,110,0.06)" }}>
                <p style={{ fontFamily: INTER, fontSize: 11, color: T.gold, letterSpacing: "0.16em",
                  textTransform: "uppercase", marginBottom: 10 }}>2 Cadeiras</p>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                  fontSize: isMobile ? 38 : 46, color: T.white, lineHeight: 1, marginBottom: 8 }}>
                  R$ 3.000
                </p>
                <p style={{ fontFamily: INTER, fontSize: 12.5, color: T.muted, marginBottom: 18 }}>
                  leve alguém pra mesa com você
                </p>
                <CTA href={CHECKOUT_URL_2} label="Quero as duas vagas" fullWidth />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── LOCAL ─────────────────────────────────────────────────── */}
        <section style={{ padding: isMobile ? "0 24px 56px" : "0 32px 88px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
              style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: `1px solid ${T.gold}` }}>
              <img src="/assets/jantar_ambiente.webp" alt="Ambiente do jantar em Tamboré 2, Alphaville" loading="lazy"
                style={{ width: "100%", aspectRatio: isMobile ? "4/3" : "16/5", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0,
                background: "linear-gradient(to right, rgba(15,11,8,0.92) 0%, rgba(15,11,8,0.55) 50%, transparent 100%)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                justifyContent: "center", padding: isMobile ? "24px" : "40px 56px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <MapPin size={13} color={T.gold} />
                  <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: T.gold,
                    letterSpacing: "0.14em", textTransform: "uppercase" }}>Localização</span>
                </div>
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                  fontSize: isMobile ? "clamp(24px,8vw,32px)" : "clamp(30px,3vw,44px)", color: T.white, marginBottom: 8 }}>
                  Tamboré 2, Alphaville
                </p>
                <p style={{ fontFamily: INTER, fontSize: 14, color: T.muted, marginBottom: 4 }}>
                  Um dos endereços mais desejados de São Paulo
                </p>
                <p style={{ fontFamily: INTER, fontSize: 14, color: T.muted }}>
                  22 de Julho de 2026 · endereço enviado após a confirmação
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <footer style={{ padding: "20px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontFamily: INTER, fontSize: 11, color: T.veryMuted }}>
            © {new Date().getFullYear()} Luiz Filho. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </MotionConfig>
  );
}
