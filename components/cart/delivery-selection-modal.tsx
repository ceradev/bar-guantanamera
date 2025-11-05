"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Truck, Store, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DeliveryType } from "@/types/cart"

interface DeliverySelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deliveryType: DeliveryType, pickupTime?: string) => void
  currentDeliveryType?: DeliveryType | null
  currentPickupTime?: string
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

// Generar horas disponibles para recogida (cada 15 minutos desde ahora hasta 2 horas después)
const generateAvailableTimes = (): string[] => {
  const times: string[] = []
  const now = new Date()
  const startHour = now.getHours()
  const startMinute = Math.ceil(now.getMinutes() / 15) * 15 // Redondear hacia arriba al siguiente cuarto de hora
  
  // Empezar desde el siguiente cuarto de hora disponible
  let currentHour = startMinute >= 60 ? startHour + 1 : startHour
  let currentMinute = startMinute >= 60 ? 0 : startMinute
  
  // Generar hasta 2 horas después
  const endHour = startHour + 2
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute <= 0)) {
    const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`
    times.push(timeString)
    
    currentMinute += 15
    if (currentMinute >= 60) {
      currentMinute = 0
      currentHour++
    }
  }
  
  return times
}

export default function DeliverySelectionModal({
  isOpen,
  onClose,
  onConfirm,
  currentDeliveryType,
  currentPickupTime,
}: DeliverySelectionModalProps) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(currentDeliveryType || null)
  const [selectedTime, setSelectedTime] = useState<string>(currentPickupTime || "")
  const [availableTimes] = useState<string[]>(generateAvailableTimes())

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setDeliveryType(currentDeliveryType || null)
      setSelectedTime(currentPickupTime || "")
    }
  }, [isOpen, currentDeliveryType, currentPickupTime])

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleConfirm = useCallback(() => {
    if (!deliveryType) return
    
    if (deliveryType === "pickup" && !selectedTime) {
      return // No permitir confirmar pickup sin hora
    }
    
    onConfirm(deliveryType, deliveryType === "pickup" ? selectedTime : undefined)
    onClose()
  }, [deliveryType, selectedTime, onConfirm, onClose])

  if (!isOpen) return null
  if (!globalThis.window) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
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
              aria-labelledby="delivery-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-200">
                <h2 id="delivery-modal-title" className="text-3xl font-bold text-gray-900 mb-2">
                  ¿Cómo quieres recibir tu pedido?
                </h2>
                <p className="text-gray-600">Selecciona entre entrega a domicilio o recogida en el local</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {/* Opciones de entrega */}
                <div className="space-y-4">
                  {/* Entrega a domicilio */}
                  <motion.button
                    onClick={() => setDeliveryType("delivery")}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      deliveryType === "delivery"
                        ? "border-red-600 bg-red-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          deliveryType === "delivery" ? "bg-red-600" : "bg-gray-100"
                        }`}
                      >
                        <Truck className={`w-6 h-6 ${deliveryType === "delivery" ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-xl font-bold ${deliveryType === "delivery" ? "text-red-600" : "text-gray-900"}`}>
                            Entrega a domicilio
                          </h3>
                          {deliveryType === "delivery" && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle2 className="w-6 h-6 text-red-600" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          Te llevamos tu pedido directamente a tu ubicación. Disponible en zonas cercanas.
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Recogida en el local */}
                  <motion.button
                    onClick={() => setDeliveryType("pickup")}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                      deliveryType === "pickup"
                        ? "border-red-600 bg-red-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          deliveryType === "pickup" ? "bg-red-600" : "bg-gray-100"
                        }`}
                      >
                        <Store className={`w-6 h-6 ${deliveryType === "pickup" ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-xl font-bold ${deliveryType === "pickup" ? "text-red-600" : "text-gray-900"}`}>
                            Recogida en el local
                          </h3>
                          {deliveryType === "pickup" && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle2 className="w-6 h-6 text-red-600" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          Recoge tu pedido en nuestro local. Sin costo de envío.
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Selector de hora (solo para recogida) */}
                {deliveryType === "pickup" && (
                  <motion.div
                    className="mt-6 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Selecciona la hora de recogida</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableTimes.map((time) => {
                        const isSelected = selectedTime === time
                        return (
                          <motion.button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-red-600 bg-red-600 text-white shadow-md"
                                : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className={`font-semibold ${isSelected ? "text-white" : "text-gray-900"}`}>
                              {time}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                    {availableTimes.length === 0 && (
                      <p className="text-sm text-gray-600 mt-4">
                        No hay horas disponibles en este momento. Por favor, intenta más tarde.
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <Button
                  onClick={handleConfirm}
                  disabled={!deliveryType || (deliveryType === "pickup" && !selectedTime)}
                  className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Confirmar
                </Button>
                {deliveryType === "pickup" && !selectedTime && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    Por favor, selecciona una hora de recogida
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    globalThis.window.document.body
  )
}

