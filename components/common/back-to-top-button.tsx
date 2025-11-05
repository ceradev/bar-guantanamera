"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useThrottle } from "@/hooks/use-throttle"

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = useCallback(() => {
    setIsVisible(window.pageYOffset > 300)
  }, [])

  // Throttle scroll listener para mejor rendimiento
  const throttledToggleVisibility = useThrottle(toggleVisibility, 150)
  
  // Usar ref para mantener una referencia estable a la función throttled
  const throttledRef = useRef(throttledToggleVisibility)
  throttledRef.current = throttledToggleVisibility

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 md:bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Volver arriba"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
