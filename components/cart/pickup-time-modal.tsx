"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PickupTimeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pickupTime: string) => void
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

export default function PickupTimeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPickupTime,
}: PickupTimeModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>(currentPickupTime || "")
  const [availableTimes] = useState<string[]>(generateAvailableTimes())

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTime(currentPickupTime || "")
    }
  }, [isOpen, currentPickupTime])

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
    if (selectedTime) {
      onConfirm(selectedTime)
      onClose()
    }
  }, [selectedTime, onConfirm, onClose])

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
              aria-labelledby="pickup-time-modal-title"
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
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8 text-red-600" />
                  <h2 id="pickup-time-modal-title" className="text-3xl font-bold text-gray-900">
                    Selecciona la hora de recogida
                  </h2>
                </div>
                <p className="text-gray-600">Elige cuándo quieres recoger tu pedido en el local</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {/* Selector de hora */}
                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Horas disponibles</h3>
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
                </div>

                {/* Información adicional */}
                {selectedTime && (
                  <motion.div
                    className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Hora seleccionada:</span> {selectedTime}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedTime}
                  className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Confirmar hora de recogida
                </Button>
                {!selectedTime && (
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

