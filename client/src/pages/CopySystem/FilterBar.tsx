import type { AdStatus, AdFormato, Colecao } from './types'

interface Filters {
  colecao: string
  status: AdStatus | 'todos'
  formato: AdFormato | 'todos'
}

interface FilterBarProps {
  filters: Filters
  colecoes: Colecao[]
  onChange: (filters: Filters) => void
  total: number
  counts: Record<AdStatus, number>
}

export function FilterBar({ filters, colecoes, onChange, total, counts }: FilterBarProps) {
  function set(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__stats">
        <span className="stat">
          <span className="stat__num">{total}</span> ads
        </span>
        <span className="stat stat--done">
          <span className="stat__num">{counts.gravado}</span> gravados
        </span>
        <span className="stat stat--editing">
          <span className="stat__num">{counts['em-edicao']}</span> em edição
        </span>
        <span className="stat stat--pending">
          <span className="stat__num">{counts['nao-gravado']}</span> pendentes
        </span>
      </div>

      <div className="filter-bar__controls">
        <select
          value={filters.colecao}
          onChange={e => set({ colecao: e.target.value })}
          className="filter-select"
        >
          <option value="todos">Todas as coleções</option>
          {colecoes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={e => set({ status: e.target.value as AdStatus | 'todos' })}
          className="filter-select"
        >
          <option value="todos">Todos os status</option>
          <option value="nao-gravado">Não Gravado</option>
          <option value="em-edicao">Em Edição</option>
          <option value="gravado">Gravado</option>
        </select>

        <select
          value={filters.formato}
          onChange={e => set({ formato: e.target.value as AdFormato | 'todos' })}
          className="filter-select"
        >
          <option value="todos">Todos os formatos</option>
          <option value="padrao">Padrão</option>
          <option value="dialogo">Diálogo</option>
        </select>
      </div>
    </div>
  )
}
