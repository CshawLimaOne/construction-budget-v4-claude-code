
import React from 'react';
import { XIcon } from './Icons';

interface PersonalizedGuidanceProps {
  onDismiss: () => void;
}

export const PersonalizedGuidance: React.FC<PersonalizedGuidanceProps> = ({ onDismiss }) => {
  return (
    <div className="relative bg-brand-50 border-l-4 border-brand-500 text-[#1E2D5C] p-4 rounded-md shadow-sm mb-6" role="alert">
      <div className="flex items-start">
        <div className="flex-grow">
          <p className="font-bold">Personalized Guidance</p>
          <p className="text-sm mt-1">
            Welcome back, John. On your last rehab, you typically budgeted $4.50/sqft for flooring. For this larger project, a similar budget would be $11,500. Would you like to use this as a starting point?
          </p>
          <div className="mt-3">
            <button className="button-base bg-brand-500 text-white hover:bg-brand-600 text-sm py-1.5 px-3 mr-2">Apply Suggestion</button>
            <button className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] text-sm py-1.5 px-3">View Details</button>
          </div>
        </div>
        <div className="ml-auto pl-3 flex-shrink-0">
          <button onClick={onDismiss} aria-label="Dismiss guidance" className="text-[#78819D] hover:text-[#1E2D5C]">
            <XIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};
