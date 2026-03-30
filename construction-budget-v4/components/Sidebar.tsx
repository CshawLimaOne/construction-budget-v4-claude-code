
import React, { useState } from 'react';
import { HomeIcon, IdentificationIcon, BanknotesIcon, PaperAirplaneIcon, CheckCircleIcon, MapPinIcon } from './Icons';
import { ApplicationStatus, UserRole, CommentThread, RiskAnalysisResult, ApplicationStrength } from '../types';
import { ActionCenterWidget } from './ActionCenter';
import { RiskGauge } from './RiskGauge';
import { ApplicationStrengthWidget } from './ApplicationStrengthWidget';
import { DealStrengthLogicModal } from './DealStrengthLogicModal';
import { ComplexModal } from './ComplexModal';

interface SidebarProps {
  currentStep: number;
  propertyAddress: string;
  onStepClick: (step: number) => void;
  isStarted: boolean;
  applicationStatus: ApplicationStatus;
  commentThreads: CommentThread[];
  currentUserRole: UserRole;
  onOpenActionCenter: () => void;
  isParsingBudget: boolean;
  budgetParsingError: string | null;
  isAnalyzingBudget: boolean;
  analysisError: string | null;
  onProcessBudgetFile: (file: File) => void;
  riskAnalysis?: RiskAnalysisResult; 
  applicationStrength?: ApplicationStrength; 
}

const steps = [
  { number: 1, label: 'Property Detail', icon: <HomeIcon className="step-icon" /> },
  { number: 2, label: 'GC & Documents', icon: <IdentificationIcon className="step-icon" /> },
  { number: 3, label: 'Detailed Budget', icon: <BanknotesIcon className="step-icon" /> },
  { number: 4, label: 'Review & Submit', icon: <PaperAirplaneIcon className="step-icon" /> },
];

const RiskMonitorWidget: React.FC<{ riskAnalysis: RiskAnalysisResult }> = ({ riskAnalysis }) => {
    const { score, factors } = riskAnalysis;
    
    return (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-4 shadow-lg backdrop-blur-sm">
            <h4 className="font-bold text-slate-300 text-xs mb-2 text-center uppercase tracking-wide">Live Risk Monitor</h4>
            <div className="flex items-center justify-between mb-2">
                <RiskGauge score={score} size="sm" showLabel={false} />
                <div className="flex-grow ml-3 text-center">
                    <div className={`text-lg font-bold ${score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {riskAnalysis.level}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Risk Level</div>
                </div>
            </div>
            {factors.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-white/10">
                    <ul className="space-y-1">
                        {factors.slice(0, 1).map(f => (
                            <li key={f.id} className="text-[10px] text-red-300 flex items-start">
                                <span className="mr-1">•</span> {f.message}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

export const Sidebar: React.FC<SidebarProps> = ({ currentStep, propertyAddress, onStepClick, isStarted, applicationStatus, commentThreads, currentUserRole, onOpenActionCenter, isParsingBudget, budgetParsingError, isAnalyzingBudget, analysisError, onProcessBudgetFile, riskAnalysis, applicationStrength }) => {
  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const handleActionConfirm = () => {
      setIsActionModalOpen(false);
      if (applicationStrength && applicationStrength.actionTargetStep) {
          onStepClick(applicationStrength.actionTargetStep);
      }
  };

  const actionFooter = (
      <button onClick={handleActionConfirm} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500 w-full">
          Take me there
      </button>
  );

  return (
    <>
    <aside className="sidebar">
      {/* Floating Glass Panel */}
      <div className="sidebar-glass-panel">
          
          {/* Property Context Header (Compact) */}
          <div className="sidebar-header">
            <div className="property-address">
                <div className="p-1.5 bg-brand-500/20 rounded text-brand-400">
                    <MapPinIcon className="w-4 h-4" />
                </div>
                <span className="truncate font-bold text-sm text-white">
                    {propertyAddress || 'Project Address'}
                </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <ol className="vertical-stepper">
              {steps.map(step => {
                const isCompleted = isStarted && currentStep > step.number;
                const isCurrent = isStarted && currentStep === step.number;
                
                let statusClass = '';
                if (isCurrent) statusClass = 'current';
                else if (isCompleted) statusClass = 'completed';
                else statusClass = 'future';

                const canClick = isCompleted || applicationStatus === 'approved';

                return (
                  <li key={step.number} className={`step ${statusClass} ${canClick ? 'clickable' : ''}`} onClick={() => canClick && onStepClick(step.number)}>
                    <div className={`step-icon-wrapper`}>
                      {isCompleted ? <CheckCircleIcon className="completed-icon text-emerald-400" /> : React.cloneElement(step.icon as any, { className: `step-icon ${isCurrent ? 'text-white' : 'text-slate-500'}` })}
                    </div>
                    <span className={`step-label ${isCurrent ? 'text-white font-bold tracking-wide' : 'text-slate-400'}`}>{step.label}</span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="sidebar-sticky-bottom">
            {isStarted && currentUserRole === 'analyst' && riskAnalysis && <RiskMonitorWidget riskAnalysis={riskAnalysis} />}
            
            {isStarted && currentUserRole === 'borrower' && applicationStrength && (
                <ApplicationStrengthWidget 
                    strength={applicationStrength} 
                    onActionClick={() => setIsActionModalOpen(true)} 
                    onShowLogic={() => setIsLogicModalOpen(true)}
                />
            )}
            
            <div className="mt-4">
                <ActionCenterWidget 
                threads={commentThreads}
                currentUserRole={currentUserRole}
                onClick={onOpenActionCenter}
                />
            </div>
            
            <div className="sidebar-footer-text">
                <a href="#" className="help-link text-slate-500 hover:text-slate-300 transition-colors">Need Help? Contact Support</a>
            </div>
          </div>
      </div>

    </aside>

      <DealStrengthLogicModal
        isOpen={isLogicModalOpen}
        onClose={() => setIsLogicModalOpen(false)}
        strength={applicationStrength}
      />

      <ComplexModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Recommended Action"
        footer={actionFooter}
        size="md"
      >
          {applicationStrength ? (
              <div className="text-center space-y-4">
                  <h4 className="text-lg font-bold text-[#1E2E5C] dark:text-sky-400">{applicationStrength.nextBestAction}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                      {applicationStrength.nextActionDescription}
                  </p>
                  <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded text-xs text-brand-800 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
                      Completing this action will improve your Deal Strength Score.
                  </div>
              </div>
          ) : (
              <div className="text-center p-4">Loading recommendation...</div>
          )}
      </ComplexModal>
    </>
  );
};
