import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Shuffle,
  SkipBack,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  ListMusic,
} from 'lucide-react'
import { SCREEN_H, SCREEN_RADIUS, SCREEN_W } from './size'
import { ScreenStatusBar } from './ScreenStatusBar'

export interface PlayerScreenProps {
  variant: 0 | 1 | 2 | 3
}

interface TrackVariant {
  title: string
  artist: string
  gradient: string
  progressPercent: number
  currentTime: string
  totalTime: string
}

const VARIANTS: Record<0 | 1 | 2 | 3, TrackVariant> = {
  // 0: âmbar/rosa
  0: {
    title: 'Domingo Lento',
    artist: 'Trio Aurora',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D946EF 45%, #EC4899 100%)',
    progressPercent: 42,
    currentTime: '1:24',
    totalTime: '3:35',
  },
  // 1: azul/ciano
  1: {
    title: 'Maré Alta',
    artist: 'Clara Vento',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 50%, #3B82F6 100%)',
    progressPercent: 65,
    currentTime: '2:15',
    totalTime: '3:48',
  },
  // 2: violeta/laranja
  2: {
    title: 'Rua das Flores',
    artist: 'Os Quintais',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 45%, #F97316 100%)',
    progressPercent: 28,
    currentTime: '0:58',
    totalTime: '3:12',
  },
  // 3: verde-água/oliva
  3: {
    title: 'Fim de Tarde',
    artist: 'Vô Zé & Netos',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 40%, #65A30D 100%)',
    progressPercent: 78,
    currentTime: '3:14',
    totalTime: '4:08',
  },
}

/**
 * PlayerScreen: player de música genérico, sem marca.
 * Nada que lembre o Spotify: sem logo, sem layout característico, sem o verde da marca.
 * Usado nas fotos nos celulares "da família".
 */
export function PlayerScreen({ variant }: PlayerScreenProps) {
  const track = VARIANTS[variant] ?? VARIANTS[0]

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: SCREEN_RADIUS,
        fontFamily: '"Outfit", sans-serif',
        backgroundColor: '#121212',
      }}
      className="relative flex flex-col justify-between overflow-hidden text-white pointer-events-none select-none"
    >
      {/* 1. Barra de status (54px) com centro livre para a ilha frontal */}
      <ScreenStatusBar />

      {/* 2. Conteúdo do player */}
      <div className="flex-1 min-h-0 flex flex-col justify-between px-6 py-2">
        {/* Top bar do player */}
        <div className="flex items-center justify-between">
          <ChevronDown className="w-5 h-5 text-white/60" />
          <span className="text-[10px] font-bold tracking-widest text-[#86868B] uppercase">
            Tocando agora
          </span>
          <MoreHorizontal className="w-5 h-5 text-white/60" />
        </div>

        {/* Capa em gradiente abstrato grande */}
        <div
          className="w-[260px] h-[260px] mx-auto rounded-2xl relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-center my-auto"
          style={{ background: track.gradient }}
        >
          {/* Formas abstratas em camadas suaves */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <circle cx="25" cy="25" r="40" fill="white" filter="blur(16px)" />
            <circle cx="80" cy="80" r="35" fill="black" opacity="0.4" filter="blur(12px)" />
            <path
              d="M0 60 C 30 40, 70 80, 100 50 L 100 100 L 0 100 Z"
              fill="white"
              opacity="0.15"
            />
          </svg>
        </div>

        {/* Título, artista e botão de curtir */}
        <div className="flex items-center justify-between mt-2">
          <div className="min-w-0 pr-3">
            <h1 className="text-xl font-bold text-white tracking-tight truncate leading-tight">
              {track.title}
            </h1>
            <p className="text-[#A1A1A6] text-sm font-normal mt-0.5 truncate leading-tight">
              {track.artist}
            </p>
          </div>
          <Heart className="w-5 h-5 text-white/80 flex-shrink-0" />
        </div>

        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="h-1 bg-white/20 rounded-full relative">
            <div
              className="h-full bg-white rounded-full relative"
              style={{ width: `${track.progressPercent}%` }}
            >
              <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 shadow-md" />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-[#86868B] tabular-nums mt-1.5 font-medium">
            <span>{track.currentTime}</span>
            <span>{track.totalTime}</span>
          </div>
        </div>

        {/* Controles de reprodução */}
        <div className="flex items-center justify-between px-2 mt-2">
          <Shuffle className="w-4 h-4 text-[#86868B]" />
          <SkipBack className="w-6 h-6 text-white fill-white" />
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
            <Pause className="w-6 h-6 fill-black text-black" />
          </div>
          <SkipForward className="w-6 h-6 text-white fill-white" />
          <Repeat className="w-4 h-4 text-[#86868B]" />
        </div>

        {/* Barra inferior secundária (dispositivo + fila) */}
        <div className="flex items-center justify-between text-[#86868B] text-xs px-2 mt-3 mb-1">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span className="text-[11px] font-medium">Dispositivo de áudio</span>
          </div>
          <ListMusic className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Indicador de home (pílula branca de 134 × 5px a 8px da base) */}
      <div className="w-full pb-2 pt-1 flex justify-center">
        <div className="w-[134px] h-[5px] rounded-full bg-white" />
      </div>
    </div>
  )
}
