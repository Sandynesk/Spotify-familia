'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function PixQrPreview({ value }: { value: string }) {
  const [svg, setSvg] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    if (!value) {
      Promise.resolve().then(() => {
        if (!active) return
        setSvg('')
        setFailed(false)
      })
      return () => { active = false }
    }

    QRCode.toString(value, { type: 'svg', margin: 1 })
      .then((result) => {
        if (!active) return
        setSvg(result)
        setFailed(false)
      })
      .catch(() => {
        if (!active) return
        setSvg('')
        setFailed(true)
      })
    return () => { active = false }
  }, [value])

  if (failed) return <p className="text-xs text-app-danger">Não foi possível montar a prévia do QR Code.</p>
  if (!svg) return <div className="h-40 w-40 animate-pulse rounded-app-sm bg-app-elevated" aria-label="Gerando QR Code" />

  return (
    <div
      className="h-40 w-40 rounded-app-sm bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
      role="img"
      aria-label="Prévia do QR Code PIX de teste"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
