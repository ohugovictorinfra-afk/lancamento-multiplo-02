import { useEffect, useRef, useState, useCallback } from "react";
import {
  Rocket, CreditCard, Gift, PartyPopper, ClipboardCheck,
  ExternalLink, ArrowRight, FileText, Clock, MessageCircle, Radio,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// RASCUNHO / TESTE — não é o /funis oficial. V2: a automação fica integrada
// no MESMO fluxo (não numa camada separada embaixo) — cada gatilho aparece
// exatamente no ponto onde ele acontece, como um ramo curto e compacto que
// só revela o detalhe completo no hover. Tags viraram progressão de etapa
// dentro de uma única pipeline "Código da Escala" (badge no próprio card).
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

type Track = "red" | "gold" | "gray" | "auto" | "cancel";

const TRACK_COLOR: Record<Track, string> = {
  red: T.accentLight, gold: T.gold, gray: T.gray,
  auto: "rgba(250,250,250,0.4)", cancel: "rgba(167,139,250,0.55)",
};
const TRACK_DASHED: Record<Track, boolean> = {
  red: false, gold: false, gray: false, auto: true, cancel: true,
};

// ── Nós de página — mesmos dados/visual do /funis, + badge opcional de etapa
type PageNodeDef = {
  id: string; title: string; sub: string; track: Track;
  col: number; row: number; icon: React.ReactNode; href?: string; external?: boolean;
  stageBadge?: string;
};

const PAGE_NODES: PageNodeDef[] = [
  { id: "lp", title: "LP — Código da Escala V3", sub: "/codigo-escala-v3",
    track: "red", col: 1, row: 3, icon: <Rocket size={16} />, href: "/codigo-escala-v3" },

  { id: "checkout-padrao", title: "Checkout Padrão", sub: "onprofit.com.br",
    track: "gray", col: 3, row: 1, icon: <CreditCard size={16} />, external: true },
  { id: "checkout-diamond", title: "Checkout Diamond", sub: "onprofit.com.br",
    track: "gray", col: 3, row: 5, icon: <CreditCard size={16} />, external: true },

  { id: "upsell", title: "Upsell Diamond (OTO)", sub: "/diamond",
    track: "gold", col: 5, row: 1, icon: <Gift size={16} />, href: "/diamond" },

  { id: "obrigado-padrao", title: "Obrigado — Padrão", sub: "/obrigado-padrao",
    track: "red", col: 6, row: 1, icon: <PartyPopper size={16} />, href: "/obrigado-padrao", stageBadge: "Etapa 2" },
  { id: "obrigado-diamond", title: "Obrigado — Diamond", sub: "/obrigado-diamond",
    track: "gold", col: 6, row: 5, icon: <PartyPopper size={16} />, href: "/obrigado-diamond", stageBadge: "Etapa 2" },

  { id: "cadastro-padrao", title: "Pré-cadastro Padrão", sub: "/cadastro-padrao",
    track: "red", col: 7, row: 1, icon: <ClipboardCheck size={16} />, href: "/cadastro-padrao", stageBadge: "Etapa 3" },
  { id: "cadastro-diamond", title: "Pré-cadastro Diamond", sub: "/cadastro-diamond",
    track: "gold", col: 7, row: 5, icon: <ClipboardCheck size={16} />, href: "/cadastro-diamond", stageBadge: "Etapa 3" },
];

// ── Waypoints — pontos de automação compactos, inseridos direto no fluxo ───
type WaypointKind = "capture" | "whatsapp" | "condition" | "nurture";

const WAYPOINT_STYLE: Record<WaypointKind, { color: string; icon: React.ReactNode }> = {
  capture:   { color: "#38BDF8", icon: <FileText size={12} /> },
  whatsapp:  { color: "#25D366", icon: <MessageCircle size={12} /> },
  condition: { color: "#FBBF24", icon: <Clock size={12} /> },
  nurture:   { color: "#2DD4BF", icon: <Radio size={12} /> },
};

type WaypointDef = { id: string; kind: WaypointKind; label: string; detail: string; col: number; row: number };

const WAYPOINTS: WaypointDef[] = [
  { id: "modal-captura", kind: "capture", col: 2, row: 3,
    label: "Modal: nome/email/tel",
    detail: "Abre antes do redirecionamento pro checkout. Cria/atualiza o contato no GHL e insere na pipeline \"Código da Escala\" — Etapa 1, Lead capturado." },

  { id: "wp-modal-abandono", kind: "whatsapp", col: 2, row: 2,
    label: "Não preencheu",
    detail: "Se a pessoa fechar o modal sem preencher (ou preencher e não seguir pro checkout), dispara lembrete via API oficial do WhatsApp depois de alguns minutos." },

  { id: "wp-checkout-abandono-padrao", kind: "whatsapp", col: 3, row: 2,
    label: "Pagamento não confirmado",
    detail: "Iniciou o preenchimento no checkout externo (Onprofit) mas não finalizou o pagamento. Dispara lembrete específico via WhatsApp." },
  { id: "wp-checkout-abandono-diamond", kind: "whatsapp", col: 3, row: 4,
    label: "Pagamento não confirmado",
    detail: "Mesma lógica do Padrão: iniciou o pagamento do Diamond e não confirmou. Lembrete via WhatsApp." },

  { id: "wp-parabens-padrao", kind: "whatsapp", col: 4, row: 1,
    label: "Parabéns pela compra",
    detail: "Confirmação de pagamento recebida do Onprofit. Dispara mensagem de parabéns via WhatsApp — a pipeline avança pra Etapa 2 (badge no card de Obrigado)." },
  { id: "wp-parabens-diamond", kind: "whatsapp", col: 4, row: 5,
    label: "Parabéns pela compra",
    detail: "Mesma lógica do Padrão, pro Diamond: mensagem de parabéns via WhatsApp + pipeline avança pra Etapa 2." },

  { id: "cond-precadastro", kind: "condition", col: 6, row: 2,
    label: "Timer 15min",
    detail: "Aguarda alguns minutos após a compra confirmada. Se o pré-cadastro ainda não foi preenchido, segue pro lembrete abaixo. Se a pessoa já preencheu antes disso, o lembrete é cancelado (veja o link tracejado voltando do card Pré-cadastro)." },
  { id: "wp-lembrete-precadastro", kind: "whatsapp", col: 6, row: 3,
    label: "Lembrete pré-cadastro",
    detail: "Só dispara se a condição acima ainda estiver pendente. Mensagem via WhatsApp lembrando de completar o pré-cadastro." },

  { id: "nutricao", kind: "nurture", col: 8, row: 1,
    label: "Nutrição até o evento",
    detail: "Sequência contínua de comunicações (WhatsApp + e-mail) desde o pré-cadastro completo até a data do evento — 22 e 23 de julho." },
];

type EdgeDef = { from: string; to: string; track: Track; label?: string };

const EDGES: EdgeDef[] = [
  { from: "lp", to: "modal-captura", track: "red" },
  { from: "modal-captura", to: "checkout-padrao", track: "red", label: "preencheu" },
  { from: "modal-captura", to: "checkout-diamond", track: "gold", label: "preencheu" },
  { from: "modal-captura", to: "wp-modal-abandono", track: "auto", label: "não preencheu" },

  { from: "checkout-padrao", to: "wp-parabens-padrao", track: "red", label: "pagou" },
  { from: "checkout-padrao", to: "wp-checkout-abandono-padrao", track: "auto", label: "abandonou" },
  { from: "checkout-diamond", to: "wp-parabens-diamond", track: "gold", label: "pagou" },
  { from: "checkout-diamond", to: "wp-checkout-abandono-diamond", track: "auto", label: "abandonou" },

  { from: "wp-parabens-padrao", to: "upsell", track: "red" },
  { from: "upsell", to: "obrigado-padrao", track: "red", label: "recusou" },
  { from: "upsell", to: "obrigado-diamond", track: "gold", label: "aceitou" },
  { from: "wp-parabens-diamond", to: "obrigado-diamond", track: "gold" },

  { from: "obrigado-padrao", to: "cadastro-padrao", track: "red" },
  { from: "obrigado-padrao", to: "cond-precadastro", track: "auto", label: "timer" },
  { from: "cond-precadastro", to: "wp-lembrete-precadastro", track: "auto", label: "pendente" },
  { from: "cadastro-padrao", to: "cond-precadastro", track: "cancel", label: "cancela" },

  { from: "obrigado-diamond", to: "cadastro-diamond", track: "gold" },
  { from: "cadastro-padrao", to: "nutricao", track: "red" },
];

type PathData = { id: string; d: string; color: string; dashed: boolean; label?: string; labelX: number; labelY: number };

const TRACK_BORDER: Record<Track, string> = {
  red: "rgba(255,68,68,0.35)", gold: "rgba(200,169,110,0.35)", gray: "rgba(250,250,250,0.14)",
  auto: "rgba(250,250,250,0.2)", cancel: "rgba(167,139,250,0.35)",
};

const NODE_WIDTH = 220;
const PREVIEW_SRC_W = 1280;
const PREVIEW_SRC_H = 800;
const PREVIEW_SCALE = NODE_WIDTH / PREVIEW_SRC_W;
const PREVIEW_H = PREVIEW_SRC_H * PREVIEW_SCALE;

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
    <div style={{ position: "relative", borderRadius: 5, overflow: "hidden", width: NODE_WIDTH,
      border: `1px solid ${TRACK_BORDER[node.track]}`, background: T.surface,
      cursor: node.href ? "pointer" : "default" }}>
      {node.stageBadge && (
        <span style={{ position: "absolute", top: 8, right: 8, zIndex: 2, padding: "2px 7px", borderRadius: 99,
          background: "rgba(167,139,250,0.16)", border: "1px solid rgba(167,139,250,0.45)",
          fontFamily: INTER, fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", color: "#C4B5FD" }}>
          {node.stageBadge}
        </span>
      )}
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

// Pílula compacta — o detalhe completo só aparece no hover, exatamente como
// o popover de tarefas do /funis. Isso é o que evita o "ver a página inteira
// pra entender": o essencial cabe na pílula, o resto é opcional.
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
          {node.kind === "capture" ? "Captura" : node.kind === "whatsapp" ? "WhatsApp (API oficial)"
            : node.kind === "condition" ? "Timer + condição" : "Nutrição"}
        </p>
        <p style={{ fontFamily: INTER, fontSize: 11.5, color: T.muted, lineHeight: 1.55 }}>{node.detail}</p>
      </div>
    </div>
  );
}

export default function FunnelsAutomation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<PathData[]>([]);
  const [canvasHeight, setCanvasHeight] = useState(900);

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
        color: TRACK_COLOR[edge.track], dashed: TRACK_DASHED[edge.track],
        label: edge.label, labelX: midX, labelY: (startY + endY) / 2,
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

  const svgWidth = 2020;

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
      `}</style>

      <header style={{ padding: "40px 32px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ padding: "3px 9px", borderRadius: 3, background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.35)", fontFamily: INTER, fontSize: 10, fontWeight: 800,
            letterSpacing: "0.1em", color: "#FBBF24" }}>
            RASCUNHO · TESTE · V2
          </span>
          <p style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: T.accentLight }}>
            Mapa de Funil + Automações
          </p>
        </div>
        <h1 style={{ fontFamily: BEBAS, fontSize: "clamp(32px,4vw,48px)", letterSpacing: "0.02em",
          color: T.white, marginBottom: 14 }}>
          UM FLUXO SÓ — PÁGINAS E LÓGICA JUNTAS
        </h1>
        <p style={{ fontFamily: INTER, fontSize: 13, color: T.muted, maxWidth: 680, lineHeight: 1.6, marginBottom: 16 }}>
          Continua sendo teste — o mapa oficial segue em <code style={{ color: T.gold }}>/funis</code>, intocado.
          Aqui a automação não fica numa seção separada: cada pílula tracejada aparece exatamente no ponto do
          fluxo onde o gatilho acontece. Passe o mouse numa pílula pra ver o detalhe completo — sem isso, ela
          fica compacta. Não existe mais tag isolada: a progressão de etapa aparece como uma badge roxa
          diretamente no card da página (ex: "Etapa 2" no Obrigado), representando a mesma pipeline
          "Código da Escala" avançando.
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[
            { label: "Página", color: T.accentLight, dashed: false },
            { label: "Captura de lead", color: WAYPOINT_STYLE.capture.color, dashed: true },
            { label: "WhatsApp (API oficial)", color: WAYPOINT_STYLE.whatsapp.color, dashed: true },
            { label: "Timer / condição", color: WAYPOINT_STYLE.condition.color, dashed: true },
            { label: "Nutrição", color: WAYPOINT_STYLE.nurture.color, dashed: true },
            { label: "Etapa da pipeline (badge no card)", color: "#C4B5FD", dashed: false, isBadge: true },
          ].map(({ label, color, dashed, isBadge }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {isBadge ? (
                <span style={{ width: 14, height: 10, borderRadius: 99, background: "rgba(167,139,250,0.16)",
                  border: "1px solid rgba(167,139,250,0.45)", flexShrink: 0 }} />
              ) : (
                <span style={{ width: 14, height: dashed ? 0 : 2, borderTop: dashed ? `2px dashed ${color}` : "none",
                  background: dashed ? "transparent" : color, flexShrink: 0 }} />
              )}
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
                <marker key={track} id={`arrow2-${track}`} viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill={TRACK_COLOR[track]} />
                </marker>
              ))}
            </defs>
            {paths.map(p => {
              const track = (Object.keys(TRACK_COLOR) as Track[]).find(k => TRACK_COLOR[k] === p.color) ?? "gray";
              return (
                <path key={p.id} d={p.d} fill="none" stroke={p.color} strokeWidth={1.5} strokeOpacity={0.6}
                  strokeDasharray={p.dashed ? "4 4" : undefined} markerEnd={`url(#arrow2-${track})`} />
              );
            })}
            {paths.filter(p => p.label).map(p => (
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
            gridTemplateColumns: "repeat(8, 220px)", gridTemplateRows: "repeat(5, auto)",
            columnGap: 90, rowGap: 22, alignItems: "center" }}>

            {PAGE_NODES.map(node => (
              <div key={node.id} ref={registerNode(node.id)}
                style={{ gridColumn: node.col, gridRow: node.row, justifySelf: "start" }}>
                <PageNode node={node} />
              </div>
            ))}

            {WAYPOINTS.map(node => (
              <div key={node.id} ref={registerNode(node.id)}
                style={{ gridColumn: node.col, gridRow: node.row, justifySelf: "start", alignSelf: "center" }}>
                <Waypoint node={node} />
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
            O link roxo pontilhado saindo de <strong style={{ color: T.white }}>Pré-cadastro Padrão</strong> de
            volta pro "Timer 15min" é o "cancela se já preencheu": completar o pré-cadastro antes do timer
            disparar impede o lembrete de sair. Esse desenho cobre só o caminho Padrão por completo — o Diamond
            tem os mesmos pontos de captura e pagamento, mas ainda sem o timer de pré-cadastro (ele reaproveitaria
            a mesma lógica quando esse formato for validado). Ainda não tem checklist de tarefas nessa versão —
            só focando no desafio visual da automação por enquanto.
          </p>
        </div>
      </div>
    </div>
  );
}
