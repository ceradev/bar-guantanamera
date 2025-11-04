"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ShoppingBag, Bike } from "lucide-react"
import { motion, easeOut } from "framer-motion"
import { cn } from "@/lib/utils"
import { useThrottle } from "@/hooks/use-throttle"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

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

  useEffect(() => {
    const handleResize = () => {
      // Close mobile menu when viewport becomes desktop size (768px and above)
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    // Add event listener for window resize
    window.addEventListener("resize", handleResize)

    // Call once on mount to handle initial state
    handleResize()

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isMenuOpen])

  const navLinks = [
    { href: "#menu", label: "Menú", id: "menu" },
    { href: "#galeria", label: "Galería", id: "galeria" },
    { href: "#opiniones", label: "Opiniones", id: "opiniones" },
    { href: "#ubicacion", label: "Ubicación", id: "ubicacion" },
  ]

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="#home" className="flex items-center gap-2" prefetch={false}>
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
            <a href="#pedir">Pedir Ahora</a>
          </Button>
        </div>

        <div className="flex items-center gap-1 ml-auto md:hidden">
          {/* Delivery Icons for mobile */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full bg-white">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-start border-b pb-4">
                  <Link
                    href="#home"
                    className="flex items-center gap-2"
                    prefetch={false}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <img src="/bar-icono.svg" alt="Logo Guantanamera" className="h-6 w-6" />
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-black">Guantanamera</span>
                      <span className="text-xs text-gray-500 font-medium -mt-1">23 años a su servicio</span>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navegación</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "rounded-lg px-4 py-3 text-sm font-semibold transition-colors text-center border-2",
                            activeSection === link.id
                              ? "bg-red-50 text-red-600 border-red-600"
                              : "text-gray-800 hover:bg-gray-100 border-gray-200",
                          )}
                          prefetch={false}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Apps */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pedir Online</h3>
                    <div className="space-y-3">
                      <Link
                        href="https://www.ubereats.com/es/store/bar-guantanamera/I6yHelcBWGuGn1VeHqaXJw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold">Pedir en Uber Eats</span>
                      </Link>
                      <Link
                        href="https://glovoapp.com/es/es/las-chafiras/guantanamera-las-chafiras"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bike className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold">Pedir en Glovo</span>
                      </Link>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Acción Rápida</h3>
                    <Link
                      href="#pedir"
                      className="block rounded-lg bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pedir Ahora
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

export default SiteHeader
