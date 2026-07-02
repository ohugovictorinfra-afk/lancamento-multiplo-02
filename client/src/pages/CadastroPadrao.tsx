import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Check, ChevronLeft } from "lucide-react";

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

function formatPhoneBR(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;
  if (len === 0) return "";
  if (len <= 2) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

type QId = "nome" | "email" | "telefone" | "cidade" | "instagram" | "nicho" | "desafio";
type Question = { id: QId; label: string; type: "text" | "email" | "tel"; placeholder: string; optional?: boolean; long?: boolean };

const QUESTIONS: Question[] = [
  { id: "nome", label: "Qual seu nome completo?", type: "text", placeholder: "Seu nome" },
  { id: "email", label: "Qual seu melhor e-mail?", type: "email", placeholder: "seu@email.com" },
  { id: "telefone", label: "Qual seu WhatsApp?", type: "tel", placeholder: "(11) 99999-9999" },
  { id: "cidade", label: "De qual cidade você vem?", type: "text", placeholder: "Ex: São Paulo / SP", optional: true },
  { id: "instagram", label: "Qual o seu @ no Instagram?", type: "text", placeholder: "@seuinstagram" },
  { id: "nicho", label: "Qual seu nicho ou área de atuação?", type: "text", placeholder: "Ex: infoprodutor, tráfego pago, mentoria..." },
  { id: "desafio", label: "Qual seu maior desafio hoje no seu negócio?", type: "text", placeholder: "Conta pra gente...", long: true },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 2px", background: "transparent",
  border: "none", borderBottom: "2px solid rgba(250,250,250,0.18)",
  color: T.white, fontFamily: INTER, fontSize: 20, fontWeight: 500, outline: "none",
  transition: "border-color 0.2s",
};

const variants = {
  enter:  (dir: number) => ({ opacity: 0, y: dir > 0 ? 26 : -26 }),
  center: { opacity: 1, y: 0 },
  exit:   (dir: number) => ({ opacity: 0, y: dir > 0 ? -26 : 26 }),
};

export default function CadastroPadrao() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<QId, string>>({
    nome: "", email: "", telefone: "", cidade: "", instagram: "", nicho: "", desafio: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const canContinue = current.optional || answers[current.id].trim().length > 0;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [step]);

  function submitForm() {
    setLoading(true);
    // TODO: integrar com GHL — por enquanto só loga
    console.log({ ...answers, ingresso: "Padrão" });
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 500);
  }

  function goNext(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canContinue) return;
    if (isLast) { submitForm(); return; }
    setDirection(1);
    setStep(s => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setDirection(-1);
    setStep(s => s - 1);
  }

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
          input::placeholder { color: rgba(250,250,250,0.22); }
        `}</style>

        {!submitted && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 20,
            background: "rgba(255,255,255,0.06)" }}>
            <motion.div animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.4, ease }}
              style={{ height: "100%", background: T.ctaGrad }} />
          </div>
        )}

        <section style={{ minHeight: "100vh", padding: "72px 24px 40px", display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 520, width: "100%" }}>

            {!submitted ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                  {step > 0 ? (
                    <button onClick={goBack} aria-label="Voltar"
                      style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                        border: `1px solid ${T.border}`, background: "transparent", color: T.muted,
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <ChevronLeft size={15} />
                    </button>
                  ) : <div style={{ width: 30 }} />}
                  <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
                    textTransform: "uppercase", color: T.veryMuted }}>
                    {step + 1} de {QUESTIONS.length}
                  </p>
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.form key={current.id} custom={direction}
                    variants={variants} initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.35, ease }}
                    onSubmit={goNext}>

                    <label style={{ display: "block", fontFamily: BEBAS,
                      fontSize: isMobile ? "clamp(26px,7.5vw,34px)" : "clamp(30px,3vw,38px)",
                      letterSpacing: "0.01em", lineHeight: 1.15, color: T.white, marginBottom: 24 }}>
                      {current.label}
                      {current.optional && (
                        <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 500,
                          color: T.veryMuted, marginLeft: 10, letterSpacing: 0 }}>(opcional)</span>
                      )}
                    </label>

                    <input
                      ref={inputRef}
                      type={current.type}
                      value={answers[current.id]}
                      onChange={e => {
                        const value = current.type === "tel" ? formatPhoneBR(e.target.value) : e.target.value;
                        setAnswers(prev => ({ ...prev, [current.id]: value }));
                      }}
                      placeholder={current.placeholder}
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = T.accent; }}
                      onBlur={e  => { e.currentTarget.style.borderColor = "rgba(250,250,250,0.18)"; }}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30 }}>
                      <motion.button type="submit" disabled={!canContinue || loading}
                        whileHover={(!canContinue || loading) ? {} : { y: -2, boxShadow: "0 18px 52px rgba(227,27,35,0.42)" }}
                        whileTap={(!canContinue || loading) ? {} : { scale: 0.98 }}
                        transition={{ duration: 0.22 }}
                        style={{ padding: "14px 30px",
                          background: (!canContinue || loading) ? "rgba(227,27,35,0.35)" : T.ctaGrad,
                          color: T.white, fontFamily: INTER, fontSize: 13, fontWeight: 800,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          border: "none", borderRadius: 3,
                          cursor: (!canContinue || loading) ? "default" : "pointer" }}>
                        {loading ? "Enviando..." : isLast ? "Enviar" : "Continuar →"}
                      </motion.button>

                      {current.optional && !isLast && (
                        <button type="button" onClick={() => goNext()}
                          style={{ fontFamily: INTER, fontSize: 12, color: T.veryMuted,
                            background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                          Pular
                        </button>
                      )}
                    </div>

                    <p style={{ marginTop: 18, fontFamily: INTER, fontSize: 11, color: T.veryMuted }}>
                      pressione Enter ↵
                    </p>
                  </motion.form>
                </AnimatePresence>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
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
                <p style={{ fontFamily: INTER, fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
                  Obrigado por compartilhar um pouco mais sobre você. Nosso time vai analisar
                  suas respostas e entrar em contato pelo WhatsApp antes do evento.
                  Fique de olho também no seu e-mail para as instruções de acesso.
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
