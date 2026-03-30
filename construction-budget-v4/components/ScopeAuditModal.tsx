
import React, { useState, useRef, useEffect } from 'react';
import { ComplexModal } from './ComplexModal';
import { GoogleGenAI } from '@google/genai';
import { BudgetCategoryData, ScopeAuditResult, ScopeAuditFinding } from '../types';
import { AUDITOR_SYSTEM_INSTRUCTION, AUDITOR_JSON_SCHEMA } from '../constants';
import { SpinnerIcon, WarningTriangleIcon, CheckCircleIcon, CloudUploadIcon, CameraIcon } from './Icons';
import { ShowToastFn } from './Toast';

interface ScopeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetData: BudgetCategoryData[];
  onToast?: ShowToastFn;
}

export const ScopeAuditModal: React.FC<ScopeAuditModalProps> = ({ isOpen, onClose, budgetData, onToast }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [auditResult, setAuditResult] = useState<ScopeAuditResult | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setStep('upload');
        setUploadedFiles([]);
        setFilePreviews([]);
        setAuditResult(null);
        setProgressMessage('');
      }, 300);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Explicitly type newFiles as File[] to resolve TS errors with FileList iteration
      const newFiles: File[] = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Generate previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRunAudit = async () => {
    if (uploadedFiles.length === 0) return;
    
    setStep('processing');
    setProgressMessage('Initializing Auditor Agent...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Prepare Budget Context (Text)
      // Flatten budget into a readable string for the AI
      const budgetContext = budgetData.flatMap(cat => 
        cat.items
          .filter(item => item.budget > 0) // Only send what IS budgeted
          .map(item => `${cat.name}: ${item.drawItem} ($${item.budget})`)
      ).join('\n');

      setProgressMessage('Indexing Budget Line Items...');
      await new Promise(r => setTimeout(r, 800)); // UX pause

      // 2. Prepare Visual Context (Images)
      setProgressMessage('Scanning Visual Evidence...');
      const imageParts = await Promise.all(uploadedFiles.map(async (file) => {
        return new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
              inlineData: {
                data: base64String,
                mimeType: file.type
              }
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }));

      // 3. Construct Prompt
      setProgressMessage('Cross-referencing Scope...');
      
      const parts = [
        { text: `**CURRENT BUDGET CONTEXT:**\n${budgetContext || "No budget items found."}\n` },
        ...imageParts
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          systemInstruction: AUDITOR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: AUDITOR_JSON_SCHEMA,
          temperature: 0.1 // Low temperature for strict logic
        },
      });

      const result = JSON.parse(response.text) as ScopeAuditResult;
      setAuditResult(result);
      setStep('results');

    } catch (error) {
      console.error("Audit failed:", error);
      onToast?.("Audit failed. Please try again.", 'error');
      setStep('upload');
    }
  };

  const getSeverityBadge = (severity: ScopeAuditFinding['severity']) => {
    switch(severity) {
      case 'Critical': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold border border-red-200">CRITICAL DISCREPANCY</span>;
      case 'Medium': return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200">MEDIUM RISK</span>;
      case 'Low': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold border border-yellow-200">LOW RISK</span>;
      case 'verified': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200">VERIFIED SCOPE</span>;
      default: return null;
    }
  };

  const renderFindings = (findings: ScopeAuditFinding[], title: string, emptyMessage: string, isRiskSection: boolean) => (
      <div className={`rounded-lg border overflow-hidden mb-6 ${isRiskSection ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900' : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900'}`}>
          <div className={`px-4 py-3 font-bold flex items-center ${isRiskSection ? 'text-red-800 dark:text-red-200 bg-red-100/50' : 'text-green-800 dark:text-green-200 bg-green-100/50'}`}>
              {isRiskSection ? <WarningTriangleIcon className="w-5 h-5 mr-2" /> : <CheckCircleIcon className="w-5 h-5 mr-2" />}
              {title} ({findings.length})
          </div>
          <div className="p-4 space-y-4">
              {findings.length === 0 ? (
                  <p className="text-sm italic text-slate-500 dark:text-slate-400">{emptyMessage}</p>
              ) : (
                  findings.map((finding, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                          {/* Left: Visual Evidence */}
                          <div className="w-full md:w-1/4 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 relative group">
                              {finding.photoIndex !== undefined && filePreviews[finding.photoIndex] ? (
                                  <>
                                    <img src={filePreviews[finding.photoIndex]} alt="Evidence" className="max-h-32 object-contain rounded" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                        <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Photo #{finding.photoIndex + 1}</span>
                                    </div>
                                  </>
                              ) : (
                                  <div className="text-xs text-slate-400 flex flex-col items-center">
                                      <CameraIcon className="w-8 h-8 mb-1" />
                                      <span>No Image</span>
                                  </div>
                              )}
                          </div>

                          {/* Right: Finding Details */}
                          <div className="p-4 flex-grow flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                  {getSeverityBadge(finding.severity)}
                              </div>
                              
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                  {finding.observation}
                              </p>
                              
                              <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center text-sm">
                                  {finding.severity === 'verified' ? (
                                      <span className="text-green-700 dark:text-green-400 flex items-center font-medium">
                                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                                          Matched: {finding.missingCategoryOrItem}
                                      </span>
                                  ) : (
                                      <span className="text-red-600 dark:text-red-400 flex items-center font-medium">
                                          <WarningTriangleIcon className="w-4 h-4 mr-2" />
                                          Missing/Discrepancy: {finding.missingCategoryOrItem}
                                      </span>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  const footer = (
    <>
      <button onClick={onClose} className="button-base bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
        Close
      </button>
      {step === 'upload' && (
        <button 
          onClick={handleRunAudit} 
          disabled={uploadedFiles.length === 0}
          className="button-base bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Run Scope Audit
        </button>
      )}
    </>
  );

  return (
    <ComplexModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="AI Scope Auditor" 
      footer={footer} 
      size="xl"
    >
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border-l-4 border-brand-500">
            <h4 className="font-bold text-brand-900 dark:text-brand-100 mb-1">Analyst Control Panel</h4>
            <p className="text-sm text-brand-800 dark:text-brand-300">
              Upload the <strong>Property Inspection Report</strong> or site photos here. The AI Agent will cross-reference visual defects against the Borrower's Budget to identify missing line items (Scope Gap) and verify matched items.
            </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CloudUploadIcon className="w-12 h-12 text-slate-400 mb-4" />
            <span className="text-lg font-medium text-slate-700 dark:text-slate-200">Upload Inspection Photos / PDF</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {uploadedFiles.length > 0 ? `${uploadedFiles.length} files selected` : "Drag & drop or click to browse"}
            </span>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple 
                accept="image/*,.pdf" 
            />
          </div>

          {filePreviews.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {filePreviews.slice(0, 12).map((src, i) => (
                    <img key={i} src={src} alt="preview" className="w-full h-20 object-cover rounded shadow-sm" />
                ))}
                {filePreviews.length > 12 && (
                    <div className="w-full h-20 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500 rounded">
                        +{filePreviews.length - 12} more
                    </div>
                )}
            </div>
          )}
        </div>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <CameraIcon className="w-6 h-6 text-brand-600" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Auditing Scope...</h3>
                <p className="text-sm font-mono text-slate-500 dark:text-slate-400 animate-pulse">
                    &gt; {progressMessage}
                </p>
            </div>
        </div>
      )}

      {step === 'results' && auditResult && (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Audit Summary</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{auditResult.summary}"</p>
                </div>
            </div>

            {/* Split Findings into Risks and Verified */}
            {(() => {
                const risks = auditResult.findings.filter(f => f.severity !== 'verified');
                const verified = auditResult.findings.filter(f => f.severity === 'verified');

                return (
                    <div>
                        {renderFindings(risks, 'Scope Gaps & Discrepancies', 'No scope gaps detected. All visual defects appear to be budgeted.', true)}
                        {renderFindings(verified, 'Verified Scope Matches', 'No matched items explicitly verified.', false)}
                    </div>
                );
            })()}
        </div>
      )}
    </ComplexModal>
  );
};
