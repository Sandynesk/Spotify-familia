'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { BrandMark } from '@/components/landing/BrandMark'
import type { Retrospectiva } from '@/lib/domain/wrapped'
import type { RetrospectivaPessoa } from '@/lib/actions/retrospectiva'
import { WRAPPED_STORIES } from '@/components/wrapped/stories'
import { AnimatedBrand } from '@/components/wrapped/AnimatedBrand'
import { ShareCardButton } from '@/components/wrapped/ShareCardButton'
import { WrappedStory } from '@/components/wrapped/WrappedStory'
import styles from '@/components/wrapped/WrappedExperience.module.css'

interface WrappedExperienceProps {
  ano: number
  retrospectiva: Retrospectiva
  pessoas: RetrospectivaPessoa[]
  mesesComDados: number
}

const STORY_DURATION = 6_000
const LAST_STORY = WRAPPED_STORIES.length - 1

export function WrappedExperience({ ano, retrospectiva, pessoas, mesesComDados }: WrappedExperienceProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion() ?? true
  const [started, setStarted] = useState(false)
  const [activeStory, setActiveStory] = useState(0)
  const [paused, setPaused] = useState(false)
  const [holding, setHolding] = useState(false)
  const remainingRef = useRef(STORY_DURATION)
  const timerStartedAt = useRef(0)
  const timerAdvanced = useRef(false)
  const pointerDownAt = useRef<number | null>(null)
  const heldLongEnough = useRef(false)
  const ready = mesesComDados >= 2
  const story = WRAPPED_STORIES[activeStory]

  const close = useCallback(() => router.push('/visao-geral'), [router])

  const moveTo = useCallback((next: number) => {
    if (next < 0 || next > LAST_STORY) return
    timerAdvanced.current = true
    remainingRef.current = STORY_DURATION
    setPaused(false)
    setActiveStory(next)
  }, [])

  const nextStory = useCallback(() => moveTo(Math.min(activeStory + 1, LAST_STORY)), [activeStory, moveTo])
  const previousStory = useCallback(() => moveTo(Math.max(activeStory - 1, 0)), [activeStory, moveTo])

  useEffect(() => {
    if (!started || paused || prefersReducedMotion || activeStory >= LAST_STORY) return

    timerStartedAt.current = performance.now()
    const timer = window.setTimeout(() => {
      timerAdvanced.current = true
      remainingRef.current = STORY_DURATION
      setActiveStory(current => Math.min(current + 1, LAST_STORY))
    }, remainingRef.current)

    return () => {
      window.clearTimeout(timer)
      if (!timerAdvanced.current) {
        remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - timerStartedAt.current))
      }
      timerAdvanced.current = false
    }
  }, [activeStory, paused, prefersReducedMotion, started])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
      } else if (started && event.key === 'ArrowRight') {
        event.preventDefault()
        nextStory()
      } else if (started && event.key === 'ArrowLeft') {
        event.preventDefault()
        previousStory()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close, nextStory, previousStory, started])

  function startHolding() {
    pointerDownAt.current = performance.now()
    heldLongEnough.current = false
    setHolding(true)
    setPaused(true)
  }

  function endHolding() {
    if (pointerDownAt.current !== null) {
      heldLongEnough.current = performance.now() - pointerDownAt.current >= 240
      pointerDownAt.current = null
    }
    setHolding(false)
    setPaused(false)
  }

  function cancelHolding() {
    pointerDownAt.current = null
    heldLongEnough.current = false
    setHolding(false)
    setPaused(false)
  }

  function handleZoneClick(direction: 'next' | 'previous') {
    if (heldLongEnough.current) {
      heldLongEnough.current = false
      return
    }
    if (direction === 'next') nextStory()
    else previousStory()
  }

  const glow = started ? story.glow : 'bg-app-accent/20'

  return (
    <div className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-hidden bg-app-bg font-app text-app-text">
      <div aria-hidden className={`pointer-events-none absolute left-1/2 top-1/2 h-[72vmax] w-[72vmax] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] transition-colors duration-700 ${glow}`} />

      <main className="relative flex h-full w-full flex-col overflow-hidden bg-app-bg/90 md:h-auto md:aspect-[9/16] md:max-h-[min(92dvh,840px)] md:w-[min(calc(100vw-2rem),472px)] md:rounded-[40px] md:border md:border-white/10 md:bg-app-surface/90 md:shadow-[0_32px_120px_rgb(0_0_0_/_0.72)]">
        <div aria-hidden className={`pointer-events-none absolute -right-28 -top-32 h-[360px] w-[360px] rounded-full blur-[90px] transition-colors duration-700 ${glow}`} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-app-surface/65 to-transparent" />

        {started ? (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <header className="relative z-30 flex items-center gap-3 px-4 pt-[max(10px,env(safe-area-inset-top))] sm:px-5 md:pt-5">
              <div className="flex min-w-0 flex-1 gap-1.5" role="img" aria-label={`História ${activeStory + 1} de ${WRAPPED_STORIES.length}`}>
                {WRAPPED_STORIES.map((item, index) => (
                  <span key={item.id} className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/15">
                    <span
                      className={`block h-full w-full origin-left rounded-full ${index < activeStory ? 'scale-x-100 bg-app-text' : index === activeStory ? 'bg-app-text' : 'scale-x-0 bg-app-text'} ${index === activeStory && !prefersReducedMotion ? `${styles.progressFill} ${paused ? styles.paused : ''}` : ''} ${index === activeStory && prefersReducedMotion ? styles.still : ''}`}
                    />
                  </span>
                ))}
              </div>
              <IconButton aria-label="Fechar retrospectiva" variant="glass" icon={<X />} onClick={close} />
            </header>

            <div
              className="relative flex min-h-0 flex-1 flex-col"
              onPointerDown={startHolding}
              onPointerUp={endHolding}
              onPointerCancel={cancelHolding}
            >
              <AnimatePresence mode="wait" initial={false}>
                <WrappedStory
                  key={story.id}
                  story={story.id}
                  ano={ano}
                  retrospectiva={retrospectiva}
                  pessoas={pessoas}
                  reducedMotion={prefersReducedMotion}
                />
              </AnimatePresence>

              <button
                type="button"
                aria-label="História anterior"
                className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-none bg-transparent focus-visible:bg-white/[0.02]"
                onClick={() => handleZoneClick('previous')}
              />
              <button
                type="button"
                aria-label="Próxima história"
                className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-none bg-transparent focus-visible:bg-white/[0.02]"
                onClick={() => handleZoneClick('next')}
              />
              {holding && <span className="sr-only" role="status">História pausada</span>}
            </div>

            <footer className="relative z-30 flex min-h-[78px] flex-col items-center justify-center gap-2 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-1 sm:min-h-[88px] md:pb-4">
              {activeStory === LAST_STORY ? (
                <ShareCardButton ano={ano} />
              ) : (
                <p className="text-[11px] font-medium tracking-wide text-app-subtle">
                  {paused ? 'Pausado' : 'Toque à direita para continuar'}
                </p>
              )}
              <div className="flex w-full items-center justify-between">
                <IconButton aria-label="Voltar história" variant="ghost" icon={<ArrowLeft />} onClick={previousStory} disabled={activeStory === 0} />
                <span className="text-xs font-medium tabular text-app-muted">{activeStory + 1} <span className="text-app-subtle">/ {WRAPPED_STORIES.length}</span></span>
                <IconButton aria-label="Avançar história" variant="ghost" icon={<ArrowRight />} onClick={nextStory} disabled={activeStory === LAST_STORY} />
              </div>
            </footer>
          </div>
        ) : (
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))] text-center sm:px-10 md:pb-10 md:pt-7">
            <div className="flex w-full items-center justify-between">
              <BrandMark size={22} />
              <IconButton aria-label="Fechar retrospectiva" variant="glass" icon={<X />} onClick={close} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-4">
              <AnimatedBrand reducedMotion={prefersReducedMotion} size={118} />
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-app-accent">Seu ano em família</p>
              <h1 className="mt-4 max-w-[12ch] text-balance text-[clamp(2.7rem,12vw,5.4rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-app-text">
                Sua família em <span className="text-app-accent">{ano}</span>
              </h1>
              <p className="mt-5 max-w-[27ch] text-[15px] leading-relaxed text-app-muted">
                Um ano de pagamentos, combinados e pequenas vitórias. Vamos rever?
              </p>
            </div>

            {ready ? (
              <Button type="button" size="lg" className="w-full max-w-[260px]" onClick={() => setStarted(true)}>
                Começar
              </Button>
            ) : (
              <div className="w-full max-w-[300px] rounded-[24px] border border-app-line bg-app-surface/85 px-5 py-4 text-left">
                <p className="text-sm font-semibold text-app-text">Sua retrospectiva está começando</p>
                <p className="mt-1.5 text-sm leading-relaxed text-app-muted">
                  Depois de dois meses com pagamentos registrados, a gente conta essa história por aqui.
                </p>
                <Button type="button" variant="secondary" size="md" className="mt-4 w-full" onClick={close}>
                  Voltar para Insights
                </Button>
              </div>
            )}
            <p className="mt-4 text-[11px] text-app-subtle">Depois, toque nas laterais ou use as setas para navegar.</p>
          </div>
        )}
      </main>
    </div>
  )
}
