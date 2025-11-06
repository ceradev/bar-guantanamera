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

// Horarios del restaurante (debe coincidir con location-section.tsx)
const BUSINESS_HOURS = {
  // Lunes, Jueves y Viernes: 09:00 - 18:00
  [1]: { open: 9, close: 18 }, // Lunes
  [4]: { open: 9, close: 18 }, // Jueves
  [5]: { open: 9, close: 18 }, // Viernes
  // Sábados y Domingos: 09:00 - 17:00
  [6]: { open: 9, close: 17 }, // Sábado
  [0]: { open: 9, close: 17 }, // Domingo
  // Martes y Miércoles: Cerrado
}

// Generar horas disponibles para recogida (desde 1 hora después de la apertura hasta la hora de cierre)
const generateAvailableTimes = (): string[] => {
  const times: string[] = []
  const now = new Date()
  const currentDay = now.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  
  // Verificar si el restaurante está abierto hoy
  const todaySchedule = BUSINESS_HOURS[currentDay as keyof typeof BUSINESS_HOURS]
  
  if (!todaySchedule) {
    // Está cerrado hoy (Martes o Miércoles)
    return []
  }
  
  // Obtener la hora de apertura y cierre
  const openHour = todaySchedule.open
  const closeHour = todaySchedule.close
  
  // Empezar 1 hora después de la apertura
  const startHour = openHour + 1
  const startMinute = 0
  
  // Usar la hora de cierre como límite máximo
  const endHour = closeHour
  const endMinute = 0
  
  // Generar horas cada 30 minutos desde 1 hora después de la apertura hasta la hora de cierre
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`
    times.push(timeString)
    
    currentMinute += 30
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
            <dialog
              open={isOpen}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border-0 p-0 backdrop:bg-transparent"
              aria-labelledby="pickup-time-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 id="pickup-time-modal-title" className="text-xl font-bold text-gray-900">
                      Selecciona la hora de recogida
                    </h2>
                    <p className="text-xs text-gray-600">Elige cuándo quieres recoger tu pedido</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {/* Selector de hora */}
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-red-600" />
                      <h3 className="text-base font-semibold text-gray-900">Horas disponibles</h3>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {availableTimes.map((time) => {
                      const isSelected = selectedTime === time
                      return (
                        <motion.button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-red-600 bg-red-600 text-white shadow-md"
                              : "border-gray-300 bg-white text-gray-900 hover:border-red-300 hover:bg-red-50 hover:shadow-sm"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {time}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                  {availableTimes.length === 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-800 font-medium text-center">
                        El restaurante está cerrado hoy. Por favor, selecciona otro día.
                      </p>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                {selectedTime && (
                  <motion.div
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200 flex-shrink-0"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Hora seleccionada</p>
                        <p className="text-base font-bold text-green-700">{selectedTime}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedTime}
                  className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="default"
                >
                  Confirmar hora de recogida
                </Button>
                {!selectedTime && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    Por favor, selecciona una hora de recogida
                  </p>
                )}
              </div>
            </dialog>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    globalThis.window.document.body
  )
}

