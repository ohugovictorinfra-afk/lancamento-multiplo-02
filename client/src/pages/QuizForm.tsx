import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Check, ChevronLeft, ArrowRight, CornerDownLeft, Sparkles, Play, Volume2, VolumeX } from "lucide-react";
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
    label: "O Bastidor do Bastidor",
    description: "Olha só, presta atenção: eu não estou aqui para fazer um \"cursinho\" ou te dar uma aula teórica. O mercado já está cheio de gente que fala e não faz.\n\nNo dia 14 de julho, eu vou abrir as portas do nosso escritório para apenas 15 empresas.\n\nVocê vai sentar com o meu time de estrategistas, com o meu comercial e ver exatamente como a gente gera milhões. Liderança, gestão, funil e lançamento, sem filtro. É o jogo que a gente joga aqui dentro do Marçal Tower.\n\nO investimento é de R$ 1.000, com café, almoço e janta inclusos.\n\nEu vou ler pessoalmente as respostas para entender quem realmente faz sentido estar na mesa comigo.",
    buttonText: "Começar Aplicação",
  },
  {
    id: "nome_empresa",
    type: "text",
    label: "Qual o seu nome e o nome da sua empresa?",
    placeholder: "Digite seu nome e o da sua empresa...",
    required: true,
  },
  {
    id: "whatsapp",
    type: "tel",
    label: "Qual o seu WhatsApp de contato direto?",
    placeholder: "(11) 99999-9999",
    required: true,
  },
  {
    id: "tempo_mercado",
    type: "text",
    label: "Há quanto tempo você atua no mercado digital?",
    placeholder: "Ex: 6 meses, 2 anos, iniciando agora...",
    required: true,
  },
  {
    id: "faturamento",
    type: "choice",
    label: "Qual é o seu faturamento médio mensal hoje?",
    options: [
      { value: "sub10k", label: "Zero a R$ 10k (ainda estou começando)" },
      { value: "10k_50k", label: "R$ 10k a R$ 50k (tenho algo validado)" },
      { value: "50k_100k", label: "R$ 50k a R$ 100k (faturamento recorrente)" },
      { value: "over100k", label: "Acima de R$ 100k (estou em escala)" },
    ],
    required: true,
  },
  {
    id: "tamanho_time",
    type: "text",
    label: "Qual é o tamanho do seu time hoje?",
    description: "Estrategista, comercial, tráfego...",
    placeholder: "Ex: apenas eu, 3 pessoas, time de 10 pessoas...",
    required: true,
  },
  {
    id: "maior_gargalo",
    type: "textarea",
    label: "Qual é o seu maior gargalo hoje?",
    description: "Gestão, tráfego caro, falta de time comercial, lançamento que oscila demais?",
    placeholder: "Descreva seu maior desafio hoje...",
    required: true,
  },
  {
    id: "por_que_escolhido",
    type: "textarea",
    label: "Por que você acredita que a sua empresa deve ser uma das 15 escolhidas para estar no escritório da PLX no dia 14/07?",
    placeholder: "Explique por que sua empresa merece essa vaga...",
    required: true,
  },
  {
    id: "disponibilidade_presencial",
    type: "choice",
    label: "Você tem disponibilidade para estar presencialmente em Alphaville das 08h às 18h na data do evento?",
    options: [
      { value: "sim", label: "Sim, tenho disponibilidade total" },
      { value: "nao", label: "Não tenho disponibilidade / Tenho restrições" },
    ],
    required: true,
  },
];

// Welcome Video Component (Autoplay, Vertical 9:16 aspect ratio, mute/unmute control)
function WelcomeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    
    // Autoplay nativo forçado ao carregar
    video.play().catch((err) => {
      console.log("Autoplay bloqueado pelo navegador, aguardando clique.", err);
    });
    setStarted(true);
  }, []);

  function handleUnmute() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.play().catch(() => {});
    setMuted(false);
    setStarted(true);
  }

  function handleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    setMuted(true);
  }

  function handleToggle() {
    const v = videoRef.current;
    if (!v) return;
    if (muted) {
      handleUnmute();
    } else if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }

  return (
    <div className="w-full flex justify-center mt-8 md:mt-0">
      <div
        onClick={handleToggle}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "340px", // Aumentado conforme solicitado
          aspectRatio: "9/16",
          background: "#000",
          border: `1px solid ${T.border}`,
          borderRadius: "12px",
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: "0 0 50px rgba(227,27,35,0.15)",
        }}
      >
        <video
          ref={videoRef}
          src="/assets/bastidores.mp4"
          playsInline
          loop
          autoPlay
          muted
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            borderRadius: "11px",
          }}
        />

        {!started && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(7,7,15,0.45)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: T.ctaGrad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(227,27,35,0.4)",
              }}
            >
              <Play size={22} fill={T.white} color={T.white} style={{ marginLeft: 3 }} />
            </div>
          </div>
        )}

        <button
          aria-label={muted ? "Ativar som" : "Silenciar"}
          onClick={(e) => {
            e.stopPropagation();
            muted ? handleUnmute() : handleMute();
          }}
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            zIndex: 10,
            width: 34,
            height: 34,
            borderRadius: "6px",
            cursor: "pointer",
            border: `1px solid rgba(227,27,35,0.4)`,
            background: "rgba(227,27,35,0.15)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: T.white,
          }}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
}

// Cole aqui a URL do seu Web App do Google Apps Script ou do seu Webhook (Make/Zapier/n8n)
const GOOGLE_SHEETS_WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || "";

export default function QuizForm() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({
    nome_empresa: "",
    whatsapp: "",
    tempo_mercado: "",
    faturamento: "",
    tamanho_time: "",
    maior_gargalo: "",
    por_que_escolhido: "",
    disponibilidade_presencial: "",
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
    if (step === QUESTIONS.length - 1) {
      setTimeout(() => {
        submitQuiz();
      }, 280);
    } else {
      setTimeout(() => {
        setDirection(1);
        setStep((s) => s + 1);
      }, 280);
    }
  }

  // Multi choice toggler
  function toggleMultiChoice(value: string) {
    setAnswers((prev) => {
      const currentList: string[] = prev[currentQuestion.id] || [];
      let newList: string[];

      if (value === "none") {
        newList = currentList.includes("none") ? [] : ["none"];
      } else {
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

  async function submitQuiz() {
    setLoading(true);
    setErrorMsg("");

    const dataToSend = {
      data_envio: new Date().toLocaleString("pt-BR"),
      nome_empresa: answers.nome_empresa,
      whatsapp: answers.whatsapp,
      tempo_mercado: answers.tempo_mercado,
      faturamento: answers.faturamento,
      tamanho_time: answers.tamanho_time,
      maior_gargalo: answers.maior_gargalo,
      por_que_escolhido: answers.por_que_escolhido,
      disponibilidade_presencial: answers.disponibilidade_presencial,
    };

    console.log("Enviando respostas:", dataToSend);

    try {
      if (GOOGLE_SHEETS_WEBHOOK_URL) {
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Erro ao enviar dados:", err);
      setErrorMsg("Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate overall progress percentage
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

          <div className={`w-full mx-auto px-6 py-4 flex items-center justify-between transition-all duration-300 ${isWelcome && !submitted ? "max-w-4xl" : "max-w-xl"}`}>
            <div className="flex items-center gap-3">
              <span
                style={{ fontFamily: BEBAS }}
                className="text-2xl tracking-wider text-white"
              >
                LUIZ FILHO
              </span>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              <span className="text-xs uppercase tracking-widest text-white/40">
                O Bastidor do Bastidor
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
        <main className="relative flex-grow py-12 z-10 flex items-center">
          <div className={`w-full mx-auto px-6 transition-all duration-300 ${isWelcome && !submitted ? "max-w-4xl" : "max-w-xl"}`}>
            <AnimatePresence mode="wait" custom={direction}>
              {!submitted ? (
                <motion.div
                  key={currentQuestion.id}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 40 : -40, scale: 0.98 }),
                    center: { opacity: 1, y: 0, scale: 1 },
                    exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -40 : 40, scale: 0.98 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease }}
                  className="w-full"
                >
                  <div className={`w-full ${isWelcome ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center" : "flex flex-col"}`}>
                    
                    {/* Left Column / Text Content */}
                    <div className="flex flex-col">
                      {/* Step indicator */}
                      {!isWelcome && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-950/40 border border-red-950 px-2 py-0.5 rounded">
                            Passo {currentQuestionIndex} de {totalQuestions}
                          </span>
                        </div>
                      )}

                      {/* Question Title & Desc */}
                      <div className="mb-6">
                        <h2
                          style={{
                            fontFamily: isWelcome ? BEBAS : INTER,
                            fontSize: isWelcome
                              ? "clamp(34px, 7vw, 48px)"
                              : "clamp(20px, 4.5vw, 26px)",
                            lineHeight: 1.15,
                            fontWeight: isWelcome ? 900 : 700,
                            letterSpacing: isWelcome ? "0.03em" : "-0.01em",
                          }}
                          className="text-white mb-3"
                        >
                          {currentQuestion.label}
                        </h2>
                        {currentQuestion.description && (
                          <p className="text-white/60 text-sm leading-relaxed max-w-[50ch] whitespace-pre-line">
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
                              className="px-8 py-4 text-white font-bold rounded-lg tracking-wide shadow-lg cursor-pointer flex items-center gap-2.5 group transition-shadow border-0"
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
                                fontSize: "17px",
                                border: `1.5px solid ${errorMsg ? "#ef4444" : T.border}`,
                                background: "rgba(255, 255, 255, 0.02)",
                              }}
                              className="w-full rounded-lg p-4 text-white outline-none focus:border-red-500 focus:bg-white/[0.04] transition-all resize-none"
                            />
                          </div>
                        )}

                        {/* Single Choice */}
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

                        {/* Bottom CTA */}
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
                    </div>

                    {/* Right Column / Video (Welcome Screen only) */}
                    {isWelcome && (
                      <WelcomeVideo />
                    )}

                  </div>
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
                    <div className="absolute top-0 right-0 text-red-500 animate-pulse">
                      <Sparkles size={16} />
                    </div>
                  </div>

                  <h2
                    style={{ fontFamily: BEBAS }}
                    className="text-4xl sm:text-5xl tracking-wide text-white mb-4"
                  >
                    Recebemos seus dados.
                  </h2>

                  <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-[45ch] mb-4">
                    Agora o meu time (e eu) vamos analisar sua operação. Eu preciso garantir que quem estiver naquela sala vai realmente transbordar e aproveitar o que a gente vai entregar.
                    <br /><br />
                    Fica de olho no seu WhatsApp. Se o seu perfil fizer sentido para o que vamos construir no dia 14, a gente entra em contato para finalizar sua inscrição.
                  </p>

                  <p style={{ fontFamily: BEBAS }} className="text-xl text-red-500 tracking-wider mb-8">
                    Luiz Filho
                  </p>

                  {/* Priority box */}
                  <div 
                    style={{ 
                      border: `1.5px solid ${T.border}`, 
                      background: "rgba(227,27,35,0.05)", 
                      borderRadius: "10px",
                      padding: "24px",
                      marginBottom: "12px",
                      boxShadow: "0 0 40px rgba(227,27,35,0.08)"
                    }}
                    className="w-full max-w-md text-center"
                  >
                    <p className="text-white/90 text-sm font-semibold mb-2">
                      Quer ter prioridade na análise da sua vaga?
                    </p>
                    <p className="text-white/50 text-xs leading-relaxed mb-5">
                      Se você quer acelerar o seu processo de seleção e falar diretamente com a nossa equipe, clique no botão abaixo para nos mandar uma mensagem.
                    </p>
                    <motion.a
                      href="https://wa.me/551150285962?text=Olá,%20acabei%20de%20fazer%20minha%20aplicação%20para%20o%20Bastidor%20do%20Bastidor."
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ background: T.ctaGrad, display: "block" }}
                      className="w-full py-3.5 rounded-lg text-white font-bold tracking-wide shadow-lg cursor-pointer text-sm"
                    >
                      Furar Fila pelo WhatsApp
                    </motion.a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer info */}
        <footer className="relative w-full z-20 pb-6">
          <div className="max-w-4xl mx-auto px-6 text-center text-xs text-white/20 select-none">
            © 2026 Luiz Filho · Todos os direitos reservados.
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
