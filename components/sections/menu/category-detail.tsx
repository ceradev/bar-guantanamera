"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, Flame, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import menuData from "@/data/menu.json"
import { MenuData } from "@/types/menu"
import { expandVariants, fadeInUp } from "./animations"

const { menuCategories } = menuData as MenuData

interface CategoryDetailProps {
  activeCategory: string | null
  onClose: () => void
}

export const CategoryDetail = ({ 
  activeCategory, 
  onClose 
}: CategoryDetailProps) => (
  <AnimatePresence mode="wait">
    {activeCategory && (
      <motion.div
        key={activeCategory}
        variants={expandVariants as any}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-secondary/30 rounded-3xl p-6 md:p-10 border border-border shadow-inner"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {menuCategories[activeCategory].title}
            </h3>
            <p className="text-muted-foreground font-body">
              {menuCategories[activeCategory].subtitle}
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="hover:bg-secondary rounded-full p-2 h-auto"
            aria-label="Cerrar categoría"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuCategories[activeCategory].items.map((item) => (
            <motion.div
              key={item.name}
              variants={fadeInUp as any}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-border transition-shadow duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {item.popular && (
                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-500 border-0 flex gap-1 items-center">
                      <Star className="w-3 h-3 fill-amber-950" /> Popular
                    </Badge>
                  )}
                  {item.spicy && (
                    <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0 flex gap-1 items-center">
                      <Flame className="w-3 h-3" /> Picante
                    </Badge>
                  )}
                  {item.vegetarian && (
                    <Badge className="bg-green-600 text-white hover:bg-green-700 border-0 flex gap-1 items-center">
                      <Leaf className="w-3 h-3" /> Veggie
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className="font-bold text-foreground text-lg leading-tight">
                    {item.name}
                  </h4>
                  <span className="font-bold text-primary text-lg whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                {item.description && (
                  <p className="text-muted-foreground font-body text-sm mt-2">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
