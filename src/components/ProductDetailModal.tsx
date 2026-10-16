import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatMoney, formatDateCO } from '../utils/formatters';
import { GeminiCopyModal } from './GeminiCopyModal';
import {
  X,
  Bookmark,
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Calculator,
  ArrowRight,
  Store,
} from 'lucide-react';
import { AddToStoreModal } from './AddToStoreModal';

interface Props {
  product: Product;
  onClose: () => void;
  onOpenOrderModal: (product: Product, variante?: string, precioVenta?: number) => void;
  onNavigateToStore?: () => void;
}

export const ProductDetailModal: React.FC<Props> = ({
  product,
  onClose,
  onOpenOrderModal,
  onNavigateToStore,
}) => {
  const {
    saveProductForSeller,
    savedProducts,
    removeSavedProduct,
    calculateMargin,
    currentUser,
    currentCountry,
  } = useApp();

  const [activeImage, setActiveImage] = useState(product.imagenes[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(product.variantes[0] || 'Estándar');
  const [precioVenta, setPrecioVenta] = useState<number>(product.precio_sugerido || product.costo_proveedor * 1.8);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [showAddToStoreModal, setShowAddToStoreModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isSaved = savedProducts.some((s) => s.producto_id === product.id);
  const existingSaved = savedProducts.find((s) => s.producto_id === product.id);

  const margin = calculateMargin(precioVenta, product.costo_proveedor, 15000);

  const handleSaveToggle = async () => {
    if (isSaved && existingSaved) {
      await removeSavedProduct(existingSaved.id);
    } else {
      await saveProductForSeller(product.id, precioVenta, 'Guardado desde catálogo');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                {product.categoria}
              </span>
              <span className="text-xs text-zinc-500">ID: {product.id}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Gallery */}
              <div className="space-y-3">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 relative group">
                  <img
                    src={activeImage}
                    alt={product.nombre}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    Stock: {product.inventario_disponible} unidades
                  </div>
                </div>

                {/* Thumbnail strip */}
                {product.imagenes.length > 1 && (
                  <div className="flex gap-2">
                    {product.imagenes.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === img ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-zinc-200 opacity-70'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Supplier Information Card */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      Proveedor Verificado
                    </span>
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ★ 4.8 / 5.0
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-800">{product.proveedor_nombre}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Despacho: {product.tiempo_despacho_estimado}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Garantía: {product.garantia_meses} meses</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 pt-1">
                    Última sincronización de stock:{' '}
                    <strong>{formatDateCO(product.ultima_actualizacion_inventario)}</strong>
                  </p>
                </div>
              </div>

              {/* Product Info & Margin Calculator */}
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-900 leading-snug">{product.nombre}</h2>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{product.descripcion}</p>
                </div>

                {/* Variants Selection */}
                {product.variantes && product.variantes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Variante seleccionada:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {product.variantes.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                            selectedVariant === v
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Margin Calculator Box (Specification Requirement) */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calculator className="w-4 h-4 text-emerald-700" />
                      Calculadora de Margen ({currentCountry === 'CO' ? 'Colombia - COP' : 'Venezuela - USD Ref.'})
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">Fórmula transparente</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-600 block">Costo Proveedor:</span>
                      <strong className="text-sm font-bold text-zinc-900">{formatMoney(product.costo_proveedor, currentCountry)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-600 block">Precio Sugerido:</span>
                      <span className="text-sm font-semibold text-zinc-700">
                        {formatMoney(product.precio_sugerido, currentCountry)}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Seller Price input */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Define tu precio de venta final al cliente:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        step={currentCountry === 'CO' ? '1000' : '1'}
                        value={precioVenta}
                        onChange={(e) => setPrecioVenta(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-16 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-zinc-900 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-semibold">
                        {currentCountry === 'CO' ? 'COP' : 'USD'}
                      </span>
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <div className="space-y-1.5 pt-1 text-xs border-t border-emerald-100">
                    <div className="flex justify-between text-zinc-600">
                      <span>Costo del producto:</span>
                      <span>- {formatMoney(product.costo_proveedor, currentCountry)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span className="flex items-center gap-1">
                        Flete nacional estimado:
                        <span className="text-[10px] text-amber-700 font-semibold">(Sujeto a transportadora)</span>
                      </span>
                      <span>- {formatMoney(margin.envio, currentCountry)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Comisión plataforma (5%):</span>
                      <span>- {formatMoney(margin.comisionPlataforma, currentCountry)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                      <span className="font-bold text-emerald-950 text-sm">Ganancia estimada neta:</span>
                      <div className="text-right">
                        <span
                          className={`font-black text-lg ${
                            margin.gananciaEstimada > 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {formatMoney(margin.gananciaEstimada, currentCountry)}
                        </span>
                        <span className="block text-[11px] font-semibold text-emerald-800">
                          Margen aprox: {margin.margenPorcentaje}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 italic">
                    * Nota legal: Las cifras son orientativas hasta confirmar la guía de envío y recaudo contraentrega.
                  </p>
                </div>

                {/* Warranty conditions */}
                {product.condiciones_garantia && (
                  <div className="text-xs p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="font-bold text-zinc-700 block mb-0.5">Condiciones de Garantía:</span>
                    <p className="text-zinc-600">{product.condiciones_garantia}</p>
                  </div>
                )}

                {/* Primary CTA buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setShowAddToStoreModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold py-3 px-4 rounded-xl shadow-xs text-xs sm:text-sm cursor-pointer transition-colors"
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>➕ Agregar a Mi Vitrina / Tienda</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenOrderModal(product, selectedVariant, precioVenta);
                      }}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 text-xs sm:text-sm cursor-pointer transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Crear Pedido Manual</span>
                    </button>

                    <button
                      onClick={() => setShowGeminiModal(true)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Crear Anuncio con IA</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSaveToggle}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs border transition-colors ${
                      isSaved
                        ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>
                      {isSaved ? 'Producto en Guardados (Haz clic para quitar)' : 'Guardar en mis productos favoritos'}
                    </span>
                    {saveSuccess && <span className="text-emerald-700 font-bold ml-1">✓ Guardado</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGeminiModal && (
        <GeminiCopyModal product={product} onClose={() => setShowGeminiModal(false)} />
      )}

      {showAddToStoreModal && (
        <AddToStoreModal
          product={product}
          onClose={() => setShowAddToStoreModal(false)}
          onSuccess={() => {
            setShowAddToStoreModal(false);
            if (onNavigateToStore) {
              onClose();
              onNavigateToStore();
            }
          }}
        />
      )}
    </>
  );
};
