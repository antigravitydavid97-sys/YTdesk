import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Calendar,
  List,
  LayoutDashboard,
  Tv,
  CheckSquare,
  Database,
  Plus,
  Lightbulb,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { ActiveView, ContentItem, Stage } from './types';
import { useContentStore } from './store/useContentStore';
import { FilterBar } from './components/FilterBar';
import { PlatformIcon } from './components/PlatformIcon';
import { KanbanView } from './views/KanbanView';
import { CalendarView } from './views/CalendarView';
import { ListView } from './views/ListView';
import { DashboardView } from './views/DashboardView';
import { ChannelsView } from './views/ChannelsView';
import { TemplatesView } from './views/TemplatesView';
import { ContentItemModal } from './components/ContentItemModal';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { AIIdeaGeneratorModal } from './components/AIIdeaGeneratorModal';
import { PublishModal } from './components/PublishModal';
import { AdaptModal } from './components/AdaptModal';
import { BackupModal } from './components/BackupModal';
import { ConfirmDialog } from './components/ConfirmDialog';

const NAV_ITEMS: { id: ActiveView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'kanban', label: 'Tablero Kanban', icon: Kanban },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'lista', label: 'Lista / Tabla', icon: List },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'canales', label: 'Canales', icon: Tv },
  { id: 'plantillas', label: 'Plantillas', icon: CheckSquare },
];

export default function App() {
  const activeView = useContentStore((s) => s.activeView);
  const setActiveView = useContentStore((s) => s.setActiveView);
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const filters = useContentStore((s) => s.filters);
  const setFilter = useContentStore((s) => s.setFilter);
  const moveItemStage = useContentStore((s) => s.moveItemStage);
  const deleteContentItem = useContentStore((s) => s.deleteContentItem);

  // Estados de modales
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [defaultModalStage, setDefaultModalStage] = useState<Stage>('idea');
  const [defaultModalDate, setDefaultModalDate] = useState<string | undefined>(undefined);

  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [publishCandidate, setPublishCandidate] = useState<ContentItem | null>(null);
  const [adaptCandidate, setAdaptCandidate] = useState<ContentItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ContentItem | null>(null);

  // Atajo de teclado global: N = nueva idea rápida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInputFocused) return;

      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setQuickCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCreateModal = (stage: Stage = 'idea', isoDate?: string) => {
    setEditingItem(null);
    setDefaultModalStage(stage);
    setDefaultModalDate(isoDate);
    setItemModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setDefaultModalStage(item.etapa);
    setDefaultModalDate(item.fechaPlanificada);
    setItemModalOpen(true);
  };

  const activeNavObj = NAV_ITEMS.find((n) => n.id === activeView) || NAV_ITEMS[0];
  const showFilterBar =
    activeView === 'kanban' ||
    activeView === 'calendario' ||
    activeView === 'lista' ||
    activeView === 'dashboard';

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100">
      {/* Sidebar Desktop (260px) */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-800/80 bg-[#0E1422] lg:flex">
        {/* Marca */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <button
            type="button"
            onClick={() => setActiveView('kanban')}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            ContentFlow
          </button>
          <span className="font-mono tabular-nums text-xs text-slate-400">
            {items.length} piezas
          </span>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Principal">
          <div className="space-y-1">
            {NAV_ITEMS.map((nav) => {
              const Icon = nav.icon;
              const isActive = activeView === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveView(nav.id)}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filtro directo por canal en el sidebar */}
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-semibold text-slate-400">
                Mis Canales ({channels.length})
              </span>
              <button
                type="button"
                onClick={() => setActiveView('canales')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Gestionar
              </button>
            </div>

            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setFilter('channelId', 'all')}
                className={`flex min-h-[38px] w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  filters.channelId === 'all'
                    ? 'bg-slate-800/90 font-semibold text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span>Todos los canales</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-400">
                  {items.length}
                </span>
              </button>

              {channels.map((ch) => {
                const isSelected = filters.channelId === ch.id;
                const count = items.filter((i) => i.channelId === ch.id).length;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setFilter('channelId', isSelected ? 'all' : ch.id);
                      if (activeView === 'canales' || activeView === 'plantillas') {
                        setActiveView('kanban');
                      }
                    }}
                    className={`flex min-h-[38px] w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-800 font-semibold text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <PlatformIcon
                        platform={ch.plataforma}
                        color={ch.color}
                        className="h-3.5 w-3.5 shrink-0"
                      />
                      <span className="truncate">{ch.nombre}</span>
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Pie del Sidebar: Backup JSON y Atajo */}
        <div className="border-t border-slate-800/80 p-3 space-y-2">
          <button
            type="button"
            onClick={() => setBackupModalOpen(true)}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-700/80 bg-[#0B0F17] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/60 whitespace-nowrap shrink-0"
          >
            <Database className="h-4 w-4 text-indigo-400" />
            <span>Exportar / Importar JSON</span>
          </button>
          <p className="text-center text-[11px] text-slate-500">
            Atajo rápido: pulsa <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">N</kbd> para nueva idea
          </p>
        </div>
      </aside>

      {/* Drawer Móvil */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#0E1422] p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-base font-bold text-white">ContentFlow</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((nav) => {
                const Icon = nav.icon;
                const isActive = activeView === nav.id;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => {
                      setActiveView(nav.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{nav.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setBackupModalOpen(true);
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs font-medium text-slate-200"
              >
                <Database className="h-4 w-4 text-indigo-400" />
                <span>Copia de Seguridad JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área principal de trabajo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Breadcrumb contextual a la izquierda, acciones primarias a la derecha */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-800/80 bg-[#0E1422]/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Abrir navegación"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-sm truncate">
              <span className="hidden text-slate-400 sm:inline">Espacio de trabajo</span>
              <span className="hidden text-slate-600 sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-100 truncate">
                {activeNavObj.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-indigo-500 whitespace-nowrap shrink-0"
            >
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Generar ideas con IA</span>
              <span className="sm:hidden">Ideas IA</span>
            </button>

            <button
              type="button"
              onClick={() => openCreateModal('idea')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-400 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva pieza</span>
            </button>
          </div>
        </header>

        {/* Barra de filtros combinables */}
        {showFilterBar && <FilterBar />}

        {/* Contenido de la vista activa */}
        <main className="flex-1 pb-20">
          {activeView === 'kanban' && (
            <KanbanView
              onNewItem={(stage) => openCreateModal(stage)}
              onEditItem={openEditModal}
              onAdaptItem={(item) => setAdaptCandidate(item)}
              onDeleteItem={(item) => setDeleteCandidate(item)}
              onRequestPublishModal={(item) => setPublishCandidate(item)}
            />
          )}

          {activeView === 'calendario' && (
            <CalendarView
              onNewItemOnDate={(isoDate) => openCreateModal('idea', isoDate)}
              onEditItem={openEditModal}
            />
          )}

          {activeView === 'lista' && (
            <ListView
              onNewItem={() => openCreateModal('idea')}
              onEditItem={openEditModal}
              onAdaptItem={(item) => setAdaptCandidate(item)}
              onDeleteItem={(item) => setDeleteCandidate(item)}
              onRequestPublishModal={(item) => setPublishCandidate(item)}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              onEditItem={openEditModal}
              onNewItem={() => openCreateModal('idea')}
            />
          )}

          {activeView === 'canales' && <ChannelsView />}

          {activeView === 'plantillas' && <TemplatesView />}
        </main>
      </div>

      {/* Botón flotante de Captura Rápida de Ideas (Accesible >= 44px) */}
      <button
        type="button"
        onClick={() => setQuickCaptureOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex min-h-[48px] items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-xl transition-transform duration-150 hover:scale-105 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-300 whitespace-nowrap shrink-0"
        title="Captura rápida de idea (Atajo: tecla N)"
      >
        <Zap className="h-4 w-4" />
        <span>Captura rápida</span>
        <kbd className="ml-1 hidden rounded bg-indigo-700/80 px-1.5 py-0.5 font-mono text-[10px] text-indigo-100 sm:inline">
          N
        </kbd>
      </button>

      {/* Modales globales */}
      <ContentItemModal
        isOpen={itemModalOpen}
        initialItem={editingItem}
        defaultStage={defaultModalStage}
        defaultDate={defaultModalDate}
        onClose={() => setItemModalOpen(false)}
        onRequestAdapt={(item) => setAdaptCandidate(item)}
        onRequestDelete={(item) => setDeleteCandidate(item)}
      />

      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />

      <AIIdeaGeneratorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <PublishModal
        item={publishCandidate}
        onClose={() => setPublishCandidate(null)}
        onConfirmPublish={(itemId, fechaPublicacion, url) => {
          moveItemStage(itemId, 'publicado', { fechaPublicacion, url });
        }}
      />

      <AdaptModal
        item={adaptCandidate}
        onClose={() => setAdaptCandidate(null)}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="¿Eliminar esta tarjeta de contenido?"
        description={`Se eliminará permanentemente «${deleteCandidate?.titulo || ''}». Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar tarjeta"
        variant="danger"
        onConfirm={() => {
          if (deleteCandidate) {
            deleteContentItem(deleteCandidate.id);
          }
        }}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
}
