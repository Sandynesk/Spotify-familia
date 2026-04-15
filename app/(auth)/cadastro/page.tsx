'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { AuthInput } from '@/components/public/AuthInput'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

function CadastroContent() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(false) // Default to Register
  const [loading, setLoading] = useState(false)
  
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        if (!email || !senha) {
          toastError('Preencha os campos obrigatórios.')
          setLoading(false)
          return
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) {
          console.error('Login error:', error)
          if (error.message.includes('Email not confirmed')) {
            toastError('Por favor, confirme seu e-mail na sua caixa de entrada para fazer login.')
          } else {
            toastError(error.message.includes('Invalid login') ? 'E-mail ou senha incorretos.' : error.message)
          }
        } else {
          success('Bem-vindo de volta!')
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        if (!email || !senha || !nome) {
          toastError('Preencha todos os campos.')
          setLoading(false)
          return
        }
        if (senha !== confirmaSenha) {
          toastError('As senhas não coincidem.')
          setLoading(false)
          return
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { full_name: nome },
            redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
          }
        })
        
        if (error) {
          console.error('Signup error:', error)
          toastError(error.message.includes('already registered') ? 'Este e-mail já está em uso.' : error.message)
        } else {
          if (data.session) {
            success('Conta criada com sucesso!')
            router.push('/dashboard')
            router.refresh()
          } else {
            success('Verifique seu e-mail para confirmar o cadastro e ativar sua conta.')
          }
        }
      }
    } catch (err) {
      console.error('Unexpected auth error:', err)
      toastError('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    let strength = 0
    if (senha.length >= 6) strength += 1
    if (senha.length >= 8) strength += 1
    if (/[A-Z]/.test(senha)) strength += 1
    if (/[0-9!@#%^&*]/.test(senha)) strength += 1
    return Math.min(strength, 4)
  }

  const strength = getPasswordStrength()
  const strengthColors = ['bg-[#2A2A2A]', 'bg-[#E22134]', 'bg-[#F59B23]', 'bg-[#1DB954]', 'bg-[#1DB954]']

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center md:text-left">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight"
        >
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#B3B3B3] text-sm font-medium"
        >
          {isLogin 
            ? 'Acesse seu painel para gerenciar as vagas e cobranças.' 
            : 'Junte-se ao SpotiFamília e organize seu plano em segundos.'}
        </motion.p>
      </div>

      <div className="flex bg-[#2A2A2A] rounded-full p-1 mb-8 relative">
        <div 
          className="absolute bg-[#1DB954] top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
          style={{ width: 'calc(50% - 4px)', left: isLogin ? '4px' : '50%' }}
        />
        <button 
          type="button"
          onClick={() => setIsLogin(true)} 
          className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${isLogin ? 'text-black' : 'text-[#B3B3B3] hover:text-white'}`}
        >
          Entrar
        </button>
        <button 
          type="button"
          onClick={() => setIsLogin(false)} 
          className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${!isLogin ? 'text-black' : 'text-[#B3B3B3] hover:text-white'}`}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <AuthInput
                label="Nome completo"
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                icon={<User size={20} />}
                required={!isLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AuthInput
          label="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Mail size={20} />}
          required
        />

        <AuthInput
          label="Senha"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          icon={<Lock size={20} />}
          required
        />

        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="mb-6 px-1">
                <div className="flex gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-colors duration-500 ${strength >= i ? strengthColors[strength] : 'bg-[#2A2A2A]'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#535353] mt-2">Use no mínimo 6 caracteres.</p>
              </div>

              <AuthInput
                label="Confirmar senha"
                type="password"
                value={confirmaSenha}
                onChange={e => setConfirmaSenha(e.target.value)}
                icon={<Lock size={20} />}
                required={!isLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Button 
          type="submit" 
          loading={loading}
          icon={<SpotifyLogo size={20} color="black" />}
          className="w-full h-12 text-base shadow-[0_0_20px_rgba(29,185,84,0.3)] mt-2"
        >
          {isLogin ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-[#121212] flex antialiased">
      <Link href="/" className="absolute top-6 left-6 md:hidden z-20">
        <SpotifyLogo size={32} color="#1DB954" />
      </Link>

      <div className="hidden md:flex flex-col flex-1 max-w-[40%] bg-gradient-to-br from-[#0d2b1a] to-[#1DB954] p-12 lg:p-20 relative overflow-hidden text-white justify-between">
        <div className="absolute inset-0 bg-black/10"></div>
        <Link href="/" className="relative z-10 inline-flex">
          <SpotifyLogo size={48} color="white" />
        </Link>
        <div className="relative z-10 flex flex-col gap-6 w-full max-w-sm mt-auto mb-auto">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-4">
            Crie sua conta.
          </h1>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-lg font-medium">
              <CheckCircle2 className="text-white" /> Grátis para sempre
            </li>
            <li className="flex items-center gap-3 text-lg font-medium">
              <CheckCircle2 className="text-white" /> Controle total do plano
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md mx-auto relative z-10">
          <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-t border-[#1DB954] animate-spin" /></div>}>
            <CadastroContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
