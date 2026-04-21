
import React, { useMemo, useRef } from 'react';
import { PropertyDetails, AsIsProjectedData, ProjectQuestion, GeneralContractor, BudgetCategoryData, BudgetItem, ScopeOfWorkSummary, ApplicationStatus, AsIsProjectedItem, AsIsProjectedPerUnitItem, UserRole, Comment, CommentThread } from '../types';
import { CONDITIONS_OF_PROPERTY, TYPES_OF_REHAB, MATERIAL_QUALITIES } from '../constants';
import { WarningTriangleIcon, BuildingIcon, ClipboardUserIcon, CalculatorIcon, MapPinIcon, CheckCircleIcon, ClipboardCheckIcon, ChatBubbleIcon } from './Icons';

interface Step4ReviewProps {
  propertyDetails: PropertyDetails;
  asIsProjectedData: AsIsProjectedData;
  selectedCondition: string;
  selectedRehabType: string;
  selectedMaterialQuality: string;
  projectQuestions: ProjectQuestion[];
  generalContractor: GeneralContractor;
  budgetData: BudgetCategoryData[];
  scopeSummary: ScopeOfWorkSummary;
  projectScopeStatement: string;
  isReimbursementAcknowledged: boolean;
  isLocked?: boolean;
  onAcknowledgementChange: (isChecked: boolean) => void;
  applicationStatus: ApplicationStatus;
  onProjectQuestionChange: (id: string, field: keyof ProjectQuestion, value: string) => void;
  // Workflow props
  currentUserRole: UserRole;
  comments: Comment[];
  commentThreads: CommentThread[];
  onRequestChanges: () => void;
  onApproveBudget: () => void;
  onAcceptAnalystChange: (categoryName: string, itemId: string) => void;
  onKeepBorrowerValue: (categoryName: string, itemId: string) => void;
}

const getLabel = (options: any[], value: string) => options.find(o => o.value === value)?.label || 'N/A';

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const exportReviewPDF = (contentEl: HTMLElement, streetAddress: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(el => el.outerHTML).join('\n');
    const inlineStyles = Array.from(document.querySelectorAll('style'))
        .map(el => el.outerHTML).join('\n');

    const title = streetAddress ? `Budget Review — ${streetAddress}` : 'Budget Review';

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${styleLinks}
  ${inlineStyles}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      background-color: #0f172a !important;
      color: white;
      padding: 24px;
      font-family: ui-sans-serif, system-ui, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { margin: 0.5in; size: letter; }
    @media print {
      body { background-color: #0f172a !important; padding: 0; }
      button { display: none !important; }
    }
    select, textarea, input { display: none !important; }
  </style>
</head>
<body>
  ${contentEl.innerHTML}
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
    });
  <\/script>
</body>
</html>`);
    printWindow.document.close();
};

// --- Sub-Components ---

const ReviewSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="section-container p-5 mb-8 relative overflow-hidden group">
        <div className="flex items-center space-x-3 border-b border-[#DFE1E5] pb-4 mb-6">
            <div className="p-2 bg-brand-50 rounded-xl text-brand-500 group-hover:bg-brand-100 transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-[#1E2D5C] tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

const DataCard: React.FC<{ label: string; value: React.ReactNode; subtext?: string; highlight?: boolean }> = ({ label, value, subtext, highlight }) => (
    <div className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${highlight ? 'bg-brand-50 border-brand-200' : 'bg-white border-[#DFE1E5] hover:bg-[#F7F9FC]'}`}>
        {/* Top accent bar */}
        <div className={`h-0.5 w-full ${highlight ? 'bg-brand-500' : 'bg-[#DFE1E5]'}`} />
        <div className="p-4">
            <div className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-2">{label}</div>
            <div className={`font-bold text-xl truncate leading-tight ${highlight ? 'text-brand-500' : 'text-[#1E2D5C]'}`}>{value || '-'}</div>
            {subtext && <div className="text-[11px] text-[#78819D] mt-1.5 font-medium">{subtext}</div>}
        </div>
    </div>
);

const DocStatus: React.FC<{ label: string; isPresent: boolean }> = ({ label, isPresent }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isPresent ? 'bg-[#E1F7E4] border-[#ADDEB4]' : 'bg-white border-[#DFE1E5]'}`}>
        <div className="flex items-center gap-2.5">
            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isPresent ? 'bg-[#ADDEB4]' : 'bg-[#F4F5F7]'}`}>
                {isPresent
                    ? <CheckCircleIcon className="w-3.5 h-3.5 text-[#139B23]" />
                    : <span className="w-2 h-2 rounded-full bg-[#BCBFC7]" />
                }
            </span>
            <span className="text-sm font-medium text-[#1E2D5C]">{label}</span>
        </div>
        {isPresent ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#E1F7E4] border border-[#ADDEB4] text-[#139B23] px-2.5 py-0.5 rounded-full">
                Uploaded
            </span>
        ) : (
            <span className="inline-flex items-center text-[11px] font-bold bg-[#F4F5F7] border border-[#DFE1E5] text-[#78819D] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Pending
            </span>
        )}
    </div>
);

const exportBudgetCSV = (budgetData: BudgetCategoryData[]) => {
    const rows: string[][] = [['Item#', 'Item/Task', 'Description/Notes', 'Budget']];

    budgetData.forEach(category => {
        category.items.forEach(item => {
            if (item.budget > 0) {
                rows.push([
                    item.itemNumber,
                    item.drawItem,
                    item.description,
                    item.budget.toFixed(2),
                ]);
            }
        });
    });

    const csv = rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'construction-budget.csv';
    link.click();
    URL.revokeObjectURL(url);
};

export const Step4Review: React.FC<Step4ReviewProps> = ({
  propertyDetails,
  asIsProjectedData,
  selectedCondition,
  selectedRehabType,
  selectedMaterialQuality,
  projectQuestions,
  generalContractor,
  budgetData,
  scopeSummary,
  projectScopeStatement,
  isReimbursementAcknowledged,
  isLocked,
  onAcknowledgementChange,
  applicationStatus,
  onProjectQuestionChange,
  currentUserRole,
  comments,
  commentThreads,
  onRequestChanges,
  onApproveBudget,
  onAcceptAnalystChange,
  onKeepBorrowerValue,
}) => {
    const reviewContentRef = useRef<HTMLDivElement>(null);
    const showApprovedColumn = applicationStatus !== 'draft';
    const totalSqFt = parseFloat(asIsProjectedData.totalBuildingSqFeet.projected || '0');
    const ppsf = totalSqFt > 0 ? scopeSummary.borrowerTotal / totalSqFt : 0;

    // Item 4: Compute items the analyst has corrected that still need borrower action
    const analystChangedItems = useMemo(() => {
        const result: Array<{ categoryName: string; item: BudgetItem; analystComments: Comment[] }> = [];
        budgetData.forEach(cat => {
            cat.items.forEach(item => {
                const threadId = `analyst-edit-${item.id}`;
                const thread = commentThreads.find(t => t.id === threadId && t.status === 'needs_borrower_action');
                if (thread) {
                    const analystComments = comments.filter(c => c.threadId === threadId);
                    result.push({ categoryName: cat.name, item, analystComments });
                }
            });
        });
        return result;
    }, [budgetData, commentThreads, comments]);

    const hasPendingBorrowerItems = analystChangedItems.length > 0;
    const pendingAnalystActionThreads = commentThreads.filter(t => t.status === 'needs_borrower_action').length;

    // Helper to check budget for presence of items
    const hasBudgetedItem = (drawItemsToCheck: string[]) => {
        return budgetData.some(cat =>
            cat.items.some(item => drawItemsToCheck.includes(item.drawItem) && item.budget > 0)
        );
    };

    const hasPermitsBudgeted = hasBudgetedItem(["Building Permit*"]);
    const hasPlansBudgeted = hasBudgetedItem(["Architectural Fees", "Survey/Drawings/Plans*"]);

    // Determine visible questions based on Rehab Type and Budget Logic
    const visibleQuestionIds = useMemo(() => {
        // If New Construction (Ground Up), show NO questions
        if (selectedRehabType === 'New Construction') return [];

        let ids: string[] = [];

        // Rehab Type Logic
        if (selectedRehabType === 'Heavy') {
            // Show all questions for Heavy Rehab
            ids = projectQuestions.map(q => q.id);
        } else if (['Light-Cosmetic', 'Standard-Full'].includes(selectedRehabType)) {
            // Specific subset for Light/Standard
            ids = ['q1', 'q5', 'q7', 'q8'];
        } else {
            // Default Fallback (show subset if no type selected yet)
            ids = ['q1', 'q5', 'q7', 'q8'];
        }

        // Budget Logic (Removal overrides inclusion)
        // If budgeted for permits, remove permit question (q1)
        if (hasPermitsBudgeted) {
            ids = ids.filter(id => id !== 'q1');
        }
        // If budgeted for plans/architect, remove plans question (q2)
        if (hasPlansBudgeted) {
            ids = ids.filter(id => id !== 'q2');
        }

        return ids;
    }, [selectedRehabType, hasPermitsBudgeted, hasPlansBudgeted, projectQuestions]);

    const visibleQuestions = projectQuestions.filter(q => visibleQuestionIds.includes(q.id));

    return (
        <div className="max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Step Hero ── */}
            <div className="step1-hero mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-50 border border-brand-200 text-brand-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        Review &amp; Submit
                    </span>
                    <span className="text-xs text-[#78819D]">·</span>
                    <span className="text-xs text-[#78819D] font-medium">Step 4 of 4</span>
                </div>
                <h1 className="text-2xl font-black text-[#1E2D5C] tracking-tight">Final Review</h1>
                <p className="text-sm text-[#78819D] mt-1 max-w-xl">
                    {currentUserRole === 'analyst'
                        ? 'Review the borrower\'s submission. You can correct line items on the Budget page, then send back or approve.'
                        : 'Please perform a final check of all project details. Once submitted, your budget will be locked for analyst review.'}
                </p>
            </div>

            {/* ── Item 3 & 7: Analyst Workflow Panel ── */}
            {currentUserRole === 'analyst' && applicationStatus === 'under_review' && (
                <div className="mb-8 p-5 rounded-2xl border border-brand-200 bg-brand-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-100 rounded-xl">
                            <ClipboardCheckIcon className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1E2D5C] text-base">Analyst Review Actions</h3>
                            <p className="text-xs text-[#78819D] mt-0.5">
                                Go to the Budget page to correct line items (you'll be prompted to explain each change). When done, choose an action below.
                            </p>
                        </div>
                        {pendingAnalystActionThreads > 0 && (
                            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#EAA800] bg-[#FFF5DB] border border-[#EDDDB1] px-3 py-1 rounded-full">
                                {pendingAnalystActionThreads} correction{pendingAnalystActionThreads !== 1 ? 's' : ''} pending borrower review
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Item 3: Send Back to Borrower */}
                        <button
                            onClick={onRequestChanges}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm bg-[#FFF5DB] hover:bg-[#EDDDB1]/50 text-[#EAA800] border border-[#EDDDB1] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Send Back to Borrower for Review
                        </button>
                        {/* Item 7: Approve Budget */}
                        <button
                            onClick={onApproveBudget}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm bg-[#E1F7E4] hover:bg-[#ADDEB4]/40 text-[#139B23] border border-[#ADDEB4] transition-all"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve Budget
                        </button>
                    </div>
                </div>
            )}

            {/* ── Item 4 & 5: Borrower Delta Panel — shown when analyst has sent changes back ── */}
            {currentUserRole === 'borrower' && applicationStatus === 'needs_borrower_action' && (
                <div className="mb-8 p-5 rounded-2xl border border-[#EDDDB1] bg-[#FFF5DB]/60">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#EDDDB1] rounded-xl">
                            <WarningTriangleIcon className="w-5 h-5 text-[#EAA800]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1E2D5C] text-base">Analyst Has Requested Changes</h3>
                            <p className="text-xs text-[#78819D] mt-0.5">
                                Your analyst has adjusted {analystChangedItems.length} line item{analystChangedItems.length !== 1 ? 's' : ''}. Review each change below, then accept or keep your original value before resubmitting.
                            </p>
                        </div>
                    </div>

                    {analystChangedItems.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">
                            All analyst changes have been reviewed. You may resubmit.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {analystChangedItems.map(({ categoryName, item, analystComments }) => (
                                <div key={item.id} className="bg-white rounded-xl border border-[#DFE1E5] p-4">
                                    {/* Item header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest">{categoryName}</div>
                                            <div className="font-bold text-[#1E2D5C] text-sm mt-0.5">{item.drawItem || 'Custom Item'}</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#EAA800] bg-[#FFF5DB] border border-[#EDDDB1] px-2 py-0.5 rounded-full uppercase">Needs Review</span>
                                    </div>

                                    {/* Delta comparison */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-[#F6F7F9] rounded-lg px-3 py-2 border border-[#DFE1E5]">
                                            <div className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-1">Your Requested Amount</div>
                                            <div className="font-mono font-bold text-[#1E2D5C] text-base">{item.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</div>
                                        </div>
                                        <div className="bg-brand-50 rounded-lg px-3 py-2 border border-brand-200">
                                            <div className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-1">Analyst Approved</div>
                                            <div className="font-mono font-bold text-brand-500 text-base">{item.actual.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</div>
                                        </div>
                                    </div>

                                    {/* Analyst comments */}
                                    {analystComments.length > 0 && (
                                        <div className="mb-3 space-y-2">
                                            {analystComments.map(c => (
                                                <div key={c.id} className="flex items-start gap-2 bg-[#F6F7F9] rounded-lg p-3 border border-[#DFE1E5]">
                                                    <ChatBubbleIcon className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-0.5">Analyst Note</div>
                                                        <div className="text-xs text-[#78819D] leading-relaxed">{c.text}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Item 5: Accept / Keep buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onAcceptAnalystChange(categoryName, item.id)}
                                            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-[#E1F7E4] hover:bg-[#ADDEB4]/40 text-[#139B23] border border-[#ADDEB4] transition-all"
                                        >
                                            ✓ Accept Analyst's Amount
                                        </button>
                                        <button
                                            onClick={() => onKeepBorrowerValue(categoryName, item.id)}
                                            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-white hover:bg-[#F7F9FC] text-[#78819D] border border-[#DFE1E5] transition-all"
                                        >
                                            ✗ Keep My Original Amount
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!hasPendingBorrowerItems && (
                        <div className="mt-4 p-3 bg-[#E1F7E4] border border-[#ADDEB4] rounded-xl text-xs text-[#139B23] font-semibold text-center">
                            ✓ All changes reviewed — you may now resubmit using the button in the footer below.
                        </div>
                    )}
                </div>
            )}

            {/* ── PDF-exportable content ── */}
            <div ref={reviewContentRef}>

            {/* --- 1. PROPERTY & PROJECT --- */}
            <ReviewSection title="Property & Project Context" icon={<BuildingIcon className="w-6 h-6" />}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Primary Address Card */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col md:flex-row items-start md:items-center p-5 bg-white border border-[#DFE1E5] rounded-xl border-l-4 border-l-brand-500">
                            <div className="p-3 bg-brand-50 rounded-full mr-4 mb-4 md:mb-0 flex-shrink-0">
                                <MapPinIcon className="w-8 h-8 text-brand-500" />
                            </div>
                            <div className="flex-grow">
                                <div className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1">Subject Property</div>
                                <div className="text-2xl font-bold text-[#1E2D5C] mb-1">
                                    {propertyDetails.street || 'No Address Entered'}
                                </div>
                                <div className="text-[#78819D] text-base">
                                    {[propertyDetails.city, propertyDetails.state, propertyDetails.zip].filter(Boolean).join(', ')}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-8 px-6 py-4 bg-brand-50 rounded-xl border border-brand-200 text-center min-w-[160px]">
                                <div className="text-xs text-[#78819D] uppercase font-bold tracking-wider mb-1">Purchase Price</div>
                                <div className="text-2xl font-black text-brand-500">{formatCurrency(parseFloat(propertyDetails.purchasePrice))}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Key Specs */}
                    <DataCard label="Rehab Type" value={getLabel(TYPES_OF_REHAB, selectedRehabType)} highlight />
                    <DataCard label="Condition" value={getLabel(CONDITIONS_OF_PROPERTY, selectedCondition)} />
                    <DataCard label="Material Quality" value={getLabel(MATERIAL_QUALITIES, selectedMaterialQuality)} />
                </div>

                {/* As-Is vs Projected Grid */}
                <div className="bg-white rounded-xl border border-[#DFE1E5] overflow-hidden mb-8">
                    <div className="px-6 py-3 bg-[#F6F7F9] border-b border-[#DFE1E5] flex justify-between items-center">
                        <span className="text-xs font-bold text-[#78819D] uppercase tracking-wider">Specs Comparison</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-50 border border-brand-200 text-brand-500 px-2.5 py-0.5 rounded-full">Read Only</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm font-medium text-[#78819D] border-b border-[#DFE1E5] bg-[#F6F7F9]">
                        <div className="p-4">Item</div>
                        <div className="p-4 text-center border-l border-[#DFE1E5]">Current (As-Is)</div>
                        <div className="p-4 text-center border-l border-[#DFE1E5] text-brand-500">Projected</div>
                    </div>
                    {(Object.keys(asIsProjectedData) as Array<keyof AsIsProjectedData>).map((key, index) => {
                        const item = asIsProjectedData[key];
                        let asIsVal = '-';
                        let projVal = '-';

                        if (Array.isArray(item.asIs)) {
                             const perUnitItem = item as AsIsProjectedPerUnitItem;
                             asIsVal = perUnitItem.asIs.filter(Boolean).join(', ');
                             projVal = perUnitItem.projected.filter(Boolean).join(', ');
                        } else {
                             const stdItem = item as AsIsProjectedItem;
                             asIsVal = stdItem.asIs;
                             projVal = stdItem.projected;
                        }

                        const isChanged = asIsVal !== projVal;

                        return (
                            <div key={key} className={`grid grid-cols-3 text-sm border-b border-[#DFE1E5] last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F6F7F9]'}`}>
                                <div className="p-4 text-[#1E2D5C] font-medium">{item.label}</div>
                                <div className="p-4 text-center text-[#78819D] border-l border-[#DFE1E5]">{asIsVal || '-'}</div>
                                <div className={`p-4 text-center border-l border-[#DFE1E5] font-bold ${isChanged ? 'text-brand-500' : 'text-[#78819D]'}`}>
                                    {projVal || '-'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ReviewSection>

            {/* --- 2. THE TEAM --- */}
            <ReviewSection title="Construction Team" icon={<ClipboardUserIcon className="w-6 h-6" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-3">Performer Strategy</h4>
                        <div className="p-5 bg-white rounded-xl border border-[#DFE1E5]">
                            <div className="flex items-center mb-2">
                                <span className={`w-3 h-3 rounded-full mr-2 ${generalContractor.performerType === 'Self-Managed' ? 'bg-[#EAA800]' : 'bg-brand-500'}`}></span>
                                <span className="text-lg font-bold text-[#1E2D5C]">{generalContractor.performerType || 'Not Selected'}</span>
                            </div>
                            {generalContractor.performerType === 'General Contractor' && (
                                <div className="mt-2 pl-5">
                                    <div className="text-sm text-[#1E2D5C] font-medium">{generalContractor.businessName || 'Business Name Pending'}</div>
                                    <div className="text-xs text-[#78819D] mt-1 truncate">{generalContractor.website}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {generalContractor.performerType === 'General Contractor' && (
                        <div>
                            <h4 className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-3">Compliance Documents</h4>
                            <div className="space-y-2">
                                <DocStatus label="GC License" isPresent={!!generalContractor.gcLicenseDoc} />
                                <DocStatus label="Liability Insurance" isPresent={!!generalContractor.generalLiabilityDoc} />
                                <DocStatus label="Driver's License" isPresent={!!generalContractor.driversLicenseDoc} />
                            </div>
                        </div>
                    )}
                </div>
            </ReviewSection>

            {/* --- 3. SCOPE & BUDGET --- */}
            <ReviewSection title="Scope & Budget Summary" icon={<CalculatorIcon className="w-6 h-6" />}>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Narrative */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-2">Scope of Work Narrative</h4>
                        <div className="flex-grow p-5 bg-[#F6F7F9] rounded-xl border border-[#DFE1E5] text-sm text-[#78819D] italic leading-relaxed shadow-inner">
                            &ldquo;{projectScopeStatement || 'No scope statement provided.'}&rdquo;
                        </div>
                    </div>
                    {/* High Level Stats */}
                    <div className="lg:col-span-1 space-y-3">
                        <DataCard label="Total Budget" value={formatCurrency(scopeSummary.borrowerTotal)} highlight />
                        <DataCard label="Cost Per SqFt" value={`${formatCurrency(ppsf)} / sqft`} subtext={`Based on ${totalSqFt} sqft`} />
                        <div className="grid grid-cols-2 gap-3">
                            <DataCard label="Start" value={scopeSummary.startDate || 'TBD'} />
                            <DataCard label="Finish" value={scopeSummary.projectedCompletionDate || 'TBD'} />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-3">Budget Breakdown by Category</h4>
                    <div className="overflow-hidden rounded-xl border border-[#DFE1E5]">
                        <table className="w-full text-sm text-left text-[#1E2D5C]">
                            <thead className="bg-[#F6F7F9] text-xs uppercase text-[#78819D]">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Category</th>
                                    <th className="px-6 py-4 font-bold text-right">Requested Amount</th>
                                    {showApprovedColumn && <th className="px-6 py-4 font-bold text-right text-[#139B23]">Approved</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DFE1E5] bg-white">
                                {budgetData.map(category => {
                                    const catTotal = category.items.reduce((sum, item) => sum + item.budget, 0);
                                    const catActual = category.items.reduce((sum, item) => sum + item.actual, 0);
                                    if (catTotal === 0 && catActual === 0) return null;

                                    return (
                                        <tr key={category.name} className="hover:bg-[#F7F9FC] transition-colors">
                                            <td className="px-6 py-3 font-medium text-[#1E2D5C]">{category.name}</td>
                                            <td className="px-6 py-3 text-right font-mono text-[#1E2D5C]">{formatCurrency(catTotal)}</td>
                                            {showApprovedColumn && <td className="px-6 py-3 text-right font-mono text-[#139B23]">{formatCurrency(catActual)}</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-brand-50 font-bold border-t-2 border-brand-200">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-[#78819D] uppercase tracking-wider text-xs">Grand Total</td>
                                    <td className="px-6 py-4 text-right text-xl font-black text-brand-500">{formatCurrency(scopeSummary.borrowerTotal)}</td>
                                    {showApprovedColumn && <td className="px-6 py-4 text-right text-xl text-[#139B23]">{formatCurrency(scopeSummary.limaOneApprovedTotal)}</td>}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </ReviewSection>

            {/* --- 4. PROJECT QUESTIONNAIRE (Moved from Step 1) --- */}
            {visibleQuestions.length > 0 && (
                <ReviewSection title="Project Questionnaire" icon={<ChatBubbleIcon className="w-6 h-6" />}>
                    <div className="overflow-x-auto rounded-xl border border-[#DFE1E5] bg-white">
                        <table className="min-w-full divide-y divide-[#DFE1E5]">
                            <thead className="bg-[#F6F7F9]">
                                <tr>
                                    <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-[#78819D] uppercase tracking-wider w-5/12">Question</th>
                                    <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-[#78819D] uppercase tracking-wider w-2/12">Response</th>
                                    <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-[#78819D] uppercase tracking-wider w-5/12">Explanation (If Applicable)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DFE1E5] bg-white">
                            {visibleQuestions.map((q) => {
                                const isLastQuestion = q.id === 'q8';
                                const explanationRequired = !isLastQuestion && q.answer === 'Yes';
                                const explanationPlaceholder = "Brief Explanation";

                                return (
                                    <tr key={q.id}>
                                        <td className="py-4 px-4 text-sm font-medium text-[#1E2D5C]">{q.question}</td>
                                        <td className="p-2 align-middle">
                                            <select 
                                                value={q.answer} 
                                                onChange={(e) => onProjectQuestionChange(q.id, 'answer', e.target.value)}
                                                className={`form-input-premium h-full py-2 text-sm ${!q.answer ? 'border-red-500/50 bg-red-900/10' : ''}`}
                                                aria-label={`Answer for ${q.question}`}
                                                disabled={isLocked}
                                            >
                                            <option value="">Select</option>
                                            {isLastQuestion ? (
                                                <>
                                                    <option value="Sell">Sell</option>
                                                    <option value="Hold & Refi">Hold & Refi</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </>
                                            )}
                                            </select>
                                        </td>
                                        <td className="p-2 align-middle">
                                            {!isLastQuestion && (
                                                <textarea
                                                    rows={1}
                                                    value={q.explanation}
                                                    onChange={(e) => {
                                                        onProjectQuestionChange(q.id, 'explanation', e.target.value);
                                                        const textarea = e.currentTarget;
                                                        textarea.style.height = 'auto';
                                                        textarea.style.height = `${textarea.scrollHeight}px`;
                                                    }}
                                                    className={`form-input-premium resize-none overflow-hidden text-sm ${explanationRequired ? '' : 'opacity-40 cursor-not-allowed'}`}
                                                    placeholder={explanationPlaceholder}
                                                    disabled={!explanationRequired || isLocked}
                                                    aria-label={`Explanation for ${q.question}`}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </ReviewSection>
            )}

            {/* --- 5. PRE-FLIGHT CHECKLIST --- */}
            <div className={`section-container p-5 mb-8 transition-all duration-500 ${isReimbursementAcknowledged ? 'border-[#ADDEB4] bg-[#E1F7E4]/30' : 'border-[#DFE1E5]'}`}>
                <div className="flex items-center space-x-3 border-b border-[#DFE1E5] pb-4 mb-5">
                    <div className={`p-2 rounded-xl transition-colors ${isReimbursementAcknowledged ? 'bg-[#E1F7E4] text-[#139B23]' : 'bg-brand-50 text-brand-500'}`}>
                        <ClipboardCheckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E2D5C] tracking-tight">Final Acknowledgment</h3>
                    {isReimbursementAcknowledged && (
                        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#139B23] bg-[#E1F7E4] border border-[#ADDEB4] px-3 py-1 rounded-full">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Ready to Submit
                        </span>
                    )}
                </div>

                {/* Pre-flight checklist — redesigned as tiered status cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'Property Address', ok: !!(propertyDetails.street) },
                        { label: 'Rehab Type', ok: !!selectedRehabType },
                        { label: 'Property Condition', ok: !!selectedCondition },
                        { label: 'Material Quality', ok: !!selectedMaterialQuality },
                        { label: 'Budget Entered', ok: scopeSummary.borrowerTotal > 0 },
                        { label: 'Policy Acknowledged', ok: isReimbursementAcknowledged },
                    ].map(({ label, ok }) => (
                        <div key={label} className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border overflow-hidden transition-all duration-300 ${ok ? 'bg-[#E1F7E4]/50 border-[#ADDEB4]' : 'bg-white border-[#DFE1E5]'}`}>
                            {/* Left accent bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${ok ? 'bg-[#139B23]' : 'bg-[#DFE1E5]'}`} />
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${ok ? 'bg-[#139B23]' : 'bg-[#F4F5F7] border border-[#DFE1E5]'}`}>
                                {ok
                                    ? <CheckCircleIcon className="w-4 h-4 text-white" />
                                    : <span className="w-2 h-2 rounded-full bg-[#BCBFC7]" />
                                }
                            </span>
                            <span className={`text-sm font-semibold leading-tight ${ok ? 'text-[#139B23]' : 'text-[#78819D]'}`}>{label}</span>
                        </div>
                    ))}
                </div>

                {scopeSummary.contingencyPercentage !== undefined && scopeSummary.contingencyPercentage < 5 && (
                    <div className="mb-5 p-4 bg-[#FFF5DB] border border-[#EDDDB1] rounded-xl flex items-start">
                        <WarningTriangleIcon className="w-5 h-5 text-[#EAA800] mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-[#1E2D5C] text-sm">Low Contingency Warning</h4>
                            <p className="text-xs text-[#78819D] mt-1">
                                Your budget has a contingency below 5%. This increases risk of budget overruns. Consider increasing your safety net before submitting.
                            </p>
                        </div>
                    </div>
                )}

                <label className={`flex items-start p-5 rounded-xl border transition-all duration-300 cursor-pointer group ${isReimbursementAcknowledged ? 'bg-[#E1F7E4]/30 border-[#ADDEB4]' : 'bg-white border-[#DFE1E5] hover:bg-[#F7F9FC] hover:border-brand-200'}`}>
                    <div className="flex items-center h-6 mt-0.5">
                        <input
                            type="checkbox"
                            checked={isReimbursementAcknowledged}
                            onChange={(e) => onAcknowledgementChange(e.target.checked)}
                            className="w-5 h-5 rounded accent-brand-500 cursor-pointer"
                            disabled={isLocked}
                        />
                    </div>
                    <div className="ml-4">
                        <span className={`text-sm font-bold block mb-1 transition-colors ${isReimbursementAcknowledged ? 'text-[#139B23]' : 'text-[#1E2D5C] group-hover:text-brand-500'}`}>
                            Reimbursement Policy Acknowledgement
                        </span>
                        <span className="text-xs text-[#78819D] block leading-relaxed">
                            I acknowledge and understand that Lima One Capital operates on a reimbursement model. Funds for this budget will be released post-closing, only for completed work verified by inspection. I certify that the information provided is accurate to the best of my knowledge.
                        </span>
                    </div>
                </label>
            </div>

            {/* ── end PDF-exportable content ── */}
            </div>

            {/* --- Export Buttons --- */}
            <div className="flex justify-end gap-3 mt-2 mb-2">
                <button
                    onClick={() => reviewContentRef.current && exportReviewPDF(reviewContentRef.current, propertyDetails.street)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#DFE1E5] hover:bg-[#F7F9FC] text-[#78819D] hover:text-[#1E2D5C] text-sm font-semibold transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    Export Review as PDF
                </button>
                <button
                    onClick={() => exportBudgetCSV(budgetData)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#DFE1E5] hover:bg-brand-50 hover:border-brand-200 text-[#78819D] hover:text-brand-500 text-sm font-semibold transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Budget as CSV
                </button>
            </div>

        </div>
    );
};
