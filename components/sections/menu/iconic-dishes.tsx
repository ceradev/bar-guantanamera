"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MenuItem } from "@/types/menu"
import { fadeInUp, staggerContainer } from "./animations"

interface IconicDishesProps {
  items: MenuItem[]
}

export const IconicDishes = ({ items }: IconicDishesProps) => (
  <motion.div variants={staggerContainer} className="mb-20">
    <motion.div 
      variants={fadeInUp as any}
      className="flex flex-col items-center mb-8"
    >
      <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
        Platos Icónicos
      </h3>
      <div className="w-16 h-1 bg-primary rounded-full" />
    </motion.div>

    <div className="grid md:grid-cols-3 gap-6">
      {items.map((item) => (
        <motion.div
          key={item.name}
          variants={fadeInUp as any}
          className="group relative h-56 md:h-72 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h4 className="text-xl font-bold mb-1 leading-tight">{item.name}</h4>
            <p className="text-primary font-bold text-lg">{item.price}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)
