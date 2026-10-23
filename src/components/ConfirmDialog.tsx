import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="animate-apple-sheet w-full max-w-sm rounded-t-[20px] bg-[var(--surface-elevated)] p-6 sm:rounded-[20px]"
        style={{ boxShadow: 'var(--sheet-shadow)' }}
      >
        {/* Tirador en móvil */}
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[var(--label-3)] sm:hidden" />

        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                variant === 'danger'
                  ? 'rgba(255, 59, 48, 0.14)'
                  : 'rgba(0, 122, 255, 0.14)',
              color: variant === 'danger' ? 'var(--sys-red)' : 'var(--accent)',
            }}
          >
            <AlertTriangle strokeWidth={1.75} className="h-5 w-5" />
          </div>

          <h2
            id="confirm-dialog-title"
            className="mt-3 hig-headline text-[var(--label)]"
          >
            {title}
          </h2>

          <p className="mt-1.5 hig-footnote text-[var(--label-2)]">
            {description}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="apple-press apple-focus min-h-[44px] rounded-[10px] bg-[var(--fill)] px-4 py-2.5 hig-subhead font-medium text-[var(--label)] hover:bg-[var(--fill-hover)] whitespace-nowrap shrink-0"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{
              backgroundColor:
                variant === 'danger' ? 'var(--sys-red)' : 'var(--accent)',
            }}
            className="apple-press apple-focus min-h-[44px] rounded-[10px] px-4 py-2.5 hig-subhead font-semibold text-white whitespace-nowrap shrink-0"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
