import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  app.post('/api/ai/ideas', async (req, res) => {
    try {
      const { channelName, platform, handle, topic, preferredFormat } = req.body;

      if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'El tema es obligatorio para generar ideas.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'No se encontró GEMINI_API_KEY configurada en el servidor.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Actúa como un estratega senior de contenido digital para creadores en español.
Genera exactamente 5 ideas de contenido originales, accionables y con alto potencial de retención para el siguiente canal:
- Canal: ${channelName || 'Creador Digital'} (${handle || '@creador'})
- Plataforma: ${platform || 'youtube'}
- Formato preferido: ${preferredFormat || 'adaptado a la plataforma'}
- Tema o nicho solicitado: "${topic}"

Cada idea debe incluir:
- titulo: Un título atractivo y claro (sin clickbait vacío) en español.
- descripcion: Resumen del enfoque o gancho en los primeros 3 segundos y estructura (1-2 frases).
- formato: Uno de estos valores exactos: "video largo", "short", "reel", "tiktok", "carrusel", "story", "post".
- prioridad: Uno de estos valores exactos: "alta", "media", "baja".
- etiquetas: Array con 2 o 3 etiquetas relevantes en minúsculas sin # (ej. ["productividad", "tutorial"]).
- notas: Breve nota de producción o llamado a la acción sugerido.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                titulo: { type: Type.STRING },
                descripcion: { type: Type.STRING },
                formato: { type: Type.STRING },
                prioridad: { type: Type.STRING },
                etiquetas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                notas: { type: Type.STRING },
              },
              required: ['titulo', 'descripcion', 'formato', 'prioridad', 'etiquetas', 'notas'],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(502).json({ error: 'Respuesta vacía del modelo de IA.' });
      }

      const ideas = JSON.parse(text.trim());
      return res.json({ ideas });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Error al generar ideas con Gemini API.';
      console.error('Error in /api/ai/ideas:', message);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ContentFlow server running on http://localhost:${PORT}`);
  });
}

startServer();
