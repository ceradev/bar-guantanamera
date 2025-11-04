"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, ShoppingCart } from "lucide-react"
import Link from "next/link"
import SiteHeader from "@/components/layout/site-header"
import SiteFooter from "@/components/layout/site-footer"
import { useCart } from "@/hooks/use-cart"
import CartItemComponent from "@/components/cart/cart-item"
import CartSummary from "@/components/cart/cart-summary"
import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export default function CartPage() {
  const { items, getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-gray-800">
      <SiteHeader />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Tu Carrito
            </h1>
            <p className="text-lg text-gray-600">
              {totalItems > 0
                ? `${totalItems} ${totalItems === 1 ? "item" : "items"} en tu carrito`
                : "Tu carrito está vacío"}
            </p>
          </motion.div>

          {items.length === 0 ? (
            /* Empty Cart State */
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-8">
                Agrega productos deliciosos a tu carrito para comenzar tu pedido
              </p>
              <Link href="/#menu">
                <Button className="bg-red-600 text-white hover:bg-red-700 px-8 py-6 text-lg rounded-xl">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ver Menú
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {items.map((item) => (
                      <CartItemComponent key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  className="bg-gray-50 rounded-2xl p-6 sticky top-24"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>
                  <CartSummary />
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

