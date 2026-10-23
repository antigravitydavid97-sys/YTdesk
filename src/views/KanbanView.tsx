import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Layers } from 'lucide-react';
import { Channel, ContentItem, Stage } from '../types';
import { useContentStore } from '../store/useContentStore';
import { STAGES } from '../utils/constants';
import { filterContentItems } from '../utils/filterUtils';
import { ContentCard } from '../components/ContentCard';

interface KanbanColumnProps {
  stage: Stage;
  label: string;
  description: string;
  items: ContentItem[];
  channelMap: Map<string, Channel>;
  onAddInStage: (stage: Stage) => void;
  onEditItem: (item: ContentItem) => void;
  onAdaptItem: (item: ContentItem) => void;
  onDeleteItem: (item: ContentItem) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  label,
  description,
  items,
  channelMap,
  onAddInStage,
  onEditItem,
  onAdaptItem,
  onDeleteItem,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
    data: {
      type: 'Column',
      stage,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[520px] flex-col rounded-xl border bg-[#0E1422] transition-colors ${
        isOver ? 'border-indigo-500/80 bg-indigo-950/15' : 'border-slate-800/80'
      }`}
    >
      {/* Cabecera de columna */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">{label}</h2>
            <span className="font-mono tabular-nums text-xs font-medium text-slate-400">
              ({items.length})
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => onAddInStage(stage)}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white whitespace-nowrap shrink-0"
          title={`Añadir en ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Añadir</span>
        </button>
      </div>

      {/* Lista ordenable de tarjetas */}
      <div className="flex-1 p-3 space-y-3">
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              channel={channelMap.get(item.channelId)}
              onEdit={onEditItem}
              onAdapt={onAdaptItem}
              onDelete={onDeleteItem}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 p-4 text-center">
            <Layers className="h-5 w-5 text-slate-600" />
            <p className="mt-2 text-xs text-slate-400">
              No hay tarjetas en «{label}» con los filtros actuales
            </p>
            <button
              type="button"
              onClick={() => onAddInStage(stage)}
              className="mt-2.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              + Crear pieza en {label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface KanbanViewProps {
  onNewItem: (stage: Stage) => void;
  onEditItem: (item: ContentItem) => void;
  onAdaptItem: (item: ContentItem) => void;
  onDeleteItem: (item: ContentItem) => void;
  onRequestPublishModal: (item: ContentItem) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
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
  const reorderStageItems = useContentStore((s) => s.reorderStageItems);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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

  const itemsByStage = React.useMemo(() => {
    const grouped: Record<Stage, ContentItem[]> = {
      idea: [],
      proceso: [],
      publicado: [],
    };
    filteredItems.forEach((item) => {
      grouped[item.etapa].push(item);
    });
    (Object.keys(grouped) as Stage[]).forEach((st) => {
      grouped[st].sort((a, b) => a.orden - b.orden);
    });
    return grouped;
  }, [filteredItems]);

  const activeItem = React.useMemo(
    () => items.find((i) => i.id === activeId) || null,
    [items, activeId]
  );

  const resolveTargetStage = (overId: string): Stage | null => {
    if (overId.startsWith('column-')) {
      return overId.replace('column-', '') as Stage;
    }
    const overItem = items.find((i) => i.id === overId);
    return overItem ? overItem.etapa : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by useDroppable and DragOverlay
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedId = String(active.id);
    const overId = String(over.id);

    const draggedItem = items.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    const targetStage = resolveTargetStage(overId);
    if (!targetStage) return;

    if (draggedItem.etapa !== targetStage) {
      if (targetStage === 'publicado') {
        onRequestPublishModal(draggedItem);
      } else {
        moveItemStage(draggedId, targetStage);
      }
      return;
    }

    // Reordenamiento dentro de la misma columna
    if (draggedId !== overId && !overId.startsWith('column-')) {
      const stageList = itemsByStage[targetStage];
      const oldIndex = stageList.findIndex((i) => i.id === draggedId);
      const newIndex = stageList.findIndex((i) => i.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(stageList, oldIndex, newIndex);
        reorderStageItems(
          targetStage,
          reordered.map((i) => i.id)
        );
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {STAGES.map((st) => (
            <KanbanColumn
              key={st.id}
              stage={st.id}
              label={st.label}
              description={st.description}
              items={itemsByStage[st.id]}
              channelMap={channelMap}
              onAddInStage={onNewItem}
              onEditItem={onEditItem}
              onAdaptItem={onAdaptItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="w-full max-w-sm rotate-1 opacity-95 shadow-2xl">
              <ContentCard
                item={activeItem}
                channel={channelMap.get(activeItem.channelId)}
                onEdit={() => {}}
                onAdapt={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
