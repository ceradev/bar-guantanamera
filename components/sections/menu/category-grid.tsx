"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import menuData from "@/data/menu.json"
import { MenuData } from "@/types/menu"
import { staggerContainer, fadeInUp, scaleIn } from "./animations"

const { menuCategories } = menuData as MenuData

interface CategoryImageMap {
  [key: string]: string
}

const categoryImages: CategoryImageMap = {
  pollos: "/images/menu/roast-chickens/pollo-asado-entero.png",
  costillasYPatas: "/images/menu/ribs-and-legs/costilla-asada-entera.png",
  guarniciones: "/images/menu/side-dishes/papas-fritas.png",
  quesadillasYBurritos: "/images/menu/quesadillas-and-burritos/burritos-de-pollo.png",
}

interface CategoryGridProps {
  activeCategory: string | null
  onCategoryClick: (key: string) => void
}

export const CategoryGrid = ({
  activeCategory,
  onCategoryClick
}: CategoryGridProps) => (
  <motion.div variants={staggerContainer} className="mb-12">
    <motion.div 
      variants={fadeInUp as any}
      className="flex flex-col items-center mb-8"
    >
      <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
        Explora por Categorías
      </h3>
      <div className="w-16 h-1 bg-primary rounded-full" />
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(menuCategories).map(([key, category]) => (
        <motion.div
          key={key}
          variants={scaleIn}
          onClick={() => onCategoryClick(key)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onCategoryClick(key)
            }
          }}
          className={`
            relative h-48 md:h-64 rounded-xl overflow-hidden cursor-pointer group border-2 transition-all duration-300 outline-none
            ${activeCategory === key ? 'border-primary ring-4 ring-primary/20 scale-[1.02]' : 'border-transparent hover:border-primary/40'}
          `}
        >
          <Image
            src={categoryImages[key] || "/placeholder.jpg"}
            alt={category.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className={`absolute inset-0 transition-colors duration-300 ${activeCategory === key ? 'bg-black/60' : 'bg-black/40 group-hover:bg-black/50'}`} />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h4 className="text-white text-2xl font-bold mb-2 drop-shadow-md">
              {category.title}
            </h4>
            <span className={`
              text-sm font-medium px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30
              group-hover:bg-primary group-hover:border-primary transition-colors duration-300 flex items-center gap-2
            `}>
              Ver platos <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)
