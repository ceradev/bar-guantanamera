import Link from "next/link";
import { ArrowLeft, FileText, ShoppingBag, CreditCard, Truck, AlertTriangle, Phone } from "lucide-react";

export default function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Términos de Servicio
            </h1>
            <p className="text-gray-600 mt-2">
              Última actualización: 29 de agosto de 2024
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Aceptación de Términos
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar el sitio web de Restaurante Guantanamera y nuestros 
              servicios, usted acepta estar sujeto a estos Términos de Servicio. Si no 
              está de acuerdo con alguna parte de estos términos, le recomendamos no 
              utilizar nuestros servicios.
            </p>
          </div>

          {/* Service Description */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Descripción del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Restaurante Guantanamera ofrece servicios de restauración especializados 
              en pollos asados, costillas y patas asadas, incluyendo:
            </p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Venta de comida para llevar</li>
              <li>• Servicio de entrega a domicilio</li>
              <li>• Reservas para eventos especiales</li>
              <li>• Información sobre nuestro menú y servicios</li>
            </ul>
          </div>

          {/* Orders and Payment */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Pedidos y Pagos
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Realización de Pedidos
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Los pedidos se pueden realizar por teléfono o a través de nuestro sitio web</li>
                  <li>• Todos los precios están en euros e incluyen IVA</li>
                  <li>• Los precios pueden estar sujetos a cambios sin previo aviso</li>
                  <li>• Se requiere confirmación del pedido antes de la preparación</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Métodos de Pago
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Efectivo en la entrega</li>
                  <li>• Tarjeta de crédito/débito en el local</li>
                  <li>• Transferencia bancaria (para pedidos especiales)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Entrega y Recogida
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Servicio de Entrega
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Entregamos en un radio de 10 km desde nuestro local</li>
                  <li>• Tiempo estimado de entrega: 30-60 minutos</li>
                  <li>• Coste de entrega: 2.00€ (gratis para pedidos superiores a 25€)</li>
                  <li>• Horarios de entrega: según nuestro horario de apertura</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recogida en Local
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Los pedidos estarán listos en 15-30 minutos</li>
                  <li>• Es necesario presentar identificación al recoger</li>
                  <li>• Se recomienda confirmar la hora de recogida</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellations and Refunds */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Cancelaciones y Reembolsos
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Política de Cancelación
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Se pueden cancelar pedidos hasta 30 minutos antes de la hora de entrega</li>
                  <li>• Las cancelaciones tardías pueden incurrir en cargos</li>
                  <li>• Para eventos especiales, se requiere cancelación con 24h de antelación</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Política de Reembolso
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Reembolsos completos por errores en el pedido</li>
                  <li>• Reembolsos parciales por problemas de calidad</li>
                  <li>• No se reembolsan pedidos ya entregados sin problemas</li>
                  <li>• Los reembolsos se procesan en 5-7 días hábiles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quality and Allergens */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Calidad y Alérgenos
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Compromiso de Calidad
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Utilizamos ingredientes frescos y de alta calidad</li>
                  <li>• Cumplimos con todas las normativas sanitarias</li>
                  <li>• Nuestro personal está formado en seguridad alimentaria</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Información de Alérgenos
                </h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Proporcionamos información detallada de alérgenos</li>
                  <li>• No podemos garantizar la ausencia total de trazas</li>
                  <li>• Consulte con nuestro personal si tiene alergias específicas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Responsabilidades del Usuario
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al utilizar nuestros servicios, usted se compromete a:
            </p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Proporcionar información veraz y completa</li>
              <li>• Respetar los horarios de entrega acordados</li>
              <li>• Tratar a nuestro personal con respeto</li>
              <li>• No utilizar nuestros servicios para fines ilegales</li>
              <li>• Mantener la confidencialidad de su cuenta</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Restaurante Guantanamera no será responsable por:
            </p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Daños indirectos o consecuenciales</li>
              <li>• Pérdidas por retrasos en la entrega no causados por nosotros</li>
              <li>• Problemas de salud por alergias no comunicadas</li>
              <li>• Uso incorrecto de nuestros productos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nuestra responsabilidad máxima está limitada al valor del pedido afectado.
            </p>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido de este sitio web, incluyendo textos, imágenes, 
              logotipos y diseño, es propiedad exclusiva de Restaurante Guantanamera 
              y está protegido por las leyes de propiedad intelectual. No se permite 
              su uso, reproducción o distribución sin autorización previa.
            </p>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Privacidad
            </h2>
            <p className="text-gray-700 leading-relaxed">
              El uso de su información personal está sujeto a nuestra 
              <Link href="/politica-privacidad" className="text-red-600 hover:text-red-700 underline ml-1">
                Política de Privacidad
              </Link>, 
              que forma parte integrante de estos Términos de Servicio.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Modificaciones de los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier 
              momento. Los cambios entrarán en vigor inmediatamente después de su 
              publicación. El uso continuado de nuestros servicios constituye 
              aceptación de los términos modificados.
            </p>
          </div>

          {/* Governing Law */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estos términos se rigen por la legislación española. Cualquier 
              disputa será resuelta por los tribunales competentes de Santa Cruz 
              de Tenerife, salvo que la ley establezca otra jurisdicción obligatoria.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Contacto
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> info@guantanamera.com</p>
              <p><strong>Teléfono:</strong> +34 922 17 30 39</p>
              <p><strong>Dirección:</strong> C. Castro, 7, 38611 San Isidro, Santa Cruz de Tenerife</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
