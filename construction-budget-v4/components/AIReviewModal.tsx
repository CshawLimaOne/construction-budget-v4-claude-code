
import React, { useState, useEffect, useMemo } from 'react';
import { ComplexModal } from './ComplexModal';
import { BudgetItem, BudgetCategoryData, ScopeOfWorkSummary, SelectOption } from '../types';
import { getCategoryNames, CONTINGENCY_ITEM_ID } from '../constants';
import { FlagIcon } from './Icons';
import Tooltip from './Tooltip';

interface MappedSuggestion {
  id: string;
  budget: number;
  description: string;
  isUncertain: boolean;
  originalText: string;
}

interface NewSuggestion {
  categoryName: string;
  drawItem: string;
  budget: number;
  description: string;
  isUncertain: boolean;
  originalText: string;
}

// Unified type for managing suggestions in the component's state
interface UnifiedSuggestion {
  originalText: string;
  budget: number;
  description: string;
  isUncertain: boolean;
  accepted: boolean;
  suggestionType: 'mapped' | 'new';
  // Mapped-specific
  id: string;
  // New-specific
  categoryName: string;
  drawItem: string;
}


interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (acceptedMapped: MappedSuggestion[], acceptedNew: NewSuggestion[], acceptedProjectDetails: any) => void;
  suggestions: { mappedItems: MappedSuggestion[], newItems: NewSuggestion[], totalBudgetFromFile?: number, projectDetails?: any } | null;
  budgetCategoryData: BudgetCategoryData[];
  scopeSummary: ScopeOfWorkSummary;
  conditions: SelectOption[];
  rehabTypes: SelectOption[];
  materialQualities: SelectOption[];
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const detailKeyToLabelMap: Record<string, string> = {
    propertyAddress: 'Property Address',
    asIsSqft: 'As-Is SqFt',
    projectedSqft: 'Projected SqFt',
    asIsBedrooms: 'As-Is Bedrooms',
    projectedBedrooms: 'Projected Bedrooms',
    asIsBathrooms: 'As-Is Bathrooms',
    projectedBathrooms: 'Projected Bathrooms',
    conditionOfProperty: 'Condition of Property',
    typeOfRehab: 'Type of Rehab',
    materialQuality: 'Material Quality',
    projectScopeStatement: 'Scope of Work',
};

export const AIReviewModal: React.FC<AIReviewModalProps> = ({ isOpen, onClose, onConfirm, suggestions, budgetCategoryData, scopeSummary, conditions, rehabTypes, materialQualities }) => {
  const [editableSuggestions, setEditableSuggestions] = useState<UnifiedSuggestion[]>([]);
  const [editableProjectDetails, setEditableProjectDetails] = useState<Record<string, { value: any; accepted: boolean }>>({});
  const categoryNames = getCategoryNames();

  useEffect(() => {
    if (isOpen && suggestions) {
      const mapped: UnifiedSuggestion[] = (suggestions.mappedItems || []).map(s => ({
        ...s,
        suggestionType: 'mapped',
        accepted: true,
        categoryName: '',
        drawItem: '',
      }));
      const newItems: UnifiedSuggestion[] = (suggestions.newItems || []).map(s => ({
        ...s,
        suggestionType: 'new',
        accepted: true,
        id: '',
      }));
      setEditableSuggestions([...mapped, ...newItems]);

      const initialDetails: Record<string, { value: any; accepted: boolean }> = {};
        if (suggestions.projectDetails) {
            for (const key in suggestions.projectDetails) {
                if (Object.prototype.hasOwnProperty.call(suggestions.projectDetails, key)) {
                     initialDetails[key] = { value: suggestions.projectDetails[key], accepted: true };
                }
            }
        }
      setEditableProjectDetails(initialDetails);
    }
  }, [isOpen, suggestions]);

  const acceptedTotal = useMemo(() => {
    return editableSuggestions
      .filter(s => s.accepted)
      .reduce((sum, s) => sum + (s.budget || 0), 0);
  }, [editableSuggestions]);

  const totalFromFile = suggestions?.totalBudgetFromFile ?? 0;
  
  const { finalBudgetTotal, breakdown } = useMemo(() => {
    const acceptedSuggestions = editableSuggestions.filter(s => s.accepted);
    
    let baseSubTotal = 0;
    let gcFeeFromFile = 0;
    let contingencyFromFile = 0;
    let profitFromFile = 0; // Track specifically to show in breakdown
    let overheadFromFile = 0; // Track specifically
    
    const allItems = budgetCategoryData.flatMap(c => c.items);

    acceptedSuggestions.forEach(s => {
        // Mapped Logic
        if (s.suggestionType === 'mapped') {
            const itemInfo = allItems.find(i => i.id === s.id);
            if (itemInfo?.isGcBuilderFeeItem) {
                gcFeeFromFile += s.budget;
            } else if (itemInfo?.isContingencyItem) {
                contingencyFromFile += s.budget;
            } else if (itemInfo?.drawItem.includes('Profit')) {
                profitFromFile += s.budget;
                baseSubTotal += s.budget; // Add to subtotal as it's a line item
            } else if (itemInfo?.drawItem.includes('Overhead')) {
                overheadFromFile += s.budget;
                baseSubTotal += s.budget; // Add to subtotal
            } else {
                baseSubTotal += s.budget;
            }
        } 
        // New Item Logic
        else {
            // Check strings for New Items too
            if (s.drawItem.toLowerCase().includes('profit')) {
                profitFromFile += s.budget;
                baseSubTotal += s.budget;
            } else if (s.drawItem.toLowerCase().includes('overhead')) {
                overheadFromFile += s.budget;
                baseSubTotal += s.budget;
            } else {
                baseSubTotal += s.budget;
            }
        }
    });

    // Default 10% cap logic still applies if we want to enforce it, 
    // but here we just want to calculate totals correctly for display.
    // If the file has explicit GC Fees, we use them (capped or not depends on backend logic, here we just sum).
    // Let's stick to the visual representation.
    
    const maxAllowedGcFee = Math.round(0.10 * baseSubTotal);
    const effectiveGcFee = Math.min(gcFeeFromFile, maxAllowedGcFee);
    const subTotalIncludingGc = baseSubTotal + effectiveGcFee;
    
    const hasManualContingency = acceptedSuggestions.some(s => s.suggestionType === 'mapped' && s.id === CONTINGENCY_ITEM_ID);

    let effectiveContingency = contingencyFromFile;
    let contingencySource = 'from file';

    if (!hasManualContingency && scopeSummary.isContingencyAutoCalculated) {
        effectiveContingency = Math.round(subTotalIncludingGc * (scopeSummary.contingencyPercentage || 0) / 100);
        contingencySource = 'auto-calculated';
    }

    const finalTotal = subTotalIncludingGc + effectiveContingency;

    return { 
        finalBudgetTotal: finalTotal, 
        breakdown: {
            baseSubTotal,
            subTotalIncludingGc,
            effectiveGcFee,
            effectiveContingency,
            gcFeeFromFile,
            contingencyFromFile,
            contingencySource,
            profitFromFile,
            overheadFromFile
        }
    };
  }, [editableSuggestions, budgetCategoryData, scopeSummary]);

  const totalsMismatch = totalFromFile > 0 && Math.round(totalFromFile) !== Math.round(acceptedTotal);

  const handleSuggestionChange = (index: number, field: keyof UnifiedSuggestion, value: any) => {
    setEditableSuggestions(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };
  
  const handleInterpretationChange = (index: number, value: string) => {
      setEditableSuggestions(prev => prev.map((s, i) => {
          if (i !== index) return s;

          const updatedSuggestion = { ...s };
          if (value.startsWith('NEW:')) {
              const categoryName = value.split(':')[1];
              updatedSuggestion.suggestionType = 'new';
              updatedSuggestion.categoryName = categoryName;
              updatedSuggestion.id = ''; // Clear mapping ID
              updatedSuggestion.drawItem = s.originalText.split(/(\d[\d,.]*)/)[0].trim() || 'New Item'; // Pre-fill draw item
          } else {
              updatedSuggestion.suggestionType = 'mapped';
              updatedSuggestion.id = value;
              updatedSuggestion.categoryName = ''; // Clear new item category
          }
          return updatedSuggestion;
      }));
  };

  const handleDetailChange = (key: string, field: 'accepted' | 'value', value: any) => {
    setEditableProjectDetails(prev => ({
        ...prev,
        [key]: { ...(prev[key] ?? { value: undefined, accepted: false }), [field]: value }
    }));
  };

  const handleConfirmClick = () => {
    const acceptedSuggestions = editableSuggestions.filter(s => s.accepted);

    const finalMapped: MappedSuggestion[] = acceptedSuggestions
      .filter(s => s.suggestionType === 'mapped')
      .map(s => ({
        id: s.id,
        budget: s.budget,
        description: s.description,
        isUncertain: s.isUncertain,
        originalText: s.originalText,
      }));
      
    const finalNew: NewSuggestion[] = acceptedSuggestions
      .filter(s => s.suggestionType === 'new')
      .map(s => ({
        categoryName: s.categoryName,
        drawItem: s.drawItem,
        budget: s.budget,
        description: s.description,
        isUncertain: s.isUncertain,
        originalText: s.originalText,
      }));
    
    const finalProjectDetails: Record<string, any> = {};
    Object.entries(editableProjectDetails).forEach(([key, detail]) => {
      const typedDetail = detail as { value: any; accepted: boolean };
      if (typedDetail.accepted) {
        finalProjectDetails[key] = typedDetail.value;
      }
    });
      
    onConfirm(finalMapped, finalNew, finalProjectDetails);
  };

  const getSelectOptionLabel = (key: string, value: string) => {
    let options: SelectOption[] = [];
    if (key === 'conditionOfProperty') options = conditions;
    if (key === 'typeOfRehab') options = rehabTypes;
    if (key === 'materialQuality') options = materialQualities;
    return options.find(o => o.value === value)?.label || value;
  };

  const footer = (
    <>
      <button onClick={onClose} className="button-base bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100 focus:ring-slate-300 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
        Cancel
      </button>
      <button onClick={handleConfirmClick} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
        Apply Accepted Items
      </button>
    </>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="Review AI Budget Suggestions" footer={footer} size="xl">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            <p>The AI has analyzed your uploaded file. Please review its interpretation for each line item.</p>
            <p className="mt-2">You can correct any mappings, adjust budgets, or uncheck items to ignore them before applying changes.</p>
        </div>
        
        {Object.keys(editableProjectDetails).length > 0 && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Project Details Found in File</h3>
                <div className="space-y-3">
                    {Object.entries(editableProjectDetails).map(([key, detail]) => {
                        const typedDetail = detail as { value: any; accepted: boolean };
                        return (
                        <div key={key} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                            <input
                                type="checkbox"
                                checked={typedDetail.accepted}
                                onChange={e => handleDetailChange(key, 'accepted', e.target.checked)}
                                className="h-5 w-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 mt-1 flex-shrink-0"
                                aria-labelledby={`detail-label-${key}`}
                            />
                            <div className="flex-grow">
                                <label id={`detail-label-${key}`} className="font-medium text-slate-700 dark:text-slate-300">{detailKeyToLabelMap[key] || key}</label>
                                {key === 'projectScopeStatement' ? (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 p-2 border bg-white dark:bg-slate-700 rounded-md whitespace-pre-wrap">{typedDetail.value}</p>
                                ) : (
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {['conditionOfProperty', 'typeOfRehab', 'materialQuality'].includes(key) ? getSelectOptionLabel(key, String(typedDetail.value)) : String(typedDetail.value)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        )}

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 mb-6 space-y-2">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Total Detected in File:</span>
                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{formatCurrency(totalFromFile)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Total of Accepted Items:</span>
                <span className={`font-bold text-lg ${totalsMismatch ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {formatCurrency(acceptedTotal)}
                </span>
            </div>
            {totalsMismatch && (
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-600 text-center text-xs p-2 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                    <strong>Note:</strong> The accepted total differs from the file total. This usually happens if you uncheck items (like 'Grand Total' lines) or if the AI skipped purely summary rows.
                </div>
            )}
        </div>
        
        <div className="p-4 rounded-lg bg-brand-50 dark:bg-sky-900/50 border border-brand-200 dark:border-sky-700 mb-6">
            <h4 className="font-semibold text-brand-800 dark:text-sky-200 mb-3 text-center text-base">Calculation Breakdown</h4>
            <div className="space-y-2 text-sm max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-brand-200 dark:border-sky-800">
                    <span className="text-slate-700 dark:text-slate-300">Subtotal (Items + Profit + Overhead)</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(breakdown.baseSubTotal)}</span>
                </div>
                {/* Specific callouts for Profit/Overhead so user knows they are included in Subtotal */}
                {(breakdown.profitFromFile > 0 || breakdown.overheadFromFile > 0) && (
                    <div className="text-xs text-slate-500 pl-4 pb-1">
                        {breakdown.profitFromFile > 0 && <div>• Includes Profit: {formatCurrency(breakdown.profitFromFile)}</div>}
                        {breakdown.overheadFromFile > 0 && <div>• Includes Overhead: {formatCurrency(breakdown.overheadFromFile)}</div>}
                    </div>
                )}

                <div className="flex justify-between py-1 border-b border-brand-200 dark:border-sky-800">
                    <span className="text-slate-700 dark:text-slate-300">GC/Builder Fee</span>
                    <div className="text-right">
                        {breakdown.gcFeeFromFile > breakdown.effectiveGcFee && (
                             <Tooltip text={`Capped at 10% of subtotal.`}>
                                <span className="text-xs line-through text-red-500 dark:text-red-400 mr-2">{formatCurrency(breakdown.gcFeeFromFile)}</span>
                            </Tooltip>
                        )}
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(breakdown.effectiveGcFee)}</span>
                    </div>
                </div>
                <div className="flex justify-between py-1 border-b border-brand-200 dark:border-sky-800">
                     <span className="text-slate-700 dark:text-slate-300">Contingency</span>
                     <div className="text-right">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(breakdown.effectiveContingency)}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                            ({breakdown.contingencySource === 'auto-calculated' ? `${scopeSummary.contingencyPercentage}% Auto-Calc` : 'From File'})
                        </span>
                     </div>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="font-bold text-brand-800 dark:text-sky-300">Final Estimated Total</span>
                    <span className="font-bold text-lg text-brand-800 dark:text-sky-300">{formatCurrency(finalBudgetTotal)}</span>
                </div>
            </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">Budget Line Items</h3>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="py-2 px-3 w-8 text-center"><span className="sr-only">Accept</span></th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">Original Item from File</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">AI Interpretation</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">New Item Name</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/5">Budget Amount</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {editableSuggestions.length > 0 ? editableSuggestions.map((suggestion, index) => {
                        const interpretationValue = suggestion.suggestionType === 'new' 
                            ? `NEW:${suggestion.categoryName}`
                            : suggestion.id;
                        
                        return (
                            <tr key={index} className={suggestion.isUncertain ? 'bg-yellow-50 dark:bg-yellow-900/50' : ''}>
                                <td className="py-2 px-3 text-center align-top">
                                    <input
                                        type="checkbox"
                                        checked={suggestion.accepted}
                                        onChange={e => handleSuggestionChange(index, 'accepted', e.target.checked)}
                                        className="h-5 w-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 mt-1"
                                    />
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-700 dark:text-slate-300 align-top">
                                    {suggestion.isUncertain && (
                                        <Tooltip text="AI is uncertain about this item. Please review carefully.">
                                            <FlagIcon className="text-yellow-500 inline-block mr-1" />
                                        </Tooltip>
                                    )}
                                    {suggestion.originalText}
                                </td>
                                <td className="py-2 px-3 text-sm align-top">
                                    <select 
                                        value={interpretationValue}
                                        onChange={e => handleInterpretationChange(index, e.target.value)}
                                        className="spreadsheet-input w-full text-xs"
                                    >
                                        <optgroup label="Create New Item">
                                            {categoryNames.map(name => (
                                                <option value={`NEW:${name}`} key={`NEW:${name}`}>New Item in: {name}</option>
                                            ))}
                                        </optgroup>
                                        {budgetCategoryData.map(category => (
                                            <optgroup label={category.name} key={category.name}>
                                                {category.items.filter(item => !item.isCustomDescription).map(item => (
                                                    <option value={item.id} key={item.id}>
                                                        {item.itemNumber} - {item.drawItem}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </td>
                                <td className="py-2 px-3 text-sm align-top">
                                    <input
                                        type="text"
                                        value={suggestion.drawItem}
                                        onChange={e => handleSuggestionChange(index, 'drawItem', e.target.value)}
                                        className="spreadsheet-input w-full"
                                        disabled={suggestion.suggestionType === 'mapped'}
                                    />
                                </td>
                                <td className="py-2 px-3 text-sm align-top">
                                    <input
                                        type="number"
                                        value={suggestion.budget}
                                        onChange={e => handleSuggestionChange(index, 'budget', parseFloat(e.target.value) || 0)}
                                        className="spreadsheet-input w-full text-right"
                                    />
                                </td>
                            </tr>
                        )
                    }) : (
                         <tr><td colSpan={5} className="text-center py-4 text-slate-500 dark:text-slate-400">No items were found in the uploaded file.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </ComplexModal>
  );
};

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastAppliedSuggestions: { mapped: any[], new: any[] } | null;
  budgetData: BudgetCategoryData[];
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({ isOpen, onClose, lastAppliedSuggestions, budgetData }) => {
    if (!isOpen) return null;

    const mappedCount = lastAppliedSuggestions?.mapped.length || 0;
    const newCount = lastAppliedSuggestions?.new.length || 0;
    const totalApplied = (lastAppliedSuggestions?.mapped || []).reduce((sum: number, item: any) => sum + (item.budget || 0), 0) +
                         (lastAppliedSuggestions?.new || []).reduce((sum: number, item: any) => sum + (item.budget || 0), 0);

    const footer = (
        <button onClick={onClose} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
            Continue to Project Setup
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Budget Update Summary" footer={footer} size="md">
            <div className="space-y-4 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Budget Successfully Updated</h3>
                
                <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Existing Items Updated</p>
                        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{mappedCount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">New Items Added</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{newCount}</p>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total Value Added/Updated</p>
                        <p className="text-xl font-mono font-bold text-green-700 dark:text-green-400">{formatCurrency(totalApplied)}</p>
                    </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300">
                    The items have been applied to your budget. Please select your project type to finalize the template.
                </p>
            </div>
        </ComplexModal>
    );
};
