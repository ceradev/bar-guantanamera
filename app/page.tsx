"use client"

import dynamic from "next/dynamic"
import SiteHeader from "@/components/layout/site-header"
import HeroSection from "@/components/sections/hero-section"
import SiteFooter from "@/components/layout/site-footer"

// Lazy load sections que no están en el viewport inicial
const MenuSection = dynamic(() => import("@/components/sections/menu-section"), {
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" />,
})

const PhotoGallery = dynamic(() => import("@/components/sections/photo-gallery"), {
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" />,
})

const TestimonialsSection = dynamic(() => import("@/components/sections/testimonials-section"), {
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" />,
})

const LocationSection = dynamic(() => import("@/components/sections/location-section"), {
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" />,
})

const OrderSection = dynamic(() => import("@/components/sections/order-section"), {
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse" />,
})

// Componentes comunes que se pueden cargar después del contenido principal
const BackToTopButton = dynamic(() => import("@/components/common/back-to-top-button"), {
  ssr: false,
})

const FloatingCallButton = dynamic(() => import("@/components/common/floating-call-button"), {
  ssr: false,
})

const FloatingCart = dynamic(() => import("@/components/cart/floating-cart"), {
  ssr: false,
})

const CookieBanner = dynamic(() => import("@/components/common/cookie-banner"), {
  ssr: false,
})

export default function GuantanameraPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-gray-800">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        <MenuSection />
        <PhotoGallery />
        <TestimonialsSection />
        <LocationSection />
        <OrderSection />
      </main>

      <SiteFooter />
      <BackToTopButton />
      <FloatingCallButton />
      <FloatingCart />
      <CookieBanner />
    </div>
  )
}
