import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Lenis from "lenis";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MapPin, Calendar, Check, ChevronLeft, ChevronRight, X, Volume2, VolumeX, Play } from "lucide-react";

// ─── Design tokens (extraídos do HTML real do 10X Business Summit) ───────────
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
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";
const ease  = [0.22, 1, 0.36, 1] as const;
const vp    = { once: true, margin: "-80px 0px" };

// ─── Percentual dinâmico baseado na proximidade do evento ────────────────────
// Começa em 52% na data de abertura de vendas, sobe até 94% no dia do evento
const SALE_START  = new Date("2026-03-01").getTime();
const EVENT_TIME  = new Date("2026-07-22T09:00:00").getTime();
const WA_URL = "https://wa.me/551150285962?text=Ol%C3%A1!%20Tenho%20interesse%20em%20garantir%20meu%20ingresso%20para%20o%20C%C3%B3digo%20da%20Escala.";

function getTicketPct() {
  const now     = Date.now();
  const total   = EVENT_TIME - SALE_START;
  const elapsed = Math.max(0, now - SALE_START);
  const t       = Math.min(elapsed / total, 1);
  // curva convexa (^5): fica baixo por bastante tempo, dispara nas últimas semanas
  // 01/03 → 55% | 29/06 → ~72% | 15/07 → ~86% | 22/07 → 95%
  return Math.round(55 + 40 * Math.pow(t, 5));
}

// ─── Mobile detection ────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// ─── Lenis ───────────────────────────────────────────────────────────────────
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    let rafId: number;
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
  }, []);
}

// ─── CTA button — exato do reference ─────────────────────────────────────────
function CTA({ href, label, fullWidth = false, size = "md" }: {
  href: string; label: string; fullWidth?: boolean; size?: "sm" | "md" | "lg";
}) {
  const py = size === "lg" ? "17px" : size === "sm" ? "10px" : "14px";
  const px = size === "lg" ? "44px" : size === "sm" ? "20px" : "38px";
  const fs = size === "lg" ? "14px" : size === "sm" ? "11.5px" : "13px";
  return (
    <motion.a href={href}
      whileHover={{ y: -2, boxShadow: "0 18px 52px rgba(227,27,35,0.42)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22 }}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:12,
        padding:`${py} ${px}`, background:T.ctaGrad, color:T.white, fontFamily:INTER,
        fontSize:fs, fontWeight:800, letterSpacing:"0.17em", textTransform:"uppercase",
        textDecoration:"none", cursor:"pointer", position:"relative", overflow:"hidden",
        width: fullWidth ? "100%" : undefined, whiteSpace:"nowrap" }}>
      <span style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 55%)", pointerEvents:"none" }} />
      <span style={{ position:"relative", zIndex:1 }}>{label}</span>
      <svg style={{ position:"relative", zIndex:1, flexShrink:0 }} width={size==="sm"?13:16} height={size==="sm"?13:16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </motion.a>
  );
}

// ─── Eyebrow ─────────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: string }) {
  return (
    <motion.div variants={{ hidden:{opacity:0,y:-12}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:20 }}>
      <span style={{ width:28, height:1.5, background:T.accent, flexShrink:0 }} />
      <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:T.white }}>{children}</span>
      <span style={{ width:28, height:1.5, background:T.accent, flexShrink:0 }} />
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"7px 14px",
      border:`1px solid ${T.border}`, borderRadius:3, background:T.surface,
      fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
      color:"rgba(250,250,250,0.75)", whiteSpace:"nowrap", fontFamily:INTER }}>
      {icon}{label}
    </div>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const items = Array(14).fill(text);
  return (
    <div style={{ padding:"12px 0", overflow:"hidden", borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, background:"rgba(227,27,35,0.03)" }}>
      <motion.div style={{ display:"flex", gap:0, whiteSpace:"nowrap" }}
        animate={{ x: reverse ? ["-50%","0%"] : ["0%","-50%"] }}
        transition={{ duration:28, repeat:Infinity, ease:"linear" }}>
        {[...items,...items].map((t,i) => (
          <span key={i} style={{ margin:"0 32px", color:"rgba(227,27,35,0.45)", fontSize:11, textTransform:"uppercase", letterSpacing:"0.35em", fontWeight:700, flexShrink:0, fontFamily:INTER }}>
            {t} <span style={{ color:"rgba(227,27,35,0.2)", margin:"0 8px" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── NumberTicker ─────────────────────────────────────────────────────────────
function NumberTicker({ value, prefix = "", suffix = "" }: { value:number; prefix?:string; suffix?:string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const dur = 1600, start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now-start)/dur, 1);
      const e = 1-Math.pow(1-p,3);
      if (ref.current) ref.current.textContent = prefix+Math.floor(e*value).toLocaleString("pt-BR")+suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value, prefix, suffix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ─── TestimonialVideo — autoplay vertical, mute/unmute reinicia do início ─────
function TestimonialVideo({ src, summary }: { src: string; summary: string }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [muted, setMuted]     = useState(true);
  const [started, setStarted] = useState(false);

  // Fix: React não sincroniza `muted` como atributo HTML — setar direto no DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { video.play().catch(()=>{}); setStarted(true); }
        else                      { video.pause(); }
      },
      { threshold: 0.3 }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  function handleUnmute() {
    const v = videoRef.current;
    if (!v) return;
    // reinicia do início e ativa som
    v.currentTime = 0;
    v.muted = false;
    v.play().catch(()=>{});
    setMuted(false);
    setStarted(true);
  }

  function handleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    setMuted(true);
  }

  return (
    <div>
      {/* borderRadius aplicado direto no <video>, sem overflow:hidden no container */}
      <div onClick={() => { const v = videoRef.current; if (!v) return; if (muted) { handleUnmute(); } else if (v.paused) { v.play().catch(()=>{}); } else { v.pause(); } }}
        style={{ position:"relative", aspectRatio:"9/16", background:"#000",
          border:`1px solid ${T.border}`, borderRadius:3, cursor:"pointer" }}>
        <video
          ref={videoRef}
          src={src}
          playsInline
          loop
          preload="metadata"
          style={{ width:"100%", height:"100%", display:"block", objectFit:"cover", borderRadius:3 }}
        />

        {!started && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(7,7,15,0.5)", pointerEvents:"none", borderRadius:3 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:T.ctaGrad,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 24px rgba(227,27,35,0.5)" }}>
              <Play size={20} fill={T.white} color={T.white} style={{ marginLeft:3 }} />
            </div>
          </div>
        )}

        {muted ? (
          <button onClick={e => { e.stopPropagation(); handleUnmute(); }}
            style={{ position:"absolute", bottom:10, right:10, zIndex:10,
              width:30, height:30, borderRadius:3, cursor:"pointer",
              border:`1px solid rgba(227,27,35,0.4)`,
              background:"rgba(227,27,35,0.15)", backdropFilter:"blur(8px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:T.accentLight }}>
            <VolumeX size={13} />
          </button>
        ) : (
          <button onClick={e => { e.stopPropagation(); handleMute(); }}
            style={{ position:"absolute", bottom:10, right:10, zIndex:10,
              width:30, height:30, borderRadius:3, cursor:"pointer",
              border:`1px solid rgba(227,27,35,0.4)`,
              background:"rgba(227,27,35,0.15)", backdropFilter:"blur(8px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:T.accentLight }}>
            <Volume2 size={13} />
          </button>
        )}
      </div>

      <p style={{ marginTop:10, fontFamily:INTER, fontSize:12, color:T.muted,
        lineHeight:1.65, borderLeft:`2px solid rgba(227,27,35,0.35)`, paddingLeft:10 }}>
        {summary}
      </p>
    </div>
  );
}

function TestimonialsMobileSlider({ items }: { items: { n: number; summary: string }[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start", containScroll: "trimSnaps" });
  return (
    <div style={{ overflow:"hidden" }} ref={emblaRef}>
      <div style={{ display:"flex", gap:12 }}>
        {items.map(({ n, summary }) => (
          <div key={n} style={{ flex:"0 0 82%", minWidth:0 }}>
            <TestimonialVideo src={`/assets/depoimento-${n}.mp4`} summary={summary} />
          </div>
        ))}
      </div>
    </div>
  );
}

const EXPERTS_DATA = [
  { img:"expert3", name:"Pablo Marçal", role:"Empresário e Mentor",
    bio:"13M de seguidores. Criador do Método IP. Referência nacional em mentalidade e resultados para empreendedores." },
  { img:"expert2", name:"Rapha Tarso", role:"Mentor e Terapeuta Cristão",
    bio:"699k seguidores. Especialista em autoconhecimento e desenvolvimento humano. +10 anos transformando vidas." },
  { img:"expert1", name:"Mateus Ribeiro", role:"Mentor e Treinador de Líderes",
    bio:"211k seguidores. Mentor de empresários em expansão. Mais de 100 mil líderes treinados ao longo da carreira." },
];

function ExpertsMobileSlider() {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start", containScroll: "trimSnaps" });
  return (
    <div style={{ overflow:"hidden", marginBottom:56 }} ref={emblaRef}>
      <div style={{ display:"flex", gap:16 }}>
        {EXPERTS_DATA.map((expert, i) => (
          <div key={i} style={{ flex:"0 0 78%", minWidth:0, display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ aspectRatio:"3/4", borderRadius:6, overflow:"hidden",
              border:`1px solid ${T.border}`,
              boxShadow:`0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px ${T.border}` }}>
              <img src={`/assets/${expert.img}.webp`} alt={expert.name}
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }} />
            </div>
            <div>
              <p style={{ fontFamily:BEBAS, fontSize:22, letterSpacing:"0.04em", color:T.white, lineHeight:1 }}>{expert.name}</p>
              <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:T.accent, margin:"4px 0 8px" }}>{expert.role}</p>
              <p style={{ fontFamily:INTER, fontSize:12, color:T.muted, lineHeight:1.6 }}>{expert.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q:"Quando será o evento?", a:"22 e 23 de julho de 2026, das 09h às 18h." },
  { q:"Onde será o evento?", a:"Alphaville, São Paulo — SP. O endereço completo é enviado por e-mail e WhatsApp após a confirmação da compra." },
  { q:"Para quem é o Código da Escala?", a:"Para infoprodutores, estrategistas, co-produtores e gestores de tráfego que já fazem lançamento (ou estão prontos pra começar) e querem sair do modelo que depende de sorte, de aparecer toda semana, ou só de orgânico." },
  { q:"Sou menor de 18 anos, posso participar?", a:"Não. O evento é voltado exclusivamente para maiores de 18 anos." },
  { q:"Como funciona o ingresso Diamond?", a:"O ingresso Diamond garante tudo do ingresso Padrão, além de acesso às melhores cadeiras, prioridade nas perguntas ao vivo e uma experiência exclusiva: jantar na casa do Luiz Filho ao final do segundo dia." },
  { q:"Como recebo meu ingresso?", a:"Assim que a compra for confirmada, você recebe por e-mail e WhatsApp a confirmação com todas as instruções de acesso ao evento." },
];

function FAQSection() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <section style={{ padding:"96px 32px", background:"rgba(255,255,255,0.02)" }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={vp}
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
          style={{ textAlign:"center", marginBottom:56 }}>
          <Eyebrow>Dúvidas Frequentes</Eyebrow>
          <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
            style={{ fontFamily:BEBAS, fontSize:"clamp(36px,4vw,64px)", lineHeight:1.02, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white }}>
            TEM ALGUMA <span style={{ color:T.accentLight }}>DÚVIDA?</span>
          </motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={vp}
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } }}
          style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {FAQS.map((faq,i) => (
            <motion.div key={i} variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}>
              <div onClick={() => setOpen(open===i?null:i)} style={{ cursor:"pointer",
                background: open===i ? "rgba(227,27,35,0.06)" : T.surface,
                border:`1px solid ${open===i ? "rgba(227,27,35,0.4)" : T.border}`,
                borderRadius:3, transition:"all 0.2s" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", gap:16 }}>
                  <span style={{ fontFamily:INTER, fontSize:15, fontWeight:600, color:T.white, flex:1 }}>{faq.q}</span>
                  <motion.span animate={{ rotate: open===i ? 45 : 0 }} transition={{ duration:0.22 }}
                    style={{ flexShrink:0, width:24, height:24, border:`1px solid ${T.border}`, borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center", color:T.accentLight, fontSize:18, fontWeight:300 }}>+</motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {open===i && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.3, ease }} style={{ overflow:"hidden" }}>
                      <div style={{ padding:"0 20px 18px", borderTop:`1px solid ${T.border}` }}>
                        <p style={{ paddingTop:14, fontFamily:INTER, fontSize:15, color:T.muted, lineHeight:1.65 }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={vp} transition={{ duration:0.6, ease }}
          style={{ marginTop:32, background:T.surface, border:`1px solid ${T.border}`, borderRadius:3, padding:"28px 32px", textAlign:"center" }}>
          <p style={{ fontFamily:BEBAS, fontSize:24, letterSpacing:"0.05em", color:T.white, marginBottom:4 }}>AINDA TEM DÚVIDAS?</p>
          <p style={{ fontFamily:INTER, fontSize:14, color:T.accentLight, marginBottom:20 }}>Fale com nossa equipe</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
            <a href="mailto:contato@mail.luizfilho.com" style={{ display:"inline-flex", alignItems:"center", gap:8, border:`1px solid ${T.border}`, borderRadius:3, padding:"8px 16px", textDecoration:"none" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.accentLight} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span style={{ fontFamily:INTER, fontSize:13, color:T.muted }}>mail.luizfilho.com</span>
            </a>
            <a href={WA_URL} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:8, border:`1px solid ${T.border}`, borderRadius:3, padding:"8px 16px", textDecoration:"none" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill={T.accentLight}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span style={{ fontFamily:INTER, fontSize:13, color:T.muted }}>(11) 5028-5962</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────
const EVENT_DATE = new Date("2026-07-22T09:00:00");

function useCountdown(target: Date) {
  const calc = () => {
    const d = Math.max(0, target.getTime()-Date.now());
    return { days:Math.floor(d/86400000), hours:Math.floor((d%86400000)/3600000), mins:Math.floor((d%3600000)/60000), secs:Math.floor((d%60000)/1000) };
  };
  const [t,setT] = useState(calc);
  useEffect(() => { const id=setInterval(()=>setT(calc()),1000); return ()=>clearInterval(id); },[]);
  return t;
}

function FlipDigit({ value }: { value: string }) {
  return (
    <div className="cd-font" style={{ position:"relative", overflow:"hidden",
      fontSize:"clamp(32px,4vw,56px)", height:"1.15em", width:"2.4ch",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <AnimatePresence initial={false}>
        <motion.span key={value}
          initial={{ y:"100%", opacity:0 }} animate={{ y:"0%", opacity:1 }} exit={{ y:"-100%", opacity:0 }}
          transition={{ duration:0.28, ease:[0.22,1,0.36,1] }}
          style={{ position:"absolute", fontFamily:BEBAS, fontSize:"inherit", letterSpacing:"0.05em", color:T.white, lineHeight:1 }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function CountdownSection() {
  const { days, hours, mins, secs } = useCountdown(EVENT_DATE);
  const pad = (n:number) => String(n).padStart(2,"0");
  return (
    <section style={{ padding:"96px 32px", background:T.bg, borderTop:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={vp}
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:40 }}>
          <div>
            <Eyebrow>Último Aviso</Eyebrow>
            <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
              style={{ fontFamily:BEBAS, fontSize:"clamp(40px,5vw,80px)", lineHeight:1.02, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white }}>
              AS VAGAS <span style={{ color:T.accentLight }}>ESTÃO ACABANDO</span>
            </motion.h2>
          </div>
          <motion.p variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
            style={{ fontFamily:INTER, fontSize:"clamp(16px,1.5vw,20px)", color:T.muted, maxWidth:560, lineHeight:1.65 }}>
            Se você continuar tomando as mesmas decisões, vai continuar tendo os mesmos resultados. O Código da Escala é o ambiente para quem decidiu mudar isso.
          </motion.p>
          <motion.div variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
            className="cd-row" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
            {[{v:pad(days),l:"DIAS"},{v:pad(hours),l:"HORAS"},{v:pad(mins),l:"MIN"},{v:pad(secs),l:"SEG"}].map(({v,l}) => (
              <div key={l} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                width:88, height:104, background:T.surface, border:`1px solid ${T.border}`, borderRadius:3 }} className="cd-box">
                <FlipDigit value={v} />
                <span style={{ fontFamily:INTER, fontSize:10, letterSpacing:"0.15em", color:T.muted, marginTop:6, fontWeight:600 }}>{l}</span>
              </div>
            ))}
          </motion.div>
          <motion.div variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}>
            <CTA href="#ingressos" label="QUERO GARANTIR MEU INGRESSO AGORA" size="lg" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── VSL Video ────────────────────────────────────────────────────────────────
function VSLVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted]     = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { video.play().catch(()=>{}); setStarted(true); }
        else                      { video.pause(); }
      },
      { threshold: 0.25 }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  function handleUnmute() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.play().catch(()=>{});
    setMuted(false);
    setStarted(true);
  }

  function handleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    setMuted(true);
  }

  return (
    <div style={{ position:"relative", width:"100%",
      border:`1px solid ${T.border}`,
      boxShadow:`0 0 0 1px rgba(227,27,35,0.2), 0 0 80px rgba(227,27,35,0.15), 0 40px 90px rgba(0,0,0,0.6)` }}>
      <div onClick={() => { const v = videoRef.current; if (!v) return; if (muted) { handleUnmute(); } else if (v.paused) { v.play().catch(()=>{}); } else { v.pause(); } }}
        style={{ aspectRatio:"16/9", position:"relative", background:"#000", cursor:"pointer" }}>
        <video
          ref={videoRef}
          src="/assets/vsl.mp4"
          playsInline
          loop
          preload="metadata"
          style={{ width:"100%", height:"100%", display:"block", objectFit:"cover" }}
        />

        {!started && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(7,7,15,0.55)", pointerEvents:"none" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:T.ctaGrad,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 40px rgba(227,27,35,0.6)" }}>
              <Play size={28} fill={T.white} color={T.white} style={{ marginLeft:4 }} />
            </div>
          </div>
        )}

        {muted ? (
          <button onClick={e => { e.stopPropagation(); handleUnmute(); }}
            style={{ position:"absolute", bottom:14, right:14, zIndex:10,
              width:36, height:36, borderRadius:4, cursor:"pointer",
              border:`1px solid rgba(227,27,35,0.4)`,
              background:"rgba(227,27,35,0.15)", backdropFilter:"blur(8px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:T.accentLight }}>
            <VolumeX size={15} />
          </button>
        ) : (
          <button onClick={e => { e.stopPropagation(); handleMute(); }}
            style={{ position:"absolute", bottom:14, right:14, zIndex:10,
              width:36, height:36, borderRadius:4, cursor:"pointer",
              border:`1px solid rgba(227,27,35,0.4)`,
              background:"rgba(227,27,35,0.15)", backdropFilter:"blur(8px)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:T.accentLight }}>
            <Volume2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Embla photo carousel ─────────────────────────────────────────────────────
function EventCarousel() {
  const autoplay = useRef(Autoplay({ delay:2800, stopOnMouseEnter:true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop:true, align:"start" }, [autoplay.current]);
  const prev = useCallback(()=>emblaApi?.scrollPrev(),[emblaApi]);
  const next = useCallback(()=>emblaApi?.scrollNext(),[emblaApi]);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={prev} style={{ position:"absolute", left:0, top:"50%", transform:"translate(-50%,-50%)", zIndex:10, width:34, height:34, borderRadius:"50%", border:`1px solid ${T.border}`, background:T.surface, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.white }}>
        <ChevronLeft size={16} />
      </button>
      <div style={{ overflow:"hidden", margin:"0 20px" }} ref={emblaRef}>
        <div style={{ display:"flex", gap:10 }}>
          {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => (
            <div key={n} style={{ flex:"0 0 220px", aspectRatio:"4/3", borderRadius:3, overflow:"hidden",
              border:`1px solid ${T.border}` }}>
              <img src={`/assets/bot${n}.webp`} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </div>
          ))}
        </div>
      </div>
      <button onClick={next} style={{ position:"absolute", right:0, top:"50%", transform:"translate(50%,-50%)", zIndex:10, width:34, height:34, borderRadius:"50%", border:`1px solid ${T.border}`, background:T.surface, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.white }}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Exit Intent Popup ────────────────────────────────────────────────────────
function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    const h = (e:MouseEvent) => { if(fired.current||e.clientY>10)return; fired.current=true; setVisible(true); };
    document.addEventListener("mouseleave", h);
    return () => document.removeEventListener("mouseleave", h);
  },[]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}
          onClick={e=>{ if(e.target===e.currentTarget)setVisible(false); }}
          style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.85)" }}>
          <motion.div initial={{ scale:0.88, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.92, opacity:0 }} transition={{ duration:0.35, ease }}
            style={{ position:"relative", width:"100%", maxWidth:560 }}>
            <button onClick={()=>setVisible(false)} style={{ position:"absolute", top:-14, right:-14, zIndex:10, width:36, height:36, borderRadius:"50%", border:`1px solid ${T.border}`, background:T.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.white }}>
              <X size={16} />
            </button>
            <div style={{ overflow:"hidden", border:`1px solid ${T.border}`, borderRadius:3 }}>
              <div style={{ padding:"14px 24px", textAlign:"center", background:T.ctaGrad, fontFamily:INTER, fontSize:13, fontWeight:700, letterSpacing:"0.1em", color:T.white }}>
                CÓDIGO DA ESCALA · ALPHAVILLE · 22 E 23 DE JULHO
              </div>
              <div style={{ background:T.bg, padding:"44px 36px", textAlign:"center" }}>
                <p style={{ fontFamily:BEBAS, fontSize:42, letterSpacing:"0.05em", color:T.white, marginBottom:10 }}>AINDA TEM DÚVIDAS?</p>
                <p style={{ fontFamily:INTER, fontSize:16, color:T.muted, lineHeight:1.6, marginBottom:32 }}>Fale agora com nosso time pelo WhatsApp e tire todas as suas dúvidas antes de garantir sua vaga.</p>
                <CTA href={WA_URL} label="FALAR COM O TIME" fullWidth size="lg" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CodigoEscalaV3() {
  useLenis();
  const pct = getTicketPct();
  const isMobile = useIsMobile();

  return (
    <div style={{ background:T.bg, color:T.white, fontFamily:INTER, minHeight:"100vh", WebkitFontSmoothing:"antialiased" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 640px) {
          .ub-secondary { display: none !important; }
          .cd-row { flex-wrap: nowrap !important; gap: 6px !important; }
          .cd-box { width: 68px !important; height: 80px !important; min-width: 0 !important; }
          .cd-font { font-size: 28px !important; width: 2ch !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          URGENCY BAR — percentual dinâmico baseado na data
          sem a segunda barra de nav (removida por pedido)
      ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.05 }}
        style={{ position:"fixed", top:0, left:0, right:0, zIndex:60,
          display:"flex", alignItems:"center", justifyContent:"center", gap:16, padding:"10px 24px",
          background:"rgba(7,7,15,0.92)", backdropFilter:"blur(16px)",
          borderBottom:`1px solid ${T.border}` }}>
        {/* Pill com % dinâmico */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px 6px 10px",
          border:"1px solid rgba(227,27,35,0.5)", borderRadius:100, background:"rgba(227,27,35,0.1)" }}>
          <motion.span
            animate={{ boxShadow:["0 0 0 0 rgba(227,27,35,0.55)","0 0 0 5px rgba(227,27,35,0)","0 0 0 0 rgba(227,27,35,0.55)"] }}
            transition={{ duration:1.8, repeat:Infinity }}
            style={{ width:7, height:7, borderRadius:"50%", background:T.accent, flexShrink:0, display:"block" }} />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#FF5A5A" }}>
            {pct}% DAS VAGAS VENDIDAS
          </span>
        </div>
        <span className="ub-secondary" style={{ width:1, height:16, background:T.border, flexShrink:0 }} />
        <span className="ub-secondary" style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:T.veryMuted }}>
          Infoprodutores · Estrategistas · Co-Produtores · Mentores · Profissionais Liberais
        </span>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          PRIMEIRA DOBRA — hero
          Tudo deve caber na viewport sem scroll:
          urgency bar (~52px) + conteúdo do hero
          Font menor: clamp(32px, 3.4vw, 58px) para 3 linhas caberem
      ══════════════════════════════════════════════════════════ */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", paddingTop:52 }}>

        {/* Bg + overlays exatos do reference */}
        <div style={{ position:"absolute", inset:0, backgroundColor:T.bg }}>
          <div style={{ position:"absolute", inset:0,
            backgroundImage:"url('/assets/bot8.webp')",
            backgroundSize:"cover", backgroundPosition:"center top" }} />
          <div style={{ position:"absolute", inset:0, background:`
            linear-gradient(to bottom, rgba(7,7,15,0.78) 0%, rgba(7,7,15,0.68) 25%, rgba(7,7,15,0.74) 60%, rgba(7,7,15,0.95) 100%),
            linear-gradient(to right,  rgba(7,7,15,0.45) 0%, rgba(7,7,15,0.1)  50%, rgba(7,7,15,0.45) 100%)
          ` }} />
        </div>

        {/* Glow radial vermelho */}
        <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
          background:"radial-gradient(ellipse 70% 50% at 50% 38%, rgba(227,27,35,0.07) 0%, transparent 70%)" }} />

        {/* Conteúdo — padding reduzido para tudo caber */}
        <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:1400, margin:"0 auto",
          padding:"20px 6% 48px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:20 }}>
            <span style={{ width:28, height:1.5, background:T.accent, flexShrink:0 }} />
            <span style={{ fontFamily:INTER, fontSize:13, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:T.white }}>
              Código da Escala
            </span>
            <span style={{ width:28, height:1.5, background:T.accent, flexShrink:0 }} />
          </motion.div>

          {/* Headline — 3 linhas com font menor para tudo caber
              Referência usava clamp(38,4.9vw,72) para 2 linhas.
              Com 3 linhas usamos clamp(32,3.4vw,58) */}
          <h1 style={{ fontFamily:BEBAS, fontSize:"clamp(32px,3.4vw,58px)", lineHeight:1.05,
            letterSpacing:"0.03em", color:T.white, marginBottom:16, maxWidth:1100 }}>
            <span style={{ color:T.veryMuted, display:"block" }}>
              {["Aprenda","o","método","que","já","gerou"].map((w,i) => (
                <motion.span key={w} initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.55, ease, delay: 0.18+i*0.07 }}
                  style={{ display:"inline-block", marginRight:"0.25em" }}>
                  {w}
                </motion.span>
              ))}
            </span>
            {["mais","de"].map((w,i) => (
              <motion.span key={w} initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
                transition={{ duration:0.55, ease, delay: 0.60+i*0.07 }}
                style={{ display:"inline-block", marginRight:"0.25em" }}>
                {w}
              </motion.span>
            ))}
            <motion.span initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.55, ease, delay: 0.74 }}
              style={{ display:"inline-block", color:T.accentLight, marginRight:"0.25em" }}>
              R$<NumberTicker value={300} suffix="M" />
            </motion.span>
            <span style={{ display:"block" }}>
              {["em","lançamentos","reais"].map((w,i) => (
                <motion.span key={w} initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.55, ease, delay: 0.86+i*0.07 }}
                  style={{ display:"inline-block", marginRight:"0.25em" }}>
                  {w}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Sub copy — mais compacto */}
          <motion.p initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease, delay:1.18 }}
            style={{ fontSize:"clamp(14px,1.3vw,18px)", fontWeight:400, lineHeight:1.55, color:T.muted,
              maxWidth:620, margin:"0 auto 28px", fontFamily:INTER }}>
            O sistema que Luiz Filho usou para operar 128+ lançamentos —
            em 2 dias presenciais, em Alphaville, São Paulo.
          </motion.p>

          {/* VSL no hero */}
          <motion.div initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease, delay:1.32 }}
            style={{ width:"100%", maxWidth:560, marginBottom:24 }}>
            <VSLVideo />
          </motion.div>

          {/* Bottom: badges + divider + CTA */}
          <motion.div initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease, delay:1.46 }}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
            <Badge icon={<Calendar size={12} strokeWidth={2.5} style={{ opacity:0.6, flexShrink:0 }} />} label="22–23 Jul 2026" />
            <span style={{ width:1, height:22, background:T.border, flexShrink:0 }} />
            <Badge icon={<MapPin size={12} strokeWidth={2.5} style={{ opacity:0.6, flexShrink:0 }} />} label="Alphaville, SP" />
            <span style={{ width:1, height:36, background:T.border, flexShrink:0 }} />
            <CTA href="#ingressos" label="Garantir minha vaga" />
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SEGUNDA DOBRA — Depoimentos verticais (4 colunas 9:16)
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"72px 32px", background:T.bg }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
            style={{ textAlign:"center", marginBottom:48 }}>
            <Eyebrow>Resultados Reais</Eyebrow>
            <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
              style={{ fontFamily:BEBAS, fontSize:"clamp(36px,4vw,64px)", lineHeight:1.05, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white }}>
              O QUE DIZEM OS <span style={{ color:T.accentLight }}>PARTICIPANTES</span>
            </motion.h2>
          </motion.div>
          {(() => {
            const items = [
              { n:1, summary:'Primeira vez no evento, saí transformada não só pelo conteúdo, mas pelas conexões. O evento entrega muito além do conteúdo. A expansão vem das conexões. — Flávia Lira, mentora de posicionamento' },
              { n:2, summary:'Fiquei impressionado com a combinação de maestria e humildade. Além de ser um maestro do digital, é um cara que se aproxima e entrega de verdade. — Rodrigo' },
              { n:3, summary:'Em dois meses e meio aplicando os métodos, fechei R$120 mil em mentoria nos últimos 10 dias. Se você fizer tudo que ele falar, do jeito que ele ensina, dá certo.' },
              { n:4, summary:'O Luiz foi o maior mentor que tive até aqui. Andar com gente nessa frequência muda completamente o jogo de qualquer pessoa. — Diego' },
            ];
            if (isMobile) {
              return <TestimonialsMobileSlider items={items} />;
            }
            return (
              <motion.div initial="hidden" whileInView="visible" viewport={vp}
                variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
                style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                {items.map(({ n, summary }) => (
                  <motion.div key={n} variants={{ hidden:{opacity:0,y:24}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}>
                    <TestimonialVideo src={`/assets/depoimento-${n}.mp4`} summary={summary} />
                  </motion.div>
                ))}
              </motion.div>
            );
          })()}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={vp} transition={{ duration:0.6, ease, delay:0.3 }}
            style={{ display:"flex", justifyContent:"center", marginTop:40 }}>
            <CTA href="#ingressos" label="QUERO MEU INGRESSO" />
          </motion.div>
        </div>
      </section>

      <Marquee text="Código da Escala · Alphaville · 22 e 23 de Julho de 2026" />

      {/* ══════════════════════════════════════════════════════════
          ISSO NÃO É...
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"96px 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:64, alignItems:"center" }}>
            <motion.div variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } }}
              style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[1,2,3,4].map(n => (
                <motion.div key={n}
                  variants={{ hidden:{opacity:0,scale:0.9}, visible:{opacity:1,scale:1,transition:{duration:0.5,ease}} }}
                  whileHover={{ scale:1.04 }} transition={{ duration:0.3 }}
                  style={{ aspectRatio:"1/1", borderRadius:3, overflow:"hidden",
                    border:`1px solid ${T.border}` }}>
                  <img src={`/assets/top${n}.webp`} alt=""
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                </motion.div>
              ))}
            </motion.div>
            <div>
              <motion.div variants={{ hidden:{opacity:0,x:-20}, visible:{opacity:1,x:0,transition:{duration:0.5,ease}} }}
                style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <span style={{ width:20, height:1.5, background:T.accent, flexShrink:0 }} />
                <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:T.accent }}>O que é o Código da Escala?</span>
              </motion.div>
              <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
                style={{ fontFamily:BEBAS, fontSize:"clamp(36px,3.5vw,60px)", lineHeight:1.02, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white, marginBottom:20 }}>
                ISSO NÃO É MAIS UM<br /><span style={{ color:T.accentLight }}>EVENTO DE MARKETING DIGITAL.</span>
              </motion.h2>
              <motion.div variants={{ hidden:{opacity:0,x:-20}, visible:{opacity:1,x:0,transition:{duration:0.4,ease}} }}
                style={{ width:40, height:2, background:"rgba(227,27,35,0.6)", marginBottom:24 }} />
              <motion.div variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
                style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {[
                  "Aqui não tem aula de \"diquinha\" de Instagram, hack de algoritmo ou promessa de fórmula mágica. O Código da Escala é o bastidor real de operações que já geraram mais de R$300 milhões — com o gerenciador de anúncios aberto e os números reais na tela, sem filtro.",
                  "Você vai sair de lá sabendo exatamente como construir um negócio que fatura com previsibilidade, antes mesmo do lançamento começar. Com comercial trabalhando todos os dias da semana, não só no carrinho aberto.",
                  "É pra você que já faz lançamento, mas vive de mês bom e mês ruim sem entender por quê. Que tem uma lista de leads parada e não sabe o que fazer com ela.",
                ].map((p,i) => (
                  <motion.p key={i} variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}
                    style={{ fontFamily:INTER, fontSize:15, lineHeight:1.7, color:T.muted }}>{p}</motion.p>
                ))}
              </motion.div>
              <motion.div variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }} style={{ marginTop:28 }}>
                <CTA href="#ingressos" label="QUERO PARTICIPAR" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Marquee text="Luiz Filho · 128+ Lançamentos · R$300M Gerados · Código da Escala" reverse />

      {/* ══════════════════════════════════════════════════════════
          QUANDO E ONDE
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"64px 32px", background:"rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, scale:0.96 }} whileInView={{ opacity:1, scale:1 }} viewport={vp} transition={{ duration:0.6, ease }}>
            <div style={{ position:"relative", overflow:"hidden", border:`1px solid ${T.border}`, borderRadius:3 }}>
              <div style={{ position:"absolute", inset:0,
                backgroundImage:"url('/assets/alphaville.jpg')",
                backgroundSize:"cover", backgroundPosition:"center" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, rgba(7,7,15,0.97) 45%, rgba(7,7,15,0.55) 100%)" }} />
              <div style={{ position:"relative", zIndex:10, padding:"48px 40px", display:"flex", flexDirection:"column", gap:20, maxWidth:520 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ width:20, height:1.5, background:T.accent, flexShrink:0 }} />
                  <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:T.accent }}>Quando e onde</span>
                </div>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <Calendar size={20} stroke={T.accentLight} strokeWidth={1.5} style={{ flexShrink:0, marginTop:4 }} />
                  <div>
                    <p style={{ fontFamily:BEBAS, fontSize:"clamp(24px,2.5vw,40px)", letterSpacing:"0.02em", color:T.white, lineHeight:1 }}>22 e 23 de Julho de 2026</p>
                    <p style={{ fontFamily:INTER, fontSize:13, color:T.muted, marginTop:4 }}>Quarta e quinta-feira · 09h às 18h</p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <MapPin size={20} stroke={T.accentLight} strokeWidth={1.5} style={{ flexShrink:0 }} />
                  <p style={{ fontFamily:BEBAS, fontSize:"clamp(24px,2.5vw,40px)", letterSpacing:"0.02em", color:T.white, lineHeight:1 }}>Alphaville — SP</p>
                </div>
                <CTA href="#ingressos" label="QUERO MEU INGRESSO" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PROGRAMAÇÃO — foco no conteúdo, sem horários
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"96px 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
            style={{ textAlign:"center", marginBottom:56 }}>
            <Eyebrow>Programação</Eyebrow>
            <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
              style={{ fontFamily:BEBAS, fontSize:"clamp(36px,4vw,64px)", lineHeight:1.02, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white }}>
              O QUE VOCÊ VAI <span style={{ color:T.accentLight }}>APRENDER.</span>
            </motion.h2>
          </motion.div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:32 }}>
            {[
              { label:"DIA 1", date:"22 de Julho", sessions:[
                { num:"01", title:"O Novo Jogo dos Lançamentos", desc:"Por que o modelo antigo quebrou e como o sistema que substitui ele redefine sua operação do zero." },
                { num:"02", title:"Posicionamento e Esteira de Produto", desc:"Como definir o público certo, precificar sem medo e montar o comercial sem inflar custo." },
                { num:"03", title:"O Funil que Substitui o Lançamento Gratuito", desc:"A lógica do low ticket, o lançamento pago e a estrutura completa do funil de quiz." },
              ]},
              { label:"DIA 2", date:"23 de Julho", sessions:[
                { num:"04", title:"A Aula Completa do Funil de Quiz", desc:"A estrutura exata que gerou R$13,4 milhões em vendas com um produto de R$47." },
                { num:"05", title:"Lançamento Aberto, Secreto e Semanal", desc:"Debriefing real de lançamentos de oito dígitos — com os números reais na tela, sem filtro." },
                { num:"06", title:"Escala e Liberdade", desc:"Como construir uma operação que fatura com previsibilidade sem depender de você aparecer todo dia." },
              ]},
            ].map((dia) => (
              <motion.div key={dia.label} initial="hidden" whileInView="visible" viewport={vp}
                variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.09 } } }}>
                {/* Day header */}
                <motion.div variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}
                  style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ padding:"4px 12px", background:T.ctaGrad, fontFamily:INTER, fontSize:11, fontWeight:800, letterSpacing:"0.15em", color:T.white, textTransform:"uppercase" }}>
                    {dia.label}
                  </div>
                  <span style={{ fontFamily:INTER, fontSize:12, color:T.muted }}>{dia.date}</span>
                </motion.div>
                {/* Sessions */}
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {dia.sessions.map((s,si) => (
                    <motion.div key={s.num}
                      variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.5,ease,delay:si*0.07}} }}
                      whileHover={{ x:4 }} transition={{ duration:0.2 }}
                      style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"16px 18px",
                        background:T.surface, border:`1px solid ${T.border}`, borderRadius:3 }}>
                      <span style={{ fontFamily:BEBAS, fontSize:26, color:"rgba(227,27,35,0.32)", letterSpacing:"0.04em", lineHeight:1, flexShrink:0, minWidth:28, paddingTop:1 }}>
                        {s.num}
                      </span>
                      <div>
                        <p style={{ fontFamily:INTER, fontSize:14, fontWeight:700, color:T.white, marginBottom:5 }}>{s.title}</p>
                        <p style={{ fontFamily:INTER, fontSize:12, color:T.muted, lineHeight:1.65 }}>{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PALESTRANTE — só Luiz Filho
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"96px 32px", background:"rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:48, alignItems:"center" }}>
            <motion.div variants={{ hidden:{opacity:0,scale:0.92}, visible:{opacity:1,scale:1,transition:{duration:0.6,ease}} }}>
              <motion.div whileHover={{ borderColor:"rgba(227,27,35,0.5)" }} transition={{ duration:0.3 }}
                style={{ aspectRatio:"3/4", borderRadius:3, overflow:"hidden", border:`1px solid ${T.border}` }}>
                <img src="/assets/luiz.webp" alt="Luiz Filho"
                  style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }} />
              </motion.div>
            </motion.div>
            <div>
              <motion.div variants={{ hidden:{opacity:0,x:-20}, visible:{opacity:1,x:0,transition:{duration:0.5,ease}} }}
                style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <span style={{ width:20, height:1.5, background:T.accent, flexShrink:0 }} />
                <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:T.accent }}>Palestrante</span>
              </motion.div>
              <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
                style={{ fontFamily:BEBAS, fontSize:"clamp(40px,4vw,72px)", lineHeight:1, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white, marginBottom:8 }}>
                Luiz Filho
              </motion.h2>
              <motion.p variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}
                style={{ fontFamily:INTER, fontSize:12, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:T.accentLight, marginBottom:24 }}>
                Estrategista de Lançamentos
              </motion.p>
              <motion.div variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
                style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
                {[
                  "Responsável por mais de 128 lançamentos digitais, acumulando R$300M+ em vendas ao longo da carreira.",
                  "Criador do sistema de lançamento contínuo que substitui o modelo de \"janelas\" — e que permite faturar com previsibilidade todos os meses.",
                  "Já trabalhou com os maiores nomes do mercado de infoprodutos do Brasil.",
                ].map((p,i) => (
                  <motion.p key={i} variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}
                    style={{ fontFamily:INTER, fontSize:14, lineHeight:1.65, color:T.muted }}>{p}</motion.p>
                ))}
              </motion.div>
              <motion.div variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.1 } } }}
                style={{ display:"flex", gap:0, marginBottom:32 }}>
                {[{v:128,p:"",s:"+",l:"Lançamentos"},{v:300,p:"R$",s:"M+",l:"Gerados"}].flatMap((st,si) => [
                  <div key={`v${si}`} style={{ textAlign:"center", padding:"0 20px", borderLeft: si>0 ? `1px solid ${T.border}` : undefined }}>
                    <p style={{ fontFamily:BEBAS, fontSize:36, letterSpacing:"0.02em", color:T.white, lineHeight:1 }}>
                      <NumberTicker value={st.v} prefix={st.p} suffix={st.s} />
                    </p>
                    <p style={{ fontFamily:INTER, fontSize:11, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>{st.l}</p>
                  </div>,
                ])}
              </motion.div>
              <motion.div variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}>
                <CTA href="#ingressos" label="QUERO APRENDER COM ELE" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          INGRESSOS
      ══════════════════════════════════════════════════════════ */}
      <section id="ingressos" style={{ padding:"96px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:"30%", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(227,27,35,0.1) 0%, transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }} />
        <div style={{ maxWidth:900, margin:"0 auto", position:"relative", zIndex:1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
            style={{ textAlign:"center", marginBottom:56 }}>
            <Eyebrow>Escolha seu ingresso</Eyebrow>
            <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
              style={{ fontFamily:BEBAS, fontSize:"clamp(40px,5vw,80px)", lineHeight:1, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white }}>
              VAGAS ABERTAS
            </motion.h2>
            <motion.p variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.5,ease}} }}
              style={{ fontFamily:INTER, fontSize:15, color:T.muted, marginTop:12 }}>
              Vagas limitadas. Garanta agora antes que acabem.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.15 } } }}
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16, alignItems:"start" }}>

            {/* PADRÃO */}
            <motion.div variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
              whileHover={{ y:-4 }} transition={{ duration:0.3 }}>
              <div style={{ display:"flex", flexDirection:"column",
                background:T.surface, border:`1px solid ${T.border}`, borderRadius:3, overflow:"hidden" }}>
                <div style={{ position:"relative", aspectRatio:"16/7", overflow:"hidden" }}>
                  <img src="/assets/bot8.webp" alt="Evento Código da Escala"
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(7,7,15,0.1) 0%, rgba(7,7,15,0.88) 100%)" }} />
                  <div style={{ position:"absolute", bottom:16, left:20, right:20 }}>
                    <p style={{ fontFamily:BEBAS, fontSize:22, letterSpacing:"0.04em", color:T.white, lineHeight:1.1 }}>2 DIAS DE IMERSÃO PRESENCIAL</p>
                    <p style={{ fontFamily:INTER, fontSize:12, color:T.muted, marginTop:2 }}>Alphaville · São Paulo · Julho 2026</p>
                  </div>
                </div>
                <div style={{ padding:"24px 24px 28px" }}>
                  <p style={{ fontFamily:BEBAS, fontSize:28, letterSpacing:"0.1em", color:T.accentLight }}>INGRESSO PADRÃO</p>
                  <div style={{ textAlign:"center", margin:"20px 0" }}>
                    <p style={{ fontFamily:INTER, fontSize:11, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>em até</p>
                    <p style={{ fontFamily:BEBAS, fontSize:48, letterSpacing:"0.02em", color:T.white, lineHeight:1 }}>
                      <span style={{ fontSize:20 }}>12x </span>R$ 41,42
                    </p>
                    <p style={{ fontFamily:INTER, fontSize:13, color:T.muted, marginTop:4 }}>ou R$ 497,00 à vista</p>
                  </div>
                  <div style={{ width:"100%", height:1, background:T.border, margin:"12px 0 20px" }} />
                  <p style={{ fontFamily:INTER, fontSize:14, color:T.muted, lineHeight:1.7, marginBottom:24 }}>
                    Acesso completo aos 2 dias de evento presencial em Alphaville, com os melhores profissionais do mercado de lançamentos do Brasil.
                  </p>
                  <CTA href={WA_URL} label="QUERO MEU INGRESSO" fullWidth />
                </div>
              </div>
            </motion.div>

            {/* DIAMOND */}
            <motion.div variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease,delay:0.15}} }}
              whileHover={{ y:-4 }} transition={{ duration:0.3 }}>
              <div style={{ display:"flex", flexDirection:"column",
                background:"rgba(227,27,35,0.06)", border:`1px solid rgba(227,27,35,0.5)`,
                borderRadius:3, boxShadow:"0 0 60px rgba(227,27,35,0.14)", overflow:"hidden" }}>

                {/* Foto do jantar */}
                <div style={{ position:"relative", aspectRatio:"16/7", overflow:"hidden" }}>
                  <img src="/assets/jantar.webp" alt="Jantar na casa do Luiz"
                    style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(7,7,15,0.1) 0%, rgba(7,7,15,0.85) 100%)" }} />
                  <div style={{ position:"absolute", bottom:16, left:20, right:20 }}>
                    <p style={{ fontFamily:BEBAS, fontSize:18, letterSpacing:"0.12em", textTransform:"uppercase", color:T.accentLight, marginBottom:2 }}>Experiência exclusiva</p>
                    <p style={{ fontFamily:BEBAS, fontSize:26, letterSpacing:"0.04em", color:T.white, lineHeight:1.1 }}>JANTAR NA CASA DO LUIZ FILHO</p>
                  </div>
                </div>

                <div style={{ padding:"24px 24px 28px" }}>
                  <p style={{ fontFamily:BEBAS, fontSize:28, letterSpacing:"0.1em", color:T.accentLight }}>INGRESSO DIAMOND</p>
                  <p style={{ fontFamily:INTER, fontSize:11, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>A MELHOR EXPERIÊNCIA DO EVENTO.</p>
                  <div style={{ textAlign:"center", margin:"0 0 20px" }}>
                    <p style={{ fontFamily:INTER, fontSize:11, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>em até</p>
                    <p style={{ fontFamily:BEBAS, fontSize:48, letterSpacing:"0.02em", color:T.white, lineHeight:1 }}>
                      <span style={{ fontSize:20 }}>12x </span>R$ 208,08
                    </p>
                    <p style={{ fontFamily:INTER, fontSize:13, color:T.muted, marginTop:4 }}>ou R$ 2.497,00 à vista</p>
                  </div>
                  <div style={{ width:"100%", height:1, background:"rgba(227,27,35,0.3)", margin:"12px 0 16px" }} />
                  <p style={{ fontFamily:INTER, fontSize:14, color:T.muted, lineHeight:1.7, marginBottom:16 }}>
                    Dois dias imersos no evento e um jantar exclusivo na casa do Luiz, em Alphaville. Uma noite reservada para sentar na mesa com ele, tirar suas dúvidas cara a cara e trocar ideia com a turma que já está no campo de batalha gerando resultado de verdade. É o momento de fazer o networking que você não faz em lugar nenhum, em um ambiente de proximidade total para quem decidiu parar de brincar e quer escalar o negócio com quem opera o novo jogo todo santo dia.
                  </p>
                  <CTA href={WA_URL} label="QUERO MEU INGRESSO" fullWidth />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOTOS DO EVENTO — fan de 3 cards + quote + carrossel
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"96px 32px", background:"rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={vp}
            variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
            style={{ textAlign:"center", marginBottom:64 }}>
            <Eyebrow>Quem já participou</Eyebrow>
            <motion.h2 variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease}} }}
              style={{ fontFamily:BEBAS, fontSize:"clamp(36px,4vw,64px)", lineHeight:1.02, letterSpacing:"0.02em", textTransform:"uppercase", color:T.white }}>
              VEJA QUEM JÁ PARTICIPOU DOS<br /><span style={{ color:T.accentLight }}>NOSSOS EVENTOS PRESENCIAIS</span>
            </motion.h2>
          </motion.div>

          {/* 3 experts — carrossel no mobile, grid no desktop */}
          {isMobile ? <ExpertsMobileSlider /> : (
            <motion.div initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.12 } } }}
              style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, marginBottom:56 }}>
              {EXPERTS_DATA.map((expert, i) => (
                <motion.div key={i}
                  variants={{ hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease,delay:i*0.1}} }}
                  whileHover={{ y:-6 }} transition={{ duration:0.3 }}
                  style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ aspectRatio:"3/4", borderRadius:6, overflow:"hidden",
                    border:`1px solid ${T.border}`,
                    boxShadow:`0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px ${T.border}` }}>
                    <img src={`/assets/${expert.img}.webp`} alt={expert.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }} />
                  </div>
                  <div>
                    <p style={{ fontFamily:BEBAS, fontSize:22, letterSpacing:"0.04em", color:T.white, lineHeight:1 }}>{expert.name}</p>
                    <p style={{ fontFamily:INTER, fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:T.accent, margin:"4px 0 8px" }}>{expert.role}</p>
                    <p style={{ fontFamily:INTER, fontSize:12, color:T.muted, lineHeight:1.6 }}>{expert.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quote */}
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={vp} transition={{ duration:0.6, ease }}
            style={{ textAlign:"center", marginBottom:52 }}>
            <p style={{ fontFamily:INTER, fontSize:"clamp(18px,2vw,26px)", fontStyle:"italic", fontWeight:700, color:T.accentLight, lineHeight:1.4 }}>
              "Eu nunca vi um evento como esse"
            </p>
          </motion.div>

          {/* Carrossel de fotos */}
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={vp} transition={{ duration:0.6, ease }}>
            <EventCarousel />
          </motion.div>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={vp} transition={{ duration:0.6, ease, delay:0.2 }}
            style={{ display:"flex", justifyContent:"center", marginTop:40 }}>
            <CTA href="#ingressos" label="QUERO MEU INGRESSO" />
          </motion.div>
        </div>
      </section>

      <FAQSection />
      <CountdownSection />

      <footer style={{ padding:"24px 32px", borderTop:`1px solid ${T.border}`, textAlign:"center", background:"rgba(0,0,0,0.3)" }}>
        <p style={{ fontFamily:INTER, fontSize:12, color:T.veryMuted }}>© 2026 Código da Escala. Todos os direitos reservados.</p>
      </footer>

      <ExitIntentPopup />
    </div>
  );
}
