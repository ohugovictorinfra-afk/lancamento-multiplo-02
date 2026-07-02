export type AdStatus = 'nao-gravado' | 'gravado' | 'em-edicao'

export type AdFormato = 'padrao' | 'dialogo'

export interface Ad {
  id: string
  titulo: string
  nome: string
  colecao: string
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
