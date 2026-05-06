import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { productService } from "@/features/products/services/productService";
import { BRAND } from "@/lib/brand";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const products = await productService.getProducts();

    let text = "";
    let lastError: any = null;
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1500;

    // Modelos gratuitos con cuota activa según tu consola de Google AI Studio
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-3-flash",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash-lite"
    ];

    const systemInstruction = `Eres Valeria, tu experta agente nutricional y especialista en jugos naturales para "${BRAND.name}".
Tu tarea es recomendar productos de nuestro catálogo basados en la necesidad del usuario, siempre con un tono profesional, amable y femenino.

Catálogo de productos (ID y Nombre):
${products.map(p => `- ${p.id}: ${p.name} (Beneficios: ${p.benefits?.join(', ') || 'Varios'})`).join('\n')}

REGLAS DE RECOMENDACIÓN:
1. Recomienda entre 1 y 4 productos máximo que estén en el catálogo.
2. ORDENA el arreglo "productIds" estrictamente desde la MEJOR OPCIÓN (la más recomendada para su caso) hasta la menos relevante.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "recommendation": "Tu explicación breve y motivadora. Empieza destacando por qué la primera opción es la ideal para su caso, y menciona brevemente cómo los demás complementan.",
  "productIds": ["id-de-la-mejor-opcion", "id-segunda-opcion", "..."]
}
No añadas texto adicional fuera del JSON.`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      let success = false;
      
      for (const modelName of fallbackModels) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction,
            generationConfig: {
              responseMimeType: "application/json",
            }
          });

          const result = await model.generateContent(prompt);
          text = result.response.text();
          
          console.log(`[AI Assistant] Éxito usando ${modelName} en el intento ${attempt}`);
          success = true;
          break; // Stop fallback loop if successful
        } catch (err: any) {
          console.warn(`[AI Assistant] Falló ${modelName} (Intento ${attempt}):`, err?.message || err);
          lastError = err;
        }
      }

      if (success) {
        break; // Stop retry loop if we successfully generated content
      }
      
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[AI Assistant] Reintentando todos los modelos en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!text) {
      throw lastError || new Error("El modelo falló después de múltiples intentos.");
    }
    
    // Función para limpiar el texto por si la IA responde con bloques de código markdown
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }

    try {
      const parsedData = JSON.parse(cleanText);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("[AI Assistant] Error parseando JSON:", cleanText);
      throw new Error("La IA no devolvió un formato válido.");
    }
  } catch (error: any) {
    console.error("Gemini Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to generate recommendation", details: error?.message || "Unknown error" }, 
      { status: 500 }
    );
  }
}
