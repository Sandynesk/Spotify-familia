'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music2, Eye, EyeOff } from 'lucide-react'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const router = useRouter()
  const { error: toastError } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!email) e.email = 'Email é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido'
    if (!password) e.password = 'Senha é obrigatória'
    else if (password.length < 6) e.password = 'Senha deve ter ao menos 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toastError(
        error.message.includes('Invalid login')
          ? 'Email ou senha incorretos'
          : 'Erro ao fazer login. Tente novamente.'
      )
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#1DB954]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#1DB954]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 drop-shadow-[0_8px_30px_rgb(29,185,84,0.3)] transform hover:scale-105 transition-transform duration-500">
            <SpotifyLogo size={64} color="#1DB954" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SpotiFamília</h1>
          <p className="text-[#B3B3B3] text-sm mt-1">Entre para gerenciar seu plano</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div className="relative">
            <Input
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
              error={errors.email}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="relative">
            <Input
              label="Senha"
              type={showPass ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
              error={errors.password}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-[38px] text-[#535353] hover:text-[#B3B3B3] transition-colors"
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-6"
            size="lg"
            id="btn-login"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#535353] mt-8">
          Apenas o dono do Plano Família tem acesso
        </p>
      </div>
    </div>
  )
}
