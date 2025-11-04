"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"

interface CartSummaryProps {
  onCheckout?: () => void
  showViewCartButton?: boolean
}

export default function CartSummary({ onCheckout, showViewCartButton = false }: CartSummaryProps) {
  const { getSubtotal, getTax, getDeliveryFee, getTotalPrice, getTotalItems, items } = useCart()

  const subtotal = getSubtotal()
  const tax = getTax()
  const delivery = getDeliveryFee()
  const total = getTotalPrice()
  const totalItems = getTotalItems()

  const handleCheckout = () => {
    // Placeholder para lógica de checkout
    // Aquí se puede conectar con la API de pago
    if (onCheckout) {
      onCheckout()
    } else {
      console.log("Checkout iniciado - Conectar con lógica de pago")
      // Ejemplo: router.push('/checkout')
    }
  }

  return (
    <div className="border-t border-gray-200 pt-6 space-y-4">
      {/* Summary */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
          <span className="font-medium text-gray-900">{subtotal.toFixed(2)}€</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IGIC (7%)</span>
          <span className="font-medium text-gray-900">{tax.toFixed(2)}€</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="font-medium text-gray-900">
            {delivery === 0 ? (
              <span className="text-green-600">Gratis</span>
            ) : (
              `${delivery.toFixed(2)}€`
            )}
          </span>
        </div>

        {subtotal < 25 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span className="font-medium text-red-600">
              {(25 - subtotal).toFixed(2)}€
            </span>{" "}
            más para envío gratis
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-red-600">{total.toFixed(2)}€</span>
      </div>

      {/* Buttons */}
      <div className="space-y-2 pt-4">
        {showViewCartButton && (
          <Link href="/carrito" className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50"
            >
              Ver carrito completo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}

        <Button
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Proceder al pago
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center pt-2">
        Al proceder, aceptas nuestros términos y condiciones
      </p>
    </div>
  )
}

