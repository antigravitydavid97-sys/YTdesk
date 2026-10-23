import React, { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Lightbulb,
  Plus,
  Trash2,
  RotateCcw,
  ArrowRight,
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
      {/* Fila superior: Resumen operativo y gestión de datos de ejemplo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Resumen operativo de producción
          </h2>
          <p className="text-xs text-slate-400">
            Estado en tiempo real de tus canales, entregas del mes y alertas de calendario
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {items.length > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Borrar datos de ejemplo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={restoreSampleData}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Cargar datos de ejemplo (3 canales, 8 tarjetas)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Indicadores principales (KPIs con tabular-nums) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ideas pendientes</span>
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-100">
            {stats.pendingIdeas.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            En banco de ideas listas para guionizar
          </p>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contenido en proceso</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-100">
            {stats.inProcess.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Piezas activas en guion, rodaje o edición
          </p>
        </div>

        <div className="rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Publicado este mes</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 font-mono tabular-nums text-3xl font-bold text-slate-100">
            {stats.publishedThisMonth.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Entregas completadas en el mes actual
          </p>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            stats.overdueItems.length > 0
              ? 'border-red-500/40 bg-red-950/15'
              : 'border-slate-800/90 bg-[#0E1422]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Alertas por fecha vencida</span>
            <AlertTriangle
              className={`h-4 w-4 ${
                stats.overdueItems.length > 0 ? 'text-red-400' : 'text-slate-500'
              }`}
            />
          </div>
          <p
            className={`mt-3 font-mono tabular-nums text-3xl font-bold ${
              stats.overdueItems.length > 0 ? 'text-red-400' : 'text-slate-100'
            }`}
          >
            {stats.overdueItems.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {stats.overdueItems.length > 0
              ? 'Requieren reprogramación o publicación'
              : 'Todo el calendario está al día'}
          </p>
        </div>
      </div>

      {/* Alertas de contenido con fecha vencida + Publicado por canal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Panel de Alertas Vencidas */}
        <section className="lg:col-span-6 flex flex-col rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Alertas de contenido con fecha vencida
              </h3>
            </div>
            <span className="font-mono tabular-nums text-xs text-slate-400">
              {stats.overdueItems.length} pendientes
            </span>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {stats.overdueItems.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500/80" />
                <p className="mt-2 text-xs font-medium text-slate-300">
                  Ningún contenido tiene fecha vencida
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Todas tus piezas planificadas están en fecha o ya publicadas.
                </p>
              </div>
            ) : (
              stats.overdueItems.map((item) => {
                const ch = channelMap.get(item.channelId);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-red-500/30 bg-[#131B2E] p-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        {ch && (
                          <>
                            <PlatformIcon
                              platform={ch.plataforma}
                              color={ch.color}
                              className="h-3.5 w-3.5 shrink-0"
                            />
                            <span
                              className="font-semibold"
                              style={{ color: ch.color }}
                            >
                              {ch.nombre}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                          </>
                        )}
                        <span className="font-mono tabular-nums font-semibold text-red-400">
                          Venció el {formatShortDateES(item.fechaPlanificada)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="mt-1 block truncate text-left text-sm font-semibold text-slate-100 hover:text-indigo-300"
                      >
                        {item.titulo}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItemDate(item.id, getTodayISO())}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0"
                      >
                        <CalendarClock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Mover a hoy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="inline-flex min-h-[36px] items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
                      >
                        Revisar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Panel de Publicado y Progreso por Canal */}
        <section className="lg:col-span-6 flex flex-col rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5">
            <h3 className="text-sm font-semibold text-slate-100">
              Publicado y carga de trabajo por canal
            </h3>
            <button
              type="button"
              onClick={() => setActiveView('canales')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              <span>Gestionar canales</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-4">
            {stats.byChannel.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 p-4 text-center">
                <p className="text-xs text-slate-400">
                  Aún no hay canales configurados.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('canales')}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Crear primer canal</span>
                </button>
              </div>
            ) : (
              stats.byChannel.map(({ channel, published, inProcess, ideas, total }) => {
                const pubPct = total > 0 ? Math.round((published / total) * 100) : 0;
                return (
                  <div
                    key={channel.id}
                    className="rounded-lg border border-slate-800/80 bg-[#131B2E] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <PlatformIcon
                          platform={channel.plataforma}
                          color={channel.color}
                          className="h-4 w-4 shrink-0"
                        />
                        <div>
                          <span className="text-sm font-semibold text-slate-100">
                            {channel.nombre}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">
                            {channel.handle}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums text-xs">
                        <span className="font-semibold text-emerald-400">
                          {published} publicados
                        </span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span className="text-slate-300">{total} total</span>
                      </div>
                    </div>

                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full transition-transform duration-150 origin-left"
                        style={{
                          backgroundColor: channel.color,
                          transform: `scaleX(${pubPct / 100})`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
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

      {/* Contenido en proceso activo */}
      <section className="rounded-xl border border-slate-800/90 bg-[#0E1422] p-5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Pipeline activo (En Proceso)
            </h3>
            <p className="text-xs text-slate-400">
              Piezas actualmente en fase de guion, grabación, edición o programadas
            </p>
          </div>
          <button
            type="button"
            onClick={onNewItem}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva pieza</span>
          </button>
        </div>

        {stats.inProcess.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No tienes piezas en la columna «En Proceso» ahora mismo.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stats.inProcess.map((item) => {
              const ch = channelMap.get(item.channelId);
              const done = item.checklist.filter((c) => c.hecho).length;
              const total = item.checklist.length;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onEditItem(item)}
                  className="flex flex-col justify-between rounded-lg border border-slate-800 bg-[#131B2E] p-4 text-left transition-colors hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-200">
                        {ch && (
                          <PlatformIcon
                            platform={ch.plataforma}
                            color={ch.color}
                            className="h-3.5 w-3.5"
                          />
                        )}
                        {ch?.nombre}
                      </span>
                      <span className="capitalize text-indigo-300">
                        {item.subEtapa || 'guion'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-100">
                      {item.titulo}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs text-slate-400 font-mono tabular-nums">
                    <span>Entrega: {formatShortDateES(item.fechaPlanificada)}</span>
                    <span>
                      Checklist: {done}/{total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="¿Borrar datos de ejemplo?"
        description="Se eliminarán los canales y las tarjetas actuales para que comiences desde cero con el gestor limpio."
        confirmLabel="Borrar datos"
        variant="danger"
        onConfirm={() => clearAllData()}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
