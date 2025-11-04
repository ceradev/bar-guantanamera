"use client"

import { useRef, useCallback } from "react"

/**
 * Hook para throttling de funciones
 * Útil para optimizar event listeners como scroll, resize, etc.
 * 
 * @param callback - Función a ejecutar
 * @param delay - Tiempo de espera en ms (default: 100ms)
 * @returns Función throttled
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 100
): T {
  const lastRun = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastRun.current >= delay) {
        lastRun.current = now
        callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now()
          callback(...args)
        }, delay - (now - lastRun.current))
      }
    },
    [callback, delay]
  ) as T

  return throttledCallback
}
