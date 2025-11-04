"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Star, Wheat, Milk, Egg, Fish, Nut, Bean } from "lucide-react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef, useState, useMemo, useCallback, memo } from "react"
import menuData from "@/data/menu-data.json"
import type { MenuData, MenuItem } from "@/types/menu"
// import GlobalSearch from "./global-search"

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
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
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
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 15
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
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

const tabsVariants = {
  hidden: { 
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
    },
  },
}

export default function MenuSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState("pollos")

  const handleDownloadMenu = useCallback(() => {
    const link = document.createElement("a")
    link.href = "/docs/menu-guantanamera.pdf"
    link.download = "Menu-Guantanamera.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const renderAllergenIcons = useCallback((allergens: string[]) => {
    return allergens.map((allergen) => {
      const IconComponent = allergenIcons[allergen as keyof typeof allergenIcons]
      return (
        <div
          key={allergen}
          className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full"
          title={`Contiene ${allergen}`}
        >
          <IconComponent className="w-3 h-3 text-orange-600" />
        </div>
      )
    })
  }, [])

  const renderMenuItem = useCallback((item: MenuItem, index: number) => (
    <motion.div key={item.name} variants={itemVariants}>
      <Card className="group overflow-hidden rounded-2xl border-0 bg-white shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full">
        <CardHeader className="p-0 relative">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="transition-transform duration-700 group-hover:scale-110 object-cover"
            />
            {item.popular && (
              <Badge className="absolute top-4 right-4 bg-red-600 text-white shadow-lg border-0 px-3 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Popular
              </Badge>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-bold text-black leading-tight group-hover:text-red-600 transition-colors duration-200">
              {item.name}
            </h4>
            <span className="text-2xl font-bold text-red-600 ml-3">{item.price}</span>
          </div>
          <p className="text-gray-600 text-sm mb-4 flex-grow leading-relaxed">{item.description}</p>



          {/* Enhanced Allergens */}
          {item.allergens.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Alérgenos:</span>
              <div className="flex gap-2">{renderAllergenIcons(item.allergens)}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  ), [renderAllergenIcons])

  return (
    <motion.section 
      id="menu" 
      className="w-full scroll-mt-16 bg-white py-20 md:py-28 relative overflow-hidden" 
      ref={ref}
      variants={revealVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Subtle transition overlay effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      
      {/* Subtle wave transition effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        initial={{ y: -30, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: -30, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      
      {/* Subtle entrance overlay */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 1 }}
        animate={isInView ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      />
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <motion.div
          className="mb-16 text-center"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="text-red-600 text-sm font-medium tracking-wide">NUESTRA ESPECIALIDAD</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">
            Carta <span className="text-red-600">Guantanamera</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
            Descubre nuestras especialidades preparadas con ingredientes frescos y recetas caseras, con la mejor calidad
            posible, y con el mejor servicio.
          </p>

          <motion.div
            className="mt-8"
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Button
              onClick={handleDownloadMenu}
              className="bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-full group"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Descargar Carta Completa
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Menu Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            variants={tabsVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mb-12"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-50 border-0 rounded-2xl p-2 h-auto shadow-sm">
              <TabsTrigger
                value="pollos"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <span className="mr-2 text-lg">🍗</span>
                <span className="hidden sm:inline">Pollos Asados</span>
                <span className="sm:hidden">Pollos</span>
              </TabsTrigger>
              <TabsTrigger
                value="costillasYPatas"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <span className="mr-2 text-lg">🥩</span>
                <span className="hidden sm:inline">Costillas y Patas</span>
                <span className="sm:hidden">Costillas</span>
              </TabsTrigger>
              <TabsTrigger
                value="guarniciones"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <span className="mr-2 text-lg">🥗</span>
                <span className="hidden sm:inline">Guarniciones</span>
                <span className="sm:hidden">Guarniciones</span>
              </TabsTrigger>
              <TabsTrigger
                value="quesadillasYBurritos"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <span className="mr-2 text-lg">🌯</span>
                <span className="hidden sm:inline">Quesadillas</span>
                <span className="sm:hidden">Mexicano</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {Object.entries(menuCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <motion.div variants={containerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                <motion.div variants={headerVariants} className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-black mb-3">{category.title}</h3>
                  <div className="w-16 h-1 bg-red-600 mx-auto mb-4 rounded-full"></div>
                  <p className="text-gray-600 text-lg italic max-w-2xl mx-auto">{category.subtitle}</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.items.map((item, index) => renderMenuItem(item, index))}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Enhanced Combo Meals Section */}
        <motion.div
          className="mt-20 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-3xl p-10 shadow-lg border border-red-100 max-w-6xl mx-auto">
            <motion.div variants={headerVariants} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm">
              <span className="text-2xl">🍽️</span>
              <span className="text-red-600 font-semibold">OFERTAS</span>
            </motion.div>
            <motion.h3 variants={itemVariants} className="text-3xl font-bold text-black mb-8">Ofertas Especiales para nuestros clientes</motion.h3>
            <div className="grid md:grid-cols-3 gap-8">
              {comboMeals.map((combo, index) => (
                <motion.div 
                  key={combo.name} 
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                    <span className="text-2xl">{combo.icon}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 text-xl">{combo.name}</h4>
                  <p className="text-gray-600 mb-4">{combo.description}</p>
                  <span className="text-3xl font-bold text-red-600">{combo.price}</span>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Allergen Legend */}
            <div className="mt-10 pt-8 border-t border-red-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-6">Información de Alérgenos</h4>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <Wheat className="w-4 h-4 text-orange-600" />
                  <span>Gluten</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <Milk className="w-4 h-4 text-orange-600" />
                  <span>Lácteos</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <Egg className="w-4 h-4 text-orange-600" />
                  <span>Huevos</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <Nut className="w-4 h-4 text-orange-600" />
                  <span>Frutos Secos</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                  <Bean className="w-4 h-4 text-orange-600" />
                  <span>Soja</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 italic leading-relaxed">
                  * Todos los precios incluyen IGIC. Consulta disponibilidad de platos del día.
                  <br />
                  ** Si tienes alguna alergia alimentaria, por favor informa a nuestro personal.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Mojos and Beverages Section */}
        <motion.div
          className="mt-16 space-y-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Mojos */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <motion.div variants={headerVariants} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-4">
                <span className="text-2xl">🥄</span>
                <span className="text-red-600 font-semibold">MOJOS CASEROS</span>
              </div>
              <h3 className="text-2xl font-bold text-black">Salsas Tradicionales</h3>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-4">
              {bebidasYMojos.mojos.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-800 text-lg">{item.name}</h5>
                    <span className="text-xl font-bold text-red-600">{item.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                </motion.div>
              ))}
            </div>
          </div>

          {/* Beverages */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-4">
                <span className="text-2xl">🍺</span>
                <span className="text-red-600 font-semibold">BEBIDAS</span>
              </div>
              <h3 className="text-2xl font-bold text-black">Selección de Bebidas</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bebidasYMojos.bebidas.map((item) => (
                <div
                  key={item.name}
                  className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-800">{item.name}</h5>
                    <span className="text-lg font-bold text-red-600">{item.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    {item.allergens.length > 0 && (
                      <div className="flex gap-1">{renderAllergenIcons(item.allergens)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
