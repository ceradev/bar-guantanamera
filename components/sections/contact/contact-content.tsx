"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Music, ExternalLink, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BUSINESS_HOURS } from "@/data/business-hours"
import { motion } from "framer-motion"
import { staggerContainer, fadeInUp, scaleIn } from "../menu/animations"

const contactInfo = [
  {
    icon: MapPin,
    title: "Ubicación",
    lines: ["C. Castro, 7, 38611", "San Isidro, Santa Cruz", "de Tenerife"],
    href: "https://www.google.com/maps/search/?api=1&query=C.+Castro,+7,+38611+San+Isidro+(Guantanamera)",
  },
  {
    icon: Phone,
    title: "Teléfono",
    lines: ["+34 922 17 30 39"],
    href: "tel:+34922173039",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["guantanamera.contact@gmail.com"],
    href: "mailto:guantanamera.contact@gmail.com",
  },
]

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/guantanamera.bar", label: "Instagram" },
  { icon: Music, href: "https://tiktok.com", label: "TikTok" },
]

export default function ContactContent() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Consulta General",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setFormState({ name: "", email: "", phone: "", subject: "Consulta General", message: "" })
      } else {
        setSubmitStatus("error")
      }
    } catch {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* Left Column */}
          <div>
            {/* Contact Info Cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
              variants={staggerContainer}
            >
              {contactInfo.map((info) => {
                const Icon = info.icon
                const contentText = info.lines.join(" ")
                const isCopied = copiedField === info.title

                const handleCopy = () => {
                  navigator.clipboard.writeText(contentText)
                  setCopiedField(info.title)
                  setTimeout(() => setCopiedField(null), 2000)
                }

                return (
                  <motion.div key={info.title} variants={fadeInUp} className="h-full">
                    <div className="flex flex-col items-center text-center p-5 rounded-xl border border-border bg-card shadow-sm h-full">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm mb-2">
                        {info.title}
                      </h3>
                      <div className="flex-1 flex flex-col justify-center mb-4 w-full">
                        {info.lines.map((line, i) => (
                          <p
                            key={i}
                            className={`text-xs text-muted-foreground font-body ${info.title === "Email" ? "break-all" : ""
                              }`}
                          >
                            {line}
                          </p>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full mt-auto pt-3 border-t border-border/50">
                        {info.href && (
                          <a
                            href={info.href}
                            target={
                              info.href.startsWith("http") ? "_blank" : undefined
                            }
                            rel={
                              info.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {info.title === "Ubicación"
                              ? "Mapa"
                              : info.title === "Teléfono"
                                ? "Llamar"
                                : "Enviar"}
                          </a>
                        )}
                        <button
                          onClick={handleCopy}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              variants={fadeInUp}
              className="border border-border bg-card rounded-xl p-6 md:p-8 shadow-sm"
            >
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                PONTE EN CONTACTO
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Envíanos un mensaje
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-8">
                {"Cualquier duda que tengas respecto a nuestro menú, quieras hacer un encargo personalizado, o simplemente decirnos hola, nos encantaría escucharlo de ustedes"}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Juan García"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, name: e.target.value }))
                      }
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-secondary/30 text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Tu Email
                    </label>
                    <input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, email: e.target.value }))
                      }
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg bg-secondary/30 text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      placeholder="+34 000 00 00 00"
                      value={formState.phone}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, phone: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-secondary/30 text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Asunto
                    </label>
                    <select
                      value={formState.subject}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, subject: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-secondary/30 text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                      <option>Consulta General</option>
                      <option>Encargo especial</option>
                      <option>Reserva</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Mensaje
                  </label>
                  <textarea
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    value={formState.message}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, message: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg bg-secondary/30 text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  />
                </div>

                {submitStatus === "success" && (
                  <p className="text-sm text-green-600 font-medium">
                    ¡Mensaje enviado correctamente! Te responderemos pronto.
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="text-sm text-destructive font-medium">
                    Hubo un error al enviar el mensaje. Inténtalo de nuevo.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wide rounded-sm px-8 self-start disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div className="flex flex-col gap-8" variants={fadeInUp}>
            {/* Google Map */}
            <motion.div
              className="rounded-xl overflow-hidden border border-border bg-secondary h-[400px] md:h-[460px]"
              variants={scaleIn}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3510.867!2d-16.3913!3d28.0521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc6a9f7b0c0a0a0a%3A0x0!2sC.%20Castro%2C%207%2C%2038611%20San%20Isidro!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Guantanamera en Google Maps"
              />
            </motion.div>

            {/* Business Hours */}
            <motion.div
              className="h-[440px] rounded-xl border border-border bg-card shadow-sm p-8"
              variants={fadeInUp}
            >
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horario
              </h3>
              <div className="flex flex-col gap-4">
                {BUSINESS_HOURS.map((schedule) => (
                  <div
                    key={schedule.dayLabel}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm text-muted-foreground font-body">
                      {schedule.dayLabel}
                    </span>
                    <span
                      className={`text-sm font-semibold ${schedule.hours === "Cerrado"
                        ? "text-primary"
                        : "text-primary"
                        }`}
                    >
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-bold text-foreground mb-3">
                  {"Síguenos"}
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                        aria-label={social.label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
