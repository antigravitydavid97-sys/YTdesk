import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  CopyPlus,
  ExternalLink,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRightCircle,
} from 'lucide-react';
import { Channel, ContentItem, Stage } from '../types';
import { PlatformIcon, getStageSystemColor } from './PlatformIcon';
import { formatShortDateES, isDateOverdue } from '../utils/dateUtils';
import { useContentStore } from '../store/useContentStore';

interface ContentCardProps {
  item: ContentItem;
  channel?: Channel;
  onEdit: (item: ContentItem) => void;
  onAdapt: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onRequestPublish?: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  channel,
  onEdit,
  onAdapt,
  onDelete,
  onRequestPublish,
}) => {
  const moveItemStage = useContentStore((s) => s.moveItemStage);

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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalCheck = item.checklist.length;
  const doneCheck = item.checklist.filter((c) => c.hecho).length;
  const progressPct = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;
  const overdue = isDateOverdue(item.fechaPlanificada, item.etapa);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      setMenuOpen(true);
    }, 520);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleStageQuickMove = (targetStage: Stage) => {
    setMenuOpen(false);
    if (targetStage === item.etapa) return;
    if (targetStage === 'publicado' && onRequestPublish) {
      onRequestPublish(item);
    } else {
      moveItemStage(item.id, targetStage);
    }
  };

  const priorityLabelMap: Record<
    ContentItem['prioridad'],
    { text: string; colorVar: string }
  > = {
    alta: { text: 'Alta', colorVar: 'var(--sys-red)' },
    media: { text: 'Media', colorVar: 'var(--sys-orange)' },
    baja: { text: 'Baja', colorVar: 'var(--label-2)' },
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      className={`apple-card group relative p-4 select-none ${
        isDragging ? 'apple-card-dragging z-30 opacity-90' : ''
      }`}
    >
      {/* Fila superior: Canal (punto de color + icono de red + nombre) + Controles */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 hig-caption">
          {channel ? (
            <>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: channel.color }}
                aria-hidden="true"
              />
              <PlatformIcon
                platform={channel.plataforma}
                className="h-3.5 w-3.5 shrink-0 text-[var(--label-2)]"
              />
              <span className="truncate font-medium text-[var(--label-2)]">
                {channel.nombre}
              </span>
            </>
          ) : (
            <span className="text-[var(--label-3)]">Sin canal</span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="apple-press apple-focus flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] hover:text-[var(--label)]"
            aria-label="Opciones de tarjeta"
            title="Menú contextual (o clic derecho)"
          >
            <MoreHorizontal strokeWidth={1.75} className="h-4 w-4" />
          </button>

          <button
            type="button"
            {...attributes}
            {...listeners}
            className="apple-focus flex h-7 w-7 cursor-grab items-center justify-center rounded-[8px] text-[var(--label-3)] hover:bg-[var(--fill)] hover:text-[var(--label-2)] active:cursor-grabbing"
            aria-label="Arrastrar tarjeta"
            title="Arrastrar para mover"
          >
            <GripVertical strokeWidth={1.75} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Título principal */}
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="apple-focus mt-2 block w-full rounded-[6px] text-left"
      >
        <h3 className="hig-subhead font-semibold text-[var(--label)] transition-colors group-hover:text-[var(--accent)]">
          {item.titulo}
        </h3>
      </button>

      {/* Metadatos limpios con separadores tipográficos */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 hig-caption text-[var(--label-2)]">
        <span className="capitalize font-medium text-[var(--label)]">
          {item.formato}
        </span>

        {item.etapa === 'proceso' && item.subEtapa && (
          <>
            <span aria-hidden="true" className="text-[var(--label-3)]">
              ·
            </span>
            <span
              className="capitalize font-medium"
              style={{ color: 'var(--sys-blue)' }}
            >
              {item.subEtapa}
            </span>
          </>
        )}

        <span aria-hidden="true" className="text-[var(--label-3)]">
          ·
        </span>
        <span
          className="font-medium"
          style={{ color: priorityLabelMap[item.prioridad].colorVar }}
        >
          {priorityLabelMap[item.prioridad].text}
        </span>

        <span aria-hidden="true" className="text-[var(--label-3)]">
          ·
        </span>
        <span
          className="inline-flex items-center gap-1 font-mono tabular-nums"
          style={{ color: overdue ? 'var(--sys-red)' : 'var(--label-2)' }}
        >
          {overdue && (
            <AlertCircle strokeWidth={1.75} className="h-3 w-3 shrink-0" />
          )}
          {item.etapa === 'publicado' && item.fechaPublicacion
            ? formatShortDateES(item.fechaPublicacion)
            : formatShortDateES(item.fechaPlanificada)}
        </span>
      </div>

      {/* Barra de progreso fina de checklist */}
      {totalCheck > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between hig-caption text-[var(--label-2)]">
            <span>Tareas</span>
            <span className="font-mono tabular-nums">
              {doneCheck}/{totalCheck}
            </span>
          </div>
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--fill)]">
            <div
              className="h-full origin-left transition-transform duration-200"
              style={{
                backgroundColor:
                  progressPct === 100
                    ? 'var(--sys-green)'
                    : getStageSystemColor(item.etapa),
                transform: `scaleX(${progressPct / 100})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Etiquetas y enlace publicado */}
      {(item.etiquetas.length > 0 || (item.etapa === 'publicado' && item.url)) && (
        <div className="mt-3 flex items-center justify-between gap-2 hairline-t pt-2.5 hig-caption text-[var(--label-2)]">
          <div className="truncate">
            {item.etiquetas.map((t, idx) => (
              <React.Fragment key={t}>
                {idx > 0 && <span className="mx-1 text-[var(--label-3)]">·</span>}
                <span>#{t}</span>
              </React.Fragment>
            ))}
          </div>

          {item.etapa === 'publicado' && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Abrir</span>
              <ExternalLink strokeWidth={1.75} className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Menú contextual translúcido estilo iOS/macOS (Clic derecho / Pulsación larga / Botón •••) */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="apple-glass-elevated hairline-border absolute right-3 top-10 z-40 w-52 overflow-hidden rounded-[14px] py-1 shadow-xl"
          role="menu"
        >
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onEdit(item);
            }}
            className="flex w-full items-center justify-between px-3.5 py-2 hig-footnote text-[var(--label)] hover:bg-[var(--fill)]"
            role="menuitem"
          >
            <span>Editar contenido</span>
            <Pencil strokeWidth={1.75} className="h-3.5 w-3.5 text-[var(--label-2)]" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onAdapt(item);
            }}
            className="flex w-full items-center justify-between px-3.5 py-2 hig-footnote text-[var(--label)] hover:bg-[var(--fill)]"
            role="menuitem"
          >
            <span>Adaptar a otra red</span>
            <CopyPlus strokeWidth={1.75} className="h-3.5 w-3.5 text-[var(--label-2)]" />
          </button>

          <div className="my-1 hairline-t" />

          {item.etapa !== 'idea' && (
            <button
              type="button"
              onClick={() => handleStageQuickMove('idea')}
              className="flex w-full items-center justify-between px-3.5 py-2 hig-footnote text-[var(--label)] hover:bg-[var(--fill)]"
              role="menuitem"
            >
              <span>Mover a Idea</span>
              <ArrowRightCircle
                strokeWidth={1.75}
                className="h-3.5 w-3.5"
                style={{ color: 'var(--sys-orange)' }}
              />
            </button>
          )}

          {item.etapa !== 'proceso' && (
            <button
              type="button"
              onClick={() => handleStageQuickMove('proceso')}
              className="flex w-full items-center justify-between px-3.5 py-2 hig-footnote text-[var(--label)] hover:bg-[var(--fill)]"
              role="menuitem"
            >
              <span>Mover a En Proceso</span>
              <ArrowRightCircle
                strokeWidth={1.75}
                className="h-3.5 w-3.5"
                style={{ color: 'var(--sys-blue)' }}
              />
            </button>
          )}

          {item.etapa !== 'publicado' && (
            <button
              type="button"
              onClick={() => handleStageQuickMove('publicado')}
              className="flex w-full items-center justify-between px-3.5 py-2 hig-footnote text-[var(--label)] hover:bg-[var(--fill)]"
              role="menuitem"
            >
              <span>Marcar como Publicado</span>
              <ArrowRightCircle
                strokeWidth={1.75}
                className="h-3.5 w-3.5"
                style={{ color: 'var(--sys-green)' }}
              />
            </button>
          )}

          <div className="my-1 hairline-t" />

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onDelete(item);
            }}
            className="flex w-full items-center justify-between px-3.5 py-2 hig-footnote font-medium hover:bg-[var(--fill)]"
            style={{ color: 'var(--sys-red)' }}
            role="menuitem"
          >
            <span>Eliminar</span>
            <Trash2 strokeWidth={1.75} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </article>
  );
};
