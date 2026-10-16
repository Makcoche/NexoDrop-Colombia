import React, { useState } from 'react';
import {
  HelpCircle,
  Truck,
  DollarSign,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

export const HelpView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Freight & Margin calculator widget
  const [costoArticulo, setCostoArticulo] = useState<number>(40000);
  const [precioCobro, setPrecioCobro] = useState<number>(89000);
  const [fleteNacional, setFleteNacional] = useState<number>(15000);

  const comisionPlataforma = Math.round(precioCobro * 0.05);
  const gananciaNeta = precioCobro - costoArticulo - fleteNacional - comisionPlataforma;
  const margenPorcentaje = precioCobro > 0 ? Math.round((gananciaNeta / precioCobro) * 100) : 0;

  const faqs = [
    {
      q: '¿Cómo funciona el flujo de dropshipping en Colombia con NexoDrop?',
      a: '1. Exploras el catálogo con stock informado en bodegas colombianas.\n2. Defines tu propio precio de venta y usas el Asistente Gemini para generar anuncios y descripciones.\n3. Promocionas en tus redes o tienda virtual y recibes los pedidos de tus clientes.\n4. Registras el pedido en NexoDrop indicando si es con pago contraentrega o transferencia.\n5. El proveedor alista el paquete y genera la guía con Coordinadora, Servientrega o Interrapidísimo.\n6. Cuando la transportadora entrega y recauda, se liquidan tus ganancias estimadas.',
    },
    {
      q: '¿Qué transportadoras nacionales maneja la plataforma?',
      a: 'Trabajamos con las principales transportadoras de Colombia: Coordinadora Mercantil, Servientrega, Interrapidísimo, Envia Colvanes, TCC y Domina Entrega Total. La guía y enlace de seguimiento se registran manualmente en el MVP para garantizar trazabilidad.',
    },
    {
      q: '¿Cómo se manejan las novedades de entrega (cliente ausente, dirección errónea)?',
      a: 'Cuando una transportadora no puede entregar en el primer intento, se abre automáticamente una novedad en el pedido. El vendedor o el operador de soporte puede comunicarse inmediatamente por WhatsApp con el cliente para corregir la dirección o reprogramar la visita antes de que el paquete sea devuelto.',
    },
    {
      q: '¿Por qué las ganancias aparecen como estimadas?',
      a: 'Porque el costo final del flete y los costos de recaudo contraentrega varían según el peso volumétrico final y el municipio de destino (ciudades principales vs trayectos especiales). Para proteger tu negocio, NexoDrop muestra la ganancia orientativa hasta la confirmación de la guía.',
    },
    {
      q: '¿Cómo funciona el Asistente de IA Gemini sin alucinaciones?',
      a: 'El asistente se conecta de manera segura con el modelo Gemini 3.8 Flash desde el servidor y utiliza exclusivamente los atributos técnicos suministrados por el fabricante. No inventa materiales, registros INVIMA inexistentes, resultados milagrosos ni garantías falsas.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            Centro de Ayuda y Guía Operativa
          </h1>
          <p className="text-xs text-zinc-500">
            Aprende cómo operar tu negocio de dropshipping en Colombia y calcular tus márgenes con precisión.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-zinc-100 rounded-lg text-zinc-700">
          Soporte: Lun - Sáb, 8am a 6pm
        </div>
      </div>

      {/* Interactive Freight & Profit Calculator Widget */}
      <div className="bg-gradient-to-br from-emerald-900 to-zinc-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
        <div>
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider block mb-1">
            Herramienta Operativa
          </span>
          <h2 className="text-xl font-extrabold">Simulador de Fletes y Ganancia Contraentrega en Colombia</h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
            Simula rápidamente cuánto te queda en el bolsillo después de descontar el costo mayorista, el flete de la
            transportadora y la comisión de la plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-zinc-900">
          <div className="bg-white p-4 rounded-2xl space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              1. Costo del Producto (COP)
            </label>
            <input
              type="number"
              step="1000"
              value={costoArticulo}
              onChange={(e) => setCostoArticulo(Number(e.target.value) || 0)}
              className="w-full text-base font-extrabold text-zinc-900 focus:outline-hidden"
            />
            <span className="text-[10px] text-zinc-400 block">Cobrado por el proveedor mayorista</span>
          </div>

          <div className="bg-white p-4 rounded-2xl space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              2. Precio Cobrado al Cliente
            </label>
            <input
              type="number"
              step="1000"
              value={precioCobro}
              onChange={(e) => setPrecioCobro(Number(e.target.value) || 0)}
              className="w-full text-base font-extrabold text-emerald-700 focus:outline-hidden"
            />
            <span className="text-[10px] text-zinc-400 block">Total en tu tienda o WhatsApp</span>
          </div>

          <div className="bg-white p-4 rounded-2xl space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              3. Flete Nacional Promedio
            </label>
            <input
              type="number"
              step="500"
              value={fleteNacional}
              onChange={(e) => setFleteNacional(Number(e.target.value) || 0)}
              className="w-full text-base font-extrabold text-zinc-900 focus:outline-hidden"
            />
            <span className="text-[10px] text-zinc-400 block">Tarifa promedio Coordinadora / Servientrega</span>
          </div>
        </div>

        {/* Results bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-white/10 text-xs">
          <div>
            <span className="text-zinc-400 block">Comisión NexoDrop (5%):</span>
            <span className="font-bold text-white text-sm">{formatCOP(comisionPlataforma)}</span>
          </div>
          <div>
            <span className="text-zinc-400 block">Margen porcentual:</span>
            <span className="font-bold text-emerald-400 text-sm">{margenPorcentaje}% sobre venta</span>
          </div>
          <div className="text-right">
            <span className="text-emerald-300 font-semibold block">Ganancia estimada neta por unidad:</span>
            <span className="text-2xl font-black text-emerald-400">{formatCOP(gananciaNeta)}</span>
          </div>
        </div>
      </div>

      {/* Operational FAQ Accordion */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          Preguntas Frecuentes Operativas
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="border border-zinc-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 font-bold text-xs sm:text-sm text-zinc-800 bg-zinc-50/50 hover:bg-zinc-100/70 flex items-center justify-between gap-3 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-zinc-600 leading-relaxed whitespace-pre-line border-t border-zinc-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support & Contact Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-base flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-700" />
            ¿Necesitas ayuda con un pedido o proveedor?
          </h4>
          <p className="text-xs text-emerald-800">
            Nuestro equipo de soporte y novedades logísticas está disponible para destrabar entregas en Colombia.
          </p>
        </div>
        <a
          href="https://wa.me/573000000000"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-600/20 text-center shrink-0"
        >
          Contactar Mesa de Soporte
        </a>
      </div>
    </div>
  );
};
