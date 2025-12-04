"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, X, Star, Wheat, Milk, Egg, Fish, Nut, Bean } from "lucide-react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useMemo, useCallback } from "react"
import menuData from "@/data/menu-data.json"
import type { MenuData, MenuItem } from "@/types/menu"

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

// Destructure data from imported JSON
const { menuCategories, bebidasYMojos, comboMeals } = menuData as MenuData

const revealVariants = {
  hidden: { 
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const headerVariants = {
  hidden: { 
    opacity: 0,
    y: -15
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function MenuSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState("pollos")
  const [showFullMenu, setShowFullMenu] = useState(false)
  const items: never[] = []

  const handleViewFullMenu = useCallback(() => {
    setShowFullMenu(true)
    // Scroll suave hacia la sección del menú
    setTimeout(() => {
      const menuSection = document.getElementById("menu")
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }, [])

  const handleCloseFullMenu = useCallback(() => {
    setShowFullMenu(false)
    setActiveTab("pollos")
  }, [])

  const handleViewPDF = useCallback(() => {
    window.open("/docs/menu-guantanamera.pdf", "_blank", "noopener,noreferrer")
  }, [])

  const renderAllergenIcons = useCallback((allergens: string[]) => {
    return allergens.map((allergen) => {
      const IconComponent = allergenIcons[allergen as keyof typeof allergenIcons]
      return (
        <div
          key={allergen}
          className="flex items-center justify-center w-5 h-5 bg-red-100 rounded-full"
          title={`Contiene ${allergen}`}
        >
          <IconComponent className="w-3 h-3 text-red-600" />
        </div>
      )
    })
  }, [])

  // Separate beverages that are combined with "|"
  const separatedBeverages = useMemo(() => {
    const separated: Array<{
      name: string
      description: string
      price: string
      allergens: string[]
    }> = []

    bebidasYMojos.bebidas.forEach((beverage) => {
      if (beverage.name.includes("|")) {
        // Extract size from name (e.g., "(33cl)", "(1,5L)", "(50cl)")
        const sizeRegex = /\([^)]+\)/
        const sizeMatch = sizeRegex.exec(beverage.name)
        const size = sizeMatch ? sizeMatch[0] : ""
        
        // Split by "|" and clean each option
        const options = beverage.name.split("|").map((opt) => opt.trim())
        
        // Create separate items for each option
        options.forEach((option) => {
          // Remove size from option if it's duplicated
          let cleanName = option.replaceAll(/\([^)]+\)/g, "").trim()
          // Add size at the end
          cleanName = size ? `${cleanName} ${size}` : cleanName
          
          separated.push({
            name: cleanName,
            description: beverage.description,
            price: beverage.price,
            allergens: beverage.allergens || [],
          })
        })
      } else {
        // Keep beverage as is
        separated.push({
          name: beverage.name,
          description: beverage.description || "",
          price: beverage.price,
          allergens: beverage.allergens || [],
        })
      }
    })

    return separated
  }, [])

  // Render decorative separator
  const renderSeparator = () => (
    <div className="flex items-center justify-center gap-2 my-8">
      <div className="h-px bg-red-600/40 w-12"></div>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-red-600/60 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-red-600/60 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-red-600/60 rounded-full"></div>
      </div>
      <div className="h-px bg-red-600/40 flex-1 max-w-12"></div>
    </div>
  )

  // Render menu item as card with background image
  const renderMenuItem = useCallback((item: MenuItem, index: number) => {
    return (
      <motion.div 
        key={item.name} 
        variants={itemVariants}
        className="relative h-48 md:h-56 rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-between p-5 md:p-6">
          {/* Top Section: Title and Popular Badge */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-white text-lg md:text-xl font-bold leading-tight drop-shadow-lg flex-1">
              {item.name}
            </h4>
            {item.popular && (
              <Badge className="bg-red-600 text-white border-0 rounded-lg text-xs md:text-sm px-3 py-1 shadow-lg flex-shrink-0">
                <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 fill-current" />
                Popular
              </Badge>
            )}
          </div>

          {/* Bottom Section: Price */}
          <div className="flex items-center justify-end">
            <span className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
              {item.price}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }, [renderAllergenIcons])

  return (
    <motion.section 
      id="menu" 
      className="w-full scroll-mt-16 bg-white py-20 md:py-28 relative overflow-hidden" 
      ref={ref}
      variants={revealVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="bg-red-50/50 border border-red-100 rounded-full inline-flex items-center gap-2 px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-red-600 text-sm uppercase tracking-[0.2em] font-light">
              Nuestra Especialidad
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 tracking-tight">
            Carta <span className="text-red-600">Guantanamera</span>
          </h2>
                    
          <p className="mx-auto max-w-2xl text-gray-600 leading-relaxed text-base md:text-lg">
            Descubre nuestras especialidades preparadas con ingredientes frescos y recetas caseras
          </p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {showFullMenu ? (
              <Button
                onClick={handleCloseFullMenu}
                className="bg-red-600 text-white hover:bg-red-700 transition-all duration-300 px-8 py-3 rounded-lg"
                size="lg"
              >
                <X className="mr-2 h-5 w-5" />
                Ver por Categorías
              </Button>
            ) : (
              <Button
                onClick={handleViewFullMenu}
                className="bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-50 transition-all duration-300 px-8 py-3 rounded-lg"
                size="lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                Ver Carta Completa
              </Button>
            )}
            
            {/* Separador "O" */}
            <span className="text-gray-500 text-lg md:text-xl font-semibold px-2">
              O
            </span>
            
            <Button
              onClick={handleViewPDF}
              className="bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 px-8 py-3 rounded-lg"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Ver en PDF
            </Button>
          </motion.div>
        </motion.div>

        {/* Menu Categories Tabs */}
        {showFullMenu ? (
          /* Full Menu View - All Categories */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {Object.entries(menuCategories).map(([key, category]) => (
              <motion.div
                key={key}
                variants={containerVariants}
                className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12"
              >
                {/* Category Header */}
                <motion.div 
                  variants={headerVariants}
                  className="text-center mb-12"
                >
                  <h3 className="text-black text-2xl md:text-3xl font-bold mb-2">
                    {category.title}
                  </h3>
                  <div className="h-1 bg-red-600 w-24 mx-auto mb-4 rounded-full"></div>
                  <p className="text-gray-600 text-base md:text-lg italic max-w-2xl mx-auto">
                    {category.subtitle}
                  </p>
                </motion.div>

                {/* Menu Items Grid - Cards Layout */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {category.items.map((item, index) => renderMenuItem(item, index))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              variants={headerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="mb-12"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-50 border border-gray-200 rounded-lg p-1 h-auto gap-2">
                <TabsTrigger
                  value="pollos"
                  className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:border-red-600 border border-transparent rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-300 hover:bg-gray-100 text-gray-700"
                >
                  <span className="mr-2">🍗</span>
                  <span className="hidden sm:inline">Pollos</span>
                  <span className="sm:hidden">Pollos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="costillasYPatas"
                  className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:border-red-600 border border-transparent rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-300 hover:bg-gray-100 text-gray-700"
                >
                  <span className="mr-2">🥩</span>
                  <span className="hidden sm:inline">Costillas</span>
                  <span className="sm:hidden">Costillas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="guarniciones"
                  className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:border-red-600 border border-transparent rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-300 hover:bg-gray-100 text-gray-700"
                >
                  <span className="mr-2">🥗</span>
                  <span className="hidden sm:inline">Guarniciones</span>
                  <span className="sm:hidden">Guarniciones</span>
                </TabsTrigger>
                <TabsTrigger
                  value="quesadillasYBurritos"
                  className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:border-red-600 border border-transparent rounded-lg py-3 px-4 text-sm font-semibold transition-all duration-300 hover:bg-gray-100 text-gray-700"
                >
                  <span className="mr-2">🌯</span>
                  <span className="hidden sm:inline">Mexicano</span>
                  <span className="sm:hidden">Mexicano</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Tab Content */}
            {Object.entries(menuCategories).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <motion.div 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate={isInView ? "visible" : "hidden"}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12"
                >
                  {/* Category Header */}
                  <motion.div 
                    variants={headerVariants}
                    className="text-center mb-12"
                  >
                    <h3 className="text-black text-2xl md:text-3xl font-bold mb-2">
                      {category.title}
                    </h3>
                    <div className="h-1 bg-red-600 w-24 mx-auto mb-4 rounded-full"></div>
                    <p className="text-gray-600 text-base md:text-lg italic max-w-2xl mx-auto">
                      {category.subtitle}
                    </p>
                  </motion.div>

                  {/* Menu Items Grid - Cards Layout */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {category.items.map((item, index) => renderMenuItem(item, index))}
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Mojos and Beverages */}
        <motion.div
          className="mt-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Combo Meals and Mojos */}
            <div className="space-y-6 md:space-y-8">
              {/* Combo Meals */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12">
                <motion.div 
                  variants={headerVariants}
                  className="text-center mb-8"
                >
                  <p className="text-red-600 text-sm uppercase tracking-[0.2em] mb-4 font-semibold">
                    Platos Combinados
                  </p>
                  {renderSeparator()}
                </motion.div>

                <div className="space-y-4">
                  {comboMeals.map((combo, index) => (
                    <motion.div
                      key={combo.name}
                      variants={itemVariants}
                      className="bg-white border border-gray-200 rounded-xl p-5 text-center"
                    >
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-2xl">{combo.icon}</span>
                        <h4 className="font-bold text-black text-lg">{combo.name}</h4>
                      </div>
                      <p className="text-gray-600 mb-3 text-sm leading-relaxed">{combo.description}</p>
                      <span className="text-red-600 text-xl font-bold">{combo.price}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mojos */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12">
                <motion.div 
                  variants={headerVariants}
                  className="text-center mb-8"
                >
                  <p className="text-red-600 text-sm uppercase tracking-[0.2em] mb-4 font-semibold">
                    Mojos Caseros
                  </p>
                  {renderSeparator()}
                </motion.div>
                
                <div className="space-y-0">
                  {bebidasYMojos.mojos.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      className="flex items-center justify-between gap-4 py-4 border-b border-gray-200 last:border-b-0"
                    >
                      <h5 className="font-semibold text-black text-base flex-1">{item.name}</h5>
                      <span className="text-red-600 font-bold whitespace-nowrap flex-shrink-0">
                        {item.price}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Beverages - Right Column */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12">
              <motion.div 
                variants={headerVariants}
                className="text-center mb-8"
              >
                <p className="text-red-600 text-sm uppercase tracking-[0.2em] mb-4 font-semibold">
                  Bebidas
                </p>
                {renderSeparator()}
              </motion.div>
              
              <div className="space-y-0">
                {separatedBeverages.map((item, index) => (
                  <motion.div
                    key={`${item.name}-${index}`}
                    variants={itemVariants}
                    className="flex items-center justify-between gap-4 py-4 border-b border-gray-200 last:border-b-0"
                  >
                    <h5 className="font-semibold text-black text-base flex-1">{item.name}</h5>
                    <span className="text-red-600 font-bold whitespace-nowrap flex-shrink-0">
                      {item.price}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          className="mt-12 text-center text-gray-500 text-sm"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <p className="italic">
            * Todos los precios incluyen IGIC. Consulta disponibilidad de platos del día.
          </p>
          <p className="italic mt-2">
            ** Si tienes alguna alergia alimentaria, por favor informa a nuestro personal.
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
