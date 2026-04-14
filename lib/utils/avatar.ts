export const AVATAR_COLORS = [
  '#E13300',
  '#E91429',
  '#8D67AB',
  '#1E3264',
  '#0D73EC',
  '#148A08',
  '#F59B23',
  '#509BF5',
]

export function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
