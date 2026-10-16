import React, { useState, useMemo } from 'react';
import { SellerStore, StoreProductItem, Product, ProductLandingConfig, CountryCode } from '../types';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import { StorePublicModal } from './StorePublicModal';
import { ProductLandingModal } from './ProductLandingModal';
import { AddOwnProductModal } from './AddOwnProductModal';
import {
  Store,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  Plus,
  Eye,
  Settings,
  Flame,
  CheckCircle,
  Truck,
  ShieldCheck,
  Phone,
  Share2,
  Layers,
  Copy,
  TrendingUp,
  AlertTriangle,
  FileText,
  X,
  Tag,
  Package,
  Minus,
  Boxes,
  DollarSign,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface Props {
  onNavigateToCatalog: () => void;
  initialTab?: 'vitrina' | 'productos_propios' | 'landing_builder' | 'configuracion';
}

const PRESET_SAMPLE_IMAGES = [
  { label: 'Tecnología / Smart', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'Belleza / Cosméticos', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80' },
  { label: 'Moda / Calzado', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { label: 'Hogar / Accesorios', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Audio / Auriculares', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Deportes / Fitness', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
];

export const SellerStoreView: React.FC<Props> = ({ onNavigateToCatalog, initialTab = 'vitrina' }) => {
  const {
    currentUser,
    currentCountry,
    products,
    stores,
    storeProducts,
    getSellerStore,
    getStoreProducts,
    createOrUpdateStore,
    updateStoreProduct,
    removeStoreProduct,
    updateProduct,
    createOwnProductForStore,
    calculateMargin,
  } = useApp();

  const sellerStore = getSellerStore();

  const [activeTab, setActiveTab] = useState<'vitrina' | 'productos_propios' | 'landing_builder' | 'configuracion'>(
    initialTab
  );
  const [ownSectionView, setOwnSectionView] = useState<'crear' | 'inventario'>('crear');
  const [selectedLandingItem, setSelectedLandingItem] = useState<StoreProductItem | null>(null);

  // Modals for preview and own product creation
  const [previewStoreOpen, setPreviewStoreOpen] = useState(false);
  const [addOwnProductModalOpen, setAddOwnProductModalOpen] = useState(false);
  const [vitrinaFilter, setVitrinaFilter] = useState<'todos' | 'propios' | 'mayoristas'>('todos');
  const [previewLandingItem, setPreviewLandingItem] = useState<{
    storeProduct: StoreProductItem;
    product: Product;
  } | null>(null);

  // Store form state
  const [nombreTienda, setNombreTienda] = useState(sellerStore?.nombre_tienda || 'Mi Tienda Dropshipping');
  const [slogan, setSlogan] = useState(sellerStore?.slogan || 'Envíos contraentrega garantizados a todo el país');
  const [descripcion, setDescripcion] = useState(
    sellerStore?.descripcion ||
      'Somos distribuidores aliados oficiales. Despachos rápidos y pago seguro en la puerta de tu casa.'
  );
  const [pais, setPais] = useState<CountryCode>(sellerStore?.pais || currentCountry);
  const [colorPrimario, setColorPrimario] = useState(sellerStore?.color_primario || '#059669');
  const [whatsappContacto, setWhatsappContacto] = useState(sellerStore?.whatsapp_contacto || '+573124589201');
  const [instagramUsuario, setInstagramUsuario] = useState(sellerStore?.instagram_usuario || '');
  const [tiktokUsuario, setTiktokUsuario] = useState(sellerStore?.tiktok_usuario || '');
  const [politicaEnvio, setPoliticaEnvio] = useState(
    sellerStore?.politica_envio || 'Envíos en 24 a 48 horas con Servientrega, Coordinadora y pago contraentrega.'
  );
  const [permiteContraentrega, setPermiteContraentrega] = useState(sellerStore?.permite_contraentrega ?? true);
  const [storeSavedFeedback, setStoreSavedFeedback] = useState(false);

  // Landing page builder editor state
  const [builderHeadline, setBuilderHeadline] = useState('');
  const [builderSubheadline, setBuilderSubheadline] = useState('');
  const [builderOfferTag, setBuilderOfferTag] = useState('');
  const [builderPriceAntes, setBuilderPriceAntes] = useState(0);
  const [builderCtaText, setBuilderCtaText] = useState('');
  const [builderWarranty, setBuilderWarranty] = useState('');
  const [builderMinutes, setBuilderMinutes] = useState(30);
  const [builderBenefits, setBuilderBenefits] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [landingSavedFeedback, setLandingSavedFeedback] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Own product in-page creation form state
  const defaultBaseCost = currentCountry === 'CO' ? 35000 : 15;
  const defaultSalePrice = currentCountry === 'CO' ? 79900 : 35;
  const [ownNombre, setOwnNombre] = useState('');
  const [ownCategoria, setOwnCategoria] = useState('Tecnología');
  const [ownDescripcion, setOwnDescripcion] = useState('');
  const [ownCostoBase, setOwnCostoBase] = useState<number>(defaultBaseCost);
  const [ownPrecioVenta, setOwnPrecioVenta] = useState<number>(defaultSalePrice);
  const [ownStock, setOwnStock] = useState<number>(25);
  const [ownVariantesInput, setOwnVariantesInput] = useState('Negro, Blanco, Azul');
  const [ownImageUrl, setOwnImageUrl] = useState(PRESET_SAMPLE_IMAGES[0].url);
  const [ownTiempoDespacho, setOwnTiempoDespacho] = useState('Despacho en 24 horas');
  const [ownGarantiaMeses, setOwnGarantiaMeses] = useState<number>(3);
  const [ownCondicionesGarantia, setOwnCondicionesGarantia] = useState(
    'Garantía directa de nuestra tienda por 90 días ante cualquier falla de fábrica.'
  );
  const [ownSaving, setOwnSaving] = useState(false);
  const [ownCreatedSuccess, setOwnCreatedSuccess] = useState<{
    prodId: string;
    spId: string;
    name: string;
  } | null>(null);

  // Live margin calculation for own product creation form
  const ownProductLiveMargin = useMemo(() => {
    return calculateMargin(ownPrecioVenta, ownCostoBase, 15000);
  }, [ownPrecioVenta, ownCostoBase, calculateMargin]);

  // Products belonging to this store
  const currentStoreProducts = useMemo(() => {
    if (!sellerStore) return [];
    return getStoreProducts(sellerStore.id);
  }, [sellerStore, storeProducts]);

  const filteredStoreProducts = useMemo(() => {
    return currentStoreProducts.filter((sp) => {
      const prod = products.find((p) => p.id === sp.producto_id);
      if (!prod) return false;
      if (vitrinaFilter === 'propios') return !!prod.es_propio;
      if (vitrinaFilter === 'mayoristas') return !prod.es_propio;
      return true;
    });
  }, [currentStoreProducts, products, vitrinaFilter]);

  const propiosCount = useMemo(() => {
    return currentStoreProducts.filter((sp) => {
      const prod = products.find((p) => p.id === sp.producto_id);
      return !!prod?.es_propio;
    }).length;
  }, [currentStoreProducts, products]);

  const mayoristasCount = currentStoreProducts.length - propiosCount;

  // List of own products belonging to this store
  const ownStoreProductsList = useMemo(() => {
    return currentStoreProducts
      .filter((sp) => {
        const prod = products.find((p) => p.id === sp.producto_id);
        return !!prod?.es_propio;
      })
      .map((sp) => {
        const prod = products.find((p) => p.id === sp.producto_id)!;
        return { storeProduct: sp, product: prod };
      });
  }, [currentStoreProducts, products]);

  // Aggregate stats for own products
  const ownStats = useMemo(() => {
    const totalStock = ownStoreProductsList.reduce((acc, item) => acc + (item.product.inventario_disponible || 0), 0);
    const totalCostValue = ownStoreProductsList.reduce(
      (acc, item) => acc + (item.product.inventario_disponible || 0) * item.product.costo_proveedor,
      0
    );
    const totalProfitProjected = ownStoreProductsList.reduce((acc, item) => {
      const margin = calculateMargin(item.storeProduct.precio_venta, item.product.costo_proveedor, 15000);
      return acc + margin.gananciaEstimada * (item.product.inventario_disponible || 0);
    }, 0);

    return {
      totalProducts: ownStoreProductsList.length,
      totalStock,
      totalCostValue,
      totalProfitProjected,
    };
  }, [ownStoreProductsList, calculateMargin]);

  // Handle in-page creation of own product
  const handleCreateOwnProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownNombre.trim()) return;

    setOwnSaving(true);
    try {
      let tiendaId = sellerStore?.id;
      if (!tiendaId) {
        tiendaId = await createOrUpdateStore({
          nombre_tienda: currentUser?.nombre_negocio || `Tienda de ${currentUser?.nombre || 'Vendedor'}`,
          pais: currentUser?.pais || currentCountry,
        });
      }

      const variantes = ownVariantesInput
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const result = await createOwnProductForStore({
        tiendaId,
        nombre: ownNombre,
        categoria: ownCategoria,
        descripcion: ownDescripcion,
        costoBase: ownCostoBase,
        precioVenta: ownPrecioVenta,
        stock: ownStock,
        variantes: variantes.length > 0 ? variantes : ['Estándar'],
        imagenes: [ownImageUrl],
        garantiaMeses: ownGarantiaMeses,
        tiempoDespacho: ownTiempoDespacho,
        condicionesGarantia: ownCondicionesGarantia,
      });

      setOwnCreatedSuccess({
        prodId: result.productId,
        spId: result.storeProductId,
        name: ownNombre,
      });

      // Clear form with fresh defaults
      setOwnNombre('');
      setOwnDescripcion('');
      setOwnStock(25);
    } catch (err) {
      console.error('Error creating own product:', err);
    } finally {
      setOwnSaving(false);
    }
  };

  // Quick stock adjuster for own products
  const handleQuickStockChange = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    await updateProduct(productId, { inventario_disponible: newStock });
  };

  // Sync builder when selecting a product
  const handleSelectProductForBuilder = (item: StoreProductItem) => {
    setSelectedLandingItem(item);
    const cfg = item.landing_config;
    setBuilderHeadline(cfg.titular_gancho || '');
    setBuilderSubheadline(cfg.subtitulo_gancho || '');
    setBuilderOfferTag(cfg.oferta_etiqueta || '');
    setBuilderPriceAntes(cfg.precio_antes || Math.round(item.precio_venta * 1.35));
    setBuilderCtaText(cfg.boton_cta_texto || '¡QUIERO PEDIRLO CON PAGO CONTRAENTREGA!');
    setBuilderWarranty(cfg.garantia_texto || 'Garantía oficial con cambio directo.');
    setBuilderMinutes(cfg.minutos_contador || 28);
    setBuilderBenefits(cfg.beneficios_clave || []);
    setActiveTab('landing_builder');
  };

  // Save store settings
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrUpdateStore({
      id: sellerStore?.id,
      nombre_tienda: nombreTienda,
      slogan,
      descripcion,
      pais,
      color_primario: colorPrimario,
      whatsapp_contacto: whatsappContacto,
      instagram_usuario: instagramUsuario,
      tiktok_usuario: tiktokUsuario,
      politica_envio: politicaEnvio,
      permite_contraentrega: permiteContraentrega,
    });
    setStoreSavedFeedback(true);
    setTimeout(() => setStoreSavedFeedback(false), 2500);
  };

  // Save landing changes
  const handleSaveLanding = async () => {
    if (!selectedLandingItem) return;

    const updatedConfig: ProductLandingConfig = {
      ...selectedLandingItem.landing_config,
      titular_gancho: builderHeadline,
      subtitulo_gancho: builderSubheadline,
      oferta_etiqueta: builderOfferTag,
      precio_antes: builderPriceAntes,
      boton_cta_texto: builderCtaText,
      garantia_texto: builderWarranty,
      minutos_contador: builderMinutes,
      beneficios_clave: builderBenefits,
    };

    await updateStoreProduct(selectedLandingItem.id, {
      landing_config: updatedConfig,
    });

    setLandingSavedFeedback(true);
    setTimeout(() => setLandingSavedFeedback(false), 2500);
  };

  // Generate persuasive copy with templates / AI logic
  const handleGenerateAiCopy = () => {
    if (!selectedLandingItem) return;
    const prod = products.find((p) => p.id === selectedLandingItem.producto_id);
    if (!prod) return;

    setAiGenerating(true);
    setTimeout(() => {
      setBuilderHeadline(`🔥 ¡${prod.nombre} con 40% OFF + Envío Gratis Contraentrega a Toda Colombia!`);
      setBuilderSubheadline(
        `Descubre la solución definitiva: calidad prémium certificada, garantía oficial y pago seguro al recibir en la comodidad de tu hogar.`
      );
      setBuilderOfferTag('OFERTA RELÁMPAGO DE TEMPORADA • PAGAS AL RECIBIR');
      setBuilderBenefits([
        'Pago contraentrega garantizado: cero riesgo, cancelas cuando el paquete llegue a tus manos',
        `Garantía de ${prod.garantia_meses} meses respaldada por bodega mayorista`,
        `Despacho inmediato en 24 a 48h con transportadoras aliadas`,
        'Asesoría y acompañamiento post-venta vía WhatsApp los 7 días de la semana',
      ]);
      setBuilderCtaText('¡SÍ, QUIERO APROVECHAR LA OFERTA Y PAGAR AL RECIBIR!');
      setAiGenerating(false);
    }, 700);
  };

  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setBuilderBenefits((prev) => [...prev, newBenefitInput.trim()]);
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setBuilderBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl">
              <Store className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                Mi Tienda Virtual & Vitrinas
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {sellerStore?.nombre_tienda || 'Sin Tienda Creada'}
                </span>
              </h1>
              <p className="text-xs text-zinc-500">
                Crea tu tienda, exhibe productos mayoristas con tu propio margen y genera landing pages de alta conversión para pauta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAddOwnProductModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Crear Producto Propio</span>
          </button>

          <button
            onClick={onNavigateToCatalog}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-300 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Agregar del Mayorista</span>
          </button>

          <button
            onClick={() => {
              if (sellerStore) setPreviewStoreOpen(true);
            }}
            disabled={!sellerStore}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Mi Tienda en Vivo</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vitrina')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'vitrina'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Mi Vitrina ({currentStoreProducts.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('productos_propios');
            setOwnSectionView('crear');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'productos_propios'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>➕ Productos Propios ({propiosCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('landing_builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'landing_builder'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Creador de Landing Pages</span>
        </button>

        <button
          onClick={() => setActiveTab('configuracion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'configuracion'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración de Tienda</span>
        </button>
      </div>

      {/* Tab 1: Vitrina & Showcase Products */}
      {activeTab === 'vitrina' && (
        <div className="space-y-5">
          {/* Sub-toolbar: Filter by Own Products vs Wholesaler Products */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setVitrinaFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  vitrinaFilter === 'todos' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                Todos ({currentStoreProducts.length})
              </button>
              <button
                onClick={() => setVitrinaFilter('propios')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  vitrinaFilter === 'propios' ? 'bg-emerald-600 text-white' : 'text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Productos Propios ({propiosCount})</span>
              </button>
              <button
                onClick={() => setVitrinaFilter('mayoristas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  vitrinaFilter === 'mayoristas' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>De Mayoristas ({mayoristasCount})</span>
              </button>
            </div>

            <button
              onClick={() => setAddOwnProductModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Producto Propio</span>
            </button>
          </div>

          {filteredStoreProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-4 shadow-xs">
              <ShoppingBag className="w-14 h-14 text-zinc-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-zinc-900">
                  {vitrinaFilter === 'propios'
                    ? 'Aún no has agregado productos propios a tu tienda'
                    : 'Tu vitrina aún no tiene productos exhibidos'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  {vitrinaFilter === 'propios'
                    ? 'Agrega tus propios artículos de fabricación personal o inventario privado con tus fotos, stock y precios.'
                    : 'Explora el catálogo mayorista o agrega productos propios para comenzar a vender con pago contraentrega.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setAddOwnProductModalOpen(true)}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer"
                >
                  ➕ Crear Mi Primer Producto Propio
                </button>
                <button
                  onClick={onNavigateToCatalog}
                  className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-zinc-300"
                >
                  Explorar Mayoristas
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStoreProducts.map((sp) => {
                const prod = products.find((p) => p.id === sp.producto_id);
                if (!prod) return null;

                const margin = calculateMargin(sp.precio_venta, prod.costo_proveedor, 15000);

                return (
                  <div
                    key={sp.id}
                    className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                        <img
                          src={prod.imagenes[0]}
                          alt={prod.nombre}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          {prod.es_propio ? (
                            <span className="text-amber-300 font-extrabold flex items-center gap-1">
                              <Tag className="w-3 h-3 text-amber-400" /> Producto Propio de Mi Tienda
                            </span>
                          ) : (
                            <span>Mayorista: {prod.proveedor_nombre}</span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs">
                          {prod.es_propio ? 'Stock Propio:' : 'Stock:'} {prod.inventario_disponible} uds
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sp.en_vitrina
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {sp.en_vitrina ? '● Exhibido en Vitrina' : 'Pausado'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-sm text-zinc-900 line-clamp-2 leading-snug">
                          {sp.titulo_personalizado || prod.nombre}
                        </h3>

                        {/* Financial card */}
                        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Tu Precio al Público:</span>
                            <span className="font-extrabold text-zinc-900">
                              {formatMoney(sp.precio_venta, sellerStore?.pais || currentCountry)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">{prod.es_propio ? 'Costo Base Propio:' : 'Costo Mayorista:'}</span>
                            <span className="text-zinc-600 font-medium">
                              {formatMoney(prod.costo_proveedor, sellerStore?.pais || currentCountry)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200 text-xs">
                            <span className="font-bold text-emerald-950">Tu Ganancia Neta:</span>
                            <span className="font-black text-emerald-700">
                              +{formatMoney(margin.gananciaEstimada, sellerStore?.pais || currentCountry)} ({margin.margenPorcentaje}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="p-4 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            if (sellerStore) {
                              setPreviewLandingItem({ storeProduct: sp, product: prod });
                            }
                          }}
                          className="w-full py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Landing</span>
                        </button>

                        <button
                          onClick={() => handleSelectProductForBuilder(sp)}
                          className="w-full py-2 px-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar Landing</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                        <button
                          onClick={() =>
                            updateStoreProduct(sp.id, { en_vitrina: !sp.en_vitrina })
                          }
                          className="text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
                        >
                          {sp.en_vitrina ? 'Ocultar de vitrina' : 'Mostrar en vitrina'}
                        </button>
                        <button
                          onClick={() => removeStoreProduct(sp.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sección de Agregar y Gestionar Productos Propios */}
      {activeTab === 'productos_propios' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Section Presentation */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
                      Sección de Productos Propios de Mi Tienda
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Inventario Privado & Marca
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Publica artículos de tu propiedad con tu inventario personal de bodega o taller. Fija tus precios con cálculo de margen en tiempo real y activa su landing page de venta con pago contraentrega.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddOwnProductModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all border border-zinc-300 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Abrir en Ventana Emergente</span>
                </button>
              </div>
            </div>

            {/* Dashboard KPI cards for Own Products */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-zinc-150">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-xs font-semibold">Artículos Propios</span>
                  <Tag className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-900">
                  {ownStats.totalProducts}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Exhibidos en tu catálogo</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-xs font-semibold">Stock en Bodega</span>
                  <Boxes className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-900">
                  {ownStats.totalStock} <span className="text-xs font-normal text-zinc-500">uds</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Unidades físicas disponibles</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span className="text-xs font-semibold">Capital en Stock</span>
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-900">
                  {formatMoney(ownStats.totalCostValue, sellerStore?.pais || currentCountry)}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Inversión a costo base</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-xs font-bold">Ganancia Proyectada</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-700">
                  +{formatMoney(ownStats.totalProfitProjected, sellerStore?.pais || currentCountry)}
                </p>
                <p className="text-[10px] text-emerald-800/80 mt-0.5">Retorno total al vender stock</p>
              </div>
            </div>

            {/* Sub-view navigation: Crear vs Administrar */}
            <div className="flex items-center gap-2 mt-6 pt-2">
              <button
                onClick={() => setOwnSectionView('crear')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  ownSectionView === 'crear'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Formulario: Crear Nuevo Producto Propio</span>
              </button>

              <button
                onClick={() => setOwnSectionView('inventario')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  ownSectionView === 'inventario'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Mis Productos Propios Publicados ({ownStoreProductsList.length})</span>
              </button>
            </div>
          </div>

          {/* Sub-view 1: In-Page Creation Form */}
          {ownSectionView === 'crear' && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Success Notification Alert */}
              {ownCreatedSuccess && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-emerald-950">
                        ¡Producto Propio "{ownCreatedSuccess.name}" Creado y Publicado con Éxito!
                      </h3>
                      <p className="text-xs text-emerald-800">
                        Tu producto ya está exhibido en tu vitrina pública y su landing page optimizada está lista para pauta publicitaria.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        const foundSp = currentStoreProducts.find((p) => p.id === ownCreatedSuccess.spId);
                        const foundProd = products.find((p) => p.id === ownCreatedSuccess.prodId);
                        if (foundSp && foundProd && sellerStore) {
                          setPreviewLandingItem({ storeProduct: foundSp, product: foundProd });
                        }
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Landing Page del Producto</span>
                    </button>

                    <button
                      onClick={() => {
                        const foundSp = currentStoreProducts.find((p) => p.id === ownCreatedSuccess.spId);
                        if (foundSp) {
                          handleSelectProductForBuilder(foundSp);
                        }
                      }}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Personalizar Landing en el Creador</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('vitrina')}
                      className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 font-bold text-xs rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      Ver en Mi Vitrina
                    </button>

                    <button
                      onClick={() => setOwnCreatedSuccess(null)}
                      className="px-3 py-2 text-zinc-500 hover:text-zinc-800 text-xs font-semibold cursor-pointer"
                    >
                      Crear otro producto
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateOwnProductSubmit} className="space-y-6">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-zinc-900">
                      1. Información & Categoría del Producto
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Nombre Comercial del Producto Propio *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownNombre}
                      onChange={(e) => setOwnNombre(e.target.value)}
                      placeholder="Ej: Kit Reloj Smartwatch Ultra Titanium + Manilla de Cuero Genuino"
                      className="w-full text-xs font-semibold p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Categoría del Catálogo *
                      </label>
                      <select
                        value={ownCategoria}
                        onChange={(e) => setOwnCategoria(e.target.value)}
                        className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-semibold text-zinc-800"
                      >
                        <option value="Tecnología">Tecnología & Gadgets</option>
                        <option value="Belleza">Belleza & Cuidado Personal</option>
                        <option value="Hogar">Hogar & Cocina</option>
                        <option value="Moda">Moda, Ropa & Calzado</option>
                        <option value="Deportes">Deportes & Fitness</option>
                        <option value="Accesorios">Accesorios & Joyería</option>
                        <option value="Salud">Salud & Bienestar</option>
                        <option value="Otros">Otro / Novedades</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Variantes Disponibles (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={ownVariantesInput}
                        onChange={(e) => setOwnVariantesInput(e.target.value)}
                        placeholder="Ej: Negro, Plateado, Dorado ó S, M, L, XL"
                        className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Descripción Persuasiva & Características Principales *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={ownDescripcion}
                      onChange={(e) => setOwnDescripcion(e.target.value)}
                      placeholder="Describe qué hace especial a tu producto, qué incluye el paquete y por qué tu cliente debe pedirlo hoy con pago contraentrega..."
                      className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                    />
                  </div>
                </div>

                {/* 2. Pricing, Profit & Stock */}
                <div className="space-y-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-zinc-900">
                      2. Precios, Rentabilidad & Almacén Propio
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Tu Costo Base de Adquisición / Fabricación *
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={currentCountry === 'CO' ? '500' : '1'}
                        value={ownCostoBase}
                        onChange={(e) => setOwnCostoBase(Number(e.target.value))}
                        className="w-full text-xs font-bold p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        required
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">Tu inversión por unidad</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Precio de Venta al Público en Tu Tienda *
                      </label>
                      <input
                        type="number"
                        min={ownCostoBase}
                        step={currentCountry === 'CO' ? '500' : '1'}
                        value={ownPrecioVenta}
                        onChange={(e) => setOwnPrecioVenta(Number(e.target.value))}
                        className="w-full text-xs font-extrabold text-emerald-800 p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        required
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">Precio al que compra tu cliente</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Stock Físico Propio en Bodega *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={ownStock}
                        onChange={(e) => setOwnStock(Number(e.target.value))}
                        className="w-full text-xs font-bold p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        required
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">Unidades reales en tu inventario</span>
                    </div>
                  </div>

                  {/* Financial calculation card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center">
                    <div>
                      <p className="text-[11px] text-emerald-900 font-semibold">Costo Base Propio</p>
                      <p className="text-sm font-bold text-zinc-800 mt-0.5">
                        {formatMoney(ownCostoBase, sellerStore?.pais || currentCountry)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-emerald-900 font-semibold">Flete + Plataforma</p>
                      <p className="text-sm font-bold text-zinc-800 mt-0.5">
                        {formatMoney(
                          ownProductLiveMargin.envio + ownProductLiveMargin.comisionPlataforma,
                          sellerStore?.pais || currentCountry
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-emerald-950 font-bold">Ganancia Neta por Venta</p>
                      <p className="text-sm font-black text-emerald-700 mt-0.5">
                        +{formatMoney(ownProductLiveMargin.gananciaEstimada, sellerStore?.pais || currentCountry)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-emerald-950 font-bold">Margen de Retorno</p>
                      <p className="text-sm font-black text-emerald-800 mt-0.5">
                        {ownProductLiveMargin.margenPorcentaje}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Image & Visuals */}
                <div className="space-y-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-zinc-900">
                      3. Fotografía & Presentación Visual
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      URL de la Imagen Principal *
                    </label>
                    <input
                      type="url"
                      required
                      value={ownImageUrl}
                      onChange={(e) => setOwnImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-zinc-700 block mb-2">
                      O selecciona una imagen de muestra para tu categoría:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_SAMPLE_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOwnImageUrl(preset.url)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            ownImageUrl === preset.url
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ownImageUrl && (
                    <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 shrink-0 bg-white shadow-xs">
                        <img src={ownImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-zinc-900 block">Vista previa de imagen</span>
                        <p className="text-zinc-500 text-[11px]">
                          Esta imagen se mostrará en tu vitrina pública, en tu catálogo y en la portada de tu landing page de venta.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Logistics & Warranty */}
                <div className="space-y-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-zinc-900">
                      4. Despacho & Garantía de Tu Tienda
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Tiempo de Despacho Estimado
                      </label>
                      <input
                        type="text"
                        value={ownTiempoDespacho}
                        onChange={(e) => setOwnTiempoDespacho(e.target.value)}
                        placeholder="Ej: Despacho en 24 horas"
                        className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Garantía de Tienda (Meses)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={36}
                        value={ownGarantiaMeses}
                        onChange={(e) => setOwnGarantiaMeses(Number(e.target.value))}
                        className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Condiciones de Garantía Ofrecidas al Cliente
                    </label>
                    <input
                      type="text"
                      value={ownCondicionesGarantia}
                      onChange={(e) => setOwnCondicionesGarantia(e.target.value)}
                      className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
                  <button
                    type="submit"
                    disabled={ownSaving}
                    className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {ownSaving ? (
                      <span>Publicando Producto en Tu Tienda...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publicar Producto en Mi Tienda y Vitrina</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-view 2: Inventory list of own products */}
          {ownSectionView === 'inventario' && (
            <div className="space-y-4">
              {ownStoreProductsList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-4 shadow-xs">
                  <Package className="w-14 h-14 text-zinc-300 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-zinc-900">
                      Aún no tienes productos propios registrados
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto">
                      Usa el formulario para dar de alta artículos con tu inventario personal, fijar tus precios y activar su landing de venta.
                    </p>
                  </div>
                  <button
                    onClick={() => setOwnSectionView('crear')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    ➕ Crear Mi Primer Producto Propio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ownStoreProductsList.map(({ storeProduct: sp, product: prod }) => {
                    const margin = calculateMargin(sp.precio_venta, prod.costo_proveedor, 15000);

                    return (
                      <div
                        key={sp.id}
                        className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Header */}
                          <div className="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                            <img
                              src={prod.imagenes[0]}
                              alt={prod.nombre}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 left-2.5 bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                              <Tag className="w-3 h-3 text-emerald-200" />
                              <span>Producto Propio</span>
                            </div>

                            <div className="absolute bottom-2.5 left-2.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sp.en_vitrina
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-zinc-200 text-zinc-700'
                                }`}
                              >
                                {sp.en_vitrina ? '● Exhibido en Vitrina' : 'Pausado'}
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-4 space-y-3">
                            <h3 className="font-bold text-sm text-zinc-900 line-clamp-2 leading-snug">
                              {sp.titulo_personalizado || prod.nombre}
                            </h3>

                            {/* Stock Quick Editor */}
                            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-700">Stock Propio Disponible:</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleQuickStockChange(prod.id, prod.inventario_disponible, -1)
                                    }
                                    disabled={prod.inventario_disponible <= 0}
                                    className="w-6 h-6 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="font-black text-sm text-zinc-900 px-1">
                                    {prod.inventario_disponible}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleQuickStockChange(prod.id, prod.inventario_disponible, 1)
                                    }
                                    className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-200">
                                <span className="text-zinc-500">Costo Base Propio:</span>
                                <span className="font-semibold text-zinc-700">
                                  {formatMoney(prod.costo_proveedor, sellerStore?.pais || currentCountry)}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Precio de Venta:</span>
                                <span className="font-extrabold text-zinc-900">
                                  {formatMoney(sp.precio_venta, sellerStore?.pais || currentCountry)}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-200">
                                <span className="font-bold text-emerald-950">Ganancia Neta:</span>
                                <span className="font-black text-emerald-700">
                                  +{formatMoney(margin.gananciaEstimada, sellerStore?.pais || currentCountry)} ({margin.margenPorcentaje}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 pt-0 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                if (sellerStore) {
                                  setPreviewLandingItem({ storeProduct: sp, product: prod });
                                }
                              }}
                              className="w-full py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Landing</span>
                            </button>

                            <button
                              onClick={() => handleSelectProductForBuilder(sp)}
                              className="w-full py-2 px-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar Landing</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                            <button
                              onClick={() =>
                                updateStoreProduct(sp.id, { en_vitrina: !sp.en_vitrina })
                              }
                              className="text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
                            >
                              {sp.en_vitrina ? 'Ocultar de vitrina' : 'Mostrar en vitrina'}
                            </button>

                            <button
                              onClick={() => removeStoreProduct(sp.id)}
                              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Landing Page Visual Builder */}
      {activeTab === 'landing_builder' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Creador y Editor de Landing Pages de Conversión
              </h2>
              <p className="text-xs text-zinc-500">
                Personaliza la oferta, beneficios y llamados a la acción de tus productos para pauta en Facebook y TikTok Ads.
              </p>
            </div>

            {/* Select product dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-zinc-700">Producto:</label>
              <select
                value={selectedLandingItem?.id || ''}
                onChange={(e) => {
                  const found = currentStoreProducts.find((p) => p.id === e.target.value);
                  if (found) handleSelectProductForBuilder(found);
                }}
                className="text-xs p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-semibold text-zinc-800 focus:bg-white focus:outline-hidden"
              >
                {currentStoreProducts.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.titulo_personalizado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedLandingItem && currentStoreProducts.length > 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-500">
                Selecciona uno de tus productos de vitrina arriba para comenzar a editar su landing page.
              </p>
            </div>
          ) : !selectedLandingItem ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-500">
                No tienes productos en tu vitrina. Agrega uno desde el Catálogo Mayorista para crear su landing page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-900">Configuración de Copys</h3>
                  <button
                    onClick={handleGenerateAiCopy}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{aiGenerating ? 'Generando...' : 'Optimizar con IA'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Titular Gancho (Headline principal)
                  </label>
                  <textarea
                    rows={2}
                    value={builderHeadline}
                    onChange={(e) => setBuilderHeadline(e.target.value)}
                    className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Subtítulo Descriptivo
                  </label>
                  <textarea
                    rows={2}
                    value={builderSubheadline}
                    onChange={(e) => setBuilderSubheadline(e.target.value)}
                    className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Etiqueta de Oferta
                    </label>
                    <input
                      type="text"
                      value={builderOfferTag}
                      onChange={(e) => setBuilderOfferTag(e.target.value)}
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Precio de Referencia (Tachado)
                    </label>
                    <input
                      type="number"
                      value={builderPriceAntes}
                      onChange={(e) => setBuilderPriceAntes(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Key benefits list */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Beneficios Clave del Producto
                  </label>
                  <div className="space-y-1.5 mb-2">
                    {builderBenefits.map((ben, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 bg-zinc-50 rounded-xl border border-zinc-200 text-xs"
                      >
                        <span className="truncate">{ben}</span>
                        <button
                          onClick={() => handleRemoveBenefit(idx)}
                          className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefitInput}
                      onChange={(e) => setNewBenefitInput(e.target.value)}
                      placeholder="Nuevo beneficio clave..."
                      className="flex-1 text-xs p-2 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-3 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Texto de Botón de Compra (CTA)
                  </label>
                  <input
                    type="text"
                    value={builderCtaText}
                    onChange={(e) => setBuilderCtaText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    onClick={handleSaveLanding}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {landingSavedFeedback ? '¡Cambios Guardados!' : 'Guardar Landing Page'}
                  </button>

                  <button
                    onClick={() => {
                      if (sellerStore && selectedLandingItem) {
                        const prod = products.find((p) => p.id === selectedLandingItem.producto_id);
                        if (prod) {
                          setPreviewLandingItem({
                            storeProduct: selectedLandingItem,
                            product: prod,
                          });
                        }
                      }
                    }}
                    className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Probar Vista</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="border border-zinc-200 rounded-3xl p-5 bg-zinc-50 space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                  Vista Previa en Tiempo Real
                </span>

                <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-3">
                  <div className="bg-rose-600 text-white text-[10px] font-bold py-1 px-3 rounded-lg text-center">
                    {builderOfferTag || 'OFERTA POR TIEMPO LIMITADO'}
                  </div>

                  <h4 className="font-extrabold text-sm text-zinc-900 leading-snug">
                    {builderHeadline || 'Titular de tu producto'}
                  </h4>

                  <p className="text-xs text-zinc-500">
                    {builderSubheadline || 'Descripción de enganche para tus clientes.'}
                  </p>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xl font-black text-emerald-700">
                      {formatMoney(selectedLandingItem.precio_venta, sellerStore?.pais || currentCountry)}
                    </span>
                    {builderPriceAntes > 0 && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatMoney(builderPriceAntes, sellerStore?.pais || currentCountry)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    {builderBenefits.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs">
                      {builderCtaText || 'PEDIR CON PAGO CONTRAENTREGA'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Store Configuration */}
      {activeTab === 'configuracion' && (
        <form onSubmit={handleSaveStore} className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
          <div>
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Identidad & Configuración de Tu Tienda
            </h2>
            <p className="text-xs text-zinc-500">
              Personaliza el nombre, WhatsApp de ventas y políticas de despacho de tu vitrina.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Nombre Comercial de la Tienda *
              </label>
              <input
                type="text"
                required
                value={nombreTienda}
                onChange={(e) => setNombreTienda(e.target.value)}
                placeholder="Ej: MegaStore Colombia"
                className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                País Principal de Venta *
              </label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value as CountryCode)}
                className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-semibold"
              >
                <option value="CO">Colombia (Pesos COP • Servientrega/Coordinadora)</option>
                <option value="VE">Venezuela (Dólar USD / Bolívares • MRW/Tealca/Zoom)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              Eslogan o Frase Promocional
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ej: Novedades tecnológicas y belleza con pago contraentrega en 24h"
              className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1">
              Descripción de la Tienda
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica a tus clientes quién eres y tu compromiso de despacho..."
              className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                WhatsApp Oficial de Ventas (Con código de país) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={whatsappContacto}
                  onChange={(e) => setWhatsappContacto(e.target.value)}
                  placeholder="+57 312 458 9201"
                  className="w-full pl-10 pr-3 py-3 text-xs bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Color de Identidad de Marca
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="w-11 h-11 rounded-xl cursor-pointer border border-zinc-300"
                />
                <span className="text-xs font-mono font-bold text-zinc-700">{colorPrimario}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Usuario de Instagram (Opcional)
              </label>
              <input
                type="text"
                value={instagramUsuario}
                onChange={(e) => setInstagramUsuario(e.target.value)}
                placeholder="@tutienda.oficial"
                className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Usuario de TikTok (Opcional)
              </label>
              <input
                type="text"
                value={tiktokUsuario}
                onChange={(e) => setTiktokUsuario(e.target.value)}
                placeholder="@tutienda_tiktok"
                className="w-full text-xs p-3 bg-zinc-50 border border-zinc-300 rounded-2xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{storeSavedFeedback ? '¡Tienda Actualizada con Éxito!' : 'Guardar Información de Tienda'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Public Storefront Preview Modal */}
      {previewStoreOpen && sellerStore && (
        <StorePublicModal
          store={sellerStore}
          onClose={() => setPreviewStoreOpen(false)}
          onOpenProductLanding={(sp, p) => setPreviewLandingItem({ storeProduct: sp, product: p })}
        />
      )}

      {/* Public Product Landing Page Preview Modal */}
      {previewLandingItem && sellerStore && (
        <ProductLandingModal
          storeProduct={previewLandingItem.storeProduct}
          product={previewLandingItem.product}
          store={sellerStore}
          onClose={() => setPreviewLandingItem(null)}
        />
      )}

      {/* Add Own Product Modal */}
      {addOwnProductModalOpen && (
        <AddOwnProductModal
          onClose={() => setAddOwnProductModalOpen(false)}
          onSuccess={(productId, storeProductId) => {
            setAddOwnProductModalOpen(false);
            const foundSp = currentStoreProducts.find((p) => p.id === storeProductId);
            if (foundSp) {
              handleSelectProductForBuilder(foundSp);
            }
          }}
        />
      )}
    </div>
  );
};
