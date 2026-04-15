'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, DivideCircle, CalendarCheck, CheckCircle2, User, History, ArrowUpRight } from 'lucide-react'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { SpotifyLogo } from '@/components/ui/SpotifyLogo'


function Particles() {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: Math.random() * 20 + 10,
      radius: Math.random() > 0.5 ? '50%' : '4px',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      duration: Math.random() * 5 + 5,
    }))
    setParticles(newParticles)
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-[#1DB954] opacity-15"
          style={{
            width: p.size,
            height: p.size,
            borderRadius: p.radius,
            top: p.top,
            left: p.left,
            rotate: p.rotate,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  )
}

export default function LandingPage() {
  return (
    <div className="bg-[#121212] min-h-screen font-sans selection:bg-[#1DB954] selection:text-black">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#1DB954] opacity-[0.12] blur-[120px] rounded-full pointer-events-none" />
        
        {/* Particles Component */}
        <Particles />

        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-[52px] font-extrabold text-white leading-[1.1] tracking-[-2px] mb-6"
            >
              Seu Plano Família do Spotify. Finalmente organizado.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-[#B3B3B3] mb-8 font-normal max-w-xl"
            >
              Controle quem usa as vagas, divida os custos e veja quem está em dia — tudo num painel simples e bonito. Sem planilha, sem confusão.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <Link 
                href="/login?tab=register"
                className="w-full sm:w-auto bg-[#1DB954] text-black font-bold px-8 py-4 rounded-full text-center hover:scale-105 transition-transform"
              >
                Começar agora — é grátis
              </Link>
              <Link 
                href="#como-funciona"
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold px-8 py-3.5 rounded-full text-center hover:bg-white hover:text-black transition-colors"
              >
                Ver como funciona
              </Link>
            </motion.div>
          </div>

          {/* Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 w-full max-w-[340px] md:max-w-none flex justify-center"
          >
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-[280px] md:w-[300px] h-[550px] md:h-[600px] bg-[#121212] rounded-[36px] border-[6px] border-[#2A2A2A] relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 md:w-32 h-6 bg-[#2A2A2A] rounded-b-2xl z-20"></div>
              {/* Fake Dashboard Content */}
              <div className="p-4 pt-10 h-full flex flex-col gap-4 relative">
                 <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#1DB954]/20 blur-3xl"></div>
                 <div className="bg-[#1DB954] rounded-2xl p-4 text-black shadow-lg">
                    <p className="text-sm font-semibold opacity-90">A receber este mês</p>
                    <p className="text-3xl font-black mt-1">R$ 59,40</p>
                 </div>
                 <div className="flex-1 flex flex-col gap-3">
                    <div className="bg-[#181818] rounded-2xl p-4 border border-white/5 pb-2">
                       <p className="text-white font-bold mb-4">Membros (6/6)</p>
                       <div className="space-y-3">
                         {[1,2,3].map((i, index) => (
                           <div key={i} className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-[#282828] flex items-center justify-center border border-white/5">
                               <User size={18} className="text-[#535353]" />
                             </div>
                             <div className="flex-1">
                               <div className="h-3 w-16 bg-[#282828] rounded mb-1.5"></div>
                               <div className="h-2 w-10 bg-[#282828] rounded"></div>
                             </div>
                             {index === 2 ? (
                               <div className="w-6 h-6 rounded-full bg-[#E22134]/10 border border-[#E22134] flex items-center justify-center">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#E22134]" />
                               </div>
                             ) : (
                               <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 border border-[#1DB954] flex items-center justify-center">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]"></div>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className="bg-[#181818] flex-1 rounded-2xl w-full border border-white/5 p-4 overflow-hidden">
                       <div className="flex items-center gap-2 mb-4">
                         <History size={14} className="text-[#1DB954]" />
                         <p className="text-white text-[10px] font-bold uppercase tracking-wider">Atividade</p>
                       </div>
                       <div className="space-y-3 opacity-60">
                         {[1,2].map(i => (
                           <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-md bg-[#282828] flex items-center justify-center">
                                 <ArrowUpRight size={12} className="text-[#1DB954]" />
                               </div>
                               <div>
                                 <div className="h-2 w-12 bg-[#282828] rounded mb-1"></div>
                                 <div className="h-1.5 w-8 bg-[#282828] rounded"></div>
                               </div>
                             </div>
                             <div className="h-2 w-10 bg-[#282828] rounded"></div>
                           </div>
                         ))}
                       </div>
                    </div>
                 </div>
                 <div className="bg-[#282828] h-14 rounded-full w-full"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="funcionalidades" className="py-24 bg-[#121212] overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1DB954] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-white tracking-[-2px] mb-6"
            >
              Divida a conta, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1DB954] to-[#1ed760] drop-shadow-[0_0_15px_rgba(29,185,84,0.3)]">não a paciência.</span>
            </motion.h2>
            <p className="text-[#B3B3B3] text-lg md:text-xl max-w-2xl mx-auto font-medium">
              O SpotiFamília cuida da parte chata para você focar no que importa: a música.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -8 }} className="bg-[#181818] border border-white/5 p-8 rounded-2xl cursor-default transition-shadow hover:shadow-[0_8px_30px_rgba(29,185,84,0.1)]">
              <Users className="w-10 h-10 text-[#1DB954] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Saiba quem pagou</h3>
              <p className="text-[#B3B3B3] leading-relaxed">
                Veja em tempo real quem está em dia e quem está atrasado, tudo em um painel organizado e direto ao ponto.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="bg-[#181818] border border-white/5 p-8 rounded-2xl cursor-default transition-shadow hover:shadow-[0_8px_30px_rgba(29,185,84,0.1)]">
              <DivideCircle className="w-10 h-10 text-[#1DB954] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Divida do seu jeito</h3>
              <p className="text-[#B3B3B3] leading-relaxed">
                Cada membro paga um valor diferente? Sem problema. Configure valores individuais e deixe o app calcular o total.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="bg-[#181818] border border-white/5 p-8 rounded-2xl cursor-default transition-shadow hover:shadow-[0_8px_30px_rgba(29,185,84,0.1)]">
              <CalendarCheck className="w-10 h-10 text-[#1DB954] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Histórico completo</h3>
              <p className="text-[#B3B3B3] leading-relaxed">
                Todo mês cadastrado e arquivado. Consulte facilmente num histórico claro o pagamento de meses anteriores.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
        <div className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] bg-[#1DB954] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="max-w-xl">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[#1DB954] font-bold tracking-[3px] text-xs uppercase block mb-4"
              >
                Passo a passo
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black text-white tracking-[-1px]"
              >
                Organização total em <br/><span className="text-[#1DB954]">3 passos simples.</span>
              </motion.h2>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#B3B3B3] text-lg max-w-xs border-l-2 border-[#1DB954]/30 pl-6 py-2"
            >
              Economize tempo e evite conversas chatas sobre dinheiro.
            </motion.p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-8 top-10 bottom-10 w-[2px] border-l-2 border-dashed border-[#1DB954]/30 z-0"></div>
            
            <div className="flex border-none flex-col gap-12 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-6 md:items-start">
                <div className="w-16 h-16 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-black text-xl shrink-0">
                  01
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Crie sua conta</h3>
                  <p className="text-[#B3B3B3] text-lg">Cadastre-se grátis com seu e-mail de forma rápida e segura.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-6 md:items-start">
                <div className="w-16 h-16 rounded-full bg-[#181818] border-2 border-[#1DB954] flex items-center justify-center text-[#1DB954] font-black text-xl shrink-0">
                  02
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Adicione os membros</h3>
                  <p className="text-[#B3B3B3] text-lg">Insira o nome e defina qual é a contribuição mensal de cada pessoa na vaga.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-6 md:items-start">
                <div className="w-16 h-16 rounded-full bg-[#181818] border-2 border-[#1DB954] flex items-center justify-center text-[#1DB954] font-black text-xl shrink-0">
                  03
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Controle com um toque</h3>
                  <p className="text-[#B3B3B3] text-lg">Todo mês, apenas marque quem pagou. Identifique atrasos no painel principal num instante.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="py-24 bg-[#181818] text-center px-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {[1,2,3,4,5,6].map(i => (
              <SpotifyLogo key={i} size={40} color={i <= 5 ? "#1DB954" : "#B3B3B3"} className={i > 5 ? 'opacity-30' : ''} />
            ))}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4 tracking-[-1px]">
            6 vagas no plano. R$ 7,00 por pessoa.<br/>Zero drama na hora de cobrar.
          </h2>
          <p className="text-[#B3B3B3] text-lg max-w-2xl">
            A forma mais fácil de gerenciar repasses familiares e manter as amizades e a família em paz.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-b from-[#121212] to-[#0d1f13] text-center px-6 border-b border-[#1DB954]/20">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-[-1px] mb-4">
            Organize o seu plano família agora
          </h2>
          <p className="text-xl text-[#B3B3B3] mb-10">
            É grátis, é rápido e você vai querer ter feito isso antes.
          </p>
          <Link 
            href="/login?tab=register"
            className="bg-[#1DB954] text-black font-bold px-10 py-5 rounded-full text-lg hover:scale-105 transition-transform"
          >
            Criar minha conta
          </Link>
          <p className="text-sm text-[#B3B3B3] mt-6 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-[#1DB954]" /> Sem cartão de crédito. Sem cobranças.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
