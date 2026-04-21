
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

interface WelcomeScreenProps {
  onGetStarted: (type?: 'new' | 'repeat') => void;
  onStartWithTemplate: () => void;
  onOpenEstimator?: () => void;
  onStartWalkthrough?: () => void;
  onStartTutorial?: () => void;
  onProcessBudgetFile?: (file: File) => void;
  isProcessing?: boolean;
  budgetParsingError?: string | null;
}

const HERO_IMAGES = [
  '/hero-bg.png',
  '/New_Construction.png',
  '/Value_Add.png',
];

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
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [nextHeroIndex, setNextHeroIndex] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staggered card entrance
  useEffect(() => {
    const timer = setTimeout(() => setCardsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Hero image crossfade carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentHeroIndex + 1) % HERO_IMAGES.length;
      setNextHeroIndex(next);
      setIsFading(true);
      setTimeout(() => {
        setCurrentHeroIndex(next);
        setIsFading(false);
      }, 1500);
    }, 7000);
    return () => clearInterval(interval);
  }, [currentHeroIndex]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.[0] && onProcessBudgetFile) {
      onProcessBudgetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAction = (action: () => void) => {
    setIsExiting(true);
    setTimeout(action, 400);
  };

  return (
    <div
      className={`welcome-root relative min-h-screen w-full flex flex-col overflow-hidden text-white transition-all duration-500 ${isExiting ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
    >
      {/* ── Crossfading Hero Background ── */}
      <div className="absolute inset-0 z-0">
        {/* Current image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${HERO_IMAGES[currentHeroIndex]})`, opacity: 1 }}
        />
        {/* Next image fades in */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500"
          style={{ backgroundImage: `url(${HERO_IMAGES[nextHeroIndex]})`, opacity: isFading ? 1 : 0 }}
        />
        {/* Cinematic dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(10,15,35,0.88) 0%, rgba(15,30,70,0.78) 40%, rgba(10,15,35,0.85) 100%)' }}
        />
        {/* Bottom vignette for trust bar readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* ── Ambient Orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="welcome-orb welcome-orb-1" />
        <div className="welcome-orb welcome-orb-2" />
        <div className="welcome-orb welcome-orb-3" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ══════ LEFT COLUMN ══════ */}
          <div className="space-y-7 text-center lg:text-left">

            {/* Logo + Platform Tag */}
            <div className={`welcome-fade-up welcome-delay-0 ${cardsVisible ? 'visible' : ''}`}>
              <div className="inline-block pb-5 mb-0 border-b border-white/15 w-full lg:w-auto">
                <img
                  src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
                  alt="Lima One Capital"
                  width={190}
                  height={50}
                  className="object-contain mx-auto lg:mx-0"
                />
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mt-2 text-center lg:text-left">
                  Construction Finance Platform
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className={`welcome-fade-up welcome-delay-1 ${cardsVisible ? 'visible' : ''}`}>
              <div className="welcome-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold text-brand-200">AI-Powered &middot; 2,400+ Budgets Submitted</span>
              </div>
            </div>

            {/* Headline */}
            <div className={`welcome-fade-up welcome-delay-2 ${cardsVisible ? 'visible' : ''}`}>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] drop-shadow-2xl">
                Construction<br/>Budgeting,{' '}
                <span className="welcome-gradient-text">Reimagined.</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl font-light text-slate-200 max-w-lg mx-auto lg:mx-0 leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                From blueprint to approval — in hours, not weeks. AI-powered precision for modern builders.
              </p>
            </div>

            {/* Stats Strip */}
            <div className={`welcome-fade-up welcome-delay-3 ${cardsVisible ? 'visible' : ''}`}>
              <div className="welcome-stats-strip">
                {STATS.map((stat, i) => (
                  <div key={stat.label} className="welcome-stat-item">
                    {i > 0 && <div className="welcome-stat-divider" />}
                    <div className="text-center lg:text-left pl-0 lg:pl-0">
                      <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Drop Zone */}
            {onProcessBudgetFile && (
              <div className={`welcome-fade-up welcome-delay-4 ${cardsVisible ? 'visible' : ''}`}>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`welcome-drop-zone group relative rounded-2xl border-2 border-dashed transition-all duration-300 p-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden
                    ${isDragging
                      ? 'border-cyan-400 bg-cyan-900/30 scale-[1.02] shadow-[0_0_50px_rgba(6,147,227,0.4)]'
                      : 'border-white/30 hover:border-cyan-400/70 bg-slate-900/60 hover:bg-slate-800/75'
                    }`}
                >
                  {/* Scan line animation */}
                  {!isProcessing && !isDragging && (
                    <div className="welcome-scan-line" />
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && onProcessBudgetFile(e.target.files[0])}
                    className="hidden"
                    accept=".csv,.xlsx,.pdf"
                  />

                  {isProcessing ? (
                    <div className="flex flex-col items-center animate-pulse py-2">
                      <SpinnerIcon className="w-10 h-10 text-brand-400 mb-3" />
                      <span className="text-brand-200 font-semibold">Analyzing Budget File...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-5 w-full">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-cyan-500/30' : 'bg-white/10 group-hover:bg-brand-500/25'}`}>
                        <CloudUploadIcon className={`w-6 h-6 transition-colors duration-300 ${isDragging ? 'text-cyan-300' : 'text-white group-hover:text-brand-300'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base font-bold text-white mb-0.5">
                          {isDragging ? 'Drop to Auto-Fill' : 'Have a budget file?'}
                        </h3>
                        <p className="text-xs text-slate-300 group-hover:text-white transition-colors">
                          Drop it here — we'll do the typing.
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          {['CSV', 'XLSX', 'PDF'].map(fmt => (
                            <span key={fmt} className="px-2 py-0.5 text-[10px] font-bold rounded bg-white/10 text-slate-300 border border-white/10 tracking-wider">
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
              <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-[#B92814]/20 border border-[#B92814]/40 text-[#F2C0BA] text-xs">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{budgetParsingError}</span>
              </div>
            )}
          </div>

          {/* ══════ RIGHT COLUMN ══════ */}
          <div className="flex flex-col gap-4">

            {/* Section label */}
            <div className={`welcome-fade-up welcome-delay-2 ${cardsVisible ? 'visible' : ''}`}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] text-center lg:text-left">
                How would you like to begin?
              </p>
            </div>

            {/* Primary Card — Start Fresh (Recommended) */}
            <div className={`welcome-fade-up welcome-delay-3 ${cardsVisible ? 'visible' : ''}`}>
              <button
                onClick={() => handleAction(() => onGetStarted('new'))}
                className="welcome-card-primary group relative w-full flex items-start gap-5 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1"
              >
                {/* Recommended badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30">
                  <span className="text-[10px] font-bold text-brand-300 tracking-wider">★ RECOMMENDED</span>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-xl welcome-icon-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DocumentPlusIcon className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0 pr-24">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-200 transition-colors">Build My Budget</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Start a new construction budget from scratch using our smart, guided wizard.
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 text-brand-400 text-sm font-semibold">
                    <span>Get started</span>
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* Secondary Card — Template Library */}
            <div className={`welcome-fade-up welcome-delay-4 ${cardsVisible ? 'visible' : ''}`}>
              <button
                onClick={() => handleAction(onStartWithTemplate)}
                className="welcome-card-secondary group relative w-full flex items-start gap-5 p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:border-brand-400/30 transition-all duration-300">
                  <FolderIcon className="w-6 h-6 text-slate-300 group-hover:text-brand-300 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">Template Library</h3>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    Use your saved 'Standard Flip' settings or saved presets.
                  </p>
                </div>
                <ChevronRightIcon className="flex-shrink-0 w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all mt-1" />
              </button>
            </div>

            {/* Power Tools — Horizontal utility bar */}
            {(onStartTutorial || onOpenEstimator || onStartWalkthrough) && (
              <div className={`welcome-fade-up welcome-delay-5 ${cardsVisible ? 'visible' : ''}`}>
                <div className="mt-2 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                      Advanced Tools
                    </p>
                    <span className="text-[9px] font-bold text-amber-400/90 uppercase tracking-widest bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {onStartTutorial && (
                      <div
                        className="welcome-tool-btn flex-1 flex flex-col items-center gap-2 p-3.5 rounded-xl opacity-50 cursor-not-allowed select-none"
                      >
                        <CompassIcon className="w-5 h-5 text-brand-400" />
                        <span className="text-[11px] font-bold text-slate-400 leading-tight text-center">Guided<br/>Tutorial</span>
                      </div>
                    )}
                    {onOpenEstimator && (
                      <div
                        className="welcome-tool-btn flex-1 flex flex-col items-center gap-2 p-3.5 rounded-xl opacity-50 cursor-not-allowed select-none"
                      >
                        <CalculatorIcon className="w-5 h-5 text-brand-400" />
                        <span className="text-[11px] font-bold text-slate-400 leading-tight text-center">AI<br/>Estimator</span>
                      </div>
                    )}
                    {onStartWalkthrough && (
                      <div
                        className="welcome-tool-btn flex-1 flex flex-col items-center gap-2 p-3.5 rounded-xl opacity-50 cursor-not-allowed select-none"
                      >
                        <CameraIcon className="w-5 h-5 text-brand-400" />
                        <span className="text-[11px] font-bold text-slate-400 leading-tight text-center">Mobile<br/>Walkthrough</span>
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
