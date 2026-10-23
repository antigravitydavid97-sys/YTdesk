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
import { Plus, Inbox } from 'lucide-react';
import { Channel, ContentItem, Stage } from '../types';
import { useContentStore } from '../store/useContentStore';
import { STAGES } from '../utils/constants';
import { filterContentItems } from '../utils/filterUtils';
import { ContentCard } from '../components/ContentCard';
import { getStageSystemColor } from '../components/PlatformIcon';

interface KanbanColumnProps {
  stage: Stage;
  label: string;
  items: ContentItem[];
  channelMap: Map<string, Channel>;
  onAddInStage: (stage: Stage) => void;
  onEditItem: (item: ContentItem) => void;
  onAdaptItem: (item: ContentItem) => void;
  onDeleteItem: (item: ContentItem) => void;
  onRequestPublishModal: (item: ContentItem) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  label,
  items,
  channelMap,
  onAddInStage,
  onEditItem,
  onAdaptItem,
  onDeleteItem,
  onRequestPublishModal,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
    data: {
      type: 'Column',
      stage,
    },
  });

  const dotColor = getStageSystemColor(stage);

  return (
    <section
      ref={setNodeRef}
      aria-label={`Columna ${label}`}
      className={`flex min-h-[480px] flex-col rounded-[16px] p-1 transition-colors duration-200 ${
        isOver ? 'bg-[var(--fill)]' : 'bg-transparent'
      }`}
    >
      {/* Cabecera de columna sin caja: punto de color de etapa, título, contador y botón + */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <h2 className="hig-headline text-[var(--label)]">{label}</h2>
          <span className="font-mono tabular-nums hig-footnote text-[var(--label-2)]">
            {items.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddInStage(stage)}
          className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:bg-[var(--fill-hover)] hover:text-[var(--label)]"
          title={`Añadir en ${label}`}
          aria-label={`Añadir contenido en ${label}`}
        >
          <Plus strokeWidth={1.75} className="h-4 w-4" />
        </button>
      </div>

      {/* Lista de tarjetas con separación por aire */}
      <div className="flex-1 space-y-3">
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
              onRequestPublish={onRequestPublishModal}
            />
          ))}
        </SortableContext>

        {/* Estado vacío Apple HIG: icono grande en gris, título y una sola acción */}
        {items.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center rounded-[14px] bg-[var(--surface)]/50 p-6 text-center">
            <Inbox
              strokeWidth={1.5}
              className="h-9 w-9 text-[var(--label-3)]"
            />
            <p className="mt-2.5 hig-subhead font-medium text-[var(--label-2)]">
              Sin tarjetas en {label}
            </p>
            <button
              type="button"
              onClick={() => onAddInStage(stage)}
              className="apple-press apple-focus mt-3 rounded-[10px] bg-[var(--fill)] px-3.5 py-1.5 hig-footnote font-medium text-[var(--accent)] hover:bg-[var(--fill-hover)]"
            >
              Añadir en {label}
            </button>
          </div>
        )}
      </div>
    </section>
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

  const handleDragOver = (_event: DragOverEvent) => {};

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {STAGES.map((st) => (
            <KanbanColumn
              key={st.id}
              stage={st.id}
              label={st.label}
              items={itemsByStage[st.id]}
              channelMap={channelMap}
              onAddInStage={onNewItem}
              onEditItem={onEditItem}
              onAdaptItem={onAdaptItem}
              onDeleteItem={onDeleteItem}
              onRequestPublishModal={onRequestPublishModal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="apple-card-dragging w-full max-w-sm rounded-[14px]">
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
