import React, { useState } from 'react';
import {
  ArrowUpDown,
  CopyPlus,
  ExternalLink,
  Pencil,
  Trash2,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { Channel, ContentItem, Stage } from '../types';
import { useContentStore } from '../store/useContentStore';
import { filterContentItems } from '../utils/filterUtils';
import { formatShortDateES, isDateOverdue } from '../utils/dateUtils';
import { PlatformIcon, getStageSystemColor } from '../components/PlatformIcon';
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
      <div className="ios-grouped-card">
        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Inbox strokeWidth={1.5} className="h-11 w-11 text-[var(--label-3)]" />
            <p className="mt-3 hig-headline text-[var(--label)]">
              Sin contenido para mostrar
            </p>
            <button
              type="button"
              onClick={onNewItem}
              className="apple-press apple-focus mt-4 min-h-[44px] rounded-[10px] bg-[var(--accent)] px-5 py-2 hig-subhead font-semibold text-white"
            >
              Crear pieza
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left hig-footnote">
              <thead>
                <tr className="hairline-b text-[var(--label-2)]">
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('titulo')}
                      className="inline-flex items-center gap-1 hover:text-[var(--label)]"
                    >
                      <span>Título</span>
                      <ArrowUpDown strokeWidth={1.75} className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('canal')}
                      className="inline-flex items-center gap-1 hover:text-[var(--label)]"
                    >
                      <span>Canal</span>
                      <ArrowUpDown strokeWidth={1.75} className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('formato')}
                      className="inline-flex items-center gap-1 hover:text-[var(--label)]"
                    >
                      <span>Formato</span>
                      <ArrowUpDown strokeWidth={1.75} className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('etapa')}
                      className="inline-flex items-center gap-1 hover:text-[var(--label)]"
                    >
                      <span>Etapa</span>
                      <ArrowUpDown strokeWidth={1.75} className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('prioridad')}
                      className="inline-flex items-center gap-1 hover:text-[var(--label)]"
                    >
                      <span>Prioridad</span>
                      <ArrowUpDown strokeWidth={1.75} className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort('fechaPlanificada')}
                      className="inline-flex items-center justify-end gap-1 hover:text-[var(--label)]"
                    >
                      <span>Fecha</span>
                      <ArrowUpDown strokeWidth={1.75} className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Tareas</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => {
                  const channel = channelMap.get(item.channelId);
                  const overdue = isDateOverdue(item.fechaPlanificada, item.etapa);
                  const doneCk = item.checklist.filter((c) => c.hecho).length;
                  const totalCk = item.checklist.length;

                  return (
                    <tr
                      key={item.id}
                      className="ios-row transition-colors hover:bg-[var(--fill)]/60"
                    >
                      <td className="max-w-xs px-4 py-3">
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="text-left hig-subhead font-semibold text-[var(--label)] hover:text-[var(--accent)]"
                        >
                          {item.titulo}
                        </button>
                        {item.etiquetas.length > 0 && (
                          <div className="mt-0.5 hig-caption text-[var(--label-2)]">
                            {item.etiquetas.map((t) => `#${t}`).join(' · ')}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {channel ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: channel.color }}
                            />
                            <PlatformIcon
                              platform={channel.plataforma}
                              className="h-3.5 w-3.5 shrink-0 text-[var(--label-2)]"
                            />
                            <span className="font-medium text-[var(--label)]">
                              {channel.nombre}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--label-3)]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 capitalize text-[var(--label-2)] whitespace-nowrap">
                        {item.formato}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: getStageSystemColor(item.etapa) }}
                          />
                          <select
                            value={item.etapa}
                            onChange={(e) =>
                              handleStageSelect(item, e.target.value as Stage)
                            }
                            aria-label={`Cambiar etapa de ${item.titulo}`}
                            className="rounded-[8px] bg-[var(--fill)] px-2.5 py-1 hig-caption font-medium text-[var(--label)] focus:outline-none cursor-pointer"
                          >
                            {STAGES.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                          {item.etapa === 'proceso' && item.subEtapa && (
                            <span
                              className="capitalize font-medium"
                              style={{ color: 'var(--sys-blue)' }}
                            >
                              · {item.subEtapa}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 capitalize whitespace-nowrap">
                        <span
                          className="font-medium"
                          style={{
                            color:
                              item.prioridad === 'alta'
                                ? 'var(--sys-red)'
                                : item.prioridad === 'media'
                                  ? 'var(--sys-orange)'
                                  : 'var(--label-2)',
                          }}
                        >
                          {item.prioridad}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className="inline-flex items-center justify-end gap-1"
                          style={{
                            color: overdue ? 'var(--sys-red)' : 'var(--label-2)',
                          }}
                        >
                          {overdue && (
                            <AlertCircle strokeWidth={1.75} className="h-3.5 w-3.5" />
                          )}
                          {formatShortDateES(item.fechaPlanificada)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--label-2)] whitespace-nowrap">
                        {totalCk > 0 ? `${doneCk}/${totalCk}` : '—'}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--accent)] hover:bg-[var(--fill)]"
                              title="Abrir URL publicada"
                              aria-label="Abrir enlace publicado"
                            >
                              <ExternalLink strokeWidth={1.75} className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onEditItem(item)}
                            className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] hover:text-[var(--label)]"
                            title="Editar"
                            aria-label="Editar contenido"
                          >
                            <Pencil strokeWidth={1.75} className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdaptItem(item)}
                            className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] hover:text-[var(--accent)]"
                            title="Adaptar a otra red"
                            aria-label="Adaptar a otra red"
                          >
                            <CopyPlus strokeWidth={1.75} className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item)}
                            className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] hover:text-[var(--sys-red)]"
                            title="Eliminar"
                            aria-label="Eliminar contenido"
                          >
                            <Trash2 strokeWidth={1.75} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
