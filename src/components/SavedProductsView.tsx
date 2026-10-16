import React, { useState } from 'react';
import { Product, SavedProduct } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatMoney, formatDateCO } from '../utils/formatters';
import { GeminiCopyModal } from './GeminiCopyModal';
import {
  Bookmark,
  Trash2,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Edit2,
  Check,
  Calculator,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onSelectProduct: (product: Product) => void;
  onOpenOrderModal: (product: Product, variante?: string, precioVenta?: number) => void;
  onNavigateToCatalog: () => void;
}

export const SavedProductsView: React.FC<Props> = ({
  onSelectProduct,
  onOpenOrderModal,
  onNavigateToCatalog,
}) => {
  const {
    savedProducts,
    products,
    removeSavedProduct,
    saveProductForSeller,
    calculateMargin,
    currentUser,
    currentCountry,
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [activeGeminiProduct, setActiveGeminiProduct] = useState<Product | null>(null);

  const userSavedProducts = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.rol === 'admin') return savedProducts;
    return savedProducts.filter(
      (s) =>
        s.vendedor_id === currentUser.id ||
        s.vendedor_id === 'seller-demo-01' ||
        s.vendedor_id === 'seller-col-01' ||
        s.vendedor_id === 'seller-ven-01'
    );
  }, [savedProducts, currentUser]);

  const handleStartEdit = (saved: SavedProduct) => {
    setEditingId(saved.id);
    setEditPrice(saved.precio_venta);
  };

  const handleSavePrice = async (saved: SavedProduct) => {
    await saveProductForSeller(saved.producto_id, editPrice, saved.notas);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            Productos Guardados y Precios Personalizados
          </h1>
          <p className="text-xs text-zinc-500">
            Artículos guardados por tu negocio con tu precio de venta final definido y margen estimado en COP.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-zinc-100 rounded-lg text-zinc-700">
          {userSavedProducts.length} productos guardados
        </div>
      </div>

      {userSavedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
          <Bookmark className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-base text-zinc-800">No tienes productos guardados todavía</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Explora el catálogo y pulsa "Guardar" en los productos que quieras comercializar para definir tu precio de
            venta y proyectar tus ganancias.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userSavedProducts.map((saved) => {
            const product = products.find((p) => p.id === saved.producto_id);
            if (!product) return null;

            const margin = calculateMargin(saved.precio_venta, product.costo_proveedor, 15000);

            return (
              <div
                key={saved.id}
                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top info */}
                  <div className="flex gap-4">
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre}
                      className="w-20 h-20 rounded-xl object-cover border border-zinc-200 shrink-0 cursor-pointer"
                      onClick={() => onSelectProduct(product)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                          {product.categoria}
                        </span>
                        <button
                          onClick={() => removeSavedProduct(saved.id)}
                          title="Quitar de guardados"
                          className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-bold text-sm text-zinc-900 hover:text-emerald-700 line-clamp-2 cursor-pointer leading-snug"
                      >
                        {product.nombre}
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Proveedor: <strong>{product.proveedor_nombre}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Margins Box */}
                  <div className="mt-4 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">Costo del proveedor:</span>
                      <strong className="text-xs text-zinc-900">{formatCOP(product.costo_proveedor)}</strong>
                    </div>

                    {/* Editable Selling Price */}
                    <div className="flex items-center justify-between border-t border-emerald-100 pt-1.5">
                      <span className="text-xs font-semibold text-zinc-800">Tu precio de venta:</span>
                      {editingId === saved.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="1000"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value) || 0)}
                            className="w-24 px-2 py-0.5 text-xs font-bold bg-white border border-emerald-400 rounded focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleSavePrice(saved)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-zinc-900">{formatCOP(saved.precio_venta)}</span>
                          <button
                            onClick={() => handleStartEdit(saved)}
                            className="p-1 text-zinc-400 hover:text-emerald-700"
                            title="Editar precio"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Calculated estimated margin */}
                    <div className="flex items-center justify-between border-t border-emerald-200 pt-2 text-xs font-bold">
                      <span className="text-emerald-950">Ganancia orientativa neta:</span>
                      <span className="text-emerald-700 font-black text-sm">
                        {formatCOP(margin.gananciaEstimada)} ({margin.margenPorcentaje}%)
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-2">
                    Guardado el {formatDateCO(saved.fecha_guardado)}
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => setActiveGeminiProduct(product)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold rounded-xl text-xs transition-colors border border-purple-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Crear Anuncio IA</span>
                  </button>

                  <button
                    onClick={() => onOpenOrderModal(product, undefined, saved.precio_venta)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Crear Pedido</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeGeminiProduct && (
        <GeminiCopyModal product={activeGeminiProduct} onClose={() => setActiveGeminiProduct(null)} />
      )}
    </div>
  );
};
