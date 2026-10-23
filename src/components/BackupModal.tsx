import React, { useState } from 'react';
import { Download, Upload, Database, Trash2, RotateCcw, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContentStore } from '../store/useContentStore';
import { ConfirmDialog } from './ConfirmDialog';

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
      text: 'Copia de seguridad descargada correctamente en formato JSON.',
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
          text: 'Datos importados y restaurados con éxito.',
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
      >
        <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#131B2E] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="backup-modal-title"
                  className="text-base font-semibold text-slate-100"
                >
                  Datos y Copia de Seguridad (JSON)
                </h2>
                <p className="text-xs text-slate-400">
                  Persistencia gestionada mediante storageService
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

          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-3 text-xs text-slate-300">
              <span>Estado actual en almacenamiento local:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-100">
                {channels.length} canales · {items.length} tarjetas
              </span>
            </div>

            {statusMsg && (
              <div
                className={`flex items-center gap-2.5 rounded-lg border p-3.5 text-xs ${
                  statusMsg.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-red-500/30 bg-red-500/10 text-red-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Exportar e Importar JSON */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <Download className="h-4 w-4 text-indigo-400" />
                <span>Exportar JSON</span>
              </button>

              <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0">
                <Upload className="h-4 w-4 text-emerald-400" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Gestión de datos de ejemplo */}
            <div className="border-t border-slate-800/80 pt-4">
              <p className="text-xs font-medium text-slate-300">
                Datos de ejemplo precargados
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Puedes vaciar todos los canales y tarjetas para empezar desde cero o
                restaurar las 8 tarjetas y 3 canales de demostración.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 whitespace-nowrap shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Borrar todos los datos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmSampleOpen(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restaurar datos de ejemplo</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="¿Borrar todos los canales y tarjetas?"
        description="Se eliminarán todos los canales y piezas de contenido actuales para que empieces con el espacio vacío. Tus plantillas de checklist se conservarán."
        confirmLabel="Sí, borrar datos"
        variant="danger"
        onConfirm={() => {
          clearAllData();
          setStatusMsg({
            type: 'success',
            text: 'Se han borrado los datos. El tablero está limpio.',
          });
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmSampleOpen}
        title="¿Restaurar los datos de ejemplo?"
        description="Esto cargará los 3 canales y las 8 tarjetas de demostración iniciales, reemplazando las tarjetas actuales."
        confirmLabel="Restaurar demostración"
        variant="primary"
        onConfirm={() => {
          restoreSampleData();
          setStatusMsg({
            type: 'success',
            text: 'Se han restaurado los 3 canales y 8 tarjetas de ejemplo.',
          });
        }}
        onCancel={() => setConfirmSampleOpen(false)}
      />
    </>
  );
};
