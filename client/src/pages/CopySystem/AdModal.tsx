import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, AlignLeft, ArrowUpRight } from 'lucide-react'
import type { Ad, AdStatus } from './types'

interface AdModalProps {
  ad: Ad | null
  onClose: () => void
  onStatusChange: (id: string, status: AdStatus) => void
}

const statusConfig: Record<AdStatus, { label: string; color: string; bg: string }> = {
  'nao-gravado': { label: 'Não Gravado', color: 'var(--status-pending)', bg: 'var(--status-pending-soft)' },
  'em-edicao':   { label: 'Em Edição',   color: 'var(--status-editing)', bg: 'var(--status-editing-soft)' },
  'gravado':     { label: 'Gravado',     color: 'var(--status-done)',    bg: 'var(--status-done-soft)'    },
}

const statusCycle: AdStatus[] = ['nao-gravado', 'em-edicao', 'gravado']

const formatoConfig: Record<string, { label: string; color: string }> = {
  padrao:  { label: 'Padrão',  color: 'var(--formato-padrao)'  },
  dialogo: { label: 'Diálogo', color: 'var(--formato-dialogo)' },
}

const sections = [
  { key: 'hook'  as const, label: 'Hook',  icon: <Zap size={13} />,          color: 'var(--section-hook)'  },
  { key: 'corpo' as const, label: 'Corpo', icon: <AlignLeft size={13} />,    color: 'var(--section-corpo)' },
  { key: 'cta'   as const, label: 'CTA',   icon: <ArrowUpRight size={13} />, color: 'var(--section-cta)'   },
]

export function AdModal({ ad, onClose, onStatusChange }: AdModalProps) {
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
          className="modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Overlay */}
          <div className="modal-overlay" onClick={onClose} />

          {/* Panel */}
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="modal-header">
              <div className="modal-header__meta">
                <div className="modal-header__badges">
                  <span className="modal-ref">{ad.titulo}</span>
                  <span
                    className="badge"
                    style={{ '--badge-color': formatoConfig[ad.formato]?.color } as React.CSSProperties}
                  >
                    {formatoConfig[ad.formato]?.label}
                  </span>
                </div>
                <h2 className="modal-nome">{ad.nome}</h2>
              </div>

              <div className="modal-header__actions">
                <button
                  className="status-btn"
                  style={{
                    '--status-color': statusConfig[ad.status].color,
                    '--status-bg': statusConfig[ad.status].bg,
                  } as React.CSSProperties}
                  onClick={cycleStatus}
                  title="Clique para mudar status"
                >
                  {statusConfig[ad.status].label}
                </button>
                <button className="modal-close" onClick={onClose} aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Copy sections */}
            <div className="modal-body">
              {sections.map(({ key, label, icon, color }) => {
                const content = ad[key]
                if (!content) return null
                return (
                  <div
                    key={key}
                    className="copy-section"
                    style={{ '--section-line-color': color } as React.CSSProperties}
                  >
                    <div className="copy-section__label" style={{ color }}>
                      {icon}
                      <span>{label}</span>
                    </div>
                    <div className="copy-section__content">
                      {content.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                )
              })}

              {ad.observacoes && (
                <div className="copy-section copy-section--obs">
                  <div className="copy-section__label">
                    <span>Observações</span>
                  </div>
                  <div className="copy-section__content">
                    <p>{ad.observacoes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
