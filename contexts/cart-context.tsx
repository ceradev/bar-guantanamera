"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react"
import type { CartItem, CartContextType } from "@/types/cart"

// Configuración del carrito (lista para implementar)
const CART_CONFIG = {
  taxRate: 0.07, // IGIC 7% - lista para modificar según necesidades
  deliveryFee: 2.99, // Tarifa de entrega - lista para modificar según necesidades
  freeDeliveryThreshold: 25.0, // Umbral para envío gratis - lista para modificar
}

// Valor por defecto del contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])

  // Función helper para parsear precio string a número
  const parsePrice = useCallback((priceString: string): number => {
    // Remueve el símbolo € y espacios, convierte a número
    const cleaned = priceString.replace(/[€\s]/g, "").replace(",", ".")
    return parseFloat(cleaned) || 0
  }, [])

  // Agregar item al carrito
  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // Buscar si el item ya existe
      const existingItem = prevItems.find((i) => i.id === item.id)

      if (existingItem) {
        // Si existe, incrementar cantidad
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        // Si no existe, agregar nuevo item con cantidad 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }, [])

  // Remover item del carrito
  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }, [])

  // Actualizar cantidad de un item
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }, [removeItem])

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Calcular total de items
  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  // Calcular subtotal (sin impuestos ni envío)
  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  // Calcular impuestos (IGIC)
  const getTax = useCallback(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
    return subtotal * CART_CONFIG.taxRate
  }, [items])

  // Calcular tarifa de envío
  const getDeliveryFee = useCallback(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
    // Si el subtotal supera el umbral, envío gratis
    if (subtotal >= CART_CONFIG.freeDeliveryThreshold) {
      return 0
    }
    return CART_CONFIG.deliveryFee
  }, [items])

  // Calcular precio total (subtotal + impuestos + envío)
  const getTotalPrice = useCallback(() => {
    const subtotal = getSubtotal()
    const tax = getTax()
    const delivery = getDeliveryFee()
    return subtotal + tax + delivery
  }, [getSubtotal, getTax, getDeliveryFee])

  // Memoizar el valor del contexto para evitar renders innecesarios
  const value = useMemo<CartContextType>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getSubtotal,
      getTax,
      getDeliveryFee,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, getSubtotal, getTax, getDeliveryFee]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook personalizado para usar el contexto del carrito
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

// Función helper para convertir precio string a número (exportada para uso externo)
export function parsePriceString(priceString: string): number {
  const cleaned = priceString.replace(/[€\s]/g, "").replace(",", ".")
  return parseFloat(cleaned) || 0
}

