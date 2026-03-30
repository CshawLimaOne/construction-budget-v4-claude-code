
import React from 'react';
import { XIcon } from './Icons';

interface PersonalizedGuidanceProps {
  onDismiss: () => void;
}

export const PersonalizedGuidance: React.FC<PersonalizedGuidanceProps> = ({ onDismiss }) => {
  return (
    <div className="relative bg-brand-100 dark:bg-brand-900/50 border-l-4 border-brand-500 text-brand-800 dark:text-brand-200 p-4 rounded-md shadow-md mb-6" role="alert">
      <div className="flex items-start">
        <div className="flex-grow">
          <p className="font-bold">Personalized Guidance</p>
          <p className="text-sm mt-1">
            Welcome back, John. On your last rehab, you typically budgeted $4.50/sqft for flooring. For this larger project, a similar budget would be $11,500. Would you like to use this as a starting point?
          </p>
          <div className="mt-3">
            <button className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] text-sm py-1.5 px-3 mr-2">Apply Suggestion</button>
            <button className="button-base bg-transparent text-brand-700 dark:text-brand-300 border border-brand-700 dark:border-brand-300 text-sm py-1.5 px-3">View Details</button>
          </div>
        </div>
        <div className="ml-auto pl-3 flex-shrink-0">
          <button onClick={onDismiss} aria-label="Dismiss guidance" className="text-brand-900/70 hover:text-brand-900 dark:text-brand-200/70 dark:hover:text-brand-100">
            <XIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};
