import { useState, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Check, MapPin, Calendar, Clock, Users } from "lucide-react";

const T = {
  bg:        "#07070F",
  white:     "#FAFAFA",
  accent:    "#E31B23",
  border:    "rgba(227,27,35,0.28)",
  surface:   "rgba(255,255,255,0.04)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
  gold:      "#C8A96E",
  goldMid:   "rgba(200,169,110,0.25)",
  goldDim:   "rgba(200,169,110,0.1)",
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";
const ease  = [0.22, 1, 0.36, 1] as const;

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// ── VSL de boas-vindas Diamond (placeholder) ─────────────────────────────────
function WelcomeVSLPlaceholder() {
  return (
    <div style={{ position: "relative", borderRadius: 4, overflow: "hidden",
      border: `1px solid ${T.goldMid}`, aspectRatio: "16/9",
      background: "radial-gradient(ellipse at 50% 60%, rgba(200,169,110,0.09) 0%, rgba(7,7,15,0.0) 70%), #0D0D18",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(250,250,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px" }} />
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none"
        stroke="rgba(200,169,110,0.35)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 10l4.553-2.069A1 1 0 0121 8.862v6.276a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
      <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
        color: "rgba(200,169,110,0.4)", textTransform: "uppercase" }}>
        Vídeo de boas-vindas em breve
      </p>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 4, flexShrink: 0,
        background: T.goldDim, border: `1px solid ${T.goldMid}`,
        display: "flex", alignItems: "center", justifyContent: "center", color: T.gold }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: T.veryMuted,
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: INTER, fontSize: 14, color: T.white, fontWeight: 600 }}>{value}</p>
      </div>
    </div>
  );
}

export default function ThankYouDiamond() {
  const isMobile = useIsMobile();

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
        `}</style>

        <section style={{ padding: isMobile ? "56px 24px 64px" : "72px 24px 80px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ maxWidth: 720, width: "100%" }}>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10,
                padding: "8px 20px", borderRadius: 4, marginBottom: 24,
                background: T.goldDim, border: `1px solid ${T.goldMid}` }}>
              <Check size={14} color={T.gold} strokeWidth={3} />
              <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700,
                color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Ingresso Diamond confirmado
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
              style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(36px,10vw,52px)" : "clamp(44px,4.5vw,68px)",
                letterSpacing: "0.02em", lineHeight: 1.02, color: T.white, marginBottom: 16 }}>
              BEM-VINDO À EXPERIÊNCIA<br /><span style={{ color: T.gold }}>DIAMOND.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 17, color: T.muted,
                lineHeight: 1.65, maxWidth: 560, margin: "0 auto 32px" }}>
              Sua vaga está garantida — melhores cadeiras, prioridade nas perguntas
              e o jantar exclusivo na casa do Luiz. Assista ao vídeo abaixo antes de continuar.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              style={{ marginBottom: 36 }}>
              <WelcomeVSLPlaceholder />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.4 }}
              style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 20, padding: "28px 26px", border: `1px solid ${T.goldMid}`,
                borderRadius: 6, background: T.goldDim, marginBottom: 32, textAlign: "left" }}>
              <InfoItem icon={<Calendar size={15} />} label="Data" value="22 e 23 de Julho, 2026" />
              <InfoItem icon={<Clock size={15} />} label="Horário" value="09h às 18h" />
              <InfoItem icon={<MapPin size={15} />} label="Local" value="Alphaville, São Paulo" />
              <InfoItem icon={<Users size={15} />} label="Jantar exclusivo" value="Na casa do Luiz" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.5 }}>
              <motion.a href="/cadastro-diamond"
                whileHover={{ y: -3, boxShadow: "0 18px 52px rgba(200,169,110,0.35)" }}
                whileTap={{ scale: 0.98 }} transition={{ duration: 0.22 }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
                  padding: "17px 44px", background: "linear-gradient(135deg,#C8A96E 0%,#8B6A2F 100%)",
                  color: "#07070F", fontFamily: INTER, fontSize: 13, fontWeight: 800,
                  letterSpacing: "0.16em", textTransform: "uppercase", width: isMobile ? "100%" : undefined }}>
                Confirmar meus dados
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </motion.a>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              style={{ marginTop: 18, fontFamily: INTER, fontSize: 12, color: T.veryMuted, lineHeight: 1.6 }}>
              Nosso time vai entrar em contato pelo WhatsApp para alinhar os detalhes do seu jantar.
            </motion.p>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
