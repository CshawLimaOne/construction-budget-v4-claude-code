
import React, { useState, ChangeEvent, useEffect, useMemo } from 'react';
import { PropertyDetails, AsIsProjectedData, ProjectQuestion, SelectOption, AsIsProjectedField, AsIsProjectedAspect, AsIsProjectedItem, AsIsProjectedPerUnitItem, ProjectTypeMode, LandDetails } from '../types';
import { CONDITIONS_OF_PROPERTY, TYPES_OF_REHAB, MATERIAL_QUALITIES, ENTITLEMENT_STATUS_OPTIONS } from '../constants';
import {
  CheckCircleIcon, ExclamationCircleIcon, SpinnerIcon,
  TractorIcon, HomeModernIcon, SparklesIcon, MapPinIcon, InfoIcon,
  ConditionC1Icon, ConditionC2Icon, ConditionC3Icon, ConditionC4Icon, ConditionC5Icon, ConditionC6Icon,
  RehabLightIcon, RehabStandardIcon, RehabHeavyIcon,
  MaterialQ1Icon, MaterialQ2Icon, MaterialQ3Icon, MaterialQ4Icon, MaterialQ5Icon, MaterialQ6Icon,
} from './Icons';

// ─── Types ─────────────────────────────────────────────────────────────────
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

// ─── Currency helpers ───────────────────────────────────────────────────────
const formatCurrencyForDisplay = (value: string): string => {
  const n = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  if (isNaN(n)) return '';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const parseCurrencyForStorage = (value: string): string => {
  if (!value) return '';
  const n = Math.round(parseFloat(value.replace(/[^0-9.-]+/g, '')));
  return isNaN(n) ? '' : n.toString();
};

// ─── Section Header ─────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ number: string; title: string; subtitle: string }> = ({ number, title, subtitle }) => (
  <div className="step1-section-header">
    <div className="step1-section-number">{number}</div>
    <div>
      <h2 className="text-lg font-bold text-[#1E2D5C] leading-tight">{title}</h2>
      <p className="text-xs text-[#78819D] mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ─── Inline Error ───────────────────────────────────────────────────────────
const FieldError: React.FC<{ show?: boolean; message?: string }> = ({ show, message = 'This field is required to continue.' }) =>
  show ? <p className="text-xs text-[#B92814] mt-1.5 flex items-center gap-1"><ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />{message}</p> : null;

// ─── Verification badge ─────────────────────────────────────────────────────
const VerificationStatusIndicator: React.FC<{ status: 'idle' | 'verifying' | 'verified' | 'mismatch' }> = ({ status }) => {
  if (status === 'idle') return null;
  const map = {
    verifying: { icon: <SpinnerIcon className="text-brand-400" />, text: 'Verifying...', cls: 'bg-[#F6F7F9]' },
    verified:  { icon: <CheckCircleIcon className="text-[#139B23]" />, text: 'Verified', cls: 'bg-[#E1F7E4] border border-[#ADDEB4]' },
    mismatch:  { icon: <ExclamationCircleIcon className="text-[#B92814]" />, text: 'Mismatch Found', cls: 'bg-[#FFF0EE] border border-[#B92814]/30' },
  };
  const { icon, text, cls } = map[status];
  return (
    <div className={`absolute right-3 top-3 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-[#1E2D5C] ${cls}`}>
      {icon}{text}
    </div>
  );
};

// ─── Currency Input ─────────────────────────────────────────────────────────
interface CurrencyInputProps {
  name: 'purchasePrice';
  value: string;
  onChange: (name: 'purchasePrice', value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  requiredHighlight?: boolean;
}
const CurrencyInput: React.FC<CurrencyInputProps> = ({ name, value, onChange, placeholder, className, id, disabled, requiredHighlight }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value ? formatCurrencyForDisplay(value) : '');

  useEffect(() => {
    if (!isFocused) setDisplayValue(value ? formatCurrencyForDisplay(value) : '');
    else setDisplayValue(parseCurrencyForStorage(value));
  }, [value, isFocused]);

  return (
    <input
      id={id}
      type={isFocused ? 'number' : 'text'}
      inputMode="numeric"
      name={name}
      value={displayValue}
      onChange={(e) => { setDisplayValue(e.target.value); onChange(name, parseCurrencyForStorage(e.target.value)); }}
      onFocus={() => { setIsFocused(true); setDisplayValue(parseCurrencyForStorage(value)); }}
      onBlur={() => { setIsFocused(false); setDisplayValue(value ? formatCurrencyForDisplay(value) : ''); }}
      placeholder={placeholder}
      className={`form-input-premium w-full font-bold text-lg ${requiredHighlight ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''} ${className || ''}`}
      step={isFocused ? '1' : undefined}
      aria-label="Purchase Price"
      disabled={disabled}
    />
  );
};

// ─── Visual Selector ────────────────────────────────────────────────────────
const VisualSelector: React.FC<{
  title: string; subtitle: string; sectionNumber: string;
  options: (SelectOption & { disabled?: boolean })[];
  selectedValue: string; onSelect: (value: string) => void;
  id?: string; disabled?: boolean; requiredHighlight?: boolean;
  layout?: 'grid' | 'spectrum';
}> = ({ title, subtitle, sectionNumber, options, selectedValue, onSelect, id, disabled, requiredHighlight, layout = 'grid' }) => {

  const getIcon = (option: SelectOption) => {
    // Condition of Property
    if (option.value === 'C-1') return <ConditionC1Icon className="w-12 h-12" />;
    if (option.value === 'C-2') return <ConditionC2Icon className="w-12 h-12" />;
    if (option.value === 'C-3') return <ConditionC3Icon className="w-12 h-12" />;
    if (option.value === 'C-4') return <ConditionC4Icon className="w-12 h-12" />;
    if (option.value === 'C-5') return <ConditionC5Icon className="w-12 h-12" />;
    if (option.value === 'C-6') return <ConditionC6Icon className="w-12 h-12" />;
    // Material Quality
    if (option.value === 'Q1') return <MaterialQ1Icon className="w-12 h-12" />;
    if (option.value === 'Q2') return <MaterialQ2Icon className="w-12 h-12" />;
    if (option.value === 'Q3') return <MaterialQ3Icon className="w-12 h-12" />;
    if (option.value === 'Q4') return <MaterialQ4Icon className="w-12 h-12" />;
    if (option.value === 'Q5') return <MaterialQ5Icon className="w-12 h-12" />;
    if (option.value === 'Q6') return <MaterialQ6Icon className="w-12 h-12" />;
    // Rehab Classification
    const l = option.label.toLowerCase();
    if (l.includes('new construction')) return <TractorIcon className="w-12 h-12" />;
    if (l.includes('heavy')) return <RehabHeavyIcon className="w-12 h-12" />;
    if (l.includes('standard')) return <RehabStandardIcon className="w-12 h-12" />;
    if (l.includes('light') || l.includes('cosmetic')) return <RehabLightIcon className="w-12 h-12" />;
    return <HomeModernIcon className="w-12 h-12" />;
  };

  // Derive top-border accent color from option colorClass
  const getAccentColor = (colorClass: string | undefined): string => {
    if (!colorClass) return 'rgba(100,116,139,0.6)';
    if (colorClass.includes('green-700') || colorClass.includes('green-500')) return 'rgba(34,197,94,0.8)';
    if (colorClass.includes('green')) return 'rgba(74,222,128,0.8)';
    if (colorClass.includes('yellow')) return 'rgba(234,179,8,0.8)';
    if (colorClass.includes('orange')) return 'rgba(249,115,22,0.8)';
    if (colorClass.includes('red-700')) return 'rgba(220,38,38,0.9)';
    if (colorClass.includes('red')) return 'rgba(239,68,68,0.8)';
    if (colorClass.includes('teal')) return 'rgba(20,184,166,0.8)';
    if (colorClass.includes('blue')) return 'rgba(59,130,246,0.8)';
    if (colorClass.includes('purple-700')) return 'rgba(126,34,206,0.9)';
    if (colorClass.includes('purple')) return 'rgba(168,85,247,0.8)';
    return 'rgba(6,147,227,0.8)';
  };

  return (
    <div id={id} className={`section-container overflow-hidden ${requiredHighlight ? 'border-[#B92814]/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''}`}>
      <div className="p-5 border-b border-[#DFE1E5] bg-white">
        <SectionHeader number={sectionNumber} title={title} subtitle={subtitle} />
        {requiredHighlight && (
          <p className="text-xs text-[#B92814] mt-2 flex items-center gap-1.5 ml-10">
            <ExclamationCircleIcon className="w-3.5 h-3.5" /> Please make a selection to continue.
          </p>
        )}
      </div>
      <div className={`p-5 ${layout === 'spectrum' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          const isOptDisabled = disabled || opt.disabled;
          const accentColor = getAccentColor(opt.colorClass);

          return (
            <button
              key={opt.value}
              onClick={() => !isOptDisabled && onSelect(opt.value)}
              disabled={isOptDisabled}
              aria-pressed={isSelected}
              aria-label={`Select ${opt.label}`}
              className={`vs-card relative flex flex-col items-center p-4 rounded-xl text-center transition-all duration-200 min-h-[160px]
                ${isSelected
                  ? 'border-brand-500 bg-[#ECF0FF] vs-card-selected scale-[1.02]'
                  : 'border-[#DFE1E5] bg-white hover:border-brand-200 hover:bg-brand-50/50'}
                ${isOptDisabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
              style={{
                '--accent-color': accentColor,
                border: isSelected ? '3px solid #1C39D8' : undefined,
                boxShadow: isSelected ? '0 0 0 4px rgba(28,57,216,0.15)' : undefined,
              } as React.CSSProperties}
            >
              {/* Colored top-border accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-opacity duration-200"
                style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)`, opacity: isSelected ? 1 : 0.4 }} />

              {/* Selected check badge — absolute top-right */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center vs-check-badge" style={{ boxShadow: '0 2px 8px rgba(28,57,216,0.4)' }}>
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon — centered */}
              <div className={`p-3 rounded-xl transition-all duration-200 mb-3 ${isSelected ? 'bg-brand-100' : 'bg-[#F4F5F7]'}`}
                style={isSelected ? { boxShadow: `0 0 16px ${accentColor}40` } : {}}>
                <div className={`transition-colors duration-200 ${isSelected ? 'text-brand-500' : 'text-[#78819D]'}`}>
                  {getIcon(opt)}
                </div>
              </div>
              <h4 className={`font-bold text-sm leading-tight mb-1 transition-colors ${isSelected ? 'text-[#1E2D5C]' : 'text-[#1E2D5C]'}`}>{opt.label}</h4>
              <p className="text-xs text-[#78819D] leading-relaxed line-clamp-3">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Smart Hints Panel ──────────────────────────────────────────────────────
const SmartHintsPanel: React.FC<{
  projectTypeMode?: ProjectTypeMode | null;
  propertyDetails: PropertyDetails;
  selectedRehabType: string;
}> = ({ projectTypeMode, propertyDetails, selectedRehabType }) => {
  const hasAddress = Boolean(propertyDetails.street);
  const hasPrice = Boolean(propertyDetails.purchasePrice);
  const isNC = projectTypeMode === 'new_construction';

  const hints = useMemo(() => {
    const list: { icon: string; text: string; active?: boolean }[] = [];
    if (isNC) {
      list.push({ icon: '🏗️', text: 'Enter the land purchase price — not the projected build value.', active: !hasPrice });
      list.push({ icon: '📐', text: 'Projected square footage drives all AI cost estimates for new builds.' });
      list.push({ icon: '📋', text: 'You\'ll need entitlement status to proceed — check with your title company.' });
    } else {
      list.push({ icon: '💰', text: 'Use your contract purchase price, including any seller concessions.', active: !hasPrice });
      list.push({ icon: '📊', text: 'Accurate As-Is sqft enables our AI to benchmark against comparable rehabs.' });
      if (selectedRehabType === 'Heavy') {
        list.push({ icon: '⚠️', text: 'Heavy rehab loans have stricter ARV requirements. Be precise on projected sqft.' });
      } else {
        list.push({ icon: '🏠', text: 'Cosmetic flips typically target C-3 or C-4 condition properties.' });
      }
    }
    return list;
  }, [isNC, hasPrice, selectedRehabType]);

  return (
    <div className="h-full w-full rounded-xl border border-[#DFE1E5] bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#DFE1E5] bg-[#F6F7F9] flex items-center gap-2">
        <InfoIcon className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <span className="text-xs font-bold text-[#78819D] uppercase tracking-wider">Project Hints</span>
      </div>
      {/* Live summary if address entered */}
      {hasAddress && (
        <div className="px-4 py-3 border-b border-[#DFE1E5] bg-brand-50">
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1E2D5C]">{propertyDetails.street}</p>
              {(propertyDetails.city || propertyDetails.state) && (
                <p className="text-[11px] text-[#78819D]">{[propertyDetails.city, propertyDetails.state, propertyDetails.zip].filter(Boolean).join(', ')}</p>
              )}
            </div>
          </div>
          {hasPrice && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#78819D] uppercase tracking-wider">Purchase Price</span>
              <span className="text-sm font-black text-brand-500">{formatCurrencyForDisplay(propertyDetails.purchasePrice)}</span>
            </div>
          )}
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 border border-brand-200 text-brand-500">
              {isNC ? 'New Construction' : 'Renovation / Value Add'}
            </span>
          </div>
        </div>
      )}
      {/* Hints list */}
      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
        {hints.map((h, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-all ${h.active ? 'bg-brand-50 border border-brand-200' : ''}`}>
            <span className="text-base flex-shrink-0 leading-none mt-0.5">{h.icon}</span>
            <p className="text-xs text-[#78819D] leading-relaxed">{h.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Form ──────────────────────────────────────────────────────────────
export const Step1Form: React.FC<Step1FormProps> = ({
  propertyDetails, landDetails, asIsProjectedData,
  selectedCondition, selectedRehabType, selectedMaterialQuality,
  projectQuestions, verificationStatus, isLocked,
  scrollToFieldId, onScrollComplete, onPropertyDetailChange,
  onLandDetailsChange, onAsIsProjectedChange,
  onSelectedConditionChange, onSelectedRehabTypeChange,
  onSelectedMaterialQualityChange, onProjectQuestionChange,
  highlightMissingFields, projectTypeMode,
}) => {
  const asIsProjectedKeys = Object.keys(asIsProjectedData) as Array<keyof AsIsProjectedData>;
  const projectedUnitCount = parseInt(asIsProjectedData.unitCount?.projected || '0', 10) || 0;
  const asIsUnitCount = parseInt(asIsProjectedData.unitCount?.asIs || '0', 10) || 0;
  const isNewConstructionMode = projectTypeMode === 'new_construction' || selectedRehabType === 'New Construction';

  // Count completed required fields for within-step progress
  const requiredFields = [propertyDetails.street, propertyDetails.city, propertyDetails.state, propertyDetails.zip, propertyDetails.purchasePrice];
  const completedRequired = requiredFields.filter(Boolean).length;
  const totalRequired = requiredFields.length;

  // Structural changes detection
  const hasStructuralChanges = useMemo(() => {
    const keys: (keyof AsIsProjectedData)[] = ['totalBuildingSqFeet', 'bedroomCount', 'bathroomCount', 'unitCount', 'floorsAboveBasement'];
    return keys.some(k => {
      const item = asIsProjectedData[k] as AsIsProjectedItem;
      if (!item) return false;
      const a = (item.asIs || '').toString().trim();
      const p = (item.projected || '').toString().trim();
      return a && p && a !== p;
    });
  }, [asIsProjectedData]);

  // Filtered rehab options
  const rehabOptions = useMemo(() => {
    const base = TYPES_OF_REHAB.filter(o => {
      if (projectTypeMode === 'new_construction') return o.value === 'New Construction';
      if (projectTypeMode === 'renovation') return o.value !== 'New Construction';
      return true;
    });
    return base.map(o =>
      o.value === 'Light-Cosmetic' && hasStructuralChanges
        ? { ...o, disabled: true, description: 'Unavailable: layout or room-count changes require Standard or Heavy.' }
        : o
    );
  }, [projectTypeMode, hasStructuralChanges]);

  const getInputError = (value: string | number | undefined) => highlightMissingFields && !value;

  useEffect(() => {
    if (!scrollToFieldId) return;
    const mapId = (fieldId: string) => {
      if (fieldId.startsWith('propertyDetails.')) {
        const f = fieldId.split('.')[1];
        return f === 'purchasePrice' ? 'step1-price-input' : `step1-${f}-input`;
      }
      return null;
    };
    const el = document.getElementById(mapId(scrollToFieldId) || '');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
    onScrollComplete();
  }, [scrollToFieldId, onScrollComplete]);

  return (
    <div className="step1-root space-y-6">

      {/* ── Step Hero ───────────────────────────────────────────────────── */}
      <div className="step1-hero">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-50 border border-brand-200 text-brand-500">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                {isNewConstructionMode ? 'New Construction' : 'Renovation / Value Add'}
              </span>
              <span className="text-xs text-[#78819D]">·</span>
              <span className="text-xs text-[#78819D] font-medium">Step 1 of 4</span>
            </div>
            <h1 className="text-2xl font-black text-[#1E2D5C] tracking-tight">Property Details</h1>
            <p className="text-sm text-[#78819D] mt-1 max-w-xl">
              Tell us about the property. This shapes your budget categories, line items, and AI estimates.
            </p>
          </div>
          {/* Within-step completion ring */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#DFE1E5" strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1C39D8" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - completedRequired / totalRequired)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#1E2D5C]">{completedRequired}/{totalRequired}</span>
            </div>
            <span className="text-[10px] text-[#78819D] font-medium">complete</span>
          </div>
        </div>
      </div>

      {/* ── ① Property Information ──────────────────────────────────────── */}
      <div id="property-address-section" className="section-container overflow-hidden">
        <div className="p-5 border-b border-[#DFE1E5] bg-white">
          <SectionHeader number="①" title="Property Information" subtitle="Location & purchase price for the subject property" />
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Address Form */}
            <div className="lg:col-span-2 bg-[#F6F7F9] p-5 rounded-xl border border-[#DFE1E5] relative">
              <VerificationStatusIndicator status={verificationStatus} />
              <div className="space-y-4">
                <div>
                  <label htmlFor="step1-street-input" className="step1-label">Street Address <span className="text-[#B92814]">*</span></label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78819D] pointer-events-none" />
                    <input
                      id="step1-street-input"
                      type="text" name="street"
                      value={propertyDetails.street}
                      onChange={e => onPropertyDetailChange('street', e.target.value)}
                      placeholder="123 Main St"
                      autoComplete="street-address"
                      className={`form-input-premium w-full pl-10 ${getInputError(propertyDetails.street) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                      disabled={isLocked}
                    />
                  </div>
                  <FieldError show={getInputError(propertyDetails.street)} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="step1-city-input" className="step1-label">City <span className="text-[#B92814]">*</span></label>
                    <input
                      id="step1-city-input" type="text" name="city"
                      value={propertyDetails.city}
                      onChange={e => onPropertyDetailChange('city', e.target.value)}
                      placeholder="City"
                      autoComplete="address-level2"
                      className={`form-input-premium w-full ${getInputError(propertyDetails.city) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                      disabled={isLocked}
                    />
                    <FieldError show={getInputError(propertyDetails.city)} />
                  </div>
                  <div>
                    <label htmlFor="step1-state-input" className="step1-label">State <span className="text-[#B92814]">*</span></label>
                    <input
                      id="step1-state-input" type="text" name="state"
                      value={propertyDetails.state}
                      onChange={e => onPropertyDetailChange('state', e.target.value)}
                      placeholder="ST"
                      autoComplete="address-level1"
                      maxLength={2}
                      className={`form-input-premium w-full uppercase ${getInputError(propertyDetails.state) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                      disabled={isLocked}
                    />
                    <FieldError show={getInputError(propertyDetails.state)} />
                  </div>
                  <div>
                    <label htmlFor="step1-zip-input" className="step1-label">Zip <span className="text-[#B92814]">*</span></label>
                    <input
                      id="step1-zip-input" type="text" name="zip"
                      inputMode="numeric"
                      value={propertyDetails.zip}
                      onChange={e => onPropertyDetailChange('zip', e.target.value)}
                      placeholder="12345"
                      autoComplete="postal-code"
                      className={`form-input-premium w-full ${getInputError(propertyDetails.zip) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                      disabled={isLocked}
                    />
                    <FieldError show={getInputError(propertyDetails.zip)} />
                  </div>
                </div>

                <div>
                  <label htmlFor="step1-price-input" className="step1-label">
                    Purchase Price <span className="text-[#B92814]">*</span>
                    <span className="ml-2 text-[10px] font-normal text-[#78819D]">— Contract price including concessions</span>
                  </label>
                  <CurrencyInput
                    id="step1-price-input"
                    name="purchasePrice"
                    value={propertyDetails.purchasePrice}
                    onChange={onPropertyDetailChange as (name: 'purchasePrice', value: string) => void}
                    placeholder="$0"
                    disabled={isLocked}
                    requiredHighlight={getInputError(propertyDetails.purchasePrice)}
                  />
                  <FieldError show={getInputError(propertyDetails.purchasePrice)} message="Purchase price is required to calculate budget ratios." />
                </div>
              </div>
            </div>

            {/* Right: Smart Hints Panel */}
            <div className="lg:col-span-1 min-h-[260px]">
              <SmartHintsPanel
                projectTypeMode={projectTypeMode}
                propertyDetails={propertyDetails}
                selectedRehabType={selectedRehabType}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── ② Land Details (New Construction only) ──────────────────────── */}
      {isNewConstructionMode && landDetails && onLandDetailsChange && (
        <div id="land-details-section" className="section-container overflow-hidden">
          <div className="p-5 border-b border-[#DFE1E5] bg-white">
            <SectionHeader number="②" title="Land Information" subtitle="Lot details, zoning, and entitlement status" />
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="step1-label">Lot Size <span className="text-[#B92814]">*</span></label>
              <input
                type="text"
                value={landDetails.lotSize}
                onChange={e => onLandDetailsChange('lotSize', e.target.value)}
                placeholder="e.g. 0.5 Acres or 5,000 sqft"
                className={`form-input-premium w-full ${getInputError(landDetails.lotSize) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                disabled={isLocked}
              />
              <FieldError show={getInputError(landDetails.lotSize)} />
            </div>
            <div>
              <label className="step1-label">Current Zoning <span className="text-[#B92814]">*</span></label>
              <input
                type="text"
                value={landDetails.zoning}
                onChange={e => onLandDetailsChange('zoning', e.target.value)}
                placeholder="e.g. Residential, R-1"
                className={`form-input-premium w-full ${getInputError(landDetails.zoning) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                disabled={isLocked}
              />
              <FieldError show={getInputError(landDetails.zoning)} />
            </div>
            <div>
              <label className="step1-label">Land Status <span className="text-[#B92814]">*</span></label>
              <select
                value={landDetails.entitlementStatus}
                onChange={e => onLandDetailsChange('entitlementStatus', e.target.value)}
                className={`form-input-premium w-full ${getInputError(landDetails.entitlementStatus) ? 'border-[#B92814] ring-1 ring-[#B92814] bg-[#FFF0EE]' : ''}`}
                disabled={isLocked}
              >
                <option value="">Select status...</option>
                {ENTITLEMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FieldError show={getInputError(landDetails.entitlementStatus)} />
            </div>
          </div>
        </div>
      )}

      {/* ── ③ Property Specifications Table ─────────────────────────────── */}
      <div id="property-info-table-section" className="section-container overflow-hidden">
        <div className="p-5 border-b border-[#DFE1E5] bg-white">
          <SectionHeader
            number={isNewConstructionMode && landDetails ? '③' : '②'}
            title={isNewConstructionMode ? 'Proposed Build Specifications' : 'Property Specifications'}
            subtitle={isNewConstructionMode ? 'Target metrics for the completed structure' : 'Current As-Is condition vs. projected after-repair values'}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#DFE1E5] bg-[#F6F7F9]">
                <th className="px-5 py-3 text-left text-xs font-bold text-[#78819D] uppercase tracking-wider w-1/3">Specification</th>
                {!isNewConstructionMode && (
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider w-1/3">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#BCBFC7] inline-block" />
                      <span className="text-[#78819D]">Current (As-Is)</span>
                    </div>
                  </th>
                )}
                <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider w-1/3">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
                    <span className="text-brand-500">{isNewConstructionMode ? 'Proposed Value' : 'Target (After Repair)'}</span>
                  </div>
                </th>
                {!isNewConstructionMode && (
                  <th className="px-5 py-3 text-center text-xs font-bold text-[#78819D] uppercase tracking-wider w-20">Delta</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1E5]">
              {asIsProjectedKeys.map((key, idx) => {
                const fieldData = asIsProjectedData[key];
                if (!fieldData) return null;
                const isPerUnit = key === 'bedroomCountPerUnit' || key === 'bathroomCountPerUnit';
                if (isPerUnit && Math.max(asIsUnitCount, projectedUnitCount) <= 1) return null;

                // Delta calculation for simple fields
                const simpleField = fieldData as AsIsProjectedItem;
                const asIsNum = parseFloat(simpleField.asIs || '');
                const projNum = parseFloat(simpleField.projected || '');
                const delta = !isNaN(asIsNum) && !isNaN(projNum) ? projNum - asIsNum : null;

                return (
                  <tr key={key} className={`transition-colors hover:bg-[#F7F9FC] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F6F7F9]'}`}>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1E2D5C] whitespace-nowrap">
                      {fieldData.label}
                    </td>

                    {/* As-Is column — conditional render, no jank */}
                    {!isNewConstructionMode && (
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isPerUnit ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {Array.from({ length: Math.min(asIsUnitCount, 4) }).map((_, i) => {
                              const pd = fieldData as AsIsProjectedPerUnitItem;
                              return (
                                <input key={i} type="number"
                                  value={pd.asIs?.[i] ?? ''}
                                  onChange={e => onAsIsProjectedChange(key, 'asIs', e.target.value, i)}
                                  className="specs-input w-14 text-center"
                                  placeholder={`U${i+1}`} disabled={isLocked}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <input type="text"
                              value={simpleField.asIs || ''}
                              onChange={e => onAsIsProjectedChange(key, 'asIs', e.target.value)}
                              className="specs-input w-28 text-center text-[#78819D]"
                              placeholder="--" disabled={isLocked}
                            />
                          </div>
                        )}
                      </td>
                    )}

                    {/* Projected column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isPerUnit ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {Array.from({ length: Math.min(projectedUnitCount, 4) }).map((_, i) => {
                            const pd = fieldData as AsIsProjectedPerUnitItem;
                            return (
                              <input key={i} type="number"
                                value={pd.projected?.[i] ?? ''}
                                onChange={e => onAsIsProjectedChange(key, 'projected', e.target.value, i)}
                                className="specs-input specs-input-projected w-14 text-center"
                                placeholder={`U${i+1}`} disabled={isLocked}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <input type="text"
                            value={simpleField.projected || ''}
                            onChange={e => onAsIsProjectedChange(key, 'projected', e.target.value)}
                            className="specs-input specs-input-projected w-28 text-center font-bold"
                            placeholder="Target" disabled={isLocked}
                          />
                        </div>
                      )}
                    </td>

                    {/* Delta column */}
                    {!isNewConstructionMode && (
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {delta !== null ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${delta > 0 ? 'text-[#139B23] bg-[#E1F7E4]' : delta < 0 ? 'text-[#B92814] bg-[#FFF0EE]' : 'text-[#78819D] bg-[#F6F7F9]'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        ) : (
                          <span className="text-[#BCBFC7] text-xs">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#DFE1E5] bg-[#F6F7F9] flex items-center gap-2 text-xs text-[#78819D]">
          <InfoIcon className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
          Accurate square footage is the most important field — it directly drives AI cost estimates.
        </div>
      </div>

      {/* ── Rehab Type ──────────────────────────────────────────────────── */}
      <VisualSelector
        id="type-of-rehab-section"
        sectionNumber={isNewConstructionMode && landDetails ? '④' : '③'}
        title="Rehab Classification"
        subtitle="Required — determines which budget line items are included"
        options={rehabOptions}
        selectedValue={selectedRehabType}
        onSelect={onSelectedRehabTypeChange}
        disabled={isLocked}
        requiredHighlight={highlightMissingFields && !selectedRehabType}
      />

      {/* ── Condition (Renovation only) ──────────────────────────────────── */}
      {!isNewConstructionMode && (
        <VisualSelector
          id="condition-of-property-section"
          sectionNumber="④"
          title="Condition of Property"
          subtitle="Required — current state of the subject property (C-1 = best, C-6 = worst)"
          options={CONDITIONS_OF_PROPERTY}
          selectedValue={selectedCondition}
          onSelect={onSelectedConditionChange}
          disabled={isLocked}
          requiredHighlight={highlightMissingFields && !selectedCondition}
        />
      )}

      {/* ── Material Quality ─────────────────────────────────────────────── */}
      <VisualSelector
        id="material-quality-section"
        sectionNumber={isNewConstructionMode ? '⑤' : '⑤'}
        title="Material Quality"
        subtitle="Required — target finish level, from Luxury (Q1) to Substandard (Q6)"
        options={MATERIAL_QUALITIES}
        selectedValue={selectedMaterialQuality}
        onSelect={onSelectedMaterialQualityChange}
        disabled={isLocked}
        requiredHighlight={highlightMissingFields && !selectedMaterialQuality}
      />
    </div>
  );
};
