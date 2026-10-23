import {
  BackupPayload,
  Channel,
  ContentItem,
  FormatTemplate,
  ThemePreference,
} from '../types';
import {
  DEFAULT_FORMAT_TEMPLATES,
  INITIAL_SAMPLE_CHANNELS,
  INITIAL_SAMPLE_ITEMS,
} from '../utils/constants';

const STORAGE_KEYS = {
  CHANNELS: 'contentflow_channels_v1',
  ITEMS: 'contentflow_items_v1',
  TEMPLATES: 'contentflow_templates_v1',
  INITIALIZED: 'contentflow_initialized_v1',
  THEME: 'contentflow_theme_v1',
} as const;

export interface IStorageService {
  loadInitialState(): {
    channels: Channel[];
    items: ContentItem[];
    templates: FormatTemplate[];
    theme: ThemePreference;
  };
  saveChannels(channels: Channel[]): void;
  saveItems(items: ContentItem[]): void;
  saveTemplates(templates: FormatTemplate[]): void;
  getThemePreference(): ThemePreference;
  saveThemePreference(theme: ThemePreference): void;
  clearAllData(): {
    channels: Channel[];
    items: ContentItem[];
    templates: FormatTemplate[];
  };
  restoreSampleData(): {
    channels: Channel[];
    items: ContentItem[];
    templates: FormatTemplate[];
  };
  exportBackupJSON(channels: Channel[], items: ContentItem[], templates: FormatTemplate[]): string;
  parseBackupJSON(rawJson: string): BackupPayload;
}

class LocalStorageService implements IStorageService {
  private safeGet<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`Error leyendo clave ${key} en storageService:`, err);
      return fallback;
    }
  }

  private safeSet<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error guardando clave ${key} en storageService:`, err);
    }
  }

  public getThemePreference(): ThemePreference {
    const t = this.safeGet<ThemePreference>(STORAGE_KEYS.THEME, 'auto');
    if (t === 'light' || t === 'dark' || t === 'auto') return t;
    return 'auto';
  }

  public saveThemePreference(theme: ThemePreference): void {
    this.safeSet(STORAGE_KEYS.THEME, theme);
  }

  public loadInitialState() {
    const initialized = window.localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const theme = this.getThemePreference();

    if (!initialized) {
      this.safeSet(STORAGE_KEYS.CHANNELS, INITIAL_SAMPLE_CHANNELS);
      this.safeSet(STORAGE_KEYS.ITEMS, INITIAL_SAMPLE_ITEMS);
      this.safeSet(STORAGE_KEYS.TEMPLATES, DEFAULT_FORMAT_TEMPLATES);
      window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

      return {
        channels: INITIAL_SAMPLE_CHANNELS,
        items: INITIAL_SAMPLE_ITEMS,
        templates: DEFAULT_FORMAT_TEMPLATES,
        theme,
      };
    }

    const channels = this.safeGet<Channel[]>(STORAGE_KEYS.CHANNELS, []);
    const items = this.safeGet<ContentItem[]>(STORAGE_KEYS.ITEMS, []);
    const templates = this.safeGet<FormatTemplate[]>(
      STORAGE_KEYS.TEMPLATES,
      DEFAULT_FORMAT_TEMPLATES
    );

    return { channels, items, templates, theme };
  }

  public saveChannels(channels: Channel[]): void {
    this.safeSet(STORAGE_KEYS.CHANNELS, channels);
  }

  public saveItems(items: ContentItem[]): void {
    this.safeSet(STORAGE_KEYS.ITEMS, items);
  }

  public saveTemplates(templates: FormatTemplate[]): void {
    this.safeSet(STORAGE_KEYS.TEMPLATES, templates);
  }

  public clearAllData() {
    const emptyChannels: Channel[] = [];
    const emptyItems: ContentItem[] = [];
    const templates = this.safeGet<FormatTemplate[]>(
      STORAGE_KEYS.TEMPLATES,
      DEFAULT_FORMAT_TEMPLATES
    );

    this.safeSet(STORAGE_KEYS.CHANNELS, emptyChannels);
    this.safeSet(STORAGE_KEYS.ITEMS, emptyItems);
    window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return {
      channels: emptyChannels,
      items: emptyItems,
      templates,
    };
  }

  public restoreSampleData() {
    this.safeSet(STORAGE_KEYS.CHANNELS, INITIAL_SAMPLE_CHANNELS);
    this.safeSet(STORAGE_KEYS.ITEMS, INITIAL_SAMPLE_ITEMS);
    this.safeSet(STORAGE_KEYS.TEMPLATES, DEFAULT_FORMAT_TEMPLATES);
    window.localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return {
      channels: INITIAL_SAMPLE_CHANNELS,
      items: INITIAL_SAMPLE_ITEMS,
      templates: DEFAULT_FORMAT_TEMPLATES,
    };
  }

  public exportBackupJSON(
    channels: Channel[],
    items: ContentItem[],
    templates: FormatTemplate[]
  ): string {
    const payload: BackupPayload = {
      version: '1.0.0',
      exportadoEn: new Date().toISOString(),
      channels,
      items,
      templates,
    };
    return JSON.stringify(payload, null, 2);
  }

  public parseBackupJSON(rawJson: string): BackupPayload {
    const parsed = JSON.parse(rawJson) as Partial<BackupPayload>;
    if (
      !parsed ||
      !Array.isArray(parsed.channels) ||
      !Array.isArray(parsed.items)
    ) {
      throw new Error(
        'El archivo JSON no tiene una estructura válida de ContentFlow (faltan channels o items).'
      );
    }

    return {
      version: parsed.version || '1.0.0',
      exportadoEn: parsed.exportadoEn || new Date().toISOString(),
      channels: parsed.channels,
      items: parsed.items,
      templates: Array.isArray(parsed.templates)
        ? parsed.templates
        : DEFAULT_FORMAT_TEMPLATES,
    };
  }
}

export const storageService: IStorageService = new LocalStorageService();
