"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Mail, Store, Clock, X } from "lucide-react"
import { createPortal } from "react-dom"

type PaymentMethod = "card" | "paypal" | "cash" | null

interface OrderConfirmationToastProps {
  isOpen: boolean
  onClose: () => void
  pickupTime?: string
  orderTotal: number
  paymentMethod: PaymentMethod
  autoCloseDelay?: number
}

const toastVariants = {
  hidden: {
    opacity: 0,
    y: -100,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -100,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
}

export default function OrderConfirmationToast({
  isOpen,
  onClose,
  pickupTime,
  orderTotal,
  paymentMethod,
  autoCloseDelay = 5000,
}: OrderConfirmationToastProps) {
  console.log("🟠 [Toast] Renderizado - isOpen:", isOpen)
  console.log("🟠 [Toast] pickupTime:", pickupTime)
  console.log("🟠 [Toast] orderTotal:", orderTotal)
  console.log("🟠 [Toast] paymentMethod:", paymentMethod)
  
  // Cerrar automáticamente después del delay
  useEffect(() => {
    console.log("🟠 [Toast] useEffect - isOpen:", isOpen)
    if (isOpen) {
      console.log("🟠 [Toast] Configurando timer para cerrar en", autoCloseDelay, "ms")
      const timer = setTimeout(() => {
        console.log("🟠 [Toast] Timer ejecutado, cerrando toast")
        onClose()
      }, autoCloseDelay)

      return () => {
        console.log("🟠 [Toast] Limpiando timer")
        clearTimeout(timer)
      }
    }
  }, [isOpen, autoCloseDelay, onClose])

  console.log("🟠 [Toast] Verificando condiciones - isOpen:", isOpen, "window existe:", !!globalThis.window)
  
  if (!isOpen) {
    console.log("🟠 [Toast] isOpen es false, retornando null")
    return null
  }
  if (!globalThis.window) {
    console.log("🟠 [Toast] window no existe, retornando null")
    return null
  }
  
  console.log("🟠 [Toast] Todas las condiciones cumplidas, renderizando contenido del toast")

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case "card":
        return "Tarjeta"
      case "paypal":
        return "PayPal"
      case "cash":
        return "Efectivo"
      default:
        return "No especificado"
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-md px-4"
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden">
            {/* Header con botón de cerrar */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">¡Pedido Confirmado!</h3>
                  <p className="text-xs text-gray-600">Tu pedido está siendo preparado</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white/80 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3">
              {/* Mensaje de correo */}
              <div className="bg-green-100 border-2 border-green-400 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-green-700" />
                  <p className="text-sm font-bold text-gray-900">Correo de confirmación enviado</p>
                </div>
                <p className="text-xs text-gray-700">
                  Revisa tu bandeja de entrada para los detalles del pedido
                </p>
              </div>

              {/* Información del pedido */}
              <div className="space-y-2 text-sm">
                {pickupTime && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Recogida en el local</span>
                    <Clock className="w-4 h-4 text-blue-600 ml-2" />
                    <span className="font-semibold">{pickupTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <span>Método de pago:</span>
                  <span className="font-semibold">{getPaymentLabel(paymentMethod)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-red-600">{orderTotal.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    globalThis.window.document.body
  )
}

