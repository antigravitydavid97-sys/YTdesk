import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
    >
      <div
        className="animate-apple-sheet w-full max-w-md rounded-t-[20px] bg-[var(--surface-elevated)] p-6 sm:rounded-[20px]"
        style={{ boxShadow: 'var(--sheet-shadow)' }}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

        <div className="flex items-center justify-between gap-4 pb-4 hairline-b">
          <div>
            <h2 id="publish-modal-title" className="hig-headline text-[var(--label)]">
              Registrar publicación
            </h2>
            <p className="hig-caption text-[var(--label-2)]">
              Confirma la fecha y el enlace del contenido publicado
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]"
            aria-label="Cerrar"
          >
            <X strokeWidth={1.75} className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-[12px] bg-[var(--fill)] p-3.5">
            <p className="hig-caption text-[var(--label-2)]">Pieza</p>
            <p className="mt-0.5 hig-subhead font-semibold text-[var(--label)]">
              {item.titulo}
            </p>
          </div>

          <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label
                htmlFor="pub-date"
                className="hig-subhead text-[var(--label)] shrink-0"
              >
                Fecha
              </label>
              <input
                id="pub-date"
                type="date"
                required
                value={fechaPublicacion}
                onChange={(e) => setFechaPublicacion(e.target.value)}
                className="bg-transparent text-right font-mono tabular-nums hig-subhead text-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
              <label
                htmlFor="pub-url"
                className="hig-subhead text-[var(--label)] shrink-0"
              >
                Enlace URL
              </label>
              <input
                id="pub-url"
                type="url"
                placeholder="https://youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent text-right hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
              />
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
              style={{ backgroundColor: 'var(--sys-green)' }}
              className="apple-press apple-focus min-h-[44px] rounded-[10px] px-4 py-2.5 hig-subhead font-semibold text-white whitespace-nowrap shrink-0"
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
