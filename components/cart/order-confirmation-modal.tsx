"use client"

import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, Store, Clock, Package, CreditCard, Wallet, Banknote, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaymentMethod = "card" | "paypal" | "cash" | null

interface OrderConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  pickupTime: string
  orderTotal: number
  paymentMethod: PaymentMethod
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

const successIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
}

const getPaymentIcon = (method: PaymentMethod) => {
  switch (method) {
    case "card":
      return CreditCard
    case "paypal":
      return Wallet
    case "cash":
      return Banknote
    default:
      return CreditCard
  }
}

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

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  pickupTime,
  orderTotal,
  paymentMethod,
}: OrderConfirmationModalProps) {
  if (!isOpen) {
    return null
  }
  if (!globalThis.window) return null

  const PaymentIcon = getPaymentIcon(paymentMethod)

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
              className="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border-0 p-0 backdrop:bg-transparent"
              aria-labelledby="confirmation-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 pt-12 pb-8 text-center">
                {/* Success Icon */}
                <motion.div
                  className="flex justify-center mb-6"
                  variants={successIconVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  id="confirmation-modal-title"
                  className="text-3xl font-bold text-gray-900 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  ¡Pedido Confirmado!
                </motion.h2>

                {/* Message */}
                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Tu pedido ha sido procesado correctamente y está siendo preparado.
                </motion.p>

                {/* Email Confirmation - Always visible, no animation dependency */}
                <div className="bg-green-200 border-4 border-green-700 rounded-xl p-6 mb-6 shadow-2xl">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Mail className="w-8 h-8 text-green-700" />
                    <p className="text-xl font-bold text-gray-900">Correo de confirmación enviado</p>
                  </div>
                  <p className="text-base text-gray-800 leading-relaxed font-medium text-center">
                    Hemos enviado un correo electrónico con los detalles de tu pedido. 
                    Revisa tu bandeja de entrada (y la carpeta de spam si no lo encuentras).
                  </p>
                </div>

                {/* Order Details */}
                <motion.div
                  className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {/* Pickup Info */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Recogida en el local</p>
                      {pickupTime && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{pickupTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <PaymentIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Método de pago</p>
                      <p className="font-semibold text-gray-900">{getPaymentLabel(paymentMethod)}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total pagado</span>
                    <span className="text-2xl font-bold text-red-600">{orderTotal.toFixed(2)}€</span>
                  </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Próximos pasos</p>
                      <p className="text-xs text-gray-700">
                        Te enviaremos una notificación cuando tu pedido esté listo. 
                        Acude a nuestro local a la hora indicada para recogerlo.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Close Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    Entendido
                  </Button>
                </motion.div>
              </div>
            </dialog>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    globalThis.window.document.body
  )
}

