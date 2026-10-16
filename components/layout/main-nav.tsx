"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navLinks } from "@/config/site"

interface NavProps {
    isLight?: boolean
}

export function MainNav({ isLight = false }: NavProps) {
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href

    return (
        <nav className="hidden flex-1 items-center gap-8 md:flex">
            {navLinks.slice(0, 2).map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-heading font-bold tracking-wide transition-colors duration-200 uppercase",
                        isLight
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
    )
}

export function RightNav({ isLight = false }: NavProps) {
    const pathname = usePathname()
    const isActive = (href: string) => pathname === href

    return (
        <>
            {navLinks.slice(2).map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "text-sm font-heading font-bold tracking-wide transition-colors duration-200 uppercase",
                        isLight
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
        </>
    )
}

