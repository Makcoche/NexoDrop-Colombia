import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCOP, formatMoney, formatDateCO } from '../utils/formatters';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bookmark,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  PlusCircle,
  Truck,
  Boxes,
  Building2,
  Send,
  Eye,
  Store,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
  onOpenProductDetail: (productId: string) => void;
  onOpenNewOrder: () => void;
}

export const DashboardView: React.FC<Props> = ({
  onNavigate,
  onOpenProductDetail,
  onOpenNewOrder,
}) => {
  const { orders, products, savedProducts, currentUser, currentCountry } = useApp();

  const isSupplier = currentUser?.rol === 'proveedor';
  const isAdmin = currentUser?.rol === 'admin';

  // Scoped orders based on role
  const scopedOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.rol === 'admin' || currentUser.rol === 'soporte') return orders;
    if (currentUser.rol === 'proveedor') {
      return orders.filter(
        (o) =>
          o.proveedor_id === currentUser.id ||
          o.proveedor_id === 'prov-col-01' ||
          o.proveedor_id === 'prov-ven-01'
      );
    }
    // Vendedor
    return orders.filter(
      (o) =>
        o.vendedor_id === currentUser.id ||
        o.vendedor_id === 'seller-demo-01' ||
        o.vendedor_id === 'seller-col-01' ||
        o.vendedor_id === 'seller-ven-01'
    );
  }, [orders, currentUser]);

  // Supplier products
  const supplierProducts = useMemo(() => {
    if (!currentUser) return [];
    if (isSupplier) {
      return products.filter(
        (p) =>
          p.proveedor_id === currentUser.id ||
          p.proveedor_id === 'prov-col-01' ||
          p.proveedor_id === 'prov-ven-01'
      );
    }
    return products;
  }, [products, currentUser, isSupplier]);

  // Metrics for Vendedor
  const sellerNuevos = scopedOrders.filter((o) => o.estado === 'pendiente_confirmacion').length;
  const sellerEnProceso = scopedOrders.filter((o) =>
    ['confirmado', 'en_preparacion', 'despachado', 'en_transito'].includes(o.estado)
  ).length;
  const sellerEntregados = scopedOrders.filter((o) => o.estado === 'entregado').length;
  const sellerNovedades = scopedOrders.filter((o) => o.estado === 'novedad').length;

  const totalVentas = scopedOrders.reduce((acc, curr) => acc + (curr.precio_cobrado || 0), 0);
  const totalCostosProductos = scopedOrders.reduce((acc, curr) => acc + (curr.costo_producto || 0), 0);
  const totalFletesEstimados = scopedOrders.reduce((acc, curr) => acc + (curr.costo_envio || 15000), 0);
  const totalComisiones = scopedOrders.reduce((acc, curr) => acc + (curr.comision_plataforma || 0), 0);
  const totalGananciaEstimada = scopedOrders.reduce((acc, curr) => acc + (curr.ganancia_estimada || 0), 0);

  // Metrics for Proveedor
  const supplierPorAlistar = scopedOrders.filter((o) =>
    ['confirmado', 'en_preparacion'].includes(o.estado)
  );
  const supplierEnRuta = scopedOrders.filter((o) =>
    ['despachado', 'en_transito'].includes(o.estado)
  );
  const supplierEntregados = scopedOrders.filter((o) => o.estado === 'entregado');
  const supplierTotalUnidadesStock = supplierProducts.reduce(
    (acc, curr) => acc + (curr.inventario_disponible || 0),
    0
  );
  const supplierFacturacionBodega = scopedOrders.reduce(
    (acc, curr) => acc + (curr.costo_producto || 0),
    0
  );

  const pendingConfirmations = scopedOrders.filter((o) => o.estado === 'pendiente_confirmacion');
  const activeNovedades = scopedOrders.filter((o) => o.estado === 'novedad');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-zinc-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-zinc-800/80 text-zinc-300 text-xs px-3 py-1 rounded-full border border-zinc-700 font-medium">
              <span className="flex items-center gap-1.5">
                {currentCountry === 'CO' ? (
                  <>
                    <ColombiaFlag className="w-4 h-3 inline" /> Mercado Colombia
                  </>
                ) : (
                  <>
                    <VenezuelaFlag className="w-4 h-3 inline" /> Mercado Venezuela
                  </>
                )}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                {isSupplier ? 'Rol: Proveedor Mayorista' : isAdmin ? 'Rol: Administrador HQ' : 'Rol: Vendedor / Dropshipper'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isSupplier ? (
                <>Panel de Bodega & Despachos — {currentUser?.nombre_negocio || currentUser?.nombre}</>
              ) : (
                <>¡Hola, {currentUser?.nombre}! 👋</>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {isSupplier ? (
                <>
                  Gestiona el stock de tus productos en almacén, alista pedidos asignados por los vendedores de la red
                  y genera guías con las transportadoras aliadas.
                </>
              ) : (
                <>
                  Gestiona tu catálogo de proveedores, calcula tus márgenes en tiempo real, registra pedidos de tus clientes
                  y haz seguimiento de novedades de entrega.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {isSupplier ? (
              <>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Gestionar Mi Inventario</span>
                </button>
                <button
                  onClick={() => onNavigate('orders')}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-700 transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>Ver Despachos & Guías</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('store')}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Mi Tienda & Vitrina</span>
                </button>
                <button
                  onClick={onOpenNewOrder}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-700 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Crear Pedido</span>
                </button>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-700 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Catálogo Mayorista</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {isSupplier ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Por Alistar</span>
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-amber-600">{supplierPorAlistar.length}</p>
            <span className="text-[11px] text-zinc-400 block">Requieren empaque o guía</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>En Ruta / Despachados</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-blue-700">{supplierEnRuta.length}</p>
            <span className="text-[11px] text-zinc-400 block">Con guía de transportadora</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Entregados</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{supplierEntregados.length}</p>
            <span className="text-[11px] text-zinc-400 block">Entregas confirmadas</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Unidades en Bodega</span>
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{supplierTotalUnidadesStock}</p>
            <span className="text-[11px] text-zinc-400 block">{supplierProducts.length} productos activos</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Pedidos Nuevos</span>
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{sellerNuevos}</p>
            <span className="text-[11px] text-zinc-400 block">Pendientes de confirmación</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>En Preparación / Ruta</span>
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{sellerEnProceso}</p>
            <span className="text-[11px] text-zinc-400 block">Con guía o bodega activa</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Entregados</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{sellerEntregados}</p>
            <span className="text-[11px] text-emerald-600 block">Entregas exitosas registradas</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Con Novedad</span>
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-rose-700">{sellerNovedades}</p>
            <span className="text-[11px] text-rose-600 block">Requieren gestión con cliente</span>
          </div>
        </div>
      )}

      {/* Financial Estimates Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 mb-4 gap-2">
          <div>
            <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              {isSupplier
                ? 'Balance de Facturación Bodega Mayorista'
                : 'Balance Financiero Estimado de Venta'}
            </h3>
            <p className="text-xs text-zinc-500">
              * Las cifras se identifican como <strong>estimadas</strong> hasta la confirmación de fletes y recaudo
              efectivo de las transportadoras.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-emerald-900 text-xs font-semibold">
            {isSupplier
              ? `Pedidos de Bodega: ${scopedOrders.length}`
              : `Margen Proyectado: ${totalVentas > 0 ? Math.round((totalGananciaEstimada / totalVentas) * 100) : 0}%`}
          </div>
        </div>

        {isSupplier ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="text-zinc-500 block">Facturación Total de Productos:</span>
              <span className="text-lg font-bold text-zinc-900 mt-1 block">
                {formatMoney(supplierFacturacionBodega, currentCountry)}
              </span>
              <span className="text-[10px] text-zinc-400">Total valor al costo mayorista</span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="text-zinc-500 block">Pedidos Entregados (Para Liquidación):</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">
                {formatMoney(
                  supplierEntregados.reduce((acc, curr) => acc + (curr.costo_producto || 0), 0),
                  currentCountry
                )}
              </span>
              <span className="text-[10px] text-zinc-400">Saldo listo para desembolso</span>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
              <span className="text-blue-900 font-semibold block">En Proceso de Despacho / Ruta:</span>
              <span className="text-lg font-black text-blue-800 mt-1 block">
                {formatMoney(
                  [...supplierPorAlistar, ...supplierEnRuta].reduce(
                    (acc, curr) => acc + (curr.costo_producto || 0),
                    0
                  ),
                  currentCountry
                )}
              </span>
              <span className="text-[10px] text-blue-700">Pendiente de entrega final</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="text-zinc-500 block">Ventas Totales Registradas:</span>
              <span className="text-lg font-bold text-zinc-900 mt-1 block">
                {formatMoney(totalVentas, currentCountry)}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="text-zinc-500 block">Costo de Productos:</span>
              <span className="text-lg font-bold text-zinc-700 mt-1 block">
                - {formatMoney(totalCostosProductos, currentCountry)}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="text-zinc-500 block">Fletes e Intermediación Est.:</span>
              <span className="text-lg font-bold text-zinc-700 mt-1 block">
                - {formatMoney(totalFletesEstimados + totalComisiones, currentCountry)}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
              <span className="text-emerald-900 font-semibold block">Ganancia Estimada Neta:</span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {formatMoney(totalGananciaEstimada, currentCountry)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Action Items & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Action Items */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              {isSupplier
                ? `Despachos Pendientes de Alistar (${supplierPorAlistar.length})`
                : `Tareas Pendientes de Gestión (${pendingConfirmations.length + activeNovedades.length})`}
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Ver todos los pedidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isSupplier ? (
            supplierPorAlistar.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-medium text-zinc-700">¡Al día! No tienes pedidos pendientes por alistar.</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Los nuevos pedidos confirmados por los vendedores aparecerán aquí para empaque.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {supplierPorAlistar.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-amber-950">
                        {ord.numero_orden} — {ord.producto_nombre} ({ord.variante}) x {ord.cantidad}
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Destino: {ord.ciudad_entrega} • Vendedor: {ord.vendedor_nombre}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-xs shrink-0 cursor-pointer"
                    >
                      Alistar & Guía
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            pendingConfirmations.length === 0 && activeNovedades.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-medium text-zinc-700">¡Al día! No tienes pedidos pendientes ni novedades.</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Crea un nuevo pedido o explora más productos en el catálogo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeNovedades.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-950">
                          Novedad en {ord.numero_orden} — {ord.cliente_nombre}
                        </p>
                        <p className="text-[11px] text-rose-800 mt-0.5">{ord.ciudad_entrega} ({ord.transportadora})</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs shrink-0 cursor-pointer"
                    >
                      Resolver
                    </button>
                  </div>
                ))}

                {pendingConfirmations.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-950">
                          Confirmar orden {ord.numero_orden} ({ord.producto_nombre})
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {ord.cliente_nombre} • {formatMoney(ord.precio_cobrado, currentCountry)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('orders')}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-xs shrink-0 cursor-pointer"
                    >
                      Gestionar
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Column 2: Inventory Status (Proveedor) or Saved Products (Vendedor) */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          {isSupplier ? (
            <>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-blue-600" />
                  Estado de Productos en Bodega ({supplierProducts.length})
                </h3>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Control de Inventario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {supplierProducts.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.imagenes[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-zinc-900 line-clamp-1">{prod.nombre}</h5>
                        <p className="text-[11px] text-zinc-500">
                          Costo mayorista:{' '}
                          <strong className="text-zinc-800">{formatMoney(prod.costo_proveedor, currentCountry)}</strong>
                          {' • '}
                          Stock:{' '}
                          <span
                            className={`font-bold ${
                              prod.inventario_disponible < 20 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {prod.inventario_disponible} unid.
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('inventory')}
                      className="px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-lg font-semibold text-xs shrink-0 cursor-pointer"
                    >
                      Editar Stock
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-600" />
                  Tus Productos Guardados ({savedProducts.length})
                </h3>
                <button
                  onClick={() => onNavigate('saved')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver guardados</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {savedProducts.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  <Bookmark className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="font-medium text-zinc-700">Aún no has guardado productos.</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Guarda productos del catálogo para definir tus precios de venta y margen.
                  </p>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Ir al Catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedProducts.slice(0, 3).map((saved) => {
                    const prod = products.find((p) => p.id === saved.producto_id);
                    if (!prod) return null;
                    return (
                      <div
                        key={saved.id}
                        className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imagenes[0]}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0"
                          />
                          <div>
                            <h5 className="font-bold text-zinc-900 line-clamp-1">{prod.nombre}</h5>
                            <p className="text-[11px] text-zinc-500">
                              Tu precio:{' '}
                              <strong className="text-zinc-800">
                                {formatMoney(saved.precio_venta, currentCountry)}
                              </strong>{' '}
                              • Margen est:{' '}
                              <strong className="text-emerald-700">
                                {formatMoney(saved.margen_estimado, currentCountry)}
                              </strong>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenProductDetail(prod.id)}
                          className="px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-lg font-semibold text-xs shrink-0 cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
