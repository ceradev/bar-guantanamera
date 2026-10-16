"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/layout/mobile-nav"
import { CartButton } from "@/components/layout/cart-button"
import { useScroll } from "@/hooks/use-scroll"
import { navLinks } from "@/config/site"

const SiteHeader = () => {
  const isScrolled = useScroll()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isTransparent = isHome && !isScrolled

  const isActive = (href: string) => pathname === href

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full h-20 transition-all duration-300",
        isTransparent
          ? "bg-[#D94A12] border-b border-white/10 text-white"
          : isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border text-foreground"
          : "bg-background border-b border-border text-foreground"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 relative">

        {/* Brand Logo - Far Left */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          prefetch={false}
        >
          {isTransparent ? (
            <Image
              src="/images/maintenance/guantanamera-logo-white.png"
              alt="Guantanamera Bar Cafetería"
              width={160}
              height={70}
              priority
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-heading font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                Guantanamera
              </span>
              <span className="text-xs text-muted-foreground font-body font-medium -mt-0.5">
                23 años a su servicio
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Navigation - Right */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <nav className="flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm lg:text-base font-heading font-bold tracking-wide transition-colors uppercase",
                  isTransparent
                    ? (isActive(link.href)
                        ? "text-white underline underline-offset-8 decoration-2"
                        : "text-white/90 hover:text-white")
                    : (isActive(link.href)
                        ? "text-primary underline underline-offset-8 decoration-2"
                        : "text-foreground hover:text-primary")
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <CartButton
            className={isTransparent ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"}
          />

          <Button
            asChild
            size="sm"
            variant={isTransparent ? "outline" : "default"}
            className={cn(
              "font-heading font-black tracking-wider uppercase transition-all duration-300 rounded-lg px-6 shadow-sm",
              isTransparent
                ? "border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#D94A12]"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Link href="/encargar">PEDIR</Link>
          </Button>
        </div>

        {/* Mobile Actions - Right */}
        <div className="flex items-center gap-1 md:hidden">
          <CartButton
            iconSize="h-6 w-6"
            className={isTransparent ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"}
          />
          <MobileNav
            triggerClassName={isTransparent ? "text-white hover:text-white/80" : "text-foreground hover:text-primary"}
          />
        </div>

      </div>
    </header>
  )
}

export default SiteHeader

