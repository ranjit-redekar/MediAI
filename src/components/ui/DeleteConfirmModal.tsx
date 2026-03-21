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
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName
}) => {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <p className="text-white/80 mb-2">{message}</p>
        {itemName && (
          <p className="text-white font-medium mb-6">"{itemName}"</p>
        )}
        
        <div className="flex justify-center gap-3">
          <GlassButton variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton variant="danger" onClick={onConfirm}>
            Delete
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
