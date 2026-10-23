import React, { useState, useEffect } from 'react';
import { Lightbulb, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { generateIdeasWithAI, GeneratedIdeaDTO } from '../services/aiService';
import { getTodayISO } from '../utils/dateUtils';
import { FORMATS, PLATFORMS } from '../utils/constants';
import { ContentFormat } from '../types';

interface AIIdeaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIIdeaGeneratorModal: React.FC<AIIdeaGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const channels = useContentStore((s) => s.channels);
  const addContentItem = useContentStore((s) => s.addContentItem);

  const [channelId, setChannelId] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<ContentFormat>('video largo');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdeaDTO[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && channels.length > 0 && !channelId) {
      const first = channels[0];
      setChannelId(first.id);
      const p = PLATFORMS.find((pl) => pl.id === first.plataforma);
      if (p) setPreferredFormat(p.defaultFormat);
    }
  }, [isOpen, channels, channelId]);

  if (!isOpen) return null;

  const selectedChannel = channels.find((c) => c.id === channelId);

  const handleChannelChange = (id: string) => {
    setChannelId(id);
    const ch = channels.find((c) => c.id === id);
    if (ch) {
      const p = PLATFORMS.find((pl) => pl.id === ch.plataforma);
      if (p) setPreferredFormat(p.defaultFormat);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel || !topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const ideas = await generateIdeasWithAI({
        channelName: selectedChannel.nombre,
        platform: selectedChannel.plataforma,
        handle: selectedChannel.handle,
        topic: topic.trim(),
        preferredFormat,
      });
      setGeneratedIdeas(ideas);
      setSelectedIndices(ideas.map((_, idx) => idx));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al consultar la API de Gemini.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleIndex = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleAddSelectedToBoard = () => {
    if (!selectedChannel) return;
    selectedIndices.forEach((idx) => {
      const idea = generatedIdeas[idx];
      if (!idea) return;
      addContentItem({
        channelId: selectedChannel.id,
        titulo: idea.titulo,
        descripcion: idea.descripcion,
        formato: idea.formato,
        etapa: 'idea',
        prioridad: idea.prioridad,
        fechaPlanificada: getTodayISO(),
        etiquetas: idea.etiquetas,
        notas: idea.notas,
        useTemplateChecklist: true,
      });
    });
    setGeneratedIdeas([]);
    setTopic('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-slate-800 bg-[#131B2E] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="ai-modal-title"
                className="text-base font-semibold text-slate-100"
              >
                Generar ideas con IA (Gemini)
              </h2>
              <p className="text-xs text-slate-400">
                Propone 5 ideas estratégicas para un canal y tema y las añade a la columna Idea
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Cerrar generador de ideas"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ai-channel"
                  className="block text-xs font-medium text-slate-300"
                >
                  Canal objetivo
                </label>
                <select
                  id="ai-channel"
                  value={channelId}
                  onChange={(e) => handleChannelChange(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.nombre} ({ch.plataforma} · {ch.handle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ai-format"
                  className="block text-xs font-medium text-slate-300"
                >
                  Formato preferido
                </label>
                <select
                  id="ai-format"
                  value={preferredFormat}
                  onChange={(e) => setPreferredFormat(e.target.value as ContentFormat)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  {FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="ai-topic"
                className="block text-xs font-medium text-slate-300"
              >
                Tema, pregunta de tu audiencia o tendencia
              </label>
              <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
                <input
                  id="ai-topic"
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej. Optimización de rendimiento en React 19, productividad para devs..."
                  className="min-h-[44px] flex-1 rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !topic.trim() || !selectedChannel}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generando 5 ideas...</span>
                    </>
                  ) : (
                    <span>Proponer 5 ideas</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {generatedIdeas.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300">
                  Propuestas generadas ({selectedIndices.length} de {generatedIdeas.length}{' '}
                  seleccionadas)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndices(
                      selectedIndices.length === generatedIdeas.length
                        ? []
                        : generatedIdeas.map((_, i) => i)
                    )
                  }
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {selectedIndices.length === generatedIdeas.length
                    ? 'Deseleccionar todas'
                    : 'Seleccionar todas'}
                </button>
              </div>

              <div className="space-y-2.5">
                {generatedIdeas.map((idea, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIndex(idx)}
                      className={`cursor-pointer rounded-lg border p-3.5 transition-colors ${
                        isChecked
                          ? 'border-indigo-500/80 bg-[#0B0F17]'
                          : 'border-slate-800 bg-[#0B0F17]/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isChecked
                              ? 'border-indigo-500 bg-indigo-600 text-white'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-100">
                            {idea.titulo}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-300">
                            {idea.descripcion}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                            <span className="capitalize">{idea.formato}</span>
                            <span aria-hidden="true">·</span>
                            <span>Prioridad {idea.prioridad}</span>
                            {idea.etiquetas.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {idea.etiquetas.map((t) => `#${t}`).join(' ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            Cerrar
          </button>
          {generatedIdeas.length > 0 && (
            <button
              type="button"
              disabled={selectedIndices.length === 0}
              onClick={handleAddSelectedToBoard}
              className="min-h-[44px] rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Añadir {selectedIndices.length} a la columna Idea
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
