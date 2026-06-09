'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const { scrollY } = useScroll()
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.85)']
  )
  const backdropFilter = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(20px)']
  )

  const MotionNav = motion.nav

  return (
    <MotionNav
      style={isMounted ? { backgroundColor, backdropFilter } : { backgroundColor: 'rgba(18, 18, 18, 0)', backdropFilter: 'blur(0px)' }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <SpotifyLogo size={32} color="#1DB954" />
          <span className="font-bold text-white text-xl tracking-[-0.5px]">
            SpotiFamília
          </span>
        </Link>

        <div className="hidden md:flex flex-1 justify-center gap-8">
          <Link href="/#funcionalidades" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
            Funcionalidades
          </Link>
          <Link href="/#como-funciona" className="text-sm font-medium text-[#B3B3B3] hover:text-white transition-colors">
            Como funciona
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-white hover:text-[#1DB954] transition-colors hidden md:block">
            Entrar
          </Link>
          <Link 
            href="/cadastro"
            className="bg-[#1DB954] text-black font-bold text-sm px-6 py-2.5 rounded-lg hover:scale-105 transition-transform hidden md:block"
          >
            Criar conta
          </Link>

          {/* Botão Hambúrguer Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-[#1DB954] transition-colors p-1"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Responsivo Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-0 right-0 bg-[#121212]/95 backdrop-blur-lg border-b border-white/5 md:hidden py-6 px-4 flex flex-col gap-4 overflow-hidden"
          >
            <Link
              href="/#funcionalidades"
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-[#B3B3B3] hover:text-white transition-colors py-2 border-b border-white/5"
            >
              Funcionalidades
            </Link>
            <Link
              href="/#como-funciona"
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-[#B3B3B3] hover:text-white transition-colors py-2 border-b border-white/5"
            >
              Como funciona
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-white hover:text-[#1DB954] transition-colors py-2 border-b border-white/5"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              onClick={() => setIsOpen(false)}
              className="bg-[#1DB954] text-black font-bold text-center text-sm py-3 rounded-lg hover:scale-102 transition-transform mt-2"
            >
              Criar conta
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionNav>
  )
}
