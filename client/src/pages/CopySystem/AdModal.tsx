import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, AlignLeft, ArrowUpRight, Video } from 'lucide-react'
import type { Ad, AdStatus } from './types'

const T = {
  bg:        "#07070F",
  white:     "#FAFAFA",
  accent:    "#E31B23",
  border:    "rgba(227,27,35,0.28)",
  surface:   "rgba(255,255,255,0.04)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
  gold:      "#C8A96E",
};
const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";
const ease = [0.22, 1, 0.36, 1] as const;

interface AdModalProps {
  ad: Ad | null
  colecaoNome: string
  onClose: () => void
  onStatusChange: (id: string, status: AdStatus) => void
}

const statusConfig: Record<AdStatus, { label: string; color: string; bg: string }> = {
  'nao-gravado': { label: 'Não Gravado', color: T.veryMuted, bg: "rgba(255,255,255,0.05)" },
  'em-edicao':   { label: 'Em Edição',   color: "#FACC15",   bg: "rgba(250,204,21,0.1)" },
  'gravado':     { label: 'Gravado',     color: "#4ADE80",   bg: "rgba(74,222,128,0.1)" },
}

const statusCycle: AdStatus[] = ['nao-gravado', 'em-edicao', 'gravado']

const sections = [
  { key: 'hook'  as const, label: 'Hook',  icon: <Zap size={12} />,          color: T.accent },
  { key: 'corpo' as const, label: 'Corpo', icon: <AlignLeft size={12} />,    color: "#7FA3C0" },
  { key: 'cta'   as const, label: 'CTA',   icon: <ArrowUpRight size={12} />, color: "#A3B26A" },
]

export function AdModal({ ad, colecaoNome, onClose, onStatusChange }: AdModalProps) {
  useEffect(() => {
    if (!ad) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ad, onClose])

  function cycleStatus() {
    if (!ad) return
    const next = statusCycle[(statusCycle.indexOf(ad.status) + 1) % statusCycle.length]
    onStatusChange(ad.id, next)
  }

  return (
    <AnimatePresence>
      {ad && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20 }}>

          <div onClick={onClose}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }} />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ duration: 0.22, ease }}
            style={{ position: "relative", zIndex: 1, background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 6, width: "min(680px, 100%)", maxHeight: "calc(100vh - 60px)",
              display: "flex", flexDirection: "column", overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              gap: 16, padding: "24px 26px 18px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, color: T.veryMuted,
                    textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {ad.titulo}
                  </span>
                  <span style={{ fontFamily: INTER, fontSize: 10.5, color: T.veryMuted }}>{colecaoNome}</span>
                  {ad.tipo === 'vsl' && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 7px",
                      borderRadius: 99, background: "rgba(200,169,110,0.12)", color: T.gold,
                      fontFamily: INTER, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em" }}>
                      <Video size={9} /> VSL
                    </span>
                  )}
                </div>
                <h2 style={{ fontFamily: BEBAS, fontSize: 28, letterSpacing: "0.01em",
                  color: T.white, margin: 0, lineHeight: 1.1 }}>
                  {ad.nome}
                </h2>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <button onClick={cycleStatus} title="Clique para mudar status"
                  style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, padding: "5px 12px",
                    borderRadius: 20, border: "1px solid transparent", cursor: "pointer", whiteSpace: "nowrap",
                    color: statusConfig[ad.status].color, background: statusConfig[ad.status].bg }}>
                  {statusConfig[ad.status].label}
                </button>
                <button onClick={onClose} aria-label="Fechar"
                  style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${T.border}`,
                    background: "transparent", color: T.muted, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ overflowY: "auto", padding: "4px 26px 28px" }}>
              {sections.map(({ key, label, icon, color }) => {
                const content = ad[key]
                if (!content) return null
                return (
                  <div key={key} style={{ padding: "20px 0 20px 16px", borderBottom: `1px solid ${T.border}`,
                    borderLeft: `2px solid ${color}`, marginLeft: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ color }}>{icon}</span>
                      <span style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, color,
                        textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {content.split('\n\n').map((para, i) => (
                        <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: T.muted,
                          margin: 0, whiteSpace: "pre-wrap" }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}

              {ad.observacoes && (
                <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 4,
                  background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.25)" }}>
                  <p style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, color: "#FACC15",
                    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Observações
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(250,250,250,0.8)", margin: 0 }}>
                    {ad.observacoes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
