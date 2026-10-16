"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useThrottle } from "@/hooks/use-throttle"

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [footerVisible, setFooterVisible] = useState(false)

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

  useEffect(() => {
    const footer = document.querySelector("footer")
    if (!footer) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setFooterVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {isVisible && !footerVisible && (
        <motion.div
          className="fixed bottom-4 md:bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Volver arriba"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
