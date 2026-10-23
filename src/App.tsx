import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Calendar,
  List,
  LayoutDashboard,
  Tv,
  CheckSquare,
  SlidersHorizontal,
  Plus,
  Lightbulb,
  Zap,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { ActiveView, ContentItem, Stage, ThemePreference } from './types';
import { useContentStore } from './store/useContentStore';
import { useAppleThemeSync } from './utils/themeUtils';
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
import {
  HeaderAuthControl,
  SidebarAuthProfile,
} from './components/ClerkAuthSection';
import { AuthView, AuthMode } from './views/AuthView';

const SIDEBAR_ITEMS: {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'kanban', label: 'Tablero Kanban', icon: Kanban },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'lista', label: 'Lista', icon: List },
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'canales', label: 'Canales', icon: Tv },
  { id: 'plantillas', label: 'Plantillas', icon: CheckSquare },
];

const WORKSPACE_TABS: { id: ActiveView; label: string }[] = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'lista', label: 'Lista' },
];

function getInitialAuthModeFromUrl(): AuthMode | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path === '/sign-in' || path.startsWith('/sign-in/')) return 'sign-in';
  if (path === '/sign-up' || path.startsWith('/sign-up/')) return 'sign-up';
  return null;
}

export default function App() {
  const activeView = useContentStore((s) => s.activeView);
  const setActiveView = useContentStore((s) => s.setActiveView);
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const filters = useContentStore((s) => s.filters);
  const setFilter = useContentStore((s) => s.setFilter);
  const moveItemStage = useContentStore((s) => s.moveItemStage);
  const deleteContentItem = useContentStore((s) => s.deleteContentItem);
  const themePreference = useContentStore((s) => s.themePreference);
  const setThemePreference = useContentStore((s) => s.setThemePreference);

  // Sincronización en vivo del tema Claro / Oscuro / Automático
  useAppleThemeSync(themePreference);

  // Pantalla de acceso (/sign-in y /sign-up)
  const [authScreenMode, setAuthScreenMode] = useState<AuthMode | null>(() =>
    getInitialAuthModeFromUrl()
  );

  useEffect(() => {
    const handlePopState = () => {
      setAuthScreenMode(getInitialAuthModeFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openAuthScreen = (mode: AuthMode = 'sign-in') => {
    setAuthScreenMode(mode);
    const targetPath = mode === 'sign-in' ? '/sign-in' : '/sign-up';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const closeAuthScreen = () => {
    setAuthScreenMode(null);
    if (
      window.location.pathname.startsWith('/sign-in') ||
      window.location.pathname.startsWith('/sign-up')
    ) {
      window.history.pushState({}, '', '/');
    }
  };

  // Contracción de Large Title al hacer scroll
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Estados de modales (Sheets)
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
      if (authScreenMode !== null) return;
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
  }, [authScreenMode]);

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

  const cycleThemePreference = () => {
    const order: ThemePreference[] = ['auto', 'light', 'dark'];
    const next = order[(order.indexOf(themePreference) + 1) % order.length];
    setThemePreference(next);
  };

  const themeBadgeLabel: Record<ThemePreference, string> = {
    auto: 'Tema Automático',
    light: 'Tema Claro',
    dark: 'Tema Oscuro',
  };

  const activeNavObj =
    SIDEBAR_ITEMS.find((n) => n.id === activeView) || SIDEBAR_ITEMS[0];

  const isWorkspaceView =
    activeView === 'kanban' ||
    activeView === 'calendario' ||
    activeView === 'lista';

  const showFilterBar = isWorkspaceView || activeView === 'dashboard';

  if (authScreenMode !== null) {
    return (
      <AuthView
        initialMode={authScreenMode}
        onModeChange={(mode) => openAuthScreen(mode)}
        onBackToApp={closeAuthScreen}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--label)]">
      {/* Barra lateral estilo macOS Finder / Ajustes en Escritorio */}
      <aside className="apple-glass hairline-r sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col lg:flex">
        {/* Marca */}
        <div className="flex h-14 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => setActiveView('kanban')}
            className="apple-focus rounded-[6px] hig-headline font-bold tracking-tight text-[var(--label)] whitespace-nowrap shrink-0"
          >
            ContentFlow
          </button>
          <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
            {items.length}
          </span>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3" aria-label="Principal">
          <div className="space-y-0.5">
            <p className="mb-1.5 px-3 hig-caption font-semibold text-[var(--label-2)]">
              Vistas
            </p>
            {SIDEBAR_ITEMS.map((nav) => {
              const Icon = nav.icon;
              const isActive = activeView === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveView(nav.id)}
                  className={`apple-press apple-focus flex min-h-[38px] w-full items-center gap-2.5 rounded-[10px] px-3 py-2 hig-subhead transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[var(--fill)] font-semibold text-[var(--label)]'
                      : 'text-[var(--label-2)] hover:bg-[var(--fill)]/50 hover:text-[var(--label)]'
                  }`}
                >
                  <Icon
                    strokeWidth={1.75}
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-[var(--accent)]' : 'text-[var(--label-2)]'
                    }`}
                  />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </div>

          {/* Lista de Canales en barra lateral */}
          <div>
            <div className="mb-1.5 flex items-center justify-between px-3">
              <span className="hig-caption font-semibold text-[var(--label-2)]">
                Canales
              </span>
              <button
                type="button"
                onClick={() => setActiveView('canales')}
                className="hig-caption font-medium text-[var(--accent)] hover:underline"
              >
                Editar
              </button>
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setFilter('channelId', 'all')}
                className={`apple-press flex min-h-[36px] w-full items-center justify-between rounded-[10px] px-3 py-1.5 hig-footnote transition-colors ${
                  filters.channelId === 'all'
                    ? 'bg-[var(--fill)] font-semibold text-[var(--label)]'
                    : 'text-[var(--label-2)] hover:bg-[var(--fill)]/50 hover:text-[var(--label)]'
                }`}
              >
                <span>Todos los canales</span>
                <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
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
                    className={`apple-press flex min-h-[36px] w-full items-center justify-between gap-2 rounded-[10px] px-3 py-1.5 hig-footnote transition-colors ${
                      isSelected
                        ? 'bg-[var(--fill)] font-semibold text-[var(--label)]'
                        : 'text-[var(--label-2)] hover:bg-[var(--fill)]/50 hover:text-[var(--label)]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: ch.color }}
                      />
                      <PlatformIcon
                        platform={ch.plataforma}
                        className="h-3.5 w-3.5 shrink-0 text-[var(--label-2)]"
                      />
                      <span className="truncate">{ch.nombre}</span>
                    </span>
                    <span className="font-mono tabular-nums hig-caption text-[var(--label-2)]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Pie del Sidebar: Ajustes, Tema, Backup JSON y Perfil Clerk */}
        <div className="hairline-t p-3 space-y-2">
          <button
            type="button"
            onClick={() => setBackupModalOpen(true)}
            className="apple-press apple-focus flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--fill)] px-3 py-2 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal strokeWidth={1.75} className="h-4 w-4 text-[var(--accent)]" />
            <span>Ajustes y Datos JSON</span>
          </button>
          <SidebarAuthProfile onOpenAuthScreen={openAuthScreen} />
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera Translúcida con Large Title contraíble y Segmented Control */}
        <header className="apple-glass hairline-b sticky top-0 z-20 px-4 transition-all duration-200 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Izquierda: Título compacto cuando se hace scroll + Segmented Control de vistas */}
            <div className="flex items-center gap-4 min-w-0">
              <span
                className={`hig-headline truncate transition-opacity duration-200 ${
                  isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none hidden sm:inline'
                }`}
              >
                {activeNavObj.label}
              </span>

              {/* Segmented Control estilo iOS para cambiar entre Kanban / Calendario / Lista */}
              <div
                className="inline-flex items-center rounded-[10px] bg-[var(--fill)] p-1"
                role="tablist"
                aria-label="Cambiar modo de visualización"
              >
                {WORKSPACE_TABS.map((tab) => {
                  const active = activeView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveView(tab.id)}
                      className={`apple-press apple-focus rounded-[8px] px-3 py-1 hig-footnote font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[var(--surface)] text-[var(--label)] shadow-xs'
                          : 'text-[var(--label-2)] hover:text-[var(--label)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Derecha: Botón rápido de tema (Sol/Luna/Auto), Ideas IA, Nueva pieza y Avatar Clerk (32px) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cycleThemePreference}
                className="apple-press apple-focus flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-hover)]"
                aria-label={themeBadgeLabel[themePreference]}
                title={`${themeBadgeLabel[themePreference]} (clic para cambiar Claro / Oscuro / Automático)`}
              >
                {themePreference === 'light' ? (
                  <Sun strokeWidth={1.75} className="h-4 w-4" />
                ) : themePreference === 'dark' ? (
                  <Moon strokeWidth={1.75} className="h-4 w-4" />
                ) : (
                  <Monitor strokeWidth={1.75} className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--fill)] px-3 py-1.5 hig-footnote font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
              >
                <Lightbulb
                  strokeWidth={1.75}
                  className="h-4 w-4"
                  style={{ color: 'var(--sys-orange)' }}
                />
                <span className="hidden sm:inline">Ideas IA</span>
              </button>

              <button
                type="button"
                onClick={() => openCreateModal('idea')}
                className="apple-press apple-focus inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-3.5 py-1.5 hig-footnote font-semibold text-white whitespace-nowrap shrink-0"
              >
                <Plus strokeWidth={1.75} className="h-4 w-4" />
                <span>Nueva pieza</span>
              </button>

              <HeaderAuthControl onOpenAuthScreen={openAuthScreen} />
            </div>
          </div>

          {/* Large Title de Apple HIG que se contrae suavemente al hacer scroll */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isScrolled ? 'max-h-0 opacity-0 pb-0' : 'max-h-20 opacity-100 pb-3 pt-1'
            }`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="hig-large-title text-[var(--label)]">
                {activeNavObj.label}
              </h1>
              <button
                type="button"
                onClick={() => setQuickCaptureOpen(true)}
                className="apple-press apple-focus hidden items-center gap-1.5 hig-footnote font-medium text-[var(--accent)] sm:inline-flex"
              >
                <Zap strokeWidth={1.75} className="h-3.5 w-3.5" />
                <span>Captura rápida (N)</span>
              </button>
            </div>
          </div>
        </header>

        {/* Barra de Filtros Combinables */}
        {showFilterBar && <FilterBar />}

        {/* Área de Contenido Principal */}
        <main className="flex-1 pb-24 lg:pb-12">
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

      {/* Botón flotante de Captura Rápida de Ideas */}
      <button
        type="button"
        onClick={() => setQuickCaptureOpen(true)}
        className="apple-press apple-focus fixed bottom-20 right-5 z-30 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 hig-footnote font-semibold text-white shadow-lg lg:bottom-6 lg:right-6 whitespace-nowrap shrink-0"
        aria-label="Captura rápida de idea (Atajo tecla N)"
        title="Captura rápida de idea (Atajo: tecla N)"
      >
        <Zap strokeWidth={1.75} className="h-4 w-4" />
        <span>Idea rápida</span>
      </button>

      {/* Tab Bar Inferior Translúcida en Móvil (5 destinos estilo iOS) */}
      <nav
        aria-label="Navegación móvil"
        className="apple-glass hairline-t fixed bottom-0 left-0 right-0 z-30 grid h-14 grid-cols-5 items-center px-2 lg:hidden"
      >
        <button
          type="button"
          onClick={() => setActiveView('kanban')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 ${
            activeView === 'kanban' || activeView === 'lista'
              ? 'text-[var(--accent)]'
              : 'text-[var(--label-2)]'
          }`}
        >
          <Kanban strokeWidth={1.75} className="h-5 w-5" />
          <span className="text-[11px] font-medium">Flujo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('calendario')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 ${
            activeView === 'calendario'
              ? 'text-[var(--accent)]'
              : 'text-[var(--label-2)]'
          }`}
        >
          <Calendar strokeWidth={1.75} className="h-5 w-5" />
          <span className="text-[11px] font-medium">Calendario</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 ${
            activeView === 'dashboard'
              ? 'text-[var(--accent)]'
              : 'text-[var(--label-2)]'
          }`}
        >
          <LayoutDashboard strokeWidth={1.75} className="h-5 w-5" />
          <span className="text-[11px] font-medium">Resumen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('canales')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 ${
            activeView === 'canales' || activeView === 'plantillas'
              ? 'text-[var(--accent)]'
              : 'text-[var(--label-2)]'
          }`}
        >
          <Tv strokeWidth={1.75} className="h-5 w-5" />
          <span className="text-[11px] font-medium">Canales</span>
        </button>

        <button
          type="button"
          onClick={() => setBackupModalOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[var(--label-2)]"
        >
          <SlidersHorizontal strokeWidth={1.75} className="h-5 w-5" />
          <span className="text-[11px] font-medium">Ajustes</span>
        </button>
      </nav>

      {/* Modales y Hojas (Sheets) */}
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
        title="¿Eliminar esta pieza?"
        description={`Se eliminará «${deleteCandidate?.titulo || ''}» de forma permanente.`}
        confirmLabel="Eliminar"
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
