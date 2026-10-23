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
      className="border-b border-slate-800/80 bg-[#0F1524] px-4 py-3 sm:px-6"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Búsqueda de texto */}
        <div className="relative min-w-[210px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.busqueda}
            onChange={(e) => setFilter('busqueda', e.target.value)}
            placeholder="Buscar título, notas o etiqueta..."
            aria-label="Buscar contenido por texto"
            className="min-h-[40px] w-full rounded-lg border border-slate-800 bg-[#0B0F17] pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Selector de Plataforma */}
        <select
          value={filters.plataforma}
          onChange={(e) => setFilter('plataforma', e.target.value as Platform | 'all')}
          aria-label="Filtrar por plataforma"
          className="min-h-[40px] rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none"
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
          className="min-h-[40px] max-w-[200px] truncate rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Todos los canales</option>
          {channels
            .filter(
              (ch) => filters.plataforma === 'all' || ch.plataforma === filters.plataforma
            )
            .map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.nombre} ({ch.handle})
              </option>
            ))}
        </select>

        {/* Selector de Formato */}
        <select
          value={filters.formato}
          onChange={(e) => setFilter('formato', e.target.value as ContentFormat | 'all')}
          aria-label="Filtrar por formato"
          className="min-h-[40px] rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Todos los formatos</option>
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
          className="min-h-[40px] rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Cualquier prioridad</option>
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              Prioridad {p.label}
            </option>
          ))}
        </select>

        {/* Selector de Etiqueta */}
        <select
          value={filters.etiqueta}
          onChange={(e) => setFilter('etiqueta', e.target.value)}
          aria-label="Filtrar por etiqueta"
          className="min-h-[40px] rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Todas las etiquetas</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              #{tag}
            </option>
          ))}
        </select>

        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-500 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>
    </section>
  );
};
