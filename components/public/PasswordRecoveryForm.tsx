'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { AuthInput } from '@/components/public/AuthInput'
import { PasswordStrength } from '@/components/public/PasswordStrength'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

type RecoveryStep = 'checking' | 'request' | 'update'
type RecoveryField = 'email' | 'password' | 'confirmPassword'

export function PasswordRecoveryForm() {
  const router = useRouter()
  const { success: toastSuccess } = useToast()
  const [step, setStep] = useState<RecoveryStep>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RecoveryField, string>>>({})

  useEffect(() => {
    let active = true

    async function checkRecoverySession() {
      try {
        const { data } = await createClient().auth.getUser()
        if (active) setStep(data.user ? 'update' : 'request')
      } catch {
        if (active) setStep('request')
      }
    }

    void checkRecoverySession()
    return () => {
      active = false
    }
  }, [])

  const updating = step === 'update'

  function updateField(field: RecoveryField, value: string, update: (next: string) => void) {
    update(value)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setFieldErrors({})

    if (!updating && !email.trim()) {
      setFieldErrors({ email: 'Informe seu e-mail.' })
      return
    }
    if (updating && !password) {
      setFieldErrors({ password: 'Informe uma nova senha.' })
      return
    }
    if (updating && password.length < 6) {
      setFieldErrors({ password: 'Use pelo menos 6 caracteres.' })
      return
    }
    if (updating && !confirmPassword) {
      setFieldErrors({ confirmPassword: 'Confirme sua nova senha.' })
      return
    }
    if (updating && password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'As senhas não coincidem.' })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      if (!updating) {
        const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/recuperar-senha`,
        })
        if (requestError) {
          setError('Não foi possível enviar o e-mail agora. Tente novamente.')
          return
        }

        setMessage('Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.')
        toastSuccess('Se o e-mail estiver cadastrado, enviaremos as instruções.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError('Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.')
        return
      }

      toastSuccess('Senha atualizada com sucesso!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(updating
        ? 'Não foi possível atualizar sua senha. Tente novamente.'
        : 'Não foi possível enviar o e-mail agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-app-accent">Acesso à sua conta</p>
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] text-app-text">
          {updating ? 'Escolha uma nova senha' : 'Recupere seu acesso'}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-app-muted">
          {updating
            ? 'Crie uma senha nova para voltar a organizar seu plano.'
            : 'Enviaremos um link seguro para o e-mail cadastrado.'}
        </p>
      </div>

      <div className="app-glass rounded-app p-5 shadow-app-float sm:p-7">
        {step === 'checking' ? (
          <p role="status" className="flex min-h-36 items-center justify-center gap-3 text-sm text-app-muted">
            <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-app-line-strong border-t-app-accent motion-reduce:animate-none" />
            Verificando seu link de recuperação…
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={updating ? 'Definir nova senha' : 'Solicitar recuperação de senha'}>
            {error && (
              <p id="recovery-form-error" className="rounded-app-sm border border-app-danger/25 bg-app-danger/10 px-3.5 py-3 text-sm leading-relaxed text-app-danger" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-app-sm border border-app-accent/25 bg-app-accent/10 px-3.5 py-3 text-sm leading-relaxed text-app-accent" role="status" aria-live="polite">
                {message}
              </p>
            )}

            {!updating ? (
              <AuthInput
                id="recovery-email"
                label="E-mail"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(event) => updateField('email', event.target.value, setEmail)}
                error={fieldErrors.email}
                describedBy={error ? 'recovery-form-error' : undefined}
                icon={<Mail aria-hidden className="h-5 w-5" />}
                required
              />
            ) : (
              <>
                <div className="space-y-2.5">
                  <AuthInput
                    id="recovery-password"
                    label="Nova senha"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => updateField('password', event.target.value, setPassword)}
                    error={fieldErrors.password}
                    icon={<LockKeyhole aria-hidden className="h-5 w-5" />}
                    describedBy={`recovery-password-strength recovery-password-strength-hint${error ? ' recovery-form-error' : ''}`}
                    required
                  />
                  <PasswordStrength id="recovery-password-strength" value={password} />
                </div>
                <AuthInput
                  id="recovery-confirm-password"
                  label="Confirme a nova senha"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value, setConfirmPassword)}
                  error={fieldErrors.confirmPassword}
                  describedBy={error ? 'recovery-form-error' : undefined}
                  icon={<LockKeyhole aria-hidden className="h-5 w-5" />}
                  required
                />
              </>
            )}

            <Button type="submit" size="lg" loading={loading} icon={<ArrowRight />} className="w-full">
              {updating ? 'Salvar nova senha' : 'Enviar link de recuperação'}
            </Button>
          </form>
        )}

        <div className="mt-5 border-t border-app-line pt-4 text-center">
          <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-app-muted transition-colors hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent">
            <ArrowLeft aria-hidden className="h-4 w-4" /> Voltar para entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
