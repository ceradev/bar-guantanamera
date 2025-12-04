"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Bike, Menu } from "lucide-react"
import { motion, easeOut } from "framer-motion"
import { cn } from "@/lib/utils"
import { useThrottle } from "@/hooks/use-throttle"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
}

const SiteHeader = () => {
  const [activeSection, setActiveSection] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Helper para ajustar enlaces con hash según la ruta actual
  const getHashLink = useCallback((hash: string) => {
    // Si estamos en la página principal, usar solo el hash
    // Si estamos en otra página, usar /#hash para navegar correctamente
    return pathname === "/" ? hash : `/${hash}`
  }, [pathname])

  // Memoizar las secciones para evitar recrear el array
  const sections = useMemo(() => ["home", "menu", "galeria", "opiniones", "ubicacion", "pedir"], [])

  // Optimizar función de scroll con useCallback y throttling
  const setInitialActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + 100 // Add offset for header height
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i])
      if (element) {
        const elementTop = element.offsetTop
        if (scrollPosition >= elementTop) {
          setActiveSection(sections[i])
          
          // Update URL to reflect current section
          const newUrl = `#${sections[i]}`
          if (window.location.hash !== newUrl) {
            window.history.replaceState(null, '', newUrl)
          }
          break
        }
      }
    }
  }, [sections])

  // Throttle scroll listener para mejor rendimiento
  const throttledSetActiveSection = useThrottle(setInitialActiveSection, 150)
  
  // Usar ref para mantener una referencia estable a la función throttled
  const throttledRef = useRef(throttledSetActiveSection)
  throttledRef.current = throttledSetActiveSection

  useEffect(() => {
    // Call once on mount
    setInitialActiveSection()
    
    // Función wrapper que usa la ref para acceder a la versión más reciente
    const handleScroll = () => {
      throttledRef.current()
    }
    
    // Throttled scroll listener
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [setInitialActiveSection]) // Solo setInitialActiveSection porque está memoizado y es estable

  useEffect(() => {
    const sections = ["home", "menu", "galeria", "opiniones", "ubicacion", "pedir"]

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section that is most visible in the viewport
        let mostVisibleSection = ""
        let maxVisibility = 0

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Calculate visibility based on intersection ratio and position
            const visibility = entry.intersectionRatio
            if (visibility > maxVisibility) {
              maxVisibility = visibility
              mostVisibleSection = entry.target.id
            }
          }
        })

        // Only update if we found a visible section
        if (mostVisibleSection && mostVisibleSection !== activeSection) {
          setActiveSection(mostVisibleSection)
          
          // Update URL to reflect current section
          const newUrl = `#${mostVisibleSection}`
          if (window.location.hash !== newUrl) {
            // Use replaceState to avoid adding to browser history
            window.history.replaceState(null, '', newUrl)
          }
        }
      },
      {
        rootMargin: "-10% 0px -10% 0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      },
    )

    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [activeSection])

  useEffect(() => {
    // Smooth scroll behavior for navigation links
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement
      
      if (link) {
        e.preventDefault()
        const targetId = link.getAttribute('href')?.substring(1)
        if (targetId) {
          const targetElement = document.getElementById(targetId)
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }
      }
    }

    document.addEventListener('click', handleSmoothScroll)
    
    return () => {
      document.removeEventListener('click', handleSmoothScroll)
    }
  }, [])


  const navLinks = [
    { href: getHashLink("#menu"), label: "Menú", id: "menu" },
    { href: getHashLink("#galeria"), label: "Galería", id: "galeria" },
    { href: getHashLink("#opiniones"), label: "Opiniones", id: "opiniones" },
    { href: getHashLink("#ubicacion"), label: "Ubicación", id: "ubicacion" },
  ]

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href={getHashLink("#home")} className="flex items-center gap-2" prefetch={false}>
          <img src="/bar-icono.svg" alt="Logo Guantanamera" className="h-10 w-10" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black">Guantanamera</span>
            <span className="text-xs text-gray-500 font-medium -mt-1 sm:block">23 años a su servicio</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 transition-colors duration-200",
                activeSection === link.id
                  ? "text-red-600 font-semibold"
                  : "text-gray-700 hover:text-red-600",
              )}
              prefetch={false}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                  layoutId="activeSection"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {/* Delivery Icons */}
          <div className="flex items-center gap-2">
            <Link
              href="https://www.ubereats.com/es/store/bar-guantanamera/I6yHelcBWGuGn1VeHqaXJw"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-700 hover:text-red-600 transition-colors"
              title="Pedir en Uber Eats"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>
            <Link
              href="https://glovoapp.com/es/es/las-chafiras/guantanamera-las-chafiras"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-700 hover:text-red-600 transition-colors"
              title="Pedir en Glovo"
            >
              <Bike className="h-5 w-5" />
            </Link>
          </div>

          <Button asChild size="sm" className="bg-red-600 text-white shadow-md shadow-red-500/20 hover:bg-red-700">
            <Link href={getHashLink("#pedir")}>Pedir Ahora</Link>
          </Button>
        </div>

        {/* Mobile: Todos los iconos y menú a la derecha */}
        <div className="flex items-center gap-0.5 ml-auto md:hidden">
          {/* Delivery Icons for mobile */}
          <Link
            href="https://www.ubereats.com/es/store/bar-guantanamera/I6yHelcBWGuGn1VeHqaXJw"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-700 hover:text-red-600 transition-colors"
            title="Pedir en Uber Eats"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <Link
            href="https://glovoapp.com/es/es/las-chafiras/guantanamera-las-chafiras"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-700 hover:text-red-600 transition-colors"
            title="Pedir en Glovo"
          >
            <Bike className="h-5 w-5" />
          </Link>

          {/* Menú hamburguesa separado */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2 text-gray-700 hover:text-red-600 transition-colors ml-2"
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold text-black">
                  Menú
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-medium transition-colors duration-200 rounded-lg",
                      activeSection === link.id
                        ? "text-red-600 font-semibold bg-red-50"
                        : "text-gray-700 hover:text-red-600 hover:bg-gray-50",
                    )}
                    prefetch={false}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    asChild
                    className="w-full bg-red-600 text-white shadow-md shadow-red-500/20 hover:bg-red-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href={getHashLink("#pedir")}>Pedir Ahora</Link>
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
                  <Link
                    href="https://www.ubereats.com/es/store/bar-guantanamera/I6yHelcBWGuGn1VeHqaXJw"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-medium">Uber Eats</span>
                  </Link>
                  <Link
                    href="https://glovoapp.com/es/es/las-chafiras/guantanamera-las-chafiras"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <Bike className="h-5 w-5" />
                    <span className="font-medium">Glovo</span>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

export default SiteHeader
