import { ContentFormat, Platform, Priority } from '../types';

export interface GeneratedIdeaDTO {
  titulo: string;
  descripcion: string;
  formato: ContentFormat;
  prioridad: Priority;
  etiquetas: string[];
  notas: string;
}

export interface GenerateIdeasParams {
  channelName: string;
  platform: Platform;
  handle: string;
  topic: string;
  preferredFormat?: ContentFormat;
}

const VALID_FORMATS: ContentFormat[] = [
  'video largo',
  'short',
  'reel',
  'tiktok',
  'carrusel',
  'story',
  'post',
];

const VALID_PRIORITIES: Priority[] = ['alta', 'media', 'baja'];

export async function generateIdeasWithAI(
  params: GenerateIdeasParams
): Promise<GeneratedIdeaDTO[]> {
  const response = await fetch('/api/ai/ideas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudieron generar las ideas con IA.');
  }

  if (!Array.isArray(data.ideas)) {
    throw new Error('Formato de respuesta inesperado del servidor de IA.');
  }

  const defaultFormatByPlatform: Record<Platform, ContentFormat> = {
    youtube: 'video largo',
    tiktok: 'tiktok',
    instagram: 'reel',
  };

  return data.ideas.slice(0, 5).map((raw: Record<string, unknown>) => {
    const rawFormat = String(raw.formato || '').toLowerCase() as ContentFormat;
    const formato: ContentFormat = VALID_FORMATS.includes(rawFormat)
      ? rawFormat
      : params.preferredFormat || defaultFormatByPlatform[params.platform];

    const rawPrio = String(raw.prioridad || '').toLowerCase() as Priority;
    const prioridad: Priority = VALID_PRIORITIES.includes(rawPrio) ? rawPrio : 'media';

    const etiquetas = Array.isArray(raw.etiquetas)
      ? raw.etiquetas.map((t) => String(t).toLowerCase().replace(/^#/, '').trim()).filter(Boolean)
      : [params.topic.split(' ')[0]?.toLowerCase() || 'contenido'];

    return {
      titulo: String(raw.titulo || `Idea sobre ${params.topic}`),
      descripcion: String(raw.descripcion || ''),
      formato,
      prioridad,
      etiquetas,
      notas: String(raw.notas || ''),
    };
  });
}
