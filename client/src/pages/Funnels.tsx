import { useEffect, useRef, useState, useCallback } from "react";
import {
  Rocket, CreditCard, Gift, PartyPopper, ClipboardCheck,
  ExternalLink, ArrowRight, FileText, Clock, MessageCircle, Radio, ArrowRightCircle, RotateCcw, Eye, EyeOff,
  Check, Plus, X, AlertTriangle, Link2, ListChecks,
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

// ── Tarefas por página — compartilhada via API (/api/funnel-tasks) ────────
type NodeTask = { id: string; text: string; done: boolean; link?: string };
type TasksByNode = Record<string, NodeTask[]>;

let taskIdCounter = 0;
function makeTaskId() { return `t${Date.now()}_${taskIdCounter++}`; }

async function fetchAllTasks(): Promise<{ tasks: TasksByNode; error?: string }> {
  try {
    const r = await fetch("/api/funnel-tasks");
    const data = await r.json();
    if (!r.ok) return { tasks: {}, error: data?.error ?? "Falha ao carregar tarefas" };
    return { tasks: data.tasks ?? {} };
  } catch {
    return { tasks: {}, error: "Não foi possível conectar à API de tarefas" };
  }
}

function saveAllTasks(tasks: TasksByNode) {
  fetch("/api/funnel-tasks", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tasks }),
  }).catch(() => { /* falha silenciosa — tenta de novo na próxima edição */ });
}

function NodeTaskList({ tasks, onAdd, onToggle, onRemove }: {
  tasks: NodeTask[];
  onAdd: (text: string, link?: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [showLinkField, setShowLinkField] = useState(false);

  function handleAdd() {
    const text = draft.trim();
    if (!text) return;
    onAdd(text, linkDraft.trim() || undefined);
    setDraft(""); setLinkDraft(""); setShowLinkField(false);
  }

  return (
    <div style={{ width: "100%", border: "1px solid rgba(250,250,250,0.14)", borderRadius: 5,
      background: "#111119", boxShadow: "0 16px 40px rgba(0,0,0,0.55)", padding: "10px 12px" }}>
      <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: T.veryMuted, marginBottom: tasks.length ? 8 : 6 }}>
        Tarefas
      </p>
      {tasks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 150, overflowY: "auto", marginBottom: 8 }}>
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <button onClick={() => onToggle(t.id)} aria-label="Concluir tarefa"
                style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0, borderRadius: 3, cursor: "pointer",
                  border: `1px solid ${t.done ? "#4ADE80" : "rgba(250,250,250,0.25)"}`,
                  background: t.done ? "rgba(74,222,128,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                {t.done && <Check size={9} color="#4ADE80" strokeWidth={3} />}
              </button>
              {t.link ? (
                <a href={t.link} target="_blank" rel="noreferrer"
                  style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: 11.5, lineHeight: 1.4,
                    color: t.done ? T.veryMuted : "#8AB4FF",
                    textDecoration: t.done ? "line-through" : "underline", textUnderlineOffset: 2,
                    wordBreak: "break-word", display: "flex", alignItems: "center", gap: 4 }}>
                  <Link2 size={9} style={{ flexShrink: 0 }} />{t.text}
                </a>
              ) : (
                <p style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: 11.5, lineHeight: 1.4,
                  color: t.done ? T.veryMuted : T.muted,
                  textDecoration: t.done ? "line-through" : "none", wordBreak: "break-word" }}>
                  {t.text}
                </p>
              )}
              <button onClick={() => onRemove(t.id)} aria-label="Remover tarefa"
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
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder="Adicionar tarefa..."
          style={{ flex: 1, minWidth: 0, padding: "6px 8px", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(250,250,250,0.1)", borderRadius: 3,
            color: T.white, fontFamily: INTER, fontSize: 11.5, outline: "none" }} />
        <button onClick={() => setShowLinkField(v => !v)} aria-label="Vincular um link"
          title="Vincular um link"
          style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 3, cursor: "pointer",
            border: `1px solid ${showLinkField ? "#8AB4FF" : "rgba(250,250,250,0.1)"}`,
            background: showLinkField ? "rgba(138,180,255,0.15)" : "rgba(255,255,255,0.04)",
            color: showLinkField ? "#8AB4FF" : T.veryMuted,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link2 size={12} />
        </button>
        <button onClick={handleAdd} aria-label="Adicionar tarefa"
          style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 3, border: "none", cursor: "pointer",
            background: "rgba(227,27,35,0.25)", color: T.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={13} />
        </button>
      </div>
      {showLinkField && (
        <input value={linkDraft} onChange={e => setLinkDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder="https://... (link opcional)"
          style={{ width: "100%", marginTop: 6, padding: "6px 8px", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(250,250,250,0.1)", borderRadius: 3,
            color: T.white, fontFamily: INTER, fontSize: 11.5, outline: "none" }} />
      )}
    </div>
  );
}

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

function PageNode({ node, tasks, onAdd, onToggle, onRemove }: {
  node: PageNodeDef; tasks: NodeTask[];
  onAdd: (text: string, link?: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const color = TRACK_COLOR[node.track];
  const showPreview = !!node.href && !node.external;
  const pending = tasks.filter(t => !t.done).length;

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
        {tasks.length > 0 && (
          <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 3,
            padding: "3px 6px", borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
            <ListChecks size={9} color={T.veryMuted} />
            <span style={{ fontFamily: INTER, fontSize: 9.5, fontWeight: 700, color: T.veryMuted }}>
              {pending}/{tasks.length}
            </span>
          </span>
        )}
      </div>
    </div>
  );

  const card = node.href ? (
    <a href={node.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block" }}>
      {cardInner}
    </a>
  ) : cardInner;

  return (
    <>
      {card}
      <div className="wp-popover" style={{ position: "absolute", top: "100%", left: 0,
        marginTop: 8, width: NODE_WIDTH, zIndex: 40 }}>
        <NodeTaskList tasks={tasks} onAdd={onAdd} onToggle={onToggle} onRemove={onRemove} />
      </div>
    </>
  );
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
  const [showAutomation, setShowAutomation] = useState(false);
  const [allTasks, setAllTasks] = useState<TasksByNode>({});
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchAllTasks().then(({ tasks, error }) => {
        if (cancelled) return;
        setAllTasks(tasks);
        setTasksError(error ?? null);
      });
    }
    load();
    window.addEventListener("focus", load);
    return () => { cancelled = true; window.removeEventListener("focus", load); };
  }, []);

  const updateNodeTasks = useCallback((nodeId: string, updater: (prev: NodeTask[]) => NodeTask[]) => {
    setAllTasks(prev => {
      const next = { ...prev, [nodeId]: updater(prev[nodeId] ?? []) };
      saveAllTasks(next);
      return next;
    });
  }, []);

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
  const totalPending = Object.values(allTasks).flat().filter(t => !t.done).length;
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

      {tasksError && (
        <div style={{ margin: "20px 32px 0", maxWidth: 720, display: "flex", alignItems: "flex-start",
          gap: 10, padding: "14px 18px", border: "1px solid rgba(250,204,21,0.35)", borderRadius: 5,
          background: "rgba(250,204,21,0.06)" }}>
          <AlertTriangle size={15} color="#FACC15" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: INTER, fontSize: 12.5, color: "rgba(250,250,250,0.75)", lineHeight: 1.6 }}>
            {tasksError} — as tarefas não estão sendo salvas online no momento.
          </p>
        </div>
      )}

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
            columnGap: 130, rowGap: showAutomation ? 60 : 22, alignItems: "center",
            transition: "row-gap 0.2s ease" }}>

            {PAGE_NODES.map(node => (
              <div key={node.id} ref={registerNode(node.id)} className="wp-wrap"
                onPointerDown={handlePointerDown(node.id)}
                style={nodeStyle(node.id, { gridColumn: node.col, gridRow: node.row, justifySelf: "start", position: "relative" })}>
                <PageNode node={node} tasks={allTasks[node.id] ?? []}
                  onAdd={(text, link) => updateNodeTasks(node.id, prev => [...prev, { id: makeTaskId(), text, done: false, link }])}
                  onToggle={id => updateNodeTasks(node.id, prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)))}
                  onRemove={id => updateNodeTasks(node.id, prev => prev.filter(t => t.id !== id))} />
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
            painel da Onprofit para cada produto. Passe o mouse sobre um card pra ver e editar suas tarefas.
          </p>
        </div>
      </div>

      <button onClick={() => setSidebarOpen(v => !v)} aria-label="Abrir lista de tarefas"
        style={{ position: "fixed", top: "50%", right: sidebarOpen ? 340 : 0, transform: "translateY(-50%)",
          zIndex: 101, display: "flex", alignItems: "center", gap: 8, padding: "12px 10px 12px 14px",
          borderRadius: "6px 0 0 6px", border: `1px solid ${T.border}`, borderRight: "none",
          background: T.bg, cursor: "pointer", transition: "right 0.25s ease",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.4)" }}>
        <ListChecks size={16} color={T.accentLight} />
        {totalPending > 0 && (
          <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 800, color: T.white,
            background: "linear-gradient(135deg,#E31B23 0%,#8B0E13 100%)", borderRadius: 99,
            padding: "1px 6px", minWidth: 16, textAlign: "center" }}>
            {totalPending}
          </span>
        )}
      </button>

      <aside style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 340,
        background: "#0B0B14", borderLeft: `1px solid ${T.border}`, zIndex: 100,
        transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s ease", overflowY: "auto", boxShadow: "-16px 0 48px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "20px 20px 16px", background: "#0B0B14",
          borderBottom: `1px solid ${T.border}` }}>
          <div>
            <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
              textTransform: "uppercase", color: T.accentLight, marginBottom: 4 }}>
              Todas as tarefas
            </p>
            <p style={{ fontFamily: BEBAS, fontSize: 24, letterSpacing: "0.02em", color: T.white }}>
              {totalPending} pendente{totalPending === 1 ? "" : "s"}
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Fechar"
            style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              border: `1px solid ${T.border}`, background: "transparent", color: T.muted,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "8px 20px 20px" }}>
          {PAGE_NODES.filter(node => (allTasks[node.id]?.length ?? 0) > 0).map(node => (
            <div key={node.id} style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%",
                  background: TRACK_COLOR[node.track], flexShrink: 0 }} />
                <p style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: T.veryMuted }}>
                  {node.title}
                </p>
              </div>
              {(allTasks[node.id] ?? []).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8,
                  padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <button onClick={() => updateNodeTasks(node.id, prev => prev.map(x => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                    aria-label="Concluir tarefa"
                    style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0, borderRadius: 3, cursor: "pointer",
                      border: `1px solid ${t.done ? "#4ADE80" : "rgba(250,250,250,0.25)"}`,
                      background: t.done ? "rgba(74,222,128,0.15)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.done && <Check size={9} color="#4ADE80" strokeWidth={3} />}
                  </button>
                  {t.link ? (
                    <a href={t.link} target="_blank" rel="noreferrer"
                      style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: 12, lineHeight: 1.4,
                        color: t.done ? T.veryMuted : "#8AB4FF",
                        textDecoration: t.done ? "line-through" : "underline", textUnderlineOffset: 2,
                        wordBreak: "break-word", display: "flex", alignItems: "center", gap: 4 }}>
                      <Link2 size={9} style={{ flexShrink: 0 }} />{t.text}
                    </a>
                  ) : (
                    <p style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: 12, lineHeight: 1.4,
                      color: t.done ? T.veryMuted : T.muted,
                      textDecoration: t.done ? "line-through" : "none", wordBreak: "break-word" }}>
                      {t.text}
                    </p>
                  )}
                  <button onClick={() => updateNodeTasks(node.id, prev => prev.filter(x => x.id !== t.id))}
                    aria-label="Remover tarefa"
                    style={{ flexShrink: 0, width: 14, height: 14, marginTop: 2, color: T.veryMuted,
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          ))}
          {totalPending === 0 && Object.values(allTasks).every(t => t.length === 0) && (
            <p style={{ marginTop: 24, fontFamily: INTER, fontSize: 12.5, color: T.veryMuted,
              lineHeight: 1.6, textAlign: "center" }}>
              Nenhuma tarefa ainda. Passe o mouse sobre um card pra adicionar.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
