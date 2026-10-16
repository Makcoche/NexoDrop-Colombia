import React, { useState, useEffect } from 'react';
import { StoreProductItem, Product, SellerStore } from '../types';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import {
  X,
  Star,
  CheckCircle,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  Phone,
  MapPin,
  User,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  storeProduct: StoreProductItem;
  product: Product;
  store: SellerStore;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

export const ProductLandingModal: React.FC<Props> = ({
  storeProduct,
  product,
  store,
  onClose,
  onOrderCreated,
}) => {
  const { currentCountry, createOrder } = useApp();
  const config = storeProduct.landing_config;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    minutes: config.minutos_contador || 28,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Checkout form state
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [departamento, setDepartamento] = useState(
    store.pais === 'CO' ? 'Bogotá D.C.' : 'Distrito Capital (Caracas)'
  );
  const [ciudadEntrega, setCiudadEntrega] = useState(
    store.pais === 'CO' ? 'Bogotá' : 'Caracas'
  );
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; numero: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState(
    product.variantes[0] || 'Estándar'
  );
  const [activeImage, setActiveImage] = useState(product.imagenes[0]);

  // Handle direct customer order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = await createOrder({
        vendedor_id: store.vendedor_id,
        vendedor_nombre: store.nombre_tienda,
        proveedor_id: product.proveedor_id,
        proveedor_nombre: product.proveedor_nombre,
        producto_id: product.id,
        producto_nombre: storeProduct.titulo_personalizado || product.nombre,
        producto_imagen: product.imagenes[0],
        variante: selectedVariant,
        cantidad: 1,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        departamento,
        ciudad_entrega: ciudadEntrega,
        direccion_entrega: direccionEntrega,
        precio_cobrado: storeProduct.precio_venta,
        costo_producto: product.costo_proveedor,
        costo_envio: 15000,
        costo_envio_confirmado: false,
        comision_plataforma: Math.round(storeProduct.precio_venta * 0.05),
        ganancia_estimada:
          storeProduct.precio_venta -
          product.costo_proveedor -
          15000 -
          Math.round(storeProduct.precio_venta * 0.05),
        metodo_pago: 'contraentrega',
        estado: 'pendiente_confirmacion',
        notas: `Pedido generado desde Landing Page de ${store.nombre_tienda}. ${notas}`,
      });

      setOrderSuccess({ id: orderId, numero: `ND-${orderId.slice(-4).toUpperCase()}` });
      if (onOrderCreated) {
        onOrderCreated(orderId);
      }
    } catch (err) {
      console.error('Error in customer checkout:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountPercent = config.precio_antes
    ? Math.round(((config.precio_antes - storeProduct.precio_venta) / config.precio_antes) * 100)
    : 35;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppRedirect = () => {
    const cleanPhone = store.whatsapp_contacto.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `¡Hola ${store.nombre_tienda}! Acabo de hacer el pedido #${orderSuccess?.numero || ''} de "${storeProduct.titulo_personalizado || product.nombre}" con pago contraentrega en ${ciudadEntrega}. Mi nombre es ${clienteNombre}. ¿Me confirman el despacho por favor?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[94vh] overflow-hidden border border-zinc-200">
        {/* Top Control Bar (Seller Tools) */}
        <div className="bg-zinc-900 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-zinc-200">
              Vista Previa: Landing Page de Alta Conversión
            </span>
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] hidden md:inline">
              Tienda: {store.nombre_tienda}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link copiado' : 'Copiar Link'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Landing Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Urgent Offer Banner */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white py-2 px-4 text-center font-black text-xs sm:text-sm tracking-wide shadow-xs flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
            <span>{config.oferta_etiqueta}</span>
            <span className="bg-black/25 px-2 py-0.5 rounded text-xs font-mono font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Store Micro-Header */}
          <header className="px-6 py-3.5 bg-white border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                style={{ backgroundColor: store.color_primario || '#059669' }}
              >
                {store.nombre_tienda.charAt(0)}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">
                  {store.nombre_tienda}
                </h4>
                <p className="text-[10px] text-zinc-500 font-medium">{store.slogan}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Compra 100% Segura
              </span>
            </div>
          </header>

          {/* Hero Section */}
          <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-3xl mx-auto space-y-6">
            {/* Catchy Headline */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>4.9 / 5 estrellas (+480 reseñas de compradores)</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-snug">
                {config.titular_gancho}
              </h1>
              <p className="text-xs sm:text-base text-zinc-600 max-w-xl mx-auto">
                {config.subtitulo_gancho}
              </p>
            </div>

            {/* Product Gallery & Visuals */}
            <div className="space-y-3">
              <div className="aspect-4/3 sm:aspect-16/9 rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-md relative">
                <img
                  src={activeImage}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-lg">
                  -{discountPercent}% DESCUENTO
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/85 backdrop-blur-md text-white p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Envío Nacional con Pago Contraentrega</span>
                  </div>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 24-48h
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.imagenes.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-center">
                  {product.imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === img
                          ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                          : 'border-zinc-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Card & Wholesaler Stock Urgency */}
            <div className="p-6 bg-gradient-to-br from-zinc-50 to-emerald-50/40 rounded-3xl border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                  Precio promocional hoy:
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">
                    {formatMoney(storeProduct.precio_venta, store.pais)}
                  </span>
                  {config.precio_antes && (
                    <span className="text-base sm:text-lg text-zinc-400 line-through font-bold">
                      {formatMoney(config.precio_antes, store.pais)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  ✅ Ahorras {formatMoney((config.precio_antes || storeProduct.precio_venta * 1.35) - storeProduct.precio_venta, store.pais)} hoy
                </p>
              </div>

              {/* Wholesaler Stock Alert */}
              <div className="sm:text-right space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300/80 rounded-full text-amber-900 font-black text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quedan {product.inventario_disponible} unidades</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Despachado desde Bodega Oficial en {store.pais === 'CO' ? 'Colombia' : 'Venezuela'}
                </p>
              </div>
            </div>

            {/* Variants Selector */}
            {product.variantes.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Selecciona tu versión / variante:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variantes.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 text-xs font-bold rounded-2xl border transition-all text-center cursor-pointer ${
                        selectedVariant === v
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Key Benefits List */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-base text-zinc-900">
                ¿Por qué te encantará este producto?
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {config.beneficios_clave.map((ben, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-150"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                      {ben}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee Seal */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-3.5">
              <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-blue-950">
                  Garantía Total de Satisfacción
                </h4>
                <p className="text-xs text-blue-800">{config.garantia_texto}</p>
              </div>
            </div>

            {/* Frictionless Direct Checkout Form */}
            <div id="checkout-form" className="pt-4">
              <div className="bg-gradient-to-b from-white to-zinc-50 p-6 sm:p-8 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-5">
                <div className="text-center space-y-1">
                  <div className="inline-block bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Paso 2: Datos de Envío
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950">
                    Pide Ahora y Paga al Recibir en tu Casa
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Diligencia este formulario. Te contactaremos por WhatsApp para coordinar la entrega.
                  </p>
                </div>

                {orderSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-emerald-950">
                        ¡Pedido Recibido con Éxito!
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1">
                        Orden #{orderSuccess.numero} registrada para <strong>{clienteNombre}</strong>.
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Total a pagar contraentrega:{' '}
                        <strong>{formatMoney(storeProduct.precio_venta, store.pais)}</strong>
                      </p>
                    </div>

                    <button
                      onClick={handleWhatsAppRedirect}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Confirmar Despacho por WhatsApp Ahora</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Nombre completo de quien recibe *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={clienteNombre}
                          onChange={(e) => setClienteNombre(e.target.value)}
                          placeholder="Ej. Juan Pérez"
                          className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Número de Celular / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          value={clienteTelefono}
                          onChange={(e) => setClienteTelefono(e.target.value)}
                          placeholder={store.pais === 'CO' ? '+57 300 123 4567' : '+58 412 123 4567'}
                          className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        El repartidor te llamará a este número antes de entregar.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-800 mb-1">
                          {store.pais === 'CO' ? 'Departamento *' : 'Estado *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
                          placeholder={store.pais === 'CO' ? 'Cundinamarca, Antioquia...' : 'Miranda, Carabobo...'}
                          className="w-full px-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-800 mb-1">
                          Ciudad / Municipio *
                        </label>
                        <input
                          type="text"
                          required
                          value={ciudadEntrega}
                          onChange={(e) => setCiudadEntrega(e.target.value)}
                          placeholder={store.pais === 'CO' ? 'Medellín, Cali, Bogotá...' : 'Caracas, Valencia...'}
                          className="w-full px-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Dirección exacta de entrega y barrio *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={direccionEntrega}
                          onChange={(e) => setDireccionEntrega(e.target.value)}
                          placeholder="Calle 123 #45-67, Apto 302, Barrio..."
                          className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Indicaciones adicionales (Opcional)
                      </label>
                      <input
                        type="text"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Ej: Dejar en portería, conjunto con reja blanca"
                        className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Method of payment reminder */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Pago Contraentrega (Pagas al recibir)
                      </span>
                      <strong className="text-emerald-950 text-sm">
                        {formatMoney(storeProduct.precio_venta, store.pais)}
                      </strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-101 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Registrando Pedido...</span>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          <span>{config.boton_cta_texto}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Testimonials */}
            {config.testimonios && config.testimonios.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-zinc-200">
                <h3 className="font-extrabold text-base text-zinc-900 text-center">
                  Opiniones de Clientes que ya lo Compraron
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {config.testimonios.map((testi, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(testi.calificacion)].map((_, starIdx) => (
                            <Star key={starIdx} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Comprador verificado
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 italic">"{testi.comentario}"</p>
                      <div className="text-[11px] font-bold text-zinc-900">
                        {testi.autor} • <span className="text-zinc-500 font-normal">{testi.ciudad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            {config.faq && config.faq.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-200">
                <h3 className="font-extrabold text-base text-zinc-900 text-center">
                  Preguntas Frecuentes
                </h3>
                <div className="space-y-2">
                  {config.faq.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-1.5"
                    >
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900">
                        {item.pregunta}
                      </h4>
                      <p className="text-xs text-zinc-600">{item.respuesta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
