'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { salvarConfiguracoes } from '@/lib/actions/configuracoes'
import { useToast } from '@/components/ui/Toast'
import type { Configuracoes } from '@/types/database'

interface ConfiguracoesFormProps {
  initialConfig: Configuracoes | null
  initialError?: string | null
}

export function ConfiguracoesForm({ initialConfig, initialError }: ConfiguracoesFormProps) {
  const router = useRouter()
  const toast = useToast()

  const [valorPlano, setValorPlano] = useState<string>(() => {
    if (initialConfig?.valor_plano != null) {
      return initialConfig.valor_plano.toFixed(2).replace('.', ',')
    }
    return ''
  })
  const [chavePix, setChavePix] = useState<string>(initialConfig?.chave_pix || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function parseValorPlano(input: string): { valor: number | null; error?: string } {
    const trimmed = input.trim()
    if (!trimmed) return { valor: null }

    const clean = trimmed.replace(/[R$\s]/g, '').replace(',', '.')
    const num = Number(clean)
    if (isNaN(num) || num < 0) {
      return { valor: null, error: 'Digite um valor de plano válido.' }
    }
    return { valor: Math.round(num * 100) / 100 }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsed = parseValorPlano(valorPlano)
    if (parsed.error) {
      setError(parsed.error)
      toast.error(parsed.error)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await salvarConfiguracoes({
        valor_plano: parsed.valor,
        chave_pix: chavePix.trim() || null,
      })

      if ('error' in result) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Configurações salvas!')
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar configurações'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {initialError && !error && (
        <div
          role="alert"
          className="rounded-[var(--radius-app-sm)] border border-app-warn/30 bg-app-warn/10 p-4 text-sm text-app-warn"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Aviso</p>
              <p className="text-xs leading-relaxed opacity-90">{initialError}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-app-sm)] border border-app-danger/30 bg-app-danger/10 p-4 text-sm text-app-danger"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Erro ao salvar configurações</p>
              <p className="text-xs leading-relaxed opacity-90">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[var(--radius-app)] border border-app-line bg-app-surface p-5 sm:p-6 space-y-5">
        {/* Campo: Valor do Plano */}
        <div className="space-y-2">
          <label htmlFor="valor_plano" className="block text-sm font-medium text-app-text">
            Quanto custa o plano por mês
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-app-muted">
              R$
            </span>
            <input
              type="text"
              inputMode="decimal"
              id="valor_plano"
              name="valor_plano"
              value={valorPlano}
              onChange={e => setValorPlano(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated pl-10 pr-3.5 py-2.5 text-sm font-medium text-app-text placeholder:text-app-subtle focus:border-app-accent focus:outline-none min-h-[44px]"
            />
          </div>
          <p className="text-xs text-app-subtle">
            Valor total da assinatura mensal do Spotify Família pago por você.
          </p>
        </div>

        {/* Campo: Chave PIX */}
        <div className="space-y-2">
          <label htmlFor="chave_pix" className="block text-sm font-medium text-app-text">
            Sua chave PIX
          </label>
          <input
            type="text"
            id="chave_pix"
            name="chave_pix"
            value={chavePix}
            onChange={e => setChavePix(e.target.value)}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            className="w-full rounded-[var(--radius-app-sm)] border border-app-line bg-app-elevated px-3.5 py-2.5 text-sm font-medium text-app-text placeholder:text-app-subtle focus:border-app-accent focus:outline-none min-h-[44px]"
          />
          <p className="text-xs text-app-subtle">
            Aparece no relatório do grupo
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-app-accent hover:bg-app-accent-hover text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Salvar configurações</span>
        </button>
      </div>
    </form>
  )
}
