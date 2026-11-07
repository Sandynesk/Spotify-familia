'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, X, XCircle } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { springs } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ShowToastOptions {
  message: string
  type?: ToastType
  action?: ToastAction
  duration?: number
}

interface ToastItem extends ShowToastOptions {
  id: string
  type: ToastType
}

export interface ToastContextValue {
  /** Add a toast, optionally with an inline action and custom lifetime. */
  show: (options: ShowToastOptions) => void
  /** Legacy shorthand retained for existing screens. */
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
}

/** Global toast stack, positioned above the mobile tab bar. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const remove = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(({ message, type = 'success', action, duration = 4000 }: ShowToastOptions) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const item: ToastItem = { id, message, type, action, duration }
    setToasts((current) => [...current.slice(-2), item])
    if (duration > 0) timers.current.set(id, setTimeout(() => remove(id), duration))
  }, [remove])

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer))
    timers.current.clear()
  }, [])

  const value = useMemo<ToastContextValue>(() => ({
    show,
    toast: (message, type = 'success') => show({ message, type }),
    success: (message) => show({ message, type: 'success' }),
    error: (message) => show({ message, type: 'error' }),
    warning: (message) => show({ message, type: 'warning' }),
  }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  )
}

function ToastStack({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: string) => void }) {
  const reducedMotion = useReducedMotion()

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-4 right-4 z-[100] flex max-h-[50dvh] flex-col gap-2 overflow-y-auto sm:left-auto sm:right-6 sm:w-[min(24rem,calc(100vw-2rem))] lg:bottom-6"
      aria-live="polite"
      aria-relevant="additions removals"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type]
          const tone = toast.type === 'success' ? 'text-app-accent' : toast.type === 'warning' ? 'text-app-warn' : 'text-app-danger'
          return (
            <motion.div
              key={toast.id}
              layout={!reducedMotion}
              initial={reducedMotion ? undefined : { y: 8, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { y: 6, opacity: 0, scale: 0.98 }}
              transition={reducedMotion ? { duration: 0 } : springs.snappy}
              className="app-glass pointer-events-auto flex min-h-14 items-center gap-3 rounded-app-sm px-3.5 py-2.5 shadow-app-float"
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              <Icon aria-hidden className={cn('h-5 w-5 shrink-0', tone)} strokeWidth={1.9} />
              <p className="min-w-0 flex-1 text-sm text-app-text">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick()
                    onClose(toast.id)
                  }}
                  className="min-h-10 shrink-0 rounded-full px-3 text-sm font-semibold text-app-accent transition-colors hover:bg-app-accent/10"
                >
                  {toast.action.label}
                </button>
              )}
              <IconButton aria-label="Fechar notificação" icon={<X />} size="sm" variant="ghost" onClick={() => onClose(toast.id)} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
