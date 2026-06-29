import { ArrowRight, Check, X, Play } from "lucide-react";

const STANDARD: { text: string; included: boolean }[] = [
  { text: "Acesso ao treinamento ao vivo (24 de Junho)", included: true },
  { text: "Gravação completa em Full HD", included: true },
  { text: "Workbook de aplicação do método", included: true },
  { text: "Acesso à plataforma de educação", included: false },
  { text: "[PLACEHOLDER] Bônus VIP exclusivo 1", included: false },
  { text: "[PLACEHOLDER] Bônus VIP exclusivo 2", included: false },
  { text: "[PLACEHOLDER] Sessão extra ou mentoria", included: false },
  { text: "[PLACEHOLDER] Acesso a grupo privado", included: false },
];

const VIP: { text: string; included: boolean }[] = [
  { text: "Acesso ao treinamento ao vivo (24 de Junho)", included: true },
  { text: "Gravação completa em Full HD", included: true },
  { text: "Workbook de aplicação do método", included: true },
  { text: "Acesso à plataforma de educação", included: true },
  { text: "[PLACEHOLDER] Bônus VIP exclusivo 1", included: true },
  { text: "[PLACEHOLDER] Bônus VIP exclusivo 2", included: true },
  { text: "[PLACEHOLDER] Sessão extra ou mentoria", included: true },
  { text: "[PLACEHOLDER] Acesso a grupo privado", included: true },
];

function BenefitIcon({ included }: { included: boolean }) {
  return included ? (
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
    </div>
  ) : (
    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
      <X className="w-3 h-3 text-white/25" strokeWidth={2} />
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

export default function Upsell1() {
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
      <div className="px-4 text-center pb-6 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
          Eu quero te convidar
        </h1>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] text-accent" style={{ fontFamily: "var(--font-display)" }}>
          para ser VIP.
        </h1>
      </div>

      {/* 4. Subtexto */}
      <div className="px-4 text-center pb-10 max-w-2xl mx-auto">
        <p className="text-white/70 text-base md:text-lg leading-relaxed">
          [PLACEHOLDER] Dois dias completamente imersos aprendendo a [resultado] e [benefício], com acesso privilegiado ao método completo.
        </p>
      </div>

      {/* 5. Steps */}
      <div className="px-4 max-w-3xl mx-auto mb-4">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {[
            { label: "Passo 1", desc: "Comprou o Ingresso Standard", active: false },
            { label: "Passo 2", desc: "Atualize para o VIP", active: true },
            { label: "Passo 3", desc: "Pedido Completo", active: false },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl p-4 md:p-5 ${
                s.active
                  ? "bg-accent/15 border-2 border-accent"
                  : "bg-white"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-3 ${s.active ? "bg-accent" : "bg-green-500"}`}>
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${s.active ? "text-accent" : "text-black/40"}`}>
                {s.label}
              </p>
              <p className={`text-xs md:text-sm font-bold leading-snug ${s.active ? "text-white" : "text-black"}`}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-white/30 text-[11px] mt-3">
          Para completar a compra, não aperte em "voltar". Não recarregue e nem feche essa página.
        </p>
      </div>

      {/* 6. Vídeo placeholder */}
      <div className="px-4 max-w-3xl mx-auto mb-10 mt-8">
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
        <GreenCTA href="#" label="GARANTIR INGRESSO VIP" />
        <p className="text-center">
          <a href="/upsell-2" className="text-white/40 text-xs hover:text-white/60 underline underline-offset-4 italic transition-colors">
            Obrigado(a), <strong className="font-semibold">não vou aproveitar</strong> esta oportunidade única.
          </a>
        </p>
      </div>

      {/* Divisor */}
      <div className="w-full h-px bg-white/10" />

      {/* 8. Seção comparação */}
      <div className="px-4 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Qual a diferença entre
        </h2>
        <h2 className="text-3xl md:text-5xl font-black leading-tight text-accent mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Standard e VIP?
        </h2>
        <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          [PLACEHOLDER] Os participantes VIP terão acesso a [X, Y, Z], saindo com muito mais do que o ingresso standard oferece.
        </p>
      </div>

      {/* 9. Tabela comparativa */}
      <div className="px-4 max-w-3xl mx-auto mb-16">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {[
            { tier: "STANDARD", benefits: STANDARD, highlight: false },
            { tier: "VIP", benefits: VIP, highlight: true },
          ].map(({ tier, benefits, highlight }) => (
            <div
              key={tier}
              className={`rounded-2xl overflow-hidden border ${highlight ? "border-accent" : "border-white/10"}`}
            >
              {/* Ticket visual */}
              <div className={`w-full h-20 flex items-center justify-center ${highlight ? "bg-accent/20" : "bg-white/5"}`}>
                <div className={`text-center ${highlight ? "text-accent" : "text-white/40"}`}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold">Lançamento Múltiplo</p>
                  <p className="text-[10px] font-black uppercase tracking-wider">24 · Jun · 2026</p>
                </div>
              </div>

              {/* Logo e tier */}
              <div className={`px-5 py-4 ${highlight ? "bg-accent/5" : "bg-zinc-900"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${highlight ? "border-accent" : "border-white/20"}`}>
                    <span className={`text-[8px] font-black ${highlight ? "text-accent" : "text-white/40"}`}>LM</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? "text-accent" : "text-white/40"}`}>Lançamento Múltiplo</span>
                </div>
                <p className="text-xl font-black text-white tracking-widest">{tier}</p>
                <div className={`w-full h-px mt-3 ${highlight ? "bg-accent/30" : "bg-white/10"}`} />
              </div>

              {/* Benefits */}
              <div className={`px-5 py-5 space-y-3 ${highlight ? "bg-accent/5" : "bg-zinc-900"}`}>
                {benefits.map((b) => (
                  <div key={b.text} className="flex items-start gap-2.5">
                    <BenefitIcon included={b.included} />
                    <span className={`text-xs md:text-sm leading-snug ${b.included ? "text-white" : "text-white/25 line-through"}`}>
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

      {/* 10. Preço */}
      <div className="px-4 py-16 text-center max-w-2xl mx-auto">
        <p className="text-white font-black text-xl md:text-2xl uppercase tracking-widest mb-8">
          ADICIONE TUDO ISSO…
        </p>
        <p className="text-white/50 text-base mb-1">Por [N]x de:</p>
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
          <GreenCTA href="#" label="GARANTIR INGRESSO VIP" />
          <p className="text-center">
            <a href="/upsell-2" className="text-accent text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity underline underline-offset-4">
              VOU PERDER A OPORTUNIDADE
            </a>
          </p>
        </div>
      </div>

      {/* Divisor */}
      <div className="w-full h-px bg-white/10" />

      {/* 11. Seção do evento */}
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
