'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    if (window.self !== window.top) return

    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // A failed registration should not prevent the app from loading.
    })
  }, [])

  return null
}
