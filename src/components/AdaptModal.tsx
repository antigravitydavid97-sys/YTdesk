import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { ContentFormat, ContentItem } from '../types';
import { useContentStore } from '../store/useContentStore';
import { FORMATS, PLATFORMS } from '../utils/constants';
import { PlatformIcon } from './PlatformIcon';

interface AdaptModalProps {
  item: ContentItem | null;
  onClose: () => void;
  onAdapted?: () => void;
}

export const AdaptModal: React.FC<AdaptModalProps> = ({
  item,
  onClose,
  onAdapted,
}) => {
  const channels = useContentStore((s) => s.channels);
  const adaptItemToChannel = useContentStore((s) => s.adaptItemToChannel);

  const [targetChannelId, setTargetChannelId] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<ContentFormat>('short');

  useEffect(() => {
    if (item && channels.length > 0) {
      const otherChannel =
        channels.find((c) => c.id !== item.channelId) || channels[0];
      setTargetChannelId(otherChannel.id);

      const platformConfig = PLATFORMS.find((p) => p.id === otherChannel.plataforma);
      setTargetFormat(platformConfig?.defaultFormat || 'short');
    }
  }, [item, channels]);

  if (!item) return null;

  const handleChannelChange = (channelId: string) => {
    setTargetChannelId(channelId);
    const ch = channels.find((c) => c.id === channelId);
    if (ch) {
      const platformConfig = PLATFORMS.find((p) => p.id === ch.plataforma);
      if (platformConfig) {
        setTargetFormat(platformConfig.defaultFormat);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChannelId) return;
    adaptItemToChannel(item.id, targetChannelId, targetFormat);
    onAdapted?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adapt-modal-title"
    >
      <div
        className="animate-apple-sheet w-full max-w-md rounded-t-[20px] bg-[var(--surface-elevated)] p-6 sm:rounded-[20px]"
        style={{ boxShadow: 'var(--sheet-shadow)' }}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

        <div className="flex items-center justify-between gap-4 pb-4 hairline-b">
          <div>
            <h2 id="adapt-modal-title" className="hig-headline text-[var(--label)]">
              Adaptar a otra red
            </h2>
            <p className="hig-caption text-[var(--label-2)]">
              Duplica título y notas en Idea con la plantilla del formato elegido
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
            <p className="hig-caption text-[var(--label-2)]">Origen</p>
            <p className="mt-0.5 hig-subhead font-semibold text-[var(--label)]">
              {item.titulo}
            </p>
          </div>

          <div>
            <p className="mb-1.5 px-1 hig-caption font-medium text-[var(--label-2)]">
              Canal de destino
            </p>
            <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
              {channels.map((ch) => {
                const isSelected = ch.id === targetChannelId;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChannelChange(ch.id)}
                    className="ios-row flex min-h-[46px] w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--fill-hover)]"
                  >
                    <span className="flex items-center gap-2.5 hig-subhead font-medium text-[var(--label)]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: ch.color }}
                      />
                      <PlatformIcon
                        platform={ch.plataforma}
                        className="h-4 w-4 shrink-0 text-[var(--label-2)]"
                      />
                      <span>{ch.nombre}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {ch.id === item.channelId && (
                        <span className="hig-caption text-[var(--label-3)]">Actual</span>
                      )}
                      {isSelected && (
                        <Check
                          strokeWidth={2}
                          className="h-4 w-4 text-[var(--accent)]"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
            <div className="ios-row flex min-h-[46px] items-center justify-between px-4 py-2">
              <label
                htmlFor="adapt-format"
                className="hig-subhead text-[var(--label)]"
              >
                Formato
              </label>
              <select
                id="adapt-format"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as ContentFormat)}
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
              disabled={!targetChannelId}
              className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--accent)] px-4 py-2.5 hig-subhead font-semibold text-white disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Duplicar en Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
