import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatMoney, formatDateCO } from '../utils/formatters';
import {
  Boxes,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Edit2,
  Check,
  PauseCircle,
  PlayCircle,
  XCircle,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, updateProduct, currentRole, currentUser, currentCountry } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<'mis_productos' | 'todos'>(
    currentUser?.rol === 'proveedor' ? 'mis_productos' : 'todos'
  );
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);
  const [tempCost, setTempCost] = useState<number>(0);

  const filteredProducts = products.filter((p) => {
    // If supplier filter is 'mis_productos'
    if (currentUser?.rol === 'proveedor' && supplierFilter === 'mis_productos') {
      const isMyProduct =
        p.proveedor_id === currentUser.id ||
        p.proveedor_id === 'prov-col-01' ||
        p.proveedor_id === 'prov-ven-01';
      if (!isMyProduct) return false;
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.nombre.toLowerCase().includes(q) || p.proveedor_nombre.toLowerCase().includes(q);
  });

  const handleStartEdit = (p: Product) => {
    setEditingStockId(p.id);
    setTempStock(p.inventario_disponible);
    setTempCost(p.costo_proveedor);
  };

  const handleSaveEdit = async (p: Product) => {
    await updateProduct(p.id, {
      inventario_disponible: tempStock,
      costo_proveedor: tempCost,
      estado: tempStock <= 0 ? 'agotado' : p.estado === 'agotado' ? 'activo' : p.estado,
    });
    setEditingStockId(null);
  };

  const handleToggleStatus = async (p: Product) => {
    const nextStatus = p.estado === 'activo' ? 'pausado' : 'activo';
    await updateProduct(p.id, { estado: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            Control de Inventario Informativo
          </h1>
          <p className="text-xs text-zinc-500">
            Existencias sincronizadas con marcas de tiempo en tiempo real para evitar prometer stock desactualizado a
            tus clientes.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-700" />
          <span>Fechas auditadas por SKU</span>
        </div>
      </div>

      {/* Search & Warning Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Regla de Operación Dropshipping NexoDrop:</p>
          <p className="text-blue-800 text-[11px] mt-0.5">
            Cada vez que un proveedor o administrador actualiza las cantidades físicas en bodega, se actualiza la
            estampilla de tiempo para que los vendedores sepan con certeza la vigencia del stock.
          </p>
        </div>
      </div>

      {/* Supplier Role Scope Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        {currentUser?.rol === 'proveedor' && (
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <span className="text-xs font-bold text-zinc-600">Vista de Bodega:</span>
            <button
              onClick={() => setSupplierFilter('mis_productos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                supplierFilter === 'mis_productos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Mis Productos en Bodega
            </button>
            <button
              onClick={() => setSupplierFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                supplierFilter === 'todos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Catálogo General de la Red
            </button>
          </div>
        )}

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre de producto o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="p-4">Producto</th>
                <th className="p-4">Proveedor / Ubicación</th>
                <th className="p-4">Costo Mayorista</th>
                <th className="p-4">Inventario Informado</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Última Actualización</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((p) => {
                const isEditing = editingStockId === p.id;
                const isLowStock = p.inventario_disponible > 0 && p.inventario_disponible < 20;
                const isOut = p.inventario_disponible <= 0;

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Product */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imagenes[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 line-clamp-1">{p.nombre}</div>
                          <span className="text-[10px] text-zinc-400">ID: {p.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-zinc-800 block">{p.proveedor_nombre}</span>
                      <span className="text-[10px] text-zinc-500">{p.tiempo_despacho_estimado}</span>
                    </td>

                    {/* Cost */}
                    <td className="p-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="1000"
                          value={tempCost}
                          onChange={(e) => setTempCost(Number(e.target.value) || 0)}
                          className="w-24 p-1 text-xs font-bold border border-emerald-400 rounded"
                        />
                      ) : (
                        <strong className="text-zinc-900 font-bold">{formatMoney(p.costo_proveedor, currentCountry)}</strong>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempStock}
                          onChange={(e) => setTempStock(Number(e.target.value) || 0)}
                          className="w-20 p-1 text-xs font-bold border border-emerald-400 rounded"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              isOut ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            {p.inventario_disponible} unid.
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              Stock bajo
                            </span>
                          )}
                          {isOut && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                              Agotado
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.estado === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.estado === 'pausado'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>

                    {/* Last Updated Timestamp */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-zinc-600 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDateCO(p.ultima_actualizacion_inventario)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap space-x-1">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(p)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700"
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          title="Actualizar stock y costo"
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Actualizar</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleStatus(p)}
                        title={p.estado === 'activo' ? 'Pausar producto' : 'Activar producto'}
                        className="p-1 text-zinc-400 hover:text-zinc-700 rounded"
                      >
                        {p.estado === 'activo' ? (
                          <PauseCircle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
