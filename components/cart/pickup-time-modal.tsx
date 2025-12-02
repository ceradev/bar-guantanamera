"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, CheckCircle2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PickupTimeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pickupTime: string, customerInfo: { firstName: string; lastName: string; email: string }) => void
  currentPickupTime?: string
  currentCustomerInfo?: {
    firstName: string
    lastName: string
    email: string
  }
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

// Generar horas disponibles para recogida en tiempo real (desde ahora hasta la hora de cierre)
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
  
  // Obtener la hora actual
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Obtener la hora de cierre
  const closeHour = todaySchedule.close
  const closeMinute = 0
  
  // Calcular la hora mínima de recogida: hora actual + 30 minutos (tiempo de preparación)
  let minPickupHour = currentHour
  let minPickupMinute = currentMinute + 30
  
  // Ajustar si los minutos pasan de 60
  if (minPickupMinute >= 60) {
    minPickupMinute -= 60
    minPickupHour += 1
  }
  
  // Redondear hacia arriba a la próxima media hora
  // Ejemplos:
  // 14:20 + 30min = 14:50 → redondear a 15:00
  // 14:35 + 30min = 15:05 → redondear a 15:30
  // 14:00 + 30min = 14:30 → empezar desde 14:30
  let startHour = minPickupHour
  let startMinute = 0
  
  if (minPickupMinute === 0) {
    // Ya está en punto, empezar desde ahí
  } else if (minPickupMinute <= 30) {
    // Entre :01 y :30, redondear a :30
    startMinute = 30
  } else {
    // Entre :31 y :59, avanzar a la siguiente hora en punto
    startHour = minPickupHour + 1
  }
  
  // Si ya pasamos la hora de cierre, no hay horarios disponibles hoy
  if (startHour > closeHour || (startHour === closeHour && startMinute > closeMinute)) {
    return []
  }
  
  // Generar horas cada 30 minutos desde ahora hasta la hora de cierre
  let timeHour = startHour
  let timeMinute = startMinute
  
  while (
    timeHour < closeHour || 
    (timeHour === closeHour && timeMinute <= closeMinute)
  ) {
    const timeString = `${String(timeHour).padStart(2, "0")}:${String(timeMinute).padStart(2, "0")}`
    times.push(timeString)
    
    timeMinute += 30
    if (timeMinute >= 60) {
      timeMinute = 0
      timeHour++
    }
  }
  
  return times
}

export default function PickupTimeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPickupTime,
  currentCustomerInfo,
}: PickupTimeModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>(currentPickupTime || "")
  // Generar horarios en tiempo real cada vez que se abre el modal
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  
  // Regenerar horarios cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      const times = generateAvailableTimes()
      setAvailableTimes(times)
      // Si la hora seleccionada ya no está disponible, limpiarla
      if (currentPickupTime && !times.includes(currentPickupTime)) {
        setSelectedTime("")
      }
    }
  }, [isOpen, currentPickupTime])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  // Resetear cuando se abre el modal (cargar valores existentes si hay)
  useEffect(() => {
    if (isOpen) {
      setSelectedTime(currentPickupTime || "")
      setFirstName(currentCustomerInfo?.firstName || "")
      setLastName(currentCustomerInfo?.lastName || "")
      setEmail(currentCustomerInfo?.email || "")
    }
  }, [isOpen, currentPickupTime, currentCustomerInfo])

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
    if (selectedTime && firstName.trim() && lastName.trim() && email.trim() && email.includes("@")) {
      onConfirm(selectedTime, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      })
      onClose()
    }
  }, [selectedTime, firstName, lastName, email, onConfirm, onClose])

  // Validar si todos los campos están completos
  const isFormValid = selectedTime && firstName.trim() && lastName.trim() && email.trim() && email.includes("@")

  // Mensaje de error para el formulario
  const getErrorMessage = (): string => {
    if (!selectedTime) {
      return "Por favor, selecciona una hora de recogida"
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !email.includes("@")) {
      return "Por favor, completa todos los campos obligatorios"
    }
    return "Por favor, completa todos los campos"
  }

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
                        El restaurante está cerrado hoy. Por favor, intenta más tarde o otro día.
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

                {/* Información del cliente */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Información de contacto</h3>
                  </div>
                  
                  {/* Nombre */}
                  <div>
                    <label htmlFor="pickup-firstname" className="block text-xs font-semibold text-gray-900 mb-1.5">
                      Nombre <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="pickup-firstname"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-colors"
                      required
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label htmlFor="pickup-lastname" className="block text-xs font-semibold text-gray-900 mb-1.5">
                      Apellidos <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="pickup-lastname"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tus apellidos"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-colors"
                      required
                    />
                  </div>

                  {/* Correo electrónico */}
                  <div>
                    <label htmlFor="pickup-email" className="block text-xs font-semibold text-gray-900 mb-1.5">
                      Correo electrónico <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="pickup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1.5">
                      Te enviaremos un correo con los detalles de tu pedido
                    </p>
                  </div>
                </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <Button
                  onClick={handleConfirm}
                  disabled={!isFormValid}
                  className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="default"
                >
                  Confirmar hora de recogida
                </Button>
                {!isFormValid && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    {getErrorMessage()}
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

