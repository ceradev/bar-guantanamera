export interface CartItem {
  id: string
  name: string
  description: string
  price: number // Precio numérico para cálculos
  image?: string // Opcional para productos sin imagen (combos, bebidas, mojos)
  quantity: number
  allergens: string[]
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
}

