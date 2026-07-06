import { useState, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Check, MapPin, Calendar } from "lucide-react";

const T = {
  bg:        "#0F0B08",
  white:     "#FAF6EF",
  gold:      "#C8A96E",
  goldLight: "#E0C89A",
  border:    "rgba(200,169,110,0.25)",
  surface:   "rgba(255,255,255,0.03)",
  muted:     "rgba(250,246,239,0.6)",
  veryMuted: "rgba(250,246,239,0.4)",
};

const SERIF = "'Playfair Display', Georgia, serif";
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
        background: "rgba(200,169,110,0.1)", border: `1px solid ${T.border}`,
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

export default function ThankYouCasaDoLuiz() {
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
          <div style={{ maxWidth: 620, width: "100%" }}>

            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto 28px",
                background: "rgba(200,169,110,0.1)", border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={34} color={T.gold} strokeWidth={2.5} />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.1 }}
              style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600,
                fontSize: isMobile ? "clamp(30px,9vw,40px)" : "clamp(38px,4vw,54px)",
                lineHeight: 1.2, color: T.white, marginBottom: 14 }}>
              Sua vaga no jantar está <span style={{ color: T.gold }}>confirmada</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              style={{ fontFamily: INTER, fontSize: isMobile ? 15 : 16, color: T.muted,
                lineHeight: 1.6, marginBottom: 36 }}>
              A gente te vê em Alphaville. O endereço completo e as orientações chegam
              por e-mail e WhatsApp em breve.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.3 }}
              style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 20, padding: "26px 24px", border: `1px solid ${T.border}`,
                borderRadius: 6, background: T.surface, textAlign: "left" }}>
              <InfoItem icon={<Calendar size={15} />} label="Data" value="22 de Julho, 2026" />
              <InfoItem icon={<MapPin size={15} />} label="Local" value="Alphaville, São Paulo" />
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              style={{ marginTop: 24, fontFamily: INTER, fontSize: 12.5, color: T.veryMuted, lineHeight: 1.6 }}>
              Qualquer dúvida, é só responder o e-mail de confirmação.
            </motion.p>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
