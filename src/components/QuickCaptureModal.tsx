import React, { useState, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { FORMATS, PLATFORMS } from '../utils/constants';
import { ContentFormat } from '../types';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const channels = useContentStore((s) => s.channels);
  const quickCaptureIdea = useContentStore((s) => s.quickCaptureIdea);

  const [titulo, setTitulo] = useState('');
  const [channelId, setChannelId] = useState('');
  const [formato, setFormato] = useState<ContentFormat>('video largo');

  useEffect(() => {
    if (isOpen && channels.length > 0) {
      const defaultCh = channels[0];
      setChannelId(defaultCh.id);
      const p = PLATFORMS.find((pl) => pl.id === defaultCh.plataforma);
      setFormato(p?.defaultFormat || 'video largo');
      setTitulo('');
    }
  }, [isOpen, channels]);

  if (!isOpen) return null;

  const handleChannelChange = (newId: string) => {
    setChannelId(newId);
    const ch = channels.find((c) => c.id === newId);
    if (ch) {
      const p = PLATFORMS.find((pl) => pl.id === ch.plataforma);
      if (p) setFormato(p.defaultFormat);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !channelId) return;
    quickCaptureIdea(titulo.trim(), channelId, formato);
    setTitulo('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-capture-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#131B2E] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="quick-capture-title"
                className="text-base font-semibold text-slate-100"
              >
                Captura rápida de idea
              </h2>
              <p className="text-xs text-slate-400">
                Guarda al instante en la columna Idea · Atajo tecla N
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Cerrar captura rápida"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {channels.length === 0 ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Primero necesitas crear al menos un canal en la pestaña Canales para
            asignar ideas.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="quick-idea-title"
                className="block text-xs font-medium text-slate-300"
              >
                Título o gancho de la idea
              </label>
              <input
                id="quick-idea-title"
                type="text"
                required
                autoFocus
                placeholder="Ej. 5 errores al estructurar un proyecto React..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="quick-idea-channel"
                  className="block text-xs font-medium text-slate-300"
                >
                  Canal
                </label>
                <select
                  id="quick-idea-channel"
                  value={channelId}
                  onChange={(e) => handleChannelChange(e.target.value)}
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
                  htmlFor="quick-idea-format"
                  className="block text-xs font-medium text-slate-300"
                >
                  Formato
                </label>
                <select
                  id="quick-idea-format"
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as ContentFormat)}
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

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
              >
                Guardar idea
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
