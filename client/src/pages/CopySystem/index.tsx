import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { NotebookPen } from 'lucide-react'
import { AdCard } from './AdCard'
import { AdModal } from './AdModal'
import { FilterBar } from './FilterBar'
import { adsIniciais, colecoes } from './data'
import type { Ad, AdStatus, AdFormato, AdTipo } from './types'

const T = {
  bg:        "#07070F",
  white:     "#FAFAFA",
  accentLight: "#FF4444",
  border:    "rgba(227,27,35,0.28)",
  muted:     "rgba(250,250,250,0.55)",
  veryMuted: "rgba(250,250,250,0.38)",
};
const BEBAS = "'Bebas Neue', sans-serif";
const INTER = "'Inter', sans-serif";

const STORAGE_KEY = 'copy-system-ads'

function loadAds(): Ad[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return adsIniciais
    const savedAds: Ad[] = JSON.parse(saved)
    const savedMap = new Map(savedAds.map(a => [a.id, a]))
    // Conteúdo (hook/corpo/cta) sempre vem do código; só status é persistido
    return adsIniciais.map(a => {
      const s = savedMap.get(a.id)
      return s ? { ...a, status: s.status } : a
    })
  } catch {
    return adsIniciais
  }
}

interface Filters {
  colecao: string
  status: AdStatus | 'todos'
  formato: AdFormato | 'todos'
  tipo: AdTipo | 'todos'
}

export default function CopySystem() {
  const [ads, setAds] = useState<Ad[]>(loadAds)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [filters, setFilters] = useState<Filters>({
    colecao: 'todos',
    status: 'todos',
    formato: 'todos',
    tipo: 'todos',
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads))
  }, [ads])

  // Deep link: ?ad=<id> na URL abre o modal desse ad direto ao carregar a página
  // (usado pelas tarefas do mapa de funil pra apontar direto pra uma copy específica).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('ad')
    if (!id) return
    const ad = ads.find(a => a.id === id)
    if (ad) setSelectedAd(ad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openAd(ad: Ad) {
    setSelectedAd(ad)
    const url = new URL(window.location.href)
    url.searchParams.set('ad', ad.id)
    window.history.replaceState(null, '', url)
  }

  function closeAd() {
    setSelectedAd(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('ad')
    window.history.replaceState(null, '', url)
  }

  function handleStatusChange(id: string, status: AdStatus) {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
    // Atualiza o ad aberto no modal se for o mesmo
    setSelectedAd(prev => (prev?.id === id ? { ...prev, status } : prev))
  }

  const colecaoNome = useMemo(() => {
    const map = new Map(colecoes.map(c => [c.id, c.nome]))
    return (id: string) => map.get(id) ?? id
  }, [])

  const filtered = useMemo(() => {
    return ads.filter(ad => {
      if (filters.colecao !== 'todos' && ad.colecao !== filters.colecao) return false
      if (filters.status !== 'todos' && ad.status !== filters.status) return false
      if (filters.formato !== 'todos' && ad.formato !== filters.formato) return false
      if (filters.tipo !== 'todos' && ad.tipo !== filters.tipo) return false
      return true
    })
  }, [ads, filters])

  const counts = useMemo(() => ({
    gravado: ads.filter(a => a.status === 'gravado').length,
    'em-edicao': ads.filter(a => a.status === 'em-edicao').length,
    'nao-gravado': ads.filter(a => a.status === 'nao-gravado').length,
  }), [ads])

  return (
    <div style={{ background: T.bg, color: T.white, fontFamily: INTER, minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(250,250,250,0.25); }
      `}</style>

      <header style={{ padding: "32px 32px 24px", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 4, flexShrink: 0,
            background: "rgba(227,27,35,0.12)", color: T.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NotebookPen size={16} />
          </div>
          <div>
            <p style={{ fontFamily: INTER, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em",
              textTransform: "uppercase", color: T.accentLight, marginBottom: 2 }}>
              Copy System
            </p>
            <h1 style={{ fontFamily: BEBAS, fontSize: 24, letterSpacing: "0.02em", color: T.white }}>
              GERENCIADOR DE ANÚNCIOS E VSLS
            </h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "0 auto", width: "100%", padding: "28px 32px 56px",
        display: "flex", flexDirection: "column", gap: 22 }}>
        <FilterBar
          filters={filters}
          colecoes={colecoes}
          onChange={setFilters}
          total={filtered.length}
          counts={counts}
        />

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontFamily: INTER, fontSize: 14, color: T.veryMuted, fontStyle: "italic" }}>
              Nenhum item encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <motion.div layout style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))", gap: 16 }}>
            {filtered.map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                colecaoNome={colecaoNome(ad.colecao)}
                onClick={() => openAd(ad)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </motion.div>
        )}
      </main>

      <AdModal
        ad={selectedAd}
        colecaoNome={selectedAd ? colecaoNome(selectedAd.colecao) : ""}
        onClose={closeAd}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
