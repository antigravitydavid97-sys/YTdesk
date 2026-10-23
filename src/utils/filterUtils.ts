import { Channel, ContentFilters, ContentItem } from '../types';

export function filterContentItems(
  items: ContentItem[],
  channels: Channel[],
  filters: ContentFilters
): ContentItem[] {
  const channelMap = new Map<string, Channel>();
  channels.forEach((ch) => channelMap.set(ch.id, ch));

  const query = filters.busqueda.trim().toLowerCase();

  return items.filter((item) => {
    const channel = channelMap.get(item.channelId);

    if (filters.channelId !== 'all' && item.channelId !== filters.channelId) {
      return false;
    }

    if (filters.plataforma !== 'all' && channel?.plataforma !== filters.plataforma) {
      return false;
    }

    if (filters.formato !== 'all' && item.formato !== filters.formato) {
      return false;
    }

    if (filters.prioridad !== 'all' && item.prioridad !== filters.prioridad) {
      return false;
    }

    if (filters.etiqueta !== 'all' && !item.etiquetas.includes(filters.etiqueta)) {
      return false;
    }

    if (query.length > 0) {
      const inTitle = item.titulo.toLowerCase().includes(query);
      const inDesc = item.descripcion.toLowerCase().includes(query);
      const inNotes = item.notas.toLowerCase().includes(query);
      const inTags = item.etiquetas.some((t) => t.toLowerCase().includes(query));
      const inChannel = channel?.nombre.toLowerCase().includes(query) || false;
      if (!inTitle && !inDesc && !inNotes && !inTags && !inChannel) {
        return false;
      }
    }

    return true;
  });
}

export function extractUniqueTags(items: ContentItem[]): string[] {
  const set = new Set<string>();
  items.forEach((item) => {
    item.etiquetas.forEach((tag) => {
      if (tag.trim()) set.add(tag.trim());
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

export function hasActiveFilters(filters: ContentFilters): boolean {
  return (
    filters.channelId !== 'all' ||
    filters.plataforma !== 'all' ||
    filters.formato !== 'all' ||
    filters.prioridad !== 'all' ||
    filters.etiqueta !== 'all' ||
    filters.busqueda.trim().length > 0
  );
}
