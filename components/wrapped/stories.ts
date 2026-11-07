export const WRAPPED_STORIES = [
  { id: 'arrecadado', title: 'O que entrou', eyebrow: 'O ano em números', glow: 'bg-app-accent/20', tint: 'text-app-accent' },
  { id: 'economia', title: 'Você economizou', eyebrow: 'Dividindo o plano', glow: 'bg-cyan-300/20', tint: 'text-cyan-200' },
  { id: 'fechamento', title: 'Meses fechados', eyebrow: 'Todo mundo em dia', glow: 'bg-violet-300/20', tint: 'text-violet-200' },
  { id: 'pontual', title: 'A pessoa mais pontual', eyebrow: 'Relógio em dia', glow: 'bg-amber-300/20', tint: 'text-amber-200' },
  { id: 'rapido', title: 'O pagamento mais rápido', eyebrow: 'Nem deu tempo de lembrar', glow: 'bg-cyan-300/20', tint: 'text-cyan-200' },
  { id: 'dificil', title: 'O mês mais difícil', eyebrow: 'Foi por pouco', glow: 'bg-violet-300/20', tint: 'text-violet-200' },
  { id: 'estilo', title: 'Seu estilo de cobrador', eyebrow: 'Com a sua cara', glow: 'bg-amber-300/20', tint: 'text-amber-200' },
  { id: 'familia', title: 'A família', eyebrow: 'Um plano, muita parceria', glow: 'bg-app-accent/20', tint: 'text-app-accent' },
  { id: 'resumo', title: 'Esse foi o seu ano', eyebrow: 'Pronto para o grupo', glow: 'bg-cyan-300/20', tint: 'text-cyan-200' },
] as const

export type WrappedStoryId = (typeof WRAPPED_STORIES)[number]['id']

export function monthName(monthReference: string): string {
  const [year, month] = monthReference.slice(0, 7).split('-').map(Number)
  if (!year || !month) return monthReference
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)))
}

export function monthShortNames(): string[] {
  const year = 2024
  return Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(year, index, 1))).replace('.', ''),
  )
}
