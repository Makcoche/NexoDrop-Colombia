import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Product,
  Supplier,
  Order,
  SavedProduct,
  Incident,
  OrderHistoryItem,
  OrderStatus,
  CountryCode,
  SellerStore,
  ProductLandingConfig,
  StoreProductItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_ORDERS,
  INITIAL_INCIDENTS,
  INITIAL_STORES,
  INITIAL_STORE_PRODUCTS,
} from '../data/initialData';
import { auth, googleProvider, testConnection, handleFirestoreError, OperationType, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

interface AppContextType {
  currentUser: UserProfile | null;
  fbUser: FirebaseUser | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentCountry: CountryCode;
  setCurrentCountry: (c: CountryCode) => void;
  products: Product[];
  suppliers: Supplier[];
  orders: Order[];
  savedProducts: SavedProduct[];
  incidents: Incident[];
  orderHistory: Record<string, OrderHistoryItem[]>;
  stores: SellerStore[];
  storeProducts: StoreProductItem[];
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  selectDemoUser: (role: UserRole) => void;
  registerNewUser: (data: Partial<UserProfile>) => Promise<void>;
  // Store & Landing methods
  createOrUpdateStore: (storeData: Partial<SellerStore> & { nombre_tienda: string; pais: CountryCode }) => Promise<string>;
  createOwnProductForStore: (data: {
    tiendaId: string;
    nombre: string;
    categoria: string;
    descripcion: string;
    costoBase: number;
    precioVenta: number;
    stock: number;
    variantes: string[];
    imagenes: string[];
    garantiaMeses: number;
    tiempoDespacho: string;
    condicionesGarantia?: string;
  }) => Promise<{ productId: string; storeProductId: string }>;
  addProductToStore: (
    productId: string,
    tiendaId: string,
    precioVenta: number,
    tituloPersonalizado?: string,
    customLanding?: Partial<ProductLandingConfig>
  ) => Promise<string>;
  updateStoreProduct: (storeProductId: string, updates: Partial<StoreProductItem>) => Promise<void>;
  removeStoreProduct: (storeProductId: string) => Promise<void>;
  getSellerStore: (vendedorId?: string) => SellerStore | undefined;
  getStoreProducts: (tiendaId: string) => StoreProductItem[];
  // Mutations
  saveProductForSeller: (productId: string, precioVenta: number, notas?: string) => Promise<void>;
  removeSavedProduct: (savedId: string) => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'numero_orden' | 'fecha_creacion' | 'fecha_actualizacion'>) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    nuevoEstado: OrderStatus,
    nota?: string,
    shippingData?: { transportadora?: string; numero_guia?: string; url_seguimiento?: string; costo_envio?: number }
  ) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'fecha_creacion' | 'ultima_actualizacion_inventario'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'fecha_creacion'>) => Promise<void>;
  addIncident: (orderId: string, numeroOrden: string, tipo: Incident['tipo'], descripcion: string) => Promise<void>;
  resolveIncident: (incidentId: string, solucion: string) => Promise<void>;
  calculateMargin: (precioVenta: number, costoProducto: number, costoEnvio?: number | null) => {
    comisionPlataforma: number;
    envio: number;
    envioPendiente: boolean;
    gananciaEstimada: number;
    margenPorcentaje: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nexodrop_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('nexodrop_active_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.rol || 'vendedor';
      } catch {
        return 'vendedor';
      }
    }
    return 'vendedor';
  });
  const [currentCountry, setCurrentCountryState] = useState<CountryCode>(() => {
    const saved = localStorage.getItem('nexodrop_country');
    return (saved === 'VE' || saved === 'CO') ? saved : 'CO';
  });

  const setCurrentCountry = (c: CountryCode) => {
    setCurrentCountryState(c);
    localStorage.setItem('nexodrop_country', c);
  };
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexodrop_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('nexodrop_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nexodrop_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(() => {
    const saved = localStorage.getItem('nexodrop_saved_products');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'saved-001',
            vendedor_id: 'seller-demo-01',
            producto_id: 'prod-001',
            precio_venta: 79900,
            margen_estimado: 23405,
            notas: 'Margen excelente para pauta en Facebook y TikTok.',
            fecha_guardado: '2026-10-12T10:00:00Z',
          },
          {
            id: 'saved-002',
            vendedor_id: 'seller-demo-01',
            producto_id: 'prod-004',
            precio_venta: 59900,
            margen_estimado: 20905,
            notas: 'Gran volumen en mujeres 25-45 años.',
            fecha_guardado: '2026-10-13T14:20:00Z',
          },
        ];
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('nexodrop_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [orderHistory, setOrderHistory] = useState<Record<string, OrderHistoryItem[]>>(() => {
    const saved = localStorage.getItem('nexodrop_order_history');
    return saved
      ? JSON.parse(saved)
      : {
          'ord-col-101': [
            {
              id: 'hist-1',
              pedido_id: 'ord-col-101',
              estado_anterior: 'pendiente_confirmacion',
              estado_nuevo: 'confirmado',
              usuario_id: 'seller-demo-01',
              usuario_nombre: 'Carlos Gómez (Vendedor)',
              nota: 'Cliente confirmó compra vía WhatsApp.',
              fecha: '2026-10-13T10:15:00Z',
            },
            {
              id: 'hist-2',
              pedido_id: 'ord-col-101',
              estado_anterior: 'confirmado',
              estado_nuevo: 'en_preparacion',
              usuario_id: 'prov-col-01',
              usuario_nombre: 'TecnoAndina (Proveedor)',
              nota: 'Empaque y verificación de accesorios completada.',
              fecha: '2026-10-13T14:00:00Z',
            },
            {
              id: 'hist-3',
              pedido_id: 'ord-col-101',
              estado_anterior: 'en_preparacion',
              estado_nuevo: 'despachado',
              usuario_id: 'prov-col-01',
              usuario_nombre: 'TecnoAndina (Proveedor)',
              nota: 'Entregado a Coordinadora con guía 71092834510.',
              fecha: '2026-10-14T09:30:00Z',
            },
            {
              id: 'hist-4',
              pedido_id: 'ord-col-101',
              estado_anterior: 'despachado',
              estado_nuevo: 'en_transito',
              usuario_id: 'system',
              usuario_nombre: 'Logística Coordinadora',
              nota: 'Paquete en ruta nacional.',
              fecha: '2026-10-14T14:30:00Z',
            },
          ],
        };
  });

  const [stores, setStores] = useState<SellerStore[]>(() => {
    const saved = localStorage.getItem('nexodrop_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [storeProducts, setStoreProducts] = useState<StoreProductItem[]>(() => {
    const saved = localStorage.getItem('nexodrop_store_products');
    return saved ? JSON.parse(saved) : INITIAL_STORE_PRODUCTS;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nexodrop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexodrop_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('nexodrop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nexodrop_saved_products', JSON.stringify(savedProducts));
  }, [savedProducts]);

  useEffect(() => {
    localStorage.setItem('nexodrop_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('nexodrop_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('nexodrop_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('nexodrop_store_products', JSON.stringify(storeProducts));
  }, [storeProducts]);

  // Sync currentUser to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexodrop_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nexodrop_active_user');
    }
  }, [currentUser]);

  // Test Firebase connection on boot
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      // NOTE: Do NOT auto-login as admin automatically, so the app respects public vs registered mode!
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const isAdmin = user.email === 'josegregoriourdanetaguadama@gmail.com';
      const role: UserRole = isAdmin ? 'admin' : currentRole;

      const profile: UserProfile = {
        id: user.uid,
        nombre: user.displayName || 'Usuario Google',
        correo: user.email || '',
        rol: role,
        nombre_negocio: 'Comercio Digital',
        ciudad: 'Bogotá D.C.',
        estado: 'activo',
        fecha_creacion: new Date().toISOString(),
      };

      setCurrentUser(profile);
      setCurrentRole(role);

      // Attempt to persist profile to Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      } catch (e) {
        console.warn('Could not persist user to Firestore:', e);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('No se pudo completar el inicio de sesión con Google. Puedes usar el selector de roles de demostración.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Error signing out of Firebase:', e);
    }
    setFbUser(null);
    setCurrentUser(null);
    localStorage.removeItem('nexodrop_active_user');
  };

  const selectDemoUser = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser({
        id: 'admin-01',
        nombre: 'Admin Principal (José G.)',
        correo: 'josegregoriourdanetaguadama@gmail.com',
        telefono: '+57 310 111 2233',
        rol: 'admin',
        nombre_negocio: 'NexoDrop Colombia HQ',
        ciudad: 'Bogotá D.C.',
        estado: 'activo',
        fecha_creacion: '2025-01-01T00:00:00Z',
      });
    } else if (role === 'vendedor') {
      setCurrentUser({
        id: 'seller-demo-01',
        nombre: 'Carlos Gómez (Vendedor)',
        correo: 'carlos.gomez@vendedorcolombia.co',
        telefono: '+57 310 987 6543',
        rol: 'vendedor',
        nombre_negocio: 'Comercializadora El Triunfo',
        ciudad: 'Bogotá D.C.',
        estado: 'activo',
        fecha_creacion: '2025-01-15T00:00:00Z',
      });
    } else if (role === 'proveedor') {
      setCurrentUser({
        id: 'prov-col-01',
        nombre: 'Carlos Mario Henao (Proveedor)',
        correo: 'ventas@tecnoandina.co',
        telefono: '+57 312 458 9201',
        rol: 'proveedor',
        nombre_negocio: 'TecnoAndina Mayorista SAS',
        ciudad: 'Bogotá D.C.',
        estado: 'activo',
        fecha_creacion: '2025-01-10T08:00:00Z',
      });
    } else {
      setCurrentUser({
        id: 'support-01',
        nombre: 'Valeria Cárdenas (Soporte)',
        correo: 'soporte@nexodrop.co',
        telefono: '+57 301 444 5566',
        rol: 'soporte',
        nombre_negocio: 'Mesa de Ayuda NexoDrop',
        ciudad: 'Medellín',
        estado: 'activo',
        fecha_creacion: '2025-01-20T00:00:00Z',
      });
    }
  };

  const registerNewUser = async (data: Partial<UserProfile>) => {
    const newId = `user-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const pais: CountryCode = data.pais || currentCountry;
    const profile: UserProfile = {
      id: newId,
      nombre: data.nombre || 'Nuevo Usuario',
      correo: data.correo || '',
      telefono: data.telefono || '',
      rol: data.rol || 'vendedor',
      pais,
      documento_identidad: data.documento_identidad || '',
      nombre_negocio: data.nombre_negocio || 'Mi Negocio Dropshipping',
      ciudad: data.ciudad || (pais === 'VE' ? 'Caracas' : 'Bogotá D.C.'),
      estado: 'activo',
      fecha_creacion: now,
    };

    if (data.rol === 'proveedor') {
      const newSup: Supplier = {
        id: newId,
        nombre_comercial: data.nombre_negocio || data.nombre || 'Mayorista',
        contacto: data.nombre || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        ciudad: data.ciudad || (pais === 'VE' ? 'Caracas' : 'Bogotá D.C.'),
        tiempo_despacho_horas: 24,
        calificacion: 5.0,
        estado: 'activo',
        productos_activos_count: 0,
        fecha_creacion: now,
      };
      setSuppliers((prev) => [newSup, ...prev]);
    }

    setCurrentUser(profile);
    setCurrentRole(profile.rol);
    setCurrentCountry(pais);
    localStorage.setItem('nexodrop_active_user', JSON.stringify(profile));

    if (fbUser) {
      try {
        await setDoc(doc(db, 'users', newId), profile, { merge: true });
      } catch (e) {
        console.warn('Could not save user profile to Firestore:', e);
      }
    }
  };

  // Helper calculating orientative margin per formula:
  // Ganancia estimada = precio de venta - costo del producto - envío - comisión - otros costos
  const calculateMargin = (precioVenta: number, costoProducto: number, costoEnvio?: number | null) => {
    const comisionPlataforma = Math.round(precioVenta * 0.05); // 5% comisión estándar plataforma
    const envioEstimadoFijo = 15000; // Tarifa nacional estimada promedio en COP
    const envioPendiente = costoEnvio === null || costoEnvio === undefined;
    const envio = envioPendiente ? envioEstimadoFijo : costoEnvio;
    const gananciaEstimada = precioVenta - costoProducto - envio - comisionPlataforma;
    const margenPorcentaje = precioVenta > 0 ? Math.round((gananciaEstimada / precioVenta) * 100) : 0;

    return {
      comisionPlataforma,
      envio,
      envioPendiente,
      gananciaEstimada,
      margenPorcentaje,
    };
  };

  const saveProductForSeller = async (productId: string, precioVenta: number, notas?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !currentUser) return;

    const marginCalc = calculateMargin(precioVenta, product.costo_proveedor, 15000);
    const newSaved: SavedProduct = {
      id: `saved-${Date.now()}`,
      vendedor_id: currentUser.id,
      producto_id: productId,
      precio_venta: precioVenta,
      margen_estimado: marginCalc.gananciaEstimada,
      notas: notas || '',
      fecha_guardado: new Date().toISOString(),
    };

    setSavedProducts((prev) => [newSaved, ...prev.filter((s) => s.producto_id !== productId)]);

    if (fbUser) {
      try {
        await setDoc(doc(db, 'saved_products', newSaved.id), newSaved);
      } catch (err) {
        console.warn('Firestore write saved_product error:', err);
      }
    }
  };

  const removeSavedProduct = async (savedId: string) => {
    setSavedProducts((prev) => prev.filter((s) => s.id !== savedId));
  };

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'numero_orden' | 'fecha_creacion' | 'fecha_actualizacion'>
  ): Promise<string> => {
    const newId = `ord-col-${Date.now().toString().slice(-5)}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const numeroOrden = `ND-${randomNum}`;
    const now = new Date().toISOString();

    const fullOrder: Order = {
      ...orderData,
      id: newId,
      numero_orden: numeroOrden,
      fecha_creacion: now,
      fecha_actualizacion: now,
    };

    setOrders((prev) => [fullOrder, ...prev]);

    // Add initial history
    const initialHistItem: OrderHistoryItem = {
      id: `hist-${Date.now()}`,
      pedido_id: newId,
      estado_anterior: 'ninguno',
      estado_nuevo: fullOrder.estado,
      usuario_id: currentUser?.id || 'vendedor',
      usuario_nombre: currentUser?.nombre || 'Vendedor',
      nota: 'Pedido registrado en plataforma NexoDrop.',
      fecha: now,
    };

    setOrderHistory((prev) => ({
      ...prev,
      [newId]: [initialHistItem],
    }));

    if (fbUser) {
      try {
        await setDoc(doc(db, 'orders', newId), fullOrder);
      } catch (err) {
        console.warn('Firestore create order error:', err);
      }
    }

    return newId;
  };

  const updateOrderStatus = async (
    orderId: string,
    nuevoEstado: OrderStatus,
    nota?: string,
    shippingData?: { transportadora?: string; numero_guia?: string; url_seguimiento?: string; costo_envio?: number }
  ) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const existingOrder = orders[orderIndex];
    const prevStatus = existingOrder.estado;
    const now = new Date().toISOString();

    let updatedShipping = {};
    if (shippingData) {
      updatedShipping = {
        transportadora: shippingData.transportadora ?? existingOrder.transportadora,
        numero_guia: shippingData.numero_guia ?? existingOrder.numero_guia,
        url_seguimiento: shippingData.url_seguimiento ?? existingOrder.url_seguimiento,
        costo_envio: shippingData.costo_envio !== undefined ? shippingData.costo_envio : existingOrder.costo_envio,
        costo_envio_confirmado:
          shippingData.costo_envio !== undefined ? true : existingOrder.costo_envio_confirmado,
      };
    }

    const updatedOrder: Order = {
      ...existingOrder,
      ...updatedShipping,
      estado: nuevoEstado,
      fecha_actualizacion: now,
    };

    // Recalculate margins if shipping was confirmed
    if (shippingData?.costo_envio !== undefined) {
      const calc = calculateMargin(
        updatedOrder.precio_cobrado,
        updatedOrder.costo_producto,
        shippingData.costo_envio
      );
      updatedOrder.ganancia_estimada = calc.gananciaEstimada;
      updatedOrder.comision_plataforma = calc.comisionPlataforma;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    // Create history record
    const histItem: OrderHistoryItem = {
      id: `hist-${Date.now()}`,
      pedido_id: orderId,
      estado_anterior: prevStatus,
      estado_nuevo: nuevoEstado,
      usuario_id: currentUser?.id || 'sistema',
      usuario_nombre: currentUser?.nombre || 'Usuario',
      nota: nota || `Cambio de estado a ${nuevoEstado.replace('_', ' ')}.`,
      fecha: now,
    };

    setOrderHistory((prev) => ({
      ...prev,
      [orderId]: [histItem, ...(prev[orderId] || [])],
    }));

    if (fbUser) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          ...updatedOrder,
        });
      } catch (err) {
        console.warn('Firestore update order error:', err);
      }
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'fecha_creacion' | 'ultima_actualizacion_inventario'>) => {
    const newId = `prod-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: newId,
      fecha_creacion: now,
      ultima_actualizacion_inventario: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    if (fbUser) {
      try {
        await setDoc(doc(db, 'products', newId), newProduct);
      } catch (err) {
        console.warn('Firestore add product error:', err);
      }
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = {
            ...p,
            ...updates,
            ultima_actualizacion_inventario:
              updates.inventario_disponible !== undefined ? now : p.ultima_actualizacion_inventario,
          };
          return updated;
        }
        return p;
      })
    );

    if (fbUser) {
      try {
        await updateDoc(doc(db, 'products', id), updates);
      } catch (err) {
        console.warn('Firestore update product error:', err);
      }
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'fecha_creacion'>) => {
    const newId = `prov-col-${Date.now().toString().slice(-5)}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: newId,
      fecha_creacion: new Date().toISOString(),
    };

    setSuppliers((prev) => [newSupplier, ...prev]);

    if (fbUser) {
      try {
        await setDoc(doc(db, 'suppliers', newId), newSupplier);
      } catch (err) {
        console.warn('Firestore add supplier error:', err);
      }
    }
  };

  const addIncident = async (
    pedidoId: string,
    numeroOrden: string,
    tipo: Incident['tipo'],
    descripcion: string
  ) => {
    const newInc: Incident = {
      id: `inc-${Date.now().toString().slice(-5)}`,
      pedido_id: pedidoId,
      numero_orden: numeroOrden,
      tipo,
      descripcion,
      estado: 'abierta',
      reportado_por: currentUser?.nombre || 'Operador',
      fecha_creacion: new Date().toISOString(),
    };

    setIncidents((prev) => [newInc, ...prev]);

    // Also transition order to 'novedad' state if not already
    await updateOrderStatus(
      pedidoId,
      'novedad',
      `Novedad registrada: ${descripcion}`
    );

    if (fbUser) {
      try {
        await setDoc(doc(db, 'incidents', newInc.id), newInc);
      } catch (err) {
        console.warn('Firestore add incident error:', err);
      }
    }
  };

  const resolveIncident = async (incidentId: string, solucion: string) => {
    const now = new Date().toISOString();
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              estado: 'resuelta',
              solucion,
              fecha_resolucion: now,
            }
          : inc
      )
    );

    if (fbUser) {
      try {
        await updateDoc(doc(db, 'incidents', incidentId), {
          estado: 'resuelta',
          solucion,
          fecha_resolucion: now,
        });
      } catch (err) {
        console.warn('Firestore resolve incident error:', err);
      }
    }
  };

  const getSellerStore = (vendedorId?: string): SellerStore | undefined => {
    const vId = vendedorId || currentUser?.id;
    if (!vId) return undefined;
    return (
      stores.find((s) => s.vendedor_id === vId) ||
      (currentUser?.pais === 'VE'
        ? stores.find((s) => s.vendedor_id === 'seller-ven-01')
        : stores.find((s) => s.vendedor_id === 'seller-demo-01'))
    );
  };

  const getStoreProducts = (tiendaId: string): StoreProductItem[] => {
    return storeProducts.filter((sp) => sp.tienda_id === tiendaId);
  };

  const createOrUpdateStore = async (
    storeData: Partial<SellerStore> & { nombre_tienda: string; pais: CountryCode }
  ): Promise<string> => {
    const vId = currentUser?.id || 'seller-demo-01';
    const existingIndex = stores.findIndex((s) => s.vendedor_id === vId || (storeData.id && s.id === storeData.id));
    const now = new Date().toISOString();

    const cleanSlug = (storeData.nombre_tienda || 'mi-tienda')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (existingIndex !== -1) {
      const updatedStore: SellerStore = {
        ...stores[existingIndex],
        ...storeData,
        slug: storeData.slug || stores[existingIndex].slug || cleanSlug,
      };
      setStores((prev) => prev.map((s, idx) => (idx === existingIndex ? updatedStore : s)));

      if (fbUser) {
        try {
          await updateDoc(doc(db, 'stores', updatedStore.id), updatedStore);
        } catch (e) {
          console.warn('Firestore update store:', e);
        }
      }
      return updatedStore.id;
    } else {
      const newStoreId = `store-${Date.now().toString().slice(-6)}`;
      const newStore: SellerStore = {
        id: newStoreId,
        vendedor_id: vId,
        nombre_tienda: storeData.nombre_tienda,
        slug: cleanSlug,
        slogan: storeData.slogan || 'Tu tienda aliada con pago contraentrega',
        descripcion: storeData.descripcion || 'Envíos garantizados y pago seguro al recibir en la puerta de tu casa.',
        pais: storeData.pais,
        moneda: storeData.pais === 'VE' ? 'USD' : 'COP',
        color_primario: storeData.color_primario || (storeData.pais === 'VE' ? '#2563eb' : '#059669'),
        banner_tipo: storeData.banner_tipo || 'moderno',
        whatsapp_contacto: storeData.whatsapp_contacto || '+573001234567',
        instagram_usuario: storeData.instagram_usuario || '',
        tiktok_usuario: storeData.tiktok_usuario || '',
        politica_envio: storeData.politica_envio || 'Envíos en 24 a 48h con transportadoras aliadas y pago contraentrega.',
        permite_contraentrega: storeData.permite_contraentrega ?? true,
        activo: true,
        fecha_creacion: now,
      };

      setStores((prev) => [newStore, ...prev]);

      if (fbUser) {
        try {
          await setDoc(doc(db, 'stores', newStore.id), newStore);
        } catch (e) {
          console.warn('Firestore set store:', e);
        }
      }
      return newStore.id;
    }
  };

  const addProductToStore = async (
    productId: string,
    tiendaId: string,
    precioVenta: number,
    tituloPersonalizado?: string,
    customLanding?: Partial<ProductLandingConfig>
  ): Promise<string> => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Producto no encontrado');

    const vId = currentUser?.id || 'seller-demo-01';
    const newId = `sp-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const defaultLanding: ProductLandingConfig = {
      titular_gancho: `🔥 ¡${product.nombre} Ahora con Descuento y Pago Contraentrega!`,
      subtitulo_gancho: product.descripcion.length > 140 ? product.descripcion.slice(0, 140) + '...' : product.descripcion,
      oferta_etiqueta: 'OFERTA POR TIEMPO LIMITADO • ENVÍO CONTRAENTREGA DISPONIBLE',
      precio_antes: Math.round(precioVenta * 1.35),
      beneficios_clave: [
        'Pago seguro contraentrega: cancelas únicamente al recibir en tu domicilio',
        `Garantía directa de ${product.garantia_meses} meses con reemplazo asegurado`,
        `Tiempo de entrega estimado: ${product.tiempo_despacho_estimado}`,
        'Soporte y atención personalizada antes y después de tu compra',
      ],
      garantia_texto: product.condiciones_garantia || `Garantía oficial de ${product.garantia_meses} meses respaldada por bodega mayorista.`,
      contador_oferta_activo: true,
      minutos_contador: 30,
      boton_cta_texto: '¡QUIERO PEDIRLO CON PAGO CONTRAENTREGA!',
      faq: [
        {
          pregunta: '¿Cómo funciona el pago contraentrega?',
          respuesta: 'Pagas en efectivo al transportador únicamente cuando el paquete esté en tus manos en tu casa u oficina.',
        },
        {
          pregunta: '¿Tienen cobertura nacional?',
          respuesta: 'Sí, despachamos a todo el país con transportadoras aliadas oficiales.',
        },
      ],
      testimonios: [
        {
          autor: 'Cliente Verificado',
          calificacion: 5,
          comentario: 'Llegó en perfecto estado al día siguiente. Pagué contraentrega sin ningún inconveniente.',
          ciudad: 'Ciudad Principal',
        },
      ],
      ...customLanding,
    };

    const newStoreProduct: StoreProductItem = {
      id: newId,
      tienda_id: tiendaId,
      vendedor_id: vId,
      producto_id: productId,
      titulo_personalizado: tituloPersonalizado || product.nombre,
      precio_venta: precioVenta,
      en_vitrina: true,
      destacado: false,
      fecha_agregado: now,
      landing_config: defaultLanding,
    };

    setStoreProducts((prev) => [
      newStoreProduct,
      ...prev.filter((sp) => !(sp.tienda_id === tiendaId && sp.producto_id === productId)),
    ]);

    if (fbUser) {
      try {
        await setDoc(doc(db, 'store_products', newId), newStoreProduct);
      } catch (e) {
        console.warn('Firestore add store product:', e);
      }
    }

    return newId;
  };

  const updateStoreProduct = async (storeProductId: string, updates: Partial<StoreProductItem>) => {
    setStoreProducts((prev) =>
      prev.map((sp) => (sp.id === storeProductId ? { ...sp, ...updates } : sp))
    );

    if (fbUser) {
      try {
        await updateDoc(doc(db, 'store_products', storeProductId), updates);
      } catch (e) {
        console.warn('Firestore update store product:', e);
      }
    }
  };

  const createOwnProductForStore = async (data: {
    tiendaId: string;
    nombre: string;
    categoria: string;
    descripcion: string;
    costoBase: number;
    precioVenta: number;
    stock: number;
    variantes: string[];
    imagenes: string[];
    garantiaMeses: number;
    tiempoDespacho: string;
    condicionesGarantia?: string;
  }): Promise<{ productId: string; storeProductId: string }> => {
    const store = stores.find((s) => s.id === data.tiendaId) || getSellerStore();
    const vId = currentUser?.id || store?.vendedor_id || 'seller-demo-01';
    const storeName = store?.nombre_tienda || 'Mi Tienda';
    const newProdId = `prod-propio-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const fallbackImage =
      data.imagenes.length > 0 && data.imagenes[0].trim() !== ''
        ? data.imagenes[0]
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

    const cleanImages = data.imagenes.filter((img) => img.trim() !== '');
    if (cleanImages.length === 0) cleanImages.push(fallbackImage);

    const newProduct: Product = {
      id: newProdId,
      proveedor_id: vId,
      proveedor_nombre: `${storeName} (Stock Propio)`,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categoria,
      imagenes: cleanImages,
      costo_proveedor: data.costoBase,
      precio_sugerido: data.precioVenta,
      inventario_disponible: data.stock,
      variantes: data.variantes.length > 0 ? data.variantes : ['Estándar'],
      tiempo_despacho_estimado: data.tiempoDespacho || '24 a 48 horas',
      garantia_meses: data.garantiaMeses || 3,
      condiciones_garantia: data.condicionesGarantia || 'Garantía directa de la tienda por defectos de fábrica.',
      estado: 'activo',
      ultima_actualizacion_inventario: now,
      fecha_creacion: now,
      es_propio: true,
      tienda_id: data.tiendaId,
      vendedor_id: vId,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Automatically add to storeProducts for this store vitrina & landing
    const newSpId = `sp-${Date.now().toString().slice(-6)}`;
    const defaultLanding: ProductLandingConfig = {
      titular_gancho: `🔥 ¡${data.nombre} - Exclusivo de Nuestra Tienda con Pago Contraentrega!`,
      subtitulo_gancho: data.descripcion.length > 140 ? data.descripcion.slice(0, 140) + '...' : data.descripcion,
      oferta_etiqueta: 'PRODUCTO EXCLUSIVO • DESPACHO DIRECTO DE NUESTRO ALMACÉN',
      precio_antes: Math.round(data.precioVenta * 1.3),
      beneficios_clave: [
        'Pago seguro contraentrega: cancelas únicamente al recibir en tus manos',
        `Garantía directa de ${data.garantiaMeses || 3} meses respaldada por ${storeName}`,
        `Despacho express: ${data.tiempoDespacho || '24 a 48 horas'} con transportadoras oficiales`,
        'Atención y seguimiento personalizado por WhatsApp antes y después de tu compra',
      ],
      garantia_texto: data.condicionesGarantia || `Garantía oficial de ${data.garantiaMeses || 3} meses de la tienda.`,
      contador_oferta_activo: true,
      minutos_contador: 30,
      boton_cta_texto: '¡QUIERO PEDIRLO CON PAGO CONTRAENTREGA!',
      faq: [
        {
          pregunta: '¿El producto está disponible para entrega inmediata?',
          respuesta: `Sí, contamos con ${data.stock} unidades en nuestro inventario listas para despacho inmediato.`,
        },
        {
          pregunta: '¿Cómo pago mi pedido?',
          respuesta: 'Pagas en efectivo al repartidor de la transportadora cuando el paquete llegue a tu dirección.',
        },
      ],
      testimonios: [
        {
          autor: 'Cliente Satisfecho',
          calificacion: 5,
          comentario: 'Excelente producto propio de la tienda. Llegó rápido y en perfecto estado.',
          ciudad: 'Ciudad Principal',
        },
      ],
    };

    const newStoreProduct: StoreProductItem = {
      id: newSpId,
      tienda_id: data.tiendaId,
      vendedor_id: vId,
      producto_id: newProdId,
      titulo_personalizado: data.nombre,
      precio_venta: data.precioVenta,
      en_vitrina: true,
      destacado: true,
      fecha_agregado: now,
      landing_config: defaultLanding,
    };

    setStoreProducts((prev) => [newStoreProduct, ...prev]);

    if (fbUser) {
      try {
        await setDoc(doc(db, 'products', newProdId), newProduct);
        await setDoc(doc(db, 'store_products', newSpId), newStoreProduct);
      } catch (e) {
        console.warn('Firestore create own product error:', e);
      }
    }

    return { productId: newProdId, storeProductId: newSpId };
  };

  const removeStoreProduct = async (storeProductId: string) => {
    setStoreProducts((prev) => prev.filter((sp) => sp.id !== storeProductId));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        fbUser,
        currentRole,
        setCurrentRole,
        currentCountry,
        setCurrentCountry,
        products,
        suppliers,
        orders,
        savedProducts,
        incidents,
        orderHistory,
        stores,
        storeProducts,
        isLoading,
        loginWithGoogle,
        logout,
        selectDemoUser,
        registerNewUser,
        createOrUpdateStore,
        createOwnProductForStore,
        addProductToStore,
        updateStoreProduct,
        removeStoreProduct,
        getSellerStore,
        getStoreProducts,
        saveProductForSeller,
        removeSavedProduct,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        addSupplier,
        addIncident,
        resolveIncident,
        calculateMargin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
