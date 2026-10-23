import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  CopyPlus,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import { Channel, ContentItem } from '../types';
import { PlatformIcon } from './PlatformIcon';
import { formatShortDateES, isDateOverdue } from '../utils/dateUtils';

interface ContentCardProps {
  item: ContentItem;
  channel?: Channel;
  onEdit: (item: ContentItem) => void;
  onAdapt: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  channel,
  onEdit,
  onAdapt,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'ContentItem',
      item,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalCheck = item.checklist.length;
  const doneCheck = item.checklist.filter((c) => c.hecho).length;
  const progressPct = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;
  const overdue = isDateOverdue(item.fechaPlanificada, item.etapa);

  const priorityTextMap: Record<ContentItem['prioridad'], { label: string; className: string }> = {
    alta: { label: 'Prioridad alta', className: 'text-red-400 font-medium' },
    media: { label: 'Prioridad media', className: 'text-amber-400' },
    baja: { label: 'Prioridad baja', className: 'text-slate-400' },
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-[#131B2E] p-4 transition-colors ${
        isDragging
          ? 'z-30 border-indigo-500 opacity-60 shadow-xl'
          : overdue
            ? 'border-red-500/40 hover:border-red-500/70'
            : 'border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Cabecera: Canal con color y red + mango de arrastre */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          {channel ? (
            <>
              <PlatformIcon
                platform={channel.plataforma}
                color={channel.color}
                className="h-3.5 w-3.5 shrink-0"
              />
              <span
                className="truncate font-semibold"
                style={{ color: channel.color }}
              >
                {channel.nombre}
              </span>
            </>
          ) : (
            <span className="text-slate-400">Canal sin asignar</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdapt(item);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 opacity-80 transition-colors hover:bg-slate-800 hover:text-indigo-400 group-hover:opacity-100"
            title="Adaptar a otra red (duplicar en Idea)"
            aria-label="Adaptar a otra red"
          >
            <CopyPlus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 opacity-80 transition-colors hover:bg-slate-800 hover:text-red-400 group-hover:opacity-100"
            title="Eliminar tarjeta"
            aria-label="Eliminar tarjeta"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing"
            title="Arrastrar tarjeta"
            aria-label="Arrastrar para mover"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Título principal (clicable para editar) */}
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="mt-2 block w-full text-left focus-visible:outline-2 focus-visible:outline-indigo-500"
      >
        <h3 className="text-sm font-semibold leading-snug text-slate-100 group-hover:text-indigo-300 transition-colors">
          {item.titulo}
        </h3>
      </button>

      {/* Metadatos limpios sin cajas tipo píldora (Zero-Pill Discipline) */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <span className="capitalize text-slate-300">{item.formato}</span>
        {item.etapa === 'proceso' && item.subEtapa && (
          <>
            <span aria-hidden="true">·</span>
            <span className="capitalize text-indigo-300">{item.subEtapa}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span className={priorityTextMap[item.prioridad].className}>
          {priorityTextMap[item.prioridad].label}
        </span>
        <span aria-hidden="true">·</span>
        <span
          className={`font-mono tabular-nums inline-flex items-center gap-1 ${
            overdue ? 'text-red-400 font-semibold' : 'text-slate-400'
          }`}
        >
          {overdue && <AlertTriangle className="h-3 w-3 shrink-0 text-red-400" />}
          {item.etapa === 'publicado' && item.fechaPublicacion
            ? `Pub. ${formatShortDateES(item.fechaPublicacion)}`
            : formatShortDateES(item.fechaPlanificada)}
        </span>
      </div>

      {/* Progreso del checklist */}
      {totalCheck > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Checklist</span>
            <span className="font-mono tabular-nums">
              {doneCheck}/{totalCheck} ({progressPct}%)
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-transform duration-150 origin-left ${
                progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>
        </div>
      )}

      {/* Etiquetas y URL si está publicado */}
      {(item.etiquetas.length > 0 || (item.etapa === 'publicado' && item.url)) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/70 pt-2.5 text-xs text-slate-400">
          <div className="truncate">
            {item.etiquetas.map((t, idx) => (
              <React.Fragment key={t}>
                {idx > 0 && <span className="mx-1 text-slate-600">·</span>}
                <span className="text-slate-400">#{t}</span>
              </React.Fragment>
            ))}
          </div>

          {item.etapa === 'publicado' && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0"
            >
              <span>Ver post</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </article>
  );
};
