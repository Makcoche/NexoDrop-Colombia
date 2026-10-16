import React, { useState } from 'react';
import { Order, OrderStatus, Incident } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatDateCO, getStatusBadge } from '../utils/formatters';
import { CARRIERS_COLOMBIA } from '../data/initialData';
import {
  X,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  History,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  order: Order;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<Props> = ({ order, onClose }) => {
  const {
    updateOrderStatus,
    orderHistory,
    currentUser,
    currentRole,
    addIncident,
    incidents,
    resolveIncident,
  } = useApp();

  const [nuevoEstado, setNuevoEstado] = useState<OrderStatus>(order.estado);
  const [notaEstado, setNotaEstado] = useState('');
  const [transportadora, setTransportadora] = useState(order.transportadora || 'Coordinadora Mercantil');
  const [numeroGuia, setNumeroGuia] = useState(order.numero_guia || '');
  const [urlSeguimiento, setUrlSeguimiento] = useState(order.url_seguimiento || '');
  const [costoEnvioReal, setCostoEnvioReal] = useState<string>(
    order.costo_envio ? String(order.costo_envio) : '15000'
  );

  // Incident form toggle
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentType, setIncidentType] = useState<Incident['tipo']>('cliente_ausente');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSolucion, setIncidentSolucion] = useState('');
  const [selectedIncidentToResolve, setSelectedIncidentToResolve] = useState<string | null>(null);

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const historyItems = orderHistory[order.id] || [];
  const relatedIncidents = incidents.filter((i) => i.pedido_id === order.id);
  const badge = getStatusBadge(order.estado);

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pendiente_confirmacion', label: '1. Pendiente confirmación' },
    { value: 'confirmado', label: '2. Confirmado' },
    { value: 'en_preparacion', label: '3. En preparación (Proveedor)' },
    { value: 'despachado', label: '4. Despachado (Guía generada)' },
    { value: 'en_transito', label: '5. En tránsito (Transportadora)' },
    { value: 'entregado', label: '6. Entregado (Exitoso)' },
    { value: 'novedad', label: '7. Novedad en entrega' },
    { value: 'cancelado', label: '8. Cancelado' },
    { value: 'devuelto', label: '9. Devuelto a origen' },
  ];

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await updateOrderStatus(order.id, nuevoEstado, notaEstado, {
        transportadora,
        numero_guia: numeroGuia.trim() || undefined,
        url_seguimiento: urlSeguimiento.trim() || undefined,
        costo_envio: Number(costoEnvioReal) || 15000,
      });
      setNotaEstado('');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    setSaving(true);
    try {
      await updateOrderStatus(
        order.id,
        'cancelado',
        `Pedido cancelado por ${currentUser?.nombre} (${currentUser?.rol})`
      );
      setConfirmCancelOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;
    await addIncident(order.id, order.numero_orden, incidentType, incidentDesc.trim());
    setShowIncidentForm(false);
    setIncidentDesc('');
  };

  const handleResolveIncident = async (incId: string) => {
    if (!incidentSolucion.trim()) return;
    await resolveIncident(incId, incidentSolucion.trim());
    setSelectedIncidentToResolve(null);
    setIncidentSolucion('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-zinc-900">Orden {order.numero_orden}</h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Registrado el {formatDateCO(order.fecha_creacion)} por {order.vendedor_nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Grid: Details & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Destination */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                Destinatario y Envío (Colombia)
              </h4>

              <div className="text-xs space-y-2">
                <div className="flex justify-between border-b border-zinc-200/60 pb-1.5">
                  <span className="text-zinc-500">Cliente:</span>
                  <strong className="text-zinc-900">{order.cliente_nombre}</strong>
                </div>
                <div className="flex justify-between border-b border-zinc-200/60 pb-1.5">
                  <span className="text-zinc-500">Teléfono:</span>
                  <a
                    href={`https://wa.me/57${order.cliente_telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {order.cliente_telefono}
                  </a>
                </div>
                <div className="flex justify-between border-b border-zinc-200/60 pb-1.5">
                  <span className="text-zinc-500">Ciudad / Dpto:</span>
                  <span className="text-zinc-900 font-medium">
                    {order.ciudad_entrega}, {order.departamento}
                  </span>
                </div>
                <div className="border-b border-zinc-200/60 pb-1.5">
                  <span className="text-zinc-500 block">Dirección completa:</span>
                  <span className="text-zinc-800 font-medium">{order.direccion_entrega}</span>
                </div>
                {order.notas && (
                  <div>
                    <span className="text-zinc-500 block">Instrucciones del vendedor:</span>
                    <span className="text-zinc-700 italic">{order.notas}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product & Financial */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                Producto y Liquidación (COP)
              </h4>

              <div className="flex gap-3 items-center border-b border-zinc-200/60 pb-3">
                {order.producto_imagen && (
                  <img
                    src={order.producto_imagen}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-zinc-200"
                  />
                )}
                <div>
                  <h5 className="text-xs font-bold text-zinc-900 leading-snug">{order.producto_nombre}</h5>
                  <p className="text-[11px] text-zinc-600">
                    Variante: <span className="font-semibold text-zinc-800">{order.variante}</span> | Cantidad:{' '}
                    <span className="font-semibold text-zinc-800">{order.cantidad}</span>
                  </p>
                  <p className="text-[11px] text-zinc-500">Proveedor: {order.proveedor_nombre}</p>
                </div>
              </div>

              {/* Financial summary */}
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-700">
                  <span>Total cobrado al cliente:</span>
                  <strong className="text-zinc-900">{formatCOP(order.precio_cobrado)}</strong>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Método de pago:</span>
                  <span className="font-medium uppercase text-zinc-800 text-[10px] bg-zinc-200 px-2 py-0.5 rounded">
                    {order.metodo_pago.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Costo del producto:</span>
                  <span>- {formatCOP(order.costo_producto)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>
                    Flete transportadora:
                    {!order.costo_envio_confirmado && (
                      <span className="text-[10px] text-amber-700 font-semibold ml-1">(Orientativo)</span>
                    )}
                  </span>
                  <span>- {formatCOP(order.costo_envio)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Comisión plataforma:</span>
                  <span>- {formatCOP(order.comision_plataforma)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 font-bold">
                  <span className="text-emerald-950">Ganancia estimada neta:</span>
                  <span className="text-emerald-700 font-black text-base">{formatCOP(order.ganancia_estimada)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Shipping & Tracking Management */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-700" />
              Gestión de Guía y Transportadora
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Transportadora:</label>
                <select
                  value={transportadora}
                  onChange={(e) => setTransportadora(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-zinc-200 rounded-lg focus:border-blue-600 focus:outline-hidden"
                >
                  {CARRIERS_COLOMBIA.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Número de Guía:</label>
                <input
                  type="text"
                  placeholder="Ej. 71092834510"
                  value={numeroGuia}
                  onChange={(e) => setNumeroGuia(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-zinc-200 rounded-lg focus:border-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Costo Flete Confirmado (COP):</label>
                <input
                  type="number"
                  step="500"
                  value={costoEnvioReal}
                  onChange={(e) => setCostoEnvioReal(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-zinc-200 rounded-lg focus:border-blue-600 focus:outline-hidden font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">URL de Rastreo de la Transportadora:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://coordinadora.com/rastreo/?guia=..."
                  value={urlSeguimiento}
                  onChange={(e) => setUrlSeguimiento(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-zinc-200 rounded-lg focus:border-blue-600 focus:outline-hidden text-zinc-700"
                />
                {order.url_seguimiento && (
                  <a
                    href={order.url_seguimiento}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                  >
                    <span>Rastrear</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 italic">
                * Conforme al alcance del MVP, la información de guía se registra manualmente sin simular telemetría en tiempo real.
              </p>
            </div>
          </div>

          {/* Section: Status Change & State Machine */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              Actualizar Estado del Pedido
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nuevo Estado:</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as OrderStatus)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-zinc-300 rounded-lg font-semibold focus:border-emerald-600 focus:outline-hidden"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nota de bitácora (opcional):</label>
                <input
                  type="text"
                  placeholder="Motivo o detalle del cambio de estado..."
                  value={notaEstado}
                  onChange={(e) => setNotaEstado(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-white border border-zinc-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(true)}
                disabled={order.estado === 'cancelado'}
                className="text-xs text-rose-600 font-semibold hover:underline disabled:opacity-40"
              >
                Cancelar este pedido
              </button>

              <button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{saving ? 'Guardando...' : 'Aplicar Cambio y Guardar Guía'}</span>
              </button>
            </div>
          </div>

          {/* Section: Incidents & Novelties */}
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Novedades e Incidencias del Pedido ({relatedIncidents.length})
              </h4>
              <button
                onClick={() => setShowIncidentForm(!showIncidentForm)}
                className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors"
              >
                {showIncidentForm ? 'Cerrar formulario' : '+ Reportar Novedad'}
              </button>
            </div>

            {/* Incident form */}
            {showIncidentForm && (
              <form onSubmit={handleCreateIncident} className="p-3 bg-white border border-amber-200 rounded-lg space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Tipo de Novedad:</label>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value as any)}
                      className="w-full text-xs p-1.5 bg-zinc-50 border border-zinc-200 rounded"
                    >
                      <option value="cliente_ausente">Cliente ausente en domicilio</option>
                      <option value="direccion_incorrecta">Dirección incompleta o errónea</option>
                      <option value="retraso_transportadora">Retraso de la transportadora</option>
                      <option value="averia_empaque">Avería o daño en empaque</option>
                      <option value="producto_defectuoso">Producto con defecto de fábrica</option>
                      <option value="otro">Otro motivo logístico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Descripción de la novedad:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. No respondieron el timbre en segundo intento."
                      value={incidentDesc}
                      onChange={(e) => setIncidentDesc(e.target.value)}
                      className="w-full text-xs p-1.5 bg-zinc-50 border border-zinc-200 rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold px-4 py-1.5 rounded-lg"
                  >
                    Guardar y pasar a estado Novedad
                  </button>
                </div>
              </form>
            )}

            {/* Incident list */}
            {relatedIncidents.length > 0 ? (
              <div className="space-y-2">
                {relatedIncidents.map((inc) => (
                  <div key={inc.id} className="p-3 bg-white border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 uppercase text-[11px]">
                        {inc.tipo.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.estado === 'resuelta'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inc.estado === 'resuelta' ? 'Resuelta' : 'Abierta'}
                      </span>
                    </div>
                    <p className="text-zinc-700">{inc.descripcion}</p>
                    <p className="text-[11px] text-zinc-400">
                      Reportada el {formatDateCO(inc.fecha_creacion)} por {inc.reportado_por}
                    </p>

                    {inc.solucion && (
                      <div className="p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-100 text-[11px] mt-1">
                        <strong>Solución aplicada:</strong> {inc.solucion} ({formatDateCO(inc.fecha_resolucion || '')})
                      </div>
                    )}

                    {inc.estado !== 'resuelta' && (
                      <div className="pt-2">
                        {selectedIncidentToResolve === inc.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Describe la solución acordada..."
                              value={incidentSolucion}
                              onChange={(e) => setIncidentSolucion(e.target.value)}
                              className="text-xs p-1.5 flex-1 border border-zinc-300 rounded"
                            />
                            <button
                              onClick={() => handleResolveIncident(inc.id)}
                              className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded font-semibold"
                            >
                              Marcar Resuelta
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedIncidentToResolve(inc.id)}
                            className="text-[11px] text-emerald-700 hover:underline font-semibold"
                          >
                            Resolver esta novedad
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-800/80">No hay novedades registradas en este pedido.</p>
            )}
          </div>

          {/* Section: Audit Trail History */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-600" />
              Historial de Auditoría (Trazabilidad)
            </h4>

            <div className="space-y-2">
              {historyItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-start gap-3 text-xs p-2.5 bg-white border border-zinc-200 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">
                        {item.estado_anterior === 'ninguno'
                          ? `Creación en estado: ${item.estado_nuevo}`
                          : `${item.estado_anterior} → ${item.estado_nuevo}`}
                      </span>
                      <span className="text-[11px] text-zinc-400">{formatDateCO(item.fecha)}</span>
                    </div>
                    <p className="text-zinc-600 text-[11px] mt-0.5">{item.nota}</p>
                    <p className="text-zinc-400 text-[10px] mt-0.5">Por: {item.usuario_nombre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-100"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>

      {/* Confirmation modal before cancellation */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-base text-zinc-900">¿Confirmas la cancelación de la orden?</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Esta acción registrará en la auditoría que el pedido fue cancelado y notificará al proveedor para
                detener la preparación.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmCancelOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl"
              >
                No cancelar
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Sí, cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
