import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121622] border-2 border-red-500/50 max-w-md w-full rounded-2xl p-6 manga-panel relative space-y-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/60 flex items-center justify-center text-red-400 mx-auto sm:mx-0">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-white">
            Réinitialiser la Progression ?
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Cette action effacera l'ensemble de votre niveau, vos pièces, vos cartes de collection débloquées et vos records de combat. Cette opération est irréversible.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-display font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-900/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirmer la Réinitialisation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
