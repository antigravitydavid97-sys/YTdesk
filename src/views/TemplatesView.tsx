import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
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
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Lista lateral de formatos estilo Ajustes de macOS/iPadOS */}
        <aside className="lg:col-span-4 space-y-2">
          <div className="px-1">
            <h2 className="hig-headline text-[var(--label)]">Formatos</h2>
          </div>

          <div className="ios-grouped-card p-1.5 space-y-0.5">
            {FORMATS.map((f) => {
              const tpl = templates.find((t) => t.formato === f.id);
              const count = tpl?.tareas.length || 0;
              const isSelected = selectedFormat === f.id;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFormat(f.id)}
                  className={`apple-press flex min-h-[42px] w-full items-center justify-between rounded-[10px] px-3.5 py-2 text-left hig-subhead transition-colors ${
                    isSelected
                      ? 'bg-[var(--fill)] font-semibold text-[var(--label)]'
                      : 'text-[var(--label-2)] hover:bg-[var(--fill)]/50 hover:text-[var(--label)]'
                  }`}
                >
                  <span className="capitalize">{f.label}</span>
                  <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Panel de pasos de la plantilla seleccionada */}
        <section className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h3 className="hig-headline capitalize text-[var(--label)]">
                Checklist para {selectedFormat}
              </h3>
              <p className="hig-caption text-[var(--label-2)]">
                Se asigna automáticamente al crear o adaptar piezas de este formato
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFormatDefault}
              className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--accent)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
            >
              <RotateCcw strokeWidth={1.75} className="h-3.5 w-3.5" />
              <span>Restaurar por defecto</span>
            </button>
          </div>

          <div className="ios-grouped-card">
            {currentTemplate.tareas.map((tarea, idx) => (
              <div
                key={idx}
                className="ios-row flex min-h-[46px] items-center gap-2 px-4 py-1.5"
              >
                <span className="w-5 font-mono tabular-nums hig-caption text-[var(--label-3)]">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={tarea}
                  onChange={(e) => handleUpdateTaskText(idx, e.target.value)}
                  aria-label={`Paso ${idx + 1}`}
                  className="flex-1 bg-transparent hig-subhead text-[var(--label)] focus:outline-none"
                />
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveTask(idx, -1)}
                    className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] disabled:opacity-30"
                    title="Subir paso"
                    aria-label="Subir paso"
                  >
                    <ArrowUp strokeWidth={1.75} className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentTemplate.tareas.length - 1}
                    onClick={() => handleMoveTask(idx, 1)}
                    className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] disabled:opacity-30"
                    title="Bajar paso"
                    aria-label="Bajar paso"
                  >
                    <ArrowDown strokeWidth={1.75} className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="apple-press flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--label-2)] hover:bg-[var(--fill)] hover:text-[var(--sys-red)]"
                    title="Eliminar paso"
                    aria-label="Eliminar paso"
                  >
                    <Trash2 strokeWidth={1.75} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <form
              onSubmit={handleAddTask}
              className="ios-row flex min-h-[48px] items-center gap-2 px-4 py-2"
            >
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder={`Añadir nuevo paso a «${selectedFormat}»…`}
                className="flex-1 bg-transparent hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
              />
              <button
                type="submit"
                className="apple-press inline-flex items-center gap-1 hig-footnote font-semibold text-[var(--accent)] whitespace-nowrap shrink-0"
              >
                <Plus strokeWidth={1.75} className="h-4 w-4" />
                <span>Añadir paso</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
