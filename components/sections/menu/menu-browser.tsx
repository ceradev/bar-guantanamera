"use client"

import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp, staggerContainer } from "./animations"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Grid3X3, List, Eye, Heart, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import menuData from "@/data/menu.json"

import { MenuItem, MenuCategory } from "@/types/menu"

type BrowserMenuItem = MenuItem & { category?: string }

// Flatten all items for search/filter
function getAllItems(): BrowserMenuItem[] {
  const items: BrowserMenuItem[] = []
  const data = menuData as unknown as MenuData

  Object.entries(data.menuCategories).forEach(([, cat]) => {
    cat.items.forEach((item) => {
      items.push({ ...item, category: cat.title })
    })
  })
  // Add combos
  data.comboMeals.forEach((combo) => {
    items.push({
      name: combo.name,
      description: combo.description,
      price: combo.price,
      image: combo.image,
      category: "Ofertas",
      popular: true,
    })
  })
  return items
}

const categoryLabels = [
  { key: "todos", label: "Todos" },
  { key: "ofertas", label: "Ofertas" },
  { key: "pollos", label: "Pollos asados" },
  { key: "costillasYPatas", label: "Costillas y Patas Asadas" },
  { key: "guarniciones", label: "Guarniciones" },
  { key: "quesadillasYBurritos", label: "Quesadillas y Burritos" },
  { key: "bebidas", label: "Bebidas" },
  { key: "mojos", label: "Mojos" },
]

const popularTags = ["Asado", "Combos", "Favoritos", "Picante", "Novedad"]

const ITEMS_PER_PAGE = 12

import { useCart } from "@/hooks/use-cart"
import { CartItem } from "@/types/order"
import ProductDetailsDialog from "./product-details-dialog"
import { MenuData } from "@/types/menu"
import { useBusinessSettings } from "@/components/providers/business-settings-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Helper to parse price string to number
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  // Remove currency symbol and any non-numeric chars except dot and comma
  const clean = priceStr.replace(/[^\d.,]/g, "").replace(",", ".")
  const val = parseFloat(clean)
  return isNaN(val) ? 0 : val
}

// Simple hook for favorites
function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("guantanamera-favorites")
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load favorites")
    }
  }, [])

  const toggleFavorite = (itemName: string) => {
    setFavorites(prev => {
      let newFavs
      if (prev.includes(itemName)) {
        newFavs = prev.filter(n => n !== itemName)
      } else {
        newFavs = [...prev, itemName]
      }
      localStorage.setItem("guantanamera-favorites", JSON.stringify(newFavs))
      return newFavs
    })
  }

  return { favorites, toggleFavorite }
}

export default function MenuBrowser() {
  const { cart, addToCart } = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const { inactiveNames } = useBusinessSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("todos")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOption, setSortOption] = useState("default")
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog state
  const [selectedItem, setSelectedItem] = useState<BrowserMenuItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const allItems = useMemo(() => getAllItems(), [])

  const filteredItems = useMemo(() => {
    // Inject dynamic active status
    let items = allItems.map(item => ({
      ...item,
      active: !inactiveNames.includes(item.name)
    }))

    // const data = menuData as unknown as MenuData // Not needed if we use allItems for everything? 
    // Wait, the original code used `data` for "bebidas" and "mojos" specific logic (mapping categories).
    // But `getAllItems` (lines 16-37) already flattens everything EXCEPT maybe beverages/mojos if they were not in `menuCategories`?
    // Let's check `getAllItems` implementation (lines 16-37 in view 556).
    // It iterates `menuCategories`. Does `menuCategories` include drinks?
    // `menuData` has `bebidas` and `mojos` as top level arrays in JSON (lines 20-30 in menu.json usually).
    // `getAllItems` only does `menuCategories` and `comboMeals`.
    // So "bebidas" and "mojos" are NOT in `allItems` by default?
    // If so, my previous "simplify" edit to `filteredItems` might have BROKEN the display of beverages if I just relied on `items = allItems`.
    // The original code had:
    // } else if (activeCategory === "bebidas") { items = data.bebidas... }

    // So I need to keep accessing `menuData`.

    const data = menuData as unknown as MenuData

    // Category filter
    if (activeCategory !== "todos") {
      if (activeCategory === "ofertas") {
        items = items.filter((item) => item.category === "Ofertas")
      } else if (activeCategory === "bebidas") {
        items = data.bebidas.map((b) => ({
          ...b,
          category: "Bebidas",
          active: !inactiveNames.includes(b.name)
        }))
      } else if (activeCategory === "mojos") {
        items = data.mojos.map((m) => ({
          ...m,
          category: "Mojos",
          active: !inactiveNames.includes(m.name)
        }))
      } else {
        items = items.filter((item) => item.category === categoryLabels.find(c => c.key === activeCategory)?.label || item.category === activeCategory)
        // Note: `categoryLabels` has "Pollos" label "Pollos asados". `getAllItems` uses `cat.title` from JSON.
        // We need to ensure matching. The original code did:
        // const cat = catData[activeCategory] ... items = cat.items
        // This is safer. I should accept the original logic pattern but applying the active map.

        const catData = data.menuCategories
        // activeCategory keys: "pollos", "costillasYPatas" matching JSON keys?
        // Let's check `menu.json` structure or inferred structure.
        // In original code: `const cat = catData[activeCategory]`
        // So yes, `activeCategory` matches JSON keys.

        const cat = catData[activeCategory as keyof typeof catData]
        if (cat) {
          items = cat.items.map((item) => ({
            ...item,
            category: cat.title,
            active: !inactiveNames.includes(item.name)
          }))
        }
      }
    } else {
      // "Todos" - use the mapped allItems
      // But `allItems` doesn't include beverages/mojos?
      // If "Todos" is selected, do we show beverages?
      // Original code `getAllItems()`:
      // Iterates `menuCategories` + `comboMeals`.
      // Usually "Todos" only shows food+combos, not drinks/mojos unless specified?
      // Taking a look at `getAllItems` again.
      // It seems `allItems` IS the "Todos" list.
      // So we just use `items` (which we already mapped at the top).
    }



    // Tag filter
    if (activeTag) {
      if (activeTag === "Combos") {
        // Combos from MenuData
        items = data.comboMeals.map((c) => ({
          name: c.name,
          description: c.description,
          price: c.price,
          image: c.image,
          category: "Ofertas",
          active: (c.active !== false) && !inactiveNames.includes(c.name)
        })).filter(item => item.active !== false)
      } else if (activeTag === "Asado") {
        items = items.filter(
          (i) => i.name.toLowerCase().includes("asado") || i.description.toLowerCase().includes("asado")
        )
      } else if (activeTag === "Favoritos") {
        items = items.filter(i => favorites.includes(i.name))
      } else if (activeTag === "Picante") {
        items = items.filter(i => i.spicy)
      } else if (activeTag === "Novedad") {
        // Just specific items or logic
        items = items.slice(0, 5)
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortOption !== "default") {
      items = [...items].sort((a, b) => {
        if (sortOption === "price-asc") {
          return parsePrice(a.price) - parsePrice(b.price)
        } else if (sortOption === "price-desc") {
          return parsePrice(b.price) - parsePrice(a.price)
        } else if (sortOption === "name-asc") {
          return a.name.localeCompare(b.name)
        } else if (sortOption === "name-desc") {
          return b.name.localeCompare(a.name)
        }
        return 0
      })
    }

    return items
  }, [allItems, activeCategory, activeTag, searchQuery, favorites, sortOption, inactiveNames])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key)
    setActiveTag(null)
    setCurrentPage(1)
  }

  const handleTagChange = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag)
    setActiveCategory("todos")
    setCurrentPage(1)
  }

  const openDetails = (item: BrowserMenuItem) => {
    setSelectedItem(item)
    setDetailsOpen(true)
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Search + Controls Bar */}
        <motion.div
          className="flex flex-col md:flex-row items-stretch md:items-center gap-8 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {/* Search Input - Left Side - Matches Sidebar Width */}
          <div className="relative flex-shrink-0 w-full lg:w-[350px] bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl p-4 shadow-sm flex items-center transition-all duration-300 hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:shadow-lg">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscando el producto..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-4 pr-10 py-2 bg-transparent text-foreground text-sm font-body focus:outline-none placeholder:text-muted-foreground"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Controls Container - Right Side */}
          <div className="flex-1 bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-body whitespace-nowrap order-2 md:order-1">
              Mostrando {filteredItems.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} de{" "}
              {filteredItems.length} resultados
            </p>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end order-1 md:order-2">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px] h-10 text-sm font-body bg-background">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Relevancia</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a menor</SelectItem>
                  <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex bg-background p-1 rounded-lg border border-border h-10 items-center">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-md transition-all h-8 w-8 flex items-center justify-center",
                    viewMode === "grid"
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Vista en cuadricula"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-md transition-all h-8 w-8 flex items-center justify-center",
                    viewMode === "list"
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Vista en lista"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - WIDER (w-80 or w-[350px]) */}
          <motion.aside
            className="w-full lg:w-[350px] flex-shrink-0 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Categories Container */}
            <div className="bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-sm" />
                {"Categorías"}
              </h3>
              <nav className="flex flex-col gap-2">
                {categoryLabels.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    className={cn(
                      "text-left px-4 py-3 text-base font-body rounded-lg transition-all flex items-center justify-between group",
                      activeCategory === cat.key
                        ? "bg-primary/5 text-primary font-semibold shadow-sm border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                    )}
                  >
                    <span>{cat.label}</span>
                    <ArrowRight className={cn("h-4 w-4 transition-transform", activeCategory === cat.key ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Popular Tags Container */}
            <div className="bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-sm" />
                Etiquetas Populares
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-full border transition-all shadow-sm",
                      activeTag === tag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-secondary/30"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Links */}
            <div className="bg-gradient-to-br from-card to-secondary/30 border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-sm" />
                Pide a Domicilio
              </h3>

              <div className="flex flex-col gap-5">
                <div className="group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors">Uber Eats</p>
                    <span className="text-[10px] sm:text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Recomendado</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body mb-3">
                    {"25-35 min  ·  Envio 2.99€"}
                  </p>
                  <a
                    href="https://www.ubereats.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    Pedir en Uber Eats
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="h-px bg-border/50" />

                <div className="group">
                  <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1">Glovo</p>
                  <p className="text-xs text-muted-foreground font-body mb-3">
                    {"20-30 min  ·  Envio 1.99€"}
                  </p>
                  <a
                    href="https://glovoapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#FFC244] text-black rounded-xl hover:bg-[#FFC244]/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    Pedir en Glovo
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Product Grid - Max 3 columns (lg:grid-cols-3) */}
          <div className="flex-1">
            {paginatedItems.length === 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="py-24 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-muted-foreground mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No encontramos resultados</h3>
                <p className="text-muted-foreground font-body max-w-xs mx-auto">
                  Intenta buscar con otros términos o selecciona otra categoría.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory("todos")
                    setActiveTag(null)
                  }}
                  className="mt-4 text-primary"
                >
                  Limpiar filtros
                </Button>
              </motion.div>
            ) : viewMode === "grid" ? (
              // Changed grid to max 3 cols
              <AnimatePresence mode="wait">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={staggerContainer}
                  key={currentPage + activeCategory + sortingKey(sortOption)}
                >
                  {paginatedItems.map((item, index) => (
                    <motion.div
                      key={`${item.name}-${index}`}
                      variants={fadeInUp}
                      layout
                    >
                      <ProductCard
                        item={item}
                        addToCart={addToCart}
                        cart={cart}
                        isFavorite={favorites.includes(item.name)}
                        toggleFavorite={() => toggleFavorite(item.name)}
                        onViewDetails={() => openDetails(item)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  className="flex flex-col gap-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={staggerContainer}
                  key={currentPage + activeCategory + sortingKey(sortOption)}
                >
                  {paginatedItems.map((item, index) => (
                    <motion.div
                      key={`${item.name}-${index}`}
                      variants={fadeInUp}
                      layout
                    >
                      <ProductListItem
                        item={item}
                        addToCart={addToCart}
                        cart={cart}
                        isFavorite={favorites.includes(item.name)}
                        toggleFavorite={() => toggleFavorite(item.name)}
                        onViewDetails={() => openDetails(item)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 rounded-xl flex items-center justify-center border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Pagina anterior"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "h-10 w-10 rounded-xl text-sm font-bold transition-all shadow-sm",
                      currentPage === i + 1
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-10 w-10 rounded-xl flex items-center justify-center border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Pagina siguiente"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        item={selectedItem}
        addToCart={addToCart}
      />
    </section>
  )
}
// Helper to force re-render on sort change, defined outside or inline
function sortingKey(opt: string) { return opt }

interface ProductProps {
  item: BrowserMenuItem
  addToCart: (item: MenuItem | CartItem) => void
  cart: Record<string, CartItem>
  isFavorite: boolean
  toggleFavorite: () => void
  onViewDetails: () => void
}

function ProductCard({ item, addToCart, cart, isFavorite, toggleFavorite, onViewDetails }: ProductProps) {
  const quantityInCart = useMemo(() => {
    return Object.values(cart)
      .filter(cartItem => cartItem.name === item.name)
      .reduce((total, cartItem) => total + cartItem.quantity, 0)
  }, [cart, item.name])

  const isInactive = item.active === false

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col h-full",
      isInactive && "opacity-75 grayscale"
    )}>
      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8 opacity-20" />
          </div>
        )}

        {isInactive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-10">
            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-12 border-2 border-white/20">
              No disponible
            </span>
          </div>
        )}

        {/* Floating Actions */}
        {!isInactive && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
              className="h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground shadow-sm transition-colors"
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
              className={cn(
                "h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors",
                isFavorite ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              title="Añadir a favoritos"
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={isInactive ? undefined : onViewDetails}>{item.name}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground font-body leading-relaxed mb-3 line-clamp-2">
            {item.description || "Deliciosa opción de nuestro menú."}
          </p>
        </div>

        <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
          <p className="text-sm font-bold text-foreground">{item.price}</p>

          <Button
            size="sm"
            onClick={() => {
              if (isInactive) return
              if (item.customizable) {
                onViewDetails()
              } else {
                addToCart(item)
              }
            }}
            variant={quantityInCart > 0 ? "secondary" : "default"}
            disabled={isInactive}
            className={cn(
              "w-full text-xs font-semibold rounded-md h-8 transition-all",
              isInactive
                ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                : quantityInCart > 0
                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isInactive ? (
              "Agotado"
            ) : quantityInCart > 0 ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center bg-green-600 text-white w-4 h-4 rounded-full text-[9px]">{quantityInCart}</span>
                  Añadir más al carrito +
                </span>
              </>
            ) : (
              <>
                <ShoppingCart className="mr-1.5 h-3 w-3" />
                Añadir al carrito
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductListItem({ item, addToCart, cart, isFavorite, toggleFavorite, onViewDetails }: ProductProps) {
  const quantityInCart = useMemo(() => {
    return Object.values(cart)
      .filter(cartItem => cartItem.name === item.name)
      .reduce((total, cartItem) => total + cartItem.quantity, 0)
  }, [cart, item.name])

  const isInactive = item.active === false

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border overflow-hidden flex gap-4 p-4 group hover:shadow-md transition-all",
      isInactive && "opacity-75 grayscale"
    )}>
      <div className="relative w-24 h-24 flex-shrink-0 bg-secondary rounded-lg overflow-hidden cursor-pointer" onClick={isInactive ? undefined : onViewDetails}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-5 w-5 opacity-30" />
          </div>
        )}
        {isInactive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-10">
            <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/20">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors cursor-pointer" onClick={isInactive ? undefined : onViewDetails}>{item.name}</h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed line-clamp-2 max-w-md">
              {item.description || "Deliciosa opción de nuestro menú."}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={onViewDetails} disabled={isInactive} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors disabled:opacity-50">
              <Eye className="h-4 w-4" />
            </button>
            <button onClick={toggleFavorite} disabled={isInactive} className={cn("p-1.5 rounded-full transition-colors disabled:opacity-50", isFavorite ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-base font-bold text-foreground italic">{item.price}</p>
          <Button
            size="sm"
            onClick={() => {
              if (isInactive) return
              if (item.customizable) {
                onViewDetails()
              } else {
                addToCart(item)
              }
            }}
            variant={quantityInCart > 0 ? "secondary" : "default"}
            disabled={isInactive}
            className={cn(
              "text-xs font-semibold rounded-md h-8 transition-all min-w-[100px]",
              isInactive
                ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                : quantityInCart > 0
                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isInactive ? (
              "Agotado"
            ) : quantityInCart > 0 ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center bg-green-600 text-white w-4 h-4 rounded-full text-[9px]">{quantityInCart}</span>
                  Añadir más al carrito +
                </span>
              </>
            ) : (
              <>
                <ShoppingCart className="mr-1.5 h-3 w-3" />
                Añadir al carrito
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
