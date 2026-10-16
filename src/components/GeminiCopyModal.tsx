import React, { useState } from 'react';
import { Product, GeminiCopyRequest, GeminiCopyResponse } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  Share2,
  Video,
  MessageCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';

interface Props {
  product: Product;
  onClose: () => void;
}

export const GeminiCopyModal: React.FC<Props> = ({ product, onClose }) => {
  const [formato, setFormato] = useState<GeminiCopyRequest['formato']>('descripcion_tienda');
  const [tono, setTono] = useState<GeminiCopyRequest['tono']>('persuasivo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiCopyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields for human refinement before copying
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const formatOptions = [
    {
      id: 'descripcion_tienda',
      label: 'Ficha de Tienda Online',
      description: 'Ideal para Shopify, WooCommerce o MercadoLibre',
      icon: FileText,
    },
    {
      id: 'anuncio_facebook',
      label: 'Anuncio Facebook / Instagram Ads',
      description: 'Estructura AIDA con gancho visual y llamado de compra',
      icon: Share2,
    },
    {
      id: 'guion_tiktok',
      label: 'Guion TikTok / Reels',
      description: 'Formato dinámico de 30 a 45 seg con indicaciones visuales',
      icon: Video,
    },
    {
      id: 'mensaje_whatsapp',
      label: 'Mensaje WhatsApp Contraentrega',
      description: 'Texto de cierre rápido para clientes con pago al recibir',
      icon: MessageCircle,
    },
    {
      id: 'preguntas_frecuentes',
      label: 'Preguntas Frecuentes (FAQs)',
      description: 'Respuestas precisas basadas exclusivamente en especificaciones',
      icon: HelpCircle,
    },
  ];

  const toneOptions = [
    { id: 'persuasivo', label: 'Persuasivo y vendedor' },
    { id: 'profesional_directo', label: 'Profesional y directo' },
    { id: 'urgencia_oferta', label: 'Urgencia (Oferta / Stock)' },
    { id: 'cercano_amigable', label: 'Cercano y colombiano' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: GeminiCopyRequest = {
        producto: {
          nombre: product.nombre,
          descripcion: product.descripcion,
          categoria: product.categoria,
          costo_proveedor: product.costo_proveedor,
          precio_venta_sugerido: product.precio_sugerido,
          variantes: product.variantes,
          garantia_meses: product.garantia_meses,
          tiempo_despacho_estimado: product.tiempo_despacho_estimado,
          condiciones_garantia: product.condiciones_garantia,
          especificaciones: product.especificaciones,
        },
        formato,
        tono,
      };

      const res = await fetch('/api/gemini/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      }

      const data: GeminiCopyResponse = await res.json();
      setResult(data);
      setEditedTitle(data.titulo_principal);
      setEditedContent(data.contenido);
    } catch (err: any) {
      console.error('Error generating copy with Gemini:', err);
      setError(
        err.message ||
          'No se pudo conectar con el asistente de IA en el servidor. Verifica que GEMINI_API_KEY esté configurada.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Asistente Comercial Gemini
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Sin Alucinaciones
                </span>
              </h3>
              <p className="text-xs text-zinc-300 truncate max-w-md">{product.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              1. Selecciona el formato del contenido
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {formatOptions.map((opt) => {
                const Icon = opt.icon;
                const selected = formato === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormato(opt.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                      <Icon className={`w-4 h-4 ${selected ? 'text-emerald-700' : 'text-zinc-500'}`} />
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-tight">{opt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mr-2">
              2. Tono comercial:
            </span>
            {toneOptions.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTono(t.id as any)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  tono === t.id
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generando con Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>
                    {result ? 'Volver a generar contenido con nuevos parámetros' : 'Generar contenido publicitario'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error al generar contenido</p>
                <p className="mt-0.5 text-zinc-600">{error}</p>
              </div>
            </div>
          )}

          {/* Results preview & Editor */}
          {result && (
            <div className="space-y-5 pt-2 border-t border-zinc-100">
              {/* Warnings / Missing Data Box */}
              {result.datos_faltantes_advertencia && result.datos_faltantes_advertencia.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Aviso de fidelidad (Información que no suministró el proveedor):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px] pl-1">
                    {result.datos_faltantes_advertencia.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[11px] text-amber-700 italic">
                    Gemini no inventó estos datos para proteger tu reputación ante el cliente final.
                  </p>
                </div>
              )}

              {/* Title Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700">Título Principal (Editable):</label>
                  <button
                    onClick={() => handleCopy(editedTitle, 'title')}
                    className="text-xs text-emerald-700 font-medium hover:text-emerald-800 flex items-center gap-1"
                  >
                    {copiedSection === 'title' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar título</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-sm font-semibold p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Alternative Titles */}
              {result.titulos_alternativos && result.titulos_alternativos.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Títulos alternativos para pruebas:
                  </span>
                  <div className="space-y-1">
                    {result.titulos_alternativos.map((alt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 bg-zinc-50 border border-zinc-150 rounded-lg"
                      >
                        <span className="text-zinc-700">{alt}</span>
                        <button
                          onClick={() => {
                            setEditedTitle(alt);
                            handleCopy(alt, `alt-${idx}`);
                          }}
                          className="text-zinc-400 hover:text-emerald-700 p-1"
                          title="Usar este título"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Content Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700">Cuerpo del Contenido (Editable):</label>
                  <button
                    onClick={() => handleCopy(editedContent, 'content')}
                    className="text-xs text-emerald-700 font-medium hover:text-emerald-800 flex items-center gap-1"
                  >
                    {copiedSection === 'content' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar contenido</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Real Highlights & CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1.5">
                    Beneficios verificados:
                  </span>
                  <ul className="text-xs space-y-1 text-zinc-600 list-disc list-inside">
                    {result.puntos_clave.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                      Llamado a la acción (CTA):
                    </span>
                    <button
                      onClick={() => handleCopy(result.llamado_a_la_accion, 'cta')}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold italic">"{result.llamado_a_la_accion}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center rounded-b-2xl">
          <span className="text-xs text-zinc-500">
            {result ? 'Puedes editar el texto antes de usarlo en tus canales.' : 'Configura y genera contenido.'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100"
            >
              Cerrar
            </button>
            {result && (
              <button
                onClick={() =>
                  handleCopy(`${editedTitle}\n\n${editedContent}\n\n${result.llamado_a_la_accion}`, 'all')
                }
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                {copiedSection === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Todo copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar todo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
