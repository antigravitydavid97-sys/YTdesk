import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-capture-title"
    >
      <div
        className="animate-apple-sheet w-full max-w-md rounded-t-[20px] bg-[var(--surface-elevated)] p-6 sm:rounded-[20px]"
        style={{ boxShadow: 'var(--sheet-shadow)' }}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

        <div className="flex items-center justify-between gap-4 pb-4 hairline-b">
          <div>
            <h2 id="quick-capture-title" className="hig-headline text-[var(--label)]">
              Nueva idea rápida
            </h2>
            <p className="hig-caption text-[var(--label-2)]">
              Se guarda directamente en la columna Idea · Atajo tecla N
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]"
            aria-label="Cerrar captura rápida"
          >
            <X strokeWidth={1.75} className="h-4 w-4" />
          </button>
        </div>

        {channels.length === 0 ? (
          <div className="mt-4 rounded-[12px] bg-[var(--fill)] p-4 hig-footnote text-[var(--label-2)]">
            Primero necesitas crear al menos un canal en la sección Canales.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              id="quick-idea-title"
              type="text"
              required
              autoFocus
              placeholder="Título o gancho de tu idea…"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              aria-label="Título de la idea"
              className="apple-input hig-body min-h-[46px] w-full px-4 py-2.5"
            />

            <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label
                  htmlFor="quick-idea-channel"
                  className="hig-subhead text-[var(--label)]"
                >
                  Canal
                </label>
                <select
                  id="quick-idea-channel"
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
                <label
                  htmlFor="quick-idea-format"
                  className="hig-subhead text-[var(--label)]"
                >
                  Formato
                </label>
                <select
                  id="quick-idea-format"
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as ContentFormat)}
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

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--fill)] px-4 py-2.5 hig-subhead font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--accent)] px-4 py-2.5 hig-subhead font-semibold text-white whitespace-nowrap shrink-0"
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
