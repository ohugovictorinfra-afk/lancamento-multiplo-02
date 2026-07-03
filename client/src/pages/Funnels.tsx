import { useEffect, useRef, useState, useCallback } from "react";
import {
  Rocket, CreditCard, Gift, PartyPopper, ClipboardCheck,
  ExternalLink, ArrowRight, FileText, Clock, MessageCircle, Radio, ArrowRightCircle, RotateCcw, Eye, EyeOff,
} from "lucide-react";

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

type Track = "red" | "gold" | "gray" | "auto" | "cancel";

const TRACK_COLOR: Record<Track, string> = {
  red: T.accentLight, gold: T.gold, gray: T.gray,
  auto: "rgba(250,250,250,0.4)", cancel: "rgba(167,139,250,0.55)",
};
const TRACK_DASHED: Record<Track, boolean> = {
  red: false, gold: false, gray: false, auto: true, cancel: true,
};

type PageNodeDef = {
  id: string; title: string; sub: string; track: Track;
  col: number; row: number; icon: React.ReactNode; href?: string; external?: boolean;
};

// Linhas: 1 = tronco Padrão · 2 = ramos curtos do Padrão · 3 = LP (centro) ·
// 4 = ramos curtos do Diamond · 5 = tronco Diamond. O modal mora na coluna
// da LP (col 1), pendurado embaixo dela — não é uma etapa própria do tronco.
const PAGE_NODES: PageNodeDef[] = [
  { id: "lp", title: "LP — Código da Escala V3", sub: "/codigo-escala-v3",
    track: "red", col: 1, row: 3, icon: <Rocket size={16} />, href: "/codigo-escala-v3" },

  { id: "checkout-padrao", title: "Checkout Padrão", sub: "onprofit.com.br",
    track: "gray", col: 2, row: 1, icon: <CreditCard size={16} />, external: true },
  { id: "checkout-diamond", title: "Checkout Diamond", sub: "onprofit.com.br",
    track: "gray", col: 2, row: 5, icon: <CreditCard size={16} />, external: true },

  { id: "upsell", title: "Upsell Diamond (OTO)", sub: "/diamond",
    track: "gold", col: 3, row: 1, icon: <Gift size={16} />, href: "/diamond" },

  { id: "obrigado-padrao", title: "Obrigado — Padrão", sub: "/obrigado-padrao",
    track: "red", col: 4, row: 1, icon: <PartyPopper size={16} />, href: "/obrigado-padrao" },
  { id: "obrigado-diamond", title: "Obrigado — Diamond", sub: "/obrigado-diamond",
    track: "gold", col: 4, row: 5, icon: <PartyPopper size={16} />, href: "/obrigado-diamond" },

  { id: "cadastro-padrao", title: "Pré-cadastro Padrão", sub: "/cadastro-padrao",
    track: "red", col: 5, row: 1, icon: <ClipboardCheck size={16} />, href: "/cadastro-padrao" },
  { id: "cadastro-diamond", title: "Pré-cadastro Diamond", sub: "/cadastro-diamond",
    track: "gold", col: 5, row: 5, icon: <ClipboardCheck size={16} />, href: "/cadastro-diamond" },
];

// ── Waypoints — ramos reais (decisão/mensagem própria), não simultâneos ────
type WaypointKind = "capture" | "whatsapp" | "condition" | "pipeline" | "nurture";

const WAYPOINT_STYLE: Record<WaypointKind, { color: string; icon: React.ReactNode; groupLabel: string }> = {
  capture:   { color: "#38BDF8", icon: <FileText size={12} />, groupLabel: "Captura" },
  whatsapp:  { color: "#25D366", icon: <MessageCircle size={12} />, groupLabel: "WhatsApp (API oficial)" },
  condition: { color: "#FBBF24", icon: <Clock size={12} />, groupLabel: "Timer + condição" },
  pipeline:  { color: "#A78BFA", icon: <ArrowRightCircle size={12} />, groupLabel: "GHL — Pipeline" },
  nurture:   { color: "#2DD4BF", icon: <Radio size={12} />, groupLabel: "Nutrição" },
};

type WaypointDef = { id: string; kind: WaypointKind; label: string; detail: string; col: number; row: number };

const WAYPOINTS: WaypointDef[] = [
  // Anexo da LP — não é um "stop" no tronco, fica pendurado na coluna 1
  { id: "modal-captura", kind: "capture", col: 1, row: 4,
    label: "Modal: nome/email/tel",
    detail: "Abre antes do redirecionamento pro checkout. Cria o contato no GHL e insere na pipeline \"Código da Escala\", Etapa 1 — Lead capturado." },
  { id: "wp-modal-abandono", kind: "whatsapp", col: 1, row: 5,
    label: "WhatsApp: lembrete",
    detail: "Se a pessoa fechar o modal sem preencher (ou preencher e não seguir pro checkout), dispara lembrete via API oficial do WhatsApp depois de alguns minutos." },

  { id: "wp-checkout-abandono-padrao", kind: "whatsapp", col: 2, row: 2,
    label: "WhatsApp: lembrete",
    detail: "Preencheu os dados no checkout externo (Onprofit) mas não finalizou o pagamento. Dispara lembrete específico de checkout abandonado." },
  { id: "wp-checkout-abandono-diamond", kind: "whatsapp", col: 2, row: 4,
    label: "WhatsApp: lembrete",
    detail: "Mesma lógica do Padrão: preencheu os dados de pagamento do Diamond e não confirmou. Lembrete via WhatsApp." },

  { id: "cond-precadastro", kind: "condition", col: 4, row: 2,
    label: "Timer 15min",
    detail: "Aguarda alguns minutos após a compra confirmada. Se o pré-cadastro ainda não foi preenchido, segue pro lembrete ao lado. Se a pessoa já preencheu antes disso, o lembrete é cancelado (link roxo voltando do card Pré-cadastro)." },
  { id: "wp-lembrete-precadastro", kind: "whatsapp", col: 5, row: 2,
    label: "WhatsApp: lembrete",
    detail: "Só dispara se a condição ao lado ainda estiver pendente. Mensagem via WhatsApp lembrando de completar o pré-cadastro." },

  { id: "nutricao", kind: "nurture", col: 6, row: 1,
    label: "Nutrição até o evento",
    detail: "Sequência contínua de comunicações (WhatsApp + e-mail) desde o pré-cadastro completo até a data do evento — 22 e 23 de julho. Recebe os dois caminhos, Padrão e Diamond." },
];

type EdgeDef = { from: string; to: string; track: Track; label?: string };

const EDGES: EdgeDef[] = [
  { from: "lp", to: "checkout-padrao", track: "red" },
  { from: "lp", to: "checkout-diamond", track: "gold" },
  { from: "lp", to: "modal-captura", track: "auto" },
  { from: "modal-captura", to: "wp-modal-abandono", track: "auto", label: "não preencheu" },

  { from: "checkout-padrao", to: "upsell", track: "red" },
  { from: "checkout-padrao", to: "wp-checkout-abandono-padrao", track: "auto", label: "abandonou" },
  { from: "checkout-diamond", to: "obrigado-diamond", track: "gold" },
  { from: "checkout-diamond", to: "wp-checkout-abandono-diamond", track: "auto", label: "abandonou" },

  { from: "upsell", to: "obrigado-padrao", track: "red", label: "recusou" },
  { from: "upsell", to: "obrigado-diamond", track: "gold", label: "aceitou" },

  { from: "obrigado-padrao", to: "cadastro-padrao", track: "red" },
  { from: "obrigado-padrao", to: "cond-precadastro", track: "auto" },
  { from: "cond-precadastro", to: "wp-lembrete-precadastro", track: "auto", label: "pendente" },
  { from: "cadastro-padrao", to: "cond-precadastro", track: "cancel", label: "cancela" },

  { from: "obrigado-diamond", to: "cadastro-diamond", track: "gold" },
  { from: "cadastro-padrao", to: "nutricao", track: "red" },
  { from: "cadastro-diamond", to: "nutricao", track: "gold" },
];

// ── Marcadores de ação simultânea — bolinhas separadas sentadas em cima
// da própria linha, sem ocupar coluna própria.
type EdgeMarkerDef = { edgeKey: string; icons: WaypointKind[]; label: string; detail: string };

const EDGE_MARKERS: EdgeMarkerDef[] = [
  { edgeKey: "checkout-padrao__upsell", icons: ["whatsapp", "pipeline"],
    label: "Parabéns + Etapa 2",
    detail: "Pagamento confirmado pelo Onprofit. Dispara WhatsApp de parabéns e move o contato na pipeline \"Código da Escala\" pra Etapa 2 — os dois acontecem juntos." },
  { edgeKey: "checkout-diamond__obrigado-diamond", icons: ["whatsapp", "pipeline"],
    label: "Parabéns + Etapa 2",
    detail: "Mesma lógica do Padrão, pro Diamond: pagamento confirmado dispara WhatsApp de parabéns e move a pipeline pra Etapa 2." },
  { edgeKey: "cadastro-padrao__nutricao", icons: ["pipeline"],
    label: "Etapa 3",
    detail: "Pré-cadastro completo. Move o contato na pipeline \"Código da Escala\" pra Etapa 3 — Pré-cadastro feito." },
  { edgeKey: "cadastro-diamond__nutricao", icons: ["pipeline"],
    label: "Etapa 3",
    detail: "Mesma lógica do Padrão: pré-cadastro Diamond completo move o contato pra Etapa 3 na pipeline." },
];

type PathData = { id: string; d: string; color: string; dashed: boolean; label?: string; labelX: number; labelY: number; short: boolean };

const TRACK_BORDER: Record<Track, string> = {
  red: "rgba(255,68,68,0.35)", gold: "rgba(200,169,110,0.35)", gray: "rgba(250,250,250,0.14)",
  auto: "rgba(250,250,250,0.2)", cancel: "rgba(167,139,250,0.35)",
};

const NODE_WIDTH = 220;
const PREVIEW_SRC_W = 1280;
const PREVIEW_SRC_H = 800;
const PREVIEW_SCALE = NODE_WIDTH / PREVIEW_SRC_W;
const PREVIEW_H = PREVIEW_SRC_H * PREVIEW_SCALE;
const MIN_LABEL_DIST = 90;
const DRAG_STORAGE_KEY = "funis-drag-positions";

function PagePreview({ src }: { src: string }) {
  return (
    <div style={{ width: NODE_WIDTH, height: PREVIEW_H, overflow: "hidden", position: "relative", background: "#000" }}>
      <iframe src={src} title={src} loading="lazy" scrolling="no" tabIndex={-1}
        style={{ width: PREVIEW_SRC_W, height: PREVIEW_SRC_H, border: "none",
          transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

function PageNode({ node }: { node: PageNodeDef }) {
  const color = TRACK_COLOR[node.track];
  const showPreview = !!node.href && !node.external;

  const cardInner = (
    <div style={{ borderRadius: 5, overflow: "hidden", width: NODE_WIDTH,
      border: `1px solid ${TRACK_BORDER[node.track]}`, background: T.surface,
      cursor: node.href ? "pointer" : "default" }}>
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

function Waypoint({ node }: { node: WaypointDef }) {
  const style = WAYPOINT_STYLE[node.kind];
  return (
    <div className="wp-wrap" tabIndex={0} style={{ position: "relative", display: "inline-block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px",
        borderRadius: 99, border: `1px dashed ${style.color}66`, background: "rgba(255,255,255,0.03)",
        whiteSpace: "nowrap" }}>
        <span style={{ color: style.color, display: "flex", flexShrink: 0 }}>{style.icon}</span>
        <span style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, color: T.white }}>{node.label}</span>
      </div>
      <div className="wp-popover" style={{ position: "absolute", top: "100%", left: 0, marginTop: 6,
        width: 230, zIndex: 40, padding: "11px 13px", borderRadius: 5,
        background: "#111119", border: `1px solid ${style.color}44`, boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
        <p style={{ fontFamily: INTER, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", color: style.color, marginBottom: 6 }}>
          {style.groupLabel}
        </p>
        <p style={{ fontFamily: INTER, fontSize: 11.5, color: T.muted, lineHeight: 1.55 }}>{node.detail}</p>
      </div>
    </div>
  );
}

// Bolinhas separadas sentadas em cima da linha — cada ícone no seu próprio
// círculo, com um pequeno espaço entre elas. Hover no grupo revela o texto.
function EdgeMarker({ marker, x, y }: { marker: EdgeMarkerDef; x: number; y: number }) {
  return (
    <div className="wp-wrap" tabIndex={0}
      style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", zIndex: 45 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {marker.icons.map(k => (
          <div key={k} style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            background: T.bg, border: `1.5px solid ${WAYPOINT_STYLE[k].color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: WAYPOINT_STYLE[k].color, boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {WAYPOINT_STYLE[k].icon}
          </div>
        ))}
      </div>
      <div className="wp-popover" style={{ position: "absolute", top: "100%", left: "50%",
        transform: "translateX(-50%)", marginTop: 6, width: 220, zIndex: 46, padding: "11px 13px", borderRadius: 5,
        background: "#111119", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
        <p style={{ fontFamily: INTER, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", color: T.white, marginBottom: 6 }}>
          {marker.label}
        </p>
        <p style={{ fontFamily: INTER, fontSize: 11.5, color: T.muted, lineHeight: 1.55 }}>{marker.detail}</p>
      </div>
    </div>
  );
}

type DragOffset = { dx: number; dy: number };

export default function Funnels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<PathData[]>([]);
  const [canvasHeight, setCanvasHeight] = useState(900);
  const [dragOffsets, setDragOffsets] = useState<Record<string, DragOffset>>(() => {
    try { return JSON.parse(localStorage.getItem(DRAG_STORAGE_KEY) ?? "{}"); } catch { return {}; }
  });
  const [showAutomation, setShowAutomation] = useState(true);

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

      // Se o destino está mais abaixo do que ao lado, sai de baixo do card
      // (não da direita) — pros anexos pendurados (modal, ramos de abandono).
      const dxCenters = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
      const dyCenters = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);
      const vertical = Math.abs(dyCenters) > Math.abs(dxCenters);

      let startX: number, startY: number, endX: number, endY: number, d: string;

      if (vertical) {
        startX = fromRect.left + fromRect.width / 2 - cRect.left + container.scrollLeft;
        startY = (dyCenters >= 0 ? fromRect.bottom : fromRect.top) - cRect.top;
        endX = toRect.left + toRect.width / 2 - cRect.left + container.scrollLeft;
        endY = (dyCenters >= 0 ? toRect.top : toRect.bottom) - cRect.top;
        const midY = (startY + endY) / 2;
        d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
      } else {
        startX = fromRect.right - cRect.left + container.scrollLeft;
        startY = fromRect.top + fromRect.height / 2 - cRect.top;
        endX = toRect.left - cRect.left + container.scrollLeft;
        endY = toRect.top + toRect.height / 2 - cRect.top;
        const midX = (startX + endX) / 2;
        d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
      }
      const dist = Math.hypot(endX - startX, endY - startY);

      next.push({
        id: `${edge.from}__${edge.to}`,
        d, color: TRACK_COLOR[edge.track], dashed: TRACK_DASHED[edge.track],
        label: edge.label, labelX: (startX + endX) / 2, labelY: (startY + endY) / 2,
        short: dist < MIN_LABEL_DIST,
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

  useEffect(() => {
    computePaths();
    try { localStorage.setItem(DRAG_STORAGE_KEY, JSON.stringify(dragOffsets)); } catch { /* ignore */ }
  }, [dragOffsets, computePaths]);

  useEffect(() => { computePaths(); }, [showAutomation, computePaths]);

  // ── Arrastar-e-soltar ────────────────────────────────────────────────────
  const dragRef = useRef<{ id: string; startX: number; startY: number; origDx: number; origDy: number; moved: boolean } | null>(null);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = d.origDx + (e.clientX - d.startX);
    const dy = d.origDy + (e.clientY - d.startY);
    if (Math.abs(e.clientX - d.startX) > 3 || Math.abs(e.clientY - d.startY) > 3) d.moved = true;
    setDragOffsets(prev => ({ ...prev, [d.id]: { dx, dy } }));
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    const d = dragRef.current;
    if (d?.moved) {
      const target = e.target as HTMLElement | null;
      target?.addEventListener("click", ev => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
    }
    dragRef.current = null;
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((id: string) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const offset = dragOffsets[id] ?? { dx: 0, dy: 0 };
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, origDx: offset.dx, origDy: offset.dy, moved: false };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [dragOffsets, handlePointerMove, handlePointerUp]);

  function resetPositions() {
    setDragOffsets({});
  }

  const svgWidth = 1740;
  const activeMarkers = paths
    .map(p => ({ path: p, marker: EDGE_MARKERS.find(m => m.edgeKey === p.id) }))
    .filter((x): x is { path: PathData; marker: EdgeMarkerDef } => !!x.marker);

  function nodeStyle(id: string, base: React.CSSProperties): React.CSSProperties {
    const o = dragOffsets[id] ?? { dx: 0, dy: 0 };
    return { ...base, transform: `translate(${o.dx}px, ${o.dy}px)`, touchAction: "none", cursor: "grab" };
  }

  return (
    <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; }
        .wp-popover {
          opacity: 0; visibility: hidden; transform: translateY(-6px);
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
        }
        .wp-wrap:hover .wp-popover, .wp-wrap:focus-within .wp-popover {
          opacity: 1; visibility: visible; transform: translateY(0);
        }
        .funil-scroll::-webkit-scrollbar { display: none; }
        .funil-scroll { scrollbar-width: none; }
      `}</style>

      <header style={{ padding: "40px 32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
          <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: T.accentLight }}>
            Mapa de Funil
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowAutomation(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 4,
                border: showAutomation ? "1px solid rgba(251,191,36,0.4)" : `1px solid ${T.border}`,
                background: showAutomation ? "rgba(251,191,36,0.1)" : T.surface,
                color: showAutomation ? "#FBBF24" : T.muted, cursor: "pointer",
                fontFamily: INTER, fontSize: 11, fontWeight: 700 }}>
              {showAutomation ? <Eye size={12} /> : <EyeOff size={12} />}
              {showAutomation ? "Automações: visíveis" : "Automações: ocultas"}
            </button>
            <button onClick={resetPositions}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 4,
                border: `1px solid ${T.border}`, background: T.surface, color: T.muted, cursor: "pointer",
                fontFamily: INTER, fontSize: 11, fontWeight: 700 }}>
              <RotateCcw size={12} /> Resetar posições
            </button>
          </div>
        </div>
        <h1 style={{ fontFamily: BEBAS, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "0.02em",
          color: T.white, marginBottom: 14 }}>
          CÓDIGO DA ESCALA — FLUXO COMPLETO
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 13, color: T.muted, maxWidth: 680, lineHeight: 1.6, marginBottom: 16 }}>
          As miniaturas são a página real carregada ao vivo. Clique em qualquer nó pra abrir numa nova aba,
          ou clique e arraste pra reposicionar (a posição fica salva neste navegador). Passe o mouse sobre uma
          pílula ou bolinha de automação pra ver o detalhe completo — sem isso, ela fica compacta.
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[
            { label: "Página", color: T.accentLight },
            { label: "Captura de lead", color: WAYPOINT_STYLE.capture.color },
            { label: "WhatsApp (API oficial)", color: WAYPOINT_STYLE.whatsapp.color },
            { label: "Timer / condição", color: WAYPOINT_STYLE.condition.color },
            { label: "GHL — Pipeline", color: WAYPOINT_STYLE.pipeline.color },
            { label: "Nutrição", color: WAYPOINT_STYLE.nurture.color },
          ].map(({ label, color }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 14, height: i === 0 ? 2 : 0, borderTop: i === 0 ? "none" : `2px dashed ${color}`,
                background: i === 0 ? color : "transparent", flexShrink: 0 }} />
              <span style={{ fontFamily: INTER, fontSize: 11.5, color: T.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="funil-scroll" style={{ padding: "40px 32px 100px", overflowX: "auto", overflowY: "hidden" }}>
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
            {paths.map(p => {
              const track = (Object.keys(TRACK_COLOR) as Track[]).find(k => TRACK_COLOR[k] === p.color) ?? "gray";
              return (
                <path key={p.id} d={p.d} fill="none" stroke={p.color} strokeWidth={1.5} strokeOpacity={0.6}
                  strokeDasharray={p.dashed ? "4 4" : undefined} markerEnd={`url(#arrow-${track})`} />
              );
            })}
            {paths.filter(p => p.label && !p.short).map(p => (
              <g key={`${p.id}-label`}>
                <rect x={p.labelX - 40} y={p.labelY - 9} width={80} height={18} rx={3}
                  fill={T.bg} stroke={p.color} strokeOpacity={0.4} />
                <text x={p.labelX} y={p.labelY + 4} textAnchor="middle"
                  fontFamily={INTER} fontSize={8.5} fontWeight={700} letterSpacing="0.02em" fill={p.color}>
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          <div style={{ position: "relative", zIndex: 1, display: "grid",
            gridTemplateColumns: "repeat(6, 220px)", gridTemplateRows: "repeat(5, auto)",
            columnGap: 130, rowGap: 60, alignItems: "center" }}>

            {PAGE_NODES.map(node => (
              <div key={node.id} ref={registerNode(node.id)}
                onPointerDown={handlePointerDown(node.id)}
                style={nodeStyle(node.id, { gridColumn: node.col, gridRow: node.row, justifySelf: "start" })}>
                <PageNode node={node} />
              </div>
            ))}

            {showAutomation && WAYPOINTS.map(node => (
              <div key={node.id} ref={registerNode(node.id)}
                onPointerDown={handlePointerDown(node.id)}
                style={nodeStyle(node.id, { gridColumn: node.col, gridRow: node.row, justifySelf: "start", alignSelf: "center" })}>
                <Waypoint node={node} />
              </div>
            ))}
          </div>

          {showAutomation && activeMarkers.map(({ path, marker }) => (
            <EdgeMarker key={path.id} marker={marker} x={path.labelX} y={path.labelY} />
          ))}
        </div>
      </div>

      <div style={{ padding: "0 32px 64px", maxWidth: 760 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 20px",
          border: `1px solid ${T.border}`, borderRadius: 5, background: T.surface }}>
          <ArrowRight size={15} color={T.accentLight} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: INTER, fontSize: 12.5, color: T.muted, lineHeight: 1.7 }}>
            O link roxo pontilhado saindo de <strong style={{ color: T.white }}>Pré-cadastro Padrão</strong> de
            volta pro "Timer 15min" é o "cancela se já preencheu": completar o pré-cadastro antes do timer
            disparar impede o lembrete de sair. O caminho Diamond tem captura, pagamento e pipeline
            espelhados, mas ainda sem o timer de pré-cadastro. Os nós de{" "}
            <strong style={{ color: T.white }}>checkout (Onprofit)</strong> são externos ao app — o
            redirecionamento pós-compra para <code style={{ color: T.gold }}>/obrigado-padrao</code> e{" "}
            <code style={{ color: T.gold }}>/obrigado-diamond</code> precisa ser configurado manualmente no
            painel da Onprofit para cada produto. Ainda não tem checklist de tarefas por página nesta versão.
          </p>
        </div>
      </div>
    </div>
  );
}
