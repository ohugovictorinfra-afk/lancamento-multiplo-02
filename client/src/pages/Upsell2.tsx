import { ArrowRight, Check, X, Play } from "lucide-react";

const TIERS = [
  {
    name: "STANDARD",
    highlight: false,
    benefits: [
      { text: "Acesso ao treinamento ao vivo", included: true },
      { text: "Gravação em Full HD", included: true },
      { text: "Workbook de aplicação", included: true },
      { text: "Acesso à plataforma", included: false },
      { text: "[PLACEHOLDER] Bônus VIP 1", included: false },
      { text: "[PLACEHOLDER] Bônus VIP 2", included: false },
      { text: "[PLACEHOLDER] Benefício Black 1", included: false },
      { text: "[PLACEHOLDER] Benefício Black 2", included: false },
      { text: "[PLACEHOLDER] Benefício Black 3", included: false },
    ],
  },
  {
    name: "VIP",
    highlight: false,
    benefits: [
      { text: "Acesso ao treinamento ao vivo", included: true },
      { text: "Gravação em Full HD", included: true },
      { text: "Workbook de aplicação", included: true },
      { text: "Acesso à plataforma", included: true },
      { text: "[PLACEHOLDER] Bônus VIP 1", included: true },
      { text: "[PLACEHOLDER] Bônus VIP 2", included: true },
      { text: "[PLACEHOLDER] Benefício Black 1", included: false },
      { text: "[PLACEHOLDER] Benefício Black 2", included: false },
      { text: "[PLACEHOLDER] Benefício Black 3", included: false },
    ],
  },
  {
    name: "BLACK",
    highlight: true,
    benefits: [
      { text: "Acesso ao treinamento ao vivo", included: true },
      { text: "Gravação em Full HD", included: true },
      { text: "Workbook de aplicação", included: true },
      { text: "Acesso à plataforma", included: true },
      { text: "[PLACEHOLDER] Bônus VIP 1", included: true },
      { text: "[PLACEHOLDER] Bônus VIP 2", included: true },
      { text: "[PLACEHOLDER] Benefício Black 1", included: true },
      { text: "[PLACEHOLDER] Benefício Black 2", included: true },
      { text: "[PLACEHOLDER] Benefício Black 3", included: true },
    ],
  },
];

const SPOTS_LEFT = 7;

function BenefitIcon({ included }: { included: boolean }) {
  return included ? (
    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
      <Check className="w-3 h-3 text-white" strokeWidth={3} />
    </div>
  ) : (
    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
      <X className="w-2.5 h-2.5 text-white/20" strokeWidth={2} />
    </div>
  );
}

function GreenCTA({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:scale-[0.98] text-black font-black text-base md:text-lg uppercase tracking-widest px-8 py-4 rounded-md transition-all w-full max-w-lg mx-auto"
    >
      {label}
      <ArrowRight className="w-5 h-5" strokeWidth={3} />
    </a>
  );
}

export default function Upsell2() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* 1. Banner */}
      <div className="bg-accent w-full py-3 text-center">
        <span className="text-white font-black text-xl md:text-2xl tracking-widest uppercase">
          ⚠️ IMPORTANTE
        </span>
      </div>

      {/* 2. Logo / Marca */}
      <div className="flex flex-col items-center pt-10 pb-6 px-4 text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center">
            <span className="text-accent font-black text-lg">LM</span>
          </div>
          <div className="text-left">
            <p className="text-white font-black text-xl leading-none tracking-wide">LANÇAMENTO</p>
            <p className="text-accent font-black text-xl leading-none tracking-wide">MÚLTIPLO</p>
          </div>
        </div>
        <p className="text-white/40 text-xs tracking-[0.25em] uppercase">
          Antes de acessar seu treinamento...
        </p>
      </div>

      {/* 3. Headline */}
      <div className="px-4 text-center pb-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
          <span className="text-accent">Parabéns!</span> Agora você tem
        </h1>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
          acesso VIP ao treinamento…
        </h1>
      </div>

      {/* 4. Subtexto */}
      <div className="px-4 text-center pb-4 max-w-2xl mx-auto">
        <p className="text-white/70 text-base md:text-lg leading-relaxed">
          Mas e, que tal aproveitar mais essa oferta e se tornar <strong>BLACK</strong>? Pode ter certeza que seu nível de acesso vai acelerar ainda mais seus resultados…
        </p>
        <p className="text-white font-semibold text-base mt-2">
          Não vou ficar tentando te convencer, a decisão é sua.
        </p>
      </div>

      {/* 5. Scarcidade */}
      <div className="px-4 max-w-xl mx-auto mt-4 mb-10">
        <div className="bg-white rounded-lg px-6 py-4 text-center">
          <p className="text-black font-bold text-sm md:text-base">
            Apenas <span className="font-black">{SPOTS_LEFT} ingressos Black</span> ainda disponíveis.
          </p>
        </div>
      </div>

      {/* 6. Vídeo placeholder */}
      <div className="px-4 max-w-3xl mx-auto mb-10">
        <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Play className="w-7 h-7 text-white/40 fill-white/40 ml-1" />
            </div>
            <p className="text-sm tracking-wider">[PLACEHOLDER — Inserir vídeo aqui]</p>
          </div>
        </div>
      </div>

      {/* 7. CTA 1 */}
      <div className="px-4 max-w-lg mx-auto space-y-4 mb-16">
        <GreenCTA href="#" label="GARANTIR INGRESSO BLACK" />
        <p className="text-center">
          <a href="/obrigado" className="text-accent text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity underline underline-offset-4">
            NÃO QUERO ESTA NOVA OFERTA
          </a>
        </p>
      </div>

      {/* Divisor */}
      <div className="w-full h-px bg-white/10" />

      {/* 8. Seção comparação */}
      <div className="px-4 py-14 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black leading-tight text-accent" style={{ fontFamily: "var(--font-display)" }}>
          Tire as suas próprias conclusões
        </h2>
        <h2 className="text-3xl md:text-5xl font-black leading-tight text-white mb-12" style={{ fontFamily: "var(--font-display)" }}>
          novamente…. E decida!
        </h2>

        {/* 3 colunas */}
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {TIERS.map(({ name, benefits, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl overflow-hidden border ${highlight ? "border-accent" : "border-white/10"}`}
            >
              {/* Ticket visual */}
              <div className={`w-full h-16 flex items-center justify-center ${highlight ? "bg-accent/20" : "bg-white/5"}`}>
                <div className={`text-center ${highlight ? "text-accent" : "text-white/40"}`}>
                  <p className="text-[8px] uppercase tracking-[0.15em] font-bold leading-none">Lançamento Múltiplo</p>
                  <p className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">24 · Jun · 2026</p>
                </div>
              </div>

              {/* Logo e nome do tier */}
              <div className={`px-4 py-3 ${highlight ? "bg-accent/5" : "bg-zinc-950"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${highlight ? "border-accent" : "border-white/20"}`}>
                    <span className={`text-[7px] font-black ${highlight ? "text-accent" : "text-white/30"}`}>LM</span>
                  </div>
                </div>
                <p className={`text-base md:text-lg font-black tracking-widest ${highlight ? "text-accent" : "text-white"}`}>{name}</p>
                <div className={`w-full h-px mt-2 ${highlight ? "bg-accent/30" : "bg-white/10"}`} />
              </div>

              {/* Benefits */}
              <div className={`px-4 py-4 space-y-2.5 ${highlight ? "bg-accent/5" : "bg-zinc-950"}`}>
                {benefits.map((b) => (
                  <div key={b.text} className="flex items-start gap-2">
                    <BenefitIcon included={b.included} />
                    <span className={`text-[11px] md:text-xs leading-snug ${b.included ? "text-white" : "text-white/20 line-through"}`}>
                      {b.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divisor */}
      <div className="w-full h-px bg-white/10" />

      {/* 9. Preço */}
      <div className="px-4 py-16 text-center max-w-2xl mx-auto">
        <p className="text-white/40 text-base line-through mb-2">DE R$ [X.XXX],00</p>
        <p className="text-white/60 text-base mb-2">Por [N]x de:</p>
        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <p className="text-7xl md:text-8xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            R$[XX]
          </p>
          <div className="text-left leading-tight">
            <p className="text-white/50 text-sm">ou</p>
            <p className="text-white font-bold text-xl">R$[XXX]</p>
            <p className="text-white/50 text-sm">à vista</p>
          </div>
        </div>
        <div className="space-y-4">
          <GreenCTA href="#" label="GARANTIR INGRESSO BLACK" />
          <p className="text-center">
            <a href="/obrigado" className="text-accent text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity underline underline-offset-4">
              NÃO QUERO ESTA NOVA OFERTA
            </a>
          </p>
        </div>
      </div>

      {/* Divisor */}
      <div className="w-full h-px bg-white/10" />

      {/* 10. Seção do evento */}
      <div
        className="relative w-full py-20 px-4 text-center"
        style={{ background: "linear-gradient(to bottom, #111 0%, #000 100%)" }}
      >
        <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-bold mb-2">
          QUANDO E ONDE ACONTECERÁ O
        </p>
        <p className="text-accent font-black text-lg md:text-xl uppercase tracking-widest mb-8">
          LANÇAMENTO MÚLTIPLO?
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10 text-sm text-white/60">
          <div className="text-center">
            <p className="text-white font-bold text-base">📅 24 de Junho de 2026</p>
            <p className="text-white/50 text-xs mt-0.5">Ao vivo · 15h às 18h</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-white font-bold text-base">💻 Online</p>
            <p className="text-white/50 text-xs mt-0.5">Transmissão ao vivo via [plataforma]</p>
          </div>
        </div>
        <p className="text-white/30 text-sm mb-2">Seja bem-vindo ao</p>
        <p className="text-white font-black text-4xl md:text-6xl uppercase tracking-wider mb-10" style={{ fontFamily: "var(--font-display)" }}>
          LANÇAMENTO MÚLTIPLO
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest px-10 py-4 rounded-md text-sm md:text-base transition-colors"
        >
          GARANTIR MEU INGRESSO
          <ArrowRight className="w-4 h-4" strokeWidth={3} />
        </a>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-white/10 py-8 text-center">
        <p className="text-white/30 text-xs">
          © 2026 Luiz Filho — O Novo Jogo dos Lançamentos. Todos os direitos reservados.
        </p>
      </div>

    </div>
  );
}
