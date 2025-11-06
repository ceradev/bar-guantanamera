"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Navigation, CheckCircle2, AlertCircle, Loader2, Store, Search, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DeliveryLocation } from "@/types/cart"

interface LocationSelectionModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (location: DeliveryLocation) => void
}

// Coordenadas del restaurante (San Isidro, Tenerife)
const RESTAURANT_LOCATION = {
  lat: 28.0789,
  lng: -16.5589,
  address: "C. Castro, 7, 38611 San Isidro, Santa Cruz de Tenerife",
}

// Zonas de entrega (en kilómetros) - hasta 30 km a la redonda
const DELIVERY_RANGES = {
  near: { max: 5, name: "Zona Cercana", fee: 0 },
  medium: { max: 15, name: "Zona Media", fee: 2.99 },
  far: { max: 30, name: "Zona Lejana", fee: 4.99 },
}

// Zonas bloqueadas simuladas (coordenadas aproximadas fuera de servicio)
// Puedes agregar zonas específicas de San Isidro que no entreguen si es necesario
const BLOCKED_AREAS: any[] = [
  // Ejemplo: agregar zonas bloqueadas específicas si es necesario
  // { lat: 28.1, lng: -16.5, radius: 0.5 },
]

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

// Calcular distancia entre dos puntos usando fórmula de Haversine
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en kilómetros
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Verificar si una ubicación está en zona bloqueada
function isLocationBlocked(lat: number, lng: number): boolean {
  return BLOCKED_AREAS.some((area) => {
    const distance = calculateDistance(lat, lng, area.lat, area.lng)
    return distance < area.radius
  })
}

// Determinar zona de entrega según distancia
function getDeliveryZone(distance: number): "near" | "medium" | "far" | "out-of-range" {
  if (distance <= DELIVERY_RANGES.near.max) return "near"
  if (distance <= DELIVERY_RANGES.medium.max) return "medium"
  if (distance <= DELIVERY_RANGES.far.max) return "far"
  return "out-of-range"
}

export default function LocationSelectionModal({
  isOpen,
  onClose,
  onConfirm,
}: LocationSelectionModalProps) {
  const [address, setAddress] = useState("")
  const [manualAddress, setManualAddress] = useState({
    street: "",
    streetNumber: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  })
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLoadingAuto, setIsLoadingAuto] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [mapCenter, setMapCenter] = useState({ lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng })
  const [zoom, setZoom] = useState(11) // Zoom más amplio para mostrar área de 30 km
  const [displayMapCenter, setDisplayMapCenter] = useState({ lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng })
  const [displayZoom, setDisplayZoom] = useState(11)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastCenter, setLastCenter] = useState({ lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng })
  const mapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Resetear cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAddress("")
      setManualAddress({
        street: "",
        streetNumber: "",
        addressLine2: "",
        city: "",
        postalCode: "",
      })
      setSelectedLocation(null)
      setError(null)
      setNote("")
      const initialCenter = { lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lng }
      setMapCenter(initialCenter)
      setDisplayMapCenter(initialCenter)
      setZoom(11)
      setDisplayZoom(11)
      setIsDragging(false)
      setLastCenter(initialCenter)
      // Limpiar timeout si existe
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
    }
  }, [isOpen])

  // Actualizar el iframe del mapa con debounce para evitar recargas constantes
  useEffect(() => {
    if (!isOpen) return

    // Limpiar timeout anterior si existe
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    // Solo actualizar el iframe después de que el usuario termine de interactuar
    updateTimeoutRef.current = setTimeout(() => {
      setDisplayMapCenter(mapCenter)
      setDisplayZoom(zoom)
    }, 300) // Esperar 300ms después de que termine la interacción

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [mapCenter, zoom, isOpen])

  // Geocodificación inversa: obtener dirección desde coordenadas
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`,
        {
          headers: {
            'User-Agent': 'BarGuantanamera/1.0',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error("Error al obtener dirección")
      }

      const data = await response.json()
      
      if (data.display_name) {
        return data.display_name
      }
      
      // Construir dirección desde componentes si display_name no está disponible
      const addr = data.address || {}
      const parts = []
      if (addr.road) parts.push(addr.road)
      if (addr.house_number) parts.push(addr.house_number)
      if (addr.suburb) parts.push(addr.suburb)
      if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village)
      if (addr.postcode) parts.push(addr.postcode)
      
      return parts.length > 0 ? parts.join(", ") : `Ubicación (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    } catch (err) {
      return `Ubicación (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    }
  }, [])

  // Buscar dirección manualmente usando geocodificación mejorada
  const handleSearchAddress = useCallback(async () => {
    if (!address.trim()) {
      setError("Por favor, ingresa una dirección")
      return
    }

    setIsSearchingAddress(true)
    setError(null)

    try {
      // Usar Nominatim de OpenStreetMap con mejor configuración
      const encodedAddress = encodeURIComponent(`${address.trim()}, Tenerife, España`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&accept-language=es&countrycodes=es&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BarGuantanamera/1.0', // Requerido por Nominatim
          }
        }
      )
      
      if (!response.ok) {
        throw new Error("Error al buscar la dirección")
      }

      const data = await response.json()
      
      if (data.length === 0) {
        setError("No se encontró la dirección ingresada. Intenta ser más específico o completa los campos manualmente.")
        setIsSearchingAddress(false)
        return
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)
      const foundAddress = result.display_name || address

      const distance = calculateDistance(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng)
      const isBlocked = isLocationBlocked(lat, lng)
      const zone = getDeliveryZone(distance)
      const deliveryAvailable = !isBlocked && zone !== "out-of-range"

      const location: DeliveryLocation = {
        address: foundAddress,
        lat,
        lng,
        zone,
        distance,
        deliveryAvailable,
        note: note.trim() || undefined,
      }

      setSelectedLocation(location)
      setMapCenter({ lat, lng: lng })
      setDisplayMapCenter({ lat, lng: lng }) // Actualizar inmediatamente para búsquedas
      setZoom(13) // Zoom más cercano cuando se busca una dirección específica
      setDisplayZoom(13)
      setIsSearchingAddress(false)

      if (!deliveryAvailable) {
        if (isBlocked) {
          setError("Lo sentimos, no realizamos entregas en esta zona")
        } else {
          setError(`Esta ubicación está fuera de nuestra zona de entrega (${distance.toFixed(1)} km)`)
        }
      } else {
        setError(null)
      }
    } catch (err) {
      setError("Error al buscar la dirección. Por favor, inténtalo de nuevo o selecciona en el mapa.")
      setIsSearchingAddress(false)
    }
  }, [address, note])

  // Construir dirección completa desde campos manuales
  const buildAddressFromFields = useCallback(() => {
    const parts = []
    if (manualAddress.street) {
      parts.push(manualAddress.street)
      if (manualAddress.streetNumber) {
        parts[parts.length - 1] += `, ${manualAddress.streetNumber}`
      }
    }
    if (manualAddress.addressLine2) parts.push(manualAddress.addressLine2)
    if (manualAddress.city) parts.push(manualAddress.city)
    if (manualAddress.postalCode) parts.push(manualAddress.postalCode)
    return parts.join(", ")
  }, [manualAddress])

  // Manejar búsqueda de dirección desde campos manuales
  const handleManualAddressSearch = useCallback(async () => {
    if (!manualAddress.street && !manualAddress.city) {
      setError("Por favor, completa al menos la calle y ciudad")
      return
    }

    setIsSearchingAddress(true)
    setError(null)

    try {
      // Construir dirección para búsqueda
      const addressParts = []
      if (manualAddress.street) {
        addressParts.push(manualAddress.street)
        if (manualAddress.streetNumber) {
          addressParts[addressParts.length - 1] += ` ${manualAddress.streetNumber}`
        }
      }
      if (manualAddress.city) addressParts.push(manualAddress.city)
      if (manualAddress.postalCode) addressParts.push(manualAddress.postalCode)
      addressParts.push("Tenerife", "España")
      
      const searchQuery = addressParts.join(", ")
      const encodedAddress = encodeURIComponent(searchQuery)
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&accept-language=es&countrycodes=es&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BarGuantanamera/1.0',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error("Error al buscar la dirección")
      }

      const data = await response.json()
      
      if (data.length === 0) {
        // Si no se encuentra, usar la dirección construida manualmente
        setError("Dirección no encontrada en el mapa. Puedes seleccionarla manualmente en el mapa.")
        setIsSearchingAddress(false)
        
        // Construir dirección manual para mostrar
        const fullAddress = buildAddressFromFields()
        const location: DeliveryLocation = {
          address: fullAddress,
          lat: RESTAURANT_LOCATION.lat, // Valor temporal, se actualizará al seleccionar en mapa
          lng: RESTAURANT_LOCATION.lng,
          zone: "out-of-range",
          distance: 0,
          deliveryAvailable: false,
          note: note.trim() || undefined,
        }
        setSelectedLocation(location)
        return
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)
      const foundAddress = result.display_name || buildAddressFromFields()

      const distance = calculateDistance(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng)
      const isBlocked = isLocationBlocked(lat, lng)
      const zone = getDeliveryZone(distance)
      const deliveryAvailable = !isBlocked && zone !== "out-of-range"

      const location: DeliveryLocation = {
        address: foundAddress,
        lat,
        lng,
        zone,
        distance,
        deliveryAvailable,
        note: note.trim() || undefined,
      }

      setSelectedLocation(location)
      setMapCenter({ lat, lng })
      setDisplayMapCenter({ lat, lng }) // Actualizar inmediatamente para búsquedas
      setZoom(13) // Zoom más cercano cuando se busca una dirección específica
      setDisplayZoom(13)
      setIsSearchingAddress(false)

      if (!deliveryAvailable) {
        if (isBlocked) {
          setError("Lo sentimos, no realizamos entregas en esta zona")
        } else {
          setError(`Esta ubicación está fuera de nuestra zona de entrega (${distance.toFixed(1)} km)`)
        }
      } else {
        setError(null)
      }
    } catch (err) {
      setError("Error al buscar la dirección. Puedes seleccionarla manualmente en el mapa.")
      setIsSearchingAddress(false)
    }
  }, [manualAddress, buildAddressFromFields, note])
  const handleAutoLocation = useCallback(async () => {
    setIsLoadingAuto(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización")
      setIsLoadingAuto(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Obtener dirección completa usando geocodificación inversa
        const fullAddress = await reverseGeocode(latitude, longitude)
        
        const distance = calculateDistance(
          RESTAURANT_LOCATION.lat,
          RESTAURANT_LOCATION.lng,
          latitude,
          longitude
        )

        const isBlocked = isLocationBlocked(latitude, longitude)
        const zone = getDeliveryZone(distance)
        const deliveryAvailable = !isBlocked && zone !== "out-of-range"

        const location: DeliveryLocation = {
          address: fullAddress,
          lat: latitude,
          lng: longitude,
          zone,
          distance,
          deliveryAvailable,
          note: note.trim() || undefined,
        }

        setSelectedLocation(location)
        setAddress(fullAddress)
        setMapCenter({ lat: latitude, lng: longitude })
        setDisplayMapCenter({ lat: latitude, lng: longitude }) // Actualizar inmediatamente para ubicación automática
        setZoom(13) // Zoom más cercano cuando se detecta ubicación automática
        setDisplayZoom(13)
        setIsLoadingAuto(false)

        if (!deliveryAvailable) {
          if (isBlocked) {
            setError("Lo sentimos, no realizamos entregas en esta zona")
          } else {
            setError(`Esta ubicación está fuera de nuestra zona de entrega (${distance.toFixed(1)} km)`)
          }
        } else {
          setError(null)
        }
      },
      () => {
        setError("No se pudo obtener tu ubicación. Por favor, selecciónala manualmente.")
        setIsLoadingAuto(false)
      }
    )
  }, [note, reverseGeocode])

  // Manejar selección manual en el mapa - simplificado y mejorado
  const handleMapClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    // No hacer nada si estamos arrastrando
    if (isDragging) return
    
    if (!mapRef.current) return

    setIsLoadingLocation(true)
    setError(null)

    const rect = mapRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convertir coordenadas del click a lat/lng aproximadas usando displayMapCenter y displayZoom
    const centerLat = displayMapCenter.lat
    const centerLng = displayMapCenter.lng
    
    // Cálculo más preciso basado en el zoom actual
    const zoomFactor = Math.pow(2, 11 - displayZoom)
    const latOffset = ((rect.height / 2 - y) / rect.height) * (0.1 / zoomFactor)
    const lngOffset = ((x - rect.width / 2) / rect.width) * (0.1 / zoomFactor)

    const lat = centerLat + latOffset
    const lng = centerLng + lngOffset

    // Obtener dirección completa usando geocodificación inversa
    const fullAddress = await reverseGeocode(lat, lng)

    const distance = calculateDistance(RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng, lat, lng)
    const isBlocked = isLocationBlocked(lat, lng)
    const zone = getDeliveryZone(distance)
    const deliveryAvailable = !isBlocked && zone !== "out-of-range"

    const location: DeliveryLocation = {
      address: fullAddress,
      lat,
      lng,
      zone,
      distance,
      deliveryAvailable,
      note: note.trim() || undefined,
    }

    setSelectedLocation(location)
    setIsLoadingLocation(false)
    setError(deliveryAvailable ? null : "Esta ubicación no está disponible para entrega")
  }, [displayMapCenter, displayZoom, isDragging, note, reverseGeocode])

  // Manejar inicio de arrastre - con clic derecho, Ctrl/Cmd o Espacio
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Permitir arrastre con clic derecho, Ctrl/Cmd presionado
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setLastCenter(mapCenter)
      if (mapRef.current) {
        mapRef.current.style.cursor = "grabbing"
      }
    }
  }, [mapCenter])

  // Manejar arrastre del mapa
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      // Solo mover si el movimiento es significativo
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        const zoomFactor = Math.pow(2, 11 - zoom)
        const latDelta = (-deltaY / rect.height) * (0.1 / zoomFactor)
        const lngDelta = (deltaX / rect.width) * (0.1 / zoomFactor)

        setMapCenter({
          lat: lastCenter.lat + latDelta,
          lng: lastCenter.lng + lngDelta,
        })
      }
    } else if (mapRef.current) {
      mapRef.current.style.cursor = "crosshair"
    }
  }, [isDragging, dragStart, lastCenter, zoom])

  // Manejar fin de arrastre
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false)
      if (mapRef.current) {
        mapRef.current.style.cursor = "crosshair"
      }
      // Evitar que el click se dispare después del arrastre
      e.preventDefault()
      e.stopPropagation()
    }
  }, [isDragging])

  // Manejar clic derecho para arrastrar
  useEffect(() => {
    if (!isOpen || !mapRef.current) return

    const handleContextMenu = (e: MouseEvent) => {
      if (mapRef.current?.contains(e.target as Node)) {
        e.preventDefault()
      }
    }

    const handleMouseUpGlobal = (e: MouseEvent) => {
      if (isDragging && e.button === 2) {
        setIsDragging(false)
        if (mapRef.current) {
          mapRef.current.style.cursor = "crosshair"
        }
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mouseup', handleMouseUpGlobal)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mouseup', handleMouseUpGlobal)
    }
  }, [isOpen, isDragging])

  // Manejar zoom con rueda del ratón - mejorado con throttling
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Calcular zoom basado en la velocidad del scroll
    const delta = e.deltaY > 0 ? -0.5 : 0.5
    const newZoom = Math.max(8, Math.min(18, zoom + delta))
    
    if (Math.abs(newZoom - zoom) > 0.1) {
      setZoom(newZoom)
    }
  }, [zoom])

  // Prevenir scroll de la página cuando el mouse está sobre el mapa
  useEffect(() => {
    if (!isOpen || !globalThis.window || !mapRef.current) return

    const mapElement = mapRef.current

    const handleWheelGlobal = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      // Si el evento ocurre dentro del área del mapa, prevenir scroll de página
      if (mapElement.contains(target) || mapElement === target) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Escuchar en bubbling phase después de que el handler del div se ejecute
    globalThis.window.addEventListener("wheel", handleWheelGlobal, { passive: false })

    return () => {
      globalThis.window.removeEventListener("wheel", handleWheelGlobal)
    }
  }, [isOpen])

  // Manejar salida del área del mapa
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      if (mapRef.current) {
        mapRef.current.style.cursor = "crosshair"
      }
    }
  }, [isDragging])

  // Calcular posición del marcador del restaurante en píxeles desde el centro del mapa
  const getRestaurantMarkerPosition = useCallback(() => {
    if (!mapRef.current) return { top: "50%", left: "50%" }

    const rect = mapRef.current.getBoundingClientRect()
    const zoomFactor = Math.pow(2, 11 - displayZoom) // Usar displayZoom para cálculos visuales
    
    // Calcular diferencia en coordenadas entre el restaurante y el centro del mapa
    const latDiff = RESTAURANT_LOCATION.lat - displayMapCenter.lat
    const lngDiff = RESTAURANT_LOCATION.lng - displayMapCenter.lng
    
    // Convertir a píxeles
    const yOffset = (-latDiff / (0.1 / zoomFactor)) * rect.height
    const xOffset = (lngDiff / (0.1 / zoomFactor)) * rect.width
    
    return {
      top: `${50 + (yOffset / rect.height) * 100}%`,
      left: `${50 + (xOffset / rect.width) * 100}%`,
    }
  }, [displayMapCenter, displayZoom])

  // Calcular posición del marcador de ubicación seleccionada en píxeles desde el centro del mapa
  const getMarkerPosition = useCallback(() => {
    if (!selectedLocation || !mapRef.current) return { top: "50%", left: "50%" }

    const rect = mapRef.current.getBoundingClientRect()
    const zoomFactor = Math.pow(2, 11 - displayZoom) // Usar displayZoom para cálculos visuales
    
    // Calcular diferencia en coordenadas
    const latDiff = selectedLocation.lat - displayMapCenter.lat
    const lngDiff = selectedLocation.lng - displayMapCenter.lng
    
    // Convertir a píxeles
    const yOffset = (-latDiff / (0.1 / zoomFactor)) * rect.height
    const xOffset = (lngDiff / (0.1 / zoomFactor)) * rect.width
    
    return {
      top: `${50 + (yOffset / rect.height) * 100}%`,
      left: `${50 + (xOffset / rect.width) * 100}%`,
    }
  }, [selectedLocation, displayMapCenter, displayZoom])

  // Confirmar ubicación
  const handleConfirm = useCallback(() => {
    if (selectedLocation && selectedLocation.deliveryAvailable) {
      const locationWithNote: DeliveryLocation = {
        ...selectedLocation,
        note: note.trim() || undefined,
      }
      onConfirm(locationWithNote)
    }
  }, [selectedLocation, note, onConfirm])

  // Generar URL del mapa de Google - usar displayMapCenter y displayZoom para evitar recargas constantes
  const getMapUrl = useCallback(() => {
    const center = `${displayMapCenter.lat},${displayMapCenter.lng}`
    const zoomLevel = Math.round(displayZoom)

    // Usar Google Maps Embed API con las coordenadas del restaurante
    // No incluir el key en la URL para evitar recargas innecesarias
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1800.1234567890123!2d${displayMapCenter.lng}!3d${displayMapCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc5e5e5e5e5e5e5e%3A0x1234567890abcdef!2sC.%20Castro%2C%207%2C%2038611%20San%20Isidro%2C%20Santa%20Cruz%20de%20Tenerife!5e0!3m2!1ses!2ses!4v1234567890!5m2!1ses!2ses&center=${center}&zoom=${zoomLevel}`
  }, [displayMapCenter, displayZoom])

  if (!isOpen) return null

  if (!globalThis.window) return null

  return createPortal(
    <AnimatePresence mode="wait">
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
              className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="location-modal-title"
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
                <h2 id="location-modal-title" className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-8 h-8 text-red-600" />
                  Selecciona tu ubicación de entrega
                </h2>
                <p className="text-gray-600">Busca tu dirección, usa tu ubicación automática o haz clic en el mapa</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {/* Búsqueda manual de dirección */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-red-600" />
                    Buscar dirección
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleSearchAddress()
                        }
                      }}
                      placeholder="Ej: Calle Principal 123, San Isidro..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                    />
                    <Button
                      onClick={handleSearchAddress}
                      disabled={isSearchingAddress || !address.trim()}
                      className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                    >
                      {isSearchingAddress ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Campos de dirección manual */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    O completa tu dirección manualmente
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Calle *
                        </label>
                        <input
                          type="text"
                          value={manualAddress.street}
                          onChange={(e) => setManualAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Ej: Calle Castro"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={manualAddress.streetNumber}
                          onChange={(e) => setManualAddress(prev => ({ ...prev, streetNumber: e.target.value }))}
                          placeholder="Ej: 7"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dirección línea 2 (opcional)
                      </label>
                      <input
                        type="text"
                        value={manualAddress.addressLine2}
                        onChange={(e) => setManualAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                        placeholder="Ej: Piso 2, Apartamento 3B"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={manualAddress.city}
                        onChange={(e) => setManualAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Ej: San Isidro"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={manualAddress.postalCode}
                        onChange={(e) => setManualAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="Ej: 38611"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleManualAddressSearch}
                    disabled={isSearchingAddress || (!manualAddress.street && !manualAddress.city)}
                    className="w-full bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    {isSearchingAddress ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar en el mapa
                      </>
                    )}
                  </Button>
                </div>

                {/* Map */}
                <div 
                  className="relative h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-gray-200"
                  style={{ overscrollBehavior: "contain" }}
                >
                  <div
                    ref={mapRef}
                    className="absolute inset-0 w-full h-full z-10 cursor-crosshair select-none touch-none"
                    onClick={handleMapClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onWheel={handleWheel}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      // Permitir arrastre con clic derecho
                      if (!isDragging) {
                        setIsDragging(true)
                        setDragStart({ x: e.clientX, y: e.clientY })
                        setLastCenter(mapCenter)
                        if (mapRef.current) {
                          mapRef.current.style.cursor = "grabbing"
                        }
                      }
                    }}
                    onMouseUp={handleMouseUp}
                    style={{ overscrollBehavior: "contain" }}
                  />
                  <iframe
                    ref={iframeRef}
                    src={getMapUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: "none" }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Selección de ubicación - Bar Guantanamera"
                    key={`map-${displayMapCenter.lat.toFixed(4)}-${displayMapCenter.lng.toFixed(4)}-${Math.round(displayZoom)}`}
                  />
                  
                  {/* Marcador del restaurante (siempre visible) */}
                  <motion.div
                    className="absolute pointer-events-none z-20"
                    style={{
                      ...getRestaurantMarkerPosition(),
                      transform: "translate(-50%, -100%)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Restaurante
                    </div>
                  </motion.div>
                  
                  {/* Marcador personalizado sobre el mapa (ubicación seleccionada) */}
                  {selectedLocation && (
                    <motion.div
                      className="absolute pointer-events-none z-20"
                      style={{
                        ...getMarkerPosition(),
                        transform: "translate(-50%, -100%)",
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Indicador visual de controles */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      {isLoadingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          Obteniendo dirección...
                        </>
                      ) : (
                        <>
                          Clic izquierdo: marcar | Clic derecho/Ctrl: mover | Rueda: zoom
                        </>
                      )}
                    </p>
                  </div>
                  
                  {/* Indicador de zoom */}
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
                    <p className="text-xs font-semibold text-gray-700">
                      Zoom: {displayZoom.toFixed(1)}x
                    </p>
                  </div>
                </div>

                {/* Location Info */}
                {selectedLocation && (
                  <motion.div
                    className="bg-gray-50 rounded-2xl p-6 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Ubicación seleccionada</h3>
                        <p className="text-gray-600 text-sm mb-3">{selectedLocation.address}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Distancia: <span className="font-semibold">{selectedLocation.distance.toFixed(2)} km</span>
                          </span>
                          <span className="text-gray-600">
                            Zona: <span className="font-semibold">{DELIVERY_RANGES[selectedLocation.zone]?.name || "Fuera de rango"}</span>
                          </span>
                        </div>
                      </div>
                      {selectedLocation.deliveryAvailable ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>

                    {!selectedLocation.deliveryAvailable && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-800 text-sm">
                          {selectedLocation.zone === "out-of-range"
                            ? `Esta ubicación está fuera de nuestra zona de entrega (${selectedLocation.distance.toFixed(1)} km). Por favor, selecciona una ubicación más cercana.`
                            : "Lo sentimos, no realizamos entregas en esta zona."}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-red-800 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Campo de nota */}
                {selectedLocation && selectedLocation.deliveryAvailable && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      Nota adicional (opcional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ej: Portón verde, timbre segunda planta, llamar al llegar..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all resize-none"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {note.length}/200 caracteres
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleAutoLocation}
                    disabled={isLoadingAuto}
                    variant="outline"
                    className="w-full border-2 border-gray-300 hover:border-red-600 hover:bg-red-50"
                  >
                    {isLoadingAuto ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Detectando...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Usar mi ubicación
                      </>
                    )}
                  </Button>
                  <div className="text-xs text-gray-500 flex items-center justify-center md:justify-start">
                    <p>O haz clic directamente en el mapa para seleccionar tu ubicación</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedLocation || !selectedLocation.deliveryAvailable}
                  className="w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  Confirmar ubicación
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    globalThis.window.document.body
  )
}

