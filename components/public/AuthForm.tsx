'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, Mail, Play, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { AuthInput } from '@/components/public/AuthInput'
import { PasswordStrength } from '@/components/public/PasswordStrength'

export type AuthMode = 'login' | 'register'
type AuthField = 'name' | 'email' | 'password' | 'confirmPassword'

interface AuthFormProps {
  mode: AuthMode
  initialError?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getLoginError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('email not confirmed') || normalized.includes('email_not_confirmed')) {
    return 'Confirme seu e-mail na caixa de entrada para entrar.'
  }
  if (normalized.includes('invalid login') || normalized.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  return 'Não foi possível entrar agora. Tente novamente.'
}

function getSignupError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('already registered') || normalized.includes('user_already_exists')) {
    return 'Este e-mail já está em uso.'
  }
  return 'Não foi possível criar sua conta agora. Tente novamente.'
}

export function AuthForm({ mode, initialError }: AuthFormProps) {
  const router = useRouter()
  const { success: toastSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthField, string>>>({})
  const [formError, setFormError] = useState<string | null>(initialError ?? null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const registering = mode === 'register'

  function updateField(field: AuthField, value: string, update: (next: string) => void) {
    update(value)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
    setFormSuccess(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setFieldErrors({})

    const nextErrors: Partial<Record<AuthField, string>> = {}
    if (registering && !name.trim()) nextErrors.name = 'Informe seu nome.'
    if (!email.trim()) nextErrors.email = 'Informe seu e-mail.'
    else if (!emailPattern.test(email.trim())) nextErrors.email = 'Digite um e-mail válido.'
    if (!password) nextErrors.password = 'Informe sua senha.'
    else if (registering && password.length < 6) nextErrors.password = 'Use pelo menos 6 caracteres.'
    if (registering && !confirmPassword) nextErrors.confirmPassword = 'Confirme sua senha.'
    else if (registering && password !== confirmPassword) nextErrors.confirmPassword = 'As senhas não coincidem.'

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      if (!registering) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) {
          setFormError(getLoginError(error.message))
          return
        }

        toastSuccess('Bem-vindo de volta!')
        router.push('/dashboard')
        router.refresh()
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        setFormError(getSignupError(error.message))
        return
      }

      if (data.session) {
        toastSuccess('Conta criada com sucesso!')
        router.push('/dashboard')
        router.refresh()
        return
      }

      const message = 'Conta criada! Verifique seu e-mail para confirmar o cadastro.'
      setFormSuccess(message)
      toastSuccess(message)
    } catch {
      setFormError(registering
        ? 'Ocorreu um erro inesperado ao criar sua conta. Tente novamente.'
        : 'Ocorreu um erro inesperado ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-app-accent">
          {registering ? 'Comece por aqui' : 'Bom ter você de volta'}
        </p>
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] text-app-text">
          {registering ? 'Crie sua conta' : 'Bem-vindo de volta'}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-app-muted">
          {registering
            ? 'Organize as vagas e os pagamentos do seu plano.'
            : 'Entre para acompanhar seu plano e fechar o mês com tranquilidade.'}
        </p>
      </div>

      <div className="app-glass rounded-app p-5 shadow-app-float sm:p-7">
        <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={registering ? 'Criar conta' : 'Entrar'}>
          {formError && (
            <p id="auth-form-error" className="rounded-app-sm border border-app-danger/25 bg-app-danger/10 px-3.5 py-3 text-sm leading-relaxed text-app-danger" role="alert" aria-live="assertive">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p className="rounded-app-sm border border-app-accent/25 bg-app-accent/10 px-3.5 py-3 text-sm leading-relaxed text-app-accent" role="status" aria-live="polite">
              {formSuccess}
            </p>
          )}

          {registering && (
            <AuthInput
              id="auth-name"
              label="Nome completo"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              value={name}
              onChange={(event) => updateField('name', event.target.value, setName)}
              error={fieldErrors.name}
              describedBy={formError ? 'auth-form-error' : undefined}
              icon={<UserRound aria-hidden className="h-5 w-5" />}
              required
            />
          )}

          <AuthInput
            id="auth-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(event) => updateField('email', event.target.value, setEmail)}
            error={fieldErrors.email}
            describedBy={formError ? 'auth-form-error' : undefined}
            icon={<Mail aria-hidden className="h-5 w-5" />}
            required
          />

          <div className="space-y-2.5">
            <AuthInput
              id="auth-password"
              label="Senha"
              type="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => updateField('password', event.target.value, setPassword)}
              error={fieldErrors.password}
              icon={<LockKeyhole aria-hidden className="h-5 w-5" />}
              describedBy={`${registering ? 'auth-password-strength auth-password-strength-hint ' : ''}${formError ? 'auth-form-error' : ''}`.trim() || undefined}
              required
            />
            {registering && <PasswordStrength id="auth-password-strength" value={password} />}
          </div>

          {registering ? (
            <AuthInput
              id="auth-confirm-password"
              label="Confirme sua senha"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value, setConfirmPassword)}
              error={fieldErrors.confirmPassword}
              describedBy={formError ? 'auth-form-error' : undefined}
              icon={<LockKeyhole aria-hidden className="h-5 w-5" />}
              required
            />
          ) : (
            <div className="-mt-1 flex justify-end">
              <Link href="/recuperar-senha" className="min-h-10 inline-flex items-center rounded-sm px-1 text-sm font-medium text-app-accent transition-colors hover:text-app-accent-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent">
                Esqueci minha senha
              </Link>
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} icon={<ArrowRight />} className="mt-1 w-full">
            {registering ? 'Criar minha conta' : 'Entrar'}
          </Button>
        </form>

        <Link
          href="/demo"
          className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-app-line-strong bg-app-raised/80 px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        >
          <Play aria-hidden className="h-4 w-4 fill-current" />
          Experimentar sem cadastro
        </Link>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-app-line" />
          <span className="text-xs text-app-subtle">ou</span>
          <span className="h-px flex-1 bg-app-line" />
        </div>

        <p className="text-center text-sm text-app-muted">
          {registering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
          <Link
            href={registering ? '/login' : '/cadastro'}
            className="font-semibold text-app-accent transition-colors hover:text-app-accent-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            {registering ? 'Entrar' : 'Criar conta'}
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-app-subtle">
        Seu plano em ordem, com privacidade e sem complicação.
      </p>
    </div>
  )
}
