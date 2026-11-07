'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const STORAGE_EVENT = 'sf:settings-storage'

function readStorage(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function subscribe(key: string, callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) callback()
  }
  const onLocalChange = (event: Event) => {
    if ((event as CustomEvent<{ key?: string }>).detail?.key === key) callback()
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(STORAGE_EVENT, onLocalChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(STORAGE_EVENT, onLocalChange)
  }
}

/** SSR-safe localStorage state that also stays in sync across settings panels. */
export function useLocalStorageState<T>(key: string, fallback: T): [T, (next: T | ((current: T) => T)) => void] {
  const fallbackRaw = JSON.stringify(fallback)
  const getSnapshot = useCallback(() => readStorage(key, fallbackRaw), [key, fallbackRaw])
  const subscribeToKey = useCallback((callback: () => void) => subscribe(key, callback), [key])
  const raw = useSyncExternalStore(subscribeToKey, getSnapshot, () => fallbackRaw)
  const value = useMemo<T>(() => {
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }, [fallback, raw])

  const setValue = useCallback((next: T | ((current: T) => T)) => {
    const currentRaw = readStorage(key, fallbackRaw)
    let current = fallback
    try {
      current = JSON.parse(currentRaw) as T
    } catch {
      current = fallback
    }
    const nextValue = typeof next === 'function'
      ? (next as (current: T) => T)(current)
      : next
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue))
    } catch {
      // The UI still updates if the browser blocks storage access.
    }
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
  }, [fallback, fallbackRaw, key])

  return [value, setValue]
}
