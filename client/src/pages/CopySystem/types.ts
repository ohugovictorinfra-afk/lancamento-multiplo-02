export type AdStatus = 'nao-gravado' | 'gravado' | 'em-edicao'

export type AdFormato = 'padrao' | 'dialogo'

// Tipo de conteúdo — independe do formato (padrão/diálogo é o estilo de escrita,
// tipo é se isso é um anúncio de tráfego ou uma VSL/script de vídeo).
export type AdTipo = 'anuncio' | 'vsl'

export interface Ad {
  id: string
  titulo: string
  nome: string
  colecao: string
  tipo: AdTipo
  formato: AdFormato
  status: AdStatus
  hook: string
  corpo: string
  cta: string
  observacoes?: string
}

export interface Colecao {
  id: string
  nome: string
}
