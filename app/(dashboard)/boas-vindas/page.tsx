export const dynamic = 'force-dynamic'

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { getMembros } from '@/lib/actions/membros'
import { getConfiguracoes } from '@/lib/actions/configuracoes'

export default async function BoasVindasPage() {
  const [initialConfig, membros] = await Promise.all([getConfiguracoes(), getMembros()])
  return <OnboardingWizard initialConfig={initialConfig} membros={membros} />
}
