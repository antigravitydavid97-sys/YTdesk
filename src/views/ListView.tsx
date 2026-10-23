import React, { useState } from 'react';
import {
  ArrowUpDown,
  CopyPlus,
  ExternalLink,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Channel, ContentItem, Stage } from '../types';
import { useContentStore } from '../store/useContentStore';
import { filterContentItems } from '../utils/filterUtils';
import { formatShortDateES, isDateOverdue } from '../utils/dateUtils';
import { PlatformIcon } from '../components/PlatformIcon';
import { STAGES } from '../utils/constants';

type SortField = 'titulo' | 'canal' | 'formato' | 'etapa' | 'prioridad' | 'fechaPlanificada';
type SortOrder = 'asc' | 'desc';

const PRIORITY_WEIGHT: Record<ContentItem['prioridad'], number> = {
  alta: 3,
  media: 2,
  baja: 1,
};

const STAGE_WEIGHT: Record<Stage, number> = {
  idea: 1,
  proceso: 2,
  publicado: 3,
};

interface ListViewProps {
  onNewItem: () => void;
  onEditItem: (item: ContentItem) => void;
  onAdaptItem: (item: ContentItem) => void;
  onDeleteItem: (item: ContentItem) => void;
  onRequestPublishModal: (item: ContentItem) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  onNewItem,
  onEditItem,
  onAdaptItem,
  onDeleteItem,
  onRequestPublishModal,
}) => {
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const filters = useContentStore((s) => s.filters);
  const moveItemStage = useContentStore((s) => s.moveItemStage);

  const [sortField, setSortField] = useState<SortField>('fechaPlanificada');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const channelMap = React.useMemo(() => {
    const map = new Map<string, Channel>();
    channels.forEach((c) => map.set(c.id, c));
    return map;
  }, [channels]);

  const filteredItems = React.useMemo(
    () => filterContentItems(items, channels, filters),
    [items, channels, filters]
  );

  const sortedItems = React.useMemo(() => {
    const copy = [...filteredItems];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'titulo':
          cmp = a.titulo.localeCompare(b.titulo, 'es');
          break;
        case 'canal': {
          const chA = channelMap.get(a.channelId)?.nombre || '';
          const chB = channelMap.get(b.channelId)?.nombre || '';
          cmp = chA.localeCompare(chB, 'es');
          break;
        }
        case 'formato':
          cmp = a.formato.localeCompare(b.formato, 'es');
          break;
        case 'etapa':
          cmp = STAGE_WEIGHT[a.etapa] - STAGE_WEIGHT[b.etapa];
          break;
        case 'prioridad':
          cmp = PRIORITY_WEIGHT[a.prioridad] - PRIORITY_WEIGHT[b.prioridad];
          break;
        case 'fechaPlanificada':
          cmp = (a.fechaPlanificada || '').localeCompare(b.fechaPlanificada || '');
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filteredItems, sortField, sortOrder, channelMap]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleStageSelect = (item: ContentItem, newStage: Stage) => {
    if (newStage === item.etapa) return;
    if (newStage === 'publicado') {
      onRequestPublishModal(item);
    } else {
      moveItemStage(item.id, newStage);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[#0E1422]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#131B2E] text-slate-300">
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort('titulo')}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <span>Título y etiquetas</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort('canal')}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <span>Canal</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort('formato')}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <span>Formato</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort('etapa')}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <span>Etapa</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort('prioridad')}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <span>Prioridad</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort('fechaPlanificada')}
                    className="inline-flex items-center justify-end gap-1.5 hover:text-white"
                  >
                    <span>Fecha</span>
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">Checklist</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {sortedItems.map((item) => {
                const channel = channelMap.get(item.channelId);
                const overdue = isDateOverdue(item.fechaPlanificada, item.etapa);
                const doneCk = item.checklist.filter((c) => c.hecho).length;
                const totalCk = item.checklist.length;

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-800/35"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="text-left font-semibold text-slate-100 hover:text-indigo-300"
                      >
                        {item.titulo}
                      </button>
                      {item.etiquetas.length > 0 && (
                        <div className="mt-1 text-[11px] text-slate-400">
                          {item.etiquetas.map((t) => `#${t}`).join(' · ')}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {channel ? (
                        <div className="flex items-center gap-2">
                          <PlatformIcon
                            platform={channel.plataforma}
                            color={channel.color}
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <span
                            className="font-medium"
                            style={{ color: channel.color }}
                          >
                            {channel.nombre}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 capitalize text-slate-300 whitespace-nowrap">
                      {item.formato}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.etapa}
                          onChange={(e) =>
                            handleStageSelect(item, e.target.value as Stage)
                          }
                          aria-label={`Cambiar etapa de ${item.titulo}`}
                          className="rounded-md border border-slate-700 bg-[#0B0F17] px-2 py-1 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
                        >
                          {STAGES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                        {item.etapa === 'proceso' && item.subEtapa && (
                          <span className="capitalize text-indigo-300">
                            · {item.subEtapa}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 capitalize whitespace-nowrap">
                      <span
                        className={
                          item.prioridad === 'alta'
                            ? 'font-semibold text-red-400'
                            : item.prioridad === 'media'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                        }
                      >
                        {item.prioridad}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-end gap-1 ${
                          overdue ? 'font-semibold text-red-400' : 'text-slate-300'
                        }`}
                      >
                        {overdue && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                        {formatShortDateES(item.fechaPlanificada)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                      {totalCk > 0 ? `${doneCk}/${totalCk}` : '—'}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-400 hover:bg-slate-800"
                            title="Abrir URL publicada"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdaptItem(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-indigo-400"
                          title="Adaptar a otra red"
                        >
                          <CopyPlus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-400">
                      No se encontraron piezas de contenido para mostrar en la tabla.
                    </p>
                    <button
                      type="button"
                      onClick={onNewItem}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Crear contenido</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
