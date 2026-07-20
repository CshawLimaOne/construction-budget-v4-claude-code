
import React, { useState, useRef, useEffect } from 'react';
import {
    CloudUploadIcon,
    FolderIcon,
    DocumentPlusIcon,
    SpinnerIcon,
    CameraIcon,
    CompassIcon,
    CalculatorIcon,
    ChevronRightIcon
} from './Icons';

type UploadProjectType = 'renovation' | 'new_construction';

interface WelcomeScreenProps {
  onGetStarted: (type?: 'new' | 'repeat') => void;
  onStartWithTemplate: () => void;
  onOpenEstimator?: () => void;
  onStartWalkthrough?: () => void;
  onStartTutorial?: () => void;
  onProcessBudgetFile?: (file: File, projectType: UploadProjectType) => void;
  isProcessing?: boolean;
  budgetParsingError?: string | null;
  onNavigateToDashboard?: () => void;
  dashboardLabel?: string;
}

const STATS = [
  { value: '$4.2B+', label: 'Projects Funded' },
  { value: '48 hrs', label: 'Avg. Approval Time' },
  { value: '94%+', label: 'Budget Accuracy' },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onGetStarted,
    onStartWithTemplate,
    onOpenEstimator,
    onStartWalkthrough,
    onStartTutorial,
    onProcessBudgetFile,
    isProcessing = false,
    budgetParsingError = null,
    onNavigateToDashboard,
    dashboardLabel,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [uploadProjectType, setUploadProjectType] = useState<UploadProjectType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCardsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (uploadProjectType) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.[0] && onProcessBudgetFile && uploadProjectType) {
      onProcessBudgetFile(e.dataTransfer.files[0], uploadProjectType);
    }
  };

  const handleAction = (action: () => void) => {
    setIsExiting(true);
    setTimeout(action, 400);
  };

  return (
    <div
      className={`welcome-root relative min-h-screen w-full flex flex-col overflow-hidden transition-all duration-500 ${isExiting ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
    >
      {/* Subtle ambient orbs — Retail 2.0 light version */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="welcome-orb welcome-orb-1" />
        <div className="welcome-orb welcome-orb-2" />
        <div className="welcome-orb welcome-orb-3" />
      </div>

      {onNavigateToDashboard && (
        <button
          onClick={onNavigateToDashboard}
          className="absolute top-6 right-6 z-20 flex items-center gap-1.5 text-sm font-semibold text-[#78819D] hover:text-brand-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/60"
        >
          ← {dashboardLabel || 'My Budgets'}
        </button>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ══════ LEFT COLUMN ══════ */}
          <div className="space-y-7">

            {/* Logo + Platform Tag */}
            <div className={`welcome-fade-up welcome-delay-0 ${cardsVisible ? 'visible' : ''}`}>
              <div className="pb-5 border-b border-[#DFE1E5]">
                <img
                  src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
                  alt="Lima One Capital"
                  width={190}
                  height={50}
                  className="object-contain"
                  style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(44%) saturate(1200%) hue-rotate(200deg) brightness(90%) contrast(95%)' }}
                />
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#78819D] mt-2">
                  Construction Finance Platform
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className={`welcome-fade-up welcome-delay-1 ${cardsVisible ? 'visible' : ''}`}>
              <div className="welcome-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold text-brand-700">AI-Powered &middot; 2,400+ Budgets Submitted</span>
              </div>
            </div>

            {/* Headline */}
            <div className={`welcome-fade-up welcome-delay-2 ${cardsVisible ? 'visible' : ''}`}>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] text-[#1E2D5C]">
                Construction<br/>Budgeting,{' '}
                <span className="text-brand-500">Reimagined.</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl font-light text-[#78819D] max-w-lg leading-relaxed">
                From blueprint to approval — in hours, not weeks. AI-powered precision for modern builders.
              </p>
            </div>

            {/* Stats Strip */}
            <div className={`welcome-fade-up welcome-delay-3 ${cardsVisible ? 'visible' : ''}`}>
              <div className="welcome-stats-strip">
                {STATS.map((stat, i) => (
                  <div key={stat.label} className="welcome-stat-item">
                    {i > 0 && <div className="welcome-stat-divider" />}
                    <div>
                      <div className="text-2xl font-black text-[#1E2D5C] tracking-tight">{stat.value}</div>
                      <div className="text-xs font-medium text-[#78819D] uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Drop Zone */}
            {onProcessBudgetFile && (
              <div className={`welcome-fade-up welcome-delay-4 ${cardsVisible ? 'visible' : ''}`}>
                {/* Project type must be chosen before upload so the AI only maps
                    against line items that are valid for that template. */}
                <div className="mb-2.5">
                  <p className="text-[11px] font-bold text-[#78819D] uppercase tracking-wider mb-1.5">
                    What type of project is this?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadProjectType('renovation')}
                      className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg border transition-colors duration-200 ${
                        uploadProjectType === 'renovation'
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white border-[#DFE1E5] text-[#78819D] hover:border-brand-400 hover:text-brand-500'
                      }`}
                    >
                      Renovation / Value Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadProjectType('new_construction')}
                      className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg border transition-colors duration-200 ${
                        uploadProjectType === 'new_construction'
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white border-[#DFE1E5] text-[#78819D] hover:border-brand-400 hover:text-brand-500'
                      }`}
                    >
                      New Construction
                    </button>
                  </div>
                </div>

                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => uploadProjectType && fileInputRef.current?.click()}
                  aria-disabled={!uploadProjectType}
                  className={`welcome-drop-zone group relative rounded-2xl border-2 border-dashed transition-all duration-300 p-6 flex flex-col items-center justify-center
                    ${!uploadProjectType
                      ? 'border-[#DFE1E5] bg-[#F6F7F9] cursor-not-allowed opacity-60'
                      : isDragging
                        ? 'border-brand-500 bg-brand-50 scale-[1.02] cursor-pointer'
                        : 'border-[#DFE1E5] hover:border-brand-400 bg-white hover:bg-[#F7F9FC] cursor-pointer'
                    }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && uploadProjectType && onProcessBudgetFile(e.target.files[0], uploadProjectType)}
                    className="hidden"
                    accept=".csv,.xlsx,.pdf"
                    disabled={!uploadProjectType}
                  />

                  {isProcessing ? (
                    <div className="flex flex-col items-center animate-pulse py-2">
                      <SpinnerIcon className="w-10 h-10 text-brand-500 mb-3" />
                      <span className="text-brand-600 font-semibold">Analyzing Budget File...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-5 w-full">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-brand-100' : 'bg-[#F6F7F9] group-hover:bg-brand-50'}`}>
                        <CloudUploadIcon className={`w-6 h-6 transition-colors duration-300 ${isDragging ? 'text-brand-600' : 'text-[#78819D] group-hover:text-brand-500'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-bold text-[#1E2D5C] mb-0.5">
                          {isDragging ? 'Drop to Auto-Fill' : 'Have a budget file?'}
                        </h3>
                        <p className="text-xs text-[#78819D] group-hover:text-[#1E2D5C] transition-colors">
                          {uploadProjectType ? "Drop it here — we'll do the typing." : 'Select a project type above to enable upload.'}
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          {['CSV', 'XLSX', 'PDF'].map(fmt => (
                            <span key={fmt} className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#F6F7F9] text-[#78819D] border border-[#DFE1E5] tracking-wider">
                              {fmt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {budgetParsingError && (
              <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-[#FFF0EE] border border-[#F2C0BA] text-[#B92814] text-xs">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{budgetParsingError}</span>
              </div>
            )}
          </div>

          {/* ══════ RIGHT COLUMN ══════ */}
          <div className="flex flex-col gap-4">

            {/* Section label */}
            <div className={`welcome-fade-up welcome-delay-2 ${cardsVisible ? 'visible' : ''}`}>
              <p className="text-xs font-bold text-[#78819D] uppercase tracking-[0.25em]">
                How would you like to begin?
              </p>
            </div>

            {/* Primary Card — Start Fresh */}
            <div className={`welcome-fade-up welcome-delay-3 ${cardsVisible ? 'visible' : ''}`}>
              <button
                onClick={() => handleAction(() => onGetStarted('new'))}
                className="welcome-card-primary group relative w-full flex items-start gap-5 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200">
                  <span className="text-[10px] font-bold text-brand-600 tracking-wider">★ RECOMMENDED</span>
                </div>

                <div className="flex-shrink-0 w-14 h-14 rounded-xl welcome-icon-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DocumentPlusIcon className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0 pr-24">
                  <h3 className="text-xl font-bold text-[#1E2D5C] mb-1">Build My Budget</h3>
                  <p className="text-sm text-[#78819D] leading-relaxed">
                    Start a new construction budget from scratch using our smart, guided wizard.
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 text-brand-500 text-sm font-semibold">
                    <span>Get started</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* Secondary Card — Template Library */}
            <div className={`welcome-fade-up welcome-delay-4 ${cardsVisible ? 'visible' : ''}`}>
              <button
                onClick={() => onStartWithTemplate()}
                className="welcome-card-secondary group relative w-full flex items-start gap-5 p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F6F7F9] border border-[#DFE1E5] flex items-center justify-center group-hover:bg-brand-50 group-hover:border-brand-200 transition-all duration-300">
                  <FolderIcon className="w-6 h-6 text-[#78819D] group-hover:text-brand-500 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1E2D5C] mb-1">Template Library</h3>
                  <p className="text-sm text-[#78819D] leading-relaxed">
                    Use your saved 'Standard Flip' settings or saved presets.
                  </p>
                </div>
                <ChevronRightIcon className="flex-shrink-0 w-4 h-4 text-[#BCBFC7] group-hover:text-brand-500 group-hover:translate-x-1 transition-all mt-1" />
              </button>
            </div>

            {/* Advanced Tools */}
            {(onStartTutorial || onOpenEstimator || onStartWalkthrough) && (
              <div className={`welcome-fade-up welcome-delay-5 ${cardsVisible ? 'visible' : ''}`}>
                <div className="mt-2 pt-5 border-t border-[#DFE1E5]">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[10px] font-bold text-[#78819D] uppercase tracking-[0.3em]">
                      Advanced Tools
                    </p>
                    <span className="text-[9px] font-bold text-[#8A6500] uppercase tracking-widest bg-[#FFF8E6] border border-[#F5DFA0] px-1.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {onStartTutorial && (
                      <div className="welcome-tool-btn flex-1 flex flex-col items-center gap-2 p-3.5 rounded-xl opacity-50 cursor-not-allowed select-none">
                        <CompassIcon className="w-5 h-5 text-brand-500" />
                        <span className="text-[11px] font-bold text-[#78819D] leading-tight text-center">Guided<br/>Tutorial</span>
                      </div>
                    )}
                    {onOpenEstimator && (
                      <div className="welcome-tool-btn flex-1 flex flex-col items-center gap-2 p-3.5 rounded-xl opacity-50 cursor-not-allowed select-none">
                        <CalculatorIcon className="w-5 h-5 text-brand-500" />
                        <span className="text-[11px] font-bold text-[#78819D] leading-tight text-center">AI<br/>Estimator</span>
                      </div>
                    )}
                    {onStartWalkthrough && (
                      <div className="welcome-tool-btn flex-1 flex flex-col items-center gap-2 p-3.5 rounded-xl opacity-50 cursor-not-allowed select-none">
                        <CameraIcon className="w-5 h-5 text-brand-500" />
                        <span className="text-[11px] font-bold text-[#78819D] leading-tight text-center">Mobile<br/>Walkthrough</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
