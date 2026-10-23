import React, { useState, useEffect } from 'react';
import { CopyPlus, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adapt-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#131B2E] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <CopyPlus className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="adapt-modal-title"
                className="text-base font-semibold text-slate-100"
              >
                Adaptar a otra red
              </h2>
              <p className="text-xs text-slate-400">
                Duplica título y notas en la columna Idea con plantilla adaptada
              </p>
            </div>
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
            <p className="text-xs text-slate-400">Pieza de origen</p>
            <p className="mt-0.5 text-sm font-medium text-slate-100">{item.titulo}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Selecciona el canal de destino
            </label>
            <div className="mt-2 space-y-2">
              {channels.map((ch) => {
                const isSelected = ch.id === targetChannelId;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChannelChange(ch.id)}
                    className={`flex min-h-[44px] w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-slate-100'
                        : 'border-slate-800 bg-[#0B0F17] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-sm font-medium">
                      <PlatformIcon
                        platform={ch.plataforma}
                        color={ch.color}
                        className="h-4 w-4 shrink-0"
                      />
                      <span>{ch.nombre}</span>
                      <span className="text-xs text-slate-400">· {ch.handle}</span>
                    </span>
                    {ch.id === item.channelId && (
                      <span className="text-xs text-slate-500">Mismo canal</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="adapt-format"
              className="block text-xs font-medium text-slate-300"
            >
              Formato en el canal de destino
            </label>
            <select
              id="adapt-format"
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as ContentFormat)}
              className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
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
              disabled={!targetChannelId}
              className="min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Crear adaptación en Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
