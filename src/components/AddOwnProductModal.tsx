import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import {
  X,
  Package,
  Sparkles,
  CheckCircle,
  Truck,
  ShieldCheck,
  TrendingUp,
  Plus,
  Image as ImageIcon,
  Tag,
  Layers,
  Clock,
  Store,
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: (productId: string, storeProductId: string) => void;
}

const PRESET_SAMPLE_IMAGES = [
  { label: 'Tecnología / Smart', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'Belleza / Cosméticos', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80' },
  { label: 'Moda / Calzado', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { label: 'Hogar / Accesorios', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Audio / Auriculares', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
];

export const AddOwnProductModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const {
    currentUser,
    currentCountry,
    getSellerStore,
    createOrUpdateStore,
    createOwnProductForStore,
    calculateMargin,
  } = useApp();

  const store = getSellerStore();

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Tecnología');
  const [descripcion, setDescripcion] = useState('');
  const [costoBase, setCostoBase] = useState<number>(35000);
  const [precioVenta, setPrecioVenta] = useState<number>(79900);
  const [stock, setStock] = useState<number>(25);
  const [variantesInput, setVariantesInput] = useState('Negro, Blanco, Azul');
  const [imageUrl, setImageUrl] = useState(PRESET_SAMPLE_IMAGES[0].url);
  const [tiempoDespacho, setTiempoDespacho] = useState('Despacho en 24 horas');
  const [garantiaMeses, setGarantiaMeses] = useState<number>(3);
  const [condicionesGarantia, setCondicionesGarantia] = useState(
    'Garantía directa de nuestra tienda por 90 días ante cualquier falla de fábrica.'
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const margin = calculateMargin(precioVenta, costoBase, 15000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setSaving(true);
    try {
      let tiendaId = store?.id;
      if (!tiendaId) {
        tiendaId = await createOrUpdateStore({
          nombre_tienda: currentUser?.nombre_negocio || `Tienda de ${currentUser?.nombre || 'Vendedor'}`,
          pais: currentUser?.pais || currentCountry,
        });
      }

      const variantes = variantesInput
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const result = await createOwnProductForStore({
        tiendaId,
        nombre,
        categoria,
        descripcion,
        costoBase,
        precioVenta,
        stock,
        variantes: variantes.length > 0 ? variantes : ['Estándar'],
        imagenes: [imageUrl],
        garantiaMeses,
        tiempoDespacho,
        condicionesGarantia,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess(result.productId, result.storeProductId);
      }, 900);
    } catch (err) {
      console.error('Error creating own product:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-zinc-900 leading-tight">
                Agregar Producto Propio de Mi Tienda
              </h2>
              <p className="text-[11px] text-zinc-500">
                Publica tus propios artículos en tu vitrina con tu inventario personal y genera su landing page de venta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* General Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Datos Básicos del Producto
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nombre del Producto Propio *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Kit Reloj Smartwatch + Manilla de Cuero Edición Limitada"
                className="w-full text-xs font-semibold p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium"
                >
                  <option value="Tecnología">Tecnología & Gadgets</option>
                  <option value="Belleza">Belleza & Cuidado Personal</option>
                  <option value="Hogar">Hogar & Cocina</option>
                  <option value="Moda">Moda, Ropa & Calzado</option>
                  <option value="Deportes">Deportes & Fitness</option>
                  <option value="Accesorios">Accesorios & Joyería</option>
                  <option value="Salud">Salud & Bienestar</option>
                  <option value="Otros">Otro / Novedades</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Variantes (separadas por coma)
                </label>
                <input
                  type="text"
                  value={variantesInput}
                  onChange={(e) => setVariantesInput(e.target.value)}
                  placeholder="Ej: Negro, Blanco, Dorado ó S, M, L"
                  className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Descripción & Características Principales *
              </label>
              <textarea
                rows={3}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el producto, sus usos principales, qué incluye el paquete y por qué tu cliente debe comprarlo hoy..."
                className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing, Cost & Stock */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Precios, Margen y Stock de Almacén
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tu Costo de Compra / Base
                </label>
                <input
                  type="number"
                  min={0}
                  step={currentCountry === 'CO' ? '500' : '1'}
                  value={costoBase}
                  onChange={(e) => setCostoBase(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Precio de Venta al Cliente *
                </label>
                <input
                  type="number"
                  min={costoBase}
                  step={currentCountry === 'CO' ? '500' : '1'}
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(Number(e.target.value))}
                  className="w-full text-xs font-extrabold text-emerald-800 p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Stock Propio Disponible *
                </label>
                <input
                  type="number"
                  min={1}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full text-xs font-bold p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Profit margin live preview */}
            <div className="grid grid-cols-3 gap-2 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-center">
              <div>
                <p className="text-[10px] text-emerald-800 font-medium">Costo de tu Producto</p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5">
                  {formatMoney(costoBase, currentCountry)}
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

          {/* Image & Presentation */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Imagen Principal del Producto
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                URL de la Imagen (Directa) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Sample presets */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">
                O selecciona una imagen de muestra para comenzar:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SAMPLE_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image preview */}
            {imageUrl && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs bg-zinc-100">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Logistics & Warranty */}
          <div className="space-y-3 pt-2 border-t border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              4. Despacho y Garantía
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tiempo de Despacho Estimado
                </label>
                <input
                  type="text"
                  value={tiempoDespacho}
                  onChange={(e) => setTiempoDespacho(e.target.value)}
                  className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Garantía (Meses)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={garantiaMeses}
                  onChange={(e) => setGarantiaMeses(Number(e.target.value))}
                  className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Condiciones de Garantía
              </label>
              <input
                type="text"
                value={condicionesGarantia}
                onChange={(e) => setCondicionesGarantia(e.target.value)}
                className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Producto Creado y Publicado!</span>
                </>
              ) : saving ? (
                <span>Guardando Producto Propio...</span>
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
