"use client"

import { motion } from "framer-motion"
import { Mojo } from "@/types/menu"
import { staggerContainer, fadeInUp } from "./animations"

interface MojosSectionProps {
  items: Mojo[]
}

export const MojosSection = ({ items }: MojosSectionProps) => {
  return (
    <motion.div variants={staggerContainer} className="h-full">
      <motion.div 
        variants={fadeInUp as any}
        className="bg-card rounded-2xl shadow-sm border border-border p-8 md:p-10 h-full w-full"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            Mojos y Salsas
          </h3>
          <div className="w-16 h-1.5 bg-primary rounded-full" />
        </div>

        {/* List */}
        <div className="flex flex-col space-y-0">
          {items.map((mojo) => (
            <div 
              key={mojo.name} 
              className="flex justify-between items-center py-4 border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors px-2 -mx-2 rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <span className="text-foreground font-medium text-base group-hover:text-primary transition-colors">
                  {mojo.name}
                </span>
                {mojo.spicy && (
                  <span className="text-[10px] text-destructive border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                    Picante
                  </span>
                )}
              </div>
              <span className="text-primary font-bold text-base">{mojo.price}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
