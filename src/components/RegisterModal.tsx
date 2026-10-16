import React, { useState } from 'react';
import { CountryCode, UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { ColombiaFlag, VenezuelaFlag } from './CountryFlags';
import { COLOMBIAN_DEPARTMENTS, VENEZUELAN_STATES } from '../data/initialData';
import {
  X,
  UserPlus,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Truck,
} from 'lucide-react';

interface Props {
  initialCountry?: CountryCode;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterModal: React.FC<Props> = ({
  initialCountry = 'CO',
  onClose,
  onSuccess,
}) => {
  const { registerNewUser } = useApp();

  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [role, setRole] = useState<UserRole>('vendedor');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documento, setDocumento] = useState('');
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [region, setRegion] = useState(
    country === 'CO' ? 'Bogotá D.C.' : 'Distrito Capital (Caracas)'
  );
  const [ciudad, setCiudad] = useState(country === 'CO' ? 'Bogotá' : 'Caracas');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Switch country handler
  const handleCountrySwitch = (c: CountryCode) => {
    setCountry(c);
    if (c === 'CO') {
      setRegion('Bogotá D.C.');
      setCiudad('Bogotá');
      if (telefono.startsWith('+58')) setTelefono('+57 ');
    } else {
      setRegion('Distrito Capital (Caracas)');
      setCiudad('Caracas');
      if (telefono.startsWith('+57')) setTelefono('+58 ');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim() || !telefono.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Debes aceptar los términos del servicio y políticas de dropshipping.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await registerNewUser({
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim(),
        rol: role,
        pais: country,
        documento_identidad: documento.trim(),
        nombre_negocio: nombreNegocio.trim() || `Tienda de ${nombre.split(' ')[0]}`,
        ciudad: `${ciudad.trim()}, ${region}`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al completar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900">
                Registro de Cuenta {country === 'CO' ? 'en Colombia' : 'en Venezuela'}
              </h3>
              <p className="text-xs text-zinc-500">
                Accede a la red de dropshipping, catálogo con fletes y pagos locales
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Country Selection Cards */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
              1. Selecciona tu país de operación:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Colombia Option */}
              <button
                type="button"
                onClick={() => handleCountrySwitch('CO')}
                className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                  country === 'CO'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <ColombiaFlag className="w-9 h-6 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 block text-xs">Colombia</span>
                  <span className="text-[10px] text-zinc-500">Moneda: COP • Servientrega/Coord.</span>
                </div>
              </button>

              {/* Venezuela Option */}
              <button
                type="button"
                onClick={() => handleCountrySwitch('VE')}
                className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                  country === 'VE'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <VenezuelaFlag className="w-9 h-6 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 block text-xs">Venezuela</span>
                  <span className="text-[10px] text-zinc-500">Moneda: USD/VES • MRW/Tealca/Zoom</span>
                </div>
              </button>
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
              2. ¿Cómo vas a participar en la plataforma?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('vendedor')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                  role === 'vendedor'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold block text-xs">Soy Vendedor / Dropshipper</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Vendo en redes y tiendas</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('proveedor')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                  role === 'proveedor'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold block text-xs">Soy Proveedor / Mayorista</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Tengo bodega y stock físico</span>
                </div>
              </button>
            </div>
          </div>

          {/* Personal and Business Details */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <h4 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px]">
              3. Datos del Titular y Negocio
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Carlos Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Nombre de tu Tienda o Empresa</label>
                <input
                  type="text"
                  placeholder={country === 'CO' ? 'Ej. Tienda Bogotá Express' : 'Ej. Caracas Dropship Store'}
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="tuemail@comercio.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  WhatsApp / Celular ({country === 'CO' ? '+57' : '+58'}) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder={country === 'CO' ? '+57 310 123 4567' : '+58 412 123 4567'}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  {country === 'CO' ? 'Cédula de Ciudadanía / NIT' : 'Cédula de Identidad (V-) / RIF'}
                </label>
                <input
                  type="text"
                  placeholder={country === 'CO' ? 'Ej. 1.020.304.506' : 'Ej. V-18.456.789 / J-12345678-0'}
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  {country === 'CO' ? 'Departamento' : 'Estado'}
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  {(country === 'CO' ? COLOMBIAN_DEPARTMENTS : VENEZUELAN_STATES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Ciudad o Municipio Principal</label>
              <input
                type="text"
                placeholder={country === 'CO' ? 'Ej. Medellín, Cali, Barranquilla' : 'Ej. Caracas, Valencia, Maracaibo, Lechería'}
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="terms" className="text-[11px] text-zinc-600 leading-tight">
              Acepto los términos y condiciones de dropshipping para {country === 'CO' ? 'Colombia' : 'Venezuela'}, el
              tratamiento de datos comerciales y la política de liquidación orientativa de pedidos.
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer ${
                country === 'CO'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Creando cuenta...' : `Completar Registro en ${country === 'CO' ? 'Colombia' : 'Venezuela'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
