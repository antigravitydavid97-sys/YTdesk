import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Tv } from 'lucide-react';
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
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Formulario estilo Ajustes de iOS (Lista Agrupada Inset) */}
        <section className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="hig-headline text-[var(--label)]">
              {editingChannel ? 'Editar canal' : 'Nuevo canal'}
            </h2>
            {editingChannel && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 hig-footnote text-[var(--accent)]"
              >
                <X strokeWidth={1.75} className="h-3.5 w-3.5" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Segmented Control de Plataforma */}
            <div className="grid grid-cols-3 gap-1 rounded-[10px] bg-[var(--fill)] p-1">
              {PLATFORMS.map((p) => {
                const active = plataforma === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlataforma(p.id)}
                    className={`apple-press apple-focus flex min-h-[36px] items-center justify-center gap-1.5 rounded-[8px] px-3 py-1.5 hig-footnote font-medium transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[var(--surface)] text-[var(--label)] shadow-xs'
                        : 'text-[var(--label-2)] hover:text-[var(--label)]'
                    }`}
                  >
                    <PlatformIcon platform={p.id} className="h-3.5 w-3.5" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filas agrupadas inset: Nombre, Handle y Paleta de 8 círculos de sistema */}
            <div className="ios-grouped-card">
              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label htmlFor="ch-name" className="hig-subhead text-[var(--label)] shrink-0">
                  Nombre
                </label>
                <input
                  id="ch-name"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Estudio Tech"
                  className="w-full bg-transparent text-right hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
                />
              </div>

              <div className="ios-row flex min-h-[46px] items-center justify-between gap-3 px-4 py-2">
                <label htmlFor="ch-handle" className="hig-subhead text-[var(--label)] shrink-0">
                  Handle
                </label>
                <input
                  id="ch-handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@usuario"
                  className="w-full bg-transparent text-right hig-subhead text-[var(--label)] placeholder-[var(--label-3)] focus:outline-none"
                />
              </div>

              <div className="ios-row px-4 py-3.5">
                <p className="hig-subhead text-[var(--label)]">
                  Color de sistema (8 tonos)
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {CHANNEL_COLORS.map((hex) => {
                    const selected = color.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setColor(hex)}
                        className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full transition-transform"
                        style={{
                          backgroundColor: hex,
                          transform: selected ? 'scale(1.12)' : 'scale(1)',
                        }}
                        aria-label={`Elegir color ${hex}`}
                      >
                        {selected && (
                          <Check strokeWidth={2.25} className="h-4 w-4 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="apple-press apple-focus flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--accent)] px-5 py-2.5 hig-subhead font-semibold text-white"
            >
              <Plus strokeWidth={1.75} className="h-4 w-4" />
              <span>{editingChannel ? 'Guardar cambios' : 'Añadir canal'}</span>
            </button>
          </form>
        </section>

        {/* Lista de Canales Registrados */}
        <section className="lg:col-span-7 space-y-2">
          <div className="px-1">
            <h2 className="hig-headline text-[var(--label)]">
              Mis canales ({channels.length})
            </h2>
          </div>

          <div className="ios-grouped-card">
            {channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <Tv strokeWidth={1.5} className="h-10 w-10 text-[var(--label-3)]" />
                <p className="mt-2.5 hig-subhead font-medium text-[var(--label-2)]">
                  No hay canales creados
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
                    className="ios-row flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: ch.color }}
                      />
                      <PlatformIcon
                        platform={ch.plataforma}
                        className="h-5 w-5 shrink-0 text-[var(--label-2)]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="hig-subhead font-semibold text-[var(--label)]">
                            {ch.nombre}
                          </h3>
                          <span className="font-mono hig-caption text-[var(--label-2)]">
                            {ch.handle}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 font-mono tabular-nums hig-caption text-[var(--label-2)]">
                          <span>{getPlatformLabel(ch.plataforma)}</span>
                          <span>·</span>
                          <span>{channelItems.length} piezas</span>
                          <span>·</span>
                          <span>{publishedCount} publicadas</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(ch)}
                        className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
                        aria-label={`Editar canal ${ch.nombre}`}
                      >
                        <Pencil strokeWidth={1.75} className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannelToDelete(ch)}
                        style={{ color: 'var(--sys-red)' }}
                        className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
                        aria-label={`Eliminar canal ${ch.nombre}`}
                      >
                        <Trash2 strokeWidth={1.75} className="h-3.5 w-3.5" />
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
        title={`¿Eliminar «${channelToDelete?.nombre}»?`}
        description="Se eliminarán también las piezas asociadas a este canal. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
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
