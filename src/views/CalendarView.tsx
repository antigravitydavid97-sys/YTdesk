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
import { ChevronLeft, ChevronRight, Plus, GripVertical, AlertCircle } from 'lucide-react';
import { Channel, ContentItem } from '../types';
import { useContentStore } from '../store/useContentStore';
import { filterContentItems } from '../utils/filterUtils';
import {
  CalendarDayCell,
  getMonthCalendarGrid,
  getWeekCalendarGrid,
  isDateOverdue,
} from '../utils/dateUtils';
import { PlatformIcon, getStageSystemColor } from '../components/PlatformIcon';

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
      className={`group flex cursor-pointer items-center justify-between gap-1.5 rounded-[8px] bg-[var(--fill)] px-2.5 py-1.5 text-left hig-caption transition-all hover:bg-[var(--fill-hover)] ${
        isDragging ? 'opacity-40 scale-95' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: channel?.color || getStageSystemColor(item.etapa),
          }}
        />
        {channel && (
          <PlatformIcon
            platform={channel.plataforma}
            className="h-3 w-3 shrink-0 text-[var(--label-2)]"
          />
        )}
        <span className="truncate font-medium text-[var(--label)]">
          {item.titulo}
        </span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {overdue && (
          <AlertCircle
            strokeWidth={1.75}
            className="h-3 w-3"
            style={{ color: 'var(--sys-red)' }}
          />
        )}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab rounded p-0.5 text-[var(--label-3)] hover:text-[var(--label)] active:cursor-grabbing"
          aria-label="Arrastrar a otro día"
          title="Arrastrar a otra fecha"
        >
          <GripVertical strokeWidth={1.75} className="h-3 w-3" />
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
      className={`group flex flex-col hairline-b hairline-r p-2 transition-colors ${
        isWeekMode ? 'min-h-[340px]' : 'min-h-[128px]'
      } ${
        isOver
          ? 'bg-[var(--accent)]/10'
          : cell.isCurrentMonth
            ? 'bg-[var(--surface)]'
            : 'bg-[var(--surface-2)]/60'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 font-mono tabular-nums hig-caption font-semibold ${
            cell.isToday
              ? 'bg-[var(--sys-red)] text-white'
              : cell.isCurrentMonth
                ? 'text-[var(--label)]'
                : 'text-[var(--label-3)]'
          }`}
        >
          {cell.dayNumber}
        </span>

        <button
          type="button"
          onClick={() => onAddOnDate(cell.iso)}
          className="apple-press flex h-6 w-6 items-center justify-center rounded-full text-[var(--label-3)] opacity-0 transition-opacity hover:bg-[var(--fill)] hover:text-[var(--label)] group-hover:opacity-100 focus:opacity-100"
          title={`Planificar contenido el ${cell.iso}`}
          aria-label={`Planificar contenido el ${cell.iso}`}
        >
          <Plus strokeWidth={1.75} className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-1.5 flex-1 space-y-1">
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
      {/* Cabecera estilo Calendario de macOS/iOS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="hig-title-2 capitalize text-[var(--label)]">
            {periodTitle}
          </h2>

          <div className="flex items-center gap-1 rounded-[10px] bg-[var(--fill)] p-0.5">
            <button
              type="button"
              onClick={handlePrev}
              className="apple-press apple-focus flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--label)] hover:bg-[var(--surface)]"
              aria-label="Periodo anterior"
            >
              <ChevronLeft strokeWidth={1.75} className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="apple-press apple-focus rounded-[8px] px-2.5 py-1 hig-caption font-medium text-[var(--label)] hover:bg-[var(--surface)] whitespace-nowrap shrink-0"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="apple-press apple-focus flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--label)] hover:bg-[var(--surface)]"
              aria-label="Periodo siguiente"
            >
              <ChevronRight strokeWidth={1.75} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Segmented Control iOS: Mensual / Semanal */}
        <div className="inline-flex rounded-[10px] bg-[var(--fill)] p-1">
          <button
            type="button"
            onClick={() => setMode('month')}
            className={`apple-press apple-focus rounded-[8px] px-3.5 py-1 hig-footnote font-medium transition-all whitespace-nowrap shrink-0 ${
              mode === 'month'
                ? 'bg-[var(--surface)] text-[var(--label)] shadow-xs'
                : 'text-[var(--label-2)] hover:text-[var(--label)]'
            }`}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={() => setMode('week')}
            className={`apple-press apple-focus rounded-[8px] px-3.5 py-1 hig-footnote font-medium transition-all whitespace-nowrap shrink-0 ${
              mode === 'week'
                ? 'bg-[var(--surface)] text-[var(--label)] shadow-xs'
                : 'text-[var(--label-2)] hover:text-[var(--label)]'
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Cuadrícula del Calendario */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="apple-card overflow-x-auto overflow-hidden">
          <div className="min-w-[740px]">
            <div className="grid grid-cols-7 hairline-b bg-[var(--surface)]">
              {WEEKDAYS_ES.map((day) => (
                <div
                  key={day}
                  className="px-3 py-2 text-right hig-caption font-medium text-[var(--label-2)]"
                >
                  {day}
                </div>
              ))}
            </div>

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
            <div className="apple-card-dragging rounded-[10px] bg-[var(--surface-elevated)] px-3 py-1.5 hig-caption font-semibold text-[var(--label)]">
              {activeDragItem.titulo}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
