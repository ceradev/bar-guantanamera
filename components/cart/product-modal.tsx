"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, Wheat, Milk, Egg, Fish, Nut, Bean, Check } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart, parsePriceString } from "@/hooks/use-cart"
import type { MenuItem, BeverageOrMojo, ComboMeal } from "@/types/menu"

// Allergen icons mapping
const allergenIcons = {
  gluten: Wheat,
  dairy: Milk,
  eggs: Egg,
  fish: Fish,
  nuts: Nut,
  peanuts: Nut,
  soy: Bean,
}

// Tipo unificado para productos con o sin imagen
type ProductForModal = (MenuItem | (BeverageOrMojo & { image?: string }) | (ComboMeal & { image?: string; allergens?: string[] }))

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductForModal | null
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

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addItem, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Detectar si el producto tiene opciones múltiples (separadas por "|")
  const hasMultipleOptions = useMemo(() => {
    if (!product) return false
    return product.name.includes("|")
  }, [product])

  // Extraer opciones si el producto las tiene
  const productOptions = useMemo(() => {
    if (!product || !hasMultipleOptions) return []
    
    // Extraer el tamaño/tipo entre paréntesis si existe (al final del nombre completo)
    const match = product.name.match(/\(([^)]+)\)\s*$/)
    const size = match ? match[1] : ""
    
    // Separar las opciones por "|" y limpiar
    const options = product.name.split("|").map(opt => {
      let cleanOption = opt.trim()
      // Eliminar el tamaño si ya está presente en la opción
      cleanOption = cleanOption.replace(/\s*\([^)]+\)\s*$/, "")
      // Si hay tamaño al final del nombre completo y la opción no lo tiene, añadirlo
      return size && !cleanOption.includes(size) ? `${cleanOption} (${size})` : cleanOption
    })
    
    return options
  }, [product, hasMultipleOptions])

  // Reset quantity y selectedOption cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      // Si tiene opciones múltiples, seleccionar la primera por defecto
      if (hasMultipleOptions && productOptions.length > 0) {
        setSelectedOption(productOptions[0])
      } else {
        setSelectedOption(null)
      }
    }
  }, [isOpen, hasMultipleOptions, productOptions])

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

  const handleAddToCart = useCallback(() => {
    if (!product) return

    // Si tiene opciones múltiples, usar la opción seleccionada
    let finalName = product.name
    if (hasMultipleOptions && selectedOption) {
      finalName = selectedOption
    }

    const price = parsePriceString(product.price)
    // Usar el nombre final (con opción seleccionada si aplica) como ID
    const itemId = finalName

    // Agregar la cantidad seleccionada llamando addItem múltiples veces
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: itemId,
        name: finalName,
        description: product.description,
        price: price,
        image: "image" in product ? product.image : undefined,
        allergens: "allergens" in product ? (product.allergens || []) : [],
      })
    }

    // Cerrar modal después de agregar
    onClose()
  }, [product, quantity, selectedOption, hasMultipleOptions, addItem, onClose])

  if (!product) return null

  const currentQuantity = items.find((item) => item.name === (hasMultipleOptions && selectedOption ? selectedOption : product.name))?.quantity || 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Image - Solo mostrar si existe */}
              {"image" in product && product.image && (
                <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {"popular" in product && product.popular && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Popular
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                      {hasMultipleOptions && selectedOption ? selectedOption : product.name}
                    </h2>
                    <p className="text-xl md:text-2xl font-bold text-red-600">{product.price}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Opciones de Bebida - Si tiene opciones múltiples */}
                  {hasMultipleOptions && productOptions.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Elige tu opción</h3>
                      <div className="space-y-3">
                        {productOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => setSelectedOption(option)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                              selectedOption === option
                                ? "border-red-600 bg-red-50 shadow-md"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${selectedOption === option ? "text-red-600" : "text-gray-700"}`}>
                                {option}
                              </span>
                              {selectedOption === option && (
                                <Check className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergens */}
                  {"allergens" in product && product.allergens && product.allergens.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Alérgenos</h3>
                      <div className="flex flex-wrap gap-3">
                        {product.allergens.map((allergen) => {
                          const IconComponent = allergenIcons[allergen as keyof typeof allergenIcons]
                          return (
                            <div
                              key={allergen}
                              className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200"
                            >
                              {IconComponent && (
                                <IconComponent className="w-4 h-4 text-orange-600" />
                              )}
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {allergen}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cantidad</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="w-5 h-5 text-gray-700" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                    {currentQuantity > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Ya tienes {currentQuantity} {currentQuantity === 1 ? "unidad" : "unidades"} en
                        tu carrito
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with Add Button */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <Button
                  onClick={handleAddToCart}
                  disabled={hasMultipleOptions && !selectedOption}
                  className="w-full bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar {quantity} {quantity === 1 ? "al carrito" : "al carrito"} •{" "}
                  {(parsePriceString(product.price) * quantity).toFixed(2)}€
                </Button>
                {hasMultipleOptions && !selectedOption && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    Por favor, selecciona una opción
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

