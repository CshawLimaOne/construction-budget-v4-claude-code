
import React, { useState, ChangeEvent, useEffect, useMemo } from 'react';
import { PropertyDetails, AsIsProjectedData, ProjectQuestion, SelectOption, AsIsProjectedField, AsIsProjectedAspect, AsIsProjectedItem, AsIsProjectedPerUnitItem, ProjectTypeMode, LandDetails, EntitlementStatus } from '../types';
import { CONDITIONS_OF_PROPERTY, TYPES_OF_REHAB, MATERIAL_QUALITIES, ENTITLEMENT_STATUS_OPTIONS } from '../constants';
import { CheckCircleIcon, ExclamationCircleIcon, SpinnerIcon, TractorIcon, PaintBrushIcon, HammerIcon, WrenchScrewdriverIcon, HomeModernIcon, SparklesIcon, PhotoIcon, MapPinIcon, InfoIcon, ConditionC1Icon, ConditionC2Icon, ConditionC3Icon, ConditionC4Icon, ConditionC5Icon, ConditionC6Icon, RehabLightIcon, RehabStandardIcon, RehabHeavyIcon } from './Icons';

interface Step1FormProps {
  propertyDetails: PropertyDetails;
  landDetails?: LandDetails; 
  asIsProjectedData: AsIsProjectedData;
  selectedCondition: string;
  selectedRehabType: string;
  selectedMaterialQuality: string;
  projectQuestions: ProjectQuestion[];
  verificationStatus: 'idle' | 'verifying' | 'verified' | 'mismatch';
  isLocked?: boolean;
  scrollToFieldId: string | null;
  onScrollComplete: () => void;
  onPropertyDetailChange: (name: keyof PropertyDetails, value: string) => void;
  onLandDetailsChange?: (key: keyof LandDetails, value: string) => void;
  onAsIsProjectedChange: (field: AsIsProjectedField, aspect: AsIsProjectedAspect, value: string, index?: number) => void;
  onSelectedConditionChange: (value: string) => void;
  onSelectedRehabTypeChange: (value: string) => void;
  onSelectedMaterialQualityChange: (value: string) => void;
  onProjectQuestionChange: (id: string, field: keyof ProjectQuestion, value: string) => void;
  highlightMissingFields?: boolean; 
  projectTypeMode?: ProjectTypeMode | null; 
}

const formatCurrencyForDisplay = (value: string): string => {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) return ''; 
    return numericValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const parseCurrencyForStorage = (value: string): string => {
    if (!value) return '';
    const numeric = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    const rounded = Math.round(numeric);
    return isNaN(rounded) ? '' : rounded.toString();
};

// Internal Component for Visual Selection Cards
const VisualSelector: React.FC<{ 
    title: string; 
    options: (SelectOption & { disabled?: boolean })[]; 
    selectedValue: string; 
    onSelect: (value: string) => void; 
    id?: string; 
    disabled?: boolean; 
    requiredHighlight?: boolean;
}> = ({ title, options, selectedValue, onSelect, id, disabled, requiredHighlight }) => {
    
    // Helper to get icon based on option label/value
    const getIcon = (option: SelectOption) => {
        // Condition of Property — match by value (C-1 through C-6)
        if (option.value === 'C-1') return <ConditionC1Icon className="w-10 h-10" />;
        if (option.value === 'C-2') return <ConditionC2Icon className="w-10 h-10" />;
        if (option.value === 'C-3') return <ConditionC3Icon className="w-10 h-10" />;
        if (option.value === 'C-4') return <ConditionC4Icon className="w-10 h-10" />;
        if (option.value === 'C-5') return <ConditionC5Icon className="w-10 h-10" />;
        if (option.value === 'C-6') return <ConditionC6Icon className="w-10 h-10" />;
        // Rehab type / material quality
        const lowerLabel = option.label.toLowerCase();
        if (lowerLabel.includes('new construction')) return <TractorIcon className="w-10 h-10" />;
        if (lowerLabel.includes('heavy')) return <RehabHeavyIcon className="w-10 h-10" />;
        if (lowerLabel.includes('standard')) return <RehabStandardIcon className="w-10 h-10" />;
        if (lowerLabel.includes('light') || lowerLabel.includes('cosmetic')) return <RehabLightIcon className="w-10 h-10" />;
        if (lowerLabel.includes('luxury') || lowerLabel.includes('custom')) return <SparklesIcon className="w-8 h-8" />;
        if (lowerLabel.includes('excellent') || lowerLabel.includes('nearly new')) return <HomeModernIcon className="w-8 h-8" />;
        return <HomeModernIcon className="w-8 h-8" />;
    };

    return (
        <div id={id} className={`section-container p-6 ${requiredHighlight ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}>
            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-2">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {options.map((opt) => {
                    const isSelected = selectedValue === opt.value;
                    const isOptionDisabled = disabled || opt.disabled;
                    
                    let borderColorClass = 'border-white/10 hover:border-[#0693e3]/50';
                    let bgClass = 'bg-white/5 hover:bg-white/10';
                    let iconColorClass = 'text-slate-400';

                    if (isSelected) {
                        borderColorClass = 'border-[#0693e3] ring-2 ring-[#0693e3]/40';
                        bgClass = 'bg-[#0693e3]/10';
                        iconColorClass = 'text-[#0693e3]';

                        if (opt.colorClass?.includes('green')) {
                            borderColorClass = 'border-green-500 ring-2 ring-green-500/40';
                            bgClass = 'bg-green-900/20';
                            iconColorClass = 'text-green-400';
                        } else if (opt.colorClass?.includes('orange') || opt.colorClass?.includes('yellow')) {
                            borderColorClass = 'border-orange-500 ring-2 ring-orange-500/40';
                            bgClass = 'bg-orange-900/20';
                            iconColorClass = 'text-orange-400';
                        } else if (opt.colorClass?.includes('red')) {
                            borderColorClass = 'border-red-500 ring-2 ring-red-500/40';
                            bgClass = 'bg-red-900/20';
                            iconColorClass = 'text-red-400';
                        }
                    }

                    if (isOptionDisabled) {
                        borderColorClass = 'border-white/5';
                        bgClass = 'bg-black/20';
                        iconColorClass = 'text-slate-600';
                    }

                    return (
                        <button
                            key={opt.value}
                            onClick={() => !isOptionDisabled && onSelect(opt.value)}
                            disabled={isOptionDisabled}
                            className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 text-left h-full backdrop-blur-sm ${borderColorClass} ${bgClass} ${isOptionDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <div className="flex justify-between w-full mb-3">
                                <div className={`p-2 rounded-lg bg-white/10 shadow-sm ${iconColorClass}`}>
                                    {getIcon(opt)}
                                </div>
                                {isSelected && (
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0693e3] shadow-md shadow-[#0693e3]/30">
                                        <CheckCircleIcon className="w-4 h-4 text-white" />
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-100 mb-1">{opt.label}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

interface CurrencyInputProps {
  name: 'purchasePrice'; 
  value: string; 
  onChange: (name: 'purchasePrice', value: string) => void;
  placeholder?: string;
  className?: string;
  highlight?: boolean;
  id?: string; 
  disabled?: boolean;
  requiredHighlight?: boolean; 
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ name, value, onChange, placeholder, className, highlight, id, disabled, requiredHighlight }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value ? formatCurrencyForDisplay(value) : '');

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? formatCurrencyForDisplay(value) : '');
    } else {
      const rawValue = parseCurrencyForStorage(value);
      setDisplayValue(rawValue);
    }
  }, [value, isFocused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setDisplayValue(rawInput); 
    
    const numericString = parseCurrencyForStorage(rawInput);
    onChange(name, numericString);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    const rawValue = parseCurrencyForStorage(value);
    setDisplayValue(rawValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(value ? formatCurrencyForDisplay(value) : ''); 
  };

  return (
    <input
      id={id}
      type={isFocused ? 'number' : 'text'}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`${className || ''} spreadsheet-input ${highlight ? 'bg-yellow-900/30 text-yellow-200 border-yellow-500' : ''} ${requiredHighlight ? 'border-red-500 ring-1 ring-red-500' : ''}`}
      step={isFocused ? "1" : undefined} 
      aria-label={name === 'purchasePrice' ? 'Purchase Price' : placeholder}
      disabled={disabled}
    />
  );
};

const VerificationStatusIndicator: React.FC<{ status: 'idle' | 'verifying' | 'verified' | 'mismatch' }> = ({ status }) => {
  if (status === 'idle') return null;

  let content;
  let bgClass = "bg-white/10";
  switch (status) {
    case 'verifying':
      content = <><SpinnerIcon className="text-brand-400" /> Verifying...</>;
      break;
    case 'verified':
      content = <><CheckCircleIcon className="text-green-400" /> Verified</>;
      bgClass = "bg-green-900/30 border border-green-500/30";
      break;
    case 'mismatch':
      content = <><ExclamationCircleIcon className="text-red-400" /> Mismatch Found</>;
      bgClass = "bg-red-900/30 border border-red-500/30";
      break;
  }

  return (
    <div className={`absolute right-3 top-3 flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm text-white ${bgClass}`}>
      {content}
    </div>
  );
};

export const Step1Form: React.FC<Step1FormProps> = ({
  propertyDetails,
  landDetails,
  asIsProjectedData,
  selectedCondition,
  selectedRehabType,
  selectedMaterialQuality,
  projectQuestions,
  verificationStatus,
  isLocked,
  scrollToFieldId,
  onScrollComplete,
  onPropertyDetailChange,
  onLandDetailsChange,
  onAsIsProjectedChange,
  onSelectedConditionChange,
  onSelectedRehabTypeChange,
  onSelectedMaterialQualityChange,
  onProjectQuestionChange,
  highlightMissingFields,
  projectTypeMode
}) => {
  const asIsProjectedKeys = Object.keys(asIsProjectedData) as Array<keyof AsIsProjectedData>;
  const projectedUnitCount = asIsProjectedData.unitCount && asIsProjectedData.unitCount.projected ? (parseInt(asIsProjectedData.unitCount.projected, 10) || 0) : 0;
  const asIsUnitCount = asIsProjectedData.unitCount && asIsProjectedData.unitCount.asIs ? (parseInt(asIsProjectedData.unitCount.asIs, 10) || 0) : 0;

  // Detect structural changes (As-Is != Projected)
  const hasStructuralChanges = useMemo(() => {
      const keysToCheck: (keyof AsIsProjectedData)[] = [
          'totalBuildingSqFeet', 
          'bedroomCount', 
          'bathroomCount', 
          'unitCount',
          'floorsAboveBasement'
      ];

      return keysToCheck.some(key => {
          const item = asIsProjectedData[key] as AsIsProjectedItem;
          // Safe access in case item is undefined
          if (!item) return false;
          
          const asIs = (item.asIs || '').toString().trim();
          const projected = (item.projected || '').toString().trim();
          
          // Only trigger change detection if both fields have values
          if (asIs && projected) {
              return asIs !== projected;
          }
          return false;
      });
  }, [asIsProjectedData]);

  // Filter Rehab Types based on Mode and Structural Changes
  const rehabOptions = useMemo(() => {
      const baseOptions = TYPES_OF_REHAB.filter(option => {
          if (projectTypeMode === 'new_construction') {
              return option.value === 'New Construction';
          } else if (projectTypeMode === 'renovation') {
              return option.value !== 'New Construction';
          }
          return true; // Show all if no mode selected (fallback)
      });

      return baseOptions.map(opt => {
          if (opt.value === 'Light-Cosmetic' && hasStructuralChanges) {
              return { 
                  ...opt, 
                  disabled: true, 
                  description: 'Unavailable: Layout, SqFt, or Room Count changes require Standard or Heavy rehab.' 
              };
          }
          return opt;
      });
  }, [projectTypeMode, hasStructuralChanges]);

  const isNewConstructionMode = projectTypeMode === 'new_construction' || selectedRehabType === 'New Construction';

  useEffect(() => {
    if (scrollToFieldId) {
      const mapFieldIdToDomId = (fieldId: string): string | null => {
        if (fieldId.startsWith('propertyDetails.')) {
            const field = fieldId.split('.')[1];
            if (field === 'purchasePrice') return 'property-address-price-input';
            return `property-address-${field}-input`;
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

  const getInputClass = (value: string | number | undefined) => {
      return highlightMissingFields && !value ? 'border-red-500 ring-1 ring-red-500 bg-red-900/10' : '';
  };

  return (
    <>
      {/* Smart Address Entry Section */}
      <div id="property-address-section" className="section-container p-6">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Property Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Input Form */}
            <div className="lg:col-span-2 bg-white/5 p-6 rounded-xl border border-white/10 relative backdrop-blur-sm">
                <VerificationStatusIndicator status={verificationStatus} />
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Street Address</label>
                        <div className="relative">
                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                id="property-address-street-input"
                                type="text"
                                name="street"
                                value={propertyDetails.street}
                                onChange={(e) => onPropertyDetailChange('street', e.target.value)}
                                placeholder="123 Main St"
                                className={`spreadsheet-input w-full pl-10 ${getInputClass(propertyDetails.street)}`}
                                aria-label="Street Address"
                                disabled={isLocked}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-300 mb-1">City</label>
                            <input
                                id="property-address-city-input"
                                type="text"
                                name="city"
                                value={propertyDetails.city}
                                onChange={(e) => onPropertyDetailChange('city', e.target.value)}
                                placeholder="City"
                                className={`spreadsheet-input w-full ${getInputClass(propertyDetails.city)}`}
                                disabled={isLocked}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1">State</label>
                            <input
                                id="property-address-state-input"
                                type="text"
                                name="state"
                                value={propertyDetails.state}
                                onChange={(e) => onPropertyDetailChange('state', e.target.value)}
                                placeholder="ST"
                                className={`spreadsheet-input w-full ${getInputClass(propertyDetails.state)}`}
                                disabled={isLocked}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1">Zip</label>
                            <input
                                id="property-address-zip-input"
                                type="text"
                                name="zip"
                                value={propertyDetails.zip}
                                onChange={(e) => onPropertyDetailChange('zip', e.target.value)}
                                placeholder="12345"
                                className={`spreadsheet-input w-full ${getInputClass(propertyDetails.zip)}`}
                                disabled={isLocked}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Purchase Price</label>
                        <CurrencyInput
                            id="property-address-price-input"
                            name="purchasePrice"
                            value={propertyDetails.purchasePrice} 
                            onChange={onPropertyDetailChange as (name: 'purchasePrice', value: string) => void}
                            placeholder="$0"
                            className="w-full font-bold text-lg bg-white/10 focus:bg-white/20 border-white/20"
                            disabled={isLocked}
                            requiredHighlight={highlightMissingFields && !propertyDetails.purchasePrice}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Smart Placeholder */}
            <div className="lg:col-span-1 h-full min-h-[250px]">
                <div className="h-full w-full bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-6 text-center group transition-all hover:border-brand-400/50 hover:bg-brand-900/20 backdrop-blur-sm">
                    <div className="p-4 bg-white/10 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform group-hover:bg-brand-500 group-hover:text-white text-slate-400">
                        <PhotoIcon className="w-10 h-10" />
                    </div>
                    <h4 className="font-bold text-slate-200 text-lg">Property Preview</h4>
                    <p className="text-sm text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                        Street view will appear here automatically once address is verified.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {isNewConstructionMode && landDetails && onLandDetailsChange ? (
        /* New Construction: Land Details Section */
        <div id="land-details-section" className="section-container p-6 border-orange-500/30 bg-orange-900/10">
            <div className="flex items-center mb-6 text-orange-400 border-b border-orange-500/30 pb-2">
                <TractorIcon className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-bold text-white">Land Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Lot Size</label>
                    <input 
                        type="text" 
                        value={landDetails.lotSize}
                        onChange={(e) => onLandDetailsChange('lotSize', e.target.value)}
                        placeholder="e.g. 0.5 Acres or 5000 sqft"
                        className={`spreadsheet-input w-full ${getInputClass(landDetails.lotSize)}`}
                        disabled={isLocked}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Current Zoning</label>
                    <input 
                        type="text" 
                        value={landDetails.zoning}
                        onChange={(e) => onLandDetailsChange('zoning', e.target.value)}
                        placeholder="e.g. Residential, R-1"
                        className={`spreadsheet-input w-full ${getInputClass(landDetails.zoning)}`}
                        disabled={isLocked}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Land Status</label>
                    <select
                        value={landDetails.entitlementStatus}
                        onChange={(e) => onLandDetailsChange('entitlementStatus', e.target.value)}
                        className={`spreadsheet-input w-full ${getInputClass(landDetails.entitlementStatus)}`}
                        disabled={isLocked}
                    >
                        <option value="">Select...</option>
                        {ENTITLEMENT_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      ) : null}

      {/* Property Specs Table with Animation */}
      <div id="property-info-table-section" className="section-container p-0 overflow-hidden">
        <h3 className="text-lg font-bold text-white p-6 border-b border-white/10 bg-white/5">
            {isNewConstructionMode ? "Proposed Build Specifications" : "As-Is vs. Projected Value"}
        </h3>
        
        <div className="overflow-x-auto">
            <table id="property-info-table" className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                  <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-1/3">Item</th>
                      <th className={`px-6 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider transition-all duration-500 ease-in-out ${isNewConstructionMode ? 'w-0 opacity-0 p-0 border-0' : 'w-1/3 opacity-100'}`}>
                          <div className={isNewConstructionMode ? 'hidden' : 'block'}>Current (As-Is)</div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider w-1/3">Projected (After Repair)</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
              {asIsProjectedKeys.map((key, index) => {
                const fieldData = asIsProjectedData[key];
                if (!fieldData) return null;

                const isPerUnitField = key === 'bedroomCountPerUnit' || key === 'bathroomCountPerUnit';
                
                if (isPerUnitField && Math.max(asIsUnitCount, projectedUnitCount) <= 1) {
                  return null;
                }

                return (
                  <tr key={key} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                        {fieldData.label}
                    </td>
                    
                    {/* Animated As-Is Column */}
                    <td className={`px-6 py-4 whitespace-nowrap transition-all duration-500 ease-in-out origin-left ${isNewConstructionMode ? 'w-0 opacity-0 p-0 border-0 scale-x-0' : 'w-1/3 opacity-100 scale-x-100'}`}>
                      <div className={isNewConstructionMode ? 'hidden' : 'block'}>
                          {isPerUnitField ? (
                            <div className="flex items-center justify-center space-x-2">
                              {Array.from({ length: Math.min(asIsUnitCount, 4) }).map((_, i) => {
                                  const perUnitData = fieldData as AsIsProjectedPerUnitItem;
                                  return (
                                    <input
                                      key={i} type="number"
                                      value={perUnitData.asIs && perUnitData.asIs[i] ? perUnitData.asIs[i] : ''}
                                      onChange={(e) => onAsIsProjectedChange(key, 'asIs', e.target.value, i)}
                                      className="spreadsheet-input text-center w-16"
                                      placeholder={`U${i + 1}`}
                                      disabled={isLocked}
                                    />
                                  )
                              })}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                                <input 
                                  type="text" 
                                  value={(fieldData as AsIsProjectedItem).asIs || ''} 
                                  onChange={(e) => onAsIsProjectedChange(key, 'asIs', e.target.value)} 
                                  className={`spreadsheet-input text-center max-w-[120px] bg-white/5 border-white/10 ${getInputClass((fieldData as AsIsProjectedItem).asIs)}`}
                                  placeholder="--"
                                  disabled={isLocked}
                                />
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Projected Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                       {isPerUnitField ? (
                        <div className="flex items-center justify-center space-x-2">
                          {Array.from({ length: Math.min(projectedUnitCount, 4) }).map((_, i) => {
                              const perUnitData = fieldData as AsIsProjectedPerUnitItem;
                              return (
                                <input
                                  key={i} type="number"
                                  value={perUnitData.projected && perUnitData.projected[i] ? perUnitData.projected[i] : ''}
                                  onChange={(e) => onAsIsProjectedChange(key, 'projected', e.target.value, i)}
                                  className="spreadsheet-input text-center w-16"
                                  placeholder={`U${i + 1}`}
                                  disabled={isLocked}
                                />
                              )
                          })}
                        </div>
                      ) : (
                        <div className="flex justify-center">
                            <input 
                              type="text" 
                              value={(fieldData as AsIsProjectedItem).projected || ''} 
                              onChange={(e) => onAsIsProjectedChange(key, 'projected', e.target.value)} 
                              className={`spreadsheet-input text-center max-w-[120px] font-bold text-[#0693e3] border-[#0693e3]/40 ${getInputClass((fieldData as AsIsProjectedItem).projected)}`}
                              placeholder="Target"
                              disabled={isLocked}
                            />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
        </div>
            
        {/* Helper Footer */}
        <div className="bg-white/5 px-6 py-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center">
            <InfoIcon className="w-4 h-4 mr-2" />
            <span>Entering accurate square footage helps our AI estimate construction costs.</span>
        </div>
      </div>
      
      {/* Visual Selectors */}
      <VisualSelector 
        id="type-of-rehab-section" 
        title="Type of Rehab (Required)" 
        options={rehabOptions} 
        selectedValue={selectedRehabType} 
        onSelect={onSelectedRehabTypeChange} 
        disabled={isLocked} 
        requiredHighlight={highlightMissingFields && !selectedRehabType} 
      />

      {!isNewConstructionMode && (
        <VisualSelector 
            id="condition-of-property-section" 
            title="Condition of Property (Required)" 
            options={CONDITIONS_OF_PROPERTY} 
            selectedValue={selectedCondition} 
            onSelect={onSelectedConditionChange} 
            disabled={isLocked} 
            requiredHighlight={highlightMissingFields && !selectedCondition} 
        />
      )}

      <VisualSelector 
        id="material-quality-section" 
        title="Material Quality (Required)" 
        options={MATERIAL_QUALITIES} 
        selectedValue={selectedMaterialQuality} 
        onSelect={onSelectedMaterialQualityChange} 
        disabled={isLocked} 
        requiredHighlight={highlightMissingFields && !selectedMaterialQuality} 
      />
    </>
  );
};
