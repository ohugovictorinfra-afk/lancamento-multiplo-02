import { useEffect, useRef, useState, useCallback } from "react";
import {
  Rocket, CreditCard, Gift, PartyPopper, ClipboardCheck,
  ExternalLink, ArrowRight, Check, Plus, X,
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
  goldMid:   "rgba(200,169,110,0.3)",
  gray:      "rgba(250,250,250,0.28)",
};

const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";

type Track = "red" | "gold" | "gray";

type NodeDef = {
  id: string;
  title: string;
  sub: string;
  track: Track;
  col: number;
  row: number;
  icon: React.ReactNode;
  href?: string;
  external?: boolean;
};

type EdgeDef = { from: string; to: string; track: Track; label?: string };

const TRACK_COLOR: Record<Track, string> = {
  red:  T.accentLight,
  gold: T.gold,
  gray: T.gray,
};

const NODES: NodeDef[] = [
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

const EDGES: EdgeDef[] = [
  { from: "lp", to: "checkout-padrao", track: "red" },
  { from: "lp", to: "checkout-diamond", track: "gold" },
  { from: "checkout-padrao", to: "upsell", track: "red" },
  { from: "upsell", to: "obrigado-padrao", track: "red", label: "recusou" },
  { from: "upsell", to: "obrigado-diamond", track: "gold", label: "aceitou" },
  { from: "checkout-diamond", to: "obrigado-diamond", track: "gold" },
  { from: "obrigado-padrao", to: "cadastro-padrao", track: "red" },
  { from: "obrigado-diamond", to: "cadastro-diamond", track: "gold" },
];

type PathData = { id: string; d: string; color: string; label?: string; labelX: number; labelY: number };

const TRACK_BORDER: Record<Track, string> = {
  red:  "rgba(255,68,68,0.35)",
  gold: "rgba(200,169,110,0.35)",
  gray: "rgba(250,250,250,0.14)",
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
      {/* camada transparente por cima — garante que o clique sempre vá pro <a> pai, nunca pro iframe */}
      <div style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

function FunnelNode({ node }: { node: NodeDef }) {
  const color = TRACK_COLOR[node.track];
  const showPreview = !!node.href && !node.external;

  const content = (
    <div style={{ borderRadius: 5, overflow: "hidden", width: NODE_WIDTH,
      border: `1px solid ${TRACK_BORDER[node.track]}`,
      background: T.surface, cursor: node.href ? "pointer" : "default",
      transition: "border-color 0.2s, transform 0.2s" }}>
      {showPreview && <PagePreview src={node.href!} />}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
        borderLeft: `3px solid ${color}`, borderTop: showPreview ? `1px solid ${TRACK_BORDER[node.track]}` : "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 4, flexShrink: 0,
          background: node.track === "gray" ? "rgba(250,250,250,0.06)" : `${color}1A`,
          display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {node.icon}
        </div>
        <div style={{ minWidth: 0 }}>
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
    <a href={node.href} target="_blank" rel="noreferrer"
      style={{ textDecoration: "none", display: "block" }}>
      {content}
    </a>
  ) : content;
}

// ── Lista de tarefas por página — persistida no localStorage do navegador ─────
type NodeTask = { id: string; text: string; done: boolean };

let taskIdCounter = 0;
function makeTaskId() { return `t${Date.now()}_${taskIdCounter++}`; }

function useNodeTasks(nodeId: string) {
  const storageKey = `funnel-tasks:codigo-escala-v3:${nodeId}`;
  const [tasks, setTasks] = useState<NodeTask[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(tasks)); } catch { /* ignore */ }
  }, [tasks, storageKey]);
  return [tasks, setTasks] as const;
}

function NodeTaskList({ nodeId }: { nodeId: string }) {
  const [tasks, setTasks] = useNodeTasks(nodeId);
  const [draft, setDraft] = useState("");

  function addTask() {
    const text = draft.trim();
    if (!text) return;
    setTasks(prev => [...prev, { id: makeTaskId(), text, done: false }]);
    setDraft("");
  }
  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }
  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const pending = tasks.filter(t => !t.done).length;

  return (
    <div style={{ width: NODE_WIDTH, border: "1px dashed rgba(250,250,250,0.14)", borderRadius: 5,
      background: "rgba(255,255,255,0.02)", padding: "10px 12px" }}>
      <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: T.veryMuted, marginBottom: tasks.length ? 8 : 6 }}>
        Tarefas{pending > 0 && ` (${pending})`}
      </p>

      {tasks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 130,
          overflowY: "auto", marginBottom: 8 }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <button onClick={() => toggleTask(t.id)} aria-label="Concluir tarefa"
                style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0, borderRadius: 3, cursor: "pointer",
                  border: `1px solid ${t.done ? "#4ADE80" : "rgba(250,250,250,0.25)"}`,
                  background: t.done ? "rgba(74,222,128,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                {t.done && <Check size={9} color="#4ADE80" strokeWidth={3} />}
              </button>
              <p style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: 11.5, lineHeight: 1.4,
                color: t.done ? T.veryMuted : T.muted,
                textDecoration: t.done ? "line-through" : "none", wordBreak: "break-word" }}>
                {t.text}
              </p>
              <button onClick={() => removeTask(t.id)} aria-label="Remover tarefa"
                style={{ flexShrink: 0, width: 14, height: 14, marginTop: 2, color: T.veryMuted,
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }}
          placeholder="Adicionar tarefa..."
          style={{ flex: 1, minWidth: 0, padding: "6px 8px", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(250,250,250,0.1)", borderRadius: 3,
            color: T.white, fontFamily: INTER, fontSize: 11.5, outline: "none" }} />
        <button onClick={addTask} aria-label="Adicionar tarefa"
          style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 3, border: "none", cursor: "pointer",
            background: "rgba(227,27,35,0.25)", color: T.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function Funnels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<PathData[]>([]);
  const [canvasHeight, setCanvasHeight] = useState(760);

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

      const startX = fromRect.right - cRect.left + container.scrollLeft;
      const startY = fromRect.top + fromRect.height / 2 - cRect.top;
      const endX = toRect.left - cRect.left + container.scrollLeft;
      const endY = toRect.top + toRect.height / 2 - cRect.top;
      const midX = (startX + endX) / 2;

      next.push({
        id: `${edge.from}__${edge.to}`,
        d: `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`,
        color: TRACK_COLOR[edge.track],
        label: edge.label,
        labelX: midX,
        labelY: (startY + endY) / 2,
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
        input::placeholder { color: rgba(250,250,250,0.25); }
      `}</style>

      <header style={{ padding: "40px 32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: T.accentLight, marginBottom: 8 }}>
          Mapa de Funil
        </p>
        <h1 style={{ fontFamily: BEBAS, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "0.02em",
          color: T.white, marginBottom: 14 }}>
          CÓDIGO DA ESCALA — FLUXO COMPLETO
        </h1>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Trilha Padrão", color: T.accentLight },
            { label: "Trilha Diamond", color: T.gold },
            { label: "Checkout externo (Onprofit)", color: T.gray },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: INTER, fontSize: 12, color: T.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </header>

      <div style={{ padding: "40px 32px 80px", overflowX: "auto" }}>
        <div ref={containerRef} style={{ position: "relative", width: svgWidth, minWidth: svgWidth }}>

          <svg width={svgWidth} height={canvasHeight}
            style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
            <defs>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={T.accentLight} />
              </marker>
              <marker id="arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={T.gold} />
              </marker>
              <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={T.gray} />
              </marker>
            </defs>
            {paths.map(p => (
              <path key={p.id} d={p.d} fill="none" stroke={p.color} strokeWidth={1.6} strokeOpacity={0.55}
                markerEnd={`url(#arrow-${p.color === T.accentLight ? "red" : p.color === T.gold ? "gold" : "gray"})`} />
            ))}
            {paths.filter(p => p.label).map(p => (
              <g key={`${p.id}-label`}>
                <rect x={p.labelX - 26} y={p.labelY - 10} width={52} height={20} rx={3}
                  fill={T.bg} stroke={p.color} strokeOpacity={0.4} />
                <text x={p.labelX} y={p.labelY + 4} textAnchor="middle"
                  fontFamily={INTER} fontSize={9.5} fontWeight={700}
                  letterSpacing="0.08em" fill={p.color} style={{ textTransform: "uppercase" }}>
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          <div style={{ position: "relative", zIndex: 1, display: "grid",
            gridTemplateColumns: "repeat(5, 220px)", gridTemplateRows: "repeat(3, auto)",
            columnGap: 140, rowGap: 40, alignItems: "start" }}>
            {NODES.map(node => (
              <div key={node.id}
                style={{ gridColumn: node.col, gridRow: node.row, justifySelf: "start",
                  display: "flex", flexDirection: "column", gap: 10 }}>
                {/* ref só na parte visual do card — a lista de tarefas abaixo não entra
                    no cálculo do conector, senão a seta apontaria pro meio errado */}
                <div ref={registerNode(node.id)}>
                  <FunnelNode node={node} />
                </div>
                <NodeTaskList nodeId={node.id} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 32px 64px", maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 20px",
          border: `1px solid ${T.border}`, borderRadius: 5, background: T.surface }}>
          <ArrowRight size={15} color={T.accentLight} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: INTER, fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
            As miniaturas são a página real carregada ao vivo — sempre refletem o estado atual.
            Clique em qualquer nó para abrir a página correspondente numa nova aba. Os nós de{" "}
            <strong style={{ color: T.white }}>checkout (Onprofit)</strong> são externos ao app —
            o redirecionamento pós-compra para <code style={{ color: T.gold }}>/obrigado-padrao</code> e{" "}
            <code style={{ color: T.gold }}>/obrigado-diamond</code> precisa ser configurado manualmente
            no painel da Onprofit para cada produto.
          </p>
        </div>
      </div>
    </div>
  );
}
