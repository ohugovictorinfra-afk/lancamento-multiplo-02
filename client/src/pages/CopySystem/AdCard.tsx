import type { Ad, AdStatus } from './types'

interface AdCardProps {
  ad: Ad
  onClick: () => void
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

export function AdCard({ ad, onClick, onStatusChange }: AdCardProps) {
  const status  = statusConfig[ad.status]
  const formato = formatoConfig[ad.formato] ?? { label: ad.formato, color: 'var(--text-muted)' }

  function cycleStatus(e: React.MouseEvent) {
    e.stopPropagation()
    const next = statusCycle[(statusCycle.indexOf(ad.status) + 1) % statusCycle.length]
    onStatusChange(ad.id, next)
  }

  const hookPreview = ad.hook.split('\n')[0].slice(0, 80)

  return (
    <button className="gallery-card" onClick={onClick} data-status={ad.status}>
      <div className="gallery-card__body">
        <p className="gallery-card__ref">{ad.titulo}</p>
        <h3 className="gallery-card__nome">{ad.nome}</h3>
        {hookPreview && (
          <p className="gallery-card__preview">{hookPreview}…</p>
        )}
      </div>

      <div className="gallery-card__footer">
        <span className="badge" style={{ '--badge-color': formato.color } as React.CSSProperties}>
          {formato.label}
        </span>
        <button
          className="status-dot"
          style={{ '--status-color': status.color, '--status-bg': status.bg } as React.CSSProperties}
          onClick={cycleStatus}
          title={`Status: ${status.label} — clique para mudar`}
        >
          {status.label}
        </button>
      </div>
    </button>
  )
}
