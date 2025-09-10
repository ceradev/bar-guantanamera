"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wave } from "@/components/ui/wave";
import { MapPin, Clock, Navigation, Copy, ExternalLink } from "lucide-react";
import { motion, easeOut, useInView } from "framer-motion";
import { useRef, useState } from "react";

const headerVariants = {
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

const mapVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
      delay: 0.2,
    },
  },
};

const infoVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
      delay: 0.4,
    },
  },
};

const businessHours = [
  { day: "Lunes, Jueves y Viernes", hours: "09:00 - 18:00", days: [1, 4, 5] },
  { day: "Sábados y Domingos", hours: "09:00 - 17:00", days: [6, 0] },
  {
    day: "Martes, Miércoles",
    hours: "Estamos cerrados",
    days: [2, 3],
  },
];

export default function LocationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copiedAddress, setCopiedAddress] = useState(false);

  const address = "C. Castro, 7, 38611 San Isidro, Santa Cruz de Tenerife";

  // Función para obtener el día actual (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const getCurrentDay = () => {
    return new Date().getDay();
  };

  // Función para verificar si un horario es para hoy
  const isToday = (days: number[]) => days.includes(getCurrentDay());

  // Función para verificar si estamos cerrados hoy
  const isClosed = () => {
    const currentDay = getCurrentDay();
    // Martes (2), Miércoles (3), Jueves (4) están cerrados
    return [2, 3].includes(currentDay);
  };

  // Función para obtener el color del texto basado en el estado del horario
  const getTextColor = (schedule: any, weight: "medium" | "semibold") => {
    if (isToday(schedule.days)) {
      // Si es hoy, verificar si está cerrado o abierto
      if (isClosed()) {
        return weight === "medium" ? "text-red-800" : "text-red-600";
      } else {
        return weight === "medium" ? "text-green-800" : "text-green-600";
      }
    }
    return weight === "medium" ? "text-gray-700" : "text-gray-900";
  };

  // Función para obtener las clases CSS del contenedor del horario
  const getScheduleContainerClasses = (schedule: any) => {
    if (isToday(schedule.days)) {
      // Si es hoy, verificar si está cerrado o abierto
      if (isClosed()) {
        return "bg-red-50 border border-red-200";
      } else {
        return "bg-green-50 border border-green-200";
      }
    }
    return "bg-gray-50";
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const openInMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/${encodedAddress}`,
      "_blank"
    );
  };

  return (
    <section
      id="ubicacion"
      className="relative w-full scroll-mt-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-20 md:py-28"
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
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-red-600 text-sm font-medium tracking-wide">
              UBICACIÓN
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">
            Ven a <span className="text-red-600">Visitarnos</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 leading-relaxed">
            Estamos ubicados en el corazón de San Isidro, Tenerife, en la calle
            Castro número 7. Fácilmente accesible en transporte público y con
            opciones de aparcamiento cercanas. Te esperamos con los brazos
            abiertos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Map */}
          <motion.div
            className="lg:col-span-1"
            variants={mapVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Card className="overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-0 relative">
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1800.1234567890123!2d-16.5589!3d28.0789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc5e5e5e5e5e5e5e%3A0x1234567890abcdef!2sC.%20Castro%2C%207%2C%2038611%20San%20Isidro%2C%20Santa%20Cruz%20de%20Tenerife!5e0!3m2!1ses!2ses!4v1234567890!5m2!1ses!2ses"
                    width="100%"
                    height="500"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de ubicación del Restaurante Guantanamera en San Isidro, Tenerife"
                    className="rounded-3xl"
                  />

                  {/* Map Overlay with Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={openInMaps}
                      className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg border-0 rounded-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir en Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Location Info */}
          <motion.div
            className="space-y-6 lg:col-span-1"
            variants={infoVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Address Card */}
            <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Dirección</h3>
                    <p className="text-gray-600 leading-relaxed">{address}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAddress}
                    className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedAddress ? "¡Copiado!" : "Copiar"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={openInMaps}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-full"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Cómo llegar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours Card */}
            <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Horarios</h3>
                </div>
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div
                      key={index + schedule.day}
                      className={`flex justify-between items-center p-4 rounded-xl transition-colors ${getScheduleContainerClasses(
                        schedule
                      )}`}
                    >
                      <span
                        className={`font-medium ${getTextColor(
                          schedule,
                          "medium"
                        )}`}
                      >
                        {schedule.day}
                      </span>
                      <span
                        className={`font-semibold ${getTextColor(
                          schedule,
                          "semibold"
                        )}`}
                      >
                        {schedule.hours}
                      </span>
                      {isToday(schedule.days) && !isClosed() && (
                        <Badge className="bg-green-600 text-white text-xs ml-2">
                          Hoy
                        </Badge>
                      )}
                      {isClosed() && isToday(schedule.days) && (
                        <Badge className="bg-red-600 text-white text-xs ml-2">
                          Cerrado
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Simplified Call to Action */}
        {/* <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-4">
              Reserva tu pedido
            </h3>
            <p className="text-gray-600 mb-6">
              No pierdas la oportunidad de disfrutar de nuestros productos
              frescos y deliciosos.
            </p>
            <Button
              asChild
              className="bg-red-600 text-white hover:bg-red-700 rounded-full w-full"
            >
              <a href="#pedir">Pedir ahora</a>
            </Button>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
