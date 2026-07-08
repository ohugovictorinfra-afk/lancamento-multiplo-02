import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Check, ChevronLeft, ArrowRight, CornerDownLeft, Sparkles, Send } from "lucide-react";
import { useLocation } from "wouter";

// Theme constants aligned with landing pages
const T = {
  bg: "#07070F",
  white: "#FAFAFA",
  accent: "#E31B23",
  accentDim: "rgba(227,27,35,0.15)",
  border: "rgba(227,27,35,0.22)",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.07)",
  muted: "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.30)",
  ctaGrad: "linear-gradient(135deg,#E31B23 0%,#8B0E13 100%)",
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";
const ease = [0.22, 1, 0.36, 1] as const;

// Types
type QuestionType = "welcome" | "text" | "email" | "tel" | "choice" | "multi-choice" | "textarea";

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  options?: Option[];
  required?: boolean;
}

// Brazilian phone formatter
function formatPhoneBR(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;
  if (len === 0) return "";
  if (len <= 2) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Hook to check mobile
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return mobile;
}

// Question Definitions
const QUESTIONS: Question[] = [
  {
    id: "welcome",
    type: "welcome",
    label: "Acelerador Código da Escala",
    description: "Preencha este breve formulário para receber um diagnóstico personalizado e entender como podemos te ajudar a escalar sua operação.",
    buttonText: "Começar Diagnóstico",
  },
  {
    id: "nome",
    type: "text",
    label: "Qual o seu nome completo?",
    description: "Por favor, digite seu nome e sobrenome.",
    placeholder: "Digite seu nome aqui...",
    required: true,
  },
  {
    id: "email",
    type: "email",
    label: "Qual seu melhor e-mail corporativo?",
    description: "Enviaremos o diagnóstico e materiais exclusivos por aqui.",
    placeholder: "seu@email.com",
    required: true,
  },
  {
    id: "whatsapp",
    type: "tel",
    label: "Qual o seu número de WhatsApp?",
    description: "Nosso time entrará em contato para te enviar os próximos passos.",
    placeholder: "(11) 99999-9999",
    required: true,
  },
  {
    id: "faturamento",
    type: "choice",
    label: "Qual o faturamento mensal do seu negócio atualmente?",
    description: "Isso nos ajuda a entender em qual estágio de maturidade você se encontra.",
    options: [
      { value: "sub10k", label: "Menos de R$ 10.000 / mês" },
      { value: "10k_50k", label: "R$ 10.000 a R$ 50.000 / mês" },
      { value: "50k_100k", label: "R$ 50.000 a R$ 100.000 / mês" },
      { value: "over100k", label: "Mais de R$ 100.000 / mês" },
    ],
    required: true,
  },
  {
    id: "estrategias",
    type: "multi-choice",
    label: "Quais estratégias você já executa hoje?",
    description: "Selecione todas as opções que se aplicam ao seu negócio atual.",
    options: [
      { value: "trafego", label: "Tráfego Pago direto para vendas" },
      { value: "lancamentos", label: "Lançamentos Clássicos / Webinars" },
      { value: "perpetuo", label: "Funis no Perpétuo" },
      { value: "high_ticket", label: "Vendas High Ticket no Individual / WhatsApp" },
      { value: "none", label: "Nenhuma das alternativas" },
    ],
    required: true,
  },
  {
    id: "desafio",
    type: "textarea",
    label: "Qual seu maior gargalo ou desafio de vendas hoje?",
    description: "Fale um pouco sobre o que te impede de escalar suas campanhas hoje.",
    placeholder: "Escreva sua resposta...",
    required: true,
  },
];

// Animation Variants
const slideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? 40 : -40,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -40 : 40,
    scale: 0.98,
  }),
};

export default function QuizForm() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({
    nome: "",
    email: "",
    whatsapp: "",
    faturamento: "",
    estrategias: [] as string[],
    desafio: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = QUESTIONS[step];
  const isWelcome = currentQuestion.type === "welcome";
  // The actual questions count excluding the welcome screen
  const totalQuestions = QUESTIONS.length - 1;
  const currentQuestionIndex = step; // Step 0 is welcome, so question 1 is step 1

  // Keyboard shortcut letters
  const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

  // Focus inputs automatically
  useEffect(() => {
    setErrorMsg("");
    if (currentQuestion.type === "text" || currentQuestion.type === "email" || currentQuestion.type === "tel") {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    } else if (currentQuestion.type === "textarea") {
      const t = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step, currentQuestion.type]);

  // Keyboard Navigation: Enter and option letters
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (submitted) return;

      const isInputActive =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      // Enter key -> go next (if valid)
      if (e.key === "Enter") {
        // If it's a textarea, let Enter work for standard submission unless Shift is pressed (or vice-versa)
        if (currentQuestion.type === "textarea") {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            goNext();
          }
        } else {
          e.preventDefault();
          goNext();
        }
        return;
      }

      // Shortcut letters (A, B, C...) -> only when NOT typing inside an input field
      if (!isInputActive && currentQuestion.options) {
        const char = e.key.toUpperCase();
        const index = OPTION_LETTERS.indexOf(char);
        if (index !== -1 && index < currentQuestion.options.length) {
          e.preventDefault();
          const optionValue = currentQuestion.options[index].value;

          if (currentQuestion.type === "choice") {
            // Select and auto-advance after short delay
            selectSingleChoice(optionValue);
          } else if (currentQuestion.type === "multi-choice") {
            // Toggle multi choice
            toggleMultiChoice(optionValue);
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, answers, submitted]);

  // Single choice selector
  function selectSingleChoice(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    // Auto advance after a brief visually pleasing delay
    setTimeout(() => {
      setDirection(1);
      setStep((s) => s + 1);
    }, 280);
  }

  // Multi choice toggler
  function toggleMultiChoice(value: string) {
    setAnswers((prev) => {
      const currentList: string[] = prev[currentQuestion.id] || [];
      let newList: string[];

      // If 'none' option selected, clear others
      if (value === "none") {
        newList = currentList.includes("none") ? [] : ["none"];
      } else {
        // Remove 'none' if it was selected
        const cleaned = currentList.filter((x) => x !== "none");
        if (cleaned.includes(value)) {
          newList = cleaned.filter((x) => x !== value);
        } else {
          newList = [...cleaned, value];
        }
      }

      return {
        ...prev,
        [currentQuestion.id]: newList,
      };
    });
  }

  // Validation before going to next step
  function validateCurrentStep(): boolean {
    if (isWelcome) return true;

    const val = answers[currentQuestion.id];

    if (currentQuestion.required) {
      if (!val || (typeof val === "string" && val.trim() === "")) {
        setErrorMsg("Esta pergunta é obrigatória.");
        return false;
      }
      if (Array.isArray(val) && val.length === 0) {
        setErrorMsg("Por favor, selecione pelo menos uma opção.");
        return false;
      }
    }

    // Email validation
    if (currentQuestion.type === "email" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setErrorMsg("Por favor, insira um e-mail válido.");
        return false;
      }
    }

    // Telephone validation
    if (currentQuestion.type === "tel" && val) {
      const cleanVal = val.replace(/\D/g, "");
      if (cleanVal.length < 10) {
        setErrorMsg("Por favor, insira um número de telefone/WhatsApp válido.");
        return false;
      }
    }

    setErrorMsg("");
    return true;
  }

  function goNext(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validateCurrentStep()) return;

    if (step === QUESTIONS.length - 1) {
      submitQuiz();
      return;
    }

    setDirection(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function submitQuiz() {
    setLoading(true);
    // Simulates an API call
    console.log("Formulário Enviado com sucesso:", answers);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  // Calculate overall progress percentage
  // Progress goes from step 1 up to totalQuestions
  const progressPercent = isWelcome
    ? 0
    : Math.min(((currentQuestionIndex) / totalQuestions) * 100, 100);

  return (
    <MotionConfig reducedMotion={isMobile ? "always" : "never"}>
      <div
        className="min-h-screen relative flex flex-col justify-between overflow-x-hidden"
        style={{
          background: T.bg,
          color: T.white,
          fontFamily: INTER,
        }}
      >
        {/* Ambient background glow */}
        <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[1000px] h-[350px] bg-red-950/20 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[300px] bg-red-950/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Global CSS Inject */}
        <style>{`
          body {
            background-color: ${T.bg};
            -webkit-font-smoothing: antialiased;
          }
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus {
            -webkit-text-fill-color: ${T.white};
            -webkit-box-shadow: 0 0 0px 1000px ${T.bg} inset;
            transition: background-color 5000s ease-in-out 0s;
          }
          ::selection {
            background-color: ${T.accent};
            color: ${T.white};
          }
        `}</style>

        {/* Header / Progress Bar */}
        <header className="relative w-full z-20">
          {!submitted && (
            <div className="w-full h-1 bg-white/5 relative">
              <motion.div
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease }}
                style={{
                  height: "100%",
                  background: T.ctaGrad,
                  boxShadow: "0 0 10px rgba(227, 27, 35, 0.6)",
                }}
              />
            </div>
          )}

          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                style={{ fontFamily: BEBAS }}
                className="text-2xl tracking-wider text-white"
              >
                CÓDIGO DA ESCALA
              </span>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              <span className="text-xs uppercase tracking-widest text-white/40">
                Diagnóstico
              </span>
            </div>

            {!submitted && step > 0 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Voltar
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative flex-grow flex items-center justify-center px-6 py-12 z-10">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              {!submitted ? (
                <motion.div
                  key={currentQuestion.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease }}
                  className="w-full flex flex-col"
                >
                  {/* Step indicator */}
                  {!isWelcome && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-950/40 border border-red-950 px-2 py-0.5 rounded">
                        Pergunta {currentQuestionIndex} de {totalQuestions}
                      </span>
                    </div>
                  )}

                  {/* Question Title & Desc */}
                  <div className="mb-8">
                    <h2
                      style={{
                        fontFamily: isWelcome ? BEBAS : INTER,
                        fontSize: isWelcome
                          ? "clamp(36px, 8vw, 56px)"
                          : "clamp(22px, 5vw, 28px)",
                        lineHeight: 1.15,
                        fontWeight: isWelcome ? 900 : 700,
                        letterSpacing: isWelcome ? "0.03em" : "-0.01em",
                      }}
                      className="text-white mb-3"
                    >
                      {currentQuestion.label}
                    </h2>
                    {currentQuestion.description && (
                      <p className="text-white/60 text-sm leading-relaxed max-w-[50ch]">
                        {currentQuestion.description}
                      </p>
                    )}
                  </div>

                  {/* Inputs based on type */}
                  <form onSubmit={goNext} className="w-full flex flex-col gap-4">
                    {/* Welcome Component */}
                    {isWelcome && (
                      <div className="mt-2">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(227,27,35,0.3)" }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            background: T.ctaGrad,
                          }}
                          className="px-8 py-4 text-white font-bold rounded-lg tracking-wide shadow-lg cursor-pointer flex items-center gap-2.5 group transition-shadow animate-fade-in"
                        >
                          {currentQuestion.buttonText}
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <p className="text-xs text-white/30 mt-4 flex items-center gap-1.5 font-medium">
                          Ou pressione <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Enter ↵</span>
                        </p>
                      </div>
                    )}

                    {/* Standard Text/Email/Tel Input */}
                    {(currentQuestion.type === "text" ||
                      currentQuestion.type === "email" ||
                      currentQuestion.type === "tel") && (
                      <div className="relative w-full">
                        <input
                          ref={inputRef}
                          type={currentQuestion.type}
                          placeholder={currentQuestion.placeholder}
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (currentQuestion.type === "tel") {
                              val = formatPhoneBR(val);
                            }
                            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
                          }}
                          style={{
                            fontFamily: INTER,
                            fontSize: "clamp(20px, 4vw, 24px)",
                            borderBottom: `2px solid ${errorMsg ? "#ef4444" : T.border}`,
                          }}
                          className="w-full bg-transparent border-0 py-3 text-white outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    )}

                    {/* Textarea Input */}
                    {currentQuestion.type === "textarea" && (
                      <div className="relative w-full">
                        <textarea
                          ref={textareaRef}
                          rows={4}
                          placeholder={currentQuestion.placeholder}
                          value={answers[currentQuestion.id] || ""}
                          onChange={(e) => {
                            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }));
                          }}
                          style={{
                            fontFamily: INTER,
                            fontSize: "18px",
                            border: `1.5px solid ${errorMsg ? "#ef4444" : T.border}`,
                            background: "rgba(255, 255, 255, 0.02)",
                          }}
                          className="w-full rounded-lg p-4 text-white outline-none focus:border-red-500 focus:bg-white/[0.04] transition-all resize-none"
                        />
                      </div>
                    )}

                    {/* Single Choice (Radios styled like Tally buttons) */}
                    {currentQuestion.type === "choice" && currentQuestion.options && (
                      <div className="flex flex-col gap-3 w-full">
                        {currentQuestion.options.map((opt, idx) => {
                          const isSelected = answers[currentQuestion.id] === opt.value;
                          const letter = OPTION_LETTERS[idx];
                          return (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => selectSingleChoice(opt.value)}
                              whileHover={{ scale: 1.01, background: T.surfaceHover }}
                              whileTap={{ scale: 0.99 }}
                              style={{
                                border: `1.5px solid ${isSelected ? T.accent : "rgba(255, 255, 255, 0.08)"}`,
                                background: isSelected ? T.accentDim : T.surface,
                              }}
                              className="w-full p-4 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-4">
                                <span
                                  style={{
                                    border: `1.5px solid ${isSelected ? T.accent : "rgba(255, 255, 255, 0.15)"}`,
                                    background: isSelected ? T.accent : "rgba(255,255,255,0.05)",
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold text-white/90 group-hover:border-red-500 transition-colors"
                                >
                                  {letter}
                                </span>
                                <span className="font-medium text-white/90 text-sm sm:text-base">
                                  {opt.label}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                                  <Check size={12} className="text-white font-bold" />
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Multi Choice (Checkboxes styled like Tally buttons) */}
                    {currentQuestion.type === "multi-choice" && currentQuestion.options && (
                      <div className="flex flex-col gap-3 w-full">
                        {currentQuestion.options.map((opt, idx) => {
                          const currentSelectedList = answers[currentQuestion.id] || [];
                          const isSelected = currentSelectedList.includes(opt.value);
                          const letter = OPTION_LETTERS[idx];
                          return (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleMultiChoice(opt.value)}
                              whileHover={{ scale: 1.01, background: T.surfaceHover }}
                              whileTap={{ scale: 0.99 }}
                              style={{
                                border: `1.5px solid ${isSelected ? T.accent : "rgba(255, 255, 255, 0.08)"}`,
                                background: isSelected ? T.accentDim : T.surface,
                              }}
                              className="w-full p-4 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-4">
                                <span
                                  style={{
                                    border: `1.5px solid ${isSelected ? T.accent : "rgba(255, 255, 255, 0.15)"}`,
                                    background: isSelected ? T.accent : "rgba(255,255,255,0.05)",
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold text-white/90 group-hover:border-red-500 transition-colors"
                                >
                                  {letter}
                                </span>
                                <span className="font-medium text-white/90 text-sm sm:text-base">
                                  {opt.label}
                                </span>
                              </div>
                              <div
                                style={{
                                  border: `1.5px solid ${isSelected ? T.accent : "rgba(255,255,255,0.2)"}`,
                                }}
                                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                  isSelected ? "bg-red-600 border-red-600" : ""
                                }`}
                              >
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Error display */}
                    <AnimatePresence>
                      {errorMsg && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-red-500 text-xs font-semibold"
                        >
                          {errorMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Bottom CTA / Continue Button (not for single choice, which auto-advances) */}
                    {!isWelcome && currentQuestion.type !== "choice" && (
                      <div className="flex items-center gap-4 mt-6">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            background: T.ctaGrad,
                          }}
                          className="px-6 py-3 rounded-lg font-bold text-white text-sm tracking-wide shadow-md flex items-center gap-2 cursor-pointer border-0"
                        >
                          {loading ? "Enviando..." : step === QUESTIONS.length - 1 ? "Enviar Respostas" : "Continuar"}
                          <CornerDownLeft size={14} className="opacity-60" />
                        </motion.button>

                        <span className="text-xs text-white/30 hidden sm:flex items-center gap-1 font-medium">
                          Pressione <span className="bg-white/10 px-1 py-0.5 rounded text-[10px]">Enter ↵</span>
                        </span>
                      </div>
                    )}
                  </form>
                </motion.div>
              ) : (
                // SUCCESS SCREEN
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease }}
                  className="w-full flex flex-col items-center text-center py-8"
                >
                  <div className="w-20 h-20 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <Check size={26} className="text-white stroke-[3px]" />
                    </motion.div>

                    {/* Sparkling particle decoration */}
                    <div className="absolute top-0 right-0 text-red-500 animate-pulse">
                      <Sparkles size={16} />
                    </div>
                  </div>

                  <h2
                    style={{ fontFamily: BEBAS }}
                    className="text-4xl sm:text-5xl tracking-wide text-white mb-4"
                  >
                    Diagnóstico Enviado!
                  </h2>

                  <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-[45ch] mb-8">
                    Obrigado por responder. Analisamos seus dados e criaremos seu planejamento estratégico personalizado. Em breve entraremos em contato pelo WhatsApp.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setLocation("/")}
                      style={{ background: T.ctaGrad }}
                      className="w-full py-3.5 rounded-lg text-white font-bold tracking-wide shadow-lg cursor-pointer border-0"
                    >
                      Voltar ao Início
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer shortcuts info (only visible when not welcome/success/mobile) */}
        <footer className="relative w-full z-20 pb-6">
          <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30 font-medium">
            {!submitted && !isWelcome ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline">
                    Atalhos de teclado:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {currentQuestion.options && (
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px]">
                        Letras [A-{OPTION_LETTERS[currentQuestion.options.length - 1]}] para Escolher
                      </span>
                    )}
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                      <CornerDownLeft size={10} /> Enter para Confirmar
                    </span>
                  </div>
                </div>
                <div className="text-white/20 select-none">
                  Framer Motion + Tally Layout
                </div>
              </>
            ) : (
              <div className="mx-auto text-center text-white/20">
                © 2026 Luiz Filho · Código da Escala. Todos os direitos reservados.
              </div>
            )}
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
