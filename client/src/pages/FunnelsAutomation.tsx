import { useEffect, useRef, useState, useCallback } from "react";
import {
  Rocket, CreditCard, Gift, PartyPopper, ClipboardCheck,
  ExternalLink, ArrowRight, HelpCircle, Clock, MessageCircle, Tag, Radio,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// RASCUNHO / TESTE — não é o /funis oficial. Explora como representar a
// lógica de automação (GHL: tags, pipeline, timers, mensagens condicionais)
// junto do desenho de páginas, sem poluir o que já está aprovado em /funis.
// ═══════════════════════════════════════════════════════════════════════════

const T = {
  bg:        "#07070F",
  white:     "#FAFAFA",
  accent:    "#E31B23",
  accentLight: "#FF4444",
  border:    "rgba(227,27,35,0.28)",
  surface:   "rgba(255,255,255,0.045)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
  gold:      "#C8A96E",
  gray:      "rgba(250,250,250,0.28)",
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";

// ── Trilhas (linhas do diagrama) ────────────────────────────────────────────
type Track = "red" | "gold" | "gray" | "auto" | "cancel";

const TRACK_COLOR: Record<Track, string> = {
  red:    T.accentLight,
  gold:   T.gold,
  gray:   T.gray,
  auto:   "#FBBF24",
  cancel: "rgba(250,250,250,0.3)",
};
const TRACK_DASHED: Record<Track, boolean> = {
  red: false, gold: false, gray: false, auto: true, cancel: true,
};

// ── Nós de página (idênticos ao /funis — não alterar) ──────────────────────
type PageNodeDef = {
  id: string; title: string; sub: string; track: Track;
  col: number; row: number; icon: React.ReactNode; href?: string; external?: boolean;
};

const PAGE_NODES: PageNodeDef[] = [
  { id: "lp", title: "LP — Código da Escala V3", sub: "/codigo-escala-v3",
    track: "red", col: 1, row: 2, icon: <Rocket size={16} />, href: "/codigo-escala-v3" },
  { id: "checkout-padrao", title: "Checkout Padrão", sub: "onprofit.com.br",
    track: "gray", col: 2, row: 1, icon: <CreditCard size={16} />, external: true },
  { id: "checkout-diamond", title: "Checkout Diamond", sub: "onprofit.com.br",
    track: "gray", col: 2, row: 3, icon: <CreditCard size={16} />, external: true },
  { id: "upsell", title: "Upsell Diamond (OTO)", sub: "/diamond",
    track: "gold", col: 3, row: 1, icon: <Gift size={16} />, href: "/diamond" },
  { id: "obrigado-padrao", title: "Obrigado — Padrão", sub: "/obrigado-padrao",
    track: "red", col: 4, row: 1, icon: <PartyPopper size={16} />, href: "/obrigado-padrao" },
  { id: "obrigado-diamond", title: "Obrigado — Diamond", sub: "/obrigado-diamond",
    track: "gold", col: 4, row: 3, icon: <PartyPopper size={16} />, href: "/obrigado-diamond" },
  { id: "cadastro-padrao", title: "Pré-cadastro Padrão", sub: "/cadastro-padrao",
    track: "red", col: 5, row: 1, icon: <ClipboardCheck size={16} />, href: "/cadastro-padrao" },
  { id: "cadastro-diamond", title: "Pré-cadastro Diamond", sub: "/cadastro-diamond",
    track: "gold", col: 5, row: 3, icon: <ClipboardCheck size={16} />, href: "/cadastro-diamond" },
];

const PAGE_EDGES: { from: string; to: string; track: Track; label?: string }[] = [
  { from: "lp", to: "checkout-padrao", track: "red" },
  { from: "lp", to: "checkout-diamond", track: "gold" },
  { from: "checkout-padrao", to: "upsell", track: "red" },
  { from: "upsell", to: "obrigado-padrao", track: "red", label: "recusou" },
  { from: "upsell", to: "obrigado-diamond", track: "gold", label: "aceitou" },
  { from: "checkout-diamond", to: "obrigado-diamond", track: "gold" },
  { from: "obrigado-padrao", to: "cadastro-padrao", track: "red" },
  { from: "obrigado-diamond", to: "cadastro-diamond", track: "gold" },
];

// ── Nós de automação (novos) ────────────────────────────────────────────────
type AutoKind = "condition" | "timer" | "whatsapp" | "tag" | "nurture";

type AutoNodeDef = {
  id: string; kind: AutoKind; title: string; sub: string; col: number; row: number;
};

const AUTO_KIND_STYLE: Record<AutoKind, { color: string; icon: React.ReactNode; label: string }> = {
  condition: { color: "#FBBF24", icon: <HelpCircle size={13} />, label: "Condição" },
  timer:     { color: "rgba(250,250,250,0.5)", icon: <Clock size={13} />, label: "Aguardar" },
  whatsapp:  { color: "#25D366", icon: <MessageCircle size={13} />, label: "WhatsApp" },
  tag:       { color: "#A78BFA", icon: <Tag size={13} />, label: "GHL" },
  nurture:   { color: "#2DD4BF", icon: <Radio size={13} />, label: "Nutrição" },
};

const AUTO_NODES: AutoNodeDef[] = [
  // Corrente 1 — modal de pré-checkout preenchido, mas não chegou no checkout externo
  { id: "auto-timer-1", kind: "timer",    title: "Aguarda 15 min", sub: "desde o modal preenchido", col: 2, row: 5 },
  { id: "auto-cond-1",  kind: "condition", title: "SE não iniciou o checkout", sub: "onprofit não recebeu o lead", col: 2, row: 6 },
  { id: "auto-wa-1",    kind: "whatsapp",  title: "Lembrete de checkout", sub: "API oficial WhatsApp", col: 2, row: 7 },
  { id: "auto-tag-1",   kind: "tag",       title: "Tag + Pipeline", sub: "lead-nao-comprou", col: 2, row: 8 },

  // Corrente 2 — começou a preencher pagamento no checkout, mas não confirmou
  { id: "auto-cond-2",  kind: "condition", title: "SE iniciou pagamento e não confirmou", sub: "checkout abandonado", col: 2, row: 9 },
  { id: "auto-wa-2",    kind: "whatsapp",  title: "Lembrete de pagamento", sub: "API oficial WhatsApp", col: 2, row: 10 },
  { id: "auto-tag-2",   kind: "tag",       title: "Tag + Pipeline", sub: "checkout-abandonado", col: 2, row: 11 },

  // Corrente 3 — compra do Padrão confirmada
  { id: "auto-wa-3",    kind: "whatsapp",  title: "Parabéns pela compra", sub: "API oficial WhatsApp", col: 4, row: 5 },
  { id: "auto-tag-3",   kind: "tag",       title: "Tag + Pipeline", sub: "comprou-padrao · etapa 2", col: 4, row: 6 },

  // Corrente 4 — lembrete condicional de pré-cadastro
  { id: "auto-timer-4", kind: "timer",    title: "Aguarda alguns min", sub: "após confirmar a compra", col: 4, row: 7 },
  { id: "auto-cond-4",  kind: "condition", title: "SE pré-cadastro não preenchido", sub: "checa sessão salva", col: 4, row: 8 },
  { id: "auto-wa-4",    kind: "whatsapp",  title: "Lembrete de pré-cadastro", sub: "só dispara se pendente", col: 4, row: 9 },

  // Corrente 5 — nutrição pós pré-cadastro
  { id: "auto-nurture-5", kind: "nurture", title: "Nutrição até o evento", sub: "sequência contínua", col: 5, row: 5 },
];

const AUTO_EDGES: { from: string; to: string; track: Track; label?: string }[] = [
  { from: "checkout-padrao", to: "auto-timer-1", track: "auto", label: "modal preenchido" },
  { from: "auto-timer-1", to: "auto-cond-1", track: "auto" },
  { from: "auto-cond-1", to: "auto-wa-1", track: "auto", label: "sim" },
  { from: "auto-wa-1", to: "auto-tag-1", track: "auto" },

  { from: "checkout-padrao", to: "auto-cond-2", track: "auto", label: "abriu pagamento" },
  { from: "auto-cond-2", to: "auto-wa-2", track: "auto", label: "sim" },
  { from: "auto-wa-2", to: "auto-tag-2", track: "auto" },

  { from: "obrigado-padrao", to: "auto-wa-3", track: "auto", label: "compra ok" },
  { from: "auto-wa-3", to: "auto-tag-3", track: "auto" },

  { from: "obrigado-padrao", to: "auto-timer-4", track: "auto", label: "compra ok" },
  { from: "auto-timer-4", to: "auto-cond-4", track: "auto" },
  { from: "auto-cond-4", to: "auto-wa-4", track: "auto", label: "sim" },
  // cross-link: completar o pré-cadastro cancela o lembrete pendente da corrente 4
  { from: "cadastro-padrao", to: "auto-cond-4", track: "cancel", label: "cancela se já preencheu" },

  { from: "cadastro-padrao", to: "auto-nurture-5", track: "auto", label: "cadastro completo" },
];

const EDGES = [...PAGE_EDGES, ...AUTO_EDGES];

type PathData = { id: string; d: string; color: string; dashed: boolean; label?: string; labelX: number; labelY: number };

const TRACK_BORDER: Record<Track, string> = {
  red:    "rgba(255,68,68,0.35)",
  gold:   "rgba(200,169,110,0.35)",
  gray:   "rgba(250,250,250,0.14)",
  auto:   "rgba(251,191,36,0.3)",
  cancel: "rgba(250,250,250,0.2)",
};

const NODE_WIDTH = 220;
const PREVIEW_SRC_W = 1280;
const PREVIEW_SRC_H = 800;
const PREVIEW_SCALE = NODE_WIDTH / PREVIEW_SRC_W;
const PREVIEW_H = PREVIEW_SRC_H * PREVIEW_SCALE;

// ── Live preview — puxa a página real via iframe, escalada em miniatura ───────
function PagePreview({ src }: { src: string }) {
  return (
    <div style={{ width: NODE_WIDTH, height: PREVIEW_H, overflow: "hidden",
      position: "relative", background: "#000" }}>
      <iframe
        src={src}
        title={src}
        loading="lazy"
        scrolling="no"
        tabIndex={-1}
        style={{ width: PREVIEW_SRC_W, height: PREVIEW_SRC_H, border: "none",
          transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left",
          pointerEvents: "none" }}
      />
      <div style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

// ── Card de página — idêntico ao /funis ────────────────────────────────────
function PageNode({ node }: { node: PageNodeDef }) {
  const color = TRACK_COLOR[node.track];
  const showPreview = !!node.href && !node.external;

  const cardInner = (
    <div style={{ borderRadius: 5, overflow: "hidden", width: NODE_WIDTH,
      border: `1px solid ${TRACK_BORDER[node.track]}`,
      background: T.surface, cursor: node.href ? "pointer" : "default" }}>
      {showPreview && <PagePreview src={node.href!} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
        borderLeft: `3px solid ${color}`, borderTop: showPreview ? `1px solid ${TRACK_BORDER[node.track]}` : "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 4, flexShrink: 0,
          background: node.track === "gray" ? "rgba(250,250,250,0.06)" : `${color}1A`,
          display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {node.icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontFamily: INTER, fontSize: 12.5, fontWeight: 700, color: T.white,
            lineHeight: 1.3, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.title}
          </p>
          <p style={{ fontFamily: INTER, fontSize: 10.5, color: T.veryMuted,
            display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            {node.sub}{node.external && <ExternalLink size={9} />}
          </p>
        </div>
      </div>
    </div>
  );

  return node.href ? (
    <a href={node.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block" }}>
      {cardInner}
    </a>
  ) : cardInner;
}

// ── Card de automação — mais compacto, sem preview, não clicável ──────────
function AutoNode({ node }: { node: AutoNodeDef }) {
  const style = AUTO_KIND_STYLE[node.kind];
  return (
    <div style={{ width: NODE_WIDTH, borderRadius: 5, padding: "10px 12px",
      background: "rgba(255,255,255,0.03)", border: `1px dashed ${style.color}55` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0,
          background: `${style.color}1A`, color: style.color,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {style.icon}
        </div>
        <span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: style.color }}>
          {style.label}
        </span>
      </div>
      <p style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: T.white, lineHeight: 1.3, marginBottom: 2 }}>
        {node.title}
      </p>
      <p style={{ fontFamily: INTER, fontSize: 10.5, color: T.veryMuted, lineHeight: 1.3 }}>
        {node.sub}
      </p>
    </div>
  );
}

export default function FunnelsAutomation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<PathData[]>([]);
  const [canvasHeight, setCanvasHeight] = useState(1400);

  const registerNode = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const computePaths = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    setCanvasHeight(h => (Math.abs(h - cRect.height) > 1 ? cRect.height : h));

    const next: PathData[] = [];
    for (const edge of EDGES) {
      const fromEl = nodeRefs.current.get(edge.from);
      const toEl = nodeRefs.current.get(edge.to);
      if (!fromEl || !toEl) continue;
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const sameColumn = Math.abs(fromRect.left - toRect.left) < 2;
      let d: string, labelX: number, labelY: number;

      if (sameColumn) {
        // conector vertical (dentro da mesma coluna, indo pra corrente de automação embaixo)
        const startX = fromRect.left + fromRect.width / 2 - cRect.left + container.scrollLeft;
        const startY = fromRect.bottom - cRect.top;
        const endX = toRect.left + toRect.width / 2 - cRect.left + container.scrollLeft;
        const endY = toRect.top - cRect.top;
        const midY = (startY + endY) / 2;
        d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
        labelX = startX + 60;
        labelY = midY;
      } else {
        const startX = fromRect.right - cRect.left + container.scrollLeft;
        const startY = fromRect.top + fromRect.height / 2 - cRect.top;
        const endX = toRect.left - cRect.left + container.scrollLeft;
        const endY = toRect.top + toRect.height / 2 - cRect.top;
        const midX = (startX + endX) / 2;
        d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
        labelX = midX;
        labelY = (startY + endY) / 2;
      }

      next.push({
        id: `${edge.from}__${edge.to}`,
        d, color: TRACK_COLOR[edge.track], dashed: TRACK_DASHED[edge.track],
        label: edge.label, labelX, labelY,
      });
    }
    setPaths(next);
  }, []);

  useEffect(() => {
    computePaths();
    const onResize = () => computePaths();
    window.addEventListener("resize", onResize);
    let ro: ResizeObserver | undefined;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => computePaths());
      ro.observe(containerRef.current);
    }
    document.fonts?.ready?.then(() => computePaths());
    const t = setTimeout(computePaths, 200);
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      clearTimeout(t);
    };
  }, [computePaths]);

  const svgWidth = 1560;

  return (
    <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; }
      `}</style>

      <header style={{ padding: "40px 32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ padding: "3px 9px", borderRadius: 3, background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.35)", fontFamily: INTER, fontSize: 10, fontWeight: 800,
            letterSpacing: "0.1em", color: "#FBBF24" }}>
            RASCUNHO · TESTE
          </span>
          <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: T.accentLight }}>
            Mapa de Funil + Automações
          </p>
        </div>
        <h1 style={{ fontFamily: BEBAS, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "0.02em",
          color: T.white, marginBottom: 14 }}>
          CÓDIGO DA ESCALA — PÁGINAS + LÓGICA DE GHL
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 13, color: T.muted, maxWidth: 640, lineHeight: 1.6, marginBottom: 16 }}>
          Versão de teste — não é o mapa oficial (esse continua em <code style={{ color: T.gold }}>/funis</code>,
          intocado). Aqui, os nós tracejados abaixo do fluxo principal representam a lógica de automação
          (GHL): condições, timers, disparos de WhatsApp via API oficial e atualização de tag/pipeline.
          Ainda é só desenho — a implementação real das automações vem depois.
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[
            { label: "Página", color: T.accentLight, dashed: false },
            { label: "Condição", color: AUTO_KIND_STYLE.condition.color, dashed: true },
            { label: "Aguardar", color: AUTO_KIND_STYLE.timer.color, dashed: true },
            { label: "WhatsApp (API oficial)", color: AUTO_KIND_STYLE.whatsapp.color, dashed: true },
            { label: "GHL — Tag/Pipeline", color: AUTO_KIND_STYLE.tag.color, dashed: true },
            { label: "Nutrição", color: AUTO_KIND_STYLE.nurture.color, dashed: true },
          ].map(({ label, color, dashed }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 14, height: dashed ? 0 : 2, borderTop: dashed ? `2px dashed ${color}` : "none",
                background: dashed ? "transparent" : color, flexShrink: 0 }} />
              <span style={{ fontFamily: INTER, fontSize: 11.5, color: T.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </header>

      <div style={{ padding: "40px 32px 100px", overflowX: "auto", overflowY: "hidden" }}>
        <div ref={containerRef} style={{ position: "relative", width: svgWidth, minWidth: svgWidth }}>

          <svg width={svgWidth} height={canvasHeight}
            style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
            <defs>
              {(["red", "gold", "gray", "auto", "cancel"] as Track[]).map(track => (
                <marker key={track} id={`arrow-${track}`} viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill={TRACK_COLOR[track]} />
                </marker>
              ))}
            </defs>
            {paths.map(p => (
              <path key={p.id} d={p.d} fill="none" stroke={p.color}
                strokeWidth={1.6} strokeOpacity={0.6}
                strokeDasharray={p.dashed ? "4 4" : undefined}
                markerEnd={`url(#arrow-${
                  p.color === T.accentLight ? "red" :
                  p.color === T.gold ? "gold" :
                  p.color === TRACK_COLOR.auto ? "auto" :
                  p.color === TRACK_COLOR.cancel ? "cancel" : "gray"
                })`} />
            ))}
            {paths.filter(p => p.label).map(p => (
              <g key={`${p.id}-label`}>
                <rect x={p.labelX - 46} y={p.labelY - 9} width={92} height={18} rx={3}
                  fill={T.bg} stroke={p.color} strokeOpacity={0.4} />
                <text x={p.labelX} y={p.labelY + 4} textAnchor="middle"
                  fontFamily={INTER} fontSize={8.5} fontWeight={700}
                  letterSpacing="0.02em" fill={p.color}>
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          <div style={{ position: "relative", zIndex: 1, display: "grid",
            gridTemplateColumns: "repeat(5, 220px)", gridTemplateRows: "repeat(11, auto)",
            columnGap: 140, rowGap: 40, alignItems: "start" }}>

            {PAGE_NODES.map(node => (
              <div key={node.id} ref={registerNode(node.id)}
                style={{ gridColumn: node.col, gridRow: node.row, justifySelf: "start" }}>
                <PageNode node={node} />
              </div>
            ))}

            {/* Divisória entre o fluxo de páginas e a camada de automação */}
            <div style={{ gridColumn: "1 / -1", gridRow: 4, display: "flex", alignItems: "center",
              gap: 14, padding: "8px 0", marginTop: 8 }}>
              <span style={{ width: 22, height: 1, background: "rgba(251,191,36,0.4)", flexShrink: 0 }} />
              <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 800, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "#FBBF24", whiteSpace: "nowrap" }}>
                Automações (GHL) — abaixo da página que dispara cada corrente
              </span>
              <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.15)" }} />
            </div>

            {AUTO_NODES.map(node => (
              <div key={node.id} ref={registerNode(node.id)}
                style={{ gridColumn: node.col, gridRow: node.row, justifySelf: "start" }}>
                <AutoNode node={node} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 32px 64px", maxWidth: 760 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 20px",
          border: `1px solid ${T.border}`, borderRadius: 5, background: T.surface }}>
          <ArrowRight size={15} color={T.accentLight} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: INTER, fontSize: 12.5, color: T.muted, lineHeight: 1.7 }}>
            Corrente 4 (lembrete de pré-cadastro) tem um link tracejado cinza vindo de{" "}
            <strong style={{ color: T.white }}>Pré-cadastro Padrão</strong> de volta pra condição —
            é o "cancela se já preencheu" que você descreveu: completar o pré-cadastro antes do timer
            disparar impede o lembrete de sair. Essa parte foi feita só pro caminho Padrão; o Diamond
            seguiria o mesmo padrão de correntes assim que esse formato visual for validado. Ainda faltam
            as caixas de tarefas por página (removidas aqui de propósito, pra manter o foco só na
            camada nova) — se o layout aprovar, elas voltam igual ao <code style={{ color: T.gold }}>/funis</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
