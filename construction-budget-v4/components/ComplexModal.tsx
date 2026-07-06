import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface ComplexModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
}

export const ComplexModal: React.FC<ComplexModalProps> = ({ isOpen, onClose, title, children, footer, size = 'xl', hideCloseButton = false }) => {
  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-start justify-center z-[999] px-4 pt-20 pb-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(4,11,31,0.5)' }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`modal-window-shadow bg-white border border-[#DFE1E5] rounded-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[calc(100vh-6rem)]`}
        style={{ animation: 'modalIn 0.2s ease-out both' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-[#DFE1E5] flex-shrink-0">
          <h2 id="modal-title" className="text-2xl font-bold text-[#1E2D5C] tracking-tight">
            {title}
          </h2>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#78819D] hover:text-[#1E2D5C] bg-[#F6F7F9] hover:bg-[#F7F9FC] rounded-full transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="p-6 overflow-y-auto flex-grow text-[#1E2D5C]">
          {children}
        </main>

        <footer className="flex justify-end items-center p-4 border-t border-[#DFE1E5] flex-shrink-0 space-x-3">
          {footer}
        </footer>
      </div>
    </div>,
    // Portal into the widget's own container, not document.body - all of the
    // app's styling (e.g. .button-base) is scoped to #construction-budget-app,
    // so mounting outside it silently loses that styling.
    document.getElementById('construction-budget-app') || document.body
  );
};