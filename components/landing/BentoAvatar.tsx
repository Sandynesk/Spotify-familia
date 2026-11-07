interface BentoAvatarProps {
  nome: string
  cor?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

/**
 * Avatar recriado localmente no estilo de components/ui/Avatar.tsx.
 * Não importa de components/ui conforme as regras do contrato bento.
 */
export function BentoAvatar({ nome, cor = '#1DB954', size = 'md', className = '' }: BentoAvatarProps) {
  const sizeClass = sizes[size]
  const initials = getInitials(nome)
  const bg = cor || '#1DB954'
  const textColor = isLightColor(bg) ? '#000000' : '#FFFFFF'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0 select-none shadow-sm ${className}`}
      style={{
        backgroundColor: bg,
        color: textColor,
      }}
      aria-label={`Avatar de ${nome}`}
    >
      {initials}
    </div>
  )
}
