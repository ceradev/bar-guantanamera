"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CreditCard,
  Wallet,
  Banknote,
  MapPin,
  CheckCircle2,
  Store,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import LocationSelectionModal from "./location-selection-modal"
import TrackingMapModal from "./tracking-map-modal"
import OrderConfirmationModal from "./order-confirmation-modal"
import type { DeliveryLocation } from "@/types/cart"

interface CheckoutFlowProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

type PaymentMethod = "card" | "paypal" | "cash"

// Zonas de entrega (debe coincidir con location-selection-modal.tsx)
const DELIVERY_ZONES = {
  near: { fee: 0 },
  medium: { fee: 2.99 },
  far: { fee: 4.99 },
  "out-of-range": { fee: 0 },
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.42, 0, 0.58, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.42, 0, 1, 1] as const,
    },
  },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function CheckoutFlow({ isOpen, onClose }: CheckoutFlowProps) {
  const { getSubtotal, getTax, getDeliveryFee, items, clearCart, deliveryLocation: savedDeliveryLocation, setDeliveryLocation } = useCart()
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [deliveryLocation, setDeliveryLocationLocal] = useState<DeliveryLocation | null>(null)

  // Determinar el tipo de entrega del carrito
  const deliveryType = useMemo(() => {
    if (items.length === 0) return null
    const firstItemType = items[0].deliveryType
    // Si todos los items tienen el mismo tipo, usar ese tipo
    const allSameType = items.every(item => item.deliveryType === firstItemType)
    return allSameType ? firstItemType : null
  }, [items])

  // Obtener hora de recogida si es pickup
  const pickupTime = useMemo(() => {
    if (deliveryType === "pickup" && items.length > 0) {
      return items[0].pickupTime || ""
    }
    return ""
  }, [deliveryType, items])

  const subtotal = getSubtotal()
  const tax = getTax()
  const deliveryFee = getDeliveryFee()
  const baseDeliveryFee = useMemo(() => {
    const location = deliveryLocation || savedDeliveryLocation
    return location && location.zone !== "out-of-range" ? DELIVERY_ZONES[location.zone]?.fee || 0 : 0
  }, [deliveryLocation, savedDeliveryLocation])
  const total = subtotal + tax + (deliveryType === "delivery" ? baseDeliveryFee : deliveryFee)

  // Resetear estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Si es pickup, saltar directamente al modal de pago
      if (deliveryType === "pickup") {
        setShowLocationModal(false)
        setShowPaymentModal(true)
      } else {
        // Si ya hay una ubicación guardada, ir directamente al pago
        if (savedDeliveryLocation) {
          setDeliveryLocationLocal(savedDeliveryLocation)
          setShowLocationModal(false)
          setShowPaymentModal(true)
        } else {
          // Si no hay ubicación, mostrar el modal de ubicación
          setShowLocationModal(true)
          setShowPaymentModal(false)
        }
      }
      setShowTrackingModal(false)
      setShowOrderConfirmation(false)
      setSelectedPayment(null)
    }
  }, [isOpen, deliveryType, savedDeliveryLocation])


  const handleLocationConfirm = useCallback((location: DeliveryLocation) => {
    setDeliveryLocationLocal(location)
    setDeliveryLocation(location) // Guardar en el contexto también
    setShowLocationModal(false)
    setShowPaymentModal(true)
  }, [setDeliveryLocation])

  const handleLocationClose = useCallback(() => {
    setShowLocationModal(false)
    onClose()
  }, [onClose])

  const handleConfirmOrder = useCallback(() => {
    if (!selectedPayment) return
    
    // Si es entrega, necesitamos ubicación (usar la guardada si no hay local)
    const finalLocation = deliveryLocation || savedDeliveryLocation
    if (deliveryType === "delivery" && !finalLocation) return

    setShowPaymentModal(false)
    
    // Si es recogida, mostrar confirmación en lugar de tracking
    if (deliveryType === "pickup") {
      setShowOrderConfirmation(true)
      // Limpiar carrito después de confirmar
      clearCart()
    } else {
      setShowTrackingModal(true)
    }
  }, [selectedPayment, deliveryLocation, savedDeliveryLocation, deliveryType, clearCart])

  const handleCloseTracking = useCallback(() => {
    setShowTrackingModal(false)
    clearCart()
    onClose()
  }, [onClose, clearCart])

  const handleCloseOrderConfirmation = useCallback(() => {
    setShowOrderConfirmation(false)
    onClose()
  }, [onClose])

  const handleClosePayment = useCallback(() => {
    setShowPaymentModal(false)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  if (!globalThis.window) return null

  return (
    <>
      {/* Location Selection Modal */}
      <LocationSelectionModal
        isOpen={isOpen && showLocationModal}
        onClose={handleLocationClose}
        onConfirm={handleLocationConfirm}
      />

      {/* Payment Modal */}
      {createPortal(
        <AnimatePresence>
          {showPaymentModal && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={handleClosePayment}
              />

              {/* Payment Modal */}
              <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div
                  className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="payment-modal-title"
                >
                  {/* Close Button */}
                  <button
                    onClick={handleClosePayment}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Header */}
                  <div className="px-8 pt-8 pb-6 border-b border-gray-200">
                    <h2 id="payment-modal-title" className="text-3xl font-bold text-gray-900 mb-2">Finalizar pedido</h2>
                    <p className="text-gray-600">Selecciona tu método de pago</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                    {/* Payment Methods */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de pago</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: "card" as PaymentMethod, label: "Tarjeta", icon: CreditCard },
                          { id: "paypal" as PaymentMethod, label: "PayPal", icon: Wallet },
                          { id: "cash" as PaymentMethod, label: "Efectivo", icon: Banknote },
                        ].map((method) => (
                          <motion.button
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                              selectedPayment === method.id
                                ? "border-red-600 bg-red-50 shadow-lg"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {selectedPayment === method.id && (
                              <motion.div
                                className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                            <method.icon
                              className={`w-8 h-8 mb-3 ${
                                selectedPayment === method.id ? "text-red-600" : "text-gray-600"
                              }`}
                            />
                            <p
                              className={`font-semibold ${
                                selectedPayment === method.id ? "text-red-600" : "text-gray-900"
                              }`}
                            >
                              {method.label}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Información de recogida (solo para pickup) */}
                    {deliveryType === "pickup" && (
                      <motion.div
                        className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Store className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              Recogida en el local
                            </h3>
                            {pickupTime && (
                              <div className="flex items-center gap-2 text-gray-700 mb-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Hora de recogida: {pickupTime}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600">
                              Tu pedido estará listo para recoger en nuestro local a la hora indicada.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Información de entrega (solo para delivery) */}
                    {deliveryType === "delivery" && (deliveryLocation || savedDeliveryLocation) && (
                      <motion.div
                        className="p-6 bg-green-50 rounded-2xl border-2 border-green-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              Entrega a domicilio
                            </h3>
                            <p className="text-sm text-gray-700 mb-2 font-medium">{(deliveryLocation || savedDeliveryLocation)?.address}</p>
                            {(deliveryLocation || savedDeliveryLocation)?.note && (
                              <p className="text-sm text-gray-600 italic mb-2">
                                Nota: {(deliveryLocation || savedDeliveryLocation)?.note}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              Tu pedido será entregado en la dirección indicada.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal ({items.length} {items.length === 1 ? "artículo" : "artículos"})</span>
                          <span className="font-medium">{subtotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>IGIC (7%)</span>
                          <span className="font-medium">{tax.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{deliveryType === "pickup" ? "Recogida" : "Envío"}</span>
                          {(() => {
                            const isPickup = deliveryType === "pickup"
                            const fee = isPickup ? deliveryFee : baseDeliveryFee
                            const isFree = fee === 0
                            return (
                              <span className={`font-medium ${isFree ? "text-green-600" : ""}`}>
                                {isFree ? "Gratis" : `${fee.toFixed(2)}€`}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-bold text-red-600">{total.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={!selectedPayment}
                      className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      Confirmar pedido
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Al confirmar, aceptas nuestros términos y condiciones
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        globalThis.window.document.body
      )}

      {/* Tracking Modal (solo para entrega) */}
      <TrackingMapModal
        isOpen={showTrackingModal}
        onClose={handleCloseTracking}
        deliveryLocation={deliveryLocation || savedDeliveryLocation || undefined}
      />

      {/* Order Confirmation Modal (solo para recogida) */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={handleCloseOrderConfirmation}
        pickupTime={pickupTime}
        orderTotal={total}
        paymentMethod={selectedPayment}
      />
    </>
  )
}

