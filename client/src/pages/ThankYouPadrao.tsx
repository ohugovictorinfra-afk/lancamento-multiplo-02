import { useState, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Check, MapPin, Calendar, Clock } from "lucide-react";

const T = {
  bg:          "#07070F",
  white:       "#FAFAFA",
  accent:      "#E31B23",
  accentLight: "#FF4444",
  border:      "rgba(227,27,35,0.28)",
  surface:     "rgba(255,255,255,0.04)",
  muted:       "rgba(250,250,250,0.55)",
  veryMuted:   "rgba(250,250,250,0.38)",
  ctaGrad:     "linear-gradient(135deg,#E31B23 0%,#8B0E13 100%)",
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: 4, flexShrink: 0,
        background: T.surface, border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", color: T.accentLight }}>
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

export default function ThankYouPadrao() {
  const isMobile = useIsMobile();

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
        `}</style>

        <section style={{ minHeight: "100vh", padding: "64px 24px", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ maxWidth: 640, width: "100%" }}>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto 28px",
                background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={34} color="#4ADE80" strokeWidth={2.5} />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
              style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(40px,11vw,56px)" : "clamp(48px,5vw,72px)",
                letterSpacing: "0.02em", lineHeight: 1, color: T.white, marginBottom: 14 }}>
              INGRESSO CONFIRMADO!
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 17, color: T.muted,
                lineHeight: 1.6, marginBottom: 40 }}>
              Sua vaga no Código da Escala está garantida. Guarde os detalhes
              abaixo e fique de olho no seu e-mail e WhatsApp.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.3 }}
              style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 20, padding: "28px 26px", border: `1px solid ${T.border}`,
                borderRadius: 6, background: T.surface, marginBottom: 32, textAlign: "left" }}>
              <InfoItem icon={<Calendar size={15} />} label="Data" value="22 e 23 de Julho, 2026" />
              <InfoItem icon={<Clock size={15} />} label="Horário" value="09h às 18h" />
              <InfoItem icon={<MapPin size={15} />} label="Local" value="Alphaville, São Paulo" />
              <InfoItem icon={<Check size={15} />} label="Ingresso" value="Padrão" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: 0.4 }}>
              <motion.a href="/cadastro-padrao"
                whileHover={{ y: -3, boxShadow: "0 18px 52px rgba(227,27,35,0.42)" }}
                whileTap={{ scale: 0.98 }} transition={{ duration: 0.22 }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
                  padding: "17px 44px", background: T.ctaGrad, color: T.white,
                  fontFamily: INTER, fontSize: 13, fontWeight: 800, letterSpacing: "0.16em",
                  textTransform: "uppercase", width: isMobile ? "100%" : undefined }}>
                Confirmar meus dados
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </motion.a>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{ marginTop: 18, fontFamily: INTER, fontSize: 12, color: T.veryMuted, lineHeight: 1.6 }}>
              Leva menos de 1 minuto — só para confirmarmos seus dados de acesso.
            </motion.p>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
