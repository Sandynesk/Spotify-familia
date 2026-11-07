'use client'

import { motion } from 'framer-motion'
import { Crown, Sparkles, Timer } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { BrandSymbol } from '@/components/landing/BrandMark'
import { formatCurrency } from '@/lib/utils/currency'
import type { Retrospectiva } from '@/lib/domain/wrapped'
import type { RetrospectivaPessoa } from '@/lib/actions/retrospectiva'
import { monthName, monthShortNames, WRAPPED_STORIES, type WrappedStoryId } from '@/components/wrapped/stories'

interface WrappedStoryProps {
  story: WrappedStoryId
  ano: number
  retrospectiva: Retrospectiva
  pessoas: RetrospectivaPessoa[]
  reducedMotion: boolean
}

export function WrappedStory({ story, ano, retrospectiva, pessoas, reducedMotion }: WrappedStoryProps) {
  const punctualMember = retrospectiva.membroMaisPontual
    ? pessoas.find(pessoa => pessoa.id === retrospectiva.membroMaisPontual?.membroId)
    : undefined
  const family = [
    { id: 'owner', nome: 'Você', corAvatar: null },
    ...pessoas.filter(pessoa => pessoa.ativo),
  ]
  const storyMeta = WRAPPED_STORIES.find(item => item.id === story)!
  const entrance = reducedMotion ? undefined : { opacity: 0, y: 12 }

  return (
    <motion.section
      key={story}
      initial={entrance}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center px-7 pb-8 pt-5 text-center sm:px-10"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className={`mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] ${storyMeta.tint}`}>
        {storyMeta.eyebrow}
      </p>
      <h1 className="max-w-[17ch] text-balance text-[clamp(2rem,8vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-app-text">
        {storyMeta.title}
      </h1>

      {story === 'arrecadado' && (
        <>
          <NumberTicker
            value={retrospectiva.totalArrecadado}
            decimals={2}
            format={formatCurrency}
            className="mt-9 block max-w-full text-[clamp(3.2rem,14vw,6rem)] font-semibold leading-none tracking-[-0.075em] text-app-accent"
          />
          <p className="mt-5 max-w-[25ch] text-[15px] leading-relaxed text-app-muted">
            foi o total que sua família colocou no plano Família em {ano}.
          </p>
        </>
      )}

      {story === 'economia' && (
        <>
          <NumberTicker
            value={retrospectiva.economia}
            decimals={2}
            format={formatCurrency}
            className="mt-9 block max-w-full text-[clamp(3.2rem,14vw,6rem)] font-semibold leading-none tracking-[-0.075em] text-cyan-200"
          />
          <p className="mt-5 max-w-[26ch] text-[15px] leading-relaxed text-app-muted">
            foi o que voltou para você ao dividir o custo do plano com a família.
          </p>
          <p className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-app-subtle">
            Sua parte estimada: {formatCurrency(retrospectiva.suaParte)}
          </p>
        </>
      )}

      {story === 'fechamento' && (
        <>
          <div className="mt-9 grid w-full max-w-[276px] grid-cols-4 gap-x-3 gap-y-5" role="img" aria-label={`${retrospectiva.mesesFechados} de 12 meses com todos os pagamentos recebidos`}>
            {monthShortNames().map((month, index) => {
              const closed = index < retrospectiva.mesesFechados
              return (
                <div className="flex flex-col items-center gap-2" key={month}>
                  <motion.span
                    aria-hidden
                    initial={reducedMotion ? undefined : { opacity: 0.25, scale: 0.72 }}
                    animate={{ opacity: closed ? 1 : 0.26, scale: closed ? 1 : 0.84 }}
                    transition={reducedMotion ? { duration: 0 } : { delay: index * 0.055, type: 'spring', stiffness: 340, damping: 24 }}
                    className={`h-[15px] w-9 rounded-full ${closed ? 'bg-violet-200 shadow-[0_0_24px_rgb(196_181_253_/_0.62)]' : 'bg-app-raised ring-1 ring-white/10'}`}
                  />
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-app-subtle">{month}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-9 text-5xl font-semibold tracking-[-0.06em] text-violet-200 tabular">
            {retrospectiva.mesesFechados}<span className="ml-2 text-xl text-app-muted">/ 12</span>
          </p>
          <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-app-muted">
            meses terminaram com todos os pagamentos recebidos.
          </p>
        </>
      )}

      {story === 'pontual' && (
        retrospectiva.membroMaisPontual ? (
          <>
            <div className="relative mt-9">
              <span className="absolute -right-2 -top-2 z-[1] grid h-10 w-10 place-items-center rounded-full border border-app-bg bg-amber-300 text-amber-950 shadow-lg" aria-hidden>
                <Crown className="h-5 w-5" fill="currentColor" />
              </span>
              <Avatar
                nome={retrospectiva.membroMaisPontual.nome}
                cor={punctualMember?.corAvatar}
                size="xl"
                className="h-28 w-28 border-4 border-app-bg text-3xl shadow-[0_0_52px_rgb(252_211_77_/_0.24)] ring-2 ring-amber-300/70"
              />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-app-text">
              {retrospectiva.membroMaisPontual.nome}
            </h2>
            <div className="mt-5 inline-flex items-baseline gap-2 rounded-full border border-amber-200/15 bg-amber-200/10 px-5 py-2 text-amber-200">
              <NumberTicker value={retrospectiva.membroMaisPontual.score} className="text-3xl font-semibold tracking-[-0.05em]" />
              <span className="text-sm">pontos</span>
            </div>
            <p className="mt-5 text-sm text-app-muted">Presença impecável no calendário da família.</p>
          </>
        ) : (
          <NoData text="Ainda não há pagamentos suficientes para escolher a pessoa mais pontual." />
        )
      )}

      {story === 'rapido' && (
        retrospectiva.pagamentoMaisRapido ? (
          <>
            <span className="mt-9 grid h-20 w-20 place-items-center rounded-[28px] border border-cyan-200/15 bg-cyan-200/10 text-cyan-200 shadow-[0_0_60px_rgb(103_232_249_/_0.12)]" aria-hidden>
              <Timer className="h-10 w-10" strokeWidth={1.5} />
            </span>
            <h2 className="mt-7 text-4xl font-semibold tracking-[-0.055em] text-app-text">
              {retrospectiva.pagamentoMaisRapido.nome}
            </h2>
            <p className="mt-4 text-2xl font-medium tracking-[-0.03em] text-cyan-200">
              {paymentTiming(retrospectiva.pagamentoMaisRapido.horasEmRelacaoVencimento)}
            </p>
            <p className="mt-5 text-sm text-app-muted">Pagamento de {monthName(retrospectiva.pagamentoMaisRapido.mesReferencia)}.</p>
          </>
        ) : (
          <NoData text="Ainda não há pagamentos registrados para encontrar o mais rápido." />
        )
      )}

      {story === 'dificil' && (
        retrospectiva.mesMaisDificil ? (
          <>
            <p className="mt-9 text-[clamp(3rem,13vw,5.75rem)] font-semibold capitalize leading-none tracking-[-0.065em] text-violet-200">
              {monthName(retrospectiva.mesMaisDificil.mesReferencia)}
            </p>
            <div className="mt-7 h-3 w-full max-w-[260px] overflow-hidden rounded-full bg-app-raised ring-1 ring-white/10" role="img" aria-label={`${retrospectiva.mesMaisDificil.taxaRecebimento}% do valor previsto foi recebido`}>
              <motion.span
                className="block h-full rounded-full bg-violet-200"
                initial={reducedMotion ? undefined : { width: 0 }}
                animate={{ width: `${retrospectiva.mesMaisDificil.taxaRecebimento}%` }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.15 }}
              />
            </div>
            <p className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-violet-200 tabular">
              {retrospectiva.mesMaisDificil.taxaRecebimento}<span className="ml-1 text-2xl">%</span>
            </p>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-app-muted">
              do valor previsto entrou. Depois, a família se acertou.
            </p>
          </>
        ) : (
          <NoData text="Ainda não há cobranças suficientes para destacar um mês." />
        )
      )}

      {story === 'estilo' && (
        <>
          <span className="mt-9 grid h-20 w-20 place-items-center rounded-[28px] border border-amber-200/15 bg-amber-200/10 text-amber-200 shadow-[0_0_60px_rgb(252_211_77_/_0.14)]" aria-hidden>
            <Sparkles className="h-10 w-10" strokeWidth={1.5} />
          </span>
          <h2 className="mt-7 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-amber-100">
            {retrospectiva.estiloCobrador}
          </h2>
          <p className="mt-5 max-w-[28ch] text-[15px] leading-relaxed text-app-muted">
            {styleDescription(retrospectiva.estiloCobrador)}
          </p>
        </>
      )}

      {story === 'familia' && (
        <>
          <div className="relative mt-9 h-[276px] w-[276px] max-w-full">
            <span className="absolute inset-[16%] rounded-full border border-app-accent/15" aria-hidden />
            <span className="absolute inset-[28%] rounded-full border border-app-accent/10" aria-hidden />
            <span className="absolute left-1/2 top-1/2 z-[1] grid h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-app-accent/20 bg-app-surface/90 shadow-[0_0_60px_rgb(72_229_178_/_0.2)]">
              <BrandSymbol size={52} />
            </span>
            {family.slice(0, 6).map((person, index, list) => {
              const angle = (Math.PI * 2 * index) / list.length - Math.PI / 2
              return (
                <motion.span
                  key={person.id}
                  initial={reducedMotion ? undefined : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reducedMotion ? { duration: 0 } : { delay: index * 0.1, type: 'spring', stiffness: 300, damping: 22 }}
                  className="absolute z-[2] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + Math.cos(angle) * 40}%`, top: `${50 + Math.sin(angle) * 40}%` }}
                >
                  <Avatar nome={person.nome} cor={person.corAvatar} size="lg" className="border-2 border-app-bg shadow-lg" />
                </motion.span>
              )
            })}
          </div>
          <p className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-app-accent tabular">
            {family.length}<span className="ml-2 text-xl font-medium text-app-muted">pessoas</span>
          </p>
          <p className="mt-2 max-w-[24ch] text-sm leading-relaxed text-app-muted">
            cada uma ajudou a fazer esse plano acontecer.
          </p>
        </>
      )}

      {story === 'resumo' && (
        <>
          <div className="mt-8 grid w-full max-w-[300px] grid-cols-2 gap-3 text-left">
            <SummaryMetric label="Arrecadado" value={formatCurrency(retrospectiva.totalArrecadado)} tone="mint" />
            <SummaryMetric label="Meses completos" value={`${retrospectiva.mesesFechados}/12`} tone="cyan" />
            <SummaryMetric label="Economia" value={formatCurrency(retrospectiva.economia)} tone="violet" />
            <SummaryMetric label="Mais pontual" value={retrospectiva.membroMaisPontual?.nome ?? '—'} tone="amber" />
          </div>
          <div className="mt-6">
            <p className="text-xs font-medium text-app-subtle">Uma família que faz acontecer</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-app-text">Plano Família · {ano}</p>
          </div>
        </>
      )}
    </motion.section>
  )
}

function NoData({ text }: { text: string }) {
  return <p className="mt-9 max-w-[27ch] text-[15px] leading-relaxed text-app-muted">{text}</p>
}

function SummaryMetric({ label, value, tone }: { label: string; value: string; tone: 'mint' | 'cyan' | 'violet' | 'amber' }) {
  const toneClasses = {
    mint: 'text-app-accent border-app-accent/15 bg-app-accent/[0.06]',
    cyan: 'text-cyan-200 border-cyan-200/15 bg-cyan-200/[0.06]',
    violet: 'text-violet-200 border-violet-200/15 bg-violet-200/[0.06]',
    amber: 'text-amber-200 border-amber-200/15 bg-amber-200/[0.06]',
  }

  return (
    <div className={`min-w-0 rounded-[20px] border p-3.5 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-app-subtle">{label}</p>
      <p className="mt-2 truncate text-lg font-semibold leading-tight tracking-[-0.035em] tabular" title={value}>{value}</p>
    </div>
  )
}

function paymentTiming(hours: number): string {
  if (hours === 0) return 'no dia do vencimento'
  const duration = `${Math.abs(hours)} ${Math.abs(hours) === 1 ? 'hora' : 'horas'}`
  return hours < 0 ? `${duration} antes` : `${duration} depois`
}

function styleDescription(style: string): string {
  if (style === 'O maestro da organização') return 'Todos os meses no ritmo certo. Dá até para reger uma orquestra de boletos.'
  if (style === 'O lembrete gentil') return 'Você lembra com carinho e sua família responde no tempo certo.'
  if (style === 'O persistente do PIX') return 'Você não desiste até todo mundo entrar no mesmo compasso.'
  return 'Cada família tem seu tempo. O importante é seguir mantendo tudo em movimento.'
}
