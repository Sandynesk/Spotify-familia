import { getInitials } from '@/lib/utils/avatar'

interface ScreenAvatarProps {
  nome: string
  cor?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-12 h-12 text-sm',
}

function isLightColor(hex: string): boolean {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

/**
 * Avatar autocontido idêntico ao components/ui/Avatar.tsx do app real.
 * Renderiza iniciais sobre fundo colorido com contraste automático (preto ou branco).
 */
export function ScreenAvatar({
  nome,
  cor = '#1DB954',
  size = 'md',
  className = '',
}: ScreenAvatarProps) {
  const sizeClass = sizes[size]
  const initials = getInitials(nome)
  const bgColor = cor || '#1DB954'
  const textColor = isLightColor(bgColor) ? '#000000' : '#ffffff'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      aria-label={`Avatar de ${nome}`}
    >
      {initials}
    </div>
  )
}
