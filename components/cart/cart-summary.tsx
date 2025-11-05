"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight, Truck, Store, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCart } from "@/hooks/use-cart"
import CheckoutFlow from "@/components/cart/checkout-flow"
import LocationSelectionModal from "./location-selection-modal"
import PickupTimeModal from "./pickup-time-modal"
import type { DeliveryType, DeliveryLocation } from "@/types/cart"

interface CartSummaryProps {
  readonly onCheckout?: () => void
  readonly showViewCartButton?: boolean
}

export default function CartSummary({ onCheckout, showViewCartButton = false }: CartSummaryProps) {
  const { getSubtotal, getTax, getDeliveryFee, getTotalPrice, getTotalItems, items, updateCartDeliveryType, setDeliveryLocation } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showPickupTimeModal, setShowPickupTimeModal] = useState(false)

  // Determinar el tipo de entrega actual
  const currentDeliveryType = useMemo(() => {
    if (items.length === 0) return null
    const firstItemType = items[0].deliveryType
    const allSameType = items.every(item => item.deliveryType === firstItemType)
    return allSameType ? firstItemType : null
  }, [items])

  // Obtener hora de recogida si es pickup
  const pickupTime = useMemo(() => {
    if (currentDeliveryType === "pickup" && items.length > 0) {
      return items[0].pickupTime || ""
    }
    return ""
  }, [currentDeliveryType, items])

  const subtotal = getSubtotal()
  const tax = getTax()
  const delivery = getDeliveryFee()
  const total = getTotalPrice()
  const totalItems = getTotalItems()

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout()
    } else {
      setIsCheckoutOpen(true)
    }
  }

  const handleDeliverySelect = useCallback(() => {
    // Abrir modal de ubicación directamente
    setShowLocationModal(true)
  }, [])

  const handlePickupSelect = useCallback(() => {
    // Abrir modal de hora directamente
    setShowPickupTimeModal(true)
  }, [])

  const handleLocationConfirm = useCallback((location: DeliveryLocation) => {
    // Establecer tipo de entrega cuando se confirma la ubicación
    updateCartDeliveryType("delivery")
    // Guardar la ubicación en el contexto
    setDeliveryLocation(location)
    setShowLocationModal(false)
  }, [updateCartDeliveryType, setDeliveryLocation])

  const handlePickupTimeConfirm = useCallback((pickupTime: string) => {
    // Establecer tipo de entrega y hora cuando se confirma
    updateCartDeliveryType("pickup", pickupTime)
    setShowPickupTimeModal(false)
  }, [updateCartDeliveryType])

  return (
    <>
      <div className="border-t border-gray-200 pt-6 space-y-4">
        {/* Delivery Type Selection */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Tipo de entrega</h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Entrega a domicilio */}
              <motion.button
                onClick={handleDeliverySelect}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  currentDeliveryType === "delivery"
                    ? "border-red-600 bg-red-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Truck className={`w-4 h-4 ${currentDeliveryType === "delivery" ? "text-red-600" : "text-gray-600"}`} />
                  <span className={`text-xs font-semibold ${currentDeliveryType === "delivery" ? "text-red-600" : "text-gray-900"}`}>
                    Entrega
                  </span>
                  {currentDeliveryType === "delivery" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="w-4 h-4 text-red-600" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-gray-600">A domicilio</p>
              </motion.button>

              {/* Recogida en el local */}
              <motion.button
                onClick={handlePickupSelect}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  currentDeliveryType === "pickup"
                    ? "border-red-600 bg-red-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Store className={`w-4 h-4 ${currentDeliveryType === "pickup" ? "text-red-600" : "text-gray-600"}`} />
                  <span className={`text-xs font-semibold ${currentDeliveryType === "pickup" ? "text-red-600" : "text-gray-900"}`}>
                    Recogida
                  </span>
                  {currentDeliveryType === "pickup" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle2 className="w-4 h-4 text-red-600" />
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-gray-600">En el local</p>
              </motion.button>
            </div>

            {/* Mostrar hora de recogida si es pickup */}
            {currentDeliveryType === "pickup" && pickupTime && (
              <motion.div
                className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-gray-700">
                  <span className="font-semibold">Hora de recogida:</span> {pickupTime}
                </span>
              </motion.div>
            )}

            {/* Mostrar información si no hay tipo seleccionado */}
            {!currentDeliveryType && (
              <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  Haz clic en una opción para seleccionar el tipo de entrega
                </p>
              </div>
            )}
          </div>
        )}

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
            <span className="text-gray-600">
              {currentDeliveryType === "pickup" ? "Recogida" : "Envío"}
            </span>
            <span className="font-medium text-gray-900">
              {delivery === 0 ? (
                <span className="text-green-600">Gratis</span>
              ) : (
                `${delivery.toFixed(2)}€`
              )}
            </span>
          </div>

          {currentDeliveryType === "delivery" && subtotal < 25 && (
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
            disabled={items.length === 0 || !currentDeliveryType}
            className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Proceder al pago
          </Button>
          {items.length > 0 && !currentDeliveryType && (
            <p className="text-xs text-red-600 text-center">
              Por favor, selecciona un tipo de entrega
            </p>
          )}
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center pt-2">
          Al proceder, aceptas nuestros términos y condiciones
        </p>
      </div>

      {/* Checkout Flow Modal */}
      <CheckoutFlow isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Location Selection Modal (para entrega a domicilio) */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
      />

      {/* Pickup Time Modal (para recogida en local) */}
      <PickupTimeModal
        isOpen={showPickupTimeModal}
        onClose={() => setShowPickupTimeModal(false)}
        onConfirm={handlePickupTimeConfirm}
        currentPickupTime={pickupTime}
      />
    </>
  )
}

