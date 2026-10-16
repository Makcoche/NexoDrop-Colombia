import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RoleBadge } from './RoleBadge';
import { UserRole, CountryCode } from '../types';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import {
  Home,
  LayoutDashboard,
  Store,
  Bookmark,
  Package,
  Building2,
  Boxes,
  BarChart3,
  HelpCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  UserPlus,
  AlertCircle,
  Lock,
  ShoppingBag,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRegister: (country?: CountryCode) => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenRegister,
  onOpenLogin,
}) => {
  const {
    currentUser,
    fbUser,
    currentRole,
    selectDemoUser,
    currentCountry,
    setCurrentCountry,
    logout,
    orders,
    savedProducts,
    incidents,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Multi-user scoped counts
  const scopedOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.rol === 'admin' || currentUser.rol === 'soporte') return orders;
    if (currentUser.rol === 'vendedor') {
      return orders.filter(
        (o) => o.vendedor_id === currentUser.id || o.vendedor_id === 'seller-demo-01' || o.vendedor_id === 'seller-col-01'
      );
    }
    // proveedor
    return orders.filter(
      (o) => o.proveedor_id === currentUser.id || o.proveedor_id === 'prov-col-01' || o.proveedor_id === 'prov-ven-01'
    );
  }, [orders, currentUser]);

  const pendingOrdersCount = scopedOrders.filter(
    (o) => o.estado === 'pendiente_confirmacion' || o.estado === 'novedad' || o.estado === 'confirmado'
  ).length;

  const openIncidentsCount = incidents.filter((i) => i.estado === 'abierta').length;

  // STRICT REQUIREMENT: Only authenticated users see internal modules!
  const navItems = useMemo(() => {
    if (!currentUser) {
      // Unregistered / Guest: only the public Landing/Home page
      return [{ id: 'landing', label: 'Inicio', icon: Home }];
    }

    // Role-specific navigation for logged-in multi-users
    if (currentUser.rol === 'vendedor') {
      return [
        { id: 'landing', label: 'Portada', icon: Home },
        { id: 'dashboard', label: 'Mi Panel', icon: LayoutDashboard },
        { id: 'store', label: 'Mi Tienda', icon: ShoppingBag },
        { id: 'catalog', label: 'Catálogo', icon: Store },
        {
          id: 'orders',
          label: 'Mis Pedidos',
          icon: Package,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-rose-500',
        },
        {
          id: 'saved',
          label: 'Mis Guardados',
          icon: Bookmark,
          badge: savedProducts.length > 0 ? savedProducts.length : undefined,
        },
        { id: 'reports', label: 'Mis Ganancias', icon: BarChart3 },
        { id: 'help', label: 'Ayuda', icon: HelpCircle },
      ];
    }

    if (currentUser.rol === 'proveedor') {
      return [
        { id: 'landing', label: 'Portada', icon: Home },
        { id: 'dashboard', label: 'Panel Bodega', icon: LayoutDashboard },
        { id: 'inventory', label: 'Mi Inventario & Stock', icon: Boxes },
        {
          id: 'orders',
          label: 'Despachos & Guías',
          icon: Package,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-blue-600',
        },
        { id: 'suppliers', label: 'Mi Perfil Proveedor', icon: Building2 },
        { id: 'reports', label: 'Reporte Ventas', icon: BarChart3 },
        { id: 'help', label: 'Guía Logística', icon: HelpCircle },
      ];
    }

    // Admin & Soporte (Global oversight)
    return [
      { id: 'landing', label: 'Portada', icon: Home },
      { id: 'dashboard', label: 'Panel Global', icon: LayoutDashboard },
      { id: 'store', label: 'Tiendas & Vitrinas', icon: ShoppingBag },
      { id: 'catalog', label: 'Catálogo', icon: Store },
      {
        id: 'orders',
        label: 'Todos los Pedidos',
        icon: Package,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        badgeColor: 'bg-rose-500',
      },
      { id: 'suppliers', label: 'Proveedores', icon: Building2 },
      { id: 'inventory', label: 'Inventario Red', icon: Boxes },
      { id: 'saved', label: 'Guardados', icon: Bookmark },
      { id: 'reports', label: 'Reportes', icon: BarChart3 },
      { id: 'help', label: 'Ayuda', icon: HelpCircle },
    ];
  }, [currentUser, savedProducts.length, pendingOrdersCount]);

  const primaryNavItems = useMemo(() => {
    if (!currentUser || navItems.length <= 5) return navItems;
    return navItems.slice(0, 5);
  }, [currentUser, navItems]);

  const secondaryNavItems = useMemo(() => {
    if (!currentUser || navItems.length <= 5) return [];
    return navItems.slice(5);
  }, [currentUser, navItems]);

  const isSecondaryActive = useMemo(() => {
    return secondaryNavItems.some((item) => item.id === activeTab);
  }, [secondaryNavItems, activeTab]);

  const secondaryBadgeCount = useMemo(() => {
    return secondaryNavItems.reduce(
      (acc, item) => acc + (typeof item.badge === 'number' ? item.badge : 0),
      0
    );
  }, [secondaryNavItems]);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    selectDemoUser(role);
    setRoleMenuOpen(false);
  };

  const handleCountrySelect = (c: CountryCode) => {
    setCurrentCountry(c);
    setCountryMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
      {/* Top Banner with Country Switcher */}
      <div className="bg-zinc-950 text-zinc-300 px-4 py-1.5 text-xs flex flex-wrap justify-between items-center gap-2 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Active Country Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCountryMenuOpen(!countryMenuOpen)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-2.5 py-1 rounded-lg border border-zinc-700 transition-colors"
            >
              {currentCountry === 'CO' ? (
                <>
                  <ColombiaFlag className="w-4 h-3" />
                  <span className="font-bold">Colombia</span>
                </>
              ) : (
                <>
                  <VenezuelaFlag className="w-4 h-3" />
                  <span className="font-bold">Venezuela</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {countryMenuOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-zinc-800">
                <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Cambiar país de operación
                </div>
                <button
                  onClick={() => handleCountrySelect('CO')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                    currentCountry === 'CO' ? 'bg-emerald-50 text-emerald-950 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ColombiaFlag className="w-5 h-3.5" />
                    <div>
                      <p className="font-bold leading-tight">Colombia</p>
                      <p className="text-[10px] text-zinc-500">Moneda: COP ($) • Servientrega/Coord.</p>
                    </div>
                  </div>
                  {currentCountry === 'CO' && <span className="text-emerald-600 font-bold">✓</span>}
                </button>
                <button
                  onClick={() => handleCountrySelect('VE')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                    currentCountry === 'VE' ? 'bg-blue-50 text-blue-950 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <VenezuelaFlag className="w-5 h-3.5" />
                    <div>
                      <p className="font-bold leading-tight">Venezuela</p>
                      <p className="text-[10px] text-zinc-500">Moneda: USD / VES • MRW/Tealca/Zoom</p>
                    </div>
                  </div>
                  {currentCountry === 'VE' && <span className="text-blue-600 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          <span className="text-zinc-500 hidden sm:inline">|</span>
          <span className="text-zinc-400 hidden sm:inline text-[11px]">
            Moneda:{' '}
            <strong className="text-white">
              {currentCountry === 'CO' ? 'Pesos Colombianos (COP)' : 'Dólar Ref. / Bolívares (USD/VES)'}
            </strong>
          </span>

          {!currentUser && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Paneles internos restringidos a usuarios registrados</span>
            </span>
          )}

          {currentUser && openIncidentsCount > 0 && (
            <span className="bg-amber-900/60 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              {openIncidentsCount} novedades
            </span>
          )}
        </div>

        {/* Right side: Quick Register buttons and Demo Role */}
        <div className="flex items-center gap-2">
          {!currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenRegister('CO')}
                className="hidden sm:inline-flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <ColombiaFlag className="w-3.5 h-2.5" />
                <span>Registro Colombia</span>
              </button>

              <button
                onClick={() => onOpenRegister('VE')}
                className="hidden sm:inline-flex items-center gap-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700/60 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <VenezuelaFlag className="w-3.5 h-2.5" />
                <span>Registro Venezuela</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-2.5 py-1 rounded-lg border border-zinc-700 flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>Ingresar / Cuentas Demo</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-[11px] hidden sm:inline">Sesión:</span>
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-2.5 py-1 rounded-lg border border-zinc-700 transition-colors"
                >
                  <RoleBadge role={currentUser.rol} size="sm" />
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-zinc-800">
                    <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Cambiar usuario / rol de prueba
                    </div>
                    <button
                      onClick={() => handleRoleSelect('vendedor')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                        currentUser.rol === 'vendedor' ? 'bg-emerald-50 text-emerald-900 font-semibold' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Vendedor (Comercializadora)</span>
                        <span className="text-[10px] text-zinc-500">Crea pedidos, calcula margen y publica</span>
                      </div>
                      {currentUser.rol === 'vendedor' && <span className="text-emerald-600">✓</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSelect('proveedor')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                        currentUser.rol === 'proveedor' ? 'bg-blue-50 text-blue-900 font-semibold' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Proveedor (Mayorista)</span>
                        <span className="text-[10px] text-zinc-500">Actualiza stock y despacha guías</span>
                      </div>
                      {currentUser.rol === 'proveedor' && <span className="text-blue-600">✓</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                        currentUser.rol === 'admin' ? 'bg-purple-50 text-purple-900 font-semibold' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Administrador (NexoDrop HQ)</span>
                        <span className="text-[10px] text-zinc-500">Gestión global de red y catálogo</span>
                      </div>
                      {currentUser.rol === 'admin' && <span className="text-purple-600">✓</span>}
                    </button>
                    <div className="border-t border-zinc-200 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-rose-50 text-rose-700 font-semibold transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>Cerrar Sesión / Vista Pública</span>
                        <span className="text-[10px] text-zinc-500">Ver portal como usuario no registrado</span>
                      </div>
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[4.5rem] py-2.5 sm:py-3 gap-3 md:gap-5 lg:gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => handleNavClick('landing')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-black text-xl tracking-wider">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-zinc-900 tracking-tight leading-none">NexoDrop</span>
                <span className="bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  {currentCountry === 'CO' ? (
                    <>
                      <ColombiaFlag className="w-3.5 h-2.5 inline" /> CO
                    </>
                  ) : (
                    <>
                      <VenezuelaFlag className="w-3.5 h-2.5 inline" /> VE
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-none mt-1 hidden xl:block">Red dropshipping Colombia & Venezuela</p>
            </div>
          </div>

          {/* Desktop Navigation: Only shows internal modules if currentUser is logged in */}
          {currentUser ? (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-1.5 xl:gap-2 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${
                          item.badgeColor || 'bg-emerald-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Dropdown for Secondary / Additional Modules to prevent clutter */}
              {secondaryNavItems.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                      isSecondaryActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                    }`}
                  >
                    <span>Más</span>
                    {secondaryBadgeCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white bg-rose-500">
                        {secondaryBadgeCount}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Más herramientas
                      </div>
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              handleNavClick(item.id);
                              setMoreMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between font-medium transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-900 font-bold'
                                : 'text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-zinc-400'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span
                                className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${
                                  item.badgeColor || 'bg-emerald-600'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => handleNavClick('landing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'landing'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Inicio</span>
              </button>
              <div className="h-4 w-px bg-zinc-200" />
              <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-500 font-medium bg-zinc-50 border border-zinc-200/80 px-3.5 py-1.5 rounded-full">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Catálogo y módulos de gestión exclusivos para registrados</span>
              </div>
            </nav>
          )}

          {/* User Auth Info & Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-zinc-50/90 hover:bg-zinc-100/90 border border-zinc-200/80 rounded-2xl py-1.5 px-3 transition-colors shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-900 leading-tight">
                    {currentUser.nombre}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[130px]">
                    {currentUser.nombre_negocio || currentUser.rol}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="ml-1 p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={() => onOpenRegister(currentCountry)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse Gratis</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!currentUser ? (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Ingresar
              </button>
            ) : (
              <button
                onClick={logout}
                className="p-1.5 text-zinc-500 hover:text-rose-600 rounded-lg"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {/* User profile banner if logged in */}
          {currentUser ? (
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">{currentUser.nombre}</p>
                <p className="text-[11px] text-zinc-500">{currentUser.nombre_negocio}</p>
              </div>
              <RoleBadge role={currentUser.rol} size="sm" />
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Inicia sesión o regístrate para ver catálogo, pedidos e inventario.</span>
            </div>
          )}

          {/* Country Selection for Mobile */}
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700">País de operación:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCountrySelect('CO')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentCountry === 'CO' ? 'bg-emerald-600 text-white' : 'bg-white border text-zinc-700'
                }`}
              >
                <ColombiaFlag className="w-4 h-3" />
                <span>Colombia</span>
              </button>
              <button
                onClick={() => handleCountrySelect('VE')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentCountry === 'VE' ? 'bg-blue-600 text-white' : 'bg-white border text-zinc-700'
                }`}
              >
                <VenezuelaFlag className="w-4 h-3" />
                <span>Venezuela</span>
              </button>
            </div>
          </div>

          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => {
                  onOpenRegister('CO');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs rounded-xl"
              >
                <ColombiaFlag className="w-4 h-3" />
                <span>Registro Colombia</span>
              </button>
              <button
                onClick={() => {
                  onOpenRegister('VE');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 border border-blue-200 text-blue-950 font-bold text-xs rounded-xl"
              >
                <VenezuelaFlag className="w-4 h-3" />
                <span>Registro Venezuela</span>
              </button>
            </div>
          )}

          {currentUser && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full text-white ${
                      item.badgeColor || 'bg-emerald-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
