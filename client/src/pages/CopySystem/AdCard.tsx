import { Video } from 'lucide-react'
import type { Ad, AdStatus } from './types'

const T = {
  white:     "#FAFAFA",
  accent:    "#E31B23",
  accentLight: "#FF4444",
  border:    "rgba(227,27,35,0.28)",
  surface:   "rgba(255,255,255,0.045)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
  gold:      "#C8A96E",
};
const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";

interface AdCardProps {
  ad: Ad
  colecaoNome: string
  onClick: () => void
  onStatusChange: (id: string, status: AdStatus) => void
}

const statusConfig: Record<AdStatus, { label: string; color: string; bg: string }> = {
  'nao-gravado': { label: 'Não Gravado', color: T.veryMuted,  bg: "rgba(255,255,255,0.05)" },
  'em-edicao':   { label: 'Em Edição',   color: "#FACC15",    bg: "rgba(250,204,21,0.1)" },
  'gravado':     { label: 'Gravado',     color: "#4ADE80",    bg: "rgba(74,222,128,0.1)" },
}

const statusCycle: AdStatus[] = ['nao-gravado', 'em-edicao', 'gravado']

const formatoConfig: Record<string, string> = {
  padrao: 'Padrão',
  dialogo: 'Diálogo',
}

export function AdCard({ ad, colecaoNome, onClick, onStatusChange }: AdCardProps) {
  const status = statusConfig[ad.status]
  const isVsl = ad.tipo === 'vsl'

  function cycleStatus(e: React.MouseEvent) {
    e.stopPropagation()
    const next = statusCycle[(statusCycle.indexOf(ad.status) + 1) % statusCycle.length]
    onStatusChange(ad.id, next)
  }

  const hookPreview = ad.hook.split('\n')[0].slice(0, 90)

  return (
    <button onClick={onClick} data-status={ad.status}
      style={{ display: "flex", flexDirection: "column", textAlign: "left", cursor: "pointer",
        width: "100%", overflow: "hidden", position: "relative", padding: 0,
        background: T.surface, border: `1px solid ${isVsl ? "rgba(200,169,110,0.3)" : T.border}`,
        borderRadius: 5, transition: "border-color 0.2s, transform 0.2s" }}>

      <div style={{ padding: "16px 18px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: T.veryMuted,
            textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {ad.titulo}
          </span>
          {isVsl && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 7px",
              borderRadius: 99, background: "rgba(200,169,110,0.12)", color: T.gold,
              fontFamily: INTER, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em" }}>
              <Video size={9} /> VSL
            </span>
          )}
        </div>

        <h3 style={{ fontFamily: BEBAS, fontSize: 19, letterSpacing: "0.01em", lineHeight: 1.15,
          color: T.white, margin: 0 }}>
          {ad.nome}
        </h3>

        {hookPreview && (
          <p style={{ fontFamily: INTER, fontSize: 12, color: T.muted, lineHeight: 1.55,
            fontStyle: "italic", margin: 0 }}>
            {hookPreview}…
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 12px 18px", gap: 8, borderTop: `1px dashed ${T.border}`, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 600, color: T.veryMuted,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {colecaoNome}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.veryMuted, flexShrink: 0 }} />
          <span style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 600, color: T.veryMuted, whiteSpace: "nowrap" }}>
            {formatoConfig[ad.formato] ?? ad.formato}
          </span>
        </div>
        <button onClick={cycleStatus}
          title={`Status: ${status.label} — clique para mudar`}
          style={{ flexShrink: 0, fontFamily: INTER, fontSize: 10.5, fontWeight: 700, padding: "4px 10px",
            borderRadius: 20, border: "1px solid transparent", cursor: "pointer", whiteSpace: "nowrap",
            color: status.color, background: status.bg }}>
          {status.label}
        </button>
      </div>
    </button>
  )
}
