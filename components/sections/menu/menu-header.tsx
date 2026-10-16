"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { fadeInUp } from "./animations"
import { ForkKnife } from "lucide-react"

export const MenuHeader = () => (
  <motion.div
    variants={fadeInUp as any}
    className="text-center mb-16"
  >
    <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground mb-4 px-4 py-1 text-sm uppercase tracking-wider">
      <ForkKnife className="inline-block mr-2 w-4 h-4" />
      Nuestra Especialidad
    </Badge>
    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight mt-2">
      Carta <span className="text-primary">Guantanamera</span>
    </h2>
    <p className="text-muted-foreground font-body max-w-xl mx-auto text-lg mb-8">
      Disfruta de una experiencia gastronómica única, desde nuestros clásicos hasta nuevas creaciones.
    </p>
  </motion.div>
)
