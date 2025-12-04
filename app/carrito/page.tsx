"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import SiteHeader from "@/components/layout/site-header"
import SiteFooter from "@/components/layout/site-footer"

export default function CartPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página principal ya que el carrito está deshabilitado
    router.replace("/")
  }, [router])

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-gray-800">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
