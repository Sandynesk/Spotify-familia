// Fonte única dos dados fictícios da landing (espelha docs/landing/BRIEF.md §3).
// Todas as telas, números e animações derivam daqui — não duplicar valores em componentes.

export type MemberStatus = 'pago' | 'pendente' | 'atrasado'

export interface LandingMember {
  id: string
  nome: string
  cor: string
  valor: number
  vencimento: number
}

export const MES_REFERENCIA = 'novembro de 2026'

export const MEMBERS: readonly LandingMember[] = [
  { id: 'ana', nome: 'Ana', cor: '#1DB954', valor: 7, vencimento: 10 },
  { id: 'bruno', nome: 'Bruno', cor: '#509BF5', valor: 7, vencimento: 10 },
  { id: 'carla', nome: 'Carla', cor: '#F59B23', valor: 7, vencimento: 10 },
  { id: 'diego', nome: 'Diego', cor: '#AF2896', valor: 7, vencimento: 10 },
  { id: 'elisa', nome: 'Elisa', cor: '#E8115B', valor: 7, vencimento: 10 },
  { id: 'vo-ze', nome: 'Vô Zé', cor: '#8D67AB', valor: 5, vencimento: 10 },
]

/** Momentos do painel ao longo da narrativa (BRIEF §3). */
export type PanelMoment = 'inicial' | 'carla-pagou' | 'completo'

const STATUS_BY_MOMENT: Record<PanelMoment, Record<string, MemberStatus>> = {
  inicial: { ana: 'pago', bruno: 'pago', carla: 'pendente', diego: 'atrasado', elisa: 'pago', 'vo-ze': 'pago' },
  'carla-pagou': { ana: 'pago', bruno: 'pago', carla: 'pago', diego: 'atrasado', elisa: 'pago', 'vo-ze': 'pago' },
  completo: { ana: 'pago', bruno: 'pago', carla: 'pago', diego: 'pago', elisa: 'pago', 'vo-ze': 'pago' },
}

export function statusOf(moment: PanelMoment, memberId: string): MemberStatus {
  return STATUS_BY_MOMENT[moment][memberId]
}

export interface PanelSummary {
  membrosAtivos: number
  /** Total do mês — no app real o card "A receber" mostra o total, não o restante. */
  aReceber: number
  jaPago: number
  emAtraso: number
  /** 0–100, arredondado como em lib/actions/pagamentos.ts */
  progresso: number
}

/** Mesma regra do app real (lib/actions/pagamentos.ts:142-153). */
export function summaryOf(moment: PanelMoment): PanelSummary {
  const aReceber = MEMBERS.reduce((acc, m) => acc + m.valor, 0)
  const sumBy = (s: MemberStatus) =>
    MEMBERS.filter((m) => statusOf(moment, m.id) === s).reduce((acc, m) => acc + m.valor, 0)
  const jaPago = sumBy('pago')
  return {
    membrosAtivos: MEMBERS.length,
    aReceber,
    jaPago,
    emAtraso: sumBy('atrasado'),
    progresso: aReceber > 0 ? Math.round((jaPago / aReceber) * 100) : 0,
  }
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** "R$ 7,00" — normaliza o espaço não separável do Intl para espaço comum. */
export function formatBRL(value: number): string {
  return brl.format(value).replace(/ /g, ' ')
}

/**
 * Cor de destaque da LANDING (marca). Exposta como CSS var `--landing-accent` pelo <Landing>.
 * Verde próprio da marca (logo "6 fatias"), distinto do verde do Spotify.
 * As telas recriadas do app (screens/) NÃO usam isto: elas usam o verde real do sistema (#1DB954)
 * para ficarem fiéis ao app atual.
 */
export { BRAND_COLORS as BRAND } from './brand'

export const LINKS = {
  cadastro: '/login?tab=register',
  login: '/login',
} as const
