import { getRetrospectivaPageData } from '@/lib/actions/retrospectiva'
import { WrappedExperience } from '@/components/wrapped/WrappedExperience'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ ano?: string | string[] }>
}

function parseYear(rawYear?: string | string[]): number {
  const currentYear = new Date().getFullYear()
  const value = Array.isArray(rawYear) ? rawYear[0] : rawYear
  if (!value || !/^\d{4}$/.test(value)) return currentYear

  const year = Number(value)
  return Number.isInteger(year) && year >= 2000 && year <= currentYear + 1 ? year : currentYear
}

export default async function RetrospectivaPage({ searchParams }: PageProps) {
  const { ano: rawYear } = await searchParams
  const ano = parseYear(rawYear)
  const result = await getRetrospectivaPageData(ano)

  if ('error' in result) throw new Error(result.error)

  return (
    <WrappedExperience
      ano={ano}
      retrospectiva={result.retrospectiva}
      pessoas={result.pessoas}
      mesesComDados={result.mesesComDados}
    />
  )
}
