import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#131B2E] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                variant === 'danger'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-indigo-500/15 text-indigo-400'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-slate-100"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-500"
            aria-label="Cerrar diálogo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-500 whitespace-nowrap shrink-0"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-2 whitespace-nowrap shrink-0 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-400'
                : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
