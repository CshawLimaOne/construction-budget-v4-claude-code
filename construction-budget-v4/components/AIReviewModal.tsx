
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
    street: 'Street Address',
    city: 'City',
    state: 'State',
    zip: 'Zip Code',
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

      // Auto-resolve select fields: convert raw AI text → the option's value key
      // so downstream consumers receive "Light-Cosmetic" not "Fix & Flip"
      const selectFieldOptions: Record<string, SelectOption[]> = {
          conditionOfProperty: conditions,
          typeOfRehab: rehabTypes,
          materialQuality: materialQualities,
      };
      Object.entries(selectFieldOptions).forEach(([key, opts]) => {
          if (!initialDetails[key]?.value) return;
          const raw = String(initialDetails[key].value).toLowerCase().trim();
          const match =
              opts.find(o => o.value === initialDetails[key].value) ||           // exact value
              opts.find(o => o.value.toLowerCase() === raw) ||                   // case-insensitive value
              opts.find(o => o.label.toLowerCase().includes(raw)) ||             // label contains raw
              opts.find(o => raw.includes(o.label.toLowerCase().split(' ')[0])); // raw contains first word of label
          if (match) {
              initialDetails[key] = { ...initialDetails[key], value: match.value };
          }
      });

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
            } else if (itemInfo?.drawItem?.includes('Profit')) {
                profitFromFile += s.budget;
                baseSubTotal += s.budget; // Add to subtotal as it's a line item
            } else if (itemInfo?.drawItem?.includes('Overhead')) {
                overheadFromFile += s.budget;
                baseSubTotal += s.budget; // Add to subtotal
            } else {
                baseSubTotal += s.budget;
            }
        } 
        // New Item Logic
        else {
            // Check strings for New Items too
            if (s.drawItem?.toLowerCase().includes('profit')) {
                profitFromFile += s.budget;
                baseSubTotal += s.budget;
            } else if (s.drawItem?.toLowerCase().includes('overhead')) {
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

  // Returns { label, isRecognized, options } — tries exact → case-insensitive value → label contains
  const resolveSelectValue = (key: string, value: string): { label: string; isRecognized: boolean; options: SelectOption[] } => {
    let options: SelectOption[] = [];
    if (key === 'conditionOfProperty') options = conditions;
    if (key === 'typeOfRehab')         options = rehabTypes;
    if (key === 'materialQuality')     options = materialQualities;

    if (!value) return { label: '—', isRecognized: false, options };

    // 1. Exact value match
    const exactMatch = options.find(o => o.value === value);
    if (exactMatch) return { label: exactMatch.label, isRecognized: true, options };

    const lower = value.toLowerCase().trim();

    // 2. Case-insensitive value match
    const ciValueMatch = options.find(o => o.value.toLowerCase() === lower);
    if (ciValueMatch) return { label: ciValueMatch.label, isRecognized: true, options };

    // 3. Case-insensitive label contains (e.g. "Standard" matches "Standard (Q4)")
    const labelContains = options.find(o => o.label.toLowerCase().includes(lower) || lower.includes(o.label.toLowerCase().split(' ')[0]));
    if (labelContains) return { label: labelContains.label, isRecognized: true, options };

    // 4. No match — return raw AI text, flagged unrecognized
    return { label: value, isRecognized: false, options };
  };

  // ── Project Details helpers ───────────────────────────────────────────────
  const ADDRESS_KEYS   = ['street', 'city', 'state', 'zip'];
  const DIMENSION_PAIRS = [
    { label: 'Square Feet', asIsKey: 'asIsSqft',      projectedKey: 'projectedSqft',      unit: 'sq ft' },
    { label: 'Bedrooms',    asIsKey: 'asIsBedrooms',   projectedKey: 'projectedBedrooms',  unit: 'bd'    },
    { label: 'Bathrooms',   asIsKey: 'asIsBathrooms',  projectedKey: 'projectedBathrooms', unit: 'ba'    },
  ];
  const PROJECT_KEYS = ['conditionOfProperty', 'typeOfRehab', 'materialQuality', 'projectScopeStatement'];

  const detailEntries   = Object.entries(editableProjectDetails);
  const allDetailsAccepted = detailEntries.length > 0 && detailEntries.every(([, d]) => (d as any).accepted);

  const hasAddress    = ADDRESS_KEYS.some(k  => editableProjectDetails[k]?.value);
  const hasDimensions = DIMENSION_PAIRS.some(p => editableProjectDetails[p.asIsKey]?.value || editableProjectDetails[p.projectedKey]?.value);
  const hasProjectInfo = PROJECT_KEYS.some(k  => editableProjectDetails[k]?.value);

  const formattedAddress = (() => {
    const d = editableProjectDetails;
    const street = d['street']?.value  || '';
    const city   = d['city']?.value    || '';
    const state  = d['state']?.value   || '';
    const zip    = d['zip']?.value     || '';
    const line2  = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');
    return { street, line2 };
  })();

  const toggleGroup = (keys: string[], accepted: boolean) => {
    keys.forEach(key => {
      if (editableProjectDetails[key] !== undefined) {
        handleDetailChange(key, 'accepted', accepted);
      }
    });
  };

  const isDimPairAccepted = (asIsKey: string, projectedKey: string): boolean =>
    !!(editableProjectDetails[asIsKey]?.accepted || editableProjectDetails[projectedKey]?.accepted);

  const toggleDimPair = (asIsKey: string, projectedKey: string, accepted: boolean) => {
    if (editableProjectDetails[asIsKey]   !== undefined) handleDetailChange(asIsKey,      'accepted', accepted);
    if (editableProjectDetails[projectedKey] !== undefined) handleDetailChange(projectedKey, 'accepted', accepted);
  };

  const isAddressAccepted = ADDRESS_KEYS.some(k => editableProjectDetails[k]?.accepted);

  const footer = (
    <>
      <button onClick={onClose} className="button-base bg-transparent text-slate-300 border border-slate-600 hover:bg-slate-700 focus:ring-slate-500">
        Cancel
      </button>
      <button onClick={handleConfirmClick} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
        Apply Accepted Items
      </button>
    </>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="Review AI Budget Suggestions" footer={footer} size="xl">
        <div className="text-sm text-slate-400 mb-4">
            <p>The AI has analyzed your uploaded file. Please review its interpretation for each line item.</p>
            <p className="mt-2">You can correct any mappings, adjust budgets, or uncheck items to ignore them before applying changes.</p>
        </div>
        
        {(hasAddress || hasDimensions || hasProjectInfo) && (
            <div className="rounded-xl border border-slate-700 bg-slate-800 mb-6 overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-750 border-b border-slate-700">
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                        Project Details Found in File
                    </h3>
                    <button
                        onClick={() => toggleGroup(detailEntries.map(([k]) => k), !allDetailsAccepted)}
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                        {allDetailsAccepted ? 'Deselect All' : 'Accept All'}
                    </button>
                </div>

                {/* ── Section 1: Property Address ── */}
                {hasAddress && (
                    <div className="px-4 py-4 border-b border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Property Address</p>
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isAddressAccepted}
                                onChange={e => toggleGroup(ADDRESS_KEYS, e.target.checked)}
                                className="h-5 w-5 rounded border-slate-500 bg-slate-700 text-brand-500 focus:ring-brand-500 mt-0.5 flex-shrink-0"
                            />
                            <div>
                                {formattedAddress.street && (
                                    <p className="text-base font-semibold text-white leading-snug">{formattedAddress.street}</p>
                                )}
                                {formattedAddress.line2 && (
                                    <p className="text-sm text-slate-300 leading-snug">{formattedAddress.line2}</p>
                                )}
                                {!formattedAddress.street && !formattedAddress.line2 && (
                                    <p className="text-sm text-slate-500 italic">No address found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 2: Dimensions ── */}
                {hasDimensions && (
                    <div className="px-4 py-4 border-b border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dimensions</p>
                        <div className="grid grid-cols-3 gap-3">
                            {DIMENSION_PAIRS.map(({ label, asIsKey, projectedKey, unit }) => {
                                const asIsVal      = editableProjectDetails[asIsKey]?.value;
                                const projectedVal = editableProjectDetails[projectedKey]?.value;
                                if (!asIsVal && !projectedVal) return null;
                                const pairAccepted = isDimPairAccepted(asIsKey, projectedKey);
                                return (
                                    <div
                                        key={label}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            pairAccepted
                                                ? 'border-brand-600/60 bg-slate-700/60'
                                                : 'border-slate-600 bg-slate-700/30 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-semibold text-slate-300">{label}</p>
                                            <input
                                                type="checkbox"
                                                checked={pairAccepted}
                                                onChange={e => toggleDimPair(asIsKey, projectedKey, e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-brand-500 focus:ring-brand-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-center">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-0.5">As-Is</p>
                                                <p className="text-lg font-bold text-white leading-none">
                                                    {asIsVal ? Number(asIsVal).toLocaleString() : '—'}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">{unit}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-0.5">After Repair</p>
                                                <p className="text-lg font-bold text-brand-400 leading-none">
                                                    {projectedVal ? Number(projectedVal).toLocaleString() : '—'}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">{unit}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Section 3: Project Info ── */}
                {hasProjectInfo && (
                    <div className="px-4 py-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Info</p>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {(['conditionOfProperty', 'typeOfRehab', 'materialQuality'] as const).map(key => {
                                const detail = editableProjectDetails[key];
                                if (!detail?.value) return null;
                                const sectionLabel = detailKeyToLabelMap[key];
                                const { label: displayVal, isRecognized, options: selectOptions } = resolveSelectValue(key, String(detail.value));
                                return (
                                    <div
                                        key={key}
                                        className={`rounded-lg border p-3 transition-colors ${
                                            detail.accepted
                                                ? isRecognized
                                                    ? 'border-brand-600/60 bg-slate-700/60'
                                                    : 'border-amber-500/60 bg-amber-900/20'
                                                : 'border-slate-600 bg-slate-700/30 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold text-slate-400">{sectionLabel}</p>
                                            <input
                                                type="checkbox"
                                                checked={detail.accepted}
                                                onChange={e => handleDetailChange(key, 'accepted', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-brand-500 focus:ring-brand-500"
                                            />
                                        </div>

                                        {isRecognized ? (
                                            <p className="text-sm font-bold text-white leading-snug">{displayVal}</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs italic text-amber-300 truncate" title={displayVal}>"{displayVal}"</p>
                                                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-400 bg-amber-900/50 border border-amber-600/50 rounded px-1 py-0.5">
                                                        Unrecognized
                                                    </span>
                                                </div>
                                                <select
                                                    value=""
                                                    onChange={e => {
                                                        if (e.target.value) handleDetailChange(key, 'value', e.target.value);
                                                    }}
                                                    className="w-full text-xs rounded-md bg-slate-800 border border-amber-600/60 text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                                >
                                                    <option value="" disabled>— Select correct value —</option>
                                                    {selectOptions.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Scope of Work — full width */}
                        {editableProjectDetails['projectScopeStatement']?.value && (() => {
                            const detail = editableProjectDetails['projectScopeStatement'];
                            return (
                                <div className={`rounded-lg border p-3 transition-colors ${
                                    detail.accepted
                                        ? 'border-brand-600/60 bg-slate-700/60'
                                        : 'border-slate-600 bg-slate-700/30 opacity-50'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope of Work</p>
                                        <input
                                            type="checkbox"
                                            checked={detail.accepted}
                                            onChange={e => handleDetailChange('projectScopeStatement', 'accepted', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{detail.value}</p>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        )}

        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 mb-6 space-y-2">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200">Total Detected in File:</span>
                <span className="font-bold text-lg text-slate-100">{formatCurrency(totalFromFile)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200">Total of Accepted Items:</span>
                <span className={`font-bold text-lg ${totalsMismatch ? 'text-red-400' : 'text-green-400'}`}>
                    {formatCurrency(acceptedTotal)}
                </span>
            </div>
            {totalsMismatch && (
                <div className="pt-2 mt-2 border-t border-slate-600 text-center text-xs p-2 rounded-md bg-yellow-900/50 text-yellow-200">
                    <strong>Note:</strong> The accepted total differs from the file total. This usually happens if you uncheck items (like 'Grand Total' lines) or if the AI skipped purely summary rows.
                </div>
            )}
        </div>
        
        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 mb-6">
            <h4 className="font-semibold text-sky-300 mb-3 text-center text-base">Calculation Breakdown</h4>
            <div className="space-y-2 text-sm max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-300">Subtotal (Items + Profit + Overhead)</span>
                    <span className="font-medium text-slate-200">{formatCurrency(breakdown.baseSubTotal)}</span>
                </div>
                {(breakdown.profitFromFile > 0 || breakdown.overheadFromFile > 0) && (
                    <div className="text-xs text-slate-500 pl-4 pb-1">
                        {breakdown.profitFromFile > 0 && <div>• Includes Profit: {formatCurrency(breakdown.profitFromFile)}</div>}
                        {breakdown.overheadFromFile > 0 && <div>• Includes Overhead: {formatCurrency(breakdown.overheadFromFile)}</div>}
                    </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-300">GC/Builder Fee</span>
                    <div className="text-right">
                        {breakdown.gcFeeFromFile > breakdown.effectiveGcFee && (
                            <Tooltip text="Capped at 10% of subtotal.">
                                <span className="text-xs line-through text-red-400 mr-2">{formatCurrency(breakdown.gcFeeFromFile)}</span>
                            </Tooltip>
                        )}
                        <span className="font-medium text-slate-200">{formatCurrency(breakdown.effectiveGcFee)}</span>
                    </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700">
                    <span className="text-slate-300">Contingency</span>
                    <div className="text-right">
                        <span className="font-medium text-slate-200">{formatCurrency(breakdown.effectiveContingency)}</span>
                        <span className="block text-xs text-slate-500">
                            ({breakdown.contingencySource === 'auto-calculated' ? `${scopeSummary.contingencyPercentage}% Auto-Calc` : 'From File'})
                        </span>
                    </div>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="font-bold text-sky-300">Final Estimated Total</span>
                    <span className="font-bold text-lg text-sky-300">{formatCurrency(finalBudgetTotal)}</span>
                </div>
            </div>
        </div>
        
        <h3 className="text-base font-semibold text-slate-200 mt-6 mb-2">Budget Line Items</h3>
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                    <tr>
                        <th scope="col" className="py-2 px-3 w-8 text-center"><span className="sr-only">Accept</span></th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Original Item from File</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-28">Category</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Interpretation</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-36">New Item Name</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-28">Budget</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {editableSuggestions.length > 0 ? editableSuggestions.map((suggestion, index) => {
                        const interpretationValue = suggestion.suggestionType === 'new'
                            ? `NEW:${suggestion.categoryName}`
                            : suggestion.id;

                        // Resolve the category name for the badge
                        let categoryLabel = '';
                        if (suggestion.suggestionType === 'mapped' && suggestion.id) {
                            const parentCat = budgetCategoryData.find(c => c.items.some(i => i.id === suggestion.id));
                            categoryLabel = parentCat?.name || '';
                        } else if (suggestion.suggestionType === 'new') {
                            categoryLabel = suggestion.categoryName || '';
                        }

                        // Consistent badge color per category using index in the list
                        const catIndex = budgetCategoryData.findIndex(c => c.name === categoryLabel);
                        const badgeColors = [
                            'bg-blue-900/60 text-blue-300 border-blue-700',
                            'bg-purple-900/60 text-purple-300 border-purple-700',
                            'bg-green-900/60 text-green-300 border-green-700',
                            'bg-orange-900/60 text-orange-300 border-orange-700',
                            'bg-pink-900/60 text-pink-300 border-pink-700',
                            'bg-teal-900/60 text-teal-300 border-teal-700',
                            'bg-yellow-900/60 text-yellow-300 border-yellow-700',
                            'bg-red-900/60 text-red-300 border-red-700',
                            'bg-indigo-900/60 text-indigo-300 border-indigo-700',
                            'bg-cyan-900/60 text-cyan-300 border-cyan-700',
                        ];
                        const badgeColor = catIndex >= 0
                            ? badgeColors[catIndex % badgeColors.length]
                            : 'bg-slate-700 text-slate-400 border-slate-600';

                        // Row background: uncertain → amber, deselected → dimmed, alternating
                        const rowBg = suggestion.isUncertain
                            ? 'bg-yellow-900/20'
                            : index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/60';
                        const rowOpacity = !suggestion.accepted ? 'opacity-40' : '';

                        return (
                            <tr key={index} className={`${rowBg} ${rowOpacity} hover:bg-slate-700/60 transition-opacity`}>
                                <td className="py-2 px-3 text-center align-middle">
                                    <input
                                        type="checkbox"
                                        checked={suggestion.accepted}
                                        onChange={e => handleSuggestionChange(index, 'accepted', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-brand-500 focus:ring-brand-500"
                                    />
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-200 align-middle">
                                    {suggestion.isUncertain && (
                                        <Tooltip text="AI is uncertain about this item. Please review carefully.">
                                            <FlagIcon className="text-yellow-400 inline-block mr-1 flex-shrink-0" />
                                        </Tooltip>
                                    )}
                                    <span>{suggestion.originalText}</span>
                                </td>
                                <td className="py-2 px-3 align-middle">
                                    {categoryLabel ? (
                                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate max-w-full ${badgeColor}`}>
                                            {categoryLabel}
                                        </span>
                                    ) : (
                                        <span className="text-slate-600 text-xs">—</span>
                                    )}
                                </td>
                                <td className="py-2 px-3 text-sm align-middle">
                                    <select
                                        value={interpretationValue}
                                        onChange={e => handleInterpretationChange(index, e.target.value)}
                                        className="w-full text-xs rounded bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                                <td className="py-2 px-3 text-sm align-middle">
                                    <input
                                        type="text"
                                        value={suggestion.drawItem}
                                        onChange={e => handleSuggestionChange(index, 'drawItem', e.target.value)}
                                        className="w-full text-xs rounded bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={suggestion.suggestionType === 'mapped'}
                                        placeholder={suggestion.suggestionType === 'mapped' ? '' : 'Item name…'}
                                    />
                                </td>
                                <td className="py-2 px-3 text-sm align-middle">
                                    <input
                                        type="number"
                                        value={suggestion.budget}
                                        onChange={e => handleSuggestionChange(index, 'budget', parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs rounded bg-slate-700 border border-slate-600 text-slate-200 text-right px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr><td colSpan={6} className="text-center py-6 text-slate-400 italic">No items were found in the uploaded file.</td></tr>
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

    // Find new items whose categoryName didn't match any real category — they were silently dropped
    const validCategoryNames = new Set(budgetData.map(c => c.name));
    const droppedItems: any[] = (lastAppliedSuggestions?.new || []).filter(
        (item: any) => !validCategoryNames.has(item.categoryName)
    );
    const droppedTotal = droppedItems.reduce((sum: number, item: any) => sum + (item.budget || 0), 0);

    const footer = (
        <button onClick={onClose} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
            Continue to Project Setup
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Budget Update Summary" footer={footer} size="md">
            <div className="space-y-5">

                {/* ── Success banner ── */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-green-900/20 border border-green-700/50">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/50 border border-green-600/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-green-300">Budget Successfully Updated</p>
                        <p className="text-xs text-green-500 mt-0.5">All accepted items have been applied to your budget.</p>
                    </div>
                </div>

                {/* ── Stat pills ── */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Existing items updated */}
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-900/60 text-brand-300 border border-brand-700/60">
                            Updated
                        </span>
                        <p className="text-5xl font-black text-brand-400 leading-none">{mappedCount}</p>
                        <p className="text-xs text-slate-400 text-center">existing line items</p>
                    </div>

                    {/* New items added */}
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/60">
                            Added
                        </span>
                        <p className="text-5xl font-black text-purple-400 leading-none">{newCount - droppedItems.length}</p>
                        <p className="text-xs text-slate-400 text-center">new line items</p>
                    </div>
                </div>

                {/* ── Total value ── */}
                <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Budget Applied</p>
                    <p className="text-4xl font-black font-mono text-green-400">{formatCurrency(totalApplied - droppedTotal)}</p>
                </div>

                {/* ── Dropped items warning ── */}
                {droppedItems.length > 0 && (
                    <div className="text-left p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/60">
                        <div className="flex items-start gap-3 mb-3">
                            <span className="flex-shrink-0 text-yellow-400 text-xl leading-none mt-0.5">⚠</span>
                            <div>
                                <p className="font-semibold text-yellow-300 text-sm">
                                    {droppedItems.length} item{droppedItems.length > 1 ? 's' : ''} could not be placed
                                    <span className="ml-1 font-mono text-yellow-400">({formatCurrency(droppedTotal)})</span>
                                </p>
                                <p className="text-xs text-yellow-500 mt-0.5">
                                    The AI suggested a category that doesn't exist in the template. Add these manually after setup.
                                </p>
                            </div>
                        </div>
                        <ul className="space-y-1.5 ml-8">
                            {droppedItems.map((item: any, i: number) => (
                                <li key={i} className="text-xs flex justify-between gap-4 text-yellow-300/80">
                                    <span className="font-medium truncate">{item.drawItem || item.originalText}</span>
                                    <span className="flex-shrink-0 font-mono">{formatCurrency(item.budget)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-xs text-slate-500 text-center pb-1">
                    Select your project type on the next screen to finalize the budget template.
                </p>
            </div>
        </ComplexModal>
    );
};
