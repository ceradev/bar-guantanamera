"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Phone, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useThrottle } from "@/hooks/use-throttle"

export default function FloatingCallButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosed, setIsClosed] = useState(false)

  const toggleVisibility = useCallback(() => {
    setIsVisible(window.pageYOffset > 300)
  }, [])

  // Throttle scroll listener para mejor rendimiento
  const throttledToggleVisibility = useThrottle(toggleVisibility, 150)
  
  // Usar ref para mantener una referencia estable a la función throttled
  const throttledRef = useRef(throttledToggleVisibility)
  throttledRef.current = throttledToggleVisibility

  useEffect(() => {
    // Función wrapper que usa la ref para acceder a la versión más reciente
    const handleScroll = () => {
      throttledRef.current()
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, []) // Array vacío porque la función wrapper es estable y usa la ref

  const handleCall = () => {
    window.location.href = "tel:922173039"
  }

  const handleClose = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setIsClosed(true)
  }

  if (isClosed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-20 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              y: {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center z-20 transition-colors"
              aria-label="Cerrar botón de llamada"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </button>

            <Button
              onClick={handleCall}
              className="h-12 w-12 rounded-full bg-green-600 text-white shadow-2xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 relative overflow-hidden"
              aria-label="Llamar al restaurante"
            >
              {/* Ripple effect background */}
              <motion.div
                className="absolute inset-0 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              >
                <Phone className="h-5 w-5 relative z-10" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Tooltip */}
          <motion.div
            className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 5,
              ease: "easeInOut",
            }}
          >
            ¡Llámanos!
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-0 h-0 border-t-2 border-b-2 border-l-2 border-transparent border-l-black"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
