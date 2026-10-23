import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, X } from 'lucide-react';
import { ContentItem } from '../types';
import { getTodayISO } from '../utils/dateUtils';

interface PublishModalProps {
  item: ContentItem | null;
  onClose: () => void;
  onConfirmPublish: (itemId: string, fechaPublicacion: string, url: string) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  item,
  onClose,
  onConfirmPublish,
}) => {
  const [fechaPublicacion, setFechaPublicacion] = useState(getTodayISO());
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (item) {
      setFechaPublicacion(item.fechaPublicacion || getTodayISO());
      setUrl(item.url || '');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPublish(item.id, fechaPublicacion || getTodayISO(), url.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#131B2E] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2
              id="publish-modal-title"
              className="text-base font-semibold text-slate-100"
            >
              Registrar publicación
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Completa la fecha oficial y el enlace del contenido publicado
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-lg border border-slate-800/80 bg-[#0B0F17] p-3">
            <p className="text-xs text-slate-400">Contenido</p>
            <p className="mt-0.5 text-sm font-medium text-slate-100">{item.titulo}</p>
          </div>

          <div>
            <label
              htmlFor="pub-date"
              className="block text-xs font-medium text-slate-300"
            >
              Fecha de publicación
            </label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="pub-date"
                type="date"
                required
                value={fechaPublicacion}
                onChange={(e) => setFechaPublicacion(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] pl-9 pr-3 text-sm text-slate-100 font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="pub-url"
              className="block text-xs font-medium text-slate-300"
            >
              URL de la publicación (YouTube, TikTok o Instagram)
            </label>
            <div className="relative mt-1.5">
              <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="pub-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
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
              className="min-h-[44px] rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 whitespace-nowrap shrink-0"
            >
              Marcar como Publicado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
