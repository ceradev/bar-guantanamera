"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Truck, MapPin, CheckCircle2, Package, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DeliveryLocation } from "./location-selection-modal"

interface TrackingMapModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly deliveryLocation: DeliveryLocation | null
}

type OrderStatus = "confirmed" | "in-transit" | "delivered"

const RESTAURANT_LOCATION = {
  lat: 40.4168,
  lng: -3.7038,
  address: "Bar Guantanamera, Madrid",
}

const ORDER_STATUSES: Record<OrderStatus, { label: string; icon: typeof CheckCircle2; duration: number }> = {
  confirmed: { label: "Pedido confirmado", icon: CheckCircle2, duration: 3000 },
  "in-transit": { label: "En camino", icon: Truck, duration: 8000 },
  delivered: { label: "Entregado", icon: Package, duration: 0 },
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

// Generar puntos intermedios para la ruta simulada
function generateRoutePoints(start: { lat: number; lng: number }, end: { lat: number; lng: number }, steps: number) {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    points.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng + (end.lng - start.lng) * t,
    })
  }
  return points
}

export default function TrackingMapModal({ isOpen, onClose, deliveryLocation }: TrackingMapModalProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("confirmed")
  const [driverPosition, setDriverPosition] = useState({ lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng })
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number }>>([])
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0)
  const animationRef = useRef<number>()

  // Generar ruta cuando cambia la ubicación de entrega
  useEffect(() => {
    if (deliveryLocation && isOpen) {
      const points = generateRoutePoints(RESTAURANT_LOCATION, deliveryLocation, 20)
      setRoutePoints(points)
      setDriverPosition(points[0])
      setCurrentRouteIndex(0)
    }
  }, [deliveryLocation, isOpen])

  // Manejar el seguimiento automático del pedido
  useEffect(() => {
    if (!isOpen) return

    let timeoutId: NodeJS.Timeout

    if (currentStatus === "confirmed") {
      timeoutId = setTimeout(() => {
        setCurrentStatus("in-transit")
      }, ORDER_STATUSES.confirmed.duration)
    } else if (currentStatus === "in-transit") {
      timeoutId = setTimeout(() => {
        setCurrentStatus("delivered")
      }, ORDER_STATUSES["in-transit"].duration)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentStatus, isOpen])

  // Animar movimiento del repartidor
  useEffect(() => {
    if (currentStatus !== "in-transit" || routePoints.length === 0) return

    const animateDriver = () => {
      if (currentRouteIndex < routePoints.length - 1) {
        setCurrentRouteIndex((prev) => {
          const next = prev + 1
          setDriverPosition(routePoints[next])
          return next
        })
      }
    }

    const interval = setInterval(animateDriver, ORDER_STATUSES["in-transit"].duration / routePoints.length)
    animationRef.current = interval as unknown as number

    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [currentStatus, routePoints, currentRouteIndex])

  // Resetear estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStatus("confirmed")
      setCurrentRouteIndex(0)
      if (deliveryLocation) {
        setDriverPosition({ lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng })
      }
    }
  }, [isOpen, deliveryLocation])

  // Generar URL del mapa con marcadores y ruta
  const getMapUrl = useCallback(() => {
    if (!deliveryLocation) return ""

    const centerLat = (driverPosition.lat + deliveryLocation.lat) / 2
    const centerLng = (driverPosition.lng + deliveryLocation.lng) / 2

    // Usar Google Maps Embed API sin necesidad de API key
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3037.649499513813!2d-3.705789184604108!3d40.41677537936505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2ses!4v1678886543210!5m2!1ses!2ses&center=${centerLat},${centerLng}&zoom=13`
  }, [driverPosition, deliveryLocation])

  if (!isOpen || !deliveryLocation) return null

  if (!globalThis.window) return null

  const progress = currentStatus === "delivered" ? 100 : currentStatus === "in-transit" ? (currentRouteIndex / routePoints.length) * 100 : 0

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
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tracking-modal-title"
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
                <div className="flex items-center justify-between mb-4">
                  <h2 id="tracking-modal-title" className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    {currentStatus === "confirmed" && <CheckCircle2 className="w-8 h-8 text-green-600" />}
                    {currentStatus === "in-transit" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Truck className="w-8 h-8 text-blue-600" />
                      </motion.div>
                    )}
                    {currentStatus === "delivered" && <Package className="w-8 h-8 text-red-600" />}
                    {ORDER_STATUSES[currentStatus].label}
                  </h2>
                  {currentStatus === "in-transit" && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tiempo estimado</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.max(1, Math.ceil((1 - progress / 100) * 15))} min
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {/* Map */}
                <div className="relative h-96 rounded-2xl overflow-hidden border-2 border-gray-200">
                  <iframe
                    src={getMapUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Seguimiento del pedido"
                  />
                  
                  {/* Marcador del repartidor animado */}
                  {currentStatus === "in-transit" && (
                    <motion.div
                      className="absolute pointer-events-none"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -100%)",
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Status Info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Origen</p>
                        <p className="text-sm font-semibold text-gray-900">{RESTAURANT_LOCATION.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Destino</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{deliveryLocation.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Repartidor</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {currentStatus === "in-transit" ? "En camino" : currentStatus === "delivered" ? "Entregado" : "Preparando"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Steps */}
                <div className="relative space-y-6">
                  {[
                    { status: "confirmed" as OrderStatus, label: "Pedido confirmado" },
                    { status: "in-transit" as OrderStatus, label: "En camino" },
                    { status: "delivered" as OrderStatus, label: "Entregado" },
                  ].map((step, index) => {
                    const isActive = currentStatus === step.status
                    const isCompleted =
                      (step.status === "confirmed" && currentStatus !== "confirmed") ||
                      (step.status === "in-transit" && currentStatus === "delivered")

                    const getIconBgColor = () => {
                      if (isCompleted) return "bg-green-600"
                      if (isActive) return "bg-red-600"
                      return "bg-gray-200"
                    }

                    const getLabelColor = () => {
                      if (isCompleted || isActive) return "text-gray-900"
                      return "text-gray-400"
                    }

                    return (
                      <div key={step.status} className="relative">
                        <motion.div
                          className="flex items-center gap-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${getIconBgColor()}`}>
                            {isCompleted && <CheckCircle2 className="w-6 h-6 text-white" />}
                            {!isCompleted && isActive && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Loader2 className="w-6 h-6 text-white" />
                              </motion.div>
                            )}
                            {!isCompleted && !isActive && <Clock className="w-6 h-6 text-gray-400" />}
                          </div>

                          <div className="flex-1">
                            <p className={`font-semibold transition-colors duration-300 ${getLabelColor()}`}>
                              {step.label}
                            </p>
                            {isActive && (
                              <motion.p
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {step.status === "confirmed" && "Preparando tu pedido..."}
                                {step.status === "in-transit" && "El repartidor está en camino..."}
                                {step.status === "delivered" && "¡Pedido entregado exitosamente!"}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>

                        {index < 2 && (
                          <div className="absolute left-6 top-12 w-0.5 h-12 bg-gray-200">
                            {isCompleted && (
                              <motion.div
                                className="w-full bg-green-600"
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                transition={{ duration: 0.5 }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              {currentStatus === "delivered" && (
                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                  <Button
                    onClick={onClose}
                    className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    Cerrar
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    globalThis.window.document.body
  )
}

