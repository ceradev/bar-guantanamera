"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import CartItemComponent from "./cart-item"
import CartSummary from "./cart-summary"

export default function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, getTotalItems } = useCart()
  const totalItems = getTotalItems()

  // No mostrar el botón si el carrito está vacío
  if (totalItems === 0) return null

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl hover:shadow-red-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        aria-label="Ver carrito"
      >
        <ShoppingBag className="w-6 h-6" />
        {totalItems > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-600 rounded-full flex items-center justify-center text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.span>
        )}
      </motion.button>

      {/* Drawer/Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-2xl font-bold text-gray-900">
              Tu Carrito
            </SheetTitle>
            <p className="text-sm text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Cart Items */}
            {items.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Tu carrito está vacío</p>
              </div>
            )}

            {/* Summary */}
            {items.length > 0 && (
              <CartSummary showViewCartButton={false} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

