import type { AdStatus, AdFormato, AdTipo, Colecao } from './types'

const T = {
  white:     "#FAFAFA",
  accent:    "#E31B23",
  border:    "rgba(227,27,35,0.28)",
  surface:   "rgba(255,255,255,0.04)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
};
const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";

interface Filters {
  colecao: string
  status: AdStatus | 'todos'
  formato: AdFormato | 'todos'
  tipo: AdTipo | 'todos'
}

interface FilterBarProps {
  filters: Filters
  colecoes: Colecao[]
  onChange: (filters: Filters) => void
  total: number
  counts: Record<AdStatus, number>
}

const selectStyle: React.CSSProperties = {
  fontFamily: INTER, fontSize: 12, fontWeight: 600, padding: "7px 10px",
  borderRadius: 3, border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.03)",
  color: T.muted, cursor: "pointer", outline: "none",
};

function Stat({ num, label, color }: { num: number; label: string; color?: string }) {
  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: INTER, fontSize: 12, color: T.muted }}>
      <span style={{ fontFamily: BEBAS, fontSize: 20, letterSpacing: "0.02em", color: color ?? T.white }}>{num}</span>
      {label}
    </span>
  )
}

export function FilterBar({ filters, colecoes, onChange, total, counts }: FilterBarProps) {
  function set(partial: Partial<Filters>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 5, padding: "13px 18px",
      flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 22, alignItems: "baseline", flexWrap: "wrap" }}>
        <Stat num={total} label="itens" />
        <Stat num={counts.gravado} label="gravados" color="#4ADE80" />
        <Stat num={counts['em-edicao']} label="em edição" color="#FACC15" />
        <Stat num={counts['nao-gravado']} label="pendentes" color={T.veryMuted} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={filters.tipo} onChange={e => set({ tipo: e.target.value as AdTipo | 'todos' })} style={selectStyle}>
          <option value="todos">Todos os tipos</option>
          <option value="anuncio">Anúncio</option>
          <option value="vsl">VSL</option>
        </select>

        <select value={filters.colecao} onChange={e => set({ colecao: e.target.value })} style={selectStyle}>
          <option value="todos">Todas as coleções</option>
          {colecoes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select value={filters.status} onChange={e => set({ status: e.target.value as AdStatus | 'todos' })} style={selectStyle}>
          <option value="todos">Todos os status</option>
          <option value="nao-gravado">Não Gravado</option>
          <option value="em-edicao">Em Edição</option>
          <option value="gravado">Gravado</option>
        </select>

        <select value={filters.formato} onChange={e => set({ formato: e.target.value as AdFormato | 'todos' })} style={selectStyle}>
          <option value="todos">Todos os formatos</option>
          <option value="padrao">Padrão</option>
          <option value="dialogo">Diálogo</option>
        </select>
      </div>
    </div>
  )
}
