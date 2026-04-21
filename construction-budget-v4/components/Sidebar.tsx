
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

const PIPELINE_STAGES = [
  { key: 'quote',    label: 'Quote' },
  { key: 'applied',  label: 'Applied' },
  { key: 'review',   label: 'In Review' },
  { key: 'approved', label: 'Approved' },
] as const;

type PipelineKey = typeof PIPELINE_STAGES[number]['key'];

function getPipelineState(status: ApplicationStatus): { active: PipelineKey; alert: boolean } {
  switch (status) {
    case 'under_review':       return { active: 'review',   alert: false };
    case 'needs_borrower_action': return { active: 'review', alert: true };
    case 'approved':           return { active: 'approved', alert: false };
    default:                   return { active: 'quote',    alert: false };
  }
}

const RiskMonitorWidget: React.FC<{ riskAnalysis: RiskAnalysisResult }> = ({ riskAnalysis }) => {
    const { score, factors } = riskAnalysis;
    
    return (
        <div className="p-3 bg-[#F6F7F9] border border-[#DFE1E5] rounded-xl mb-4">
            <h4 className="font-bold text-[#78819D] text-xs mb-2 text-center uppercase tracking-wide">Live Risk Monitor</h4>
            <div className="flex items-center justify-between mb-2">
                <RiskGauge score={score} size="sm" showLabel={false} />
                <div className="flex-grow ml-3 text-center">
                    <div className={`text-lg font-bold ${score > 50 ? 'text-[#B92814]' : 'text-[#139B23]'}`}>
                        {riskAnalysis.level}
                    </div>
                    <div className="text-[10px] text-[#78819D] uppercase">Risk Level</div>
                </div>
            </div>
            {factors.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-[#DFE1E5]">
                    <ul className="space-y-1">
                        {factors.slice(0, 1).map(f => (
                            <li key={f.id} className="text-[10px] text-[#B92814] flex items-start">
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
      <button onClick={handleActionConfirm} className="button-base bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 w-full">
          Take me there
      </button>
  );

  const pipeline = getPipelineState(applicationStatus);
  const activeIdx = PIPELINE_STAGES.findIndex(s => s.key === pipeline.active);

  return (
    <>
    <aside className="sidebar">
      {/* Floating Glass Panel */}
      <div className="sidebar-glass-panel">

          {/* Lima One logo header */}
          <div className="sidebar-logo-header">
            <img
              src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
              alt="Lima One Capital"
            />
            <span className="sidebar-logo-tag">Construction Finance Platform</span>
          </div>

          {/* Loan pipeline strip */}
          <div className="loan-pipeline">
            {PIPELINE_STAGES.map((stage, i) => {
              const isDone   = i < activeIdx;
              const isActive = i === activeIdx;
              const isAlert  = isActive && pipeline.alert;
              const stageClass = isAlert ? 'alert' : isDone ? 'done' : isActive ? 'active' : '';
              return (
                <div key={stage.key} className={`pipeline-stage ${stageClass}`}>
                  <div className="pipeline-dot" />
                  <span className="pipeline-label">{stage.label}</span>
                </div>
              );
            })}
          </div>

          {/* Property Context Header (Compact) */}
          <div className="sidebar-header">
            <div className="property-address">
                <div className="p-1.5 bg-brand-50 rounded text-brand-500">
                    <MapPinIcon className="w-4 h-4" />
                </div>
                <span className="truncate font-bold text-sm text-[#1E2D5C]">
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
                      {isCompleted ? <CheckCircleIcon className="completed-icon text-[#139B23]" /> : React.cloneElement(step.icon as any, { className: `step-icon ${isCurrent ? 'text-white' : 'text-[#78819D]'}` })}
                    </div>
                    <span className={`step-label ${isCurrent ? 'text-[#1E2D5C] font-bold tracking-wide' : 'text-[#78819D]'}`}>{step.label}</span>
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
                <a href="#" className="help-link text-[#78819D] hover:text-[#1E2D5C] transition-colors">Need Help? Contact Support</a>
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
                  <h4 className="text-lg font-bold text-[#1E2D5C]">{applicationStrength.nextBestAction}</h4>
                  <p className="text-sm text-[#78819D]">
                      {applicationStrength.nextActionDescription}
                  </p>
                  <div className="p-3 bg-brand-50 rounded text-xs text-brand-500 border border-brand-200">
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
