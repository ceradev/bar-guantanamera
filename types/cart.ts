export type DeliveryType = "delivery" | "pickup"

export interface DeliveryLocation {
  address: string
  lat: number
  lng: number
  zone: "near" | "medium" | "far" | "out-of-range"
  distance: number
  deliveryAvailable: boolean
  note?: string
}

export interface CartItem {
  id: string
  name: string
  description: string
  price: number // Precio numérico para cálculos
  image?: string // Opcional para productos sin imagen (combos, bebidas, mojos)
  quantity: number
  allergens: string[]
  deliveryType?: DeliveryType // Tipo de entrega: "delivery" o "pickup"
  pickupTime?: string // Hora de recogida en formato HH:mm (solo para pickup)
}

export interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getSubtotal: () => number
  getTax: () => number
  getDeliveryFee: () => number
  updateCartDeliveryType: (deliveryType: DeliveryType, pickupTime?: string) => void
  deliveryLocation: DeliveryLocation | null
  setDeliveryLocation: (location: DeliveryLocation | null) => void
}

