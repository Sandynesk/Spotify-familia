import { getInitials } from '@/lib/utils/avatar'

interface AvatarProps {
  nome: string
  cor?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { container: 'w-8 h-8 text-xs', fontSize: '12px' },
  md: { container: 'w-10 h-10 text-sm', fontSize: '14px' },
  lg: { container: 'w-14 h-14 text-lg', fontSize: '20px' },
}

export function Avatar({ nome, cor = '#1DB954', size = 'md', className = '' }: AvatarProps) {
  const { container } = sizes[size]
  const initials = getInitials(nome)

  return (
    <div
      className={`${container} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none ${className}`}
      style={{
        backgroundColor: cor || '#1DB954',
        color: isLightColor(cor || '#1DB954') ? '#000' : '#fff',
      }}
      aria-label={`Avatar de ${nome}`}
    >
      {initials}
    </div>
  )
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
