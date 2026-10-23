import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
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
    // Si es una tarjeta nueva y ningún ítem del checklist está completado, recargamos la plantilla automáticamente
    if (!initialItem && checklist.every((c) => !c.hecho)) {
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
        fechaPublicacion: etapa === 'publicado' ? fechaPublicacion || getTodayISO() : undefined,
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
        fechaPublicacion: etapa === 'publicado' ? fechaPublicacion || getTodayISO() : undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-slate-800 bg-[#131B2E] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div>
            <h2
              id="content-modal-title"
              className="text-base font-semibold text-slate-100"
            >
              {initialItem ? 'Editar pieza de contenido' : 'Nueva pieza de contenido'}
            </h2>
            <p className="text-xs text-slate-400">
              Configura canal, formato, etapa, checklist de producción y notas
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
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <CopyPlus className="h-3.5 w-3.5 text-indigo-400" />
                <span>Adaptar a otra red</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          id="content-item-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Título */}
          <div>
            <label
              htmlFor="item-title"
              className="block text-xs font-medium text-slate-300"
            >
              Título del contenido *
            </label>
            <input
              id="item-title"
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Cómo estructurar estado global en React con TypeScript"
              className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Canal, Formato y Prioridad */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="item-channel"
                className="block text-xs font-medium text-slate-300"
              >
                Canal *
              </label>
              <select
                id="item-channel"
                required
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.nombre} ({ch.plataforma})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="item-format"
                className="block text-xs font-medium text-slate-300"
              >
                Formato
              </label>
              <select
                id="item-format"
                value={formato}
                onChange={(e) => handleFormatChange(e.target.value as ContentFormat)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="item-priority"
                className="block text-xs font-medium text-slate-300"
              >
                Prioridad
              </label>
              <select
                id="item-priority"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Priority)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Etapa, Sub-etapa y Fecha Planificada */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="item-stage"
                className="block text-xs font-medium text-slate-300"
              >
                Etapa del flujo
              </label>
              <select
                id="item-stage"
                value={etapa}
                onChange={(e) => setEtapa(e.target.value as Stage)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {etapa === 'proceso' ? (
              <div>
                <label
                  htmlFor="item-substage"
                  className="block text-xs font-medium text-slate-300"
                >
                  Sub-etapa (En Proceso)
                </label>
                <select
                  id="item-substage"
                  value={subEtapa}
                  onChange={(e) => setSubEtapa(e.target.value as SubStage)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  {SUB_STAGES.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden sm:block" />
            )}

            <div>
              <label
                htmlFor="item-planned-date"
                className="block text-xs font-medium text-slate-300"
              >
                Fecha planificada
              </label>
              <input
                id="item-planned-date"
                type="date"
                value={fechaPlanificada}
                onChange={(e) => setFechaPlanificada(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Campos adicionales cuando está en "Publicado" */}
          {etapa === 'publicado' && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="item-pub-date"
                  className="block text-xs font-medium text-emerald-300"
                >
                  Fecha de publicación *
                </label>
                <input
                  id="item-pub-date"
                  type="date"
                  required
                  value={fechaPublicacion}
                  onChange={(e) => setFechaPublicacion(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 font-mono tabular-nums focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="item-pub-url"
                  className="block text-xs font-medium text-emerald-300"
                >
                  URL del contenido publicado
                </label>
                <input
                  id="item-pub-url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label
              htmlFor="item-desc"
              className="block text-xs font-medium text-slate-300"
            >
              Descripción / Gancho principal
            </label>
            <textarea
              id="item-desc"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Resumen del enfoque o promesa principal de la pieza..."
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B0F17] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Checklist de producción */}
          <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Checklist de producción
                </span>
                <span className="font-mono tabular-nums text-xs text-slate-400">
                  ({completedTasks}/{checklist.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleLoadFormatTemplate(formato)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Cargar plantilla de «{formato}»</span>
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {checklist.map((ck) => (
                <div
                  key={ck.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-800/80 bg-[#131B2E]/60 px-3 py-2"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={ck.hecho}
                      onChange={() =>
                        setChecklist(
                          checklist.map((item) =>
                            item.id === ck.id ? { ...item, hecho: !item.hecho } : item
                          )
                        )
                      }
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={ck.hecho ? 'line-through text-slate-500' : ''}>
                      {ck.texto}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setChecklist(checklist.filter((item) => item.id !== ck.id))
                    }
                    className="p-1 text-slate-500 hover:text-red-400"
                    aria-label="Eliminar tarea"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
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
                placeholder="Añadir paso al checklist..."
                className="min-h-[38px] flex-1 rounded-lg border border-slate-800 bg-[#131B2E] px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklistTask}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Etiquetas
            </label>
            <div className="mt-1.5 flex gap-2">
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
                placeholder="Añadir etiqueta y pulsar Enter (ej. tutorial)..."
                className="min-h-[40px] flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="min-h-[40px] rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                Añadir etiqueta
              </button>
            </div>
            {etiquetas.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                {etiquetas.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEtiquetas(etiquetas.filter((t) => t !== tag))}
                    className="inline-flex items-center gap-1 rounded border border-slate-800 bg-[#0B0F17] px-2 py-1 text-xs text-slate-300 hover:border-red-500/40 hover:text-red-300"
                    title="Clic para quitar etiqueta"
                  >
                    <span>#{tag}</span>
                    <X className="h-3 w-3 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notas de producción */}
          <div>
            <label
              htmlFor="item-notes"
              className="block text-xs font-medium text-slate-300"
            >
              Notas de producción, enlaces de referencia o guion
            </label>
            <textarea
              id="item-notes"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Apuntes de rodaje, enlaces a recursos, minutaje, llamadas a la acción..."
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B0F17] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 px-6 py-4">
          <div>
            {initialItem && onRequestDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestDelete(initialItem);
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="content-item-form"
              className="min-h-[44px] rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
            >
              {initialItem ? 'Guardar cambios' : 'Crear contenido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
