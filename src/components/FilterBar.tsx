import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { FORMATS, PLATFORMS, PRIORITIES } from '../utils/constants';
import { extractUniqueTags, hasActiveFilters } from '../utils/filterUtils';
import { ContentFormat, Platform, Priority } from '../types';

export const FilterBar: React.FC = () => {
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const filters = useContentStore((s) => s.filters);
  const setFilter = useContentStore((s) => s.setFilter);
  const resetFilters = useContentStore((s) => s.resetFilters);

  const uniqueTags = React.useMemo(() => extractUniqueTags(items), [items]);
  const isFiltered = hasActiveFilters(filters);

  return (
    <section
      aria-label="Filtros de contenido"
      className="px-4 pt-3 pb-1 sm:px-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Campo de búsqueda estilo Spotlight / iOS Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--label-2)]"
          />
          <input
            type="search"
            value={filters.busqueda}
            onChange={(e) => setFilter('busqueda', e.target.value)}
            placeholder="Buscar título, notas o etiqueta…"
            aria-label="Buscar contenido por texto"
            className="apple-input hig-footnote min-h-[36px] w-full pl-9 pr-3"
          />
        </div>

        {/* Selector de Red */}
        <select
          value={filters.plataforma}
          onChange={(e) => setFilter('plataforma', e.target.value as Platform | 'all')}
          aria-label="Filtrar por plataforma"
          className="apple-input hig-footnote min-h-[36px] px-3 py-1.5 font-medium cursor-pointer"
        >
          <option value="all">Todas las redes</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Selector de Canal */}
        <select
          value={filters.channelId}
          onChange={(e) => setFilter('channelId', e.target.value)}
          aria-label="Filtrar por canal"
          className="apple-input hig-footnote min-h-[36px] max-w-[190px] truncate px-3 py-1.5 font-medium cursor-pointer"
        >
          <option value="all">Todos los canales</option>
          {channels
            .filter(
              (ch) => filters.plataforma === 'all' || ch.plataforma === filters.plataforma
            )
            .map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.nombre}
              </option>
            ))}
        </select>

        {/* Selector de Formato */}
        <select
          value={filters.formato}
          onChange={(e) => setFilter('formato', e.target.value as ContentFormat | 'all')}
          aria-label="Filtrar por formato"
          className="apple-input hig-footnote min-h-[36px] px-3 py-1.5 font-medium cursor-pointer"
        >
          <option value="all">Formato</option>
          {FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Selector de Prioridad */}
        <select
          value={filters.prioridad}
          onChange={(e) => setFilter('prioridad', e.target.value as Priority | 'all')}
          aria-label="Filtrar por prioridad"
          className="apple-input hig-footnote min-h-[36px] px-3 py-1.5 font-medium cursor-pointer"
        >
          <option value="all">Prioridad</option>
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Selector de Etiqueta */}
        {uniqueTags.length > 0 && (
          <select
            value={filters.etiqueta}
            onChange={(e) => setFilter('etiqueta', e.target.value)}
            aria-label="Filtrar por etiqueta"
            className="apple-input hig-footnote min-h-[36px] px-3 py-1.5 font-medium cursor-pointer"
          >
            <option value="all">Etiquetas</option>
            {uniqueTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        )}

        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--accent)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
          >
            <RotateCcw strokeWidth={1.75} className="h-3.5 w-3.5" />
            <span>Restablecer</span>
          </button>
        )}
      </div>
    </section>
  );
};
