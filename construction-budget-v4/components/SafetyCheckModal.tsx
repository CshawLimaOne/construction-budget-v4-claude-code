
import React from 'react';
import { ComplexModal } from './ComplexModal';
import { WarningTriangleIcon } from './Icons';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  missingItems: string[];
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({ isOpen, onClose, onContinue, missingItems }) => {
  const footer = (
    <>
      <button
        onClick={onContinue}
        className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] focus:ring-brand-500 transition-colors"
      >
        Submit Anyway
      </button>
      <button
        onClick={onClose}
        className="button-base bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 transition-colors"
      >
        Go Back &amp; Review
      </button>
    </>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="Before You Submit" footer={footer} size="md">
      <div className="flex flex-col space-y-5">

        {/* Warning banner */}
        <div className="flex items-start gap-4 bg-[#FFF5DB] border border-[#EDDDB1] rounded-xl p-4">
          <div className="flex-shrink-0 bg-[#EDDDB1] p-2.5 rounded-lg mt-0.5">
            <WarningTriangleIcon className="w-5 h-5 text-[#EAA800]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E2D5C] mb-1">Some line items are still $0</h3>
            <p className="text-sm text-[#78819D] leading-relaxed">
              These items are commonly included in budgets like this. Leaving them at $0 may flag your submission for review or delay approval.
            </p>
          </div>
        </div>

        {/* Flagged items list */}
        <div className="bg-[#F6F7F9] border border-[#DFE1E5] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F4F5F7] border-b border-[#DFE1E5]">
            <p className="text-xs font-bold text-[#78819D] uppercase tracking-widest">Flagged at $0</p>
          </div>
          <ul className="divide-y divide-[#DFE1E5]">
            {missingItems.map(item => (
              <li key={item} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#EAA800]" />
                <span className="text-sm font-medium text-[#1E2D5C]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#78819D] text-center">
          If these were intentionally left at $0, you can proceed without changes.
        </p>

      </div>
    </ComplexModal>
  );
};
