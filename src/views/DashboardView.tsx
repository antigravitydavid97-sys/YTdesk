import React, { useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Lightbulb,
  Plus,
  Trash2,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Channel, ContentItem } from '../types';
import { useContentStore } from '../store/useContentStore';
import { filterContentItems } from '../utils/filterUtils';
import {
  formatShortDateES,
  getTodayISO,
  isDateOverdue,
  isSameMonthAndYear,
} from '../utils/dateUtils';
import { PlatformIcon } from '../components/PlatformIcon';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface DashboardViewProps {
  onEditItem: (item: ContentItem) => void;
  onNewItem: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onEditItem,
  onNewItem,
}) => {
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const filters = useContentStore((s) => s.filters);
  const moveItemDate = useContentStore((s) => s.moveItemDate);
  const setActiveView = useContentStore((s) => s.setActiveView);
  const clearAllData = useContentStore((s) => s.clearAllData);
  const restoreSampleData = useContentStore((s) => s.restoreSampleData);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const channelMap = React.useMemo(() => {
    const map = new Map<string, Channel>();
    channels.forEach((c) => map.set(c.id, c));
    return map;
  }, [channels]);

  const filteredItems = React.useMemo(
    () => filterContentItems(items, channels, filters),
    [items, channels, filters]
  );

  const stats = React.useMemo(() => {
    const pendingIdeas = filteredItems.filter((i) => i.etapa === 'idea');
    const inProcess = filteredItems.filter((i) => i.etapa === 'proceso');
    const publishedThisMonth = filteredItems.filter(
      (i) =>
        i.etapa === 'publicado' &&
        isSameMonthAndYear(i.fechaPublicacion || i.fechaPlanificada)
    );
    const overdueItems = filteredItems.filter((i) =>
      isDateOverdue(i.fechaPlanificada, i.etapa)
    );

    const byChannel = channels.map((ch) => {
      const chItems = filteredItems.filter((i) => i.channelId === ch.id);
      const published = chItems.filter((i) => i.etapa === 'publicado').length;
      const inProc = chItems.filter((i) => i.etapa === 'proceso').length;
      const ideas = chItems.filter((i) => i.etapa === 'idea').length;
      return {
        channel: ch,
        published,
        inProcess: inProc,
        ideas,
        total: chItems.length,
      };
    });

    return {
      pendingIdeas,
      inProcess,
      publishedThisMonth,
      overdueItems,
      byChannel,
    };
  }, [filteredItems, channels]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 4 Tarjetas Resumen estilo Apple Health / Tiempo de Uso */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="hig-footnote font-medium text-[var(--label-2)]">
              Ideas pendientes
            </span>
            <Lightbulb
              strokeWidth={1.75}
              className="h-4 w-4"
              style={{ color: 'var(--sys-orange)' }}
            />
          </div>
          <p className="mt-2 font-mono tabular-nums hig-large-title text-[var(--label)]">
            {stats.pendingIdeas.length}
          </p>
          <p className="mt-1 hig-caption text-[var(--label-2)]">
            En columna Idea listas para guion
          </p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="hig-footnote font-medium text-[var(--label-2)]">
              En proceso
            </span>
            <Clock
              strokeWidth={1.75}
              className="h-4 w-4"
              style={{ color: 'var(--sys-blue)' }}
            />
          </div>
          <p className="mt-2 font-mono tabular-nums hig-large-title text-[var(--label)]">
            {stats.inProcess.length}
          </p>
          <p className="mt-1 hig-caption text-[var(--label-2)]">
            Guion, grabación, edición o programado
          </p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="hig-footnote font-medium text-[var(--label-2)]">
              Publicado este mes
            </span>
            <CheckCircle2
              strokeWidth={1.75}
              className="h-4 w-4"
              style={{ color: 'var(--sys-green)' }}
            />
          </div>
          <p className="mt-2 font-mono tabular-nums hig-large-title text-[var(--label)]">
            {stats.publishedThisMonth.length}
          </p>
          <p className="mt-1 hig-caption text-[var(--label-2)]">
            Piezas completadas en el mes actual
          </p>
        </div>

        <div className="apple-card p-5">
          <div className="flex items-center justify-between">
            <span className="hig-footnote font-medium text-[var(--label-2)]">
              Alertas vencidas
            </span>
            <AlertCircle
              strokeWidth={1.75}
              className="h-4 w-4"
              style={{
                color:
                  stats.overdueItems.length > 0
                    ? 'var(--sys-red)'
                    : 'var(--label-3)',
              }}
            />
          </div>
          <p
            className="mt-2 font-mono tabular-nums hig-large-title"
            style={{
              color:
                stats.overdueItems.length > 0 ? 'var(--sys-red)' : 'var(--label)',
            }}
          >
            {stats.overdueItems.length}
          </p>
          <p className="mt-1 hig-caption text-[var(--label-2)]">
            {stats.overdueItems.length > 0
              ? 'Requieren reprogramación'
              : 'Calendario al día'}
          </p>
        </div>
      </div>

      {/* Dos columnas en escritorio: Alertas de contenido vencido y Publicado por canal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Alertas de fecha vencida */}
        <section className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="hig-headline text-[var(--label)]">
              Alertas de fecha vencida
            </h2>
            <span className="font-mono tabular-nums hig-footnote text-[var(--label-2)]">
              {stats.overdueItems.length}
            </span>
          </div>

          <div className="ios-grouped-card">
            {stats.overdueItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <CheckCircle2
                  strokeWidth={1.5}
                  className="h-9 w-9 text-[var(--label-3)]"
                />
                <p className="mt-2.5 hig-subhead font-medium text-[var(--label-2)]">
                  Todo tu contenido está en fecha
                </p>
              </div>
            ) : (
              stats.overdueItems.map((item) => {
                const ch = channelMap.get(item.channelId);
                return (
                  <div
                    key={item.id}
                    className="ios-row flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 hig-caption">
                        {ch && (
                          <>
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: ch.color }}
                            />
                            <PlatformIcon
                              platform={ch.plataforma}
                              className="h-3.5 w-3.5 text-[var(--label-2)]"
                            />
                            <span className="font-medium text-[var(--label-2)]">
                              {ch.nombre}
                            </span>
                            <span className="text-[var(--label-3)]">·</span>
                          </>
                        )}
                        <span
                          className="font-mono tabular-nums font-medium"
                          style={{ color: 'var(--sys-red)' }}
                        >
                          Venció {formatShortDateES(item.fechaPlanificada)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="mt-1 block truncate text-left hig-subhead font-semibold text-[var(--label)] hover:text-[var(--accent)]"
                      >
                        {item.titulo}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItemDate(item.id, getTodayISO())}
                        className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
                      >
                        <CalendarClock
                          strokeWidth={1.75}
                          className="h-3.5 w-3.5 text-[var(--accent)]"
                        />
                        <span>Hoy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="apple-press apple-focus inline-flex min-h-[36px] items-center rounded-[10px] bg-[var(--accent)] px-3 py-1.5 hig-footnote font-semibold text-white whitespace-nowrap shrink-0"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Publicado por canal */}
        <section className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="hig-headline text-[var(--label)]">
              Publicado por canal
            </h2>
            <button
              type="button"
              onClick={() => setActiveView('canales')}
              className="inline-flex items-center gap-0.5 hig-footnote font-medium text-[var(--accent)] hover:underline"
            >
              <span>Canales</span>
              <ChevronRight strokeWidth={1.75} className="h-4 w-4" />
            </button>
          </div>

          <div className="ios-grouped-card">
            {stats.byChannel.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="hig-subhead text-[var(--label-2)]">
                  Sin canales configurados
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('canales')}
                  className="apple-press mt-3 rounded-[10px] bg-[var(--fill)] px-4 py-2 hig-footnote font-medium text-[var(--accent)]"
                >
                  Añadir canal
                </button>
              </div>
            ) : (
              stats.byChannel.map(({ channel, published, inProcess, ideas, total }) => {
                const pubPct = total > 0 ? Math.round((published / total) * 100) : 0;
                return (
                  <div key={channel.id} className="ios-row p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: channel.color }}
                        />
                        <PlatformIcon
                          platform={channel.plataforma}
                          className="h-4 w-4 shrink-0 text-[var(--label-2)]"
                        />
                        <div>
                          <span className="hig-subhead font-semibold text-[var(--label)]">
                            {channel.nombre}
                          </span>
                          <span className="ml-2 hig-caption text-[var(--label-2)]">
                            {channel.handle}
                          </span>
                        </div>
                      </div>

                      <div className="font-mono tabular-nums hig-footnote">
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--sys-green)' }}
                        >
                          {published} pub.
                        </span>
                        <span className="mx-1 text-[var(--label-3)]">/</span>
                        <span className="text-[var(--label-2)]">{total}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 h-[4px] w-full overflow-hidden rounded-full bg-[var(--fill)]">
                      <div
                        className="h-full origin-left transition-transform duration-200"
                        style={{
                          backgroundColor: channel.color,
                          transform: `scaleX(${pubPct / 100})`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 font-mono tabular-nums hig-caption text-[var(--label-2)]">
                      <span>{ideas} ideas</span>
                      <span aria-hidden="true">·</span>
                      <span>{inProcess} en proceso</span>
                      <span aria-hidden="true">·</span>
                      <span>{published} publicados</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Piezas activas en proceso + botón de datos de demostración */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="hig-headline text-[var(--label)]">
            Contenido en proceso ({stats.inProcess.length})
          </h2>

          <div className="flex items-center gap-2">
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                style={{ color: 'var(--sys-red)' }}
                className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium whitespace-nowrap shrink-0"
              >
                <Trash2 strokeWidth={1.75} className="h-3.5 w-3.5" />
                <span>Borrar datos de ejemplo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={restoreSampleData}
                className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--accent)] whitespace-nowrap shrink-0"
              >
                <RotateCcw strokeWidth={1.75} className="h-3.5 w-3.5" />
                <span>Restaurar datos de ejemplo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNewItem}
              className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1 rounded-[10px] bg-[var(--accent)] px-3.5 py-1.5 hig-footnote font-semibold text-white whitespace-nowrap shrink-0"
            >
              <Plus strokeWidth={1.75} className="h-3.5 w-3.5" />
              <span>Nueva pieza</span>
            </button>
          </div>
        </div>

        <div className="ios-grouped-card">
          {stats.inProcess.length === 0 ? (
            <div className="py-10 text-center hig-subhead text-[var(--label-2)]">
              No hay contenido activo en proceso.
            </div>
          ) : (
            stats.inProcess.map((item) => {
              const ch = channelMap.get(item.channelId);
              const done = item.checklist.filter((c) => c.hecho).length;
              const total = item.checklist.length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onEditItem(item)}
                  className="ios-row flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-[var(--fill)]/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 hig-caption text-[var(--label-2)]">
                      {ch && (
                        <>
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: ch.color }}
                          />
                          <PlatformIcon
                            platform={ch.plataforma}
                            className="h-3.5 w-3.5"
                          />
                          <span className="font-medium">{ch.nombre}</span>
                          <span>·</span>
                        </>
                      )}
                      <span
                        className="capitalize font-medium"
                        style={{ color: 'var(--sys-blue)' }}
                      >
                        {item.subEtapa || 'guion'}
                      </span>
                    </div>
                    <p className="mt-1 truncate hig-subhead font-semibold text-[var(--label)]">
                      {item.titulo}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums hig-caption text-[var(--label-2)]">
                    <span>{formatShortDateES(item.fechaPlanificada)}</span>
                    <span>·</span>
                    <span>
                      {done}/{total}
                    </span>
                    <ChevronRight
                      strokeWidth={1.75}
                      className="h-4 w-4 text-[var(--label-3)]"
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="¿Borrar datos de ejemplo?"
        description="Se eliminarán los canales y tarjetas actuales para dejar el espacio limpio."
        confirmLabel="Borrar datos"
        variant="danger"
        onConfirm={() => clearAllData()}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
