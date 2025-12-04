"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  ShoppingBag,
  Bike,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Utensils,
  Gift,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, easeOut, useInView, backOut } from "framer-motion";
import { useRef, useState, useCallback } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: backOut,
    },
  },
};

const deliveryOptions = [
  {
    platform: "Uber Eats",
    icon: <ShoppingBag className="w-6 h-6" />,
    time: "25-35 min",
    fee: "2.99€",
    rating: "4.8",
    color: "bg-black hover:bg-gray-800",
    link: "https://www.ubereats.com/es/store/bar-guantanamera/I6yHelcBWGuGn1VeHqaXJw",
  },
  {
    platform: "Glovo",
    icon: <Bike className="w-6 h-6" />,
    time: "20-30 min",
    fee: "1.99€",
    rating: "4.9",
    color: "bg-orange-500 hover:bg-orange-600",
    link: "https://glovoapp.com/es/es/las-chafiras/guantanamera-las-chafiras",
  },
];

const benefits = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Entrega Rápida",
    description: "20-35 minutos",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Calidad Garantizada",
    description: "Siempre fresco",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Pedido Seguro",
    description: "Pago protegido",
  },
];

export default function OrderSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copiedPhone, setCopiedPhone] = useState(false);
  const pathname = usePathname();

  // Helper para ajustar enlaces con hash según la ruta actual
  const getHashLink = useCallback((hash: string) => {
    return pathname === "/" ? hash : `/${hash}`;
  }, [pathname]);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText("922173039");
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone:", err);
    }
  };

  return (
    <section
      id="pedir"
      className="w-full scroll-mt-16 bg-white py-20 md:py-28"
      ref={ref}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Enhanced Header */}
        <motion.div
          className="mb-16 text-center"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-6">
            <Utensils className="w-4 h-4 text-red-600" />
            <span className="text-red-600 text-sm font-medium tracking-wide">
              HACER PEDIDO
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">
            ¿Hambre? <span className="text-red-600">¡Pide Ahora!</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
            ¿Listo para disfrutar? ¡Pide directamente desde aquí! 
            Navega por nuestro menú, elige tus favoritos y recibe tu pedido 
            en casa con toda la frescura y sabor que te encanta.
          </p>
          <p className="mx-auto max-w-2xl text-base text-gray-500 mt-4 italic">
            Tu pedido, tu tiempo, todo en nuestra web.
          </p>
        </motion.div>

        {/* Centered Content */}
        <div className="space-y-12">
          {/* Web Orders Available - FIRST AND PROMINENT */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-gray-50 rounded-3xl p-8 shadow-lg border border-red-100 max-w-4xl mx-auto overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 text-center">
                  Pide Online, Directo desde Nuestra Web
                </h3>
                <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
                  Todo lo que necesitas está aquí. Explora nuestro menú completo, 
                  personaliza tu pedido a tu gusto y compra con un solo clic. 
                  Sin salir de nuestra página, con los mejores precios y ofertas 
                  que solo encuentras en nuestra web.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {/* Botones de pedido online - Próximamente */}
                  {/* <Button
                    asChild
                    className="bg-red-600 text-white hover:bg-red-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    <Link href={getHashLink("#menu")}>
                      Ver Menú y Pedir
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button> */}
                  
                  {/* Mensaje de Próximamente */}
                  <motion.div
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 border-2 border-red-200 rounded-full text-red-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold text-sm md:text-base">
                      Pedido Online - Próximamente
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Direct Phone Order */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Phone Number Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="rounded-2xl border-0 shadow-lg h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 md:p-8 text-center md:text-left h-full flex flex-col">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-10 h-10 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 text-xl md:text-2xl">
                          Pedido Directo
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm md:text-base">
                          Llámanos y te atendemos personalmente
                        </p>
                        <div className="mb-4 md:mb-6">
                          <div className="flex items-center justify-center md:justify-start gap-3">
                            <div className="text-lg md:text-xl font-bold text-black">
                              922 17 30 39
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-3 py-1 h-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                              onClick={copyPhone}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {copiedPhone ? "¡Copiado!" : "Copiar"}
                            </Button>
                          </div>
                        </div>
                        <Button
                          asChild
                          className="w-full md:w-auto bg-green-600 text-white hover:bg-green-700 rounded-xl mt-auto"
                          size="lg"
                        >
                          <a
                            href="tel:+34922173039"
                            className="flex items-center justify-center"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Llamar Ahora
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Info Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 md:p-8 h-full flex flex-col">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg md:text-xl text-center">
                      ¿Por qué elegirnos?
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm md:text-base text-gray-700">
                          Sin comisiones adicionales
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm md:text-base text-gray-700">
                          Atención personalizada
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm md:text-base text-gray-700">
                          Mejores precios
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Gift className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm md:text-base text-gray-700">
                          Ofertas exclusivas
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Delivery Platforms - LAST */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-black mb-2">
                También Disponible en
              </h3>
              <p className="text-gray-600">
                Si prefieres, también puedes pedir a través de estas plataformas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {deliveryOptions.map((option, index) => (
                <motion.div
                  key={option.platform}
                  variants={buttonVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {option.icon}
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {option.platform}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{option.time}</span>
                              <span>•</span>
                              <span>Envío: {option.fee}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold text-gray-900">
                              {option.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        asChild
                        className={`w-full ${option.color} text-white rounded-xl mt-auto`}
                      >
                        <Link
                          href={option.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Pedir en {option.platform}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
