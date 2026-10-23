export type Platform = 'youtube' | 'tiktok' | 'instagram';

export type ContentFormat =
  | 'video largo'
  | 'short'
  | 'reel'
  | 'tiktok'
  | 'carrusel'
  | 'story'
  | 'post';

export type Stage = 'idea' | 'proceso' | 'publicado';

export type SubStage = 'guion' | 'grabación' | 'edición' | 'programado';

export type Priority = 'baja' | 'media' | 'alta';

export interface ChecklistItem {
  id: string;
  texto: string;
  hecho: boolean;
}

export interface Channel {
  id: string;
  nombre: string;
  plataforma: Platform;
  handle: string;
  color: string;
  creadoEn: string;
}

export interface ContentItem {
  id: string;
  channelId: string;
  titulo: string;
  descripcion: string;
  formato: ContentFormat;
  etapa: Stage;
  subEtapa?: SubStage;
  prioridad: Priority;
  fechaPlanificada: string; // YYYY-MM-DD
  fechaPublicacion?: string; // YYYY-MM-DD
  url?: string;
  etiquetas: string[];
  checklist: ChecklistItem[];
  notas: string;
  orden: number;
  creadoEn: string;
}

export interface FormatTemplate {
  formato: ContentFormat;
  tareas: string[];
}

export interface ContentFilters {
  channelId: string | 'all';
  plataforma: Platform | 'all';
  formato: ContentFormat | 'all';
  prioridad: Priority | 'all';
  etiqueta: string | 'all';
  busqueda: string;
}

export type ActiveView = 'dashboard' | 'kanban' | 'calendario' | 'lista' | 'canales' | 'plantillas';

export type ThemePreference = 'light' | 'dark' | 'auto';

export interface BackupPayload {
  version: string;
  exportadoEn: string;
  channels: Channel[];
  items: ContentItem[];
  templates: FormatTemplate[];
}
