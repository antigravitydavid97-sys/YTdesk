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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div
        className="animate-apple-sheet flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-[20px] bg-[var(--surface-elevated)] sm:rounded-[20px]"
        style={{ boxShadow: 'var(--sheet-shadow)' }}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

        <div className="flex items-center justify-between gap-4 px-6 py-4 hairline-b">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px]"
              style={{
                backgroundColor: 'rgba(255, 149, 0, 0.14)',
                color: 'var(--sys-orange)',
              }}
            >
              <Lightbulb strokeWidth={1.75} className="h-5 w-5" />
            </div>
            <div>
              <h2 id="ai-modal-title" className="hig-headline text-[var(--label)]">
                Generar ideas con IA
              </h2>
              <p className="hig-caption text-[var(--label-2)]">
                Propone 5 ideas para un canal y las añade a la columna Idea
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]"
            aria-label="Cerrar generador de ideas"
          >
            <X strokeWidth={1.75} className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label htmlFor="ai-channel" className="hig-subhead text-[var(--label)]">
                  Canal
                </label>
                <select
                  id="ai-channel"
                  value={channelId}
                  onChange={(e) => handleChannelChange(e.target.value)}
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
                <label htmlFor="ai-format" className="hig-subhead text-[var(--label)]">
                  Formato
                </label>
                <select
                  id="ai-format"
                  value={preferredFormat}
                  onChange={(e) => setPreferredFormat(e.target.value as ContentFormat)}
                  className="bg-transparent text-right hig-subhead font-medium text-[var(--accent)] focus:outline-none cursor-pointer"
                >
                  {FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id="ai-topic"
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tema o pregunta (ej. productividad en React 19)…"
                aria-label="Tema para generar ideas"
                className="apple-input hig-subhead min-h-[44px] flex-1 px-4 py-2"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim() || !selectedChannel}
                className="apple-press apple-focus inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[var(--accent)] px-5 py-2 hig-subhead font-semibold text-white disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 strokeWidth={1.75} className="h-4 w-4 animate-spin" />
                    <span>Generando…</span>
                  </>
                ) : (
                  <span>Proponer 5 ideas</span>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div
              className="flex items-start gap-2.5 rounded-[12px] p-3.5 hig-footnote"
              style={{
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                color: 'var(--sys-red)',
              }}
            >
              <AlertCircle strokeWidth={1.75} className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {generatedIdeas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="hig-caption font-semibold text-[var(--label-2)]">
                  Propuestas ({selectedIndices.length} de {generatedIdeas.length} seleccionadas)
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
                  className="hig-caption font-medium text-[var(--accent)] hover:underline"
                >
                  {selectedIndices.length === generatedIdeas.length
                    ? 'Deseleccionar todas'
                    : 'Seleccionar todas'}
                </button>
              </div>

              <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
                {generatedIdeas.map((idea, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIndex(idx)}
                      className="ios-row flex cursor-pointer items-start gap-3.5 p-4 transition-colors hover:bg-[var(--fill-hover)]"
                    >
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors"
                        style={{
                          backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                          border: isChecked ? 'none' : '1.5px solid var(--label-3)',
                        }}
                      >
                        {isChecked && (
                          <Check strokeWidth={2.25} className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="hig-subhead font-semibold text-[var(--label)]">
                          {idea.titulo}
                        </p>
                        <p className="mt-1 hig-footnote text-[var(--label-2)]">
                          {idea.descripcion}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 hig-caption text-[var(--label-2)]">
                          <span className="capitalize font-medium text-[var(--label)]">
                            {idea.formato}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Prioridad {idea.prioridad}</span>
                          {idea.etiquetas.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{idea.etiquetas.map((t) => `#${t}`).join(' ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 hairline-t">
          <button
            type="button"
            onClick={onClose}
            className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--fill)] px-4 py-2 hig-subhead font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
          >
            Cerrar
          </button>
          {generatedIdeas.length > 0 && (
            <button
              type="button"
              disabled={selectedIndices.length === 0}
              onClick={handleAddSelectedToBoard}
              style={{ backgroundColor: 'var(--sys-green)' }}
              className="apple-press apple-focus min-h-[44px] rounded-[10px] px-5 py-2 hig-subhead font-semibold text-white disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Añadir {selectedIndices.length} a Idea
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
