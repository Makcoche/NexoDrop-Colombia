import React, { useState } from 'react';
import { Product, Order } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP } from '../utils/formatters';
import { COLOMBIAN_DEPARTMENTS } from '../data/initialData';
import {
  X,
  PackagePlus,
  User,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  initialProduct?: Product | null;
  initialVariant?: string;
  initialPrice?: number;
  onClose: () => void;
  onOrderCreated: (orderId: string) => void;
}

export const NewOrderModal: React.FC<Props> = ({
  initialProduct,
  initialVariant,
  initialPrice,
  onClose,
  onOrderCreated,
}) => {
  const { products, currentUser, createOrder, calculateMargin } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || products[0]?.id || ''
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedVariant, setSelectedVariant] = useState<string>(
    initialVariant || selectedProduct?.variantes?.[0] || 'Estándar'
  );

  const [cantidad, setCantidad] = useState<number>(1);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [departamento, setDepartamento] = useState('Antioquia');
  const [ciudadEntrega, setCiudadEntrega] = useState('Medellín');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [precioCobrado, setPrecioCobrado] = useState<number>(
    initialPrice || selectedProduct?.precio_sugerido || (selectedProduct?.costo_proveedor || 0) * 1.8
  );
  const [metodoPago, setMetodoPago] = useState<Order['metodo_pago']>('contraentrega');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle product switch
  const handleProductChange = (newProdId: string) => {
    setSelectedProductId(newProdId);
    const prod = products.find((p) => p.id === newProdId);
    if (prod) {
      setSelectedVariant(prod.variantes?.[0] || 'Estándar');
      setPrecioCobrado(prod.precio_sugerido || prod.costo_proveedor * 1.8);
    }
  };

  const totalCostoProducto = (selectedProduct?.costo_proveedor || 0) * cantidad;
  const margin = calculateMargin(precioCobrado * cantidad, totalCostoProducto, 15000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre.trim() || !clienteTelefono.trim() || !direccionEntrega.trim()) {
      setErrorMsg('Por favor completa todos los datos obligatorios del cliente y dirección.');
      return;
    }
    if (precioCobrado <= 0) {
      setErrorMsg('El precio cobrado debe ser mayor a 0 COP.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const orderId = await createOrder({
        vendedor_id: currentUser?.id || 'seller-demo-01',
        vendedor_nombre: currentUser?.nombre_negocio || currentUser?.nombre || 'Vendedor',
        proveedor_id: selectedProduct.proveedor_id,
        proveedor_nombre: selectedProduct.proveedor_nombre,
        producto_id: selectedProduct.id,
        producto_nombre: selectedProduct.nombre,
        producto_imagen: selectedProduct.imagenes[0] || '',
        variante: selectedVariant,
        cantidad,
        cliente_nombre: clienteNombre.trim(),
        cliente_telefono: clienteTelefono.trim(),
        departamento,
        ciudad_entrega: ciudadEntrega.trim(),
        direccion_entrega: direccionEntrega.trim(),
        precio_cobrado: precioCobrado * cantidad,
        costo_producto: totalCostoProducto,
        costo_envio: null, // Costo pendiente hasta confirmación de transportadora
        costo_envio_confirmado: false,
        comision_plataforma: margin.comisionPlataforma,
        ganancia_estimada: margin.gananciaEstimada,
        metodo_pago: metodoPago,
        estado: 'pendiente_confirmacion',
        notas: notas.trim() || 'Registrado por vendedor.',
      });

      onOrderCreated(orderId);
      onClose();
    } catch (err: any) {
      console.error('Error creating order:', err);
      setErrorMsg(err.message || 'Error al guardar el pedido en la base de datos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900">Registrar Nuevo Pedido</h3>
              <p className="text-xs text-zinc-500">Ingreso manual de venta en canal propio o WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Product Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                1
              </span>
              Producto y Proveedor Asignado
            </h4>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Seleccionar Producto:</label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — Costo: {formatCOP(p.costo_proveedor)} (Stock: {p.inventario_disponible})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Variante:</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    {selectedProduct.variantes?.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.inventario_disponible}
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs sm:text-sm p-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Customer Details */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                2
              </span>
              Datos del Cliente y Destino (Colombia)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre Completo del Cliente *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carolina Montoya"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Celular / WhatsApp *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 312 456 7890"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Departamento:</label>
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  {COLOMBIAN_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Ciudad o Municipio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Medellín, Envigado, Bogotá"
                  value={ciudadEntrega}
                  onChange={(e) => setCiudadEntrega(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Dirección exacta con barrio, torre o apto *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Calle 10 # 43E-12, Apto 502, Barrio El Poblado"
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Payment */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                3
              </span>
              Cobro y Método de Pago
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Precio unitario cobrado al cliente (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={precioCobrado}
                    onChange={(e) => setPrecioCobrado(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Método de Pago:</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  className="w-full text-xs sm:text-sm p-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium"
                >
                  <option value="contraentrega">Pago Contraentrega (Paga al recibir)</option>
                  <option value="transferencia">Transferencia Anticipada (Bancolombia/Nequi)</option>
                  <option value="tarjeta">Tarjeta de Crédito / PSE</option>
                  <option value="billetera_digital">Billetera Digital</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Instrucciones o notas para despacho:</label>
              <textarea
                rows={2}
                placeholder="Ej. Dejar en portería si no responden al timbre."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Estimated Margin Summary Card */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between items-center text-zinc-700">
                <span>Total cobrado al cliente:</span>
                <strong className="text-zinc-900">{formatCOP(precioCobrado * cantidad)}</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Costo producto ({cantidad} unid):</span>
                <span>- {formatCOP(totalCostoProducto)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span className="flex items-center gap-1">
                  Flete nacional orientativo:
                  <span className="text-[10px] text-amber-700 font-semibold">(Pendiente liquidación real)</span>
                </span>
                <span>- {formatCOP(margin.envio)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Comisión plataforma (5%):</span>
                <span>- {formatCOP(margin.comisionPlataforma)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200 text-sm font-bold">
                <span className="text-emerald-950">Ganancia orientativa estimada:</span>
                <span className="text-emerald-700 font-black text-base">{formatCOP(margin.gananciaEstimada)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Registrando...' : 'Confirmar y Crear Pedido'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
