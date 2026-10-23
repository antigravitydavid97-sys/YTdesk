import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Channel, Platform } from '../types';
import { useContentStore } from '../store/useContentStore';
import { CHANNEL_COLORS, PLATFORMS } from '../utils/constants';
import { PlatformIcon, getPlatformLabel } from '../components/PlatformIcon';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const ChannelsView: React.FC = () => {
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const addChannel = useContentStore((s) => s.addChannel);
  const updateChannel = useContentStore((s) => s.updateChannel);
  const deleteChannel = useContentStore((s) => s.deleteChannel);

  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [nombre, setNombre] = useState('');
  const [plataforma, setPlataforma] = useState<Platform>('youtube');
  const [handle, setHandle] = useState('');
  const [color, setColor] = useState(CHANNEL_COLORS[0]);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  const startEdit = (ch: Channel) => {
    setEditingChannel(ch);
    setNombre(ch.nombre);
    setPlataforma(ch.plataforma);
    setHandle(ch.handle);
    setColor(ch.color);
  };

  const resetForm = () => {
    setEditingChannel(null);
    setNombre('');
    setPlataforma('youtube');
    setHandle('');
    setColor(CHANNEL_COLORS[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const cleanHandle = handle.trim()
      ? handle.trim().startsWith('@')
        ? handle.trim()
        : `@${handle.trim()}`
      : `@${nombre.trim().toLowerCase().replace(/\s+/g, '')}`;

    if (editingChannel) {
      updateChannel(editingChannel.id, {
        nombre: nombre.trim(),
        plataforma,
        handle: cleanHandle,
        color,
      });
    } else {
      addChannel({
        nombre: nombre.trim(),
        plataforma,
        handle: cleanHandle,
        color,
      });
    }
    resetForm();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Formulario Crear / Editar Canal */}
        <section className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {editingChannel ? 'Editar canal' : 'Añadir nuevo canal'}
              </h2>
              <p className="text-xs text-slate-400">
                Puedes registrar múltiples canales por plataforma (ej. 2 de YouTube y 1 de TikTok)
              </p>
            </div>
            {editingChannel && (
              <button
                type="button"
                onClick={resetForm}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                title="Cancelar edición"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Plataforma
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => {
                  const active = plataforma === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlataforma(p.id)}
                      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-slate-800 bg-[#0B0F17] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <PlatformIcon platform={p.id} className="h-4 w-4" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="ch-name"
                className="block text-xs font-medium text-slate-300"
              >
                Nombre del canal *
              </label>
              <input
                id="ch-name"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Canal Principal YouTube / Canal Secundario Vlogs"
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ch-handle"
                className="block text-xs font-medium text-slate-300"
              >
                Handle / Usuario
              </label>
              <input
                id="ch-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@tucanal"
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Color identificador del canal
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                {CHANNEL_COLORS.map((hex) => {
                  const selected = color.toLowerCase() === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-transform ${
                        selected
                          ? 'scale-110 border-white ring-2 ring-indigo-500'
                          : 'border-slate-700 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={`Elegir color ${hex}`}
                    >
                      {selected && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-11 cursor-pointer rounded-lg border border-slate-700 bg-[#0B0F17] p-0.5"
                  title="Color personalizado"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {editingChannel && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>{editingChannel ? 'Guardar cambios' : 'Crear canal'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Listado de Canales Registrados */}
        <section className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Canales activos ({channels.length})
              </h2>
              <p className="text-xs text-slate-400">
                Haz clic en editar para cambiar el color, nombre o handle de cualquier canal
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {channels.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center">
                <p className="text-sm text-slate-300">
                  No hay canales creados todavía
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Utiliza el formulario de la izquierda para añadir tus canales de YouTube, TikTok o Instagram.
                </p>
              </div>
            ) : (
              channels.map((ch) => {
                const channelItems = items.filter((i) => i.channelId === ch.id);
                const publishedCount = channelItems.filter(
                  (i) => i.etapa === 'publicado'
                ).length;

                return (
                  <div
                    key={ch.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#131B2E] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10"
                        style={{ backgroundColor: `${ch.color}20`, color: ch.color }}
                      >
                        <PlatformIcon platform={ch.plataforma} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-100">
                            {ch.nombre}
                          </h3>
                          <span
                            className="font-mono text-xs font-medium"
                            style={{ color: ch.color }}
                          >
                            {ch.handle}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                          <span>{getPlatformLabel(ch.plataforma)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{channelItems.length} piezas</span>
                          <span aria-hidden="true">·</span>
                          <span>{publishedCount} publicadas</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(ch)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannelToDelete(ch)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 whitespace-nowrap shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={Boolean(channelToDelete)}
        title={`¿Eliminar el canal «${channelToDelete?.nombre}»?`}
        description="Al eliminar este canal también se eliminarán las tarjetas asociadas a él. Esta acción no se puede deshacer."
        confirmLabel="Eliminar canal"
        variant="danger"
        onConfirm={() => {
          if (channelToDelete) {
            deleteChannel(channelToDelete.id);
            if (editingChannel?.id === channelToDelete.id) {
              resetForm();
            }
          }
        }}
        onCancel={() => setChannelToDelete(null)}
      />
    </div>
  );
};
