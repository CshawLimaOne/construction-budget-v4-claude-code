
import React, { useState, useRef } from 'react';
import { 
    CloudUploadIcon, 
    FolderIcon, 
    DocumentPlusIcon, 
    SpinnerIcon, 
    CheckCircleIcon,
    CameraIcon,
    CompassIcon,
    CalculatorIcon
} from './Icons';

interface WelcomeScreenProps {
  onGetStarted: (type?: 'new' | 'repeat') => void;
  onStartWithTemplate: () => void;
  onOpenEstimator?: () => void; 
  onStartWalkthrough?: () => void;
  onStartTutorial?: () => void;
  onProcessBudgetFile?: (file: File) => void;
  isProcessing?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    onGetStarted, 
    onStartWithTemplate, 
    onOpenEstimator, 
    onStartWalkthrough, 
    onStartTutorial,
    onProcessBudgetFile,
    isProcessing = false
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onProcessBudgetFile) {
        onProcessBudgetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAction = (action: () => void) => {
      setIsExiting(true);
      setTimeout(() => {
          action();
      }, 400); // Wait for exit animation
  };

  return (
    <div
        className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden text-white p-4 transition-opacity duration-500 ${isExiting ? 'opacity-0 translate-y-10' : 'opacity-100'}`}
        style={{ backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
    >
        {/* Dark overlay — lets the house/sunset image show through faintly while keeping text readable */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.72) 0%, rgba(30,46,92,0.62) 50%, rgba(15,23,42,0.75) 100%)' }}></div>

        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content: Branding & Drop Zone */}
            <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-2">
                    <img src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp" alt="Lima One Capital" width={160} height={42} className="object-contain" />
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-lg" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                        Construction <br/>
                        <span className="text-white" style={{ textShadow: '0 2px 16px rgba(0,0,0,1)' }}>Budgeting, Reimagined.</span>
                    </h1>
                    <p className="text-white text-lg md:text-xl font-light max-w-lg mx-auto lg:mx-0" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                        The fastest path from estimate to approval. AI-powered precision for modern builders.
                    </p>
                </div>

                {/* AI Drop Zone */}
                {onProcessBudgetFile && (
                    <div 
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-out p-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden
                            ${isDragging
                                ? 'border-cyan-400 bg-blue-900/60 scale-[1.02] shadow-[0_0_40px_rgba(6,147,227,0.5)]'
                                : 'border-white/40 hover:border-cyan-400 hover:bg-slate-800/80 bg-slate-900/70'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {/* Glow Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/0 to-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={(e) => e.target.files?.[0] && onProcessBudgetFile(e.target.files[0])} 
                            className="hidden" 
                            accept=".csv,.xlsx,.pdf"
                        />

                        {isProcessing ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <SpinnerIcon className="w-12 h-12 text-brand-400 mb-3" />
                                <span className="text-brand-200 font-medium">Analyzing Budget File...</span>
                            </div>
                        ) : (
                            <>
                                <CloudUploadIcon className={`w-12 h-12 mb-3 transition-colors duration-300 ${isDragging ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`} />
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {isDragging ? 'Drop to Auto-Fill' : 'Have a budget file?'}
                                </h3>
                                <p className="text-sm text-slate-200 group-hover:text-white transition-colors">
                                    Drop it here. We'll do the typing.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Right Content: Identity Cards */}
            <div className="flex flex-col gap-6">
                <div className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-center lg:text-left" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                    Or start manually:
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card A: Start Fresh */}
                    <button 
                        onClick={() => handleAction(() => onGetStarted('new'))}
                        className="group relative flex flex-col p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/25 hover:bg-slate-800/90 hover:border-cyan-400/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-left h-full"
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                            <DocumentPlusIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Start Fresh</h3>
                        <p className="text-sm text-slate-200 leading-relaxed">
                            Build a new budget from scratch using our smart wizard.
                        </p>
                    </button>

                    {/* Card B: Template Library */}
                    <button 
                        onClick={() => handleAction(onStartWithTemplate)}
                        className="group relative flex flex-col p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/25 hover:bg-slate-800/90 hover:border-cyan-400/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-left h-full"
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                            <FolderIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Template Library</h3>
                        <p className="text-sm text-slate-200 leading-relaxed">
                            Use your saved 'Standard Flip' settings or presets.
                        </p>
                    </button>
                </div>

                {/* Advanced Tools Section */}
                <div className="mt-6 pt-6 border-t border-white/25">
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3 text-center lg:text-left">
                        Power Tools
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {onStartTutorial && (
                            <button 
                                onClick={() => handleAction(onStartTutorial)} 
                                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/75 border border-white/25 hover:bg-slate-800/90 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,147,227,0.3)] transition-all duration-300 text-center"
                            >
                                <CompassIcon className="w-6 h-6 text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white leading-tight">Guided<br/>Tutorial</span>
                            </button>
                        )}
                        {onOpenEstimator && (
                            <button
                                onClick={() => handleAction(onOpenEstimator)}
                                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/75 border border-white/25 hover:bg-slate-800/90 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,147,227,0.3)] transition-all duration-300 text-center"
                            >
                                <CalculatorIcon className="w-6 h-6 text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white leading-tight">AI<br/>Estimator</span>
                            </button>
                        )}
                        {onStartWalkthrough && (
                            <button 
                                onClick={() => handleAction(onStartWalkthrough)} 
                                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/75 border border-white/25 hover:bg-slate-800/90 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,147,227,0.3)] transition-all duration-300 text-center"
                            >
                                <CameraIcon className="w-6 h-6 text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white leading-tight">Mobile<br/>Walkthrough</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
