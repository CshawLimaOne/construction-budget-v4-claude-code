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
}

export const ComplexModal: React.FC<ComplexModalProps> = ({ isOpen, onClose, title, children, footer, size = 'xl' }) => {
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-[999] px-4 pt-20 pb-4 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[calc(100vh-6rem)] transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-white/10 flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-white tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow text-slate-300">
          {children}
        </main>

        <footer className="flex justify-end items-center p-4 border-t border-white/10 flex-shrink-0 space-x-3">
          {footer}
        </footer>
      </div>
    </div>,
    document.body
  );
};