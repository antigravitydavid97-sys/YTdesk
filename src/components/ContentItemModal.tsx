import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  X,
  RefreshCw,
  CopyPlus,
} from 'lucide-react';
import {
  ChecklistItem,
  ContentFormat,
  ContentItem,
  Priority,
  Stage,
  SubStage,
} from '../types';
import { useContentStore } from '../store/useContentStore';
import {
  FORMATS,
  PLATFORMS,
  PRIORITIES,
  STAGES,
  SUB_STAGES,
} from '../utils/constants';
import { getTodayISO } from '../utils/dateUtils';

interface ContentItemModalProps {
  isOpen: boolean;
  initialItem?: ContentItem | null;
  defaultStage?: Stage;
  defaultDate?: string;
  onClose: () => void;
  onRequestAdapt?: (item: ContentItem) => void;
  onRequestDelete?: (item: ContentItem) => void;
}

export const ContentItemModal: React.FC<ContentItemModalProps> = ({
  isOpen,
  initialItem,
  defaultStage = 'idea',
  defaultDate,
  onClose,
  onRequestAdapt,
  onRequestDelete,
}) => {
  const channels = useContentStore((s) => s.channels);
  const templates = useContentStore((s) => s.templates);
  const addContentItem = useContentStore((s) => s.addContentItem);
  const updateContentItem = useContentStore((s) => s.updateContentItem);

  const [titulo, setTitulo] = useState('');
  const [channelId, setChannelId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [formato, setFormato] = useState<ContentFormat>('video largo');
  const [etapa, setEtapa] = useState<Stage>('idea');
  const [subEtapa, setSubEtapa] = useState<SubStage>('guion');
  const [prioridad, setPrioridad] = useState<Priority>('media');
  const [fechaPlanificada, setFechaPlanificada] = useState(getTodayISO());
  const [fechaPublicacion, setFechaPublicacion] = useState('');
  const [url, setUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [autoSyncTemplate, setAutoSyncTemplate] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialItem) {
      setTitulo(initialItem.titulo);
      setChannelId(initialItem.channelId);
      setDescripcion(initialItem.descripcion);
      setFormato(initialItem.formato);
      setEtapa(initialItem.etapa);
      setSubEtapa(initialItem.subEtapa || 'guion');
      setPrioridad(initialItem.prioridad);
      setFechaPlanificada(initialItem.fechaPlanificada || getTodayISO());
      setFechaPublicacion(initialItem.fechaPublicacion || getTodayISO());
      setUrl(initialItem.url || '');
      setEtiquetas([...initialItem.etiquetas]);
      setChecklist(initialItem.checklist.map((c) => ({ ...c })));
      setAutoSyncTemplate(false);
      setNotas(initialItem.notas);
    } else {
      const defaultCh = channels[0];
      const chId = defaultCh?.id || '';
      const platformConf = PLATFORMS.find((p) => p.id === defaultCh?.plataforma);
      const initialFmt: ContentFormat =
        platformConf?.defaultFormat || 'video largo';
      const tpl = templates.find((t) => t.formato === initialFmt);

      setTitulo('');
      setChannelId(chId);
      setDescripcion('');
      setFormato(initialFmt);
      setEtapa(defaultStage);
      setSubEtapa('guion');
      setPrioridad('media');
      setFechaPlanificada(defaultDate || getTodayISO());
      setFechaPublicacion(getTodayISO());
      setUrl('');
      setEtiquetas([]);
      setAutoSyncTemplate(true);
      setChecklist(
        tpl
          ? tpl.tareas.map((texto, idx) => ({
              id: `ck-init-${Date.now()}-${idx}`,
              texto,
              hecho: false,
            }))
          : []
      );
      setNotas('');
    }
    setTagInput('');
    setNewTaskText('');
  }, [isOpen, initialItem, defaultStage, defaultDate, channels, templates]);

  if (!isOpen) return null;

  const handleLoadFormatTemplate = (targetFormat: ContentFormat) => {
    const tpl = templates.find((t) => t.formato === targetFormat);
    if (!tpl) return;
    setChecklist(
      tpl.tareas.map((texto, idx) => ({
        id: `ck-tpl-${Date.now()}-${idx}`,
        texto,
        hecho: false,
      }))
    );
  };

  const handleFormatChange = (newFmt: ContentFormat) => {
    setFormato(newFmt);
    if (autoSyncTemplate && checklist.every((c) => !c.hecho)) {
      handleLoadFormatTemplate(newFmt);
    }
  };

  const handleAddTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!cleaned) return;
    if (!etiquetas.includes(cleaned)) {
      setEtiquetas([...etiquetas, cleaned]);
    }
    setTagInput('');
  };

  const handleAddChecklistTask = () => {
    if (!newTaskText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `ck-custom-${Date.now()}`,
        texto: newTaskText.trim(),
        hecho: false,
      },
    ]);
    setNewTaskText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !channelId) return;

    if (initialItem) {
      updateContentItem(initialItem.id, {
        titulo: titulo.trim(),
        channelId,
        descripcion: descripcion.trim(),
        formato,
        etapa,
        subEtapa: etapa === 'proceso' ? subEtapa : undefined,
        prioridad,
        fechaPlanificada,
        fechaPublicacion:
          etapa === 'publicado' ? fechaPublicacion || getTodayISO() : undefined,
        url: etapa === 'publicado' ? url.trim() : undefined,
        etiquetas,
        checklist,
        notas: notas.trim(),
      });
    } else {
      addContentItem({
        titulo: titulo.trim(),
        channelId,
        descripcion: descripcion.trim(),
        formato,
        etapa,
        subEtapa: etapa === 'proceso' ? subEtapa : undefined,
        prioridad,
        fechaPlanificada,
        fechaPublicacion:
          etapa === 'publicado' ? fechaPublicacion || getTodayISO() : undefined,
        url: etapa === 'publicado' ? url.trim() : undefined,
        etiquetas,
        checklist,
        notas: notas.trim(),
      });
    }
    onClose();
  };

  const completedTasks = checklist.filter((c) => c.hecho).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div
        className="animate-apple-sheet flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-[20px] bg-[var(--surface-elevated)] sm:rounded-[20px]"
        style={{ boxShadow: 'var(--sheet-shadow)' }}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

        {/* Cabecera estilo Hoja de iOS */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 hairline-b">
          <div>
            <h2 id="content-modal-title" className="hig-headline text-[var(--label)]">
              {initialItem ? 'Detalles del contenido' : 'Nueva pieza'}
            </h2>
            <p className="hig-caption text-[var(--label-2)]">
              Organiza canal, etapa, checklist de producción y notas
            </p>
          </div>

          <div className="flex items-center gap-2">
            {initialItem && onRequestAdapt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestAdapt(initialItem);
                }}
                className="apple-press apple-focus inline-flex min-h-[34px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--accent)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
              >
                <CopyPlus strokeWidth={1.75} className="h-3.5 w-3.5" />
                <span>Adaptar a otra red</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]"
              aria-label="Cerrar"
            >
              <X strokeWidth={1.75} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo en formato Listas Agrupadas Inset de iOS */}
        <form
          id="content-item-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Grupo 1: Título y Descripción */}
          <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
            <div className="ios-row px-4 py-3">
              <input
                id="item-title"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la pieza *"
                aria-label="Título del contenido"
                className="w-full bg-transparent hig-headline text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
              />
            </div>
            <div className="ios-row px-4 py-2.5">
              <textarea
                id="item-desc"
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción o gancho principal (0–3s)…"
                aria-label="Descripción"
                className="w-full resize-none bg-transparent hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
              />
            </div>
          </div>

          {/* Grupo 2: Metadatos estilo Ajustes de iOS (Etiqueta a la izquierda, Valor a la derecha) */}
          <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label htmlFor="item-channel" className="hig-subhead text-[var(--label)]">
                Canal
              </label>
              <select
                id="item-channel"
                required
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="bg-transparent text-right hig-subhead font-medium text-[var(--accent)] focus:outline-none cursor-pointer"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.nombre} ({ch.plataforma})
                  </option>
                ))}
              </select>
            </div>

            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label htmlFor="item-format" className="hig-subhead text-[var(--label)]">
                Formato
              </label>
              <select
                id="item-format"
                value={formato}
                onChange={(e) => handleFormatChange(e.target.value as ContentFormat)}
                className="bg-transparent text-right hig-subhead font-medium text-[var(--accent)] focus:outline-none cursor-pointer"
              >
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label htmlFor="item-stage" className="hig-subhead text-[var(--label)]">
                Etapa
              </label>
              <select
                id="item-stage"
                value={etapa}
                onChange={(e) => setEtapa(e.target.value as Stage)}
                className="bg-transparent text-right hig-subhead font-medium text-[var(--accent)] focus:outline-none cursor-pointer"
              >
                {STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {etapa === 'proceso' && (
              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label htmlFor="item-substage" className="hig-subhead text-[var(--label)]">
                  Sub-etapa
                </label>
                <select
                  id="item-substage"
                  value={subEtapa}
                  onChange={(e) => setSubEtapa(e.target.value as SubStage)}
                  className="bg-transparent text-right hig-subhead font-medium text-[var(--accent)] focus:outline-none cursor-pointer"
                >
                  {SUB_STAGES.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label htmlFor="item-priority" className="hig-subhead text-[var(--label)]">
                Prioridad
              </label>
              <select
                id="item-priority"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Priority)}
                className="bg-transparent text-right hig-subhead font-medium text-[var(--accent)] focus:outline-none cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label
                htmlFor="item-planned-date"
                className="hig-subhead text-[var(--label)]"
              >
                Fecha planificada
              </label>
              <input
                id="item-planned-date"
                type="date"
                value={fechaPlanificada}
                onChange={(e) => setFechaPlanificada(e.target.value)}
                className="bg-transparent text-right font-mono tabular-nums hig-subhead text-[var(--accent)] focus:outline-none"
              />
            </div>

            {/* Switch estilo iOS para sincronizar plantilla al cambiar formato */}
            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <span className="hig-subhead text-[var(--label)]">
                Aplicar plantilla al cambiar formato
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={autoSyncTemplate}
                onClick={() => setAutoSyncTemplate((v) => !v)}
                className="relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200"
                style={{
                  backgroundColor: autoSyncTemplate
                    ? 'var(--sys-green)'
                    : 'var(--label-3)',
                }}
                aria-label="Aplicar plantilla automáticamente al cambiar formato"
              >
                <span
                  className={`h-[24px] w-[24px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    autoSyncTemplate ? 'translate-x-[20px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Grupo opcional si Etapa === Publicado */}
          {etapa === 'publicado' && (
            <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label
                  htmlFor="item-pub-date"
                  className="hig-subhead text-[var(--label)]"
                >
                  Fecha de publicación
                </label>
                <input
                  id="item-pub-date"
                  type="date"
                  required
                  value={fechaPublicacion}
                  onChange={(e) => setFechaPublicacion(e.target.value)}
                  className="bg-transparent text-right font-mono tabular-nums hig-subhead text-[var(--sys-green)] focus:outline-none"
                />
              </div>
              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label htmlFor="item-pub-url" className="hig-subhead text-[var(--label)] shrink-0">
                  URL publicada
                </label>
                <input
                  id="item-pub-url"
                  type="url"
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-transparent text-right hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Grupo 3: Checklist de producción */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="hig-caption font-medium text-[var(--label-2)]">
                Checklist ({completedTasks}/{checklist.length})
              </span>
              <button
                type="button"
                onClick={() => handleLoadFormatTemplate(formato)}
                className="inline-flex items-center gap-1 hig-caption font-medium text-[var(--accent)] hover:underline"
              >
                <RefreshCw strokeWidth={1.75} className="h-3 w-3" />
                <span>Recargar plantilla «{formato}»</span>
              </button>
            </div>

            <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
              {checklist.map((ck) => (
                <div
                  key={ck.id}
                  className="ios-row flex min-h-[44px] items-center justify-between gap-3 px-4 py-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist(
                        checklist.map((item) =>
                          item.id === ck.id ? { ...item, hecho: !item.hecho } : item
                        )
                      )
                    }
                    className="flex flex-1 items-center gap-3 text-left hig-subhead text-[var(--label)]"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: ck.hecho ? 'var(--accent)' : 'transparent',
                        border: ck.hecho ? 'none' : '1.5px solid var(--label-3)',
                      }}
                    >
                      {ck.hecho && (
                        <Check strokeWidth={2.25} className="h-3 w-3 text-white" />
                      )}
                    </span>
                    <span
                      className={
                        ck.hecho ? 'line-through text-[var(--label-3)]' : ''
                      }
                    >
                      {ck.texto}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist(checklist.filter((item) => item.id !== ck.id))
                    }
                    className="p-1 text-[var(--label-3)] hover:text-[var(--sys-red)]"
                    aria-label="Eliminar tarea"
                  >
                    <Trash2 strokeWidth={1.75} className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="ios-row flex min-h-[44px] items-center gap-2 px-4 py-1.5">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistTask();
                    }
                  }}
                  placeholder="Añadir paso al checklist…"
                  className="flex-1 bg-transparent hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistTask}
                  className="apple-press inline-flex items-center gap-1 hig-footnote font-semibold text-[var(--accent)]"
                >
                  <Plus strokeWidth={1.75} className="h-4 w-4" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grupo 4: Etiquetas y Notas */}
          <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
            <div className="ios-row flex min-h-[46px] items-center gap-2 px-4 py-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Añadir etiqueta (ej. react, productividad)…"
                aria-label="Añadir etiqueta"
                className="flex-1 bg-transparent hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="hig-footnote font-semibold text-[var(--accent)]"
              >
                Añadir
              </button>
            </div>

            {etiquetas.length > 0 && (
              <div className="ios-row flex flex-wrap items-center gap-2 px-4 py-2.5 hig-footnote">
                {etiquetas.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEtiquetas(etiquetas.filter((t) => t !== tag))}
                    className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                    title="Clic para quitar etiqueta"
                  >
                    <span>#{tag}</span>
                    <X strokeWidth={1.75} className="h-3 w-3 text-[var(--label-3)]" />
                  </button>
                ))}
              </div>
            )}

            <div className="ios-row px-4 py-3">
              <textarea
                id="item-notes"
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas de producción, enlaces de referencia, minutaje o CTA…"
                aria-label="Notas de producción"
                className="w-full resize-none bg-transparent hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Pie del Sheet */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 hairline-t">
          <div>
            {initialItem && onRequestDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestDelete(initialItem);
                }}
                style={{ color: 'var(--sys-red)' }}
                className="apple-press apple-focus inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-4 py-2 hig-subhead font-medium whitespace-nowrap shrink-0"
              >
                <Trash2 strokeWidth={1.75} className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--fill)] px-4 py-2 hig-subhead font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="content-item-form"
              className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--accent)] px-5 py-2 hig-subhead font-semibold text-white whitespace-nowrap shrink-0"
            >
              {initialItem ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
