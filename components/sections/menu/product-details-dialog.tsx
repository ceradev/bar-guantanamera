"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ShoppingCart, Check } from "lucide-react"
import { MenuItem } from "@/types/menu"
import { CartItem } from "@/types/order"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ProductDetailsDialogProps {
    item: (MenuItem & { category?: string, madeToOrder?: boolean }) | null
    open: boolean
    onOpenChange: (open: boolean) => void
    addToCart: (item: MenuItem | CartItem, selectedOptions?: Record<string, string>) => void
}

export default function ProductDetailsDialog({ item, open, onOpenChange, addToCart }: ProductDetailsDialogProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    useEffect(() => {
        if (item?.customizable && item.optionGroups?.length) {
            const defaults: Record<string, string> = {}
            item.optionGroups.forEach(group => {
                defaults[group.id] = group.defaultOption || group.options[0]
            })
            setSelectedOptions(defaults)
        } else {
            setSelectedOptions({})
        }
    }, [item, open])

    const handleOptionSelect = (groupId: string, option: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [groupId]: option
        }))
    }

    if (!item) return null

    const isDisabled = item.madeToOrder === true

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-1rem)] max-h-[calc(100dvh-1rem)] sm:max-w-[600px] p-0 overflow-hidden bg-card border-border">
                <div className="flex max-h-[calc(100dvh-1rem)] flex-col">
                <div className="relative aspect-[4/3] w-full shrink-0 bg-secondary sm:aspect-video">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 600px) 100vw, 600px"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                        </div>
                    )}
                    {isDisabled && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                                Solo por encargo
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="flex items-start justify-between gap-4 pr-8 text-xl font-bold text-foreground sm:text-2xl">
                            <span>{item.name}</span>
                            <span className="text-primary whitespace-nowrap">{item.price}</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-base">
                            {item.category}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <p className="text-foreground/80 leading-relaxed font-body">
                            {item.description || "Delicioso plato preparado con ingredientes frescos y de alta calidad. Perfecto para disfrutar en cualquier momento."}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {item.popular && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full dark:bg-yellow-900/30 dark:text-yellow-500">
                                    Popular
                                </span>
                            )}
                            {item.spicy && (
                                <span className="px-3 py-1 bg-destructive/15 text-destructive text-xs font-semibold rounded-full">
                                    Picante
                                </span>
                            )}
                            {item.vegetarian && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full dark:bg-green-900/30 dark:text-green-500">
                                    Vegetariano
                                </span>
                            )}
                            {item.madeToOrder && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full dark:bg-amber-900/30 dark:text-amber-500">
                                    Solo por encargo
                                </span>
                            )}
                        </div>

                        {item.customizable && item.optionGroups && item.optionGroups.length > 0 && (
                            <div className="pt-4 border-t border-border space-y-6">
                                {item.optionGroups.map((group) => (
                                    <div key={group.id}>
                                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                            {group.name}:
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {group.options.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => handleOptionSelect(group.id, option)}
                                                    className={cn(
                                                        "flex items-center justify-between px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                                        selectedOptions[group.id] === option
                                                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                            : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                                    )}
                                                >
                                                    {option}
                                                    {selectedOptions[group.id] === option && <Check className="h-4 w-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                    <div className="shrink-0 border-t border-border bg-card px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6">
                        <Button
                            onClick={() => {
                                addToCart(item, selectedOptions)
                                onOpenChange(false)
                            }}
                            disabled={isDisabled}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {isDisabled ? "No disponible online" : "Añadir al pedido"}
                        </Button>
                    </div>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
