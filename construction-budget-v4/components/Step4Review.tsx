
import React, { useMemo } from 'react';
import { PropertyDetails, AsIsProjectedData, ProjectQuestion, GeneralContractor, BudgetCategoryData, ScopeOfWorkSummary, ApplicationStatus, AsIsProjectedItem, AsIsProjectedPerUnitItem } from '../types';
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
}

const getLabel = (options: any[], value: string) => options.find(o => o.value === value)?.label || 'N/A';

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// --- Sub-Components ---

const ReviewSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="section-container p-6 mb-8 relative overflow-hidden group">
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4 mb-6">
            <div className="p-2 bg-[#0693e3]/15 rounded-lg text-[#0693e3] group-hover:bg-[#0693e3]/25 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const DataCard: React.FC<{ label: string; value: React.ReactNode; subtext?: string; highlight?: boolean }> = ({ label, value, subtext, highlight }) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${highlight ? 'bg-[#0693e3]/10 border-[#0693e3]/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
        <div className={`font-bold text-lg truncate ${highlight ? 'text-[#0693e3]' : 'text-slate-100'}`}>{value || '-'}</div>
        {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
);

const DocStatus: React.FC<{ label: string; isPresent: boolean }> = ({ label, isPresent }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${isPresent ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-800/50 border-white/5'}`}>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        {isPresent ? (
            <span className="flex items-center text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                <CheckCircleIcon className="w-4 h-4 mr-1" /> Uploaded
            </span>
        ) : (
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
        )}
    </div>
);

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
  onProjectQuestionChange
}) => {
    const showApprovedColumn = applicationStatus !== 'draft';
    const totalSqFt = parseFloat(asIsProjectedData.totalBuildingSqFeet.projected || '0');
    const ppsf = totalSqFt > 0 ? scopeSummary.borrowerTotal / totalSqFt : 0;

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
            
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Review & Submit</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Please perform a final check of all project details. Once submitted, your budget will be locked for analyst review.
                </p>
            </div>

            {/* --- 1. PROPERTY & PROJECT --- */}
            <ReviewSection title="Property & Project Context" icon={<BuildingIcon className="w-6 h-6" />}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Primary Address Card */}
                    <div className="lg:col-span-3">
                        <div className="flex flex-col md:flex-row items-start md:items-center p-5 bg-white/5 border border-white/10 rounded-xl border-l-4 border-l-[#0693e3]">
                            <div className="p-3 bg-[#0693e3]/15 rounded-full mr-4 mb-4 md:mb-0 flex-shrink-0">
                                <MapPinIcon className="w-8 h-8 text-[#0693e3]" />
                            </div>
                            <div className="flex-grow">
                                <div className="text-xs font-bold text-[#0693e3] uppercase tracking-widest mb-1">Subject Property</div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {propertyDetails.street || 'No Address Entered'}
                                </div>
                                <div className="text-slate-400 text-base">
                                    {[propertyDetails.city, propertyDetails.state, propertyDetails.zip].filter(Boolean).join(', ')}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-8 px-6 py-4 bg-[#0693e3]/10 rounded-xl border border-[#0693e3]/25 text-center min-w-[160px]">
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Purchase Price</div>
                                <div className="text-2xl font-black text-[#0693e3]">{formatCurrency(parseFloat(propertyDetails.purchasePrice))}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Key Specs */}
                    <DataCard label="Rehab Type" value={getLabel(TYPES_OF_REHAB, selectedRehabType)} highlight />
                    <DataCard label="Condition" value={getLabel(CONDITIONS_OF_PROPERTY, selectedCondition)} />
                    <DataCard label="Material Quality" value={getLabel(MATERIAL_QUALITIES, selectedMaterialQuality)} />
                </div>

                {/* As-Is vs Projected Grid */}
                <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden mb-8">
                    <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Specs Comparison</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-white/10 text-slate-400 px-2.5 py-1 rounded-full border border-white/10">Read Only</span>
                    </div>
                    <div className="grid grid-cols-3 text-sm font-medium text-slate-400 border-b border-white/10 bg-white/5">
                        <div className="p-4">Item</div>
                        <div className="p-4 text-center border-l border-white/10">Current (As-Is)</div>
                        <div className="p-4 text-center border-l border-white/10 text-[#0693e3]">Projected</div>
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
                            <div key={key} className={`grid grid-cols-3 text-sm border-b border-white/5 last:border-0 ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                <div className="p-4 text-slate-300 font-medium">{item.label}</div>
                                <div className="p-4 text-center text-slate-500 border-l border-white/5">{asIsVal || '-'}</div>
                                <div className={`p-4 text-center border-l border-white/5 font-bold ${isChanged ? 'text-[#0693e3]' : 'text-slate-500'}`}>
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
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Performer Strategy</h4>
                        <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center mb-2">
                                <span className={`w-3 h-3 rounded-full mr-2 ${generalContractor.performerType === 'Self-Managed' ? 'bg-yellow-500' : 'bg-[#0693e3]'}`}></span>
                                <span className="text-lg font-bold text-white">{generalContractor.performerType || 'Not Selected'}</span>
                            </div>
                            {generalContractor.performerType === 'General Contractor' && (
                                <div className="mt-2 pl-5">
                                    <div className="text-sm text-slate-300 font-medium">{generalContractor.businessName || 'Business Name Pending'}</div>
                                    <div className="text-xs text-slate-500 mt-1 truncate">{generalContractor.website}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {generalContractor.performerType === 'General Contractor' && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Compliance Documents</h4>
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
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Scope of Work Narrative</h4>
                        <div className="flex-grow p-5 bg-white/5 rounded-xl border border-white/10 text-sm text-slate-300 italic leading-relaxed shadow-inner">
                            "{projectScopeStatement || 'No scope statement provided.'}"
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
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Budget Breakdown by Category</h4>
                    <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="bg-slate-900/80 text-xs uppercase text-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Category</th>
                                    <th className="px-6 py-4 font-bold text-right">Requested Amount</th>
                                    {showApprovedColumn && <th className="px-6 py-4 font-bold text-right text-green-400">Approved</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-white/5">
                                {budgetData.map(category => {
                                    const catTotal = category.items.reduce((sum, item) => sum + item.budget, 0);
                                    const catActual = category.items.reduce((sum, item) => sum + item.actual, 0);
                                    if (catTotal === 0 && catActual === 0) return null;

                                    return (
                                        <tr key={category.name} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-200">{category.name}</td>
                                            <td className="px-6 py-3 text-right font-mono text-slate-300">{formatCurrency(catTotal)}</td>
                                            {showApprovedColumn && <td className="px-6 py-3 text-right font-mono text-green-400">{formatCurrency(catActual)}</td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-[#0693e3]/10 font-bold text-white border-t-2 border-[#0693e3]/30">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-slate-300 uppercase tracking-wider text-xs">Grand Total</td>
                                    <td className="px-6 py-4 text-right text-xl font-black text-[#0693e3]">{formatCurrency(scopeSummary.borrowerTotal)}</td>
                                    {showApprovedColumn && <td className="px-6 py-4 text-right text-xl text-green-400">{formatCurrency(scopeSummary.limaOneApprovedTotal)}</td>}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </ReviewSection>

            {/* --- 4. PROJECT QUESTIONNAIRE (Moved from Step 1) --- */}
            {visibleQuestions.length > 0 && (
                <ReviewSection title="Project Questionnaire" icon={<ChatBubbleIcon className="w-6 h-6" />}>
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/10">
                                <tr>
                                    <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-5/12">Question</th>
                                    <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-1/12">Response</th>
                                    <th scope="col" className="py-3 px-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-6/12">Explanation (If Applicable)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-transparent">
                            {visibleQuestions.map((q) => {
                                const isLastQuestion = q.id === 'q8';
                                const explanationRequired = !isLastQuestion && q.answer === 'Yes';
                                const explanationPlaceholder = "Brief Explanation";
                                
                                return (
                                    <tr key={q.id}>
                                        <td className="py-4 px-4 text-sm font-medium text-slate-200">{q.question}</td>
                                        <td className="p-2 align-middle">
                                            <select 
                                                value={q.answer} 
                                                onChange={(e) => onProjectQuestionChange(q.id, 'answer', e.target.value)}
                                                className={`spreadsheet-input h-full py-2 text-sm border-white/10 bg-black/20 ${!q.answer ? 'border-red-500/50' : ''}`}
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
                                                    className={`spreadsheet-input resize-none overflow-hidden text-sm border-white/10 bg-black/20 ${explanationRequired ? 'bg-black/30' : 'opacity-50'}`}
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
            <div className={`section-container p-6 mb-8 transition-all duration-500 ${isReimbursementAcknowledged ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-white/10'}`}>
                <div className="flex items-center space-x-3 border-b border-white/10 pb-4 mb-5">
                    <div className={`p-2 rounded-lg transition-colors ${isReimbursementAcknowledged ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#0693e3]/15 text-[#0693e3]'}`}>
                        <ClipboardCheckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">Final Acknowledgment</h3>
                    {isReimbursementAcknowledged && (
                        <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/30">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Ready to Submit
                        </span>
                    )}
                </div>

                {/* Pre-flight checklist */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'Property Address', ok: !!(propertyDetails.street) },
                        { label: 'Rehab Type', ok: !!selectedRehabType },
                        { label: 'Property Condition', ok: !!selectedCondition },
                        { label: 'Material Quality', ok: !!selectedMaterialQuality },
                        { label: 'Budget Entered', ok: scopeSummary.borrowerTotal > 0 },
                        { label: 'Policy Acknowledged', ok: isReimbursementAcknowledged },
                    ].map(({ label, ok }) => (
                        <div key={label} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${ok ? 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                                {ok ? '✓' : '○'}
                            </span>
                            {label}
                        </div>
                    ))}
                </div>

                {scopeSummary.contingencyPercentage !== undefined && scopeSummary.contingencyPercentage < 5 && (
                    <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start">
                        <WarningTriangleIcon className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-yellow-200 text-sm">Low Contingency Warning</h4>
                            <p className="text-xs text-yellow-100/80 mt-1">
                                Your budget has a contingency below 5%. This increases risk of budget overruns. Consider increasing your safety net before submitting.
                            </p>
                        </div>
                    </div>
                )}

                <label className={`flex items-start p-5 rounded-xl border transition-all duration-300 cursor-pointer group ${isReimbursementAcknowledged ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#0693e3]/30'}`}>
                    <div className="flex items-center h-6 mt-0.5">
                        <input
                            type="checkbox"
                            checked={isReimbursementAcknowledged}
                            onChange={(e) => onAcknowledgementChange(e.target.checked)}
                            className="w-5 h-5 rounded accent-[#0693e3] cursor-pointer"
                            disabled={isLocked}
                        />
                    </div>
                    <div className="ml-4">
                        <span className={`text-sm font-bold block mb-1 transition-colors ${isReimbursementAcknowledged ? 'text-emerald-300' : 'text-white group-hover:text-[#0693e3]'}`}>
                            Reimbursement Policy Acknowledgement
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                            I acknowledge and understand that Lima One Capital operates on a reimbursement model. Funds for this budget will be released post-closing, only for completed work verified by inspection. I certify that the information provided is accurate to the best of my knowledge.
                        </span>
                    </div>
                </label>
            </div>

        </div>
    );
};
