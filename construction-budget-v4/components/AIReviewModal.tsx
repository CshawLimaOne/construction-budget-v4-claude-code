
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

    // GC/Builder Fees are not capped - whatever the file states (or the
    // reviewer enters) is used as-is.
    const subTotalIncludingGc = baseSubTotal + gcFeeFromFile;

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
    <button onClick={handleConfirmClick} className="button-base btn-primary">
      Apply Accepted Items
    </button>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="Review AI Budget Suggestions" footer={footer} size="xl">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FFF5DB] border border-[#EDDDB1] mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#EDDDB1]/50 border border-[#EDDDB1] flex items-center justify-center">
                <span className="text-2xl leading-none text-[#EAA800]">⚠</span>
            </div>
            <div>
                <p className="text-base font-bold text-[#EAA800]">AI-generated — verify before applying</p>
                <p className="text-xs text-[#EAA800]/80 mt-0.5">Every mapping and dollar amount below was produced by AI. Review each line item carefully before applying it to the budget.</p>
            </div>
        </div>

        <div className="text-sm text-[#78819D] mb-4">
            <p>The AI has analyzed your uploaded file. Please review its interpretation for each line item.</p>
            <p className="mt-2">You can correct any mappings, adjust budgets, or uncheck items to ignore them before applying changes.</p>
        </div>

        {(hasAddress || hasDimensions || hasProjectInfo) && (
            <div className="rounded-xl border border-[#DFE1E5] bg-[#F6F7F9] mb-6 overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#DFE1E5]">
                    <h3 className="text-sm font-bold text-[#1E2D5C] uppercase tracking-wider">
                        Project Details Found in File
                    </h3>
                    <button
                        onClick={() => toggleGroup(detailEntries.map(([k]) => k), !allDetailsAccepted)}
                        className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                        {allDetailsAccepted ? 'Deselect All' : 'Accept All'}
                    </button>
                </div>

                {/* ── Section 1: Property Address ── */}
                {hasAddress && (
                    <div className="px-4 py-4 border-b border-[#DFE1E5]">
                        <p className="text-xs font-bold text-[#78819D] uppercase tracking-wider mb-3">Property Address</p>
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={isAddressAccepted}
                                onChange={e => toggleGroup(ADDRESS_KEYS, e.target.checked)}
                                className="h-5 w-5 rounded border-[#DFE1E5] bg-white text-brand-500 focus:ring-brand-500 mt-0.5 flex-shrink-0"
                            />
                            <div>
                                {formattedAddress.street && (
                                    <p className="text-base font-semibold text-[#1E2D5C] leading-snug">{formattedAddress.street}</p>
                                )}
                                {formattedAddress.line2 && (
                                    <p className="text-sm text-[#1E2D5C] leading-snug">{formattedAddress.line2}</p>
                                )}
                                {!formattedAddress.street && !formattedAddress.line2 && (
                                    <p className="text-sm text-[#78819D] italic">No address found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 2: Dimensions ── */}
                {hasDimensions && (
                    <div className="px-4 py-4 border-b border-[#DFE1E5]">
                        <p className="text-xs font-bold text-[#78819D] uppercase tracking-wider mb-3">Dimensions</p>
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
                                                ? 'border-brand-200 bg-brand-50'
                                                : 'border-[#DFE1E5] bg-[#F6F7F9] opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-semibold text-[#1E2D5C]">{label}</p>
                                            <input
                                                type="checkbox"
                                                checked={pairAccepted}
                                                onChange={e => toggleDimPair(asIsKey, projectedKey, e.target.checked)}
                                                className="h-4 w-4 rounded border-[#DFE1E5] bg-white text-brand-500 focus:ring-brand-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-center">
                                            <div>
                                                <p className="text-xs text-[#78819D] mb-0.5">As-Is</p>
                                                <p className="text-lg font-bold text-[#1E2D5C] leading-none">
                                                    {asIsVal ? Number(asIsVal).toLocaleString() : '—'}
                                                </p>
                                                <p className="text-xs text-[#78819D] mt-0.5">{unit}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#78819D] mb-0.5">After Repair</p>
                                                <p className="text-lg font-bold text-brand-500 leading-none">
                                                    {projectedVal ? Number(projectedVal).toLocaleString() : '—'}
                                                </p>
                                                <p className="text-xs text-[#78819D] mt-0.5">{unit}</p>
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
                        <p className="text-xs font-bold text-[#78819D] uppercase tracking-wider mb-3">Project Info</p>
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
                                                    ? 'border-brand-200 bg-brand-50'
                                                    : 'border-[#EDDDB1] bg-[#FFF5DB]'
                                                : 'border-[#DFE1E5] bg-[#F6F7F9] opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold text-[#78819D]">{sectionLabel}</p>
                                            <input
                                                type="checkbox"
                                                checked={detail.accepted}
                                                onChange={e => handleDetailChange(key, 'accepted', e.target.checked)}
                                                className="h-4 w-4 rounded border-[#DFE1E5] bg-white text-brand-500 focus:ring-brand-500"
                                            />
                                        </div>

                                        {isRecognized ? (
                                            <p className="text-sm font-bold text-[#1E2D5C] leading-snug">{displayVal}</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs italic text-[#EAA800] truncate" title={displayVal}>"{displayVal}"</p>
                                                    <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#EAA800] bg-[#FFF5DB] border border-[#EDDDB1] rounded px-1 py-0.5">
                                                        Unrecognized
                                                    </span>
                                                </div>
                                                <select
                                                    value=""
                                                    onChange={e => {
                                                        if (e.target.value) handleDetailChange(key, 'value', e.target.value);
                                                    }}
                                                    className="w-full text-xs rounded-md bg-white border border-[#EDDDB1] text-[#1E2D5C] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                                        ? 'border-brand-200 bg-brand-50'
                                        : 'border-[#DFE1E5] bg-[#F6F7F9] opacity-50'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-[#78819D] uppercase tracking-wider">Scope of Work</p>
                                        <input
                                            type="checkbox"
                                            checked={detail.accepted}
                                            onChange={e => handleDetailChange('projectScopeStatement', 'accepted', e.target.checked)}
                                            className="h-4 w-4 rounded border-[#DFE1E5] bg-white text-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                    <p className="text-sm text-[#1E2D5C] leading-relaxed whitespace-pre-wrap">{detail.value}</p>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        )}

        <div className="p-4 rounded-lg bg-[#F6F7F9] border border-[#DFE1E5] mb-6 space-y-2">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1E2D5C]">Total Detected in File:</span>
                <span className="font-bold text-lg text-[#1E2D5C]">{formatCurrency(totalFromFile)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1E2D5C]">Total of Accepted Items:</span>
                <span className={`font-bold text-lg ${totalsMismatch ? 'text-[#B92814]' : 'text-[#139B23]'}`}>
                    {formatCurrency(acceptedTotal)}
                </span>
            </div>
            {totalsMismatch && (
                <div className="pt-2 mt-2 border-t border-[#EDDDB1] text-center text-xs p-2 rounded-md bg-[#FFF5DB] text-[#EAA800]">
                    <strong>Note:</strong> The accepted total differs from the file total. This usually happens if you uncheck items (like 'Grand Total' lines) or if the AI skipped purely summary rows.
                </div>
            )}
        </div>
        
        <div className="p-4 rounded-lg bg-[#F6F7F9] border border-[#DFE1E5] mb-6">
            <h4 className="font-semibold text-brand-500 mb-3 text-center text-base">Calculation Breakdown</h4>
            <div className="space-y-2 text-sm max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-[#DFE1E5]">
                    <span className="text-[#1E2D5C]">Subtotal (Items + Profit + Overhead)</span>
                    <span className="font-medium text-[#1E2D5C]">{formatCurrency(breakdown.baseSubTotal)}</span>
                </div>
                {(breakdown.profitFromFile > 0 || breakdown.overheadFromFile > 0) && (
                    <div className="text-xs text-[#78819D] pl-4 pb-1">
                        {breakdown.profitFromFile > 0 && <div>• Includes Profit: {formatCurrency(breakdown.profitFromFile)}</div>}
                        {breakdown.overheadFromFile > 0 && <div>• Includes Overhead: {formatCurrency(breakdown.overheadFromFile)}</div>}
                    </div>
                )}
                <div className="flex justify-between py-1 border-b border-[#DFE1E5]">
                    <span className="text-[#1E2D5C]">GC/Builder Fee</span>
                    <span className="font-medium text-[#1E2D5C]">{formatCurrency(breakdown.gcFeeFromFile)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DFE1E5]">
                    <span className="text-[#1E2D5C]">Contingency</span>
                    <div className="text-right">
                        <span className="font-medium text-[#1E2D5C]">{formatCurrency(breakdown.effectiveContingency)}</span>
                        <span className="block text-xs text-[#78819D]">
                            ({breakdown.contingencySource === 'auto-calculated' ? `${scopeSummary.contingencyPercentage}% Auto-Calc` : 'From File'})
                        </span>
                    </div>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="font-bold text-brand-500">Final Estimated Total</span>
                    <span className="font-bold text-lg text-brand-500">{formatCurrency(finalBudgetTotal)}</span>
                </div>
            </div>
        </div>
        
        <h3 className="text-base font-semibold text-[#1E2D5C] mt-6 mb-2">Budget Line Items</h3>
        <div className="overflow-x-auto border border-[#DFE1E5] rounded-lg">
            <table className="min-w-full divide-y divide-[#DFE1E5]">
                <thead className="bg-[#F6F7F9]">
                    <tr>
                        <th scope="col" className="py-2 px-3 w-8 text-center"><span className="sr-only">Accept</span></th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-[#78819D] uppercase tracking-wider">Original Item from File</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-[#78819D] uppercase tracking-wider w-28">Category</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-[#78819D] uppercase tracking-wider">AI Interpretation</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-[#78819D] uppercase tracking-wider w-36">New Item Name</th>
                        <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-[#78819D] uppercase tracking-wider w-28">Budget</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1E5]">
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
                            'bg-blue-50 text-blue-700 border-blue-200',
                            'bg-purple-50 text-purple-700 border-purple-200',
                            'bg-[#E1F7E4] text-[#139B23] border-[#ADDEB4]',
                            'bg-orange-50 text-orange-700 border-orange-200',
                            'bg-pink-50 text-pink-700 border-pink-200',
                            'bg-teal-50 text-teal-700 border-teal-200',
                            'bg-[#FFF5DB] text-[#EAA800] border-[#EDDDB1]',
                            'bg-[#FFF0EE] text-[#B92814] border-[#F2C0BA]',
                            'bg-indigo-50 text-indigo-700 border-indigo-200',
                            'bg-cyan-50 text-cyan-700 border-cyan-200',
                        ];
                        const badgeColor = catIndex >= 0
                            ? badgeColors[catIndex % badgeColors.length]
                            : 'bg-[#F6F7F9] text-[#78819D] border-[#DFE1E5]';

                        // Row background: uncertain → warning, deselected → dimmed, alternating
                        const rowBg = suggestion.isUncertain
                            ? 'bg-[#FFF5DB]'
                            : index % 2 === 0 ? 'bg-white' : 'bg-[#F6F7F9]';
                        const rowOpacity = !suggestion.accepted ? 'opacity-40' : '';

                        return (
                            <tr key={index} className={`${rowBg} ${rowOpacity} hover:bg-[#F7F9FC] transition-opacity`}>
                                <td className="py-2 px-3 text-center align-middle">
                                    <input
                                        type="checkbox"
                                        checked={suggestion.accepted}
                                        onChange={e => handleSuggestionChange(index, 'accepted', e.target.checked)}
                                        className="h-4 w-4 rounded border-[#DFE1E5] bg-white text-brand-500 focus:ring-brand-500"
                                    />
                                </td>
                                <td className="py-2 px-3 text-sm text-[#1E2D5C] align-middle">
                                    {suggestion.isUncertain && (
                                        <Tooltip text="AI is uncertain about this item. Please review carefully.">
                                            <FlagIcon className="text-[#EAA800] inline-block mr-1 flex-shrink-0" />
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
                                        <span className="text-[#78819D] text-xs">—</span>
                                    )}
                                </td>
                                <td className="py-2 px-3 text-sm align-middle">
                                    <select
                                        value={interpretationValue}
                                        onChange={e => handleInterpretationChange(index, e.target.value)}
                                        className="w-full text-xs rounded bg-white border border-[#DFE1E5] text-[#1E2D5C] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                                        className="w-full text-xs rounded bg-white border border-[#DFE1E5] text-[#1E2D5C] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={suggestion.suggestionType === 'mapped'}
                                        placeholder={suggestion.suggestionType === 'mapped' ? '' : 'Item name…'}
                                    />
                                </td>
                                <td className="py-2 px-3 text-sm align-middle">
                                    <input
                                        type="number"
                                        value={suggestion.budget}
                                        onChange={e => handleSuggestionChange(index, 'budget', parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs rounded bg-white border border-[#DFE1E5] text-[#1E2D5C] text-right px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr><td colSpan={6} className="text-center py-6 text-[#78819D] italic">No items were found in the uploaded file.</td></tr>
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
        <button onClick={onClose} className="button-base btn-primary">
            Continue to Project Setup
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Budget Update Summary" footer={footer} size="md" hideCloseButton>
            <div className="space-y-5">

                {/* ── Success banner ── */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#E1F7E4] border border-[#ADDEB4]">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ADDEB4]/40 border border-[#ADDEB4] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#139B23]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-[#139B23]">Budget Successfully Updated</p>
                        <p className="text-xs text-[#139B23]/80 mt-0.5">All accepted items have been applied to your budget.</p>
                    </div>
                </div>

                {/* ── AI verification reminder ── */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FFF5DB] border border-[#EDDDB1]">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#EDDDB1]/50 border border-[#EDDDB1] flex items-center justify-center">
                        <span className="text-2xl leading-none text-[#EAA800]">⚠</span>
                    </div>
                    <div>
                        <p className="text-base font-bold text-[#EAA800]">Double-check before you continue</p>
                        <p className="text-xs text-[#EAA800]/80 mt-0.5">These items were mapped and priced by AI. Verify every line item in the detailed budget before submitting.</p>
                    </div>
                </div>

                {/* ── Stat pills ── */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Existing items updated */}
                    <div className="rounded-xl bg-[#F6F7F9] border border-[#DFE1E5] p-4 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-500 border border-brand-200">
                            Updated
                        </span>
                        <p className="text-5xl font-black text-brand-500 leading-none">{mappedCount}</p>
                        <p className="text-xs text-[#78819D] text-center">existing line items</p>
                    </div>

                    {/* New items added */}
                    <div className="rounded-xl bg-[#F6F7F9] border border-[#DFE1E5] p-4 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Added
                        </span>
                        <p className="text-5xl font-black text-purple-600 leading-none">{newCount - droppedItems.length}</p>
                        <p className="text-xs text-[#78819D] text-center">new line items</p>
                    </div>
                </div>

                {/* ── Total value ── */}
                <div className="rounded-xl bg-[#F6F7F9] border border-[#DFE1E5] p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#78819D] mb-1">Total Budget Applied</p>
                    <p className="text-4xl font-black font-mono text-[#139B23]">{formatCurrency(totalApplied - droppedTotal)}</p>
                </div>

                {/* ── Dropped items warning ── */}
                {droppedItems.length > 0 && (
                    <div className="text-left p-4 rounded-xl bg-[#FFF5DB] border border-[#EDDDB1]">
                        <div className="flex items-start gap-3 mb-3">
                            <span className="flex-shrink-0 text-[#EAA800] text-xl leading-none mt-0.5">⚠</span>
                            <div>
                                <p className="font-semibold text-[#EAA800] text-sm">
                                    {droppedItems.length} item{droppedItems.length > 1 ? 's' : ''} could not be placed
                                    <span className="ml-1 font-mono text-[#EAA800]">({formatCurrency(droppedTotal)})</span>
                                </p>
                                <p className="text-xs text-[#EAA800]/80 mt-0.5">
                                    The AI suggested a category that doesn't exist in the template. Add these manually after setup.
                                </p>
                            </div>
                        </div>
                        <ul className="space-y-1.5 ml-8">
                            {droppedItems.map((item: any, i: number) => (
                                <li key={i} className="text-xs flex justify-between gap-4 text-[#EAA800]">
                                    <span className="font-medium truncate">{item.drawItem || item.originalText}</span>
                                    <span className="flex-shrink-0 font-mono">{formatCurrency(item.budget)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p className="text-xs text-[#78819D] text-center pb-1">
                    Select your project type on the next screen to finalize the budget template.
                </p>
            </div>
        </ComplexModal>
    );
};
