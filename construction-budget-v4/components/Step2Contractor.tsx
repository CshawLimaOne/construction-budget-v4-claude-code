
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
        <div className={`flex flex-col sm:flex-row items-center justify-between py-4 px-3 rounded-xl border border-[#DFE1E5] bg-[#F6F7F9] mb-2 hover:border-[#DFE1E5] transition-colors ${highlight && !doc && isRequired ? 'border-[#B92814]/50 bg-[#FFF0EE]' : ''}`}>
            <span className="font-medium text-[#1E2D5C] mb-2 sm:mb-0 flex items-center">
                {label}
                {!isRequired && <span className="ml-2 text-xs font-normal text-[#78819D] italic">(Optional)</span>}
            </span>
            <div className="flex items-center space-x-3">
                {doc ? (
                    <>
                        <div className="flex items-center bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
                            <CheckCircleIcon className="w-4 h-4 text-brand-500 mr-2" />
                            <span className="text-sm text-brand-500 truncate max-w-xs">{doc.name}</span>
                        </div>
                        {!isLocked && (
                            <button 
                                onClick={handleRemove} 
                                className="text-[#B92814] hover:text-[#8B1B0E] p-2 rounded-full hover:bg-[#FFF0EE] transition-colors"
                                aria-label="Remove document"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id={`gc-doc-upload-${docType}`} disabled={isLocked} />
                        <label htmlFor={`gc-doc-upload-${docType}`} className={`button-base text-xs py-2 px-4 bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-50 border border-brand-200 text-brand-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        GC &amp; Documents
                    </span>
                    <span className="text-xs text-[#78819D]">·</span>
                    <span className="text-xs text-[#78819D] font-medium">Step 2 of 4</span>
                </div>
                <h1 className="text-2xl font-black text-[#1E2D5C] tracking-tight">General Contractor &amp; Documents</h1>
                <p className="text-sm text-[#78819D] mt-1 max-w-xl">
                    Add your GC information and upload required project documents for review.
                </p>
            </div>

            {/* Quick Confirm Card for Repeat Users */}
            {isRepeatUser && isGcRequired && (
                <div className="section-container mb-6 bg-brand-50 border-brand-200">
                    <div className="p-5 flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h4 className="font-bold text-lg text-[#1E2D5C] flex items-center">
                                Welcome back!
                            </h4>
                            <p className="text-sm text-brand-500 mt-1">
                                Are you acting as the General Contractor ({MOCK_SAVED_GC_PROFILE.businessName}) for this project?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSwitchToNew}
                                className={`px-4 py-2 rounded-md text-sm font-bold border transition-colors ${!usingSavedProfile ? 'bg-white border-[#DFE1E5] text-[#1E2D5C]' : 'bg-transparent border-brand-200 text-brand-500 hover:bg-brand-50'}`}
                            >
                                No, use different GC
                            </button>
                            <button
                                onClick={handleQuickConfirm}
                                disabled={usingSavedProfile}
                                className={`px-4 py-2 rounded-md text-sm font-bold flex items-center transition-colors ${usingSavedProfile ? 'bg-[#139B23] text-white cursor-default' : 'bg-brand-700 text-white hover:bg-brand-800 shadow-lg'}`}
                            >
                                {usingSavedProfile && <CheckCircleIcon className="w-4 h-4 mr-2" />}
                                {usingSavedProfile ? 'Confirmed' : 'Yes, use saved profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isGcRequired && (
                <div className="flex items-start gap-4 bg-[#E1F7E4] border border-[#ADDEB4] rounded-2xl p-5 mb-6">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#ADDEB4] flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-[#139B23]" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#139B23] text-sm uppercase tracking-wide mb-1">General Contractor Not Required</h4>
                        <p className="text-sm text-[#1E2D5C] leading-relaxed">
                            For <span className="font-semibold text-[#1E2D5C]">{selectedRehabType}</span> projects, providing GC information is optional. You may skip this section if you are managing the project yourself.
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
                                ? 'bg-[#FFF0EE] text-[#B92814] border border-[#B92814]/30'
                                : 'bg-[#E1F7E4] text-[#139B23] border border-[#ADDEB4]'
                            }`}
                        >
                            {isGcRequired ? 'Required' : 'Optional'}
                        </span>
                    )}
                </h3>
                <div className="p-5 bg-transparent space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="gc-performer-type" className="block text-sm font-semibold text-[#1E2D5C] mb-2">Who is performing the construction work?</label>
                            {usingSavedProfile ? (
                                <div className="p-3 bg-[#F6F7F9] rounded-xl border border-[#DFE1E5] text-sm font-semibold text-[#1E2D5C]">
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
                                    className={`form-input-premium w-full ${highlightMissingFields && isGcRequired && !generalContractor.performerType ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
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
                                <label htmlFor="gc-business-name" className="block text-sm font-semibold text-[#1E2D5C] mb-2">General Contractor Name</label>
                                <input
                                    type="text"
                                    id="gc-business-name"
                                    value={generalContractor.businessName}
                                    onChange={(e) => onGeneralContractorChange('businessName', e.target.value)}
                                    className={`form-input-premium w-full ${highlightMissingFields && isGcRequired && !generalContractor.businessName ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''} ${usingSavedProfile ? 'opacity-70' : ''}`}
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
                                <div className="p-5 bg-[#F6F7F9] rounded-xl border border-[#DFE1E5]">
                                    <div className="flex items-center justify-between mb-5 border-b border-[#DFE1E5] pb-4">
                                        <h4 className="font-bold text-[#1E2D5C] text-lg flex items-center">
                                            <ClipboardUserIcon className="w-6 h-6 mr-3 text-brand-500" />
                                            GC Onboarding
                                        </h4>
                                        {isGcOnboardingComplete ? (
                                            <span className="flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E1F7E4] text-[#139B23] border border-[#ADDEB4]">
                                                <CheckCircleIcon className="w-4 h-4 mr-1"/> Profile Complete
                                            </span>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isGcRequired ? 'bg-[#FFF5DB] text-[#EAA800] border border-[#EDDDB1]' : 'bg-[#F6F7F9] text-[#78819D] border border-[#DFE1E5]'}`}>
                                                {isGcRequired ? 'Action Required' : 'Optional Step'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Option 1: Invite */}
                                        <div className="relative flex flex-col p-5 rounded-xl border-2 border-[#DFE1E5] bg-brand-50 hover:border-brand-200 transition-all duration-300 overflow-hidden">
                                            {/* Top-border accent — brand blue */}
                                            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, rgba(28,57,216,0.8), transparent)' }} />
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-500">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                                        Option 1
                                                    </span>
                                                </div>
                                                <h5 className="font-bold text-brand-500 text-lg mb-2">Invite Contractor</h5>
                                                <p className="text-xs text-[#78819D] leading-relaxed">
                                                    Copy and send this secure link to your GC. They can upload licenses, insurance, and complete their profile independently.
                                                </p>
                                            </div>
                                            <div className="mt-auto space-y-3">
                                                <div className="flex items-center gap-2 bg-[#F6F7F9] p-2 rounded-xl border border-[#DFE1E5]">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={inviteLink}
                                                        className="w-full bg-transparent border-none text-xs text-[#78819D] focus:ring-0"
                                                    />
                                                    <button
                                                        onClick={handleCopyLink}
                                                        disabled={isLocked}
                                                        className={`flex-shrink-0 button-base text-xs py-1.5 px-3 flex items-center justify-center transition-all duration-200 min-w-[80px] h-8 ${
                                                            isCopied
                                                            ? 'bg-[#139B23] text-white'
                                                            : 'bg-brand-500 text-white hover:bg-brand-600'
                                                        }`}
                                                    >
                                                        {isCopied ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-[#78819D] italic text-center">
                                                    Link expires in 7 days.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Option 2: Manual Entry */}
                                        <div className="relative flex flex-col p-5 rounded-xl border-2 border-[#DFE1E5] bg-white hover:border-[#DFE1E5] transition-all duration-300 overflow-hidden">
                                            {/* Top-border accent — neutral */}
                                            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, rgba(120,129,157,0.6), transparent)' }} />
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#F6F7F9] border border-[#DFE1E5] text-[#78819D]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#78819D]" />
                                                        Option 2
                                                    </span>
                                                </div>
                                                <h5 className="font-bold text-[#1E2D5C] text-lg mb-2">Fill Out Manually</h5>
                                                <p className="text-xs text-[#78819D] leading-relaxed">
                                                    If you are the GC or have the information ready (Licenses, Insurance, Bio), you can complete the onboarding form right now.
                                                </p>
                                            </div>
                                            <div className="mt-auto">
                                                <button
                                                    onClick={() => onOpenGcOnboarding()}
                                                    disabled={isLocked}
                                                    className="w-full button-base text-sm py-3 bg-brand-500 text-white hover:bg-brand-600 transition-colors flex items-center justify-center shadow-lg"
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
                                <div className="p-5 bg-[#E1F7E4] rounded-xl border border-[#ADDEB4]">
                                    <h4 className="font-bold text-[#139B23] mb-3 flex items-center text-lg">
                                        <CheckCircleIcon className="w-6 h-6 mr-2" />
                                        Profile Validated
                                    </h4>
                                    <p className="text-sm text-[#1E2D5C] mb-4">
                                        We have current documentation on file for <strong>{MOCK_SAVED_GC_PROFILE.businessName}</strong>. No upload required.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-[#ADDEB4] pb-2">
                                            <span className="text-[#1E2D5C]">GC License ({MOCK_SAVED_GC_PROFILE.savedDocs.gcLicenseDoc.name})</span>
                                            <span className="font-mono font-bold text-[#139B23]">Exp: {MOCK_SAVED_GC_PROFILE.savedDocs.gcLicenseDoc.expiry}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-[#ADDEB4] pb-2">
                                            <span className="text-[#1E2D5C]">General Liability</span>
                                            <span className="font-mono font-bold text-[#139B23]">Exp: {MOCK_SAVED_GC_PROFILE.savedDocs.generalLiabilityDoc.expiry}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-[#F6F7F9] rounded-xl border border-[#DFE1E5]">
                                    <h4 className="font-bold text-[#1E2D5C] mb-4 text-lg">Required Documents (Upload here or via Link)</h4>
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
                                                    <span className="text-xs text-[#78819D] ml-1 italic">*If required by state*</span>
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
                                ? 'bg-[#FFF0EE] text-[#B92814] border border-[#B92814]/30'
                                : 'bg-white text-[#1E2D5C] border border-[#DFE1E5]'
                            }`}
                        >
                            {isGcRequired ? 'Required' : 'Recommended / Optional'}
                        </span>
                    )}
                </h3>
                <div className="p-5 bg-transparent space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border border-[#DFE1E5] rounded-xl bg-[#F6F7F9]">
                    <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1E2D5C] mb-2">Document File</label>
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
                        className={`flex items-center gap-3 p-3 rounded-xl border border-[#DFE1E5] bg-white hover:bg-[#F7F9FC] hover:border-[#DFE1E5] transition-all ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center">
                            <CloudUploadIcon className="w-5 h-5 text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {newDocFile ? (
                                <span className="text-sm font-medium text-brand-500 truncate block">{newDocFile.name}</span>
                            ) : (
                                <span className="text-sm text-[#78819D]">Click to choose a file&hellip;</span>
                            )}
                            <span className="text-[10px] text-[#78819D] mt-0.5 block">PDF, DWG, XLSX, DOC accepted</span>
                        </div>
                    </label>
                    </div>
                    <div>
                    <label htmlFor="doc-type-select" className="block text-sm font-semibold text-[#1E2D5C] mb-2">Document Type</label>
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
                    <label htmlFor="doc-desc-input" className="block text-sm font-semibold text-[#1E2D5C] mb-2">Description (Optional)</label>
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
                        className="button-base w-full bg-brand-500 text-white hover:bg-brand-600 shadow-lg disabled:bg-[#BCBFC7] disabled:text-white disabled:shadow-none"
                        style={newDocFile && !isLocked ? { boxShadow: '0 4px 16px rgba(6,147,227,0.35)' } : {}}
                    >
                        Add Document
                    </button>
                    </div>
                </div>
                
                {projectDocuments.length > 0 && (
                    <div className="border-t border-[#DFE1E5] pt-4">
                    <h4 className="text-sm font-bold mb-4 text-[#1E2D5C]">Uploaded Documents</h4>
                    <ul className="space-y-2">
                        {projectDocuments.map((doc, index) => (
                        <li key={index} className="p-4 bg-white rounded-xl border border-[#DFE1E5] flex items-center justify-between hover:bg-[#F7F9FC] transition-colors">
                            <div className="flex items-center">
                                <div className="p-2 bg-brand-50 rounded-lg mr-4">
                                    <ClipboardCheckIcon className="w-6 h-6 text-brand-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#1E2D5C]">{doc.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-500">{doc.type}</span>
                                        {doc.description && <span className="text-xs text-[#78819D] italic">"{doc.description}"</span>}
                                    </div>
                                </div>
                            </div>
                            {!isLocked && (
                                <button 
                                    onClick={() => onRemoveProjectDocument(index)} 
                                    className="text-[#B92814] hover:text-[#8B1B0E] p-2 rounded-full hover:bg-[#FFF0EE] transition-colors"
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
