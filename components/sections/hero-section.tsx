"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, Phone } from "lucide-react"
import Image from "next/image"
import { motion, easeOut } from "framer-motion"
import { Wave } from "@/components/ui/wave";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
    },
  },
}

export default function HeroSection() {
  return (
    <motion.div
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-image.jpg"
          alt="Plato de pollo asado y costillas - Especialidad Guantanamera"
          fill
          priority
          className="object-cover"
          quality={90}
        />
        {/* Dark Overlay - similar to reference image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
        {/* Warm fire-like glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-red-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Main Content Container - Centered */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge - 23 AÑOS A SU SERVICIO */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg"
            variants={itemVariants}
          >
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-white text-xs md:text-sm font-semibold tracking-wide">
              23 AÑOS A SU SERVICIO
            </span>
          </motion.div>

          {/* Main Title - Large and centered */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-tight tracking-tight"
            variants={itemVariants}
          >
            <span className="block">SABORES</span>
            <span className="block text-red-600">AUTÉNTICOS</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-light"
            variants={itemVariants}
          >
            Crujiente por fuera, jugoso por dentro. Especialidad en pollos, costillas y patas asadas con la{" "}
            <span className="text-red-600 font-semibold">receta casera</span> que nos define.
          </motion.p>

          {/* CTA Button - Red primary color */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-16"
            variants={itemVariants}
          >
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-500/50 transition-all duration-300 rounded-lg px-8 py-6 text-base md:text-lg font-semibold group"
            >
              <a href="#menu">
                Ver el Menú
                <ArrowDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-200" />
              </a>
            </Button>

            {/* Separador "O" */}
            <span className="text-white/70 text-lg md:text-xl font-semibold px-2">
              O
            </span>

            {/* Secondary Button - Phone */}
            <Button
              size="lg"
              asChild
              variant="outline"
              className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-white/5 backdrop-blur-md rounded-lg px-8 py-6 text-base md:text-lg font-semibold group transition-all duration-300"
            >
              <a href="tel:922173039">
                <Phone className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Llamar Ahora
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <Wave position="bottom" />
    </motion.div>
  )
}
