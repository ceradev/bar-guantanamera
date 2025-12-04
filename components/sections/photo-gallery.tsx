"use client";

import Image from "next/image";
import { motion, easeOut, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wave } from "@/components/ui/wave";
import galleryData from "@/data/gallery-data.json";
import { GalleryImage } from "@/types/gallery";

// Componente de video optimizado que se carga cuando está visible
function LazyVideo({ src, className }: { readonly src: string; readonly className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { once: true, margin: "100px" });

  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Ignorar errores de autoplay (algunos navegadores lo bloquean)
      });
    }
  }, [isInView]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      autoPlay
    />
  );
}

const images: GalleryImage[] = galleryData.images;

// Límite de imágenes a mostrar inicialmente en el bento grid
const INITIAL_IMAGES_LIMIT = 6;

// Layout del bento grid (definido manualmente para mejor control)
const bentoLayout = [
  { col: "col-span-2", row: "row-span-2" }, // Imagen grande (2x2)
  { col: "col-span-1", row: "row-span-1" }, // Imagen pequeña (1x1)
  { col: "col-span-1", row: "row-span-1" }, // Imagen pequeña (1x1)
  { col: "col-span-1", row: "row-span-1" }, // Imagen pequeña (1x1)
  { col: "col-span-1", row: "row-span-2" }, // Imagen vertical (1x2)
  { col: "col-span-2", row: "row-span-1" }, // Imagen horizontal (2x1)
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

const lightboxVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const imageModalVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: { scale: 0.8, opacity: 0 },
};

export default function PhotoGallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  // Memoizar las imágenes visibles para optimizar rendimiento
  const visibleImages = useMemo(() => {
    return showAllImages ? images : images.slice(0, INITIAL_IMAGES_LIMIT);
  }, [showAllImages]);

  const hasMoreImages = images.length > INITIAL_IMAGES_LIMIT;

  const openLightbox = useCallback((image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const nextImage = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  }, [currentIndex]);

  const prevImage = useCallback(() => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  }, [currentIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  }, [closeLightbox, nextImage, prevImage]);

  const handleViewMore = useCallback(() => {
    setShowAllImages(true);
  }, []);

  return (
    <section
      id="galeria"
      className="relative w-full scroll-mt-16 bg-gray-50 py-20 md:py-28"
      ref={ref}
    >
      {/* Top Wave */}
      <Wave position="top" />

      {/* Bottom Wave */}
      <Wave position="bottom" />
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="text-red-600 text-sm font-medium tracking-wide">
              GALERÍA
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">
            Un Vistazo a <span className="text-red-600">Guantanamera</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
            Descubre la esencia de nuestro restaurante a través de imágenes que
            capturan nuestros sabores, ambiente acogedor y los momentos
            especiales que compartimos contigo.
          </p>
        </motion.div>

        {/* Bento Grid Gallery */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Mobile Grid - Simple 2 column layout */}
          <div className="grid grid-cols-2 lg:hidden gap-3">
            {visibleImages.slice(0, 4).map((image, index) => (
              <motion.div
                key={`mobile-${index}-${image.alt}`}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white aspect-square"
                variants={imageVariants}
                onClick={() => openLightbox(image, images.indexOf(image))}
              >
                {image.isVideo ? (
                  <LazyVideo
                    src={image.src}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-block bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {image.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {!showAllImages && hasMoreImages && (
              <motion.button
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-red-600 to-orange-600 aspect-square flex flex-col items-center justify-center text-white"
                variants={imageVariants}
                onClick={handleViewMore}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm font-semibold">Ver más</span>
                <span className="text-xs opacity-90 mt-1">
                  +{images.length - INITIAL_IMAGES_LIMIT} más
                </span>
              </motion.button>
            )}
          </div>

          {/* Desktop Bento Grid */}
          <div className="hidden lg:grid grid-cols-4 grid-rows-3 gap-3 auto-rows-fr" style={{ minHeight: '600px' }}>
            {visibleImages.map((image, index) => {
              // Usar layout bento solo para las primeras imágenes, luego grid uniforme
              const useBentoLayout = index < bentoLayout.length && !showAllImages;
              const layout = useBentoLayout ? bentoLayout[index] : { col: "col-span-1", row: "row-span-1" };
              const actualIndex = images.indexOf(image);
              
              return (
                <motion.div
                  key={`desktop-${actualIndex}-${image.alt}`}
                  className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white ${layout.col} ${layout.row}`}
                  variants={imageVariants}
                  onClick={() => openLightbox(image, actualIndex)}
                  whileHover={{ scale: 1.02 }}
                >
                  {image.isVideo ? (
                    <LazyVideo
                      src={image.src}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                        {image.category}
                      </span>
                      <p className="text-white text-sm font-medium leading-tight">
                        {image.alt}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Celda "Ver más" en esquina inferior derecha */}
            {!showAllImages && hasMoreImages && (
              <motion.button
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-red-600 via-red-700 to-orange-600 col-span-1 row-span-1 flex flex-col items-center justify-center text-white"
                variants={imageVariants}
                onClick={handleViewMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <Plus className="w-12 h-12 mb-3 relative z-10" strokeWidth={2.5} />
                <span className="text-lg font-bold relative z-10">Ver más</span>
                <span className="text-sm opacity-90 mt-1 relative z-10">
                  +{images.length - INITIAL_IMAGES_LIMIT} más
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-4">
              ¿Te gusta lo que ves?
            </h3>
            <p className="text-gray-600 mb-6">
              Ven a vivir la experiencia Guantanamera en persona. Te esperamos
              con los brazos abiertos.
            </p>
            <Button
              asChild
              className="bg-red-600 text-white hover:bg-red-700 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <a href="#pedir">Hacer Reserva</a>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            variants={lightboxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 rounded-full backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 rounded-full backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 rounded-full backdrop-blur-sm"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image Container */}
            <motion.div
              className="relative max-w-4xl max-h-[80vh] mx-4"
              variants={imageModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                {selectedImage.isVideo ? (
                  <video
                    src={selectedImage.src}
                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={selectedImage.src || "/placeholder.svg"}
                    alt={selectedImage.alt}
                    width={800}
                    height={600}
                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                  />
                )}
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
                <span className="inline-block bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-2">
                  {selectedImage.category}
                </span>
                <h3 className="text-white text-xl font-bold mb-1">
                  {selectedImage.alt}
                </h3>
                <p className="text-white/80 text-sm">
                  {selectedImage.isVideo ? 'Video' : 'Imagen'} {currentIndex + 1} de {images.length}
                </p>
              </div>
            </motion.div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
