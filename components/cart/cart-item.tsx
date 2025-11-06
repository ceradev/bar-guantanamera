"use client"

import { motion } from "framer-motion"
import { Plus, Minus, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import type { CartItem } from "@/types/cart"
import { useMemo } from "react"
import menuData from "@/data/menu-data.json"
import type { MenuData } from "@/types/menu"

interface CartItemComponentProps {
  readonly item: CartItem
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
}

export default function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, removeItem } = useCart()
  const { comboMeals, bebidasYMojos } = menuData as MenuData

  // Función para obtener el emoji según el tipo de producto
  const getProductEmoji = useMemo(() => {
    // Buscar si es un combo meal
    const comboMeal = comboMeals.find(combo => combo.name === item.name)
    if (comboMeal) {
      return comboMeal.icon
    }

    // Buscar si es una bebida (incluyendo opciones múltiples)
    const isBeverage = bebidasYMojos.bebidas.some(beverage => {
      // Si la bebida tiene opciones múltiples, verificar si el nombre del item coincide con alguna opción
      if (beverage.name.includes("|")) {
        const regex = /\(([^)]+)\)\s*$/
        const match = regex.exec(beverage.name)
        const size = match ? match[1] : ""
        const options = beverage.name.split("|").map(opt => {
          let cleanOption = opt.trim()
          cleanOption = cleanOption.replace(/\s*\([^)]+\)\s*$/, "")
          return size && !cleanOption.includes(size) ? `${cleanOption} (${size})` : cleanOption
        })
        return options.includes(item.name)
      }
      return beverage.name === item.name
    })
    if (isBeverage) {
      return "🍺"
    }

    // Buscar si es un mojo
    const isMojo = bebidasYMojos.mojos.some(mojo => mojo.name === item.name)
    if (isMojo) {
      return "🥄"
    }

    // Por defecto, no retornar emoji (se mostrará placeholder)
    return null
  }, [item.name, comboMeals, bebidasYMojos])

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    } else {
      removeItem(item.id)
    }
  }

  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const renderProductImage = () => {
    if (item.image) {
      return (
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      )
    }

    if (getProductEmoji) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl md:text-5xl" aria-label={item.name}>
            {getProductEmoji}
          </span>
        </div>
      )
    }

    return (
      <Image
        src="/placeholder.svg"
        alt={item.name}
        fill
        className="object-cover"
      />
    )
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
    >
      {/* Image or Emoji */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {renderProductImage()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">
              {item.name}
            </h4>
            <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-1">
              {item.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-gray-400 hover:text-red-600 flex-shrink-0"
            aria-label="Eliminar item"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-red-600">
            {(item.price * item.quantity).toFixed(2)}€
          </span>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Reducir cantidad"
            >
              <Minus className="w-4 h-4 text-gray-700" />
            </button>
            <span className="text-base font-semibold text-gray-900 w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

