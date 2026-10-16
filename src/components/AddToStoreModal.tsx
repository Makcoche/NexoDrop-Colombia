import React, { useState } from 'react';
import { Product, ProductLandingConfig, CountryCode } from '../types';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import {
  X,
  Store,
  Sparkles,
  CheckCircle,
  Truck,
  ShieldCheck,
  TrendingUp,
  Percent,
  Clock,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface Props {
  product: Product;
  onClose: () => void;
  onSuccess: (storeProductId: string) => void;
}

export const AddToStoreModal: React.FC<Props> = ({ product, onClose, onSuccess }) => {
  const {
    currentUser,
    currentCountry,
    getSellerStore,
    createOrUpdateStore,
    addProductToStore,
    calculateMargin,
  } = useApp();

  const sellerStore = getSellerStore();

  const suggestedPrice = product.precio_sugerido || Math.round(product.costo_proveedor * 1.8);
  const [precioVenta, setPrecioVenta] = useState<number>(suggestedPrice);
  const [customTitle, setCustomTitle] = useState(product.nombre);
  const [createLanding, setCreateLanding] = useState(true);
  const [headline, setHeadline] = useState(
    `🔥 ¡${product.nombre} Ahora con Descuento y Pago Contraentrega al Recibir!`
  );
  const [offerTag, setOfferTag] = useState(
    'OFERTA ESPECIAL POR TIEMPO LIMITADO • ENVÍO CONTRAENTREGA'
  );
  const [saving, setSaving] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const margin = calculateMargin(precioVenta, product.costo_proveedor, 15000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let tiendaId = sellerStore?.id;
      if (!tiendaId) {
        // Auto-create store if seller doesn't have one yet
        const defaultName = currentUser?.nombre_negocio || `Tienda de ${currentUser?.nombre || 'Vendedor'}`;
        tiendaId = await createOrUpdateStore({
          nombre_tienda: defaultName,
          pais: currentUser?.pais || currentCountry,
          slogan: 'Novedades y tecnología con pago contraentrega garantizado',
        });
      }

      const customLanding: Partial<ProductLandingConfig> = createLanding
        ? {
            titular_gancho: headline,
            oferta_etiqueta: offerTag,
            precio_antes: Math.round(precioVenta * 1.35),
            beneficios_clave: [
              'Pago seguro contraentrega: pagas en efectivo cuando el paquete llegue a tus manos',
              `Garantía directa de ${product.garantia_meses} meses con reposición inmediata`,
              `Despacho express estimado: ${product.tiempo_despacho_estimado}`,
              'Producto 100% original verificado en bodega mayorista',
            ],
            garantia_texto:
              product.condiciones_garantia ||
              `Garantía oficial de ${product.garantia_meses} meses respaldada por bodega.`,
            contador_oferta_activo: true,
            minutos_contador: 30,
            boton_cta_texto: '¡QUIERO PEDIRLO CON PAGO CONTRAENTREGA!',
          }
        : {};

      const storeProdId = await addProductToStore(
        product.id,
        tiendaId,
        precioVenta,
        customTitle,
        customLanding
      );

      setSuccessId(storeProdId);
      setTimeout(() => {
        onSuccess(storeProdId);
      }, 900);
    } catch (err) {
      console.error('Error adding product to store:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-zinc-900 leading-tight">
                Agregar a Mi Vitrina / Tienda
              </h2>
              <p className="text-[11px] text-zinc-500">
                Inventario de {product.proveedor_nombre} • {product.inventario_disponible} uds disponibles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Wholesaler Product Preview */}
          <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Mayorista: {product.proveedor_nombre}
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-zinc-900 truncate mt-1">
                {product.nombre}
              </h3>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                <span>
                  Costo: <strong className="text-zinc-800">{formatMoney(product.costo_proveedor, currentCountry)}</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  Stock bodega: {product.inventario_disponible} uds
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Margin Calculator */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-800">
              Tu Precio de Venta al Público ({currentCountry === 'CO' ? 'COP' : 'USD'})
            </label>
            <div className="relative">
              <input
                type="number"
                min={product.costo_proveedor}
                step={currentCountry === 'CO' ? '500' : '1'}
                value={precioVenta}
                onChange={(e) => setPrecioVenta(Number(e.target.value))}
                className="w-full text-base font-extrabold text-zinc-900 p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                required
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-zinc-400">
                {currentCountry === 'CO' ? 'COP ($)' : 'USD ($)'}
              </span>
            </div>

            {/* Financial breakdown */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-center">
              <div>
                <p className="text-[10px] text-emerald-800 font-medium">Costo Mayorista</p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5">
                  {formatMoney(product.costo_proveedor, currentCountry)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-800 font-medium">Envío + Plataforma</p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5">
                  {formatMoney(margin.envio + margin.comisionPlataforma, currentCountry)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-900 font-bold">Tu Ganancia Neta</p>
                <p className="text-xs font-black text-emerald-700 mt-0.5">
                  +{formatMoney(margin.gananciaEstimada, currentCountry)} ({margin.margenPorcentaje}%)
                </p>
              </div>
            </div>
          </div>

          {/* Custom title for the store */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-800">
              Nombre o Título en tu Vitrina
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full text-xs font-medium text-zinc-900 p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          {/* Landing Page Generator Toggle */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createLanding}
                onChange={(e) => setCreateLanding(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md border-zinc-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Crear Landing Page dedicada para pauta (Facebook / TikTok Ads)
                </span>
                <p className="text-[11px] text-zinc-500">
                  Página de alta conversión con temporizador de urgencia, beneficios y checkout contraentrega.
                </p>
              </div>
            </label>

            {createLanding && (
              <div className="space-y-2.5 pt-2 border-t border-zinc-200/80 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Titular Gancho (Headline persuasivo)
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Etiqueta de Oferta
                  </label>
                  <input
                    type="text"
                    value={offerTag}
                    onChange={(e) => setOfferTag(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-zinc-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !!successId}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {successId ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Agregado con Éxito!</span>
                </>
              ) : saving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publicar en Mi Vitrina</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
