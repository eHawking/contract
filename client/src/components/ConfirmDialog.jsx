import React from 'react';

function ConfirmDialog({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary', onConfirm, onOpenChange }) {
  if (!open) return null;

  const confirmBtnClass = variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={() => onOpenChange?.(false)}>{cancelText}</button>
          <button className={confirmBtnClass} onClick={() => { onConfirm?.(); }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
