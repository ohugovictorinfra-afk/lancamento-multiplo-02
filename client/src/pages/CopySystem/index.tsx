import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { NotebookPen } from 'lucide-react'
import { AdCard } from './AdCard'
import { AdModal } from './AdModal'
import { FilterBar } from './FilterBar'
import { adsIniciais, colecoes } from './data'
import type { Ad, AdStatus, AdFormato } from './types'
import './styles.css'

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
}

export default function CopySystem() {
  const [ads, setAds] = useState<Ad[]>(loadAds)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [filters, setFilters] = useState<Filters>({
    colecao: 'todos',
    status: 'todos',
    formato: 'todos',
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

  const filtered = useMemo(() => {
    return ads.filter(ad => {
      if (filters.colecao !== 'todos' && ad.colecao !== filters.colecao) return false
      if (filters.status !== 'todos' && ad.status !== filters.status) return false
      if (filters.formato !== 'todos' && ad.formato !== filters.formato) return false
      return true
    })
  }, [ads, filters])

  const counts = useMemo(() => ({
    gravado: ads.filter(a => a.status === 'gravado').length,
    'em-edicao': ads.filter(a => a.status === 'em-edicao').length,
    'nao-gravado': ads.filter(a => a.status === 'nao-gravado').length,
  }), [ads])

  return (
    <div className="copy-system app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__mark">
            <NotebookPen size={17} />
          </div>
          <div>
            <h1 className="app__title">Copy System</h1>
            <p className="app__subtitle">Gerenciador de Anúncios</p>
          </div>
        </div>
      </header>

      <main className="app__main">
        <FilterBar
          filters={filters}
          colecoes={colecoes}
          onChange={setFilters}
          total={filtered.length}
          counts={counts}
        />

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum ad encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <motion.div className="ads-grid" layout>
            {filtered.map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                onClick={() => openAd(ad)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </motion.div>
        )}
      </main>

      <AdModal
        ad={selectedAd}
        onClose={closeAd}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
