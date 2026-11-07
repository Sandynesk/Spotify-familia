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
import { SegmentedControl } from '@/components/ui/SegmentedControl'

export type AuthMode = 'login' | 'register'
type AuthField = 'name' | 'email' | 'password' | 'confirmPassword'

interface AuthFormProps {
  mode: AuthMode
  initialError?: string
}

const AUTH_OPTIONS = [
  { value: 'login', label: 'Entrar' },
  { value: 'register', label: 'Criar conta' },
] as const

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

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

export function AuthForm({ mode: initialMode, initialError }: AuthFormProps) {
  const router = useRouter()
  const { success: toastSuccess } = useToast()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthField, string>>>({})
  const [formError, setFormError] = useState<string | null>(initialError ?? null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const registering = mode === 'register'

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode)
    setFieldErrors({})
    setFormError(null)
    setFormSuccess(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', nextMode === 'register' ? '/cadastro' : '/login')
    }
  }

  function updateField(field: AuthField, value: string, update: (next: string) => void) {
    update(value)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError(null)
    setFormSuccess(null)
  }

  async function handleGoogleLogin() {
    setLoadingGoogle(true)
    setFormError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('not enabled') || msg.includes('unsupported provider')) {
          setFormError('O provedor Google ainda não foi ativado no painel do Supabase. Ative o toggle "Enable Sign in with Google" e clique em Save.')
        } else {
          setFormError('Não foi possível conectar com o Google. Verifique a configuração do provedor no Supabase.')
        }
        setLoadingGoogle(false)
      }
    } catch {
      setFormError('Ocorreu um erro inesperado ao conectar com o Google. Tente novamente.')
      setLoadingGoogle(false)
    }
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

        await fetch('/api/auth/clear-demo', { method: 'POST' }).catch(() => {})
        if (typeof document !== 'undefined') {
          document.cookie = 'sf_demo=; path=/; max-age=0'
          document.cookie = 'sf_demo_sid=; path=/; max-age=0'
          document.cookie = 'sf_demo_client=; path=/; max-age=0'
        }
        toastSuccess('Bem-vindo de volta!')
        window.location.href = '/dashboard'
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
        await fetch('/api/auth/clear-demo', { method: 'POST' }).catch(() => {})
        if (typeof document !== 'undefined') {
          document.cookie = 'sf_demo=; path=/; max-age=0'
          document.cookie = 'sf_demo_sid=; path=/; max-age=0'
          document.cookie = 'sf_demo_client=; path=/; max-age=0'
        }
        toastSuccess('Conta criada com sucesso!')
        window.location.href = '/dashboard'
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
    <div className="w-full">
      <div className="app-glass rounded-[24px] p-5 shadow-app-float sm:p-7">
        {/* Mode switcher tabs */}
        <div className="mb-4">
          <SegmentedControl
            options={AUTH_OPTIONS}
            value={mode}
            onChange={handleModeChange}
            aria-label="Opções de autenticação"
          />
        </div>

        {/* Google OAuth One-Click Action */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || loadingGoogle}
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full border border-app-line/80 bg-white/[0.04] px-4 text-xs font-semibold text-app-text backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.99] disabled:opacity-50 select-none cursor-pointer"
        >
          {loadingGoogle ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-app-text border-t-transparent" />
          ) : (
            <GoogleIcon className="h-4 w-4 shrink-0" />
          )}
          <span>{registering ? 'Cadastrar com o Google' : 'Continuar com o Google'}</span>
        </button>

        <div className="my-3.5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-app-line/50" />
          <span className="text-[11px] font-medium text-app-subtle">ou com e-mail</span>
          <span className="h-px flex-1 bg-app-line/50" />
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-3.5"
          aria-label={registering ? 'Criar conta no SpotiFamília' : 'Entrar no SpotiFamília'}
        >
          {formError && (
            <p
              id="auth-form-error"
              className="rounded-app-sm border border-app-danger/25 bg-app-danger/10 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-app-danger"
              role="alert"
              aria-live="assertive"
            >
              {formError}
            </p>
          )}

          {formSuccess && (
            <p
              className="rounded-app-sm border border-app-accent/25 bg-app-accent/10 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-app-accent"
              role="status"
              aria-live="polite"
            >
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

          <div className="space-y-1.5">
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
              <Link
                href="/recuperar-senha"
                className="min-h-8 inline-flex items-center rounded-sm px-1 text-xs font-medium text-app-muted transition-colors hover:text-app-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
              >
                Esqueci minha senha
              </Link>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            loading={loading}
            icon={<ArrowRight />}
            className="mt-1 w-full"
          >
            {registering ? 'Criar minha conta' : 'Entrar na conta'}
          </Button>
        </form>

        <div className="mt-4 pt-1 text-center">
          <Link
            href="/demo"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 text-xs font-medium text-app-muted transition-colors hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            <Play aria-hidden className="h-3 w-3 fill-current text-app-accent" />
            Testar demonstração sem cadastro
          </Link>
        </div>

        <p className="mt-3 text-center text-[11px] text-app-subtle">
          🔒 Acesso seguro • Sem cobranças automáticas no cartão
        </p>
      </div>
    </div>
  )
}
