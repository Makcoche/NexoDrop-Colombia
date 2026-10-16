import React, { useState } from 'react';
import { Supplier, Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatCOP, formatMoney, formatDateCO } from '../utils/formatters';
import {
  Building2,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  X,
  Package,
} from 'lucide-react';

interface Props {
  onOpenProductDetail: (product: Product) => void;
}

export const SuppliersView: React.FC<Props> = ({ onOpenProductDetail }) => {
  const { suppliers, products, orders, currentRole, addSupplier, addProduct, currentCountry } = useApp();

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState<string | null>(null); // supplierId

  // New supplier form
  const [nombreComercial, setNombreComercial] = useState('');
  const [contacto, setContacto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('Bogotá D.C.');
  const [tiempoDespacho, setTiempoDespacho] = useState(24);

  // New product form
  const [prodNombre, setProdNombre] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState('Hogar y Tecnología');
  const [prodCosto, setProdCosto] = useState<number>(35000);
  const [prodSugerido, setProdSugerido] = useState<number>(75000);
  const [prodStock, setProdStock] = useState<number>(100);
  const [prodVariantes, setProdVariantes] = useState('Negro, Blanco');
  const [prodImg, setProdImg] = useState(
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
  );

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreComercial.trim() || !correo.trim()) return;
    await addSupplier({
      nombre_comercial: nombreComercial.trim(),
      contacto: contacto.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
      ciudad,
      tiempo_despacho_horas: tiempoDespacho,
      calificacion: 4.8,
      estado: 'activo',
    });
    setShowAddSupplierModal(false);
    setNombreComercial('');
    setContacto('');
    setCorreo('');
    setTelefono('');
  };

  const handleCreateProduct = async (e: React.FormEvent, supplier: Supplier) => {
    e.preventDefault();
    if (!prodNombre.trim() || prodCosto <= 0) return;
    await addProduct({
      proveedor_id: supplier.id,
      proveedor_nombre: supplier.nombre_comercial,
      nombre: prodNombre.trim(),
      descripcion: prodDesc.trim(),
      categoria: prodCat,
      imagenes: [prodImg],
      costo_proveedor: prodCosto,
      precio_sugerido: prodSugerido,
      inventario_disponible: prodStock,
      variantes: prodVariantes.split(',').map((s) => s.trim()).filter(Boolean),
      tiempo_despacho_estimado: `${supplier.tiempo_despacho_horas} horas hábiles`,
      garantia_meses: 3,
      estado: 'activo',
    });
    setShowAddProductModal(null);
    setProdNombre('');
    setProdDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Directorio de Proveedores Mayoristas
          </h1>
          <p className="text-xs text-zinc-500">
            Proveedores verificados con bodegas y despachos directos en Bogotá, Medellín, Cali y Santander.
          </p>
        </div>

        {(currentRole === 'admin' || currentRole === 'proveedor') && (
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Registrar Nuevo Proveedor</span>
          </button>
        )}
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.map((sup) => {
          const supplierProducts = products.filter((p) => p.proveedor_id === sup.id);
          const supplierOrdersCount = orders.filter((o) => o.proveedor_id === sup.id).length;

          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-zinc-900">{sup.nombre_comercial}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {sup.estado}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      Bodega Principal: <strong>{sup.ciudad}</strong>
                    </p>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {sup.calificacion}
                  </span>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-150">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{sup.telefono}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{sup.correo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Despacho: ~{sup.tiempo_despacho_horas} horas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{supplierOrdersCount} pedidos procesados</span>
                  </div>
                </div>

                {/* Products associated list preview */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    <span>Productos en catálogo ({supplierProducts.length})</span>
                    {(currentRole === 'admin' || currentRole === 'proveedor') && (
                      <button
                        onClick={() => setShowAddProductModal(sup.id)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold lowercase"
                      >
                        + agregar producto
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {supplierProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onOpenProductDetail(p)}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs border border-zinc-150 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img src={p.imagenes[0]} alt="" className="w-7 h-7 rounded object-cover" />
                          <span className="font-semibold text-zinc-800 truncate">{p.nombre}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <strong className="text-zinc-900">{formatMoney(p.costo_proveedor, currentCountry)}</strong>
                          <span className="block text-[10px] text-emerald-600">Stock: {p.inventario_disponible}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-400 flex justify-between items-center">
                <span>Vinculado el {formatDateCO(sup.fecha_creacion)}</span>
                <span className="text-emerald-700 font-semibold">Garantía nacional respaldada</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Supplier */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-bold text-base text-zinc-900">Registrar Proveedor Mayorista</h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Razón Social / Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Andina SAS"
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. Andrés Ramírez"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Ciudad Bodega</label>
                  <input
                    type="text"
                    required
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="pedidos@empresa.co"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Tiempo de Despacho Promedio (Horas)</label>
                <input
                  type="number"
                  min="6"
                  max="72"
                  value={tiempoDespacho}
                  onChange={(e) => setTiempoDespacho(Number(e.target.value) || 24)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Product for Supplier */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-bold text-base text-zinc-900">Agregar Producto al Proveedor</h3>
              <button onClick={() => setShowAddProductModal(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const sup = suppliers.find((s) => s.id === showAddProductModal);
              if (!sup) return null;

              return (
                <form onSubmit={(e) => handleCreateProduct(e, sup)} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Nombre del Producto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Termo Inteligente con Display LED 500ml"
                      value={prodNombre}
                      onChange={(e) => setProdNombre(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Descripción breve del proveedor</label>
                    <textarea
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Costo Proveedor (COP) *</label>
                      <input
                        type="number"
                        step="1000"
                        required
                        value={prodCosto}
                        onChange={(e) => setProdCosto(Number(e.target.value) || 0)}
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Precio Sugerido (COP)</label>
                      <input
                        type="number"
                        step="1000"
                        value={prodSugerido}
                        onChange={(e) => setProdSugerido(Number(e.target.value) || 0)}
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Inventario Inicial</label>
                      <input
                        type="number"
                        value={prodStock}
                        onChange={(e) => setProdStock(Number(e.target.value) || 0)}
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">Variantes (separar por coma)</label>
                      <input
                        type="text"
                        placeholder="Negro, Azul, Rojo"
                        value={prodVariantes}
                        onChange={(e) => setProdVariantes(e.target.value)}
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(null)}
                      className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                    >
                      Publicar Producto
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
