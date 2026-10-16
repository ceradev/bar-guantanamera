import type React from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { bowlbyOne, inter, leagueSpartan } from "@/lib/fonts";
import { RootProvider } from "@/components/providers/root-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FloatingCallButton from "@/components/common/floating-call-button";
import BackToTopButton from "@/components/common/back-to-top-button";

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={cn(
          "bg-background font-sans text-foreground antialiased",
          leagueSpartan.variable,
          inter.variable,
          bowlbyOne.variable
        )}
      >
        <RootProvider>{children}</RootProvider>
        {maintenanceMode ? null : <Toaster />}
        <Analytics />
        <SpeedInsights />
        {maintenanceMode ? null : <FloatingCallButton />}
        {maintenanceMode ? null : <BackToTopButton />}
      </body>
    </html>
  );
}
