import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Project Details' },
  { number: 2, label: 'Contractor Details' },
  { number: 3, label: 'Detailed Budget' },
  { number: 4, label: 'Review & Submit' },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="progress-indicator" aria-label="Form progress">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div 
            className={`progress-step ${currentStep >= step.number ? 'active' : ''}`}
            aria-current={currentStep === step.number ? 'step' : undefined}
            role="status" // Added role for better accessibility
            aria-live="polite" // Announce changes for screen readers
          >
            <div className="progress-step-circle" aria-hidden="true">{step.number}</div>
            <span className="progress-step-label">{step.label}</span>
          </div>
          {index < steps.length - 1 && <div className={`flex-grow border-t-2 mx-2 transition-all duration-500 ${currentStep > index + 1 ? 'border-[#1E2E5C] dark:border-sky-400' : 'border-slate-300 dark:border-slate-600'}`} aria-hidden="true"></div>}
        </React.Fragment>
      ))}
    </div>
  );
};
