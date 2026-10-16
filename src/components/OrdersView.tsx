import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatDateCO, getStatusBadge } from '../utils/formatters';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  onOpenNewOrder: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrdersView: React.FC<Props> = ({ onOpenNewOrder, onSelectOrder }) => {
  const { orders, currentRole, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('todas');

  const statusFilters: { id: string; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendiente_confirmacion', label: 'Pendiente confirmación' },
    { id: 'confirmado', label: 'Confirmado' },
    { id: 'en_preparacion', label: 'En preparación' },
    { id: 'despachado', label: 'Despachado' },
    { id: 'en_transito', label: 'En tránsito' },
    { id: 'entregado', label: 'Entregado' },
    { id: 'novedad', label: 'Con Novedad' },
    { id: 'cancelado', label: 'Cancelado' },
    { id: 'devuelto', label: 'Devuelto' },
  ];

  // Role filtering if role is 'proveedor', show assigned orders; otherwise show user orders or all for admin/soporte
  const visibleOrders = useMemo(() => {
    return orders.filter((o) => {
      // Multi-user role scope filter
      if (currentUser?.rol === 'proveedor') {
        const isSupplierMatch =
          o.proveedor_id === currentUser.id ||
          o.proveedor_id === 'prov-col-01' ||
          o.proveedor_id === 'prov-ven-01';
        if (!isSupplierMatch) return false;
      } else if (currentUser?.rol === 'vendedor') {
        const isSellerMatch =
          o.vendedor_id === currentUser.id ||
          o.vendedor_id === 'seller-demo-01' ||
          o.vendedor_id === 'seller-col-01' ||
          o.vendedor_id === 'seller-ven-01';
        if (!isSellerMatch) return false;
      }

      // Status filter
      if (selectedStatus !== 'todos' && o.estado !== selectedStatus) {
        return false;
      }

      // Carrier filter
      if (selectedCarrier !== 'todas' && o.transportadora !== selectedCarrier) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesOrder = o.numero_orden.toLowerCase().includes(query);
        const matchesClient = o.cliente_nombre.toLowerCase().includes(query);
        const matchesCity = o.ciudad_entrega.toLowerCase().includes(query);
        const matchesProduct = o.producto_nombre.toLowerCase().includes(query);
        const matchesGuia = o.numero_guia?.toLowerCase().includes(query);
        if (!matchesOrder && !matchesClient && !matchesCity && !matchesProduct && !matchesGuia) {
          return false;
        }
      }

      return true;
    });
  }, [orders, currentRole, currentUser, selectedStatus, selectedCarrier, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-zinc-500">
            Seguimiento de pedidos, novedades de transportadoras y liquidación estimada en pesos colombianos.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Pedido Manual</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por número de orden (ND-...), cliente, guía o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="todas">Todas las transportadoras</option>
              <option value="Coordinadora">Coordinadora</option>
              <option value="Servientrega">Servientrega</option>
              <option value="Interrapidísimo">Interrapidísimo</option>
              <option value="Envia">Envia</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {statusFilters.map((st) => {
            const count =
              st.id === 'todos'
                ? orders.length
                : orders.filter((o) => o.estado === st.id).length;
            const active = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    active ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        {visibleOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-base text-zinc-800">No hay pedidos con este criterio</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Intenta cambiar los filtros seleccionados o registra un nuevo pedido manual.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="p-4">Orden / Fecha</th>
                  <th className="p-4">Cliente / Destino</th>
                  <th className="p-4">Producto & Cant.</th>
                  <th className="p-4">Total Cobrado (COP)</th>
                  <th className="p-4">Ganancia Est.</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Guía / Envío</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {visibleOrders.map((order) => {
                  const badge = getStatusBadge(order.estado);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Order info */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-zinc-900 group-hover:text-emerald-700">
                          {order.numero_orden}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {formatDateCO(order.fecha_creacion)}
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="p-4">
                        <div className="font-bold text-zinc-800">{order.cliente_nombre}</div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                          {order.ciudad_entrega}, {order.departamento}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="p-4 max-w-[200px]">
                        <div className="font-semibold text-zinc-800 line-clamp-1">{order.producto_nombre}</div>
                        <div className="text-[11px] text-zinc-500">
                          {order.cantidad}x ({order.variante})
                        </div>
                      </td>

                      {/* Cobro */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-zinc-900">{formatCOP(order.precio_cobrado)}</div>
                        <span className="text-[10px] text-zinc-500 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">
                          {order.metodo_pago.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Ganancia */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-emerald-700">{formatCOP(order.ganancia_estimada)}</div>
                        <div className="text-[10px] text-zinc-400">
                          {order.costo_envio_confirmado ? 'Flete liquidado' : 'Flete estimado'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>

                      {/* Shipping info */}
                      <td className="p-4 whitespace-nowrap">
                        {order.transportadora ? (
                          <div className="space-y-0.5">
                            <span className="font-medium text-zinc-800 block text-[11px]">
                              {order.transportadora}
                            </span>
                            {order.numero_guia ? (
                              <span className="text-[10px] text-zinc-500 font-mono block">
                                Guía: {order.numero_guia}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 italic block">Sin número aún</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">Pendiente despacho</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
