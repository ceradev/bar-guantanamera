"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import menuData from "@/data/menu.json"
import { staggerContainer, fadeInUp, scaleIn } from "../menu/animations"

interface MenuItem {
  name: string
  description: string
  price: string
  image: string
  popular?: boolean
  iconic?: boolean
}

function getPopularItems(): MenuItem[] {
  const allItems: MenuItem[] = []
  const categories = menuData.menuCategories as Record<string, { items: MenuItem[] }>
  Object.values(categories).forEach((cat) => {
    cat.items.forEach((item) => {
      if (item.popular) allItems.push(item)
    })
  })
  return allItems.slice(0, 4)
}

export default function PopularDishes() {
  const popular = getPopularItems()

  return (
    <section id="platos" className="py-20 bg-background scroll-mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.p
            className="text-sm font-semibold text-primary uppercase tracking-wider mb-2"
            variants={fadeInUp}
          >
            FAVORITOS DE LOS CLIENTES
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground text-balance"
            variants={fadeInUp}
          >
            Opciones Populares
          </motion.h2>
          <motion.div
            className="w-40 h-0.5 bg-primary mx-auto mt-4"
            variants={fadeInUp}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {popular.map((item) => (
            <motion.div key={item.name} variants={scaleIn} className="h-full">
              <Link
                href="/menu"
                className="group flex flex-col h-full items-center text-center border border-card rounded-xl shadow-sm pb-4"
              >
                <div className="relative w-full aspect-square rounded-t-xl overflow-hidden mb-4 bg-secondary">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base mb-1 px-2">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed mb-2 line-clamp-2 px-2 flex-grow">
                  {item.description}
                </p>
                <p className="text-base font-bold text-primary">{item.price}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/menu"
            className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80 hover:underline-offset-8 transition-all duration-300"
          >
            VER EL MENU COMPLETO
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
