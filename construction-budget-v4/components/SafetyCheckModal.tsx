
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
      <button onClick={onContinue} className="button-base bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
        Skip & Continue
      </button>
      <button onClick={onClose} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
        I'll Add Them
      </button>
    </>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="Budget Safety Check" footer={footer} size="md">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
            <WarningTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Did you forget something?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
            We noticed a few commonly forgotten items are set to <strong>$0</strong>. 
            Do you have a plan for these, or did they slip through the cracks?
        </p>
        
        <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-left">
            <ul className="space-y-2">
                {missingItems.map(item => (
                    <li key={item} className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200">
                        <span className="text-red-500 mr-2">•</span> {item}
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </ComplexModal>
  );
};
