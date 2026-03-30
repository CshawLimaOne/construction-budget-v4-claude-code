import React from 'react';
import { ApplicationStatus } from '../types';
import Tooltip from './Tooltip';
import { CheckIcon } from './Icons';

interface ProgressBarProps {
  status: ApplicationStatus;
}

const steps = [
  { name: 'Draft', description: 'You are currently drafting your budget. Fill in all the required information and submit for review when ready.' },
  { name: 'Review', description: 'Your budget has been submitted and is under review by a Lima One analyst. The budget is locked during this stage.' },
  { name: 'Revision Approval', description: 'If revisions are requested by the analyst, you will be asked to make updates here before it can be approved.' },
  { name: 'Final Approval', description: 'Congratulations! Your budget has been approved. The loan process can now move forward.' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ status }) => {
  let currentStepIndex = 0;
  switch (status) {
    case 'draft':
      currentStepIndex = 0;
      break;
    case 'under_review':
      currentStepIndex = 1;
      break;
    case 'needs_borrower_action':
      currentStepIndex = 2;
      break;
    case 'approved':
      currentStepIndex = 3;
      break;
    default:
      currentStepIndex = 0;
  }
  
  return (
    <div className="progress-bar-container" aria-label="Application progress">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        const stepStatusClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'future';

        const tooltipText = status === 'needs_borrower_action' && index === 2 ?
          'The analyst has requested revisions. Please address any comments, make updates, and resubmit your budget.' :
          step.description;
          
        return (
          <React.Fragment key={step.name}>
            <div className={`progress-bar-step ${stepStatusClass}`}>
              <Tooltip text={tooltipText} position="bottom">
                <div className="progress-bar-circle" aria-current={isCurrent ? 'step' : undefined}>
                  {isCompleted ? <CheckIcon className="w-5 h-5" /> : index + 1}
                </div>
              </Tooltip>
              <div className="progress-bar-label">{step.name}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`progress-bar-line-container ${isCompleted || isCurrent ? 'completed' : ''}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};