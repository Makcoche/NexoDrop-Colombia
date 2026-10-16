import React, { useState, useMemo } from 'react';
import { Product, CountryCode } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatMoney } from '../utils/formatters';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import {
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  Bookmark,
  Truck,
  Star,
  CheckCircle,
  Clock,
  Layers,
  ArrowUpDown,
  Tag,
  Globe,
  Store,
  Plus,
} from 'lucide-react';
import { AddToStoreModal } from './AddToStoreModal';

interface Props {
  onSelectProduct: (product: Product) => void;
  onOpenOrderModal: (product: Product) => void;
  onNavigateToStore?: () => void;
}

export const CatalogView: React.FC<Props> = ({
  onSelectProduct,
  onOpenOrderModal,
  onNavigateToStore,
}) => {
  const {
    products,
    suppliers,
    savedProducts,
    saveProductForSeller,
    removeSavedProduct,
    calculateMargin,
    currentCountry,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<'todos' | 'CO' | 'VE'>(currentCountry);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('todos');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('todos');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'recientes' | 'precio_menor' | 'precio_mayor' | 'margen_mayor'>('recientes');
  const [addToStoreProduct, setAddToStoreProduct] = useState<Product | null>(null);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.categoria));
    return ['todas', ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (
          searchTerm.trim() &&
          !p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !p.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Country filter
        if (selectedCountryFilter === 'CO') {
          const isCol = !p.proveedor_id.startsWith('prov-ven') && !p.id.startsWith('prod-ven');
          if (!isCol) return false;
        } else if (selectedCountryFilter === 'VE') {
          const isVen = p.proveedor_id.startsWith('prov-ven') || p.id.startsWith('prod-ven');
          if (!isVen) return false;
        }

        // Category
        if (selectedCategory !== 'todas' && p.categoria !== selectedCategory) {
          return false;
        }

        // Supplier
        if (selectedSupplier !== 'todos' && p.proveedor_id !== selectedSupplier) {
          return false;
        }

        // Stock
        if (selectedStockStatus === 'en_stock' && p.inventario_disponible <= 0) return false;
        if (selectedStockStatus === 'mas_de_50' && p.inventario_disponible < 50) return false;

        // Price range
        if (minPrice !== '' && p.costo_proveedor < minPrice) return false;
        if (maxPrice !== '' && p.costo_proveedor > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'precio_menor') return a.costo_proveedor - b.costo_proveedor;
        if (sortBy === 'precio_mayor') return b.costo_proveedor - a.costo_proveedor;
        if (sortBy === 'margen_mayor') {
          const marginA = (a.precio_sugerido || a.costo_proveedor * 1.8) - a.costo_proveedor;
          const marginB = (b.precio_sugerido || b.costo_proveedor * 1.8) - b.costo_proveedor;
          return marginB - marginA;
        }
        return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
      });
  }, [products, searchTerm, selectedCategory, selectedSupplier, selectedStockStatus, minPrice, maxPrice, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header and Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Catálogo de Productos</h1>
            <p className="text-xs text-zinc-500">
              Explora artículos de proveedores mayoristas con stock verificado en Colombia y Venezuela.
            </p>
          </div>

          {/* Country Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedCountryFilter('todos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCountryFilter === 'todos'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Todos ({products.length})</span>
            </button>

            <button
              onClick={() => setSelectedCountryFilter('CO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCountryFilter === 'CO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-emerald-700'
              }`}
            >
              <ColombiaFlag className="w-4 h-3 inline" />
              <span>Colombia</span>
            </button>

            <button
              onClick={() => setSelectedCountryFilter('VE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCountryFilter === 'VE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-blue-700'
              }`}
            >
              <VenezuelaFlag className="w-4 h-3 inline" />
              <span>Venezuela</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por producto, palabra clave, categoría o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden text-zinc-800 placeholder-zinc-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'todas' ? 'Todas las categorías' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Proveedor Mayorista
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="todos">Todos los proveedores</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre_comercial} ({s.ciudad})
                </option>
              ))}
            </select>
          </div>

          {/* Stock availability */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Disponibilidad
            </label>
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="todos">Cualquier inventario</option>
              <option value="en_stock">En stock disponible (&gt;0)</option>
              <option value="mas_de_50">Alto stock (&gt;50 unidades)</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Costo Máx. Proveedor
            </label>
            <input
              type="number"
              step="5000"
              placeholder="Ej. 50000 COP"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Ordenar Por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio_menor">Costo: menor a mayor</option>
              <option value="precio_mayor">Costo: mayor a menor</option>
              <option value="margen_mayor">Mayor margen estimado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
          <Search className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-base text-zinc-800">No se encontraron productos con estos filtros</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Intenta cambiar los términos de búsqueda o limpiar los filtros seleccionados para ver más resultados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todas');
              setSelectedSupplier('todos');
              setSelectedStockStatus('todos');
              setMaxPrice('');
            }}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs rounded-xl"
          >
            Limpiar todos los filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const isSaved = savedProducts.some((s) => s.producto_id === prod.id);
            const precioVentaSugerido = prod.precio_sugerido || prod.costo_proveedor * 1.8;
            const margin = calculateMargin(precioVentaSugerido, prod.costo_proveedor, 15000);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-4/3 bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(prod)}>
                    <img
                      src={prod.imagenes[0]}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {prod.categoria}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      Stock: {prod.inventario_disponible}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {/* Supplier tag */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <Truck className="w-3.5 h-3.5 text-zinc-400" />
                        {prod.proveedor_nombre}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        4.8
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectProduct(prod)}
                      className="font-bold text-sm text-zinc-900 hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {prod.nombre}
                    </h3>

                    {/* Variants preview */}
                    {prod.variantes && prod.variantes.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Layers className="w-3 h-3 text-zinc-400" />
                        <span>{prod.variantes.length} variantes disponibles</span>
                      </div>
                    )}

                    {/* Financial Card */}
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Costo proveedor:</span>
                        <strong className="text-zinc-900 font-bold">{formatMoney(prod.costo_proveedor, currentCountry)}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Precio sugerido:</span>
                        <span className="text-zinc-700 font-medium">{formatMoney(precioVentaSugerido, currentCountry)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200 text-xs">
                        <span className="font-semibold text-emerald-950">Ganancia est.:</span>
                        <span className="font-black text-emerald-700">{formatMoney(margin.gananciaEstimada, currentCountry)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => setAddToStoreProduct(prod)}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>➕ Agregar a Mi Vitrina / Tienda</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Ver Detalle
                    </button>

                    <button
                      onClick={() => onOpenOrderModal(prod)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Crear Pedido</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add To Store Modal */}
      {addToStoreProduct && (
        <AddToStoreModal
          product={addToStoreProduct}
          onClose={() => setAddToStoreProduct(null)}
          onSuccess={() => {
            setAddToStoreProduct(null);
            if (onNavigateToStore) {
              onNavigateToStore();
            }
          }}
        />
      )}
    </div>
  );
};
