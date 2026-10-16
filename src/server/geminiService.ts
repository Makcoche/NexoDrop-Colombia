import { GoogleGenAI, Type } from '@google/genai';
import { GeminiCopyRequest, GeminiCopyResponse } from '../types/index.ts';

export async function generateProductCopy(reqData: GeminiCopyRequest): Promise<GeminiCopyResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `
Genera contenido comercial para el siguiente producto de dropshipping para el mercado de Colombia:

DATOS VERIFICADOS DEL PRODUCTO:
- Nombre: ${reqData.producto.nombre}
- Categoría: ${reqData.producto.categoria}
- Descripción del proveedor: ${reqData.producto.descripcion}
- Costo proveedor: $${reqData.producto.costo_proveedor.toLocaleString('es-CO')} COP
- Precio sugerido de venta: ${reqData.producto.precio_venta_sugerido ? '$' + reqData.producto.precio_venta_sugerido.toLocaleString('es-CO') + ' COP' : 'No definido'}
- Variantes disponibles: ${reqData.producto.variantes?.join(', ') || 'Única'}
- Tiempo estimado de despacho informado: ${reqData.producto.tiempo_despacho_estimado || 'No especificado'}
- Garantía informada: ${reqData.producto.garantia_meses ? reqData.producto.garantia_meses + ' meses' : 'No especificada'}
- Condiciones de garantía: ${reqData.producto.condiciones_garantia || 'Por defectos de fábrica'}
- Especificaciones adicionales: ${JSON.stringify(reqData.producto.especificaciones || {})}

FORMATO SOLICITADO: ${reqData.formato} (opciones: descripcion_tienda, anuncio_facebook, guion_tiktok, mensaje_whatsapp, preguntas_frecuentes)
TONO SOLICITADO: ${reqData.tono} (opciones: persuasivo, profesional_directo, urgencia_oferta, cercano_amigable)

REGLAS ESTRICTAS DE COMPLIANCE:
1. Usa ÚNICAMENTE los datos reales provistos arriba.
2. NO inventes materiales inexistentes, resultados milagrosos de salud o pérdida de peso, certificaciones ISO falsas ni tiempos de envío inventados.
3. Si un dato relevante para el cliente falta (por ejemplo: dimensiones exactas, material no especificado o costo de envío), lístalo en "datos_faltantes_advertencia" para que el vendedor lo complete antes de publicar.
4. Redacta en español adaptado al comercio electrónico en Colombia (tonalidad clara, llamado a la acción comercial efectivo como pago contraentrega si aplica).
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction:
        'Eres el asistente de redacción comercial de NexoDrop Colombia. Tu misión es redactar títulos atractivos, descripciones de alta conversión y guiones publicitarios sin inventar datos que el proveedor no haya suministrado. Si faltan datos clave, avísalo explícitamente.',
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo_principal: {
            type: Type.STRING,
            description: 'Título comercial principal optimizado para el formato seleccionado',
          },
          titulos_alternativos: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 a 3 títulos alternativos para pruebas A/B',
          },
          contenido: {
            type: Type.STRING,
            description: 'Texto completo formateado listo para publicar o usar en anuncios/tienda',
          },
          puntos_clave: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 a 5 viñetas con beneficios reales basados únicamente en los datos suministrados',
          },
          llamado_a_la_accion: {
            type: Type.STRING,
            description: 'Llamado a la acción (CTA) contundente para el cliente final',
          },
          datos_faltantes_advertencia: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Datos que no estaban en la ficha y que el vendedor debería verificar',
          },
        },
        required: ['titulo_principal', 'titulos_alternativos', 'contenido', 'puntos_clave', 'llamado_a_la_accion'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No se recibió texto de respuesta de Gemini API.');
  }

  return JSON.parse(text) as GeminiCopyResponse;
}
