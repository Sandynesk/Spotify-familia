export type HapticKind = 'light' | 'success' | 'warning'

const patterns: Record<HapticKind, number | number[]> = {
  light: 12,
  success: [12, 24, 12],
  warning: [28, 30, 28],
}

/** Give a small vibration on supported devices; safely does nothing elsewhere. */
export function haptic(kind: HapticKind = 'light'): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(patterns[kind])
}
