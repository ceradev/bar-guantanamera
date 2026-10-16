"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { newsItems } from "@/types/news"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, fadeInUp } from "../menu/animations"

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

export default function RecentNews() {
  const [startIndex, setStartIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 3)
    }

    updateItemsPerPage()
    window.addEventListener("resize", updateItemsPerPage)
    return () => window.removeEventListener("resize", updateItemsPerPage)
  }, [])

  const getVisibleItems = () => {
    const items = []
    for (let i = 0; i < itemsPerPage; i++) {
      const index = (startIndex + i) % newsItems.length
      items.push({ ...newsItems[index], displayIndex: i })
    }
    return items
  }

  const visibleItems = getVisibleItems()
  const canNavigate = newsItems.length > itemsPerPage

  const handleNext = () => {
    setDirection(1)
    setStartIndex((prev) => (prev + 1) % newsItems.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setStartIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length)
  }

  return (
    <section id="novedades" className="py-20 bg-background scroll-mt-24">
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
            DESDE NUESTRA COCINA
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground text-balance"
            variants={fadeInUp}
          >
            Novedades recientes
          </motion.h2>
          <motion.div
            className="w-40 h-0.5 bg-primary mx-auto mt-4"
            variants={fadeInUp}
          />
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute -left-3 md:-left-16 top-1/2 -translate-y-1/2 z-10 md:h-10 md:w-10 h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute -right-3 md:-right-16 top-1/2 -translate-y-1/2 z-10 md:h-10 md:w-10 h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden px-6 md:px-0">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {visibleItems.map((item) => (
                <motion.article
                  key={`${item.id}-${startIndex}-${itemsPerPage}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="bg-card rounded-xl overflow-hidden border border-border group"
                >
                  <Link
                    href={item.link}
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block h-full"
                  >
                    <div className="relative h-48 overflow-hidden bg-secondary">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                      <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4 line-clamp-3 flex-grow">
                        {item.shortDescription}
                      </p>
                      <span className="text-sm font-semibold text-primary group-hover:text-primary/80 group-hover:underline group-hover:underline-offset-4 transition-all duration-300">
                        {item.cta || "Saber más"}
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {newsItems.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > startIndex ? 1 : -1)
                  setStartIndex(i)
                }}
                className={`h-3 w-3 rounded-full transition-colors ${i === startIndex
                  ? "bg-primary"
                  : "bg-border hover:bg-muted-foreground"
                  }`}
                aria-label={`Ir a noticia ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
