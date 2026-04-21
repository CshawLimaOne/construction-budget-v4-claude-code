import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(4,11,31,0.5)' }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Close on overlay click
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md transform transition-all border border-[#DFE1E5]"
        style={{ boxShadow: '0 2.12px 19.86px rgba(30,45,92,0.05), 0 9.48px 45.88px rgba(30,45,92,0.036), 0 23.59px 104.77px rgba(30,45,92,0.028)' }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-[#1E2D5C]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#78819D] hover:text-[#1E2D5C] transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-[#1E2D5C] mb-6">
          {children}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="button-base bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
