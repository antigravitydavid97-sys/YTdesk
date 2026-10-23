import { create } from 'zustand';
import {
  ActiveView,
  Channel,
  ChecklistItem,
  ContentFilters,
  ContentFormat,
  ContentItem,
  FormatTemplate,
  Platform,
  Priority,
  Stage,
  SubStage,
  ThemePreference,
} from '../types';
import { storageService } from '../services/storageService';
import { getTodayISO } from '../utils/dateUtils';
import { PLATFORMS } from '../utils/constants';

interface ContentStoreState {
  channels: Channel[];
  items: ContentItem[];
  templates: FormatTemplate[];
  activeView: ActiveView;
  filters: ContentFilters;
  themePreference: ThemePreference;

  // Tema, sesión de usuario, navegación y filtros
  syncUserSession: (userId: string | null) => void;
  setThemePreference: (theme: ThemePreference) => void;
  setActiveView: (view: ActiveView) => void;
  setFilter: <K extends keyof ContentFilters>(key: K, value: ContentFilters[K]) => void;
  resetFilters: () => void;

  // Gestión de Canales
  addChannel: (data: Omit<Channel, 'id' | 'creadoEn'>) => Channel;
  updateChannel: (id: string, data: Partial<Omit<Channel, 'id' | 'creadoEn'>>) => void;
  deleteChannel: (id: string) => void;

  // Gestión de Contenido
  addContentItem: (
    data: Omit<ContentItem, 'id' | 'creadoEn' | 'orden' | 'checklist'> & {
      checklist?: ChecklistItem[];
      useTemplateChecklist?: boolean;
    }
  ) => ContentItem;
  quickCaptureIdea: (titulo: string, channelId: string, formato?: ContentFormat) => ContentItem;
  updateContentItem: (id: string, data: Partial<Omit<ContentItem, 'id' | 'creadoEn'>>) => void;
  deleteContentItem: (id: string) => void;
  moveItemStage: (
    id: string,
    targetStage: Stage,
    extra?: { fechaPublicacion?: string; url?: string; subEtapa?: SubStage }
  ) => void;
  reorderStageItems: (stage: Stage, orderedIds: string[]) => void;
  moveItemDate: (id: string, newIsoDate: string) => void;
  adaptItemToChannel: (
    sourceItemId: string,
    targetChannelId: string,
    targetFormat: ContentFormat
  ) => ContentItem | null;

  // Checklists & Plantillas
  toggleChecklistItem: (itemId: string, checkId: string) => void;
  addChecklistItemToCard: (itemId: string, texto: string) => void;
  removeChecklistItemFromCard: (itemId: string, checkId: string) => void;
  applyTemplateToCard: (itemId: string, formato: ContentFormat) => void;
  updateFormatTemplate: (formato: ContentFormat, tareas: string[]) => void;

  // Datos de ejemplo y Copias de Seguridad
  clearAllData: () => void;
  restoreSampleData: () => void;
  importBackupData: (rawJson: string) => void;
  exportBackupData: () => string;
}

const DEFAULT_FILTERS: ContentFilters = {
  channelId: 'all',
  plataforma: 'all',
  formato: 'all',
  prioridad: 'all',
  etiqueta: 'all',
  busqueda: '',
};

const initialData = storageService.loadInitialState();

function buildChecklistFromTemplate(
  formato: ContentFormat,
  templates: FormatTemplate[]
): ChecklistItem[] {
  const found = templates.find((t) => t.formato === formato);
  if (!found) return [];
  return found.tareas.map((texto, idx) => ({
    id: `chk-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    texto,
    hecho: false,
  }));
}

export const useContentStore = create<ContentStoreState>((set, get) => ({
  channels: initialData.channels,
  items: initialData.items,
  templates: initialData.templates,
  activeView: 'kanban',
  filters: DEFAULT_FILTERS,
  themePreference: initialData.theme,

  syncUserSession: (userId) => {
    if (storageService.getActiveUserId() === userId) return;
    storageService.setActiveUserId(userId);
    const loaded = storageService.loadInitialState();
    set({
      channels: loaded.channels,
      items: loaded.items,
      templates: loaded.templates,
      filters: DEFAULT_FILTERS,
    });
  },

  setThemePreference: (theme) => {
    storageService.saveThemePreference(theme);
    set({ themePreference: theme });
  },

  setActiveView: (view) => set({ activeView: view }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  addChannel: (data) => {
    const newChannel: Channel = {
      ...data,
      id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      creadoEn: getTodayISO(),
    };
    const nextChannels = [...get().channels, newChannel];
    storageService.saveChannels(nextChannels);
    set({ channels: nextChannels });
    return newChannel;
  },

  updateChannel: (id, data) => {
    const nextChannels = get().channels.map((ch) =>
      ch.id === id ? { ...ch, ...data } : ch
    );
    storageService.saveChannels(nextChannels);
    set({ channels: nextChannels });
  },

  deleteChannel: (id) => {
    const nextChannels = get().channels.filter((ch) => ch.id !== id);
    const nextItems = get().items.filter((item) => item.channelId !== id);
    storageService.saveChannels(nextChannels);
    storageService.saveItems(nextItems);
    set((state) => ({
      channels: nextChannels,
      items: nextItems,
      filters:
        state.filters.channelId === id
          ? { ...state.filters, channelId: 'all' }
          : state.filters,
    }));
  },

  addContentItem: (data) => {
    const state = get();
    const stageItems = state.items.filter((i) => i.etapa === data.etapa);
    const maxOrder =
      stageItems.length > 0 ? Math.max(...stageItems.map((i) => i.orden)) + 1 : 0;

    const checklist =
      data.checklist !== undefined
        ? data.checklist
        : data.useTemplateChecklist !== false
          ? buildChecklistFromTemplate(data.formato, state.templates)
          : [];

    const newItem: ContentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channelId: data.channelId,
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      formato: data.formato,
      etapa: data.etapa,
      subEtapa: data.etapa === 'proceso' ? data.subEtapa || 'guion' : undefined,
      prioridad: data.prioridad,
      fechaPlanificada: data.fechaPlanificada,
      fechaPublicacion: data.fechaPublicacion,
      url: data.url,
      etiquetas: data.etiquetas,
      checklist,
      notas: data.notas,
      orden: maxOrder,
      creadoEn: getTodayISO(),
    };

    const nextItems = [newItem, ...state.items];
    storageService.saveItems(nextItems);
    set({ items: nextItems });
    return newItem;
  },

  quickCaptureIdea: (titulo, channelId, formato) => {
    const state = get();
    const channel = state.channels.find((c) => c.id === channelId);
    const platformObj = PLATFORMS.find((p) => p.id === channel?.plataforma);
    const chosenFormat: ContentFormat =
      formato || platformObj?.defaultFormat || 'video largo';

    return state.addContentItem({
      channelId,
      titulo,
      descripcion: '',
      formato: chosenFormat,
      etapa: 'idea',
      prioridad: 'media',
      fechaPlanificada: getTodayISO(),
      etiquetas: [],
      notas: '',
      useTemplateChecklist: true,
    });
  },

  updateContentItem: (id, data) => {
    const nextItems = get().items.map((item) => {
      if (item.id !== id) return item;
      const updated: ContentItem = { ...item, ...data };
      if (updated.etapa !== 'proceso') {
        delete updated.subEtapa;
      } else if (!updated.subEtapa) {
        updated.subEtapa = 'guion';
      }
      return updated;
    });
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  deleteContentItem: (id) => {
    const nextItems = get().items.filter((i) => i.id !== id);
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  moveItemStage: (id, targetStage, extra) => {
    const state = get();
    const targetStageItems = state.items.filter(
      (i) => i.etapa === targetStage && i.id !== id
    );
    const nextOrder =
      targetStageItems.length > 0
        ? Math.max(...targetStageItems.map((i) => i.orden)) + 1
        : 0;

    const nextItems = state.items.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        etapa: targetStage,
        subEtapa:
          targetStage === 'proceso'
            ? extra?.subEtapa || item.subEtapa || 'guion'
            : undefined,
        fechaPublicacion:
          targetStage === 'publicado'
            ? extra?.fechaPublicacion || item.fechaPublicacion || getTodayISO()
            : item.fechaPublicacion,
        url:
          targetStage === 'publicado'
            ? extra?.url !== undefined
              ? extra.url
              : item.url
            : item.url,
        orden: nextOrder,
      };
    });

    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  reorderStageItems: (stage, orderedIds) => {
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => orderMap.set(id, index));

    const nextItems = get().items.map((item) => {
      if (item.etapa === stage && orderMap.has(item.id)) {
        return { ...item, orden: orderMap.get(item.id)! };
      }
      return item;
    });

    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  moveItemDate: (id, newIsoDate) => {
    const nextItems = get().items.map((item) =>
      item.id === id ? { ...item, fechaPlanificada: newIsoDate } : item
    );
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  adaptItemToChannel: (sourceItemId, targetChannelId, targetFormat) => {
    const state = get();
    const source = state.items.find((i) => i.id === sourceItemId);
    if (!source) return null;

    return state.addContentItem({
      channelId: targetChannelId,
      titulo: source.titulo,
      descripcion: source.descripcion,
      formato: targetFormat,
      etapa: 'idea',
      prioridad: source.prioridad,
      fechaPlanificada: getTodayISO(),
      etiquetas: [...source.etiquetas],
      notas: source.notas,
      useTemplateChecklist: true,
    });
  },

  toggleChecklistItem: (itemId, checkId) => {
    const nextItems = get().items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        checklist: item.checklist.map((ck) =>
          ck.id === checkId ? { ...ck, hecho: !ck.hecho } : ck
        ),
      };
    });
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  addChecklistItemToCard: (itemId, texto) => {
    if (!texto.trim()) return;
    const nextItems = get().items.map((item) => {
      if (item.id !== itemId) return item;
      const newCk: ChecklistItem = {
        id: `ck-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        texto: texto.trim(),
        hecho: false,
      };
      return {
        ...item,
        checklist: [...item.checklist, newCk],
      };
    });
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  removeChecklistItemFromCard: (itemId, checkId) => {
    const nextItems = get().items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        checklist: item.checklist.filter((ck) => ck.id !== checkId),
      };
    });
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  applyTemplateToCard: (itemId, formato) => {
    const state = get();
    const templateChecklist = buildChecklistFromTemplate(formato, state.templates);
    const nextItems = state.items.map((item) =>
      item.id === itemId ? { ...item, checklist: templateChecklist } : item
    );
    storageService.saveItems(nextItems);
    set({ items: nextItems });
  },

  updateFormatTemplate: (formato, tareas) => {
    const nextTemplates = get().templates.map((t) =>
      t.formato === formato ? { ...t, tareas } : t
    );
    storageService.saveTemplates(nextTemplates);
    set({ templates: nextTemplates });
  },

  clearAllData: () => {
    const cleared = storageService.clearAllData();
    set({
      channels: cleared.channels,
      items: cleared.items,
      templates: cleared.templates,
      filters: DEFAULT_FILTERS,
    });
  },

  restoreSampleData: () => {
    const sample = storageService.restoreSampleData();
    set({
      channels: sample.channels,
      items: sample.items,
      templates: sample.templates,
      filters: DEFAULT_FILTERS,
    });
  },

  importBackupData: (rawJson) => {
    const parsed = storageService.parseBackupJSON(rawJson);
    storageService.saveChannels(parsed.channels);
    storageService.saveItems(parsed.items);
    storageService.saveTemplates(parsed.templates);
    set({
      channels: parsed.channels,
      items: parsed.items,
      templates: parsed.templates,
      filters: DEFAULT_FILTERS,
    });
  },

  exportBackupData: () => {
    const { channels, items, templates } = get();
    return storageService.exportBackupJSON(channels, items, templates);
  },
}));
