import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import {
  BarChart3,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Truck,
  Users,
  MapPin,
  DollarSign,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { orders, products, suppliers, currentUser, currentCountry } = useApp();

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
    return orders.filter(
      (o) =>
        o.vendedor_id === currentUser.id ||
        o.vendedor_id === 'seller-demo-01' ||
        o.vendedor_id === 'seller-col-01' ||
        o.vendedor_id === 'seller-ven-01'
    );
  }, [orders, currentUser]);

  const totalPedidos = scopedOrders.length;
  const entregados = scopedOrders.filter((o) => o.estado === 'entregado').length;
  const novedades = scopedOrders.filter((o) => o.estado === 'novedad').length;
  const devueltos = scopedOrders.filter((o) => o.estado === 'devuelto').length;
  const cancelados = scopedOrders.filter((o) => o.estado === 'cancelado').length;

  const tasaEntrega = totalPedidos > 0 ? Math.round((entregados / totalPedidos) * 100) : 0;
  const tasaNovedad = totalPedidos > 0 ? Math.round(((novedades + devueltos) / totalPedidos) * 100) : 0;

  const isSupplier = currentUser?.rol === 'proveedor';
  const totalMonto = isSupplier
    ? scopedOrders.reduce((acc, curr) => acc + (curr.costo_producto || 0), 0)
    : scopedOrders.reduce((acc, curr) => acc + (curr.precio_cobrado || 0), 0);

  const totalGanancia = isSupplier
    ? scopedOrders
        .filter((o) => o.estado === 'entregado')
        .reduce((acc, curr) => acc + (curr.costo_producto || 0), 0)
    : scopedOrders.reduce((acc, curr) => acc + (curr.ganancia_estimada || 0), 0);

  // Breakdown by region / department
  const deptoMap: Record<string, number> = {};
  scopedOrders.forEach((o) => {
    const loc = o.departamento || o.ciudad_entrega || 'Nacional';
    deptoMap[loc] = (deptoMap[loc] || 0) + 1;
  });
  const deptosSorted = Object.entries(deptoMap).sort((a, b) => b[1] - a[1]);

  // Breakdown by payment method
  const payMap: Record<string, number> = {};
  scopedOrders.forEach((o) => {
    payMap[o.metodo_pago] = (payMap[o.metodo_pago] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            {isSupplier ? 'Reportes de Ventas y Despachos de Bodega' : 'Reportes y Rendimiento de Operación'}
          </h1>
          <p className="text-xs text-zinc-500">
            {isSupplier
              ? 'Métricas de facturación de productos, paquetes entregados por transportadora y liquidaciones.'
              : 'Métricas de conversión, efectividad de entrega de transportadoras y márgenes estimados.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-xl">
          {currentCountry === 'CO' ? (
            <>
              <ColombiaFlag className="w-4 h-3 inline" />
              <span>Colombia • Moneda: COP ($)</span>
            </>
          ) : (
            <>
              <VenezuelaFlag className="w-4 h-3 inline" />
              <span>Venezuela • Moneda: USD Ref. / VES</span>
            </>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
            {isSupplier ? 'Facturación Bodega' : 'Ventas Registradas'}
          </span>
          <p className="text-2xl font-black text-zinc-900">{formatMoney(totalMonto, currentCountry)}</p>
          <span className="text-[11px] text-zinc-400">Total en {totalPedidos} pedidos</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
            {isSupplier ? 'Saldo Liquidado / Entregado' : 'Ganancia Estimada Neta'}
          </span>
          <p className="text-2xl font-black text-emerald-700">{formatMoney(totalGanancia, currentCountry)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {isSupplier
              ? `${entregados} entregas liquidadas`
              : `${totalMonto > 0 ? Math.round((totalGanancia / totalMonto) * 100) : 0}% margen proyectado`}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
            Tasa de Entrega Exitosa
          </span>
          <p className="text-2xl font-black text-indigo-700">{tasaEntrega}%</p>
          <span className="text-[11px] text-zinc-400">{entregados} entregas confirmadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
            Tasa Novedad / Devolución
          </span>
          <p className="text-2xl font-black text-rose-700">{tasaNovedad}%</p>
          <span className="text-[11px] text-rose-600">{novedades} novedades activas</span>
        </div>
      </div>

      {/* Charts and Regional breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Deliveries */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Distribución Geográfica de Envíos ({currentCountry === 'CO' ? 'Departamentos Colombia' : 'Estados Venezuela'})
          </h3>

          <div className="space-y-3">
            {deptosSorted.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No hay pedidos registrados en este período.</p>
            ) : (
              deptosSorted.map(([depto, count]) => {
                const pct = totalPedidos > 0 ? Math.round((count / totalPedidos) * 100) : 0;
                return (
                  <div key={depto} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold text-zinc-800">
                      <span>{depto}</span>
                      <span className="text-zinc-500">
                        {count} pedidos ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Métodos de Pago Utilizados
          </h3>

          <div className="space-y-3">
            {Object.keys(payMap).length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Sin transacciones registradas.</p>
            ) : (
              Object.entries(payMap).map(([method, count]) => {
                const pct = totalPedidos > 0 ? Math.round((count / totalPedidos) * 100) : 0;
                const labels: Record<string, string> = {
                  contraentrega: 'Contraentrega (Cobro en destino)',
                  transferencia: 'Transferencia (Bancolombia / Pago Móvil)',
                  tarjeta: 'Tarjeta Débito/Crédito',
                  billetera_digital: 'Billetera Digital (Nequi / Zelle / Zinli)',
                };
                return (
                  <div key={method} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold text-zinc-800">
                      <span>{labels[method] || method}</span>
                      <span className="text-zinc-500">
                        {count} pedidos ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-xs text-zinc-600 mt-4">
            <p className="font-semibold text-zinc-800">
              {currentCountry === 'CO' ? 'Dato clave del mercado colombiano:' : 'Dato clave del mercado venezolano:'}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {currentCountry === 'CO'
                ? 'El pago contraentrega representa más del 70% de las conversiones en Colombia. NexoDrop optimiza la verificación previa por WhatsApp para reducir devoluciones.'
                : 'En Venezuela, la combinación de Pago Móvil interbancario y efectivo USD contraentrega en agencias MRW/Tealca genera la mayor tasa de retiro.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
