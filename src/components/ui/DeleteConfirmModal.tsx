import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  /** Label for the destructive button. Defaults to "Delete". */
  confirmLabel?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmLabel = 'Delete',
}) => (
  <GlassModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <GlassButton variant="ghost" onClick={onClose}>Cancel</GlassButton>
        <GlassButton variant="danger" onClick={onConfirm}>{confirmLabel}</GlassButton>
      </>
    }
  >
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/15 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>

      <p className="text-app-muted">{message}</p>
      {itemName && <p className="text-app font-semibold mt-2">"{itemName}"</p>}
      <p className="text-xs text-app-subtle mt-4">This action cannot be undone.</p>
    </div>
  </GlassModal>
);
