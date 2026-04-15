import { SpotifyLogo } from '@/components/ui/SpotifyLogo'

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] py-12 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 opacity-50">
          <SpotifyLogo size={24} color="#B3B3B3" />
          <span className="font-bold text-[#B3B3B3] tracking-[-0.5px]">SpotiFamília</span>
        </div>
        
        <div className="text-sm text-[#B3B3B3]">
          <p className="mb-2 font-medium text-white">SpotiFamília — Projeto pessoal de portfólio</p>
          <p>Feito com Next.js, Supabase, engenharia de IA e muito café.</p>
        </div>
        
        <div className="max-w-xl mx-auto mt-4 pt-6 border-t border-white/5">
          <p className="text-xs text-[#535353] leading-relaxed">
            SpotiFamília não tem afiliação com o Spotify AB. Spotify® é marca registrada do Spotify AB. Este é um projeto pessoal sem fins comerciais.
          </p>
        </div>
      </div>
    </footer>
  )
}
