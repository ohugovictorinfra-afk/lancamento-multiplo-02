import { useState, useRef, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Check } from "lucide-react";

const T = {
  bg:        "#07070F",
  white:     "#FAFAFA",
  accent:    "#E31B23",
  border:    "rgba(227,27,35,0.28)",
  surface:   "rgba(255,255,255,0.04)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
  ctaGrad:   "linear-gradient(135deg,#E31B23 0%,#8B0E13 100%)",
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";
const ease  = [0.22, 1, 0.36, 1] as const;
const WA_URL = "https://wa.me/551150285962?text=Ol%C3%A1!%20Sou%20participante%20confirmado%20do%20C%C3%B3digo%20da%20Escala.";

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(250,250,250,0.12)", borderRadius: 3,
  color: T.white, fontFamily: INTER, fontSize: 14, outline: "none",
  transition: "border-color 0.2s",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: INTER, fontSize: 11, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CadastroPadrao() {
  const isMobile = useIsMobile();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !telefone.trim()) return;
    setLoading(true);
    // TODO: integrar com GHL — por enquanto só loga
    console.log({ nome, email, telefone, cidade, ingresso: "Padrão" });
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 500);
  }

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
          input::placeholder { color: rgba(250,250,250,0.28); }
        `}</style>

        <section style={{ minHeight: "100vh", padding: "56px 24px", display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 480, width: "100%" }}>

            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}>

                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: T.accent, marginBottom: 12 }}>
                    Último passo
                  </p>
                  <h1 style={{ fontFamily: BEBAS, fontSize: isMobile ? "clamp(32px,9vw,44px)" : "clamp(38px,4vw,52px)",
                    letterSpacing: "0.02em", color: T.white, marginBottom: 10 }}>
                    CONFIRME SEU CADASTRO
                  </h1>
                  <p style={{ fontFamily: INTER, fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
                    Preencha seus dados para finalizarmos seu cadastro no evento.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16,
                  padding: "28px 26px", border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface }}>
                  <Field label="Nome completo">
                    <input ref={firstRef} type="text" required value={nome}
                      onChange={e => setNome(e.target.value)} placeholder="Seu nome" style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = T.accent; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(250,250,250,0.12)"; }} />
                  </Field>
                  <Field label="E-mail">
                    <input type="email" required value={email}
                      onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = T.accent; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(250,250,250,0.12)"; }} />
                  </Field>
                  <Field label="WhatsApp">
                    <input type="tel" required value={telefone}
                      onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = T.accent; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(250,250,250,0.12)"; }} />
                  </Field>
                  <Field label="Cidade / Estado">
                    <input type="text" value={cidade}
                      onChange={e => setCidade(e.target.value)} placeholder="Ex: São Paulo / SP" style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = T.accent; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(250,250,250,0.12)"; }} />
                  </Field>

                  <motion.button type="submit" disabled={loading}
                    whileHover={loading ? {} : { y: -2, boxShadow: "0 18px 52px rgba(227,27,35,0.42)" }}
                    whileTap={loading ? {} : { scale: 0.98 }} transition={{ duration: 0.22 }}
                    style={{ marginTop: 8, padding: "16px 24px",
                      background: loading ? "rgba(227,27,35,0.5)" : T.ctaGrad,
                      color: T.white, fontFamily: INTER, fontSize: 13, fontWeight: 800,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      border: "none", borderRadius: 3, cursor: loading ? "default" : "pointer" }}>
                    {loading ? "Enviando..." : "Confirmar cadastro"}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease }}
                style={{ textAlign: "center", padding: "40px 28px", border: `1px solid ${T.border}`,
                  borderRadius: 6, background: T.surface }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 22px",
                  background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={28} color="#4ADE80" strokeWidth={2.5} />
                </div>
                <h2 style={{ fontFamily: BEBAS, fontSize: 32, letterSpacing: "0.03em", color: T.white, marginBottom: 10 }}>
                  CADASTRO CONFIRMADO!
                </h2>
                <p style={{ fontFamily: INTER, fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
                  Você vai receber por e-mail e WhatsApp todas as instruções de acesso ao evento.
                  Qualquer dúvida, fale com a gente.
                </p>
                <a href={WA_URL} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "15px 32px", background: T.ctaGrad, color: T.white,
                    fontFamily: INTER, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em",
                    textTransform: "uppercase" }}>
                  Falar com o time
                </a>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
