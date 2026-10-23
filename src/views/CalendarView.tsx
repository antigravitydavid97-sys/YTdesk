import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Plus, GripVertical, AlertTriangle } from 'lucide-react';
import { Channel, ContentItem } from '../types';
import { useContentStore } from '../store/useContentStore';
import { filterContentItems } from '../utils/filterUtils';
import {
  CalendarDayCell,
  getMonthCalendarGrid,
  getWeekCalendarGrid,
  isDateOverdue,
} from '../utils/dateUtils';
import { PlatformIcon } from '../components/PlatformIcon';

const WEEKDAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface DraggableCalendarItemProps {
  item: ContentItem;
  channel?: Channel;
  onEdit: (item: ContentItem) => void;
}

const DraggableCalendarItem: React.FC<DraggableCalendarItemProps> = ({
  item,
  channel,
  onEdit,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `cal-item-${item.id}`,
    data: {
      itemId: item.id,
      item,
    },
  });

  const overdue = isDateOverdue(item.fechaPlanificada, item.etapa);

  return (
    <div
      ref={setNodeRef}
      onClick={() => onEdit(item)}
      className={`group flex cursor-pointer items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
        isDragging
          ? 'opacity-40 border-indigo-500'
          : overdue
            ? 'border-red-500/40 bg-red-950/20 hover:border-red-500/70'
            : 'border-slate-800 bg-[#131B2E] hover:border-slate-700'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {channel && (
          <PlatformIcon
            platform={channel.plataforma}
            color={channel.color}
            className="h-3 w-3 shrink-0"
          />
        )}
        <span className="truncate font-medium text-slate-100 group-hover:text-indigo-300">
          {item.titulo}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {overdue && <AlertTriangle className="h-3 w-3 text-red-400" />}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab rounded p-0.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing"
          aria-label="Arrastrar a otro día"
          title="Arrastrar a otra fecha"
        >
          <GripVertical className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

interface DroppableDayCellProps {
  cell: CalendarDayCell;
  dayItems: ContentItem[];
  channelMap: Map<string, Channel>;
  isWeekMode: boolean;
  onAddOnDate: (isoDate: string) => void;
  onEditItem: (item: ContentItem) => void;
}

const DroppableDayCell: React.FC<DroppableDayCellProps> = ({
  cell,
  dayItems,
  channelMap,
  isWeekMode,
  onAddOnDate,
  onEditItem,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${cell.iso}`,
    data: {
      isoDate: cell.iso,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col border-b border-r border-slate-800/80 p-2 transition-colors ${
        isWeekMode ? 'min-h-[340px]' : 'min-h-[135px]'
      } ${
        isOver
          ? 'bg-indigo-950/30 ring-1 ring-inset ring-indigo-500'
          : cell.isCurrentMonth
            ? 'bg-[#0E1422]'
            : 'bg-[#090D16]/70 text-slate-600'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-md px-1.5 font-mono tabular-nums text-xs font-semibold ${
            cell.isToday
              ? 'bg-indigo-600 text-white'
              : cell.isCurrentMonth
                ? 'text-slate-300'
                : 'text-slate-600'
          }`}
        >
          {cell.dayNumber}
        </span>

        <button
          type="button"
          onClick={() => onAddOnDate(cell.iso)}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          title={`Planificar contenido el ${cell.iso}`}
          aria-label={`Planificar contenido el ${cell.iso}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex-1 space-y-1.5">
        {dayItems.map((item) => (
          <DraggableCalendarItem
            key={item.id}
            item={item}
            channel={channelMap.get(item.channelId)}
            onEdit={onEditItem}
          />
        ))}
      </div>
    </div>
  );
};

interface CalendarViewProps {
  onNewItemOnDate: (isoDate: string) => void;
  onEditItem: (item: ContentItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onNewItemOnDate,
  onEditItem,
}) => {
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const filters = useContentStore((s) => s.filters);
  const moveItemDate = useContentStore((s) => s.moveItemDate);

  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [cursorDate, setCursorDate] = useState<Date>(() => new Date());
  const [activeDragItem, setActiveDragItem] = useState<ContentItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const channelMap = React.useMemo(() => {
    const map = new Map<string, Channel>();
    channels.forEach((c) => map.set(c.id, c));
    return map;
  }, [channels]);

  const filteredItems = React.useMemo(
    () => filterContentItems(items, channels, filters),
    [items, channels, filters]
  );

  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    filteredItems.forEach((item) => {
      const dateKey = item.fechaPlanificada;
      if (!dateKey) return;
      const list = map.get(dateKey) || [];
      list.push(item);
      map.set(dateKey, list);
    });
    return map;
  }, [filteredItems]);

  const cells = React.useMemo(() => {
    if (mode === 'month') {
      return getMonthCalendarGrid(
        cursorDate.getFullYear(),
        cursorDate.getMonth()
      );
    }
    return getWeekCalendarGrid(cursorDate);
  }, [mode, cursorDate]);

  const handlePrev = () => {
    const next = new Date(cursorDate);
    if (mode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCursorDate(next);
  };

  const handleNext = () => {
    const next = new Date(cursorDate);
    if (mode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCursorDate(next);
  };

  const handleToday = () => {
    setCursorDate(new Date());
  };

  const handleDragStart = (e: DragStartEvent) => {
    const item = e.active.data.current?.item as ContentItem | undefined;
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = e;
    if (!over) return;

    const itemId = active.data.current?.itemId as string | undefined;
    const targetIsoDate = over.data.current?.isoDate as string | undefined;

    if (itemId && targetIsoDate) {
      moveItemDate(itemId, targetIsoDate);
    }
  };

  const periodTitle = cursorDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Barra de controles del calendario */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0E1422] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-800 bg-[#0B0F17] p-0.5">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800"
              aria-label="Periodo anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-md whitespace-nowrap shrink-0"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800"
              aria-label="Periodo siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-base font-semibold capitalize text-slate-100">
            {periodTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-slate-400 md:block">
            Arrastra cualquier pieza a otro día para reprogramar su fecha planificada
          </p>

          {/* Selector Mensual / Semanal */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B0F17] p-1">
            <button
              type="button"
              onClick={() => setMode('month')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setMode('week')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semanal
            </button>
          </div>
        </div>
      </div>

      {/* Cuadrícula del calendario */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0E1422]">
          <div className="min-w-[768px]">
            {/* Cabecera de días de la semana */}
            <div className="grid grid-cols-7 border-b border-slate-800 bg-[#131B2E]">
              {WEEKDAYS_ES.map((day) => (
                <div
                  key={day}
                  className="border-r border-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-300 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Celdas de días */}
            <div className="grid grid-cols-7">
              {cells.map((cell) => (
                <DroppableDayCell
                  key={cell.iso}
                  cell={cell}
                  dayItems={itemsByDate.get(cell.iso) || []}
                  channelMap={channelMap}
                  isWeekMode={mode === 'week'}
                  onAddOnDate={onNewItemOnDate}
                  onEditItem={onEditItem}
                />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeDragItem ? (
            <div className="rounded-lg border border-indigo-500 bg-[#131B2E] px-3 py-2 text-xs font-semibold text-white shadow-xl">
              {activeDragItem.titulo}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
