import React, { useState, useMemo } from 'react';
import { SellerStore, StoreProductItem, Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import {
  X,
  Search,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  Star,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Props {
  store: SellerStore;
  onClose: () => void;
  onOpenProductLanding: (storeProduct: StoreProductItem, product: Product) => void;
}

export const StorePublicModal: React.FC<Props> = ({
  store,
  onClose,
  onOpenProductLanding,
}) => {
  const { products, getStoreProducts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const storeProducts = getStoreProducts(store.id);

  const filteredItems = useMemo(() => {
    return storeProducts
      .filter((sp) => sp.en_vitrina)
      .map((sp) => {
        const prod = products.find((p) => p.id === sp.producto_id);
        return { storeProduct: sp, product: prod };
      })
      .filter((item): item is { storeProduct: StoreProductItem; product: Product } => {
        if (!item.product) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          item.product.nombre.toLowerCase().includes(q) ||
          (item.storeProduct.titulo_personalizado &&
            item.storeProduct.titulo_personalizado.toLowerCase().includes(q)) ||
          item.product.categoria.toLowerCase().includes(q)
        );
      });
  }, [storeProducts, products, searchTerm]);

  const handleWhatsAppOrder = (item: { storeProduct: StoreProductItem; product: Product }) => {
    const cleanPhone = store.whatsapp_contacto.replace(/[^0-9]/g, '');
    const title = item.storeProduct.titulo_personalizado || item.product.nombre;
    const price = formatMoney(item.storeProduct.precio_venta, store.pais);
    const msg = encodeURIComponent(
      `¡Hola ${store.nombre_tienda}! Estoy interesado en comprar "${title}" por ${price} con pago contraentrega. ¿Tienen disponibilidad inmediata para despachar?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-0 sm:p-4">
      <div className="bg-zinc-100 w-full max-w-5xl sm:rounded-3xl shadow-2xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[94vh] overflow-hidden border border-zinc-200">
        {/* Top Control Header */}
        <div className="bg-zinc-900 text-white px-4 sm:px-6 py-2 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold">Vista Pública de Tienda en Línea</span>
            <span className="text-zinc-400 text-[10px] hidden sm:inline">
              (Así es como tus clientes ven tu vitrina)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storefront Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Store Banner */}
          <div
            className="relative py-10 px-6 sm:px-12 text-white overflow-hidden shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${store.color_primario || '#059669'} 0%, #0f172a 100%)`,
            }}
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white text-zinc-900 shadow-xl flex items-center justify-center font-black text-3xl shrink-0 border-2 border-white/40">
                {store.nombre_tienda.charAt(0)}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {store.nombre_tienda}
                  </h1>
                  <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    {store.pais === 'CO' ? <ColombiaFlag className="w-3.5 h-2.5" /> : <VenezuelaFlag className="w-3.5 h-2.5" />}
                    {store.pais === 'CO' ? 'Colombia' : 'Venezuela'}
                  </span>
                  <span className="bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verificada
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium max-w-xl">
                  {store.slogan}
                </p>
                <p className="text-[11px] text-zinc-300/80 leading-relaxed max-w-2xl">
                  {store.descripcion}
                </p>
              </div>

              {/* Direct WhatsApp Contact Button */}
              {store.whatsapp_contacto && (
                <button
                  onClick={() => {
                    const cleanPhone = store.whatsapp_contacto.replace(/[^0-9]/g, '');
                    window.open(
                      `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(store.nombre_tienda)},%20quisiera%20hacer%20una%20consulta%20de%20sus%20productos`,
                      '_blank'
                    );
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-black/20 flex items-center gap-2 transition-transform hover:scale-103 shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar Asesor</span>
                </button>
              )}
            </div>
          </div>

          {/* Info Trust Bar */}
          <div className="bg-white border-b border-zinc-200 px-4 py-3">
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-zinc-700">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Pago Contraentrega en tu Puerta</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-zinc-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía de Satisfacción Total</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-zinc-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Despacho Express 24 a 48 Horas</span>
              </div>
            </div>
          </div>

          {/* Store Showcase Catalog */}
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  Productos en Vitrina ({filteredItems.length})
                </h2>
                <p className="text-xs text-zinc-500">
                  Haz clic en cualquier producto para ver su landing page completa o pedir contraentrega.
                </p>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en la vitrina..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden shadow-2xs"
                />
              </div>
            </div>

            {/* Products Grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800">No hay productos disponibles</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Agrega productos desde el Catálogo Mayorista para exhibirlos en esta vitrina.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map(({ storeProduct, product }) => (
                  <div
                    key={storeProduct.id}
                    className="bg-white rounded-3xl border border-zinc-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image */}
                      <div
                        className="relative aspect-4/3 bg-zinc-100 overflow-hidden cursor-pointer"
                        onClick={() => onOpenProductLanding(storeProduct, product)}
                      >
                        <img
                          src={product.imagenes[0]}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          {product.categoria}
                        </div>
                        {storeProduct.destacado && (
                          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Destacado
                          </div>
                        )}
                        <div className="absolute bottom-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Pago Contraentrega
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2.5">
                        <h3
                          onClick={() => onOpenProductLanding(storeProduct, product)}
                          className="font-bold text-sm text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
                        >
                          {storeProduct.titulo_personalizado || product.nombre}
                        </h3>

                        {/* Price & Savings */}
                        <div className="pt-1 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-zinc-400 font-medium">Precio oferta:</span>
                            <div className="text-xl font-black text-emerald-800">
                              {formatMoney(storeProduct.precio_venta, store.pais)}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 font-semibold block">
                              Stock bodega:
                            </span>
                            <span className="text-xs font-bold text-zinc-800">
                              {product.inventario_disponible} disponibles
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenProductLanding(storeProduct, product)}
                        className="w-full py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ver Landing</span>
                      </button>

                      <button
                        onClick={() => handleWhatsAppOrder({ storeProduct, product })}
                        className="w-full py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pedir WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
