import React, { ReactNode } from 'react';
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

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-start justify-center z-[999] px-4 pt-20 pb-4 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[calc(100vh-6rem)] transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto flex-grow">
          {children}
        </main>

        <footer className="flex justify-end items-center p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 space-x-3">
          {footer}
        </footer>
      </div>
    </div>
  );
};