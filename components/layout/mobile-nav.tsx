
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetClose,
    SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { navLinks, deliveryLinks } from "@/config/site"


export function MobileNav({ triggerClassName }: { triggerClassName?: string } = {}) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close sheet when resizing to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && open) {
                setOpen(false)
            }
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [open])

    const isActive = (href: string) => pathname === href

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className={cn("p-2 text-foreground hover:text-primary transition-colors", triggerClassName)}
                    aria-label="Abrir menu"
                >
                    <Menu className="h-7 w-7" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 [&>button]:hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <Link
                        href="/"
                        className="flex flex-col"
                        onClick={() => setOpen(false)}
                    >
                        <span className="text-xl font-bold text-foreground">Guantanamera</span>
                        <span className="text-xs text-muted-foreground font-medium -mt-0.5">
                            23 años a su servicio
                        </span>
                    </Link>
                    <SheetClose asChild>
                        <button
                            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                            aria-label="Cerrar menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </SheetClose>
                </div>

                <div className="px-6 py-8 flex flex-col gap-6">
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "px-4 py-3 text-base font-semibold tracking-wide rounded-lg transition-colors",
                                    isActive(link.href)
                                        ? "text-primary bg-primary/5"
                                        : "text-foreground hover:bg-secondary"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-border pt-6 flex flex-col gap-4">
                        <Button
                            asChild
                            className="w-full bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary/90 rounded-sm"
                            size="lg"
                        >
                            <Link href="/encargar" onClick={() => setOpen(false)}>
                                PEDIR AHORA
                            </Link>
                        </Button>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            {deliveryLinks.map((link) => (
                                <Button
                                    key={link.href}
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs font-bold tracking-wider border-2 hover:bg-secondary/50"
                                >
                                    <a
                                        href={link.href}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
