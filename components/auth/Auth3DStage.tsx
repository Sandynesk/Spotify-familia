'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Auth3DFallback } from './Auth3DFallback'
import { cn } from '@/lib/utils'

const Auth3DCanvas = dynamic(
  () => import('./Auth3DCanvas').then((m) => m.Auth3DCanvas),
  { ssr: false, loading: () => null }
)

export function Auth3DStage({ className = '' }: { className?: string }) {
  const [ready, setReady] = useState(false)

  return (
    <div className={cn('relative h-full w-full select-none overflow-hidden', className)}>
      {/* 3D Canvas Layer */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700 ease-out',
          ready ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Auth3DCanvas onReady={() => setReady(true)} />
      </div>

      {/* Fallback Layer */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none',
          ready ? 'opacity-0' : 'opacity-100'
        )}
      >
        <Auth3DFallback />
      </div>
    </div>
  )
}
