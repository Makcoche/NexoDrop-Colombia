import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingHome } from './components/LandingHome';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { SavedProductsView } from './components/SavedProductsView';
import { OrdersView } from './components/OrdersView';
import { SuppliersView } from './components/SuppliersView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { HelpView } from './components/HelpView';
import { SellerStoreView } from './components/SellerStoreView';
import { AuthGate } from './components/AuthGate';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { NewOrderModal } from './components/NewOrderModal';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { ColombiaFlag, VenezuelaFlag } from './components/CountryFlags';
import { Product, Order, CountryCode } from './types';
import { ShieldCheck, Info } from 'lucide-react';

function MainApp() {
  const { currentUser, products, orders, currentCountry, setCurrentCountry } = useApp();

  // If not logged in, default to landing page
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Enforce landing page tab whenever user is not authenticated
  useEffect(() => {
    if (!currentUser && activeTab !== 'landing') {
      setActiveTab('landing');
    }
  }, [currentUser, activeTab]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [orderInitialProduct, setOrderInitialProduct] = useState<Product | null>(null);
  const [orderInitialVariant, setOrderInitialVariant] = useState<string | undefined>(undefined);
  const [orderInitialPrice, setOrderInitialPrice] = useState<number | undefined>(undefined);

  // Auth modals state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerCountry, setRegisterCountry] = useState<CountryCode>('CO');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleOpenProductDetail = (prodOrId: Product | string) => {
    if (typeof prodOrId === 'string') {
      const found = products.find((p) => p.id === prodOrId);
      if (found) setSelectedProduct(found);
    } else {
      setSelectedProduct(prodOrId);
    }
  };

  const handleOpenOrderModal = (product?: Product, variant?: string, price?: number) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    setOrderInitialProduct(product || null);
    setOrderInitialVariant(variant);
    setOrderInitialPrice(price);
    setNewOrderModalOpen(true);
  };

  const handleOrderCreated = (orderId: string) => {
    setActiveTab('orders');
    const created = orders.find((o) => o.id === orderId);
    if (created) {
      setSelectedOrder(created);
    }
  };

  const handleOpenRegister = (country?: CountryCode) => {
    setRegisterCountry(country || currentCountry);
    setRegisterModalOpen(true);
  };

  const handleEnterCountryPlatform = (country: CountryCode) => {
    setCurrentCountry(country);
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      // If not logged in, open registration or login
      setRegisterCountry(country);
      setRegisterModalOpen(true);
    }
  };

  const moduleNamesMap: Record<string, string> = {
    dashboard: 'Panel de Control',
    store: 'Mi Tienda & Vitrinas',
    catalog: 'Catálogo Mayorista',
    saved: 'Productos Guardados',
    orders: 'Gestión de Pedidos',
    suppliers: 'Directorio de Proveedores',
    inventory: 'Control de Inventario',
    reports: 'Reportes y Finanzas',
    help: 'Centro de Ayuda',
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegister={handleOpenRegister}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If user is not logged in and tries to access internal module -> AuthGate */}
        {!currentUser && activeTab !== 'landing' ? (
          <AuthGate
            moduleName={moduleNamesMap[activeTab] || 'este módulo'}
            onOpenRegister={handleOpenRegister}
            onOpenLogin={() => setLoginModalOpen(true)}
            onGoHome={() => setActiveTab('landing')}
          />
        ) : (
          <>
            {activeTab === 'landing' && (
              <LandingHome
                onRegisterCountry={(country) => {
                  setRegisterCountry(country);
                  setRegisterModalOpen(true);
                }}
                onEnterCountryPlatform={handleEnterCountryPlatform}
                onOpenLogin={() => setLoginModalOpen(true)}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenProductDetail={handleOpenProductDetail}
                onOpenNewOrder={() => handleOpenOrderModal()}
              />
            )}

            {activeTab === 'store' && (
              <SellerStoreView
                onNavigateToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogView
                onSelectProduct={(p) => setSelectedProduct(p)}
                onOpenOrderModal={(p) => handleOpenOrderModal(p)}
                onNavigateToStore={() => setActiveTab('store')}
              />
            )}

            {activeTab === 'saved' && (
              <SavedProductsView
                onSelectProduct={(p) => setSelectedProduct(p)}
                onOpenOrderModal={(p, v, price) => handleOpenOrderModal(p, v, price)}
                onNavigateToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersView
                onOpenNewOrder={() => handleOpenOrderModal()}
                onSelectOrder={(ord) => setSelectedOrder(ord)}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView onOpenProductDetail={(p) => setSelectedProduct(p)} />
            )}

            {activeTab === 'inventory' && <InventoryView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'help' && <HelpView />}
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenOrderModal={(p, v, pr) => handleOpenOrderModal(p, v, pr)}
          onNavigateToStore={() => setActiveTab('store')}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* New Order Modal */}
      {newOrderModalOpen && (
        <NewOrderModal
          initialProduct={orderInitialProduct}
          initialVariant={orderInitialVariant}
          initialPrice={orderInitialPrice}
          onClose={() => setNewOrderModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {/* Register Modal for Venezuela or Colombia */}
      {registerModalOpen && (
        <RegisterModal
          initialCountry={registerCountry}
          onClose={() => setRegisterModalOpen(false)}
          onSuccess={() => {
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* Login / Multi-User Demo Modal */}
      {loginModalOpen && (
        <LoginModal
          onClose={() => setLoginModalOpen(false)}
          onOpenRegister={(country) => {
            setLoginModalOpen(false);
            setRegisterCountry(country || currentCountry);
            setRegisterModalOpen(true);
          }}
          onLoginSuccess={() => {
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-6 px-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800">NexoDrop Andina</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ColombiaFlag className="w-3.5 h-2.5 inline" /> Colombia
              <span>&</span>
              <VenezuelaFlag className="w-3.5 h-2.5 inline" /> Venezuela
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Acceso protegido para vendedores y proveedores registrados
            </span>
            <span>•</span>
            <span>COP ($) / USD Ref.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
