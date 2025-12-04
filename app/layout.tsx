import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Bar Cafeteria Guantanamera",
  description:
    "Bar Cafetería Guantanamera - Los mejores pollos asados de Tenerife. Comida para llevar, para compartir y para disfrutar en familia. Especialidad en pollos, costillas y patas asadas con la receta casera que nos define. Más de 20 años de tradición culinaria, donde cada plato cuenta una historia de pasión y autenticidad. Ven y descubre por qué somos el lugar favorito para los amantes de la buena comida asada.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512" }
    ]
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={cn(
          "bg-white font-sans text-gray-800 antialiased",
          inter.variable
        )}
      >
          {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
