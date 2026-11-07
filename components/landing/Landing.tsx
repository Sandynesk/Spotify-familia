import { Geist } from 'next/font/google'
import { SmoothScroll } from './primitives/SmoothScroll'
import { StoryStage } from './story/StoryStage'
import { HeroBeat } from './story/HeroBeat'
import { SlotsBeats } from './story/SlotsBeats'
import { PaidBeats } from './story/PaidBeats'
import { Everyone } from './photo/Everyone'
import { FinalCta } from './photo/FinalCta'
import { Details } from './Details'
import { Numbers } from './Numbers'
import { LandingNav } from './LandingNav'
import { LandingFooter } from './LandingFooter'
import { BRAND } from './data'

// Fonte só da landing — o resto do sistema continua com a Outfit (app/globals.css).
const geist = Geist({ subsets: ['latin'], variable: '--font-landing', display: 'swap' })

/** Composição da landing. Ordem = storyboard (docs/landing/BRIEF.md §4). */
export function Landing() {
  return (
    <div
      className={`${geist.variable} min-h-screen bg-black text-white antialiased selection:bg-(--landing-accent) selection:text-black`}
      style={
        {
          fontFamily: 'var(--font-landing), system-ui, sans-serif',
          '--landing-accent': BRAND.accent,
        } as React.CSSProperties
      }
    >
      <SmoothScroll>
        <LandingNav />
        <main>
          <StoryStage>
            <HeroBeat />
            <SlotsBeats />
            <PaidBeats />
          </StoryStage>
          <Everyone />
          <Details />
          <Numbers />
          <FinalCta />
        </main>
        <LandingFooter />
      </SmoothScroll>
    </div>
  )
}
