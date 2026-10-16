"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Beverage } from "@/types/menu"
import { staggerContainer, fadeInUp } from "./animations"

interface DrinksSectionProps {
  beverages: Beverage[]
}

export const DrinksSection = ({ beverages }: DrinksSectionProps) => {
  const beveragesByCategory = useMemo(() => {
    const groups: Record<string, Beverage[]> = {
      refrescos: [],
      cervezas: [],
      agua: []
    }

    beverages.forEach((drink) => {
      if (drink.category && groups[drink.category]) {
        groups[drink.category].push(drink)
      } else {
        // Fallback for uncategorized
        if (!groups['refrescos']) groups['refrescos'] = []
        groups['refrescos'].push(drink)
      }
    })

    return groups
  }, [beverages])

  return (
    <motion.div variants={staggerContainer} className="h-full">
      <motion.div 
        variants={fadeInUp as any}
        className="bg-card rounded-2xl shadow-sm border border-border p-8 md:p-10 h-full w-full"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            Bebidas
          </h3>
          <div className="w-16 h-1.5 bg-primary rounded-full" />
        </div>

        <Tabs defaultValue="refrescos" className="w-full">
          <TabsList className="flex flex-wrap h-auto bg-secondary/40 rounded-full p-1 mb-6 md:mb-8 justify-center gap-1 w-fit mx-auto border border-border">
            <TabsTrigger
              value="refrescos"
              className="rounded-full px-3 py-1 md:px-5 md:py-1.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground"
            >
              Refrescos
            </TabsTrigger>
            <TabsTrigger
              value="cervezas"
              className="rounded-full px-3 py-1 md:px-5 md:py-1.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground"
            >
              Cervezas
            </TabsTrigger>
            <TabsTrigger
              value="agua"
              className="rounded-full px-3 py-1 md:px-5 md:py-1.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground"
            >
              Agua
            </TabsTrigger>
          </TabsList>

          {Object.entries(beveragesByCategory).map(([category, drinks]) => (
            <TabsContent key={category} value={category} className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                {drinks.map((drink) => (
                  <div 
                    key={drink.name}
                    className="flex justify-between items-center py-3 border-b border-border/60 hover:bg-secondary/40 transition-colors px-2 rounded-lg group"
                  >
                    <span className="text-foreground font-medium text-sm md:text-base group-hover:text-primary transition-colors">
                      {drink.name}
                    </span>
                    <span className="text-primary font-bold text-sm md:text-base whitespace-nowrap ml-4">
                      {drink.price}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
