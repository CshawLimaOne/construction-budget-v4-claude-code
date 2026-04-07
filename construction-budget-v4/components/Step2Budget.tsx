
import React, { useEffect, useState, useMemo, useRef } from 'react'; 
import { BudgetItem, BudgetCategoryData, ScopeOfWorkSummary, Comment, CommentThread, UserRole, RiskAnalysisResult, ApplicationStatus } from '../types'; 
import { CONTINGENCY_ITEM_ID, GC_BUILDER_FEES_ITEM_ID, DRAW_SCHEDULE_OPTIONS, NC_HIDDEN_ITEM_NUMBERS, RENOVATION_HIDDEN_ITEM_NUMBERS } from '../constants'; 
import Tooltip from './Tooltip'; 
import { InfoIcon, XCircleIcon, ChatBubbleIcon, FlagIcon, SpinnerIcon, WarningTriangleIcon, CalculatorIcon, CameraIcon, LightBulbIcon, MagicWandIcon, BuildingIcon, CheckIcon, PercentDownIcon, CloudUploadIcon, PlusIcon } from './Icons'; 
import { CommentIndicator } from './CommentIndicator';
import { checkBudgetLineItem, GuidanceResult, SUPPORTED_BENCHMARKS } from '../utils/budgetGuidanceEngine';
import { ComplexModal } from './ComplexModal';

interface Step2BudgetProps {
  budgetData: BudgetCategoryData[];
  scopeSummary: ScopeOfWorkSummary;
  projectScopeStatement: string;
  isLimaApprovedBudgetEditable: boolean;
  collapsedCategories: Record<string, boolean>;
  comments: Comment[];
  commentThreads: CommentThread[];
  currentUserRole: UserRole;
  applicationStatus: ApplicationStatus;
  isLocked?: boolean;
  scrollToFieldId: string | null;
  highlightedItemIds: Set<string>;
  isGeneratingScope: boolean;
  isSimplifiedViewAvailable: boolean;
  budgetViewMode: 'simplified' | 'detailed' | 'draw_schedule';
  expandedInSimplifiedView: Set<string>;
  onScrollComplete: () => void;
  onOpenCommentThread: (fieldId: string, fieldLabel: string) => void;
  onToggleCategoryCollapse: (categoryName: string) => void;
  onUpdateBudgetItem: (categoryName: string, itemId: string, field: keyof BudgetItem, value: string | number | boolean, originalValue?: number | string | boolean, fieldLabel?: string) => void;
  onScopeSummaryChange: (field: keyof ScopeOfWorkSummary, value: string | number | boolean) => void;
  onProjectScopeStatementChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  highlightLimaOneTotalMismatch: boolean; 
  onAddCustomBudgetItem: (categoryName: string, options?: { fromSimplifiedView?: boolean, initialValues?: Partial<BudgetItem> }) => void;
  onRemoveCustomBudgetItem: (categoryName: string, itemId: string) => void;
  onPrefillBudget: () => void;
  onRemovePhoto: (categoryName: string, itemId: string, photoIndex: number) => void;
  onRemoveCategoryPhoto: (categoryName: string, photoIndex: number) => void;
  onOpenBulkUploadModal: () => void;
  onCopyCategoryAmounts: (categoryName: string) => void;
  onGenerateScope: () => void;
  onSetBudgetViewMode: (mode: 'simplified' | 'detailed' | 'draw_schedule') => void;
  onToggleSimplifiedCategoryExpansion: (categoryName: string) => void;
  onUpdateCategoryDescription: (categoryName: string, description: string) => void;
  onUpdateCategoryTotalBudget: (categoryName: string, totalBudget: number) => void;
  riskAnalysis: RiskAnalysisResult;
  totalSqFt?: string;
  propertyState?: string;
  selectedRehabType?: string;
  onSwitchToWalkthrough?: () => void;
  onOpenSoftCostWizard?: () => void; 
  highlightMissingFields?: boolean; 
  onCategoryBulkAdjust?: (categoryName: string, percent: number) => void;
  onSaveAsTemplate?: () => void; 
  isRepeatUser: boolean; 
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || isNaN(Number(value))) return '$0'; 
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const ChevronIcon: React.FC<{ collapsed: boolean; className?: string }> = ({ collapsed, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={`w-5 h-5 transition-transform duration-200 ease-in-out ${collapsed ? '-rotate-90' : ''} ${className || ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5-7.5-7.5" />
  </svg>
);

// --- Draw Schedule Components ---
interface DrawItemRowProps {
    item: BudgetItem;
    categoryName: string;
    onMoveItem: (itemId: string, newDrawId: string) => void;
}

const DrawItemRow: React.FC<DrawItemRowProps> = ({ item, categoryName, onMoveItem }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("itemId", item.id);
        e.dataTransfer.setData("sourceCategory", categoryName);
    };

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            className="flex items-center justify-between p-2 mb-1.5 bg-slate-800/60 border border-white/10 text-slate-200 rounded-xl shadow-sm hover:border-[#0693e3]/40 hover:bg-slate-700/60 cursor-grab active:cursor-grabbing text-sm transition-colors"
        >
            <div className="flex flex-col">
                <span className="font-medium text-slate-100">{item.drawItem || "Unnamed Item"}</span>
                <span className="text-[10px] text-slate-400">{categoryName} • {item.itemNumber}</span>
            </div>
            <div className="font-mono font-bold text-[#0693e3]">
                {formatCurrency(item.budget)}
            </div>
        </div>
    );
};

const DrawBucket: React.FC<{
    drawId: string;
    label: string;
    description: string;
    items: { item: BudgetItem; categoryName: string }[];
    total: number;
    grandTotal: number;
    onDropItem: (itemId: string, drawId: string) => void;
}> = ({ drawId, label, description, items, total, grandTotal, onDropItem }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const itemId = e.dataTransfer.getData("itemId");
        if (itemId) {
            onDropItem(itemId, drawId);
        }
    };

    const percentOfTotal = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col rounded-xl border transition-all duration-200 overflow-hidden ${
                isOver
                    ? 'border-[#0693e3]/60 bg-[#0693e3]/10 shadow-lg shadow-[#0693e3]/10'
                    : 'border-white/10 bg-white/5'
            }`}
        >
            {/* LO cyan top accent bar */}
            <div className={`h-1 w-full transition-all duration-200 ${isOver ? 'bg-[#0693e3]' : 'bg-[#0693e3]/40'}`} />

            <div className="p-3 border-b border-white/10 bg-white/5">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-white text-sm">{label}</h4>
                    <span className="font-mono font-bold text-[#0693e3] text-sm">{formatCurrency(total)}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{description}</p>
                <div className="w-full bg-slate-700/60 rounded-full h-1 overflow-hidden">
                    <div className="bg-[#0693e3] h-1 transition-all duration-500" style={{ width: `${percentOfTotal}%` }} />
                </div>
            </div>

            <div className="p-2 flex-grow overflow-y-auto min-h-[120px] max-h-[360px]">
                {items.length === 0 ? (
                    <div className="h-full min-h-[100px] flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[#0693e3]/25 rounded-lg">
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#0693e3]/40 flex items-center justify-center">
                            <span className="text-[#0693e3]/60 text-xs font-bold">+</span>
                        </div>
                        <span className="text-xs text-slate-500 italic">Drag items here</span>
                    </div>
                ) : (
                    items.map(wrapper => (
                        <DrawItemRow
                            key={wrapper.item.id}
                            item={wrapper.item}
                            categoryName={wrapper.categoryName}
                            onMoveItem={() => {}}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// --- Standard Budget Row Components --- 

interface BudgetItemRowProps {
    item: BudgetItem;
    categoryName: string;
    isLimaApprovedBudgetEditable: boolean;
    scopeSummary: ScopeOfWorkSummary; 
    comments: Comment[];
    commentThreads: CommentThread[];
    currentUserRole: UserRole;
    highlightedItemIds: Set<string>;
    isLocked?: boolean;
    onOpenCommentThread: (fieldId: string, fieldLabel: string) => void;
    onUpdateBudgetItem: Step2BudgetProps['onUpdateBudgetItem'];
    onScopeSummaryChange: Step2BudgetProps['onScopeSummaryChange']; 
    onRemoveCustomBudgetItem: Step2BudgetProps['onRemoveCustomBudgetItem'];
    onRemovePhoto: Step2BudgetProps['onRemovePhoto'];
    isFirstItem?: boolean; 
    isLastItem?: boolean;
    onAdvance?: () => void;
    riskAnalysis: RiskAnalysisResult;
    showApprovedColumn: boolean;
    isGuidanceEnabled: boolean;
    totalSqFt?: string;
    propertyState?: string;
}

const BudgetItemRow: React.FC<BudgetItemRowProps> = ({ item, categoryName, isLimaApprovedBudgetEditable, scopeSummary, comments, commentThreads, currentUserRole, highlightedItemIds, isLocked, onOpenCommentThread, onUpdateBudgetItem, onScopeSummaryChange, onRemoveCustomBudgetItem, onRemovePhoto, isFirstItem, isLastItem, onAdvance, riskAnalysis, showApprovedColumn, isGuidanceEnabled, totalSqFt, propertyState }) => {
    const [isBudgetFocused, setIsBudgetFocused] = React.useState(false); 
    const [isActualFocused, setIsActualFocused] = React.useState(false);
    const [localActualValue, setLocalActualValue] = React.useState(String(item.actual || ''));
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const guidance = useMemo<GuidanceResult | null>(() => {
        if (!totalSqFt || !propertyState || currentUserRole !== 'borrower') return null;
        const cleanSqFt = parseFloat(totalSqFt.replace(/,/g, ''));
        if (cleanSqFt <= 0) return null;
        
        return checkBudgetLineItem(item.drawItem, item.budget, cleanSqFt, propertyState);
    }, [item.budget, item.drawItem, totalSqFt, propertyState, currentUserRole]);

    const getItemHelper = (name: string) => {
        if (name.toLowerCase().includes('rough')) return { text: "Work done inside the walls before drywall goes up (pipes, wires, ducts).", icon: '?' };
        if (name.toLowerCase().includes('final') || name.toLowerCase().includes('trim')) return { text: "The visible stuff: Faucets, light fixtures, vent covers.", icon: '?' };
        if (name.toLowerCase().includes('top out')) return { text: "Completing the internal piping/wiring before walls are closed.", icon: '?' };
        return null;
    };
    
    const itemHelper = getItemHelper(item.drawItem);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [item.description]);

    React.useEffect(() => {
        if (!isActualFocused) {
            setLocalActualValue(String(item.actual || ''));
        }
    }, [item.actual, isActualFocused]);

    const handleActualChangeCommit = () => {
        const numericValue = parseFloat(localActualValue.replace(/[^0-9.-]+/g, "")) || 0;
        const roundedValue = Math.round(numericValue);

        if (roundedValue !== item.actual) {
            const fieldLabel = `${categoryName} > ${item.drawItem || item.description || 'Custom Item'}`;
            onUpdateBudgetItem(categoryName, item.id, 'actual', roundedValue, item.actual, fieldLabel);
        }
        setIsActualFocused(false);
    };

    const handleBudgetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
            if (isLastItem && onAdvance) {
                onAdvance();
            }
        }
    };

    const handleActualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleActualChangeCommit();
            e.currentTarget.blur();
        }
    };

    const descriptionError = item.isCustomDescription && (item.budget !== 0 || item.actual !== 0) && item.description.trim() === '';
    const needsDescriptionHighlight = !item.isCustomDescription && item.budget !== 0 && item.description.trim() === '';
    const isBorrowerColumnReadOnly = isLocked || currentUserRole === 'analyst';
    const isContingencyBudgetReadOnly = item.isContingencyItem && scopeSummary.isContingencyAutoCalculated;
    const budgetInputReadOnly = isContingencyBudgetReadOnly || isBorrowerColumnReadOnly;
    const isLimaApprovedReadOnly = !isLimaApprovedBudgetEditable;
    
    const budgetDisplayValue = isBudgetFocused && !budgetInputReadOnly
                             ? (item.budget !== undefined ? item.budget.toString() : '') 
                             : formatCurrency(item.budget);
    
    const actualDisplayValue = isLimaApprovedReadOnly 
                               ? formatCurrency(item.actual) 
                               : (isActualFocused 
                                   ? localActualValue
                                   : formatCurrency(item.actual));
    
    let rowId = `budget-item-row-${item.id}`;
    if (isFirstItem && categoryName === "Soft Costs") { 
        rowId = 'budget-table-first-item-row';
    } else if (item.id === CONTINGENCY_ITEM_ID) {
        rowId = `budget-item-row-${CONTINGENCY_ITEM_ID}`;
    }
    const isHighlighted = highlightedItemIds.has(item.id);
    const gcFeeTooltipText = "GC/Builder Fees are automatically capped at 10% of the subtotal (excluding contingency). Any entered amount exceeding this cap will be adjusted.";
    const contingencyTooltipText = "Check 'Auto' to calculate contingency as a percentage of the subtotal (including GC fees). Uncheck to enter a manual contingency amount. The percentage applies to the sum of all budget items plus GC/Builder Fees.";
    const itemRisk = riskAnalysis.factors.find(f => f.itemId === item.id);
    
    // Whisper Logic - Now depends on isGuidanceEnabled
    const showWhisper = isGuidanceEnabled && isBudgetFocused && guidance && (guidance.benchmarkLow || guidance.status !== 'OK');
    const isWarning = isGuidanceEnabled && (guidance?.status === 'HIGH_WARNING' || guidance?.status === 'LOW_WARNING');
    const whisperColor = isWarning ? 'text-orange-400' : 'text-slate-400';
    
    let whisperText = '';
    if (guidance?.benchmarkLow && guidance?.benchmarkHigh) {
        whisperText = `Avg: $${guidance.benchmarkLow.toLocaleString()} - $${guidance.benchmarkHigh.toLocaleString()}`;
    }
    if (guidance?.status === 'HIGH_WARNING') whisperText = `⚠️ High: Avg max is $${guidance.benchmarkHigh?.toLocaleString()}`;
    if (guidance?.status === 'LOW_WARNING') whisperText = `⚠️ Low: Avg min is $${guidance.benchmarkLow?.toLocaleString()}`;

    return (
        <>
        <tr id={rowId} className={isHighlighted ? 'ai-highlight' : ''}> 
            <td data-label="Item #" className={`read-only-cell text-center ${item.isRedText ? 'highlight-red dark:text-red-300': ''} w-[6%]`}>
                <div className="flex items-center justify-center space-x-1">
                    <span>{item.itemNumber}</span>
                    {item.isUncertain && (
                        <Tooltip text="AI match uncertain. Please verify this line item." position="top">
                            <FlagIcon className="text-yellow-500" />
                        </Tooltip>
                    )}
                    {itemRisk && (
                        <Tooltip text={`Risk Alert: ${itemRisk.message}`} position="right">
                            <WarningTriangleIcon className="text-red-500 w-4 h-4 cursor-pointer" />
                        </Tooltip>
                    )}
                </div>
            </td>
            {item.isCustomDescription ? (
              <td data-label="Item / Task" className="p-1 w-[22%] relative group">
                <input
                  type="text"
                  value={item.drawItem}
                  onChange={(e) => onUpdateBudgetItem(categoryName, item.id, 'drawItem', e.target.value)}
                  placeholder="(your description)"
                  className={`spreadsheet-input ${item.isRedText ? 'highlight-red dark:text-red-300' : ''}`}
                  aria-label="Custom Draw Item Name"
                  disabled={isLocked}
                />
              </td>
            ) : (
              <td data-label="Item / Task" className={`read-only-cell ${item.isRedText ? 'highlight-red dark:text-red-300': ''} w-[22%]`}>
                  <div className="flex items-center">
                    {item.drawItem}
                    {itemHelper && (
                        <Tooltip text={itemHelper.text} position="top">
                            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-slate-500 border border-slate-400 rounded-full cursor-help hover:text-brand-600 hover:border-brand-600">?</span>
                        </Tooltip>
                    )}
                  </div>
              </td>
            )}
            <td data-label="Description" className="p-1 w-[37%] relative group">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={item.description}
                    onChange={(e) => {
                        onUpdateBudgetItem(categoryName, item.id, 'description', e.target.value);
                        const textarea = e.currentTarget;
                        textarea.style.height = 'auto';
                        textarea.style.height = `${textarea.scrollHeight}px`;
                    }}
                    placeholder={item.isCustomDescription ? 'Your description' : 'Item Description'}
                    className={`spreadsheet-input resize-none overflow-hidden ${descriptionError ? 'description-input-error' : ''} ${needsDescriptionHighlight ? 'bg-red-900/60 !placeholder-red-300' : ''}`}
                    aria-label="Item Description"
                    disabled={isLocked}
                />
               {item.isCustomDescription && !isLocked && (
                <button
                  onClick={() => onRemoveCustomBudgetItem(categoryName, item.id)}
                  className="static w-full mt-2 flex items-center justify-center p-3 bg-red-900/50 text-red-300 rounded-md font-bold md:absolute md:right-1 md:top-1/2 md:w-auto md:h-auto md:p-0.5 md:bg-red-600 md:text-white md:rounded-full md:-translate-y-1/2 md:mt-0 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label="Remove custom item"
                >
                  <span className="md:hidden">Remove Item</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 md:ml-0 md:w-3 md:h-3">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 0 0-1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
            </td>
            <td data-label="Comments" className="text-center align-middle w-[5%] p-1">
                <div className="comment-indicator-table-cell flex justify-center">
                    <CommentIndicator
                        fieldId={`budgetItem.${item.id}`}
                        comments={comments}
                        commentThreads={commentThreads}
                        currentUserRole={currentUserRole}
                        onClick={() => onOpenCommentThread(`budgetItem.${item.id}`, `${categoryName} > ${item.drawItem || item.description || 'Custom Item'}`)}
                    />
                </div>
            </td>
            <td data-label="Borrower Requested" className="p-1 w-[15%]">
                {item.isContingencyItem && (
                    <Tooltip text={contingencyTooltipText} position="top">
                        <div className="flex flex-col items-center text-xs mb-0.5 text-slate-300">
                            <label htmlFor={`contingency-auto-${item.id}`} className={`flex items-center space-x-1 ${budgetInputReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    id={`contingency-auto-${item.id}`}
                                    checked={scopeSummary.isContingencyAutoCalculated}
                                    onChange={(e) => onScopeSummaryChange('isContingencyAutoCalculated', e.target.checked)}
                                    className="form-checkbox h-3 w-3 text-sky-500 bg-slate-600 checked:bg-sky-500"
                                    disabled={budgetInputReadOnly}
                                />
                                <span>Auto</span>
                            </label>
                            {scopeSummary.isContingencyAutoCalculated && (
                                <div className="flex items-center mt-0.5">
                                    <input
                                        type="number"
                                        value={scopeSummary.contingencyPercentage === undefined ? '' : scopeSummary.contingencyPercentage}
                                        onChange={(e) => onScopeSummaryChange('contingencyPercentage', parseFloat(e.target.value) || 0)}
                                        className="spreadsheet-input text-right w-12 h-5 p-0.5 text-xs"
                                        min="0" max="100" step="0.1"
                                        aria-label="Contingency percentage"
                                        disabled={budgetInputReadOnly}
                                    />
                                    <span className="ml-0.5">%</span>
                                </div>
                            )}
                        </div>
                    </Tooltip>
                )}
                <Tooltip text={item.isGcBuilderFeeItem ? gcFeeTooltipText : ""} position="top" className={!item.isGcBuilderFeeItem ? "hidden" : ""}>
                    <div className="relative">
                        <input
                            id={`budget-input-${item.id}`}
                            type={(isBudgetFocused && !budgetInputReadOnly) ? 'number' : 'text'}
                            value={budgetDisplayValue}
                            onFocus={() => { if (!budgetInputReadOnly) setIsBudgetFocused(true);}}
                            onBlur={() => { if (!budgetInputReadOnly) setIsBudgetFocused(false);}}
                            onChange={(e) => { 
                                if (!budgetInputReadOnly) {
                                    // FORCE PARSE FLOAT to prevent string concatenation
                                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    onUpdateBudgetItem(categoryName, item.id, 'budget', isNaN(val) ? 0 : val);
                                }
                            }}
                            onKeyDown={handleBudgetKeyDown}
                            className={`spreadsheet-input text-right font-bold text-brand-300 bg-brand-900/10 border-brand-500/30
                                ${budgetInputReadOnly ? 'bg-slate-600 cursor-not-allowed text-slate-400' : ''} 
                                ${item.isGcBuilderFeeItem ? 'border-orange-500' : ''}
                                ${isWarning && !isBudgetFocused ? 'border-yellow-400 text-yellow-400' : ''}
                            `}
                            placeholder="$0"
                            step={(isBudgetFocused && !budgetInputReadOnly) ? "1" : undefined}
                            readOnly={budgetInputReadOnly}
                            aria-label="Borrower Requested Amount"
                        />
                        {/* Inline Whisper Guidance */}
                        {showWhisper && (
                            <div className={`absolute top-full right-0 mt-1 z-20 text-[10px] font-semibold whitespace-nowrap bg-slate-800 px-2 py-1 rounded-lg shadow border border-slate-600 ${whisperColor}`}>
                                {whisperText}
                            </div>
                        )}
                        
                        {/* Logic Explanation Icon */}
                        {item.aiLogic && !guidance && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Tooltip text={item.aiLogic} position="left">
                                    <CalculatorIcon className="w-4 h-4 text-brand-500 cursor-help" />
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </Tooltip>
            </td>
            {showApprovedColumn && (
                <td data-label="Lima One Approved" className="p-1 w-[15%]">
                <input
                    type={isLimaApprovedReadOnly ? 'text' : (isActualFocused ? 'number' : 'text')}
                    value={actualDisplayValue}
                    onFocus={() => {
                        if (isLimaApprovedBudgetEditable) {
                            setIsActualFocused(true);
                            setLocalActualValue(String(item.actual || ''));
                        }
                    }}
                    onBlur={() => {
                        if (isLimaApprovedBudgetEditable) {
                            handleActualChangeCommit();
                        }
                    }}
                    onChange={(e) => {
                    if (isLimaApprovedBudgetEditable) {
                        setLocalActualValue(e.target.value);
                    }
                    }}
                    onKeyDown={handleActualKeyDown}
                    className={`spreadsheet-input text-right font-bold text-green-300 bg-green-900/10 border-green-500/30 ${isLimaApprovedReadOnly ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : ''}`}
                    placeholder="$0"
                    step={(isLimaApprovedBudgetEditable && isActualFocused) ? "1" : undefined} 
                    readOnly={isLimaApprovedReadOnly}
                    aria-label="Lima One Approved Amount"
                />
                </td>
            )}
        </tr>
        {(item.uploadedPhotos && item.uploadedPhotos.length > 0) && (
            <tr className={isHighlighted ? 'ai-highlight' : ''}>
                <td colSpan={showApprovedColumn ? 6 : 5} className="p-2 bg-slate-800/50">
                    <div className="flex items-start space-x-2">
                        <div className="flex flex-wrap gap-2 flex-grow">
                            {item.uploadedPhotos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img src={photo.preview} alt={`upload preview ${index}`} className="h-24 w-24 object-cover rounded-md" />
                                    {!isLocked && (
                                        <button 
                                            onClick={() => onRemovePhoto(categoryName, item.id, index)} 
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
                                            aria-label="Remove photo"
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-slate-400 p-2 border-l-2 border-slate-700 w-1/3">
                            <p className="font-semibold">AI Analysis:</p>
                            <p><i>Analysis will appear here...</i></p>
                        </div>
                    </div>
                </td>
            </tr>
        )}
        </>
    );
};

interface BudgetCategoryRowProps {
    category: BudgetCategoryData;
    isLimaApprovedBudgetEditable: boolean;
    scopeSummary: ScopeOfWorkSummary;
    collapsed: boolean;
    comments: Comment[];
    commentThreads: CommentThread[];
    currentUserRole: UserRole;
    highlightedItemIds: Set<string>;
    isLocked?: boolean;
    budgetViewMode: 'simplified' | 'detailed' | 'draw_schedule';
    onOpenCommentThread: (fieldId: string, fieldLabel: string) => void;
    onToggleCollapse: () => void;
    onUpdateBudgetItem: Step2BudgetProps['onUpdateBudgetItem'];
    onScopeSummaryChange: Step2BudgetProps['onScopeSummaryChange'];
    onAddCustomBudgetItem: Step2BudgetProps['onAddCustomBudgetItem'];
    onRemoveCustomBudgetItem: Step2BudgetProps['onRemoveCustomBudgetItem'];
    onRemovePhoto: Step2BudgetProps['onRemovePhoto'];
    onRemoveCategoryPhoto: Step2BudgetProps['onRemoveCategoryPhoto'];
    onCopyCategoryAmounts: (categoryName: string) => void;
    isFirstCategory?: boolean;
    riskAnalysis: RiskAnalysisResult;
    showApprovedColumn: boolean;
    isGuidanceEnabled: boolean;
    totalSqFt?: string;
    propertyState?: string;
    selectedRehabType?: string;
    highlightMissingFields?: boolean; 
    onOpenSoftCostWizard?: () => void;
    onCategoryBulkAdjust?: (categoryName: string, percent: number) => void;
    onAdvance?: () => void; 
    onUpdateCategoryTotalBudget: (categoryName: string, totalBudget: number) => void;
    onUpdateCategoryDescription: (categoryName: string, description: string) => void; 
}

const BudgetCategoryRow: React.FC<BudgetCategoryRowProps> = ({ category, isLimaApprovedBudgetEditable, scopeSummary, collapsed, comments, commentThreads, currentUserRole, highlightedItemIds, isLocked, budgetViewMode, onOpenCommentThread, onToggleCollapse, onUpdateBudgetItem, onScopeSummaryChange, onAddCustomBudgetItem, onRemoveCustomBudgetItem, onRemovePhoto, onRemoveCategoryPhoto, onCopyCategoryAmounts, isFirstCategory, riskAnalysis, showApprovedColumn, isGuidanceEnabled, totalSqFt, propertyState, selectedRehabType, highlightMissingFields, onOpenSoftCostWizard, onCategoryBulkAdjust, onAdvance, onUpdateCategoryTotalBudget, onUpdateCategoryDescription }) => {
  
  // Filter items based on Rehab Type
  let itemsToRender = category.items;
  if (selectedRehabType === 'New Construction') {
      itemsToRender = category.items.filter(item => !NC_HIDDEN_ITEM_NUMBERS.includes(item.itemNumber));
  } else if (['Light-Cosmetic', 'Standard-Full', 'Heavy'].includes(selectedRehabType || '')) {
      itemsToRender = category.items.filter(item => !RENOVATION_HIDDEN_ITEM_NUMBERS.includes(item.itemNumber));
  }

  // Calculate totals - safeguard with Number() to prevent string concatenation
  const categoryBudgetTotal = itemsToRender.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
  const categoryActualTotal = itemsToRender.reduce((sum, item) => sum + (Number(item.actual) || 0), 0);
  const activeItemCount = itemsToRender.filter(i => i.budget > 0).length;

  const categoryHeaderTdBaseClass = "py-3 px-4 text-white font-bold text-base cursor-pointer";
  const addItemButtonId = isFirstCategory ? 'add-item-button-soft-costs' : `add-item-button-${category.name.toLowerCase().replace(/\s+/g, '-')}`;

  const categoryRisk = riskAnalysis.factors.find(f => f.category === category.name && !f.itemId);

  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState('');
  
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleBulkAdjustSubmit = () => {
      const p = parseFloat(bulkPercent);
      if (!isNaN(p) && onCategoryBulkAdjust) {
          onCategoryBulkAdjust(category.name, p);
          setIsBulkAdjustOpen(false);
          setBulkPercent('');
      }
  };

  const getCategoryTooltip = (name: string) => {
      switch(name) {
          case 'Soft Costs': return "Non-physical costs: Permits, plans, fees, and temporary utilities.";
          case 'Systems': return "Major infrastructure: HVAC, Plumbing, and Electrical.";
          case 'Site Improvements': return "Exterior work: Landscaping, fencing, driveways, and utility connections.";
          default: return null;
      }
  };
  const categoryTooltip = getCategoryTooltip(category.name);

  // Permit Warning Logic
  const showPermitWarning = category.name === 'Soft Costs' && 
                            ['Standard-Full', 'Heavy'].includes(selectedRehabType || '') &&
                            category.items.find(i => i.drawItem === 'Building Permit*')?.budget === 0;

  // Highlight if 0 and required
  const isRequiredCategory = ['Soft Costs', 'Site Improvements', 'Final - Misc'].includes(category.name);
  const shouldHighlight = highlightMissingFields && isRequiredCategory && categoryBudgetTotal === 0;

  const missingReason = shouldHighlight ? (() => {
      switch(category.name) {
          case 'Soft Costs': return "Most projects require Permits ($) and Plans ($). If not, please enter $0 explicitly or add a note.";
          case 'Site Improvements': return "Commonly missed: Landscaping cleanup, fencing repair, or driveway power washing.";
          case 'Final - Misc': return "Don't forget Final Cleaning, Staging, or Utility connections.";
          default: return "This category typically has associated costs.";
      }
  })() : "";

  // Show Soft Cost Wizard Button if applicable
  const showWizardButton = category.name === 'Soft Costs' && selectedRehabType === 'New Construction' && onOpenSoftCostWizard;

  // Simplified View Specifics
  const isSimplified = budgetViewMode === 'simplified';
  const effectiveCollapsed = isSimplified || collapsed; // Always force collapse visually if simplified

  // ID for Category-level comment thread
  const categoryThreadId = `categoryHeader.${category.name}`;

  // Auto-resize description textarea in simplified view
  useEffect(() => {
    if (isSimplified && descriptionRef.current) {
        descriptionRef.current.style.height = 'auto';
        descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [isSimplified, category.description]);

  return (
    <>
      <tr 
        id={`category-row-${category.name.replace(/\s+/g, '-')}`}
        className={`transition-opacity ${shouldHighlight ? 'bg-red-600 border-2 border-red-700' : 'bg-[#1E2E5C] dark:bg-slate-700 hover:bg-opacity-90 dark:hover:bg-opacity-80'}`} 
        onClick={!isSimplified ? onToggleCollapse : undefined} 
      >
        <td className={`${categoryHeaderTdBaseClass} text-left full-width-mobile`} colSpan={2} data-label="Item / Task">
          <div className="flex items-center">
            {!isSimplified && <ChevronIcon collapsed={effectiveCollapsed} className="mr-2" />}
            <span className="flex-grow">{category.name}</span>
            
            {/* Accordion Summary */}
            {effectiveCollapsed && !isSimplified && (
                <span className="text-sm font-normal text-slate-300 ml-4 hidden sm:inline-block">
                    {activeItemCount} selected | {formatCurrency(categoryBudgetTotal)}
                </span>
            )}

            {categoryTooltip && !effectiveCollapsed && (
                <Tooltip text={categoryTooltip} position="top">
                    <InfoIcon className="text-slate-300 hover:text-white ml-2 w-4 h-4 cursor-help" />
                </Tooltip>
            )}
            {categoryRisk && (
                <Tooltip text={`Risk Alert: ${categoryRisk.message}`} position="right">
                    <WarningTriangleIcon className="text-orange-400 w-5 h-5 ml-2" />
                </Tooltip>
            )}
            {shouldHighlight && (
                <Tooltip text={missingReason} position="top">
                    <span className="ml-3 text-xs bg-white text-red-600 px-2 py-1 rounded font-bold uppercase flex items-center shadow-md cursor-help">
                        <WarningTriangleIcon className="w-3 h-3 mr-1" />
                        Review Needed
                    </span>
                </Tooltip>
            )}
            {showWizardButton && !isLocked && !effectiveCollapsed && (
                <button
                    onClick={(e) => { e.stopPropagation(); onOpenSoftCostWizard!(); }}
                    className="ml-4 flex items-center text-xs bg-[#0693e3] hover:bg-[#0578c5] text-white py-1 px-3 rounded-full transition-colors font-bold shadow-sm"
                >
                    <MagicWandIcon className="w-4 h-4 mr-1" />
                    Launch Soft Cost Wizard
                </button>
            )}
          </div>
        </td>
        
        {/* Description Column (Simplified View: Textarea) or Spacer (Detailed) */}
        {isSimplified ? (
            <td className="p-1 w-[37%] bg-[#1E2E5C] dark:bg-slate-700 relative" onClick={(e) => e.stopPropagation()}>
                <textarea
                    ref={descriptionRef}
                    value={category.description || ''}
                    onChange={(e) => {
                        onUpdateCategoryDescription(category.name, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Add a high-level description for this category..."
                    className="form-input-premium text-xs w-full resize-none overflow-hidden min-h-[38px] leading-tight"
                    rows={1}
                    disabled={isLocked}
                />
            </td>
        ) : (
            <td className={`${categoryHeaderTdBaseClass} text-center relative`} colSpan={1}>
                {/* Spacer for Detailed View */}
            </td>
        )}

        <td className={`${categoryHeaderTdBaseClass} text-center relative`} colSpan={1}>
            {isSimplified ? (
                /* Simplified View: Show Comment Indicator in the Note column */
                <div className="flex items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
                     <CommentIndicator
                        fieldId={categoryThreadId}
                        comments={comments}
                        commentThreads={commentThreads}
                        currentUserRole={currentUserRole}
                        onClick={() => onOpenCommentThread(categoryThreadId, `${category.name} (Category)`)}
                    />
                </div>
            ) : (
                /* Detailed View: Actions / Add Item Button */
                !effectiveCollapsed && (
                    <div className="flex items-center justify-center space-x-2">
                        {/* Bulk Adjust Trigger */}
                        {!isLocked && onCategoryBulkAdjust && (
                            <div className="relative">
                                <Tooltip text="Adjust all items in this category by a percentage.">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsBulkAdjustOpen(!isBulkAdjustOpen); }}
                                        className="w-6 h-6 bg-white/20 hover:bg-white/40 rounded flex items-center justify-center text-white transition-colors"
                                    >
                                        <span className="font-bold text-xs">%</span>
                                    </button>
                                </Tooltip>
                                
                                {/* Inline Popover for Bulk Adjust */}
                                {isBulkAdjustOpen && (
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-slate-800 shadow-xl rounded-xl p-3 z-50 border border-slate-600 animate-in fade-in zoom-in-95 duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="text-xs text-slate-400 mb-2 font-normal text-left">Adjust Category Budget</div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={bulkPercent}
                                                onChange={(e) => setBulkPercent(e.target.value)}
                                                placeholder="+/- %"
                                                className="w-full text-white bg-slate-700 text-xs border border-slate-500 rounded px-2 py-1"
                                                autoFocus
                                            />
                                            <button 
                                                onClick={handleBulkAdjustSubmit}
                                                className="bg-[#32373c] text-white text-xs px-2 py-1 rounded hover:bg-[#4a5056]"
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {isBulkAdjustOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={(e) => { e.stopPropagation(); setIsBulkAdjustOpen(false); }}></div>}
                            </div>
                        )}

                        {isLimaApprovedBudgetEditable && (
                            <Tooltip text="Copy all requested amounts in this category to the 'Lima One Approved' column.">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onCopyCategoryAmounts(category.name); }}
                                    className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded-md transition-colors text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Copy all requested amounts to approved for ${category.name}`}
                                >
                                    Approve Requested
                                </button>
                            </Tooltip>
                        )}
                        <button
                            id={addItemButtonId}
                            onClick={(e) => { e.stopPropagation(); onAddCustomBudgetItem(category.name); }}
                            className="text-xs bg-[#0693e3] hover:bg-[#0578c5] text-white py-1 px-2 rounded-md transition-colors text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Add custom item to ${category.name}`}
                            disabled={isLocked}
                        >
                            + Add Item
                        </button>
                    </div>
                )
            )}
        </td>
        <td data-label="Borrower Requested (Category Total)" className={`${categoryHeaderTdBaseClass} text-right`}>
            <div className="flex items-center justify-end gap-2">
                {isSimplified && !isLocked ? (
                    <input
                        type="number"
                        value={categoryBudgetTotal === 0 ? '' : categoryBudgetTotal}
                        onChange={(e) => onUpdateCategoryTotalBudget(category.name, parseFloat(e.target.value) || 0)}
                        className="w-28 text-right bg-white text-slate-900 border-none rounded px-2 py-1 font-bold focus:ring-2 focus:ring-brand-500"
                        placeholder="$0"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <>
                        {categoryBudgetTotal === 0 && !effectiveCollapsed && <span className="text-[10px] bg-orange-200 text-orange-900 px-1.5 rounded uppercase font-bold tracking-wide">Category Skipped</span>}
                        <span className={categoryBudgetTotal === 0 ? 'text-orange-300' : ''}>{formatCurrency(categoryBudgetTotal)}</span>
                    </>
                )}
            </div>
        </td>
        {showApprovedColumn && (
            <td data-label="Lima One Approved (Category Total)" className={`${categoryHeaderTdBaseClass} text-right`}>{formatCurrency(categoryActualTotal)}</td>
        )}
      </tr>
      
      {showPermitWarning && !effectiveCollapsed && (
          <tr>
              <td colSpan={showApprovedColumn ? 6 : 5} className="bg-yellow-900/30 border-l-4 border-yellow-500 p-2">
                  <div className="flex items-center text-sm text-yellow-200">
                      <WarningTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
                      <span><strong>Note:</strong> Standard and Heavy rehabs typically require building permits. Ensure you have budgeted for city fees.</span>
                  </div>
              </td>
          </tr>
      )}

      {!effectiveCollapsed && (category.categoryPhotos && category.categoryPhotos.length > 0) && (
        <tr className="bg-slate-800/50">
            <td colSpan={showApprovedColumn ? 6 : 5} className="p-2">
                <div className="flex items-start space-x-2">
                    <div className="flex flex-wrap gap-2 flex-grow">
                        {category.categoryPhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <img src={photo.preview} alt={`category preview ${index}`} className="h-20 w-20 object-cover rounded-md" />
                                {!isLocked && (
                                <button onClick={() => onRemoveCategoryPhoto(category.name, index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XCircleIcon className="w-4 h-4" />
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-slate-400 p-2 border-l-2 border-slate-700 w-1/3">
                        <p className="font-semibold">AI Category Analysis:</p>
                        <p><i>Analysis for these general category photos will appear here...</i></p>
                    </div>
                </div>
            </td>
        </tr>
      )}
      {!effectiveCollapsed && itemsToRender.map((item, itemIndex) => (
         <BudgetItemRow 
            key={item.id} 
            item={item} 
            categoryName={category.name} 
            isLimaApprovedBudgetEditable={isLimaApprovedBudgetEditable}
            scopeSummary={scopeSummary}
            comments={comments}
            commentThreads={commentThreads}
            currentUserRole={currentUserRole}
            highlightedItemIds={highlightedItemIds}
            isLocked={isLocked}
            onOpenCommentThread={onOpenCommentThread}
            onUpdateBudgetItem={onUpdateBudgetItem} 
            onScopeSummaryChange={onScopeSummaryChange}
            onRemoveCustomBudgetItem={onRemoveCustomBudgetItem}
            onRemovePhoto={onRemovePhoto}
            isFirstItem={isFirstCategory && itemIndex === 0}
            isLastItem={itemIndex === itemsToRender.length - 1} 
            onAdvance={onAdvance} 
            riskAnalysis={riskAnalysis}
            showApprovedColumn={showApprovedColumn}
            isGuidanceEnabled={isGuidanceEnabled}
            totalSqFt={totalSqFt}
            propertyState={propertyState}
         />
      ))}
    </>
  );
};

export const Step2Budget: React.FC<Step2BudgetProps> = ({
  budgetData,
  scopeSummary,
  projectScopeStatement,
  isLimaApprovedBudgetEditable,
  collapsedCategories,
  comments,
  commentThreads,
  currentUserRole,
  applicationStatus,
  isLocked,
  scrollToFieldId,
  highlightedItemIds,
  isGeneratingScope,
  isSimplifiedViewAvailable,
  budgetViewMode,
  expandedInSimplifiedView,
  onScrollComplete,
  onOpenCommentThread,
  onToggleCategoryCollapse,
  onUpdateBudgetItem,
  onScopeSummaryChange,
  onProjectScopeStatementChange,
  highlightLimaOneTotalMismatch,
  onAddCustomBudgetItem,
  onRemoveCustomBudgetItem,
  onPrefillBudget,
  onRemovePhoto,
  onRemoveCategoryPhoto,
  onOpenBulkUploadModal,
  onCopyCategoryAmounts,
  onGenerateScope,
  onSetBudgetViewMode,
  onToggleSimplifiedCategoryExpansion,
  onUpdateCategoryDescription,
  onUpdateCategoryTotalBudget,
  riskAnalysis,
  totalSqFt,
  propertyState,
  selectedRehabType,
  onSwitchToWalkthrough,
  onOpenSoftCostWizard,
  highlightMissingFields,
  onCategoryBulkAdjust,
  onSaveAsTemplate,
  isRepeatUser
}) => {
    
    const [isGuidanceEnabled, setIsGuidanceEnabled] = useState(false);
    const [isLogicPopoverOpen, setIsLogicPopoverOpen] = useState(false);
    const hasSqFt = totalSqFt && parseFloat(totalSqFt.replace(/,/g, '')) > 0;

    const handleGuidanceToggle = () => {
        setIsGuidanceEnabled(!isGuidanceEnabled);
    };

    const GuidanceBanner = () => (
        <div className="relative flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl mb-4 backdrop-blur-sm">
            {/* Left Side */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setIsLogicPopoverOpen(!isLogicPopoverOpen)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-[#0693e3]/20 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl transition-colors border border-white/20 hover:border-[#0693e3]/50 group"
                >
                    <LightBulbIcon className="w-4 h-4 group-hover:text-white transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wide group-hover:text-white transition-colors">Guidance Logic</span>
                </button>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-200">Live Budget Guidance</span>
                    <Tooltip text="Enables real-time cost benchmarks based on your location and property size.">
                        <InfoIcon className="w-4 h-4 text-slate-400 cursor-help" />
                    </Tooltip>
                </div>
                {!hasSqFt && (
                    <span className="text-xs font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/30">
                        (Requires 'Projected Sq Ft' in Step 1)
                    </span>
                )}
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isGuidanceEnabled} 
                    onChange={handleGuidanceToggle}
                    disabled={!hasSqFt}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0693e3]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-[#0693e3]"></div>
            </label>

            {/* Logic Popover - Absolute positioned */}
            {isLogicPopoverOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-4 text-left animate-in fade-in zoom-in-95 duration-200">
                    {/* Content matches screenshot logic */}
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">How It Works</h4>
                    <div className="bg-slate-900 p-2 rounded text-center text-xs font-mono text-brand-300 mb-3 border border-slate-700 shadow-inner">
                        (Avg Cost x Location x SqFt)
                    </div>
                    <p className="text-xs text-slate-300 mb-3">Compare your input against historical data.</p>
                    <ul className="text-xs space-y-2 mb-4">
                        <li className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> 
                            <span className="text-slate-200">Low Warning (&lt;50% of avg)</span>
                        </li>
                        <li className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span> 
                            <span className="text-slate-200">High Warning (&gt;150% of avg)</span>
                        </li>
                    </ul>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 border-b border-slate-700 pb-1">Monitored Items</h4>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                        {SUPPORTED_BENCHMARKS.map(item => (
                            <span key={item} className="text-[10px] bg-brand-500/15 border border-brand-400/25 text-brand-300 px-2 py-0.5 rounded-full">{item}</span>
                        ))}
                    </div>
                </div>
            )}
            {/* Click outside listener */}
            {isLogicPopoverOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsLogicPopoverOpen(false)}></div>}
        </div>
    );

    // Draw Schedule Logic
    const handleDropItem = (itemId: string, drawId: string) => {
        // Find category
        let categoryName = '';
        const category = budgetData.find(c => c.items.some(i => i.id === itemId));
        if (category) categoryName = category.name;
        
        onUpdateBudgetItem(categoryName, itemId, 'drawId', drawId);
    };

    // Rendering Draw Schedule
    if (budgetViewMode === 'draw_schedule') {
        const unassignedItems: { item: BudgetItem; categoryName: string }[] = [];
        const drawBuckets: Record<string, { item: BudgetItem; categoryName: string }[]> = {};
        
        DRAW_SCHEDULE_OPTIONS.forEach(opt => {
            if (opt.id !== 'unassigned') drawBuckets[opt.id] = [];
        });

        budgetData.forEach(cat => {
            cat.items.forEach(item => {
                if (item.budget > 0) { // Only show active items
                    if (item.drawId && drawBuckets[item.drawId]) {
                        drawBuckets[item.drawId].push({ item, categoryName: cat.name });
                    } else {
                        unassignedItems.push({ item, categoryName: cat.name });
                    }
                }
            });
        });

        const totalBudget = scopeSummary.borrowerTotal;

        return (
            <div className="section-container p-5 animate-in fade-in duration-300">
                <h3 className="section-title">Draw Schedule Configuration</h3>
                <div className="flex justify-end mb-6">
                    <button onClick={() => onSetBudgetViewMode('detailed')} className="flex items-center text-xs font-bold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 transition-all">
                        ← Back to Budget
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Unassigned Pool */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2 pl-3 border-l-4 border-[#0693e3]">
                            <span className="font-bold text-slate-200 text-xs uppercase tracking-widest">Available Items</span>
                        </div>
                        <DrawBucket 
                            drawId="unassigned"
                            label="Unassigned"
                            description="Drag items to a draw period"
                            items={unassignedItems}
                            total={unassignedItems.reduce((acc, i) => acc + i.item.budget, 0)}
                            grandTotal={totalBudget}
                            onDropItem={() => handleDropItem} // Unassigned drop logic if needed (clearing drawId)
                        />
                    </div>

                    {/* Draws */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {DRAW_SCHEDULE_OPTIONS.filter(o => o.id !== 'unassigned').map(opt => (
                            <DrawBucket
                                key={opt.id}
                                drawId={opt.id}
                                label={opt.label.split(':')[0]} // Shorten label
                                description={opt.description}
                                items={drawBuckets[opt.id]}
                                total={drawBuckets[opt.id].reduce((acc, i) => acc + i.item.budget, 0)}
                                grandTotal={totalBudget}
                                onDropItem={handleDropItem}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const showApprovedColumn = currentUserRole === 'analyst' || applicationStatus !== 'draft';
    const sqFtValue = parseFloat(totalSqFt?.replace(/,/g, '') || '0');
    const budgetPerSqFt = sqFtValue > 0 ? scopeSummary.borrowerTotal / sqFtValue : 0;
    const approvedPerSqFt = sqFtValue > 0 ? scopeSummary.limaOneApprovedTotal / sqFtValue : 0;

    return (
        <div className="space-y-6">
            {/* ── Step Hero ── */}
            <div className="step1-hero">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-500/15 border border-brand-400/25 text-brand-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        Detailed Budget
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-medium">Step 3 of 4</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Project Budget</h1>
                <p className="text-sm text-slate-400 mt-1 max-w-xl">
                    Enter line-item costs for each trade. AI estimates and guidance benchmarks update as you type.
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Project Budget</h3>
                    {budgetViewMode === 'simplified' && (
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30 font-semibold">
                            Simplified View
                        </span>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher */}
                    <div className="bg-slate-900/50 p-1 rounded-lg flex border border-white/10">
                        {isSimplifiedViewAvailable && (
                            <button
                                onClick={() => onSetBudgetViewMode('simplified')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${budgetViewMode === 'simplified' ? 'bg-[#0693e3] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                            >
                                Simple
                            </button>
                        )}
                        <button
                            onClick={() => onSetBudgetViewMode('detailed')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${budgetViewMode === 'detailed' ? 'bg-[#0693e3] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            Detailed
                        </button>
                        <button
                            onClick={() => onSetBudgetViewMode('draw_schedule')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${budgetViewMode === 'draw_schedule' ? 'bg-[#0693e3] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            Draws
                        </button>
                    </div>

                    {!isLocked && (
                        <>
                            <button onClick={onOpenBulkUploadModal} className="flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all">
                                <CameraIcon className="w-4 h-4 mr-2" />
                                Photos
                            </button>
                            {onSwitchToWalkthrough && (
                                <button onClick={onSwitchToWalkthrough} className="flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all">
                                    <CameraIcon className="w-4 h-4 mr-2" />
                                    Walkthrough
                                </button>
                            )}
                            {onSaveAsTemplate && (
                                <button onClick={onSaveAsTemplate} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all">
                                    Save Template
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Scope & Summary Dashboard (Replaces old bottom section) */}
            <div className="section-container p-5">
                <h3 className="section-title">Scope &amp; Summary</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Scope of Work */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide text-slate-300">Scope of Work</h4>
                    <textarea
                        value={projectScopeStatement}
                        onChange={onProjectScopeStatementChange}
                        rows={8}
                        className="form-input-premium w-full resize-none p-3 text-sm h-full"
                        placeholder="Enter detailed project description, work to be performed, and any specific considerations..."
                        disabled={isLocked}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={onGenerateScope}
                            disabled={isGeneratingScope || isLocked}
                            className="flex items-center text-sm font-bold px-4 py-2 rounded-lg bg-[#0693e3] hover:bg-[#0578c5] text-white shadow-md transition-all disabled:opacity-50"
                            style={{ boxShadow: '0 4px 16px rgba(6,147,227,0.3)' }}
                        >
                            {isGeneratingScope ? <SpinnerIcon className="w-4 h-4 mr-2" /> : <MagicWandIcon className="w-4 h-4 mr-2" />}
                            {isGeneratingScope ? 'Generating...' : 'Generate Scope with AI'}
                        </button>
                    </div>
                </div>

                {/* Right: Summary & Actions */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <button 
                        onClick={onOpenBulkUploadModal} 
                        disabled={isLocked}
                        className="w-full flex items-center justify-center font-bold py-3 rounded-lg bg-[#0693e3] hover:bg-[#0578c5] text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ boxShadow: '0 4px 16px rgba(6,147,227,0.3)' }}
                    >
                        <CameraIcon className="w-5 h-5 mr-2" /> Upload Project Photos
                    </button>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3 shadow-inner">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-semibold">Borrower Total:</span>
                            <span className="font-bold text-white text-lg">{formatCurrency(scopeSummary.borrowerTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-semibold">Lima One Approved:</span>
                            <span className="font-bold text-green-400 text-lg bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30">
                                {formatCurrency(scopeSummary.limaOneApprovedTotal)}
                            </span>
                        </div>
                        <div className="border-t border-white/10 my-1"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs font-medium">$/SqFt Budget (Projected):</span>
                            <span className="text-slate-300 font-mono text-sm">{isFinite(budgetPerSqFt) ? formatCurrency(budgetPerSqFt) : '#DIV/0!'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs font-medium">$/SqFt Actual (Approved):</span>
                            <span className="text-slate-300 font-mono text-sm">{isFinite(approvedPerSqFt) ? formatCurrency(approvedPerSqFt) : '#DIV/0!'}</span>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3 shadow-inner">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center">
                                Start Date <InfoIcon className="text-slate-500 ml-1 w-3 h-3" />
                            </label>
                            <input 
                                type="date" 
                                value={scopeSummary.startDate} 
                                onChange={(e) => onScopeSummaryChange('startDate', e.target.value)} 
                                className="form-input-premium w-full text-sm py-2"
                                disabled={isLocked}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center">
                                Projected Completion <InfoIcon className="text-slate-500 ml-1 w-3 h-3" />
                            </label>
                            <input
                                type="date"
                                value={scopeSummary.projectedCompletionDate}
                                onChange={(e) => onScopeSummaryChange('projectedCompletionDate', e.target.value)}
                                className="form-input-premium w-full text-sm py-2" 
                                disabled={isLocked}
                            />
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Guidance Banner */}
            <GuidanceBanner />

            <div id="main-budget-table-container" className="section-container p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs uppercase bg-white/10 text-slate-200">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-[6%] text-center">Item #</th>
                                <th scope="col" className="px-4 py-3 w-[22%]">Item / Task</th>
                                <th scope="col" className="px-4 py-3 w-[37%]">Description / Notes</th>
                                <th scope="col" className="px-4 py-3 w-[5%] text-center">Chat</th>
                                <th scope="col" className="px-4 py-3 w-[15%] text-right">Budget ($)</th>
                                {showApprovedColumn && <th scope="col" className="px-4 py-3 w-[15%] text-right">Approved ($)</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {budgetData.map((category, index) => (
                                <BudgetCategoryRow
                                    key={category.name}
                                    category={category}
                                    isLimaApprovedBudgetEditable={isLimaApprovedBudgetEditable}
                                    scopeSummary={scopeSummary}
                                    collapsed={collapsedCategories[category.name] || false}
                                    comments={comments}
                                    commentThreads={commentThreads}
                                    currentUserRole={currentUserRole}
                                    highlightedItemIds={highlightedItemIds}
                                    isLocked={isLocked}
                                    budgetViewMode={budgetViewMode}
                                    onOpenCommentThread={onOpenCommentThread}
                                    onToggleCollapse={() => onToggleCategoryCollapse(category.name)}
                                    onUpdateBudgetItem={onUpdateBudgetItem}
                                    onScopeSummaryChange={onScopeSummaryChange}
                                    onAddCustomBudgetItem={onAddCustomBudgetItem}
                                    onRemoveCustomBudgetItem={onRemoveCustomBudgetItem}
                                    onRemovePhoto={onRemovePhoto}
                                    onRemoveCategoryPhoto={onRemoveCategoryPhoto}
                                    onCopyCategoryAmounts={onCopyCategoryAmounts}
                                    isFirstCategory={index === 0}
                                    riskAnalysis={riskAnalysis}
                                    showApprovedColumn={showApprovedColumn}
                                    isGuidanceEnabled={isGuidanceEnabled}
                                    totalSqFt={totalSqFt}
                                    propertyState={propertyState}
                                    selectedRehabType={selectedRehabType}
                                    highlightMissingFields={highlightMissingFields}
                                    onOpenSoftCostWizard={onOpenSoftCostWizard}
                                    onCategoryBulkAdjust={onCategoryBulkAdjust}
                                    onUpdateCategoryTotalBudget={onUpdateCategoryTotalBudget}
                                    onUpdateCategoryDescription={onUpdateCategoryDescription}
                                />
                            ))}
                        </tbody>
                        <tfoot className="bg-white/10 text-slate-100 font-bold border-t-2 border-white/20">
                            <tr>
                                <td colSpan={4} className="px-4 py-4 text-right text-base uppercase tracking-wider">Project Grand Total</td>
                                <td className="px-4 py-4 text-right text-lg text-brand-400">{formatCurrency(scopeSummary.borrowerTotal)}</td>
                                {showApprovedColumn && <td className="px-4 py-4 text-right text-lg text-green-400">{formatCurrency(scopeSummary.limaOneApprovedTotal)}</td>}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
