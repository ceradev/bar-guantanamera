"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, scaleIn } from "../menu/animations"

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#D94A12] bg-[radial-gradient(ellipse_at_80%_45%,_#ea5516_0%,_#D94A12_50%,_#c73e0a_100%)] text-white min-h-[85vh] lg:min-h-[88vh] flex items-center">
      {/* Decorative ambient lighting overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

          {/* Left Column: Copy & Actions */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start text-left z-20"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Status Pill Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/30 bg-black/15 backdrop-blur-md text-white text-xs sm:text-sm font-heading font-semibold tracking-wider uppercase mb-6 sm:mb-8 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#C93420] ring-4 ring-white/20 animate-pulse" />
              <span>ABIERTO · DE 9:00 A 18:00</span>
            </motion.div>

            {/* Main Headline - League Spartan */}
            <motion.h1
              variants={fadeInUp}
              className="font-heading font-black text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] tracking-tight uppercase leading-[0.88] mb-5 sm:mb-6 select-none"
            >
              <span className="block">EL POLLO</span>
              <span className="block">QUE MUEVE</span>
              <span className="block">SAN ISIDRO</span>
            </motion.h1>

            {/* Subtitle - Inter */}
            <motion.p
              variants={fadeInUp}
              className="text-white/95 text-lg sm:text-xl md:text-2xl font-body font-normal max-w-xl mb-8 sm:mb-10 leading-snug"
            >
              Recién hecho. Listo para recoger.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-5 sm:gap-8"
            >
              <Link
                href="/encargar"
                className="inline-flex items-center justify-center bg-white text-[#D94A12] hover:bg-[#F4E2CE] hover:text-[#3A2720] transition-all duration-300 font-heading font-black text-sm sm:text-base uppercase tracking-wider rounded-xl px-7 sm:px-9 py-4 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                PEDIR PARA RECOGER
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center font-heading font-bold text-white text-sm sm:text-base uppercase tracking-wider underline underline-offset-8 decoration-2 decoration-white/70 hover:decoration-white hover:text-white transition-all py-3 px-1"
              >
                VER LA CARTA
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Rotisserie Chicken, Orbit & Stamp */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[360px] sm:min-h-[460px] lg:min-h-[580px]">
            {/* Rotating Orbit Behind Chicken */}
            <div className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] lg:w-[540px] lg:h-[540px] rounded-full border-2 sm:border-4 border-dashed border-white/30 pointer-events-none animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] rounded-full border border-white/15 pointer-events-none animate-[spin_45s_linear_infinite_reverse]" />

            {/* "EL NUEVO GIRO" Circular Stamp Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: -12 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="absolute top-2 left-2 sm:top-6 sm:left-4 lg:-left-4 z-30 select-none cursor-default group"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center p-2 border-2 border-dashed border-[#C93420] ring-4 ring-white/90 transform group-hover:rotate-6 transition-transform duration-300">
                <span className="font-heading font-black text-[#C93420] text-[10px] sm:text-xs tracking-widest uppercase leading-none">
                  EL NUEVO
                </span>
                <span className="font-heading font-black text-[#C93420] text-xl sm:text-2xl md:text-3xl tracking-tight uppercase leading-none mt-0.5">
                  GIRO
                </span>
              </div>
            </motion.div>

            {/* Rotisserie Chicken on Spit */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-20 w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[620px] lg:translate-x-10 xl:translate-x-16"
            >
              <Image
                src="/images/maintenance/guantanamera-hero-chicken.webp"
                alt="El pollo que mueve San Isidro - Bar Cafetería Guantanamera"
                width={760}
                height={676}
                priority
                className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(40,15,5,0.45)] select-none hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

