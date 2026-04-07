
import React, { useState, useRef, useEffect } from 'react';
import { GeneralContractor, GcDocument, ProjectDocument } from '../types';
import { XCircleIcon, CheckCircleIcon, ClipboardCheckIcon, ClipboardUserIcon, CloudUploadIcon } from './Icons';
import { MOCK_SAVED_GC_PROFILE } from '../constants';

interface Step2ContractorProps {
    generalContractor: GeneralContractor;
    selectedRehabType: string;
    isGcOnboardingComplete: boolean;
    projectDocuments: ProjectDocument[];
    isLocked?: boolean;
    scrollToFieldId: string | null;
    onScrollComplete: () => void;
    onGeneralContractorChange: (field: keyof GeneralContractor, value: string) => void;
    onGeneralContractorDocChange: (docType: 'gcLicenseDoc' | 'driversLicenseDoc' | 'generalLiabilityDoc' | 'workersCompDoc', file: File | null) => void;
    onRemoveGeneralContractorDoc: (docType: 'gcLicenseDoc' | 'driversLicenseDoc' | 'generalLiabilityDoc' | 'workersCompDoc') => void;
    onOpenGcOnboarding: (options?: { blank?: boolean }) => void;
    onAddProjectDocument: (doc: ProjectDocument) => void;
    onRemoveProjectDocument: (index: number) => void;
    highlightMissingFields?: boolean; // New prop
    isRepeatUser?: boolean; // New Prop to enable Quick Confirm
}

type GcDocUploadKey = 'gcLicenseDoc' | 'driversLicenseDoc' | 'generalLiabilityDoc' | 'workersCompDoc';

interface GcDocUploadRowProps {
    docType: GcDocUploadKey;
    label: React.ReactNode;
    doc: GcDocument | null | undefined;
    isLocked?: boolean;
    onDocChange: (docType: GcDocUploadKey, file: File | null) => void;
    onRemoveDoc: (docType: GcDocUploadKey) => void;
    isRequired?: boolean; // New prop
    highlight?: boolean; // New prop
}

const GcDocUploadRow: React.FC<GcDocUploadRowProps> = ({ docType, label, doc, isLocked, onDocChange, onRemoveDoc, isRequired, highlight }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onDocChange(docType, file);
    };

    const handleRemove = () => {
        onRemoveDoc(docType);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between py-4 px-3 rounded-xl border border-white/5 bg-white/5 mb-2 hover:border-white/10 transition-colors ${highlight && !doc && isRequired ? 'border-red-500/50 bg-red-900/10' : ''}`}>
            <span className="font-medium text-slate-200 mb-2 sm:mb-0 flex items-center">
                {label}
                {!isRequired && <span className="ml-2 text-xs font-normal text-slate-500 italic">(Optional)</span>}
            </span>
            <div className="flex items-center space-x-3">
                {doc ? (
                    <>
                        <div className="flex items-center bg-brand-500/20 px-3 py-1.5 rounded-full border border-brand-500/30">
                            <CheckCircleIcon className="w-4 h-4 text-brand-400 mr-2" />
                            <span className="text-sm text-brand-100 truncate max-w-xs">{doc.name}</span>
                        </div>
                        {!isLocked && (
                            <button 
                                onClick={handleRemove} 
                                className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-900/20 transition-colors"
                                aria-label="Remove document"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id={`gc-doc-upload-${docType}`} disabled={isLocked} />
                        <label htmlFor={`gc-doc-upload-${docType}`} className={`button-base text-xs py-2 px-4 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <CloudUploadIcon className="w-4 h-4 mr-2" />
                            Upload
                        </label>
                    </>
                )}
            </div>
        </div>
    );
};


export const Step2Contractor: React.FC<Step2ContractorProps> = ({
    generalContractor,
    selectedRehabType,
    isGcOnboardingComplete,
    projectDocuments,
    isLocked,
    scrollToFieldId,
    onScrollComplete,
    onGeneralContractorChange,
    onGeneralContractorDocChange,
    onRemoveGeneralContractorDoc,
    onOpenGcOnboarding,
    onAddProjectDocument,
    onRemoveProjectDocument,
    highlightMissingFields,
    isRepeatUser = false
}) => {
    // Logic for GC requirement based on user request - Light-Cosmetic and Standard-Full exempt GC
    const isGcRequired = selectedRehabType === 'Heavy' || selectedRehabType === 'New Construction';

    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const [newDocType, setNewDocType] = useState<ProjectDocument['type']>('Architectural Plan');
    const [newDocDescription, setNewDocDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [inviteLink] = useState(`https://portal.limaone.com/onboard/gc/${Math.random().toString(36).substring(2, 10)}`);
    const [isCopied, setIsCopied] = useState(false);
    const [usingSavedProfile, setUsingSavedProfile] = useState(false); // Track if using saved

    useEffect(() => {
        if (scrollToFieldId) {
            const mapFieldIdToDomId = (fieldId: string): string | null => {
                if (fieldId.startsWith('generalContractor.')) {
                    const field = fieldId.split('.')[1];
                    if (field === 'businessName') return 'gc-business-name';
                    if (field === 'performerType') return 'gc-performer-type';
                }
                return null;
            };

            const elementId = mapFieldIdToDomId(scrollToFieldId);
            if (elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus({ preventScroll: true });
                }
            }
            onScrollComplete();
        }
    }, [scrollToFieldId, onScrollComplete]);

    // Effect: If usingSavedProfile is toggled, hydrate form
    useEffect(() => {
        if (usingSavedProfile) {
            // Simulate Hydration
            onGeneralContractorChange('performerType', 'General Contractor');
            onGeneralContractorChange('businessName', MOCK_SAVED_GC_PROFILE.businessName);
            onGeneralContractorDocChange('gcLicenseDoc', MOCK_SAVED_GC_PROFILE.gcLicenseDoc?.file || null);
            onGeneralContractorDocChange('generalLiabilityDoc', MOCK_SAVED_GC_PROFILE.generalLiabilityDoc?.file || null);
            onGeneralContractorDocChange('driversLicenseDoc', MOCK_SAVED_GC_PROFILE.driversLicenseDoc?.file || null);
        }
    }, [usingSavedProfile]);
  
    const handleAddDoc = () => {
      if (newDocFile) {
        onAddProjectDocument({
          file: newDocFile,
          name: newDocFile.name,
          type: newDocType,
          description: newDocDescription,
        });
        setNewDocFile(null);
        setNewDocType('Architectural Plan');
        setNewDocDescription('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleQuickConfirm = () => {
        setUsingSavedProfile(true);
    };

    const handleSwitchToNew = () => {
        setUsingSavedProfile(false);
        // Reset key fields
        onGeneralContractorChange('businessName', '');
        onGeneralContractorChange('performerType', '');
        onRemoveGeneralContractorDoc('gcLicenseDoc');
        onRemoveGeneralContractorDoc('generalLiabilityDoc');
        onRemoveGeneralContractorDoc('driversLicenseDoc');
    };
    
    return (
        <>
            {/* ── Step Hero ── */}
            <div className="step1-hero mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-500/15 border border-brand-400/25 text-brand-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        GC &amp; Documents
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-medium">Step 2 of 4</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">General Contractor &amp; Documents</h1>
                <p className="text-sm text-slate-400 mt-1 max-w-xl">
                    Add your GC information and upload required project documents for review.
                </p>
            </div>

            {/* Quick Confirm Card for Repeat Users */}
            {isRepeatUser && isGcRequired && (
                <div className="section-container mb-6 bg-brand-900/20 border-brand-500/30 backdrop-blur-sm">
                    <div className="p-5 flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h4 className="font-bold text-lg text-brand-100 flex items-center">
                                Welcome back!
                            </h4>
                            <p className="text-sm text-brand-200 mt-1">
                                Are you acting as the General Contractor ({MOCK_SAVED_GC_PROFILE.businessName}) for this project?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSwitchToNew}
                                className={`px-4 py-2 rounded-md text-sm font-bold border transition-colors ${!usingSavedProfile ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-brand-400/50 text-brand-300 hover:bg-brand-900/30'}`}
                            >
                                No, use different GC
                            </button>
                            <button
                                onClick={handleQuickConfirm}
                                disabled={usingSavedProfile}
                                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-colors ${usingSavedProfile ? 'bg-green-600 text-white cursor-default' : 'bg-[#32373c] text-white hover:bg-[#4a5056] shadow-lg'}`}
                            >
                                {usingSavedProfile && <CheckCircleIcon className="w-4 h-4 mr-2" />}
                                {usingSavedProfile ? 'Confirmed' : 'Yes, use saved profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isGcRequired && (
                <div className="flex items-start gap-4 bg-emerald-950/40 border border-emerald-700/40 rounded-2xl p-5 mb-6">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-300 text-sm uppercase tracking-wide mb-1">General Contractor Not Required</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            For <span className="font-semibold text-white">{selectedRehabType}</span> projects, providing GC information is optional. You may skip this section if you are managing the project yourself.
                        </p>
                    </div>
                </div>
            )}

            <div id="gc-info-section" className="section-container">
                <h3 className="section-title flex justify-between items-center">
                    <span>General Contractor Information</span>
                    {selectedRehabType && (
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                isGcRequired
                                ? 'bg-red-500/20 text-red-200 border border-red-500/50'
                                : 'bg-green-500/20 text-green-200 border border-green-500/50'
                            }`}
                        >
                            {isGcRequired ? 'Required' : 'Optional'}
                        </span>
                    )}
                </h3>
                <div className="p-5 bg-transparent space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="gc-performer-type" className="block text-sm font-semibold text-slate-300 mb-2">Who is performing the construction work?</label>
                            {usingSavedProfile ? (
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-sm font-semibold text-slate-200">
                                    General Contractor
                                </div>
                            ) : (
                                <select
                                    id="gc-performer-type"
                                    value={generalContractor.performerType}
                                    onChange={(e) => {
                                        onGeneralContractorChange('performerType', e.target.value);
                                        // Clear business name if switching to self-managed
                                        if (e.target.value === 'Self-Managed') {
                                            onGeneralContractorChange('businessName', '');
                                        }
                                    }}
                                    className={`form-input-premium w-full ${highlightMissingFields && isGcRequired && !generalContractor.performerType ? 'border-red-500 ring-1 ring-red-500 bg-red-900/10' : ''}`}
                                    disabled={isLocked}
                                >
                                    <option value="">Select...</option>
                                    <option value="Self-Managed">I am self-managing (hiring subcontractors)</option>
                                    <option value="General Contractor">I am hiring a General Contractor</option>
                                </select>
                            )}
                        </div>
                        {(generalContractor.performerType === 'General Contractor' || usingSavedProfile) && (
                            <div className="animate-in fade-in duration-300">
                                <label htmlFor="gc-business-name" className="block text-sm font-semibold text-slate-300 mb-2">General Contractor Name</label>
                                <input
                                    type="text"
                                    id="gc-business-name"
                                    value={generalContractor.businessName}
                                    onChange={(e) => onGeneralContractorChange('businessName', e.target.value)}
                                    className={`form-input-premium w-full ${highlightMissingFields && isGcRequired && !generalContractor.businessName ? 'border-red-500 ring-1 ring-red-500 bg-red-900/10' : ''} ${usingSavedProfile ? 'opacity-70' : ''}`}
                                    placeholder="ABC Construction, LLC"
                                    disabled={isLocked || usingSavedProfile}
                                />
                            </div>
                        )}
                    </div>
                    {/* Only show upload section if GC selected OR if it is required */}
                    {(generalContractor.performerType === 'General Contractor' || isGcRequired) && (
                        <>
                            {/* GC Onboarding Dual Options - Hide if using Saved Profile */}
                            {!usingSavedProfile && (
                                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                                        <h4 className="font-bold text-slate-100 text-lg flex items-center">
                                            <ClipboardUserIcon className="w-6 h-6 mr-3 text-brand-400" />
                                            GC Onboarding
                                        </h4>
                                        {isGcOnboardingComplete ? (
                                            <span className="flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                                                <CheckCircleIcon className="w-4 h-4 mr-1"/> Profile Complete
                                            </span>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isGcRequired ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' : 'bg-slate-700/60 text-slate-300 border border-white/10'}`}>
                                                {isGcRequired ? 'Action Required' : 'Optional Step'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Option 1: Invite */}
                                        <div className="relative flex flex-col p-5 rounded-xl border-2 border-white/10 bg-brand-900/10 hover:border-brand-500/40 transition-all duration-300 overflow-hidden">
                                            {/* Top-border accent — brand blue */}
                                            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, rgba(6,147,227,0.8), transparent)' }} />
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-400/25 text-brand-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                                        Option 1
                                                    </span>
                                                </div>
                                                <h5 className="font-bold text-brand-300 text-lg mb-2">Invite Contractor</h5>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    Copy and send this secure link to your GC. They can upload licenses, insurance, and complete their profile independently.
                                                </p>
                                            </div>
                                            <div className="mt-auto space-y-3">
                                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={inviteLink}
                                                        className="w-full bg-transparent border-none text-xs text-slate-300 focus:ring-0"
                                                    />
                                                    <button
                                                        onClick={handleCopyLink}
                                                        disabled={isLocked}
                                                        className={`flex-shrink-0 button-base text-xs py-1.5 px-3 flex items-center justify-center transition-all duration-200 min-w-[80px] h-8 ${
                                                            isCopied
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-[#0693e3] text-white hover:bg-[#0578c5]'
                                                        }`}
                                                    >
                                                        {isCopied ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-500 italic text-center">
                                                    Link expires in 7 days.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Option 2: Manual Entry */}
                                        <div className="relative flex flex-col p-5 rounded-xl border-2 border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden">
                                            {/* Top-border accent — neutral */}
                                            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, rgba(100,116,139,0.6), transparent)' }} />
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        Option 2
                                                    </span>
                                                </div>
                                                <h5 className="font-bold text-slate-200 text-lg mb-2">Fill Out Manually</h5>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    If you are the GC or have the information ready (Licenses, Insurance, Bio), you can complete the onboarding form right now.
                                                </p>
                                            </div>
                                            <div className="mt-auto">
                                                <button
                                                    onClick={() => onOpenGcOnboarding()}
                                                    disabled={isLocked}
                                                    className="w-full button-base text-sm py-3 bg-[#0693e3] text-white hover:bg-[#0578c5] transition-colors flex items-center justify-center shadow-lg"
                                                >
                                                    <ClipboardCheckIcon className="w-5 h-5 mr-2" /> Complete Profile Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Saved Profile View */}
                            {usingSavedProfile ? (
                                <div className="p-5 bg-green-900/20 rounded-xl border border-green-500/30">
                                    <h4 className="font-bold text-green-300 mb-3 flex items-center text-lg">
                                        <CheckCircleIcon className="w-6 h-6 mr-2" />
                                        Profile Validated
                                    </h4>
                                    <p className="text-sm text-green-100 mb-4">
                                        We have current documentation on file for <strong>{MOCK_SAVED_GC_PROFILE.businessName}</strong>. No upload required.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-green-500/20 pb-2">
                                            <span className="text-slate-300">GC License ({MOCK_SAVED_GC_PROFILE.savedDocs.gcLicenseDoc.name})</span>
                                            <span className="font-mono font-bold text-green-400">Exp: {MOCK_SAVED_GC_PROFILE.savedDocs.gcLicenseDoc.expiry}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-green-500/20 pb-2">
                                            <span className="text-slate-300">General Liability</span>
                                            <span className="font-mono font-bold text-green-400">Exp: {MOCK_SAVED_GC_PROFILE.savedDocs.generalLiabilityDoc.expiry}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="font-bold text-slate-100 mb-4 text-lg">Required Documents (Upload here or via Link)</h4>
                                    <div className="space-y-2">
                                        <GcDocUploadRow
                                            docType="gcLicenseDoc"
                                            label="GC License"
                                            doc={generalContractor.gcLicenseDoc}
                                            isLocked={isLocked}
                                            onDocChange={onGeneralContractorDocChange}
                                            onRemoveDoc={onRemoveGeneralContractorDoc}
                                            highlight={highlightMissingFields}
                                            isRequired={isGcRequired}
                                        />
                                        <GcDocUploadRow
                                            docType="driversLicenseDoc"
                                            label="Driver's License"
                                            doc={generalContractor.driversLicenseDoc}
                                            isLocked={isLocked}
                                            onDocChange={onGeneralContractorDocChange}
                                            onRemoveDoc={onRemoveGeneralContractorDoc}
                                            highlight={highlightMissingFields}
                                            isRequired={isGcRequired}
                                        />
                                        <GcDocUploadRow
                                            docType="generalLiabilityDoc"
                                            label="General Liability Insurance"
                                            doc={generalContractor.generalLiabilityDoc}
                                            isLocked={isLocked}
                                            onDocChange={onGeneralContractorDocChange}
                                            onRemoveDoc={onRemoveGeneralContractorDoc}
                                            highlight={highlightMissingFields}
                                            isRequired={isGcRequired}
                                        />
                                        <GcDocUploadRow
                                            docType="workersCompDoc"
                                            label={
                                                <>
                                                    Workmen's Comp Insurance
                                                    <span className="text-xs text-slate-500 ml-1 italic">*If required by state*</span>
                                                </>
                                            }
                                            doc={generalContractor.workersCompDoc}
                                            isLocked={isLocked}
                                            onDocChange={onGeneralContractorDocChange}
                                            onRemoveDoc={onRemoveGeneralContractorDoc}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div id="project-documents-section" className="section-container mt-6">
                <h3 className="section-title flex justify-between items-center">
                    <span>Project Documents (Plans & Permits)</span>
                    {selectedRehabType && (
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                isGcRequired
                                ? 'bg-red-500/20 text-red-200 border border-red-500/50'
                                : 'bg-white/10 text-slate-300 border border-white/20'
                            }`}
                        >
                            {isGcRequired ? 'Required' : 'Recommended / Optional'}
                        </span>
                    )}
                </h3>
                <div className="p-5 bg-transparent space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border border-white/10 rounded-xl bg-white/5">
                    <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Document File</label>
                    <input
                        ref={fileInputRef}
                        id="doc-file-input"
                        type="file"
                        onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                        disabled={isLocked}
                    />
                    <label
                        htmlFor="doc-file-input"
                        className={`flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-400/20 flex items-center justify-center">
                            <CloudUploadIcon className="w-5 h-5 text-brand-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {newDocFile ? (
                                <span className="text-sm font-medium text-brand-200 truncate block">{newDocFile.name}</span>
                            ) : (
                                <span className="text-sm text-slate-400">Click to choose a file&hellip;</span>
                            )}
                            <span className="text-[10px] text-slate-500 mt-0.5 block">PDF, DWG, XLSX, DOC accepted</span>
                        </div>
                    </label>
                    </div>
                    <div>
                    <label htmlFor="doc-type-select" className="block text-sm font-semibold text-slate-300 mb-2">Document Type</label>
                    <select
                        id="doc-type-select"
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as ProjectDocument['type'])}
                        className="mt-1 form-input-premium w-full"
                        disabled={isLocked}
                    >
                        <option>Architectural Plan</option>
                        <option>Structural Plan</option>
                        <option>Site Plan</option>
                        <option>Spec Sheet</option>
                        <option>Permit</option>
                        <option>Other</option>
                    </select>
                    </div>
                    <div className="md:col-span-3">
                    <label htmlFor="doc-desc-input" className="block text-sm font-semibold text-slate-300 mb-2">Description (Optional)</label>
                    <textarea
                        id="doc-desc-input"
                        rows={1}
                        value={newDocDescription}
                        onChange={(e) => {
                            setNewDocDescription(e.target.value);
                            const textarea = e.currentTarget;
                            textarea.style.height = 'auto';
                            textarea.style.height = `${textarea.scrollHeight}px`;
                        }}
                        placeholder="e.g., 'Approved kitchen remodel permit'"
                        className="mt-1 form-input-premium w-full resize-none overflow-hidden"
                        disabled={isLocked}
                    />
                    </div>
                    <div className="md:col-span-1">
                    <button
                        onClick={handleAddDoc}
                        disabled={!newDocFile || isLocked}
                        className="button-base w-full bg-[#0693e3] text-white hover:bg-[#0578c5] shadow-lg disabled:bg-slate-300 disabled:text-slate-400 disabled:shadow-none"
                        style={newDocFile && !isLocked ? { boxShadow: '0 4px 16px rgba(6,147,227,0.35)' } : {}}
                    >
                        Add Document
                    </button>
                    </div>
                </div>
                
                {projectDocuments.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-bold mb-4 text-slate-200">Uploaded Documents</h4>
                    <ul className="space-y-2">
                        {projectDocuments.map((doc, index) => (
                        <li key={index} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-brand-500/20 rounded-lg mr-4">
                                    <ClipboardCheckIcon className="w-6 h-6 text-brand-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-100">{doc.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-400/25 text-brand-300">{doc.type}</span>
                                        {doc.description && <span className="text-xs text-slate-500 italic">"{doc.description}"</span>}
                                    </div>
                                </div>
                            </div>
                            {!isLocked && (
                                <button 
                                    onClick={() => onRemoveProjectDocument(index)} 
                                    className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-900/20 transition-colors"
                                    aria-label="Remove document"
                                >
                                <XCircleIcon className="w-6 h-6" />
                                </button>
                            )}
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
                </div>
            </div>
        </>
    );
};
