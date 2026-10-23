import React, { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { ConfirmDialog } from './ConfirmDialog';
import { ThemePreference } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const exportBackupData = useContentStore((s) => s.exportBackupData);
  const importBackupData = useContentStore((s) => s.importBackupData);
  const clearAllData = useContentStore((s) => s.clearAllData);
  const restoreSampleData = useContentStore((s) => s.restoreSampleData);
  const channels = useContentStore((s) => s.channels);
  const items = useContentStore((s) => s.items);
  const themePreference = useContentStore((s) => s.themePreference);
  const setThemePreference = useContentStore((s) => s.setThemePreference);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const jsonString = exportBackupData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateSlug = new Date().toISOString().slice(0, 10);
    link.download = `contentflow-backup-${dateSlug}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMsg({
      type: 'success',
      text: 'Copia de seguridad descargada en formato JSON.',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = String(event.target?.result || '');
        importBackupData(content);
        setStatusMsg({
          type: 'success',
          text: 'Copia de seguridad importada con éxito.',
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'El archivo JSON no es válido.';
        setStatusMsg({ type: 'error', text: msg });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const themeOptions: { id: ThemePreference; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Oscuro', icon: Moon },
    { id: 'auto', label: 'Automático', icon: Monitor },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
      >
        <div
          className="animate-apple-sheet w-full max-w-lg rounded-t-[20px] bg-[var(--surface-elevated)] p-6 sm:rounded-[20px]"
          style={{ boxShadow: 'var(--sheet-shadow)' }}
        >
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

          <div className="flex items-center justify-between gap-4 pb-4 hairline-b">
            <div>
              <h2 id="backup-modal-title" className="hig-headline text-[var(--label)]">
                Ajustes y Copia de Seguridad
              </h2>
              <p className="hig-caption text-[var(--label-2)]">
                Apariencia del sistema y gestión de datos locales (storageService)
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="apple-press apple-focus flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]"
              aria-label="Cerrar ajustes"
            >
              <X strokeWidth={1.75} className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {/* Sección Apariencia: Segmented Control (Claro · Oscuro · Automático) */}
            <div>
              <p className="mb-2 px-1 hig-caption font-medium text-[var(--label-2)]">
                Apariencia
              </p>
              <div
                className="grid grid-cols-3 gap-1 rounded-[10px] bg-[var(--fill)] p-1"
                role="radiogroup"
                aria-label="Seleccionar tema de apariencia"
              >
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = themePreference === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setThemePreference(opt.id)}
                      className={`apple-press apple-focus flex min-h-[36px] items-center justify-center gap-1.5 rounded-[8px] px-3 py-1.5 hig-footnote font-medium transition-all whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[var(--surface)] text-[var(--label)] shadow-xs'
                          : 'text-[var(--label-2)] hover:text-[var(--label)]'
                      }`}
                    >
                      <Icon strokeWidth={1.75} className="h-3.5 w-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {statusMsg && (
              <div
                className="flex items-center gap-2.5 rounded-[12px] p-3.5 hig-footnote"
                style={{
                  backgroundColor:
                    statusMsg.type === 'success'
                      ? 'rgba(52, 199, 89, 0.14)'
                      : 'rgba(255, 59, 48, 0.14)',
                  color:
                    statusMsg.type === 'success'
                      ? 'var(--sys-green)'
                      : 'var(--sys-red)',
                }}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 strokeWidth={1.75} className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle strokeWidth={1.75} className="h-4 w-4 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Lista agrupada Inset: Almacenamiento y JSON */}
            <div>
              <p className="mb-2 px-1 hig-caption font-medium text-[var(--label-2)]">
                Copia de seguridad (JSON)
              </p>
              <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
                <div className="ios-row flex min-h-[46px] items-center justify-between px-4 py-2.5">
                  <span className="hig-subhead text-[var(--label)]">
                    Registros guardados
                  </span>
                  <span className="font-mono tabular-nums hig-footnote text-[var(--label-2)]">
                    {channels.length} canales · {items.length} tarjetas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="ios-row flex min-h-[46px] w-full items-center justify-between px-4 py-2.5 text-left hig-subhead font-medium text-[var(--accent)] hover:bg-[var(--fill-hover)]"
                >
                  <span>Exportar copia de seguridad (.json)</span>
                  <Download strokeWidth={1.75} className="h-4 w-4" />
                </button>

                <label className="ios-row flex min-h-[46px] w-full cursor-pointer items-center justify-between px-4 py-2.5 hig-subhead font-medium text-[var(--accent)] hover:bg-[var(--fill-hover)]">
                  <span>Importar archivo de respaldo (.json)</span>
                  <Upload strokeWidth={1.75} className="h-4 w-4" />
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Lista agrupada Inset: Datos de ejemplo */}
            <div>
              <p className="mb-2 px-1 hig-caption font-medium text-[var(--label-2)]">
                Datos de demostración
              </p>
              <div className="rounded-[14px] bg-[var(--fill)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setConfirmSampleOpen(true)}
                  className="ios-row flex min-h-[46px] w-full items-center justify-between px-4 py-2.5 text-left hig-subhead font-medium text-[var(--label)] hover:bg-[var(--fill-hover)]"
                >
                  <span>Restaurar los 3 canales y 8 tarjetas de ejemplo</span>
                  <RotateCcw strokeWidth={1.75} className="h-4 w-4 text-[var(--label-2)]" />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="ios-row flex min-h-[46px] w-full items-center justify-between px-4 py-2.5 text-left hig-subhead font-medium hover:bg-[var(--fill-hover)]"
                  style={{ color: 'var(--sys-red)' }}
                >
                  <span>Borrar todos los canales y tarjetas</span>
                  <Trash2 strokeWidth={1.75} className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--accent)] px-6 py-2 hig-subhead font-semibold text-white whitespace-nowrap shrink-0"
            >
              Listo
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="¿Borrar todos los datos?"
        description="Se eliminarán los canales y tarjetas actuales para empezar con el espacio limpio."
        confirmLabel="Borrar todo"
        variant="danger"
        onConfirm={() => {
          clearAllData();
          setStatusMsg({
            type: 'success',
            text: 'Se han borrado todos los datos.',
          });
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmSampleOpen}
        title="¿Restaurar datos de ejemplo?"
        description="Se cargarán los 3 canales y las 8 tarjetas de demostración iniciales."
        confirmLabel="Restaurar"
        variant="primary"
        onConfirm={() => {
          restoreSampleData();
          setStatusMsg({
            type: 'success',
            text: 'Datos de demostración restaurados.',
          });
        }}
        onCancel={() => setConfirmSampleOpen(false)}
      />
    </>
  );
};
