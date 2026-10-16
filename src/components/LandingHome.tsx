import React from 'react';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import { CountryCode } from '../types';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  MapPin,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  Users,
} from 'lucide-react';

interface Props {
  onRegisterCountry: (country: CountryCode) => void;
  onEnterCountryPlatform: (country: CountryCode) => void;
  onOpenLogin?: () => void;
}

export const LandingHome: React.FC<Props> = ({
  onRegisterCountry,
  onEnterCountryPlatform,
  onOpenLogin,
}) => {
  const { products, suppliers, orders, currentUser } = useApp();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white p-8 sm:p-12 lg:p-16 border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Dual Country Badge */}
          <div className="inline-flex items-center gap-3 bg-zinc-800/80 border border-zinc-700/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold shadow-inner">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ColombiaFlag className="w-5 h-3.5" />
              Colombia
            </span>
            <span className="text-zinc-500 font-bold">•</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <VenezuelaFlag className="w-5 h-3.5" />
              Venezuela
            </span>
            <span className="text-zinc-500 font-bold">•</span>
            <span className="text-emerald-400 font-medium">Red Dropshipping Andina</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Conecta con proveedores y vende en{' '}
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Colombia y Venezuela
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Plataforma especializada en dropshipping local: gestiona catálogo con inventario real, calcula tus
            márgenes transparentes, genera anuncios con IA y coordina envíos con transportadoras nacionales en cada país.
          </p>

          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold pt-2">
            Elige tu país de operación para registrarte o acceder:
          </p>
        </div>

        {/* Dual Country Registration Cards (Specification Requirement) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-10">
          {/* COLOMBIA CARD */}
          <div className="bg-zinc-900/90 border-2 border-emerald-500/40 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all shadow-xl hover:shadow-emerald-950/40 group">
            <div className="space-y-4">
              {/* Flag & Title */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ColombiaFlag className="w-12 h-8 rounded-lg shadow-md" />
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                      NexoDrop Colombia 🇨🇴
                    </h2>
                    <span className="text-xs text-emerald-400 font-semibold">
                      Mercado Nacional • Moneda COP
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Activo
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Vende en Colombia con recaudación en <strong>pesos colombianos (COP)</strong>, cobro contraentrega y
                despachos directos desde bodegas en Bogotá, Medellín, Cali y Bucaramanga.
              </p>

              {/* Local Logistics & Highlights */}
              <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Transportadoras: <strong>Coordinadora, Servientrega, Interrapidísimo, Envia, TCC</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Métodos de pago: <strong>Contraentrega (Paga al recibir), Nequi, Bancolombia, PSE</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Registro con Cédula de Ciudadanía (CC) o NIT colombiano</span>
                </div>
              </div>
            </div>

            {/* CTAs Colombia */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onRegisterCountry('CO')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <span>Registrarme en Colombia</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEnterCountryPlatform('CO')}
                className="w-full py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl border border-zinc-700/80 transition-colors"
              >
                Ver Catálogo y Panel de Colombia →
              </button>
            </div>
          </div>

          {/* VENEZUELA CARD */}
          <div className="bg-zinc-900/90 border-2 border-blue-500/40 hover:border-blue-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all shadow-xl hover:shadow-blue-950/40 group">
            <div className="space-y-4">
              {/* Flag & Title */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <VenezuelaFlag className="w-12 h-8 rounded-lg shadow-md" />
                  <div>
                    <h2 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
                      NexoDrop Venezuela 🇻🇪
                    </h2>
                    <span className="text-xs text-blue-400 font-semibold">
                      Mercado Nacional • Moneda USD / VES
                    </span>
                  </div>
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Activo
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Vende en Venezuela con fijación de precios en <strong>USD ($)</strong> y liquidación en Bolívares al
                cambio oficial, con bodegas mayoristas en Caracas, Valencia, Maracaibo y Barquisimeto.
              </p>

              {/* Local Logistics & Highlights */}
              <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Transportadoras: <strong>MRW, Tealca, Zoom, Domesa, Delivery Motorizado</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <DollarSign className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Métodos de pago: <strong>Pago Móvil interbancario, Efectivo USD contraentrega, Zelle</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Registro con Cédula de Identidad (V- / E-) o RIF venezolano</span>
                </div>
              </div>
            </div>

            {/* CTAs Venezuela */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onRegisterCountry('VE')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <span>Registrarme en Venezuela</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEnterCountryPlatform('VE')}
                className="w-full py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl border border-zinc-700/80 transition-colors"
              >
                Ver Catálogo y Panel de Venezuela →
              </button>
            </div>
          </div>
        </div>

        {/* Already have an account prompt */}
        <div className="relative z-10 text-center pt-8 max-w-md mx-auto">
          <p className="text-xs text-zinc-400">
            ¿Ya tienes una cuenta registrada o quieres probar como Vendedor / Proveedor demo?
          </p>
          <button
            onClick={onOpenLogin}
            className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
          >
            Iniciar Sesión / Cuentas Demo Multi-Usuario →
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Catálogo con Stock Real</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Productos con fecha y hora de última auditoría de bodega para evitar vender existencias agotadas.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">IA Comercial con Gemini</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Redacción de anuncios para Facebook, guiones para TikTok y mensajes de WhatsApp sin inventar especificaciones.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Trazabilidad y Novedades</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Gestión manual de guías con resolución de incidencias en ruta antes de que el paquete sea devuelto.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900">Márgenes Transparentes</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Fórmulas claras que descuentan costo del producto, flete e intermediación para mostrar tu ganancia neta.
          </p>
        </div>
      </section>

      {/* How it works for dropshippers in Colombia and Venezuela */}
      <section className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
            ¿Cómo empezar a vender en 4 pasos?
          </h2>
          <p className="text-xs text-zinc-500">
            Flujo probado para dropshippers en Colombia y Venezuela sin comprar inventario por adelantado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 text-xs">
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-zinc-900">Regístrate en tu país</h4>
            <p className="text-zinc-600 leading-relaxed">
              Crea tu cuenta de vendedor en Colombia o Venezuela para acceder a los costos mayoristas y logística local.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-zinc-900">Define tu precio y crea anuncios</h4>
            <p className="text-zinc-600 leading-relaxed">
              Elige productos del catálogo, calcula tu margen y usa el Asistente Gemini para generar copys de venta.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-zinc-900">Registra pedidos de tus clientes</h4>
            <p className="text-zinc-600 leading-relaxed">
              Ingresa los datos de entrega de tu cliente. El proveedor alista el paquete y genera la guía de envío.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
              4
            </span>
            <h4 className="font-bold text-zinc-900">Entrega y liquidación</h4>
            <p className="text-zinc-600 leading-relaxed">
              La transportadora entrega (recauda si es contraentrega) y recibes tu ganancia estimada en tu cuenta.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
