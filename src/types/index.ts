export type UserRole = 'admin' | 'vendedor' | 'proveedor' | 'soporte';
export type CountryCode = 'CO' | 'VE';

export interface UserProfile {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: UserRole;
  pais?: CountryCode;
  documento_identidad?: string;
  nombre_negocio?: string;
  ciudad?: string;
  estado: 'activo' | 'inactivo';
  fecha_creacion: string;
}

export interface Supplier {
  id: string;
  nombre_comercial: string;
  contacto: string;
  correo: string;
  telefono: string;
  ciudad: string;
  tiempo_despacho_horas: number;
  calificacion: number;
  estado: 'activo' | 'pendiente' | 'inactivo';
  productos_activos_count?: number;
  fecha_creacion: string;
}

export interface Product {
  id: string;
  proveedor_id: string;
  proveedor_nombre: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagenes: string[];
  costo_proveedor: number; // In COP or USD
  precio_sugerido?: number;
  inventario_disponible: number;
  variantes: string[];
  tiempo_despacho_estimado: string;
  garantia_meses: number;
  condiciones_garantia?: string;
  especificaciones?: Record<string, string>;
  estado: 'activo' | 'pausado' | 'agotado';
  ultima_actualizacion_inventario: string;
  fecha_creacion: string;
  es_propio?: boolean;
  tienda_id?: string;
  vendedor_id?: string;
}

export interface SavedProduct {
  id: string;
  vendedor_id: string;
  producto_id: string;
  precio_venta: number;
  margen_estimado: number;
  notas?: string;
  fecha_guardado: string;
}

export type OrderStatus =
  | 'pendiente_confirmacion'
  | 'confirmado'
  | 'en_preparacion'
  | 'despachado'
  | 'en_transito'
  | 'entregado'
  | 'novedad'
  | 'cancelado'
  | 'devuelto';

export interface Order {
  id: string;
  numero_orden: string;
  vendedor_id: string;
  vendedor_nombre: string;
  proveedor_id: string;
  proveedor_nombre: string;
  producto_id: string;
  producto_nombre: string;
  producto_imagen?: string;
  variante: string;
  cantidad: number;
  cliente_nombre: string;
  cliente_telefono: string;
  departamento: string;
  ciudad_entrega: string;
  direccion_entrega: string;
  precio_cobrado: number; // In COP
  costo_producto: number; // In COP
  costo_envio: number | null; // null if pending
  comision_plataforma: number; // In COP (e.g., 5% de precio_cobrado)
  otros_costos?: number;
  ganancia_estimada: number;
  costo_envio_confirmado: boolean;
  metodo_pago: 'contraentrega' | 'transferencia' | 'tarjeta' | 'billetera_digital';
  estado: OrderStatus;
  transportadora?: string;
  numero_guia?: string;
  url_seguimiento?: string;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface OrderHistoryItem {
  id: string;
  pedido_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  usuario_id: string;
  usuario_nombre: string;
  nota?: string;
  fecha: string;
}

export interface Incident {
  id: string;
  pedido_id: string;
  numero_orden: string;
  tipo:
    | 'direccion_incorrecta'
    | 'cliente_ausente'
    | 'retraso_transportadora'
    | 'producto_defectuoso'
    | 'averia_empaque'
    | 'otro';
  descripcion: string;
  estado: 'abierta' | 'en_revision' | 'resuelta';
  reportado_por: string;
  solucion?: string;
  fecha_creacion: string;
  fecha_resolucion?: string;
}

export interface GeminiCopyRequest {
  producto: {
    nombre: string;
    descripcion: string;
    categoria: string;
    costo_proveedor: number;
    precio_venta_sugerido?: number;
    variantes: string[];
    garantia_meses: number;
    tiempo_despacho_estimado: string;
    condiciones_garantia?: string;
    especificaciones?: Record<string, string>;
  };
  formato: 'descripcion_tienda' | 'anuncio_facebook' | 'guion_tiktok' | 'mensaje_whatsapp' | 'preguntas_frecuentes';
  tono: 'persuasivo' | 'profesional_directo' | 'urgencia_oferta' | 'cercano_amigable';
}

export interface GeminiCopyResponse {
  titulo_principal: string;
  titulos_alternativos: string[];
  contenido: string;
  puntos_clave: string[];
  llamado_a_la_accion: string;
  datos_faltantes_advertencia?: string[];
}

export interface SellerStore {
  id: string;
  vendedor_id: string;
  nombre_tienda: string;
  slug: string;
  slogan: string;
  descripcion: string;
  pais: CountryCode;
  moneda: 'COP' | 'USD';
  color_primario: string;
  banner_tipo: 'moderno' | 'minimalista' | 'comercial';
  logo_url?: string;
  whatsapp_contacto: string;
  instagram_usuario?: string;
  tiktok_usuario?: string;
  politica_envio: string;
  permite_contraentrega: boolean;
  activo: boolean;
  fecha_creacion: string;
}

export interface ProductLandingConfig {
  titular_gancho: string;
  subtitulo_gancho: string;
  oferta_etiqueta: string;
  precio_antes: number;
  beneficios_clave: string[];
  garantia_texto: string;
  contador_oferta_activo: boolean;
  minutos_contador: number;
  boton_cta_texto: string;
  faq: Array<{ pregunta: string; respuesta: string }>;
  testimonios: Array<{ autor: string; calificacion: number; comentario: string; ciudad: string }>;
}

export interface StoreProductItem {
  id: string;
  tienda_id: string;
  vendedor_id: string;
  producto_id: string;
  titulo_personalizado?: string;
  precio_venta: number;
  en_vitrina: boolean;
  destacado: boolean;
  fecha_agregado: string;
  landing_config: ProductLandingConfig;
}
