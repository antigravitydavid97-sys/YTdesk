import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { ContentFormat } from '../types';
import { useContentStore } from '../store/useContentStore';
import { DEFAULT_FORMAT_TEMPLATES, FORMATS } from '../utils/constants';

export const TemplatesView: React.FC = () => {
  const templates = useContentStore((s) => s.templates);
  const updateFormatTemplate = useContentStore((s) => s.updateFormatTemplate);

  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('video largo');
  const [newTaskText, setNewTaskText] = useState('');

  const currentTemplate = templates.find((t) => t.formato === selectedFormat) || {
    formato: selectedFormat,
    tareas: [],
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    updateFormatTemplate(selectedFormat, [
      ...currentTemplate.tareas,
      newTaskText.trim(),
    ]);
    setNewTaskText('');
  };

  const handleRemoveTask = (index: number) => {
    const next = currentTemplate.tareas.filter((_, idx) => idx !== index);
    updateFormatTemplate(selectedFormat, next);
  };

  const handleMoveTask = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentTemplate.tareas.length) return;
    const copy = [...currentTemplate.tareas];
    const [removed] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, removed);
    updateFormatTemplate(selectedFormat, copy);
  };

  const handleUpdateTaskText = (index: number, value: string) => {
    const copy = [...currentTemplate.tareas];
    copy[index] = value;
    updateFormatTemplate(selectedFormat, copy);
  };

  const handleResetFormatDefault = () => {
    const def = DEFAULT_FORMAT_TEMPLATES.find((t) => t.formato === selectedFormat);
    if (def) {
      updateFormatTemplate(selectedFormat, [...def.tareas]);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Selector de formato */}
        <aside className="lg:col-span-4 rounded-xl border border-slate-800/90 bg-[#0E1422] p-4">
          <h2 className="px-2 text-sm font-semibold text-slate-100">
            Formatos de contenido
          </h2>
          <p className="mt-0.5 px-2 text-xs text-slate-400">
            Personaliza el checklist por defecto que se aplica al crear o adaptar piezas
          </p>

          <div className="mt-3 space-y-1.5">
            {FORMATS.map((f) => {
              const tpl = templates.find((t) => t.formato === f.id);
              const count = tpl?.tareas.length || 0;
              const isSelected = selectedFormat === f.id;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFormat(f.id)}
                  className={`flex min-h-[44px] w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="capitalize font-semibold">{f.label}</span>
                  <span
                    className={`font-mono tabular-nums ${
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {count} pasos
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Editor de tareas de la plantilla seleccionada */}
        <section className="lg:col-span-8 rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <CheckSquare className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-semibold capitalize text-slate-100">
                  Plantilla: {selectedFormat}
                </h3>
                <p className="text-xs text-slate-400">
                  Estos pasos se cargarán automáticamente en cada nueva pieza de formato «{selectedFormat}»
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetFormatDefault}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar plantilla original</span>
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {currentTemplate.tareas.map((tarea, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#131B2E] p-2.5"
              >
                <span className="w-6 text-center font-mono tabular-nums text-xs text-slate-500">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={tarea}
                  onChange={(e) => handleUpdateTaskText(idx, e.target.value)}
                  aria-label={`Paso ${idx + 1}`}
                  className="min-h-[36px] flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm text-slate-100 focus:border-indigo-500 focus:bg-[#0B0F17] focus:outline-none"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveTask(idx, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
                    title="Subir paso"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentTemplate.tareas.length - 1}
                    onClick={() => handleMoveTask(idx, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
                    title="Bajar paso"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-red-400"
                    title="Eliminar paso"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {currentTemplate.tareas.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
                Esta plantilla no tiene tareas configuradas. Añade el primer paso abajo.
              </div>
            )}
          </div>

          <form onSubmit={handleAddTask} className="mt-4 flex gap-2.5">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={`Añadir nuevo paso a la plantilla de ${selectedFormat}...`}
              className="min-h-[44px] flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir paso</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
