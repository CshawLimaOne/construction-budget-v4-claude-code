import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, WarningTriangleIcon, InfoIcon, CalculatorIcon, XCircleIcon, FlagIcon, SpinnerIcon, CheckIcon, CalculatorIcon as LogicIcon, CameraIcon } from './Icons';
import { Dashboard, DealGradeWidget } from './Dashboard';
import { SelectOption, RiskAnalysisResult, RiskAdjustments, FeasibilityData, AsIsProjectedData, BudgetCategoryData, ProjectDocument, PropertyDetails, RecommendationType, DealGrade, RiskFactor, GeneralContractor, MarketMetrics } from '../types';
import Tooltip from './Tooltip';
import { RiskGauge } from './RiskGauge';
import { LAST_MILE_OPTIONS, CONDITION_OPTIONS, CONTINGENCY_ITEM_ID } from '../constants';
import { GradingLogicModal } from './GradingLogicModal';
import { ValidatorLogicModal } from './ValidatorLogicModal';
import { ScopeAuditModal } from './ScopeAuditModal';
import { ShowToastFn } from './Toast';

// --- Mock Data Definitions ---

const firstTimeBorrowerData = {
  isRepeat: false as const,
  // No historical data implies no arrays or stats
};

const repeatBorrowerData = {
  isRepeat: true as const,
  metrics: {
    loansApplied: 12,
    loansApproved: 8,
    riskScore: 15, // 0-100
    delinquency: {
        late30: 0,
        late60: 0,
        late90: 0,
        pastMaturity: 0
    },
    portfolio: [
        { type: 'FNF', count: 5, avgAmount: 1474773 },
        { type: 'NC', count: 2, avgAmount: 183430 },
        { type: 'MF', count: 1, avgAmount: 1976287 },
        { type: 'BP', count: 0, avgAmount: 0 },
        { type: 'R30', count: 0, avgAmount: 0 },
    ]
  },
  constructionPerformance: [
      { type: 'FNF', rehabFunded: 0, rehabDrawn: 0, percentDrawn: 0, avgDaysToFirstDraw: 0, avgDrawPercent: 0, avgDrawAmount: 0, avgHistoricalCompletionDays: 0, avgProjectedCompletionDays: 0, avgDaysSinceCompletion: 0, avgDaysToSell: 0, isEmpty: true },
      { type: 'NC', rehabFunded: 55296724, rehabDrawn: 50046078, percentDrawn: 91, avgDaysToFirstDraw: 41, avgDrawPercent: 17, avgDrawAmount: 54514, avgHistoricalCompletionDays: 167, avgProjectedCompletionDays: 268, avgDaysSinceCompletion: 91, avgDaysToSell: 89, isEmpty: false },
  ],
  constructionReviews: [
    { loanNumber: '120198', cmAnalyst: 'Unassigned', reviewedDate: '3/27/2023', projectQuality: 'Null', areaOfConcern: 'Null', issues: 'Null', estimatedCompleteDate: 'Null', estimatedCompletePercent: 0, nextSteps: 'Null', notes: 'Both in permitting phase, should have next week' },
    { loanNumber: '120207', cmAnalyst: 'Unassigned', reviewedDate: '3/27/2023', projectQuality: 'Null', areaOfConcern: 'Null', issues: 'Null', estimatedCompleteDate: 'Null', estimatedCompletePercent: 0, nextSteps: 'Null', notes: 'Both in permitting phase, should have next week' },
    { loanNumber: '124582', cmAnalyst: 'Jake Pettit', reviewedDate: '8/28/2023', projectQuality: 'Null', areaOfConcern: 'Null', issues: 'Null', estimatedCompleteDate: 'Null', estimatedCompletePercent: 0, nextSteps: 'Null', notes: '' },
  ],
};

// Market Data
interface MarketData {
  reviewed: number;
  funded: number;
  fixAndFlip: number;
  newConstruction: number;
  avgBudgetFF: number;
  avgBudgetNC: number;
  delinquency: number;
  avgRoi: number;
  avgDaysToPayoff: number;
}

interface ReportGcData {
    isRepeat: boolean;
    name: string;
    buildzoomUrl?: string;
    performance?: {
        projectsWithUs: number;
        onTimePercentage: string;
    };
}

const marketDataByRadius: Record<number, MarketData> = {
  5: { reviewed: 42, funded: 31, fixAndFlip: 25, newConstruction: 6, avgBudgetFF: 85250, avgBudgetNC: 210500, delinquency: 2.1, avgRoi: 18.5, avgDaysToPayoff: 192 },
  15: { reviewed: 112, funded: 89, fixAndFlip: 70, newConstruction: 19, avgBudgetFF: 81500, avgBudgetNC: 235000, delinquency: 2.8, avgRoi: 17.1, avgDaysToPayoff: 210 },
  30: { reviewed: 280, funded: 210, fixAndFlip: 175, newConstruction: 35, avgBudgetFF: 79000, avgBudgetNC: 245000, delinquency: 3.5, avgRoi: 16.0, avgDaysToPayoff: 225 },
  50: { reviewed: 510, funded: 380, fixAndFlip: 290, newConstruction: 90, avgBudgetFF: 75000, avgBudgetNC: 255000, delinquency: 4.2, avgRoi: 15.1, avgDaysToPayoff: 235 },
};

// --- Helpers ---
const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
};

const interpolate = (val1: number, val2: number, r1: number, r2: number, r: number) => {
    if (r1 === r2) return val1;
    const weight = (r - r1) / (r2 - r1);
    return val1 + (val2 - val1) * weight;
};

const getMarketDataForRadius = (radius: number): MarketData => {
    const availableRadii = Object.keys(marketDataByRadius).map(Number).sort((a, b) => a - b);
    
    if (radius <= availableRadii[0]) return marketDataByRadius[availableRadii[0]];
    if (radius >= availableRadii[availableRadii.length - 1]) return marketDataByRadius[availableRadii[availableRadii.length - 1]];

    let lowerRadius = availableRadii[0];
    let upperRadius = availableRadii[availableRadii.length - 1];

    for (let i = 0; i < availableRadii.length - 1; i++) {
        if (radius >= availableRadii[i] && radius < availableRadii[i+1]) {
            lowerRadius = availableRadii[i];
            upperRadius = availableRadii[i+1];
            break;
        }
    }

    const lowerData = marketDataByRadius[lowerRadius];
    const upperData = marketDataByRadius[upperRadius];

    const interpolatedData: Partial<MarketData> = {};
    for (const key in lowerData) {
        if (Object.prototype.hasOwnProperty.call(lowerData, key)) {
            const typedKey = key as keyof MarketData;
            const interpolatedValue = interpolate(lowerData[typedKey], upperData[typedKey], lowerRadius, upperRadius, radius);
            interpolatedData[typedKey] = interpolatedValue;
        }
    }
    interpolatedData.reviewed = Math.round(interpolatedData.reviewed!);
    interpolatedData.funded = Math.round(interpolatedData.funded!);
    interpolatedData.fixAndFlip = Math.round(interpolatedData.fixAndFlip!);
    interpolatedData.newConstruction = Math.round(interpolatedData.newConstruction!);
    interpolatedData.avgBudgetFF = Math.round(interpolatedData.avgBudgetFF!);
    interpolatedData.avgBudgetNC = Math.round(interpolatedData.avgBudgetNC!);
    interpolatedData.avgDaysToPayoff = Math.round(interpolatedData.avgDaysToPayoff!);

    return interpolatedData as MarketData;
};

// --- Icons ---
const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
    </svg>
);

// --- Sub-Components ---

const ReportCard: React.FC<{ title: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`report-card bg-white rounded-lg shadow-md overflow-hidden border border-[#DFE1E5] ${className} avoid-break`}>
    <div className="bg-[#1E2D5C] text-white font-bold uppercase tracking-wider py-2.5 px-4 flex items-center border-l-4 border-brand-500">
        {title}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const LoanSetupCard: React.FC<{ feasibilityData: FeasibilityData; onChange: (path: string, value: any) => void }> = ({ feasibilityData, onChange }) => {
    return (
        <ReportCard title="Loan Setup & Configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Loan Number</label>
                    <input 
                        type="text" 
                        value={feasibilityData.loanNumber} 
                        onChange={e => onChange('loanNumber', e.target.value)} 
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Borrower Name</label>
                    <input 
                        type="text" 
                        value={feasibilityData.borrowerName} 
                        onChange={e => onChange('borrowerName', e.target.value)} 
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Processed By</label>
                    <input 
                        type="text" 
                        value={feasibilityData.processedBy} 
                        onChange={e => onChange('processedBy', e.target.value)} 
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Approved By</label>
                    <input 
                        type="text" 
                        value={feasibilityData.approvedBy} 
                        onChange={e => onChange('approvedBy', e.target.value)} 
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                 <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Tier Reviewed</label>
                    <select 
                        value={feasibilityData.tierReviewed} 
                        onChange={e => onChange('tierReviewed', e.target.value)}
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    >
                        <option value="1">Tier 1</option>
                        <option value="2">Tier 2</option>
                        <option value="3">Tier 3</option>
                        <option value="4">Tier 4</option>
                        <option value="5">Tier 5</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Approval Date</label>
                    <input 
                        type="date" 
                        value={feasibilityData.approvalDate} 
                        onChange={e => onChange('approvalDate', e.target.value)} 
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    />
                </div>
                <div className="flex items-end pb-2">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={feasibilityData.strategicAccount} 
                            onChange={e => onChange('strategicAccount', e.target.checked)}
                            className="mr-2 h-4 w-4 accent-brand-500 rounded border-[#DFE1E5]" 
                        />
                        <span className="text-sm font-medium text-[#1E2D5C]">Strategic Account</span>
                    </label>
                </div>
                 <div className="flex items-end pb-2">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={feasibilityData.isRepeatBorrower} 
                            onChange={e => onChange('isRepeatBorrower', e.target.checked)}
                            className="mr-2 h-4 w-4 accent-brand-500 rounded border-[#DFE1E5]" 
                        />
                        <span className="text-sm font-medium text-[#1E2D5C]">Repeat Borrower</span>
                    </label>
                </div>
            </div>
        </ReportCard>
    );
};

const MarketHealthCard: React.FC<{ 
    marketMetrics: MarketMetrics; 
    onChange: (field: keyof MarketMetrics, value: any) => void; 
}> = ({ marketMetrics, onChange }) => {
    return (
        <ReportCard title="Market Health Configuration">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Market Sentiment (Price Trend)</label>
                    <select 
                        value={marketMetrics.priceTrend} 
                        onChange={(e) => onChange('priceTrend', e.target.value)}
                        className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                    >
                        <option value="Rapidly Appreciating">Rapidly Appreciating (Hot)</option>
                        <option value="Stable">Stable</option>
                        <option value="Softening">Softening</option>
                        <option value="Declining">Declining</option>
                        <option value="Crash">Crash</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">90-Day Delinquency %</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.1"
                                value={marketMetrics.delinquency90Day} 
                                onChange={(e) => onChange('delinquency90Day', parseFloat(e.target.value))}
                                className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                            />
                            <span className="absolute right-3 top-1.5 text-[#78819D] text-sm">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Months Supply</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.1"
                                value={marketMetrics.monthsSupply} 
                                onChange={(e) => onChange('monthsSupply', parseFloat(e.target.value))}
                                className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                            />
                            <span className="absolute right-3 top-1.5 text-[#78819D] text-sm">mos</span>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#78819D] uppercase mb-1">Avg Days on Market</label>
                        <input 
                            type="number" 
                            value={marketMetrics.avgDaysOnMarket} 
                            onChange={(e) => onChange('avgDaysOnMarket', parseFloat(e.target.value))}
                            className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none !text-[#1E2D5C]"
                        />
                    </div>
                     <div className="flex items-end pb-2">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={marketMetrics.femaDisasterZone} 
                                onChange={e => onChange('femaDisasterZone', e.target.checked)}
                                className="mr-2 h-4 w-4 text-red-600 rounded border-slate-300 focus:ring-red-500" 
                            />
                            <span className="text-sm font-medium text-[#1E2D5C]">FEMA Disaster Zone?</span>
                        </label>
                    </div>
                </div>
            </div>
        </ReportCard>
    );
};

// --- Decision Console ---
const DecisionConsole: React.FC<{
    riskAnalysis: RiskAnalysisResult;
    feasibilityData: FeasibilityData;
    onChange: (path: string, value: any) => void;
    dealGrade: DealGrade;
}> = ({ riskAnalysis, feasibilityData, onChange, dealGrade }) => {
    
    // Determine if high risk deal is being approved
    const isHighRisk = ['C', 'D', 'F'].includes(dealGrade.grade);
    const isApprovingHighRisk = isHighRisk && feasibilityData.recommendation === 'Recommended';
    
    // Style for the mitigating factors box based on risk context
    const mitigantsBoxStyle = isApprovingHighRisk
        ? "border-red-500 ring-1 ring-red-500 bg-[#FFF0EE]"
        : "border-[#DFE1E5] bg-[#F6F7F9]";

    const getRecommendationStyle = (rec: RecommendationType) => {
        switch(rec) {
            case 'Recommended': return '!text-green-600 bg-green-50 border-green-200';
            case 'Recommended with Conditions': return '!text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Not Recommended': return '!text-red-600 bg-red-50 border-red-200';
            default: return '!text-[#78819D] bg-[#F6F7F9] border-[#DFE1E5]';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-[#DFE1E5] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Center: Mitigating Factors - Expanded to 3/4 width */}
                <div className="lg:w-3/4 flex flex-col border-b lg:border-b-0 lg:border-r border-[#DFE1E5] pb-4 lg:pb-0 lg:pr-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-[#78819D] uppercase">Mitigating Factors / Analysis</label>
                        {isApprovingHighRisk && (
                            <span className="text-xs font-bold text-red-600 animate-pulse">Required for {dealGrade.grade} Grade Approval</span>
                        )}
                    </div>
                    <textarea 
                        value={feasibilityData.mitigatingFactors} 
                        onChange={e => onChange('mitigatingFactors', e.target.value)}
                        className={`w-full flex-grow min-h-[120px] p-3 text-sm rounded focus:bg-white focus:border-brand-500 outline-none resize-none transition-colors !text-[#1E2D5C] ${mitigantsBoxStyle}`}
                        placeholder="Enter analysis or mitigating factors here..."
                    />
                </div>

                {/* Right: Decision & Conditions - Kept at 1/4 width */}
                <div className="lg:w-1/4 flex flex-col pt-4 lg:pt-0 lg:pl-4">
                    <h4 className="text-xs font-bold text-[#78819D] uppercase tracking-wider mb-2">Final Recommendation</h4>
                    
                    <select 
                        value={feasibilityData.recommendation} 
                        onChange={e => onChange('recommendation', e.target.value)}
                        className={`w-full text-sm font-bold py-2 px-3 rounded border cursor-pointer outline-none focus:ring-2 focus:ring-brand-500 transition-colors mb-3 ${getRecommendationStyle(feasibilityData.recommendation)}`}
                    >
                        <option value="">Select Action...</option>
                        <option value="Recommended">Recommended</option>
                        <option value="Recommended with Conditions">Rec. w/ Conditions</option>
                        <option value="Not Recommended">Not Recommended</option>
                    </select>

                    <div className="bg-[#F6F7F9] p-2 rounded text-xs text-[#78819D] italic">
                        {feasibilityData.recommendation === 'Recommended with Conditions' 
                            ? "Review conditions in the Closing Conditions card below."
                            : "Select decision to finalize."}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Unified Sponsorship Strength Card ---
const SponsorshipStrengthCard: React.FC<{ 
    feasibilityData: FeasibilityData;
    borrowerData: typeof firstTimeBorrowerData | typeof repeatBorrowerData;
    gcData: ReportGcData;
    onChange: (path: string, value: any) => void;
}> = ({ feasibilityData, borrowerData, gcData, onChange }) => {
    
    // Logic: Split entirely between New vs Repeat
    const isRepeat = borrowerData.isRepeat;

    return (
        <ReportCard title="Sponsorship Strength" className="col-span-1 lg:col-span-2">
            
            {/* Top Bar: Borrower vs GC Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b border-[#DFE1E5] pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-[#1E2D5C]">Borrower Profile</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isRepeat ? 'bg-[#E1F7E4] text-[#139B23] border border-[#ADDEB4]' : 'bg-brand-50 text-brand-500 border border-brand-200'}`}>
                            {isRepeat ? 'Repeat Borrower' : 'New Borrower'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between md:border-l md:border-[#DFE1E5] md:pl-4">
                    <div>
                        <h4 className="font-bold text-[#1E2D5C]">General Contractor</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#78819D] truncate max-w-[150px]">{gcData.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${gcData.isRepeat ? 'bg-[#E1F7E4] text-[#139B23] border border-[#ADDEB4]' : 'bg-[#F6F7F9] text-[#78819D] border border-[#DFE1E5]'}`}>
                                {gcData.isRepeat ? 'Repeat GC' : 'New GC'}
                            </span>
                        </div>
                    </div>
                    {gcData.buildzoomUrl && (
                        <a href={gcData.buildzoomUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline flex items-center">
                            <InfoIcon className="w-3 h-3 mr-1" /> Profile
                        </a>
                    )}
                </div>
            </div>

            {/* Condition 1: First Time Borrower (New) */}
            {!isRepeat && (
                <div className="rounded-xl border border-dashed border-[#DFE1E5] bg-[#F6F7F9] overflow-hidden">
                    <div className="px-6 py-8 text-center">
                        {/* Icon */}
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center">
                            <InfoIcon className="w-7 h-7 text-brand-500" />
                        </div>
                        <h3 className="text-base font-bold text-[#1E2D5C] mb-1">First-Time Borrower</h3>
                        <p className="text-sm text-[#78819D] mb-6 max-w-md mx-auto leading-relaxed">
                            No prior loan history found in the system for this borrower. Performance metrics will populate here automatically once Snowflake integration is live.
                        </p>
                        {/* What to expect */}
                        <div className="text-left max-w-sm mx-auto bg-white rounded-xl border border-[#DFE1E5] p-4 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#78819D] mb-3">What you'll see for repeat borrowers</p>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Loan Activity', desc: 'Total applied vs. approved — approval rate at a glance' },
                                    { label: 'Delinquency History', desc: '30 / 60 / 90-day late & past maturity counts' },
                                    { label: 'Portfolio Breakdown', desc: 'Fix & Flip, New Construction, Multifamily averages' },
                                    { label: 'Construction Reviews', desc: 'Past CM analyst notes, draw rates & completion data' },
                                ].map(({ label, desc }) => (
                                    <div key={label} className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <span className="text-xs font-semibold text-[#1E2D5C]">{label}</span>
                                            <span className="text-xs text-[#78819D] ml-1">— {desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#DFE1E5] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#EAA800] flex-shrink-0" />
                                <p className="text-[10px] text-[#78819D] italic">Underwrite conservatively — no track record to offset project risk.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Condition 2: Repeat Borrower (Complex Dashboard) */}
            {isRepeat && 'metrics' in borrowerData && (
                <div className="space-y-6">
                    
                    {/* Snowflake data indicator */}
                    <div className="flex items-center gap-2 pb-1 border-b border-[#DFE1E5]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#78819D]">Historical Performance</span>
                        <SnowflakeBadge />
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-brand-50 rounded border border-brand-200">
                            <div className="text-[10px] uppercase font-bold text-[#78819D]">Loan Activity</div>
                            <div className="flex justify-between items-baseline mt-1">
                                <div><span className="text-xl font-bold text-[#1E2D5C]">{borrowerData.metrics.loansApplied}</span> <span className="text-xs">Applied</span></div>
                                <div><span className="text-xl font-bold text-[#139B23]">{borrowerData.metrics.loansApproved}</span> <span className="text-xs">Approved</span></div>
                            </div>
                        </div>
                        <div className="p-3 bg-[#F6F7F9] rounded border border-[#DFE1E5]">
                            <div className="text-[10px] uppercase font-bold text-[#78819D]">Borrower Risk Score</div>
                            <div className="flex items-center mt-1">
                                <span className={`text-2xl font-black ${borrowerData.metrics.riskScore < 20 ? 'text-[#139B23]' : 'text-[#EAA800]'}`}>
                                    {borrowerData.metrics.riskScore}
                                </span>
                                <span className="text-xs ml-2 text-[#78819D]">/ 100 (Lower is Better)</span>
                            </div>
                        </div>
                        <div className="p-3 bg-[#F6F7F9] rounded border border-[#DFE1E5] col-span-2">
                            <div className="text-[10px] uppercase font-bold text-[#78819D] mb-2">Loan Performance (Delinquency)</div>
                            <div className="flex justify-between text-xs text-center">
                                <div><div className="font-bold text-[#1E2D5C]">{borrowerData.metrics.delinquency.late30}</div><div className="text-[10px] text-[#78819D]">30 Days</div></div>
                                <div><div className="font-bold text-[#1E2D5C]">{borrowerData.metrics.delinquency.late60}</div><div className="text-[10px] text-[#78819D]">60 Days</div></div>
                                <div><div className="font-bold text-[#1E2D5C]">{borrowerData.metrics.delinquency.late90}</div><div className="text-[10px] text-[#78819D]">90 Days</div></div>
                                <div><div className={`font-bold ${borrowerData.metrics.delinquency.pastMaturity > 0 ? 'text-[#B92814]' : 'text-[#1E2D5C]'}`}>{borrowerData.metrics.delinquency.pastMaturity}</div><div className="text-[10px] text-[#78819D]">Past Maturity</div></div>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Chips */}
                    <div>
                        <div className="text-[10px] uppercase font-bold text-[#78819D] mb-2">Portfolio Breakdown</div>
                        <div className="flex flex-wrap gap-2">
                            {borrowerData.metrics.portfolio.map((p, i) => (
                                <div key={i} className={`flex items-center px-3 py-1.5 rounded border text-xs ${p.count > 0 ? 'bg-white border-[#DFE1E5]' : 'bg-[#F6F7F9] border-[#DFE1E5] opacity-50'}`}>
                                    <span className="font-bold text-[#1E2D5C] mr-2">{p.type}</span>
                                    <span className="bg-[#F4F5F7] px-1.5 rounded text-[10px] mr-2">{p.count}</span>
                                    <span className="text-[#78819D]">{p.avgAmount > 0 ? formatCurrencyCompact(p.avgAmount) : '-'} avg</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Construction Performance Table */}
                    <div>
                        <div className="bg-[#1E2D5C] text-white p-2.5 text-sm font-bold rounded-t-md border-l-4 border-brand-500 flex items-center gap-2">
                            Construction Performance<SnowflakeBadge />
                        </div>
                        <div className="overflow-x-auto border border-[#DFE1E5] rounded-b-md">
                            <table className="min-w-full text-xs text-right">
                                <thead className="bg-[#F4F5F7] text-[#78819D] font-semibold border-b border-[#DFE1E5]">
                                    <tr>
                                        <th className="p-2 text-left bg-white sticky left-0 z-10 border-r border-[#DFE1E5]">Type</th>
                                        <th className="p-2 whitespace-nowrap">Rehab Funded</th>
                                        <th className="p-2 whitespace-nowrap">Rehab Drawn</th>
                                        <th className="p-2 whitespace-nowrap">% Drawn</th>
                                        <th className="p-2 whitespace-nowrap">Avg Days to First Draw</th>
                                        <th className="p-2 whitespace-nowrap">Avg Draw %</th>
                                        <th className="p-2 whitespace-nowrap">Avg Draw Amount</th>
                                        <th className="p-2 whitespace-nowrap">Avg Hist. Comp Days</th>
                                        <th className="p-2 whitespace-nowrap">Avg Proj. Comp Days</th>
                                        <th className="p-2 whitespace-nowrap">Avg Days Since Comp</th>
                                        <th className="p-2 whitespace-nowrap">Avg Days to Sell</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#DFE1E5]">
                                    {borrowerData.constructionPerformance.map((row, idx) => (
                                        <tr key={idx} className={row.isEmpty ? 'h-8' : 'hover:bg-[#F7F9FC]'}>
                                            <td className="p-2 text-left font-bold border-r border-[#DFE1E5] bg-white sticky left-0 z-10">{row.type}</td>
                                            {row.isEmpty ? (
                                                <td colSpan={10}></td>
                                            ) : (
                                                <>
                                                    <td className="p-2">{formatCurrency(row.rehabFunded)}</td>
                                                    <td className="p-2">{formatCurrency(row.rehabDrawn)}</td>
                                                    <td className="p-2">{row.percentDrawn}%</td>
                                                    <td className="p-2">{row.avgDaysToFirstDraw}</td>
                                                    <td className="p-2">{row.avgDrawPercent}%</td>
                                                    <td className="p-2">{formatCurrency(row.avgDrawAmount)}</td>
                                                    <td className="p-2">{row.avgHistoricalCompletionDays || '-'}</td>
                                                    <td className="p-2">{row.avgProjectedCompletionDays || '-'}</td>
                                                    <td className="p-2">{row.avgDaysSinceCompletion || '-'}</td>
                                                    <td className="p-2">{row.avgDaysToSell || '-'}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Construction Reviews Table */}
                    <div>
                        <div className="bg-[#1E2D5C] text-white p-2.5 text-sm font-bold rounded-t-md border-l-4 border-brand-500 flex items-center gap-2">
                            Construction Reviews<SnowflakeBadge />
                        </div>
                        <div className="overflow-x-auto border border-[#DFE1E5] rounded-b-md">
                            <table className="min-w-full text-xs text-left">
                                <thead className="bg-[#F4F5F7] text-[#78819D] font-semibold border-b border-[#DFE1E5]">
                                    <tr>
                                        <th className="p-2 whitespace-nowrap">Loan Number</th>
                                        <th className="p-2 whitespace-nowrap">CM Analyst</th>
                                        <th className="p-2 whitespace-nowrap">Reviewed Date</th>
                                        <th className="p-2 whitespace-nowrap">Project Quality</th>
                                        <th className="p-2 whitespace-nowrap">Area of Concern</th>
                                        <th className="p-2 whitespace-nowrap">Issues</th>
                                        <th className="p-2 whitespace-nowrap">Est Complete Date</th>
                                        <th className="p-2 whitespace-nowrap">Est Complete %</th>
                                        <th className="p-2 whitespace-nowrap">Next Steps</th>
                                        <th className="p-2 min-w-[200px]">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#DFE1E5]">
                                    {borrowerData.constructionReviews.map((row, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr className="hover:bg-[#F7F9FC]">
                                                <td className="p-2 font-bold">{row.loanNumber}</td>
                                                <td className="p-2 text-[#78819D]">{row.cmAnalyst}</td>
                                                <td className="p-2 text-[#78819D]">{row.reviewedDate}</td>
                                                <td className="p-2 text-[#78819D]">{row.projectQuality}</td>
                                                <td className="p-2 text-[#78819D]">{row.areaOfConcern}</td>
                                                <td className="p-2 text-[#78819D]">{row.issues}</td>
                                                <td className="p-2 text-[#78819D]">{row.estimatedCompleteDate}</td>
                                                <td className="p-2 text-[#78819D]">{row.estimatedCompletePercent}%</td>
                                                <td className="p-2 text-[#78819D]">{row.nextSteps}</td>
                                                <td className="p-2 text-[#1E2D5C] italic border-l border-[#DFE1E5]">{row.notes}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </ReportCard>
    );
};

// --- Updated Sticky Header (Cleaned) ---
const StickyActionHeader: React.FC<{
    propertyDetails: PropertyDetails;
    feasibilityData: FeasibilityData;
    onChange: (path: string, value: any) => void;
    dealGrade: DealGrade;
    riskAnalysis: RiskAnalysisResult;
    selectedRehabTypeValue: string;
    onSave: () => void;
    saveStatus: 'idle' | 'saving' | 'saved';
    marketMetrics: MarketMetrics;
    onOpenGradingLogic: () => void; // Added Prop
    onOpenScopeAudit: () => void; // Added Prop
}> = ({ propertyDetails, feasibilityData, dealGrade, riskAnalysis, selectedRehabTypeValue, onSave, saveStatus, marketMetrics, onOpenGradingLogic, onOpenScopeAudit }) => {
    const [showRiskInfo, setShowRiskInfo] = useState(false);

    // Derived Market Status Logic
    const getMarketStatusConfig = (trend: string) => {
        switch (trend) {
            case 'Rapidly Appreciating': return { icon: '🔥', label: 'Hot Market', color: 'bg-[#E1F7E4] text-[#139B23] border-[#ADDEB4]' };
            case 'Stable': return { icon: '⚖️', label: 'Stable Market', color: 'bg-brand-50 text-brand-500 border-brand-200' };
            case 'Softening': return { icon: '☁️', label: 'Cooling', color: 'bg-[#FFF5DB] text-[#EAA800] border-[#EDDDB1]' };
            case 'Declining': return { icon: '📉', label: 'Declining', color: 'bg-[#FFF0EE] text-[#B92814] border-red-200' };
            case 'Crash': return { icon: '💥', label: 'Crash Mode', color: 'bg-red-600 text-white border-red-700' };
            default: return { icon: '❓', label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const marketStatus = getMarketStatusConfig(marketMetrics.priceTrend);
    const isNewConstruction = selectedRehabTypeValue === 'New Construction';

    return (
        <div className="sticky top-0 z-30 bg-white border-b border-[#DFE1E5] shadow-md px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
            {/* Left: Identity */}
            <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-[#1E2D5C] truncate leading-tight">
                    {propertyDetails.street || "Property Address"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#78819D]">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-brand-500">{feasibilityData.borrowerName || "Borrower Name"}</span>
                        <span className="text-[#DFE1E5]">|</span>
                        <span>Loan #{feasibilityData.loanNumber || "Pending"}</span>
                        <span className="text-[#DFE1E5]">|</span>
                        <span className="bg-[#F4F5F7] px-1.5 py-0.5 rounded text-[#78819D]">{selectedRehabTypeValue || "Rehab Type"}</span>
                    </div>
                    {/* Critical Metadata Chips */}
                    <div className="flex items-center space-x-2 ml-1">
                        {feasibilityData.strategicAccount && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-200">
                                Strategic
                            </span>
                        )}
                        {feasibilityData.isRepeatBorrower && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#E1F7E4] text-[#139B23] border border-[#ADDEB4]">
                                Repeat Borrower
                            </span>
                        )}
                        {/* Market Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center ${marketStatus.color}`}>
                            <span className="mr-1">{marketStatus.icon}</span> {marketStatus.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Center: Gut Check Metrics */}
            <div className="flex items-center space-x-6 flex-shrink-0">
                <div className="h-full">
                    <DealGradeWidget dealGrade={dealGrade} variant="header" />
                </div>
                
                {/* Logic Explanation Button */}
                <button
                    onClick={onOpenGradingLogic}
                    className="flex flex-col items-center justify-center p-2 rounded hover:bg-[#F7F9FC] transition-colors group"
                    aria-label="View Logic Methodology"
                >
                    <LogicIcon className="w-5 h-5 text-[#78819D] group-hover:text-brand-500 transition-colors" />
                    <span className="text-[10px] font-semibold text-[#78819D] group-hover:text-brand-500 mt-0.5 uppercase tracking-wide">
                        Logic
                    </span>
                </button>

                {/* Modified Risk Section with Interactive Popover */}
                <div className="relative flex flex-col items-center">
                    <button 
                        onClick={() => setShowRiskInfo(!showRiskInfo)}
                        className="flex items-center space-x-1 mb-0.5 group focus:outline-none"
                    >
                        <span className="text-[10px] uppercase text-[#78819D] font-bold tracking-wider group-hover:text-brand-500 transition-colors">Risk Score</span>
                        <InfoIcon className="text-[#DFE1E5] group-hover:text-brand-500 w-3 h-3 transition-colors" />
                    </button>
                    <RiskGauge score={riskAnalysis.score} size="sm" showLabel={false} showLegend={true} />

                    {/* Risk Info Popover */}
                    {showRiskInfo && (
                        <>
                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowRiskInfo(false)}></div>
                            <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-xl border border-[#DFE1E5] z-50 p-4 animate-in fade-in zoom-in-95 duration-200 text-left">
                                <div className="flex justify-between items-start mb-3 border-b border-[#DFE1E5] pb-2">
                                    <div>
                                        <h4 className="font-bold text-[#1E2D5C]">Risk Assessment</h4>
                                        <span className={`text-xs font-bold ${riskAnalysis.level === 'Critical' || riskAnalysis.level === 'High' ? 'text-[#B92814]' : 'text-[#78819D]'}`}>
                                            Level: {riskAnalysis.level}
                                        </span>
                                    </div>
                                    <button onClick={() => setShowRiskInfo(false)} className="text-[#78819D] hover:text-[#1E2D5C]"><span className="sr-only">Close</span>×</button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-[#78819D]">
                                        Score calculated based on weighted risk factors triggered by the budget data.
                                    </p>
                                    {riskAnalysis.factors.length > 0 ? (
                                        <ul className="list-disc pl-4 text-xs text-[#1E2D5C] space-y-1">
                                            {riskAnalysis.factors.map((f, i) => (
                                                <li key={i}>{f.message}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-2 bg-[#E1F7E4] text-[#139B23] text-xs rounded border border-[#ADDEB4]">
                                            No active risk factors detected.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3 flex-shrink-0">
                {!isNewConstruction && (
                    <button
                        onClick={onOpenScopeAudit}
                        className="rounded-full text-sm py-1.5 px-4 shadow-sm h-fit bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 font-semibold"
                        title="Run AI Scope Audit against photos"
                    >
                        <CameraIcon className="w-4 h-4 mr-2" />
                        AI Audit
                    </button>
                )}
                <button
                    onClick={onSave}
                    disabled={saveStatus !== 'idle'}
                    className={`rounded-full text-sm py-1.5 px-4 shadow-sm h-fit min-w-[100px] flex items-center justify-center transition-all duration-200 font-semibold
                        ${saveStatus === 'saved'
                            ? 'bg-[#139B23] hover:bg-green-700 text-white'
                            : 'bg-brand-500 hover:bg-brand-600 text-white'
                        }`}
                >
                    {saveStatus === 'saving' && <SpinnerIcon className="w-4 h-4 mr-2" />}
                    {saveStatus === 'saved' && <CheckIcon className="w-4 h-4 mr-2" />}
                    {saveStatus === 'idle' ? 'Save' : (saveStatus === 'saving' ? 'Saving...' : 'Saved!')}
                </button>
            </div>
        </div>
    );
};

// --- Development Info Card (Renamed/Split from ClosingConditions) ---
const DevelopmentInfoCard: React.FC<{ feasibilityData: FeasibilityData; onChange: (path: string, value: any) => void }> = ({ feasibilityData, onChange }) => {
    return (
        <ReportCard title="Development Info" className="mb-6">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#78819D] uppercase">Larger Development Info:</h4>
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={feasibilityData.developmentInfo.isPartOfLargerDevelopment} 
                        onChange={e => onChange('developmentInfo.isPartOfLargerDevelopment', e.target.checked)}
                        className="mr-2 h-4 w-4 accent-brand-500 rounded border-[#DFE1E5]" 
                    />
                    <span className="text-xs font-medium text-[#1E2D5C]">Is part of larger dev?</span>
                </label>
            </div>
            
            {feasibilityData.developmentInfo.isPartOfLargerDevelopment && (
                <div className="bg-[#F6F7F9] p-3 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#DFE1E5]">
                    <div>
                        <label className="block text-xs font-medium text-[#78819D] mb-1">Total Phases</label>
                        <input type="text" value={feasibilityData.developmentInfo.totalPhases} onChange={e => onChange('developmentInfo.totalPhases', e.target.value)} className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1 !text-[#1E2D5C]" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[#78819D] mb-1">Planned Homesites</label>
                        <input type="text" value={feasibilityData.developmentInfo.plannedHomesites} onChange={e => onChange('developmentInfo.plannedHomesites', e.target.value)} className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1 !text-[#1E2D5C]" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[#78819D] mb-1">Sold/Under Contract</label>
                        <input type="text" value={feasibilityData.developmentInfo.soldOrUnderContract} onChange={e => onChange('developmentInfo.developmentInfo.soldOrUnderContract', e.target.value)} className="w-full text-sm border border-[#DFE1E5] rounded px-2 py-1 !text-[#1E2D5C]" />
                    </div>
                </div>
            )}
        </ReportCard>
    );
};

const ClosingConditionsCard: React.FC<{ feasibilityData: FeasibilityData; onChange: (path: string, value: any) => void }> = ({ feasibilityData, onChange }) => {
    
    const handleConditionToggle = (condition: string) => {
        const currentConditions = feasibilityData.conditions || [];
        const newConditions = currentConditions.includes(condition)
            ? currentConditions.filter(c => c !== condition)
            : [...currentConditions, condition];
        onChange('conditions', newConditions);
    };

    return (
        <ReportCard title="Closing Conditions & Requirements">
            <div className="space-y-4 divide-y divide-[#DFE1E5]">
                
                {/* 1. Standard Conditions */}
                <div>
                    <h5 className="text-[10px] font-bold text-[#78819D] uppercase mb-2">Standard Conditions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {CONDITION_OPTIONS.map((option) => (
                            <label key={option} className="flex items-center p-2 border border-[#DFE1E5] rounded hover:bg-[#F7F9FC] cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={(feasibilityData.conditions || []).includes(option)} 
                                    onChange={() => handleConditionToggle(option)}
                                    className="h-4 w-4 accent-[#0693e3] border-gray-300 rounded"
                                />
                                <span className="ml-2 text-xs font-medium text-[#1E2D5C]">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 2. Required Before First Draw */}
                <div className="pt-4">
                    <h5 className="text-[10px] font-bold text-[#78819D] uppercase mb-2">Required Before First Draw</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={feasibilityData.requiredBeforeDraw.plans} onChange={e => onChange('requiredBeforeDraw.plans', e.target.checked)} className="h-4 w-4 accent-brand-500 rounded" />
                            <span className="text-xs text-[#1E2D5C]">Plans</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={feasibilityData.requiredBeforeDraw.permits} onChange={e => onChange('requiredBeforeDraw.permits', e.target.checked)} className="h-4 w-4 accent-brand-500 rounded" />
                            <span className="text-xs text-[#1E2D5C]">Permits</span>
                        </label>
                        <div className="flex flex-col">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={feasibilityData.requiredBeforeDraw.other} onChange={e => onChange('requiredBeforeDraw.other', e.target.checked)} className="h-4 w-4 accent-brand-500 rounded" />
                                <span className="text-xs text-[#1E2D5C]">Other</span>
                            </label>
                            {feasibilityData.requiredBeforeDraw.other && (
                                <input 
                                    type="text" 
                                    value={feasibilityData.requiredBeforeDraw.otherDescription} 
                                    onChange={e => onChange('requiredBeforeDraw.otherDescription', e.target.value)} 
                                    className="mt-1 w-full border-b border-[#DFE1E5] text-xs py-1 placeholder-[#78819D] bg-transparent !text-[#1E2D5C]" 
                                    placeholder="Specify..." 
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. HOA Status */}
                <div className="pt-4">
                    <h5 className="text-[10px] font-bold text-[#78819D] uppercase mb-2">HOA Status</h5>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={feasibilityData.hoa.required} onChange={e => onChange('hoa.required', e.target.checked)} className="h-4 w-4 accent-brand-500 rounded" />
                            <span className="text-xs text-[#1E2D5C]">HOA Approval Required?</span>
                        </label>
                        {feasibilityData.hoa.required && (
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={feasibilityData.hoa.approved} onChange={e => onChange('hoa.approved', e.target.checked)} className="h-4 w-4 text-green-600 rounded" />
                                <span className="text-xs font-bold text-[#139B23]">Approved?</span>
                            </label>
                        )}
                    </div>
                </div>
            </div>
        </ReportCard>
    );
};

// --- New Component: Visual Delta Row ---
const VisualDeltaRow: React.FC<{ label: string; asIs: string; projected: string; unit?: string }> = ({ label, asIs, projected, unit = '' }) => {
    const isNum = (val: string) => !isNaN(parseFloat(val));
    const valAsIs = isNum(asIs) ? parseFloat(asIs) : asIs;
    const valProj = isNum(projected) ? parseFloat(projected) : projected;
    
    // Check if values exist and differ
    const hasChanged = asIs !== projected && (asIs !== '' || projected !== '');
    
    let percentChange = null;
    let diff = 0;
    
    if (hasChanged && typeof valAsIs === 'number' && typeof valProj === 'number' && valAsIs !== 0) {
        diff = valProj - valAsIs;
        percentChange = ((diff / valAsIs) * 100).toFixed(1);
    }

    if (!hasChanged) {
        return (
            <div className="flex justify-between items-center py-2 px-3 border-b border-[#DFE1E5] last:border-0 opacity-50 transition-opacity hover:opacity-100">
                <span className="text-xs font-medium text-[#78819D]">{label}</span>
                <span className="text-xs font-mono text-[#78819D]">{asIs || '-'} {unit}</span>
            </div>
        );
    }

    return (
        <div className="py-2 px-3 border-b border-brand-200 bg-brand-50 last:border-0 rounded-sm">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-brand-500">{label}</span>
                {percentChange && (
                    <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${diff > 0 ? 'bg-brand-500' : 'bg-[#B92814]'}`}>
                        {diff > 0 ? '+' : ''}{percentChange}%
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[#78819D]">{asIs || '0'}</span>
                <div className="flex-grow mx-2 h-px bg-brand-200 relative">
                    <div className="absolute right-0 -top-1.5 text-brand-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                    </div>
                </div>
                <span className="font-mono font-bold text-brand-500">{projected} {unit}</span>
            </div>
        </div>
    );
};

// --- Updated Budget Notes Table (Visual Status + Delta View) ---
const BudgetNotesTable: React.FC<{ 
    asIsProjectedData: AsIsProjectedData; 
    projectDocuments: ProjectDocument[]; 
    feasibilityData: FeasibilityData; 
    onChange: (path: string, value: any) => void;
    selectedRehabType: string;
}> = ({ asIsProjectedData, projectDocuments, feasibilityData, onChange, selectedRehabType }) => {
    
    let layoutType = 'FnF';
    if (selectedRehabType === 'Heavy') layoutType = 'HighRisk';
    if (selectedRehabType === 'New Construction') layoutType = 'NewConstruction';

    const hasPlansUpload = projectDocuments.some(doc => doc.type.includes('Plan') || doc.type === 'Site Plan');
    const hasPermitUpload = projectDocuments.some(doc => doc.type === 'Permit');

    useEffect(() => {
        // Only auto-set if currently "No" to allow manual overrides to "N/A" etc
        if (hasPlansUpload && feasibilityData.budgetNotes.plansProvided === 'No') {
            onChange('budgetNotes.plansProvided', 'Yes (Uploaded)');
        }
        if (hasPermitUpload && feasibilityData.budgetNotes.permitsProvided === 'No') {
            onChange('budgetNotes.permitsProvided', 'Yes (Uploaded)');
        }
    }, [hasPlansUpload, hasPermitUpload]);

    // Traffic Light Logic
    const toggleStatus = (current: string) => {
        const sequence = ['Pending', 'Pass', 'Fail'];
        const yesNoSequence = ['Yes', 'No', 'Partial'];
        
        // Check if it's a Yes/No type field or Pass/Fail type
        if (current === 'Yes' || current === 'No' || current === 'Partial') {
             const nextIndex = (yesNoSequence.indexOf(current) + 1) % yesNoSequence.length;
             return yesNoSequence[nextIndex];
        }
        // Default sequence
        const idx = sequence.indexOf(current);
        const nextIndex = (idx + 1) % sequence.length;
        return sequence[nextIndex];
    };

    const renderTrafficLight = (path: string, value: string) => {
        let icon;
        let styleClass;
        
        if (value === 'Pass' || value === 'Yes') {
            icon = <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            styleClass = "bg-green-50 border-green-200 text-green-700";
        } else if (value === 'Fail' || value === 'No') {
            icon = <XCircleIcon className="w-5 h-5 text-red-600" />;
            styleClass = "bg-red-50 border-red-200 text-red-700";
        } else {
            // Pending, Partial, etc.
            icon = <FlagIcon className="w-5 h-5 text-yellow-500" />; // Using flag for attention
            styleClass = "bg-yellow-50 border-yellow-200 text-yellow-700";
        }

        return (
            <button 
                onClick={() => onChange(path, toggleStatus(value))}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-bold transition-all hover:shadow-sm ${styleClass}`}
            >
                {icon}
                <span>{value}</span>
            </button>
        );
    };

    const renderDocIcon = (path: string, value: string) => {
        // Toggles: No -> Yes (Uploaded) -> Yes (Elsewhere) -> N/A
        const options = ['No', 'Yes (Uploaded)', 'Yes (Elsewhere)', 'N/A'];
        
        const toggle = () => {
            const idx = options.indexOf(value);
            const next = options[(idx + 1) % options.length];
            onChange(path, next);
        };

        const isProvided = value.includes('Yes');
        
        return (
            <button onClick={toggle} className="flex items-center group">
                <div className={`p-1.5 rounded-md border ${isProvided ? 'bg-brand-50 border-brand-200' : 'bg-[#F6F7F9] border-[#DFE1E5] group-hover:bg-[#F7F9FC]'}`}>
                    <FileIcon className={`w-5 h-5 ${isProvided ? 'text-brand-500' : 'text-[#78819D]'}`} />
                </div>
                <span className={`ml-2 text-xs font-medium ${isProvided ? 'text-brand-500' : 'text-[#78819D]'}`}>
                    {value}
                </span>
            </button>
        );
    };

    const renderRow = (label: string, component: React.ReactNode) => (
        <div className="flex justify-between items-center border-b border-[#DFE1E5] py-2 px-3 text-xs last:border-0">
            <div className="font-medium text-[#1E2D5C]">{label}:</div>
            <div className="w-1/2 flex justify-end">{component}</div>
        </div>
    );

    return (
        <div className="border border-[#DFE1E5] bg-white rounded-lg overflow-hidden mb-6 shadow-sm">
            <div className="bg-[#1E2D5C] p-2.5 font-bold text-sm uppercase text-white border-l-4 border-brand-500">
                Budget Notes: {layoutType === 'FnF' ? 'FnF' : layoutType === 'HighRisk' ? 'High Risk' : 'New Construction'}
            </div>
            <div className="flex flex-col md:flex-row">
                {/* Column 1: Dynamic Inputs based on Layout */}
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#DFE1E5] p-0 bg-white">
                    <div className="bg-[#F4F5F7] font-bold text-xs text-[#78819D] py-2 px-3 border-b border-[#DFE1E5] flex justify-between">
                        <span>Item</span>
                        <span>Status</span>
                    </div>
                    
                    {layoutType === 'FnF' && (
                        <>
                            {renderRow('Desktop Review', renderTrafficLight('budgetNotes.desktopReview', feasibilityData.budgetNotes.desktopReview))}
                            {renderRow('SOW Match Budget', renderTrafficLight('budgetNotes.sowMatchBudget', feasibilityData.budgetNotes.sowMatchBudget))}
                            {renderRow('Room Count Change', renderTrafficLight('budgetNotes.roomCountChange', feasibilityData.budgetNotes.roomCountChange))}
                            {renderRow('SQFT Change', renderTrafficLight('budgetNotes.sqftChange', feasibilityData.budgetNotes.sqftChange))}
                        </>
                    )}

                    {layoutType === 'HighRisk' && (
                        <>
                            {renderRow('SOW Match Budget', renderTrafficLight('budgetNotes.sowMatchBudget', feasibilityData.budgetNotes.sowMatchBudget))}
                            {renderRow('Room Count Change', renderTrafficLight('budgetNotes.roomCountChange', feasibilityData.budgetNotes.roomCountChange))}
                            {renderRow('SQFT Change', renderTrafficLight('budgetNotes.sqftChange', feasibilityData.budgetNotes.sqftChange))}
                            {renderRow('Plans Provided', renderDocIcon('budgetNotes.plansProvided', feasibilityData.budgetNotes.plansProvided))}
                            {renderRow('Permits Provided', renderDocIcon('budgetNotes.permitsProvided', feasibilityData.budgetNotes.permitsProvided))}
                        </>
                    )}

                    {layoutType === 'NewConstruction' && (
                        <>
                            {renderRow('Plans Provided', renderDocIcon('budgetNotes.plansProvided', feasibilityData.budgetNotes.plansProvided))}
                            {renderRow('Permits Provided', renderDocIcon('budgetNotes.permitsProvided', feasibilityData.budgetNotes.permitsProvided))}
                            {renderRow('SQFT Verified', renderTrafficLight('budgetNotes.sqftVerified', feasibilityData.budgetNotes.sqftVerified))}
                        </>
                    )}
                </div>

                {/* Column 2 & 3: As-Is vs Projected Visual Diff */}
                <div className="w-full md:w-2/3 flex flex-col bg-white">
                    <div className="bg-[#F4F5F7] font-bold text-xs text-[#78819D] py-2 px-3 border-b border-[#DFE1E5]">
                        Project Scope Changes
                    </div>
                    <div>
                        <VisualDeltaRow 
                            label="Total Sqft" 
                            asIs={(asIsProjectedData.totalBuildingSqFeet as any).asIs} 
                            projected={(asIsProjectedData.totalBuildingSqFeet as any).projected} 
                            unit="sf" 
                        />
                        <VisualDeltaRow 
                            label="Unit Count" 
                            asIs={(asIsProjectedData.unitCount as any).asIs} 
                            projected={(asIsProjectedData.unitCount as any).projected} 
                        />
                        <VisualDeltaRow 
                            label="Bedrooms" 
                            asIs={(asIsProjectedData.bedroomCount as any).asIs} 
                            projected={(asIsProjectedData.bedroomCount as any).projected} 
                        />
                        <VisualDeltaRow 
                            label="Bathrooms" 
                            asIs={(asIsProjectedData.bathroomCount as any).asIs} 
                            projected={(asIsProjectedData.bathroomCount as any).projected} 
                        />
                        <VisualDeltaRow 
                            label="Floors" 
                            asIs={(asIsProjectedData.floorsAboveBasement as any).asIs} 
                            projected={(asIsProjectedData.floorsAboveBasement as any).projected} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConstructionManagementNotes: React.FC<{ budgetData: BudgetCategoryData[]; scopeSummary: any; feasibilityData: FeasibilityData; onChange: (path: string, value: any) => void; totalSqFt: string }> = ({ budgetData, scopeSummary, feasibilityData, onChange, totalSqFt }) => {
    
    // Calculations
    const softCosts = budgetData.find(c => c.name === 'Soft Costs')?.items.reduce((acc, item) => acc + item.budget, 0) || 0;
    
    let contingencyAmount = 0;
    
    budgetData.forEach(cat => {
        const item = cat.items.find(i => i.id === CONTINGENCY_ITEM_ID);
        if (item) {
            contingencyAmount = item.budget;
        }
    });

    const totalBudget = scopeSummary.borrowerTotal;
    const softCostPercent = totalBudget > 0 ? (softCosts / totalBudget) * 100 : 0;
    const contingencyPercent = totalBudget > 0 ? (contingencyAmount / totalBudget) * 100 : 0;
    const ppsf = parseFloat(totalSqFt) > 0 ? totalBudget / parseFloat(totalSqFt) : 0;

    const renderToggle = (label: string, field: string, value: boolean) => (
        <div className="flex items-center justify-center space-x-2 py-1">
            <span className="text-xs font-medium text-[#78819D]">{label}</span>
            <button
                onClick={() => onChange(field, !value)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${value ? 'bg-brand-500' : 'bg-[#DFE1E5]'}`}
            >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="border border-[#DFE1E5] bg-white rounded-lg overflow-hidden mb-6 shadow-sm">
            <div className="bg-[#1E2D5C] p-2.5 font-bold text-sm uppercase text-white border-l-4 border-brand-500">
                Construction Management Validation
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4 border-b md:border-b-0 md:border-r border-[#DFE1E5] space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-[#1E2D5C]">Soft Costs %</span>
                            <span className={`font-bold ${softCostPercent > 15 ? 'text-red-600' : 'text-green-600'}`}>
                                {softCostPercent.toFixed(1)}% <span className="text-[10px] font-normal text-[#78819D]">({formatCurrency(softCosts)})</span>
                            </span>
                        </div>
                        <div className="w-full bg-[#DFE1E5] rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${softCostPercent > 15 ? 'bg-[#B92814]' : 'bg-brand-500'}`} 
                                style={{ width: `${Math.min(softCostPercent, 100)}%` }}
                            ></div>
                        </div>
                        {softCostPercent > 15 && <p className="text-[10px] text-red-500 mt-0.5">Exceeds 15% threshold</p>}
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-[#1E2D5C]">Contingency %</span>
                            <span className={`font-bold ${contingencyPercent < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                {contingencyPercent.toFixed(1)}% <span className="text-[10px] font-normal text-[#78819D]">({formatCurrency(contingencyAmount)})</span>
                            </span>
                        </div>
                        <div className="w-full bg-[#DFE1E5] rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${contingencyPercent < 5 ? 'bg-[#B92814]' : 'bg-[#139B23]'}`} 
                                style={{ width: `${Math.min(contingencyPercent * 5, 100)}%` }} 
                            ></div>
                        </div>
                        {contingencyPercent < 5 && <p className="text-[10px] text-red-500 mt-0.5">Below 5% recommended</p>}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#DFE1E5]">
                        <span className="text-xs font-bold text-[#1E2D5C]">Dollar Per SqFt:</span>
                        <span className="text-sm font-mono font-bold text-brand-500">{formatCurrency(ppsf)} / sf</span>
                    </div>
                </div>

                <div className="p-4 flex flex-col justify-center space-y-1">
                    <h5 className="text-[10px] uppercase font-bold text-[#78819D] mb-2 text-center">Analyst Actions</h5>
                    {renderToggle('Adjustments Made?', 'cmNotes.adjustmentsToBudget', feasibilityData.cmNotes.adjustmentsToBudget)}
                    {renderToggle('GC Reviewed?', 'cmNotes.gcReviewCompleted', feasibilityData.cmNotes.gcReviewCompleted)}
                    {renderToggle('GC Approved?', 'cmNotes.gcApproved', feasibilityData.cmNotes.gcApproved)}
                    {renderToggle('SQFT Verified?', 'cmNotes.sqftVerified', feasibilityData.cmNotes.sqftVerified)}
                </div>
            </div>
        </div>
    );
}

const AlertsPanel: React.FC<{ riskAnalysis: RiskAnalysisResult }> = ({ riskAnalysis }) => {
    const { factors } = riskAnalysis;
    const [showInfo, setShowInfo] = useState(false);
    const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, boolean>>({});

    const toggleDismiss = (id: string) => {
        setDismissedAlerts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <ReportCard title={
            <div className="flex items-center justify-between w-full">
                <span className="flex-1 text-center">Validation Flags</span>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-white/60 hover:text-white focus:outline-none flex-shrink-0 ml-2"
                    aria-label="Show explanation"
                >
                    <InfoIcon className="w-5 h-5" />
                </button>
            </div>
        }>
            {showInfo && (
                <div className="mb-4 p-3 bg-[#FFF5DB] border border-[#EDDDB1] rounded-md text-xs text-[#1E2D5C] shadow-inner">
                    <strong>Logic Rules Explained:</strong>
                    <p className="mt-1">
                        These flags represent specific violations of Lima One's underwriting guidelines.
                    </p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li><strong>Soft Costs:</strong> Flagged if exceeding 15% (Over-capitalization risk).</li>
                        <li><strong>Contingency:</strong> Flagged if under 5% (Liquidity risk).</li>
                        <li><strong>Structure/Foundation:</strong> Flagged if missing/low based on the Rehab Type.</li>
                    </ul>
                </div>
            )}
            {factors.length === 0 ? (
                <div className="flex items-center justify-center p-4 text-green-600 text-sm"><CheckCircleIcon className="w-6 h-6 mr-2" /><span>No automated flags.</span></div>
            ) : (
                <ul className="space-y-2">
                    {factors.map((item, index) => {
                        const isDismissed = dismissedAlerts[item.id || index];
                        return (
                            <li key={index} className={`p-2 rounded-md border-l-4 transition-all duration-300 ${isDismissed ? 'bg-[#F4F5F7] border-[#BCBFC7] opacity-60' : 'bg-[#FFF5DB] border-[#EAA800]'}`}>
                                <div className="flex items-start justify-between group">
                                    <div className="flex items-start">
                                        <WarningTriangleIcon className={`w-4 h-4 ${isDismissed ? 'text-gray-400' : (item.severity === 'critical' ? 'text-red-600' : 'text-yellow-600')} mr-2 mt-0.5`} />
                                        <div className={`text-xs ${isDismissed ? 'text-[#BCBFC7] line-through' : 'text-[#1E2D5C]'}`}>{item.message}</div>
                                    </div>
                                    <button 
                                        onClick={() => toggleDismiss(item.id || String(index))}
                                        className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${isDismissed ? 'text-[#78819D] border-[#DFE1E5] hover:bg-white' : 'text-brand-500 border-brand-200 hover:bg-brand-50'}`}
                                    >
                                        {isDismissed ? 'Undo' : 'Clear'}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </ReportCard>
    );
};

// Small badge signalling a section will be live-fed from Snowflake
const SnowflakeBadge: React.FC = () => (
    <span className="inline-flex items-center gap-1 bg-[#F4F5F7] text-[#78819D] text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-[#DFE1E5] ml-1.5 select-none">
        ⚡ Snowflake
    </span>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="p-2 bg-[#F6F7F9] rounded-md text-center border border-[#DFE1E5]">
        <div className="text-lg font-bold text-[#1E2D5C]">{value}</div>
        <div className="text-[10px] text-[#78819D] uppercase tracking-wide">{label}</div>
    </div>
);

const PerformanceMetric: React.FC<{ label: string; value: string; isGood: boolean; tooltipText: string }> = ({ label, value, isGood, tooltipText }) => (
    <div className="p-2 bg-[#F6F7F9] rounded-md text-center relative border border-[#DFE1E5]">
        <div className={`text-xl font-bold ${isGood ? 'text-[#139B23]' : 'text-[#B92814]'}`}>{value}</div>
        <div className="text-[10px] text-[#78819D] uppercase tracking-wide mt-1">{label}</div>
    </div>
);

const GeospatialAnalysis = () => {
    const [radius, setRadius] = useState(5);
    const [marketData, setMarketData] = useState<MarketData>(marketDataByRadius[5]);
    useEffect(() => { setMarketData(getMarketDataForRadius(radius)); }, [radius]);
    return (
        <ReportCard title="Geospatial & Market Analysis">
            <div className="flex items-center gap-4 mb-4 screen-only">
                <label className="text-xs font-medium">Radius:</label>
                <input type="range" min="5" max="50" step="1" value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} className="flex-grow h-2 bg-[#DFE1E5] rounded-lg cursor-pointer" />
                <span className="font-bold text-xs w-16 text-center">{radius} mi</span>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-xs text-center mb-2 uppercase text-[#78819D] flex items-center justify-center">
                        Market Snapshot ({radius} mi radius)<SnowflakeBadge />
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                        <StatCard label="Reviewed" value={marketData.reviewed.toString()} />
                        <StatCard label="Funded" value={marketData.funded.toString()} />
                        <StatCard label="Fix&Flip" value={marketData.fixAndFlip.toString()} />
                        <StatCard label="New Const" value={marketData.newConstruction.toString()} />
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-xs text-center mb-2 uppercase text-[#78819D] flex items-center justify-center">
                        Loan Performance<SnowflakeBadge />
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        <PerformanceMetric label="90+ Delinq" value={`${marketData.delinquency.toFixed(1)}%`} isGood={marketData.delinquency < 4.0} tooltipText="" />
                        <PerformanceMetric label="Avg ROI" value={`${marketData.avgRoi.toFixed(1)}%`} isGood={marketData.avgRoi > 15.0} tooltipText="" />
                        <PerformanceMetric label="Days to Payoff" value={marketData.avgDaysToPayoff.toString()} isGood={marketData.avgDaysToPayoff < 230} tooltipText="" />
                    </div>
                </div>
            </div>
        </ReportCard>
    );
};

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
    </svg>
);

const AutomatedDueDiligenceDashboard = () => {
    const checks = [
        {
            label: 'GIS Ownership',
            status: 'Match',
            statusVariant: 'pass' as const,
            note: 'Ownership verified against county records',
            url: 'https://www.arcgis.com/home/index.html',
            urlLabel: 'Open GIS',
        },
        {
            label: 'Lien Search',
            status: 'Clear',
            statusVariant: 'pass' as const,
            note: 'No active liens found on property',
            url: 'https://www.datatree.com/',
            urlLabel: 'Lien Report',
        },
        {
            label: 'Permit Portal',
            status: 'Open Permit Found',
            statusVariant: 'fail' as const,
            note: 'Review open permit before funding',
            url: 'https://www.citizenserve.com/',
            urlLabel: 'View Permits',
        },
        {
            label: 'Flood Zone',
            status: 'Zone X',
            statusVariant: 'info' as const,
            note: 'Minimal flood hazard — standard coverage',
            url: 'https://msc.fema.gov/portal/home',
            urlLabel: 'FEMA Map',
        },
    ];

    const variantStyles = {
        pass: {
            row: 'border-[#ADDEB4] bg-[#E1F7E4]',
            dot: 'bg-[#139B23]',
            badge: 'bg-[#E1F7E4] text-[#139B23] border border-[#ADDEB4]',
            btn: 'bg-white border-[#DFE1E5] text-brand-500 hover:bg-brand-500 hover:text-white hover:border-brand-500',
        },
        fail: {
            row: 'border-red-200 bg-[#FFF0EE]',
            dot: 'bg-[#B92814] animate-pulse',
            badge: 'bg-[#FFF0EE] text-[#B92814] border border-red-200',
            btn: 'bg-white border-[#DFE1E5] text-[#B92814] hover:bg-[#B92814] hover:text-white hover:border-[#B92814]',
        },
        info: {
            row: 'border-[#DFE1E5] bg-[#F6F7F9]',
            dot: 'bg-[#78819D]',
            badge: 'bg-[#F4F5F7] text-[#78819D] border border-[#DFE1E5]',
            btn: 'bg-white border-[#DFE1E5] text-brand-500 hover:bg-brand-500 hover:text-white hover:border-brand-500',
        },
    };

    return (
        <ReportCard title="Property Due Diligence">
            <div className="space-y-2">
                {checks.map((check) => {
                    const s = variantStyles[check.statusVariant];
                    return (
                        <div key={check.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${s.row}`}>
                            {/* Status dot */}
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />

                            {/* Label + note */}
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-[#1E2D5C]">{check.label}</span>
                                <span className="text-[10px] text-[#78819D] ml-1.5">— {check.note}</span>
                            </div>

                            {/* Status badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${s.badge}`}>
                                {check.status}
                            </span>

                            {/* Action button */}
                            <a
                                href={check.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 flex-shrink-0 ${s.btn}`}
                            >
                                {check.urlLabel}
                                <ExternalLinkIcon className="w-3 h-3" />
                            </a>
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] text-[#78819D] mt-3 italic">
                ⚡ Links will auto-populate with property address data when Snowflake integration is live.
            </p>
        </ReportCard>
    );
};

const VisualVerification = () => {
    const items = [
        { name: "Kitchen Remodel", cost: "$25,000", image: "https://picsum.photos/id/1060/400/300", findings: "VISUAL DISCREPANCY: Pictures show missing drywall...", status: 'flag', annotation: { top: '35%', left: '45%', width: '30%', height: '40%' } },
        { name: "Roof Replacement", cost: "$15,000", image: "https://picsum.photos/id/155/400/300", findings: "VERIFIED: Images confirm significant wear...", status: 'ok', annotation: null },
    ];
    return (
        <ReportCard title="AI-Assisted Visual Verification" className="w-full">
            <div className="visual-verification-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                    <div key={item.name} className="space-y-2 border p-2 rounded-md avoid-break">
                        <div className="flex justify-between text-sm font-bold"><span>{item.name}</span><span>{item.cost}</span></div>
                        <div className="relative h-48 w-full bg-[#F4F5F7]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                            {item.annotation && <div className="absolute border-2 border-red-500" style={item.annotation}></div>}
                        </div>
                        <div className={`p-2 text-xs rounded ${item.status === 'flag' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                            <strong>AI Findings:</strong> {item.findings}
                        </div>
                    </div>
                ))}
            </div>
        </ReportCard>
    );
};

const SmartBudgetValidator: React.FC<{ 
    riskAnalysis: RiskAnalysisResult, 
    borrowerTotal: number, 
    riskAdjustments: RiskAdjustments, 
    onRiskAdjustmentChange: (key: keyof RiskAdjustments, value: boolean) => void,
    manualBaseRateOverride?: number,
    onManualBaseRateChange: (value: number) => void,
    onOpenLogic: () => void;
}> = ({ 
    riskAnalysis, 
    borrowerTotal, 
    riskAdjustments, 
    onRiskAdjustmentChange,
    manualBaseRateOverride,
    onManualBaseRateChange,
    onOpenLogic
}) => {
    const { targetBudget, calculationBreakdown } = riskAnalysis;
    const [showMath, setShowMath] = useState(false);
    const maxVal = Math.max(borrowerTotal, targetBudget || 0) * 1.2;
    const actualWidth = maxVal > 0 ? (borrowerTotal / maxVal) * 100 : 0;
    const targetWidth = maxVal > 0 && targetBudget ? (targetBudget / maxVal) * 100 : 0;
    
    const isOverridden = calculationBreakdown?.isOverridden;

    return (
        <ReportCard title={
            <div className="flex items-center justify-between w-full">
                <span className="flex-1 text-center">Smart Budget Validator v3.0</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onOpenLogic(); }}
                    className="flex items-center gap-1 text-white/60 hover:text-white transition-colors group flex-shrink-0 ml-2"
                    aria-label="View Validator Logic"
                >
                    <LogicIcon className="w-4 h-4 group-hover:text-white transition-colors" />
                    <span className="text-[10px] uppercase font-bold">Logic</span>
                </button>
            </div>
        }>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-medium text-[#78819D]">Comparison vs. Market Data</div>
                        <button onClick={() => setShowMath(!showMath)} className="text-xs flex items-center text-brand-500 font-medium bg-brand-50 px-2 py-1 rounded hover:bg-brand-50 transition-colors screen-only"><CalculatorIcon className="w-3 h-3 mr-1" />{showMath ? 'Hide Math' : 'Show Math'}</button>
                    </div>
                    
                    {(showMath || (window.matchMedia && window.matchMedia('print').matches)) && calculationBreakdown && (
                        <div className={`mb-4 p-3 rounded-md text-xs border shadow-inner animate-in fade-in zoom-in-95 duration-200 ${isOverridden ? 'border-purple-400 bg-purple-50' : 'bg-[#F6F7F9] border-[#DFE1E5]'}`}>
                            
                            {/* Manual Override Input Section */}
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#DFE1E5]">
                                <label className="text-xs font-bold text-[#1E2D5C]">Manual Base Rate ($/sqft):</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        value={manualBaseRateOverride || ''} 
                                        onChange={(e) => onManualBaseRateChange(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="w-24 text-right text-xs p-1 border border-[#DFE1E5] rounded !bg-white !text-[#1E2D5C]"
                                    />
                                    {isOverridden && <span className="ml-2 text-[10px] font-bold text-purple-600 uppercase tracking-wider">Active</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-2 font-mono text-[10px] text-[#78819D] uppercase tracking-wide border-b border-[#DFE1E5] pb-1">
                                <div>Base Rate</div>
                                <div className="text-center">Location ({calculationBreakdown.stateAbbrev})</div>
                                <div className="text-center">Finish Level</div>
                                <div className="text-right">Last Mile</div>
                            </div>
                            <div className={`grid grid-cols-4 gap-2 mb-3 font-bold ${isOverridden ? 'text-purple-900' : 'text-[#1E2D5C]'}`}>
                                <div className="flex flex-col">
                                    <span>{formatCurrency(calculationBreakdown.baseRate)}</span>
                                    <span className="text-[9px] font-normal text-[#78819D]">({calculationBreakdown.baseRateSource})</span>
                                </div>
                                <div className="text-center flex flex-col justify-center">
                                    <span>x {calculationBreakdown.locationFactor.toFixed(2)}</span>
                                    {isOverridden && <span className="text-[8px] font-normal text-[#78819D]">(Included in Override)</span>}
                                </div>
                                <div className="text-center">x {calculationBreakdown.finishFactor.toFixed(2)}</div>
                                <div className="text-right">x {calculationBreakdown.lastMileFactor.toFixed(2)}</div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-[#DFE1E5]">
                                <span className="font-semibold text-[#1E2D5C]">Calculated PPSF:</span>
                                <span className={`font-mono font-bold ${isOverridden ? 'text-purple-600' : 'text-brand-500'}`}>{formatCurrency(calculationBreakdown.calculatedPpsf)} / sqft</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="font-semibold text-[#1E2D5C]">Total SqFt:</span>
                                <span className="font-mono">{calculationBreakdown.sqFt} sqft</span>
                            </div>
                            <div className={`flex justify-between items-center mt-1 pt-1 border-t border-slate-300 font-bold p-1 rounded ${isOverridden ? 'text-purple-700 bg-purple-100' : 'text-green-700 bg-green-50'}`}>
                                <span>TARGET BUDGET:</span>
                                <span>{formatCurrency(targetBudget)}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 pt-2">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-brand-500">Borrower Actual</span>
                                <span className="font-mono font-bold">{formatCurrency(borrowerTotal)}</span>
                            </div>
                            <div className="w-full bg-[#DFE1E5] rounded-full h-2.5 overflow-hidden">
                                <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${actualWidth}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className={`font-bold ${isOverridden ? 'text-purple-700' : 'text-green-700'}`}>{isOverridden ? 'Analyst Target (Overridden)' : 'Feasible Target'}</span>
                                <span className="font-mono font-bold">{formatCurrency(targetBudget)}</span>
                            </div>
                            <div className="w-full bg-[#DFE1E5] rounded-full h-2.5 relative overflow-hidden">
                                <div className={`${isOverridden ? 'bg-purple-500' : 'bg-green-500'} h-2.5 rounded-full opacity-80 transition-all duration-1000 ease-out`} style={{ width: `${targetWidth}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-3 border-t border-[#DFE1E5]">
                    <h4 className="text-xs font-bold text-[#1E2D5C] mb-2">"Last Mile" Adjustments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {LAST_MILE_OPTIONS.map(option => (
                            <label key={option.key} className="flex items-start p-2 hover:bg-[#F7F9FC] rounded cursor-pointer border border-transparent hover:border-[#DFE1E5] transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={riskAdjustments[option.key as keyof RiskAdjustments]} 
                                    onChange={e => onRiskAdjustmentChange(option.key as keyof RiskAdjustments, e.target.checked)} 
                                    className="h-4 w-4 accent-brand-500 border-[#DFE1E5] rounded mt-0.5 flex-shrink-0" 
                                />
                                <div className="ml-2 flex-grow">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[#1E2D5C]">{option.label}</span>
                                        <span className="text-[10px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded">+{Math.round(option.adjustment * 100)}%</span>
                                    </div>
                                    <p className="text-[10px] text-[#78819D] mt-0.5 leading-tight">{option.reason}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </ReportCard>
    );
};

const FeasibilityPrintView: React.FC<any> = ({ feasibilityData, asIsProjectedData, budgetData, borrowerTotal, riskAnalysis, riskAdjustments, conditions, rehabTypes, materialQualities, selectedConditionValue, selectedRehabTypeValue, selectedMaterialQualityValue, executiveSummary }) => {
    
    const borrowerName = feasibilityData.borrowerName || "Borrower Name"; 
    const address = "1234 W Gemini Court, Mayflower Mountain, UT"; // Mock
    
    const totalSqFt = parseFloat(asIsProjectedData.totalBuildingSqFeet.projected || '0');
    const softCosts = budgetData.find((c: any) => c.name === 'Soft Costs')?.items.reduce((acc: any, item: any) => acc + item.budget, 0) || 0;
    const softCostPercent = borrowerTotal > 0 ? (softCosts / borrowerTotal) * 100 : 0;
    const ppsf = totalSqFt > 0 ? borrowerTotal / totalSqFt : 0;

    return (
        <div className="feasibility-print-grid hidden print:grid">
            {/* Header Grid */}
            <div className="border-2 border-black mb-4">
                <div className="grid grid-cols-[150px_1fr_150px_1fr] text-xs border-b border-black">
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Borrower:</div>
                    <div className="p-1 border-r border-black">{borrowerName}</div>
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Approval Date:</div>
                    <div className="p-1">{feasibilityData.approvalDate}</div>
                </div>
                <div className="grid grid-cols-[150px_1fr_150px_1fr] text-xs border-b border-black">
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Repeat Borrower:</div>
                    <div className="p-1 border-r border-black">Yes</div>
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Final Budget Amount:</div>
                    <div className="p-1">{formatCurrency(borrowerTotal)}</div>
                </div>
                <div className="grid grid-cols-[150px_1fr_150px_1fr] text-xs border-b border-black">
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Property Address:</div>
                    <div className="p-1 border-r border-black">{address}</div>
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Submitted Budget:</div>
                    <div className="p-1">{formatCurrency(borrowerTotal)}</div>
                </div>
                <div className="grid grid-cols-[150px_1fr_150px_1fr] text-xs border-b border-black">
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Loan Number:</div>
                    <div className="p-1 border-r border-black">{feasibilityData.loanNumber}</div>
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Project Type:</div>
                    <div className="p-1">New Construction</div>
                </div>
                <div className="grid grid-cols-[150px_1fr_150px_1fr] text-xs border-b border-black">
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Strategic Account:</div>
                    <div className="p-1 border-r border-black">{feasibilityData.strategicAccount ? 'Yes' : 'No'}</div>
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Tier Reviewed:</div>
                    <div className="p-1">{feasibilityData.tierReviewed}</div>
                </div>
                <div className="grid grid-cols-[150px_1fr_150px_1fr] text-xs border-b border-black">
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Processed By:</div>
                    <div className="p-1 border-r border-black">{feasibilityData.processedBy}</div>
                    <div className="bg-gray-300 font-bold p-1 border-r border-black">Approved By:</div>
                    <div className="p-1">{feasibilityData.approvedBy}</div>
                </div>
                <div className="grid grid-cols-[200px_1fr_1fr_1fr] text-xs bg-gray-300 font-bold p-1">
                    <div>Required Before First Draw:</div>
                    <div className="flex items-center">Plans <input type="checkbox" readOnly checked={feasibilityData.requiredBeforeDraw.plans} className="ml-2"/></div>
                    <div className="flex items-center">Permits <input type="checkbox" readOnly checked={feasibilityData.requiredBeforeDraw.permits} className="ml-2"/></div>
                    <div className="flex items-center">Other <input type="checkbox" readOnly checked={feasibilityData.requiredBeforeDraw.other} className="ml-2"/></div>
                </div>
            </div>

            {/* Budget Notes */}
            <div className="border-2 border-black mb-4">
                <div className="bg-gray-300 font-bold text-center p-1 border-b border-black text-sm">Budget Notes:</div>
                <div className="flex text-xs">
                    <div className="w-1/3 border-r border-black p-2">
                        <div className="flex justify-between"><span>Plans Provided:</span><span>Yes</span></div>
                        <div className="flex justify-between"><span>Permits Provided:</span><span>Yes</span></div>
                        <div className="flex justify-between"><span>SQFT Verified:</span><span>Yes</span></div>
                    </div>
                    <div className="w-2/3 grid grid-cols-3">
                        <div className="col-span-1 text-right font-bold pr-2 pt-1"></div>
                        <div className="col-span-1 text-center font-bold border-l border-b border-black p-1">Current</div>
                        <div className="col-span-1 text-center font-bold border-l border-b border-black p-1">Projected</div>
                        
                        <div className="text-right pr-2 py-1 border-b border-black border-gray-200">Total Sqft:</div>
                        <div className="text-center border-l border-b border-black py-1 bg-brand-50">{asIsProjectedData.totalBuildingSqFeet.asIs}</div>
                        <div className="text-center border-l border-b border-black py-1 bg-red-100">{asIsProjectedData.totalBuildingSqFeet.projected}</div>

                        <div className="text-right pr-2 py-1 border-b border-black border-gray-200">Rooms/Units:</div>
                        <div className="text-center border-l border-b border-black py-1 bg-brand-50">{asIsProjectedData.unitCount.asIs}</div>
                        <div className="text-center border-l border-b border-black py-1 bg-red-100">{asIsProjectedData.unitCount.projected}</div>

                        <div className="text-right pr-2 py-1 border-b border-black border-gray-200">Bedrooms:</div>
                        <div className="text-center border-l border-b border-black py-1 bg-brand-50">{asIsProjectedData.bedroomCount.asIs}</div>
                        <div className="text-center border-l border-b border-black py-1 bg-red-100">{asIsProjectedData.bedroomCount.projected}</div>

                        <div className="text-right pr-2 py-1">Bathrooms:</div>
                        <div className="text-center border-l border-black py-1 bg-brand-50">{asIsProjectedData.bathroomCount.asIs}</div>
                        <div className="text-center border-l border-black py-1 bg-red-100">{asIsProjectedData.bathroomCount.projected}</div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="border-2 border-black mb-4 text-xs">
                <div className="grid grid-cols-[150px_1fr] border-b border-black">
                    <div className="font-bold p-1 bg-gray-100 text-right pr-2">Results:</div>
                    <div className="p-1 text-center font-bold">{feasibilityData.recommendation || 'Pending Recommendation'}</div>
                </div>
                <div className="grid grid-cols-[150px_1fr] border-b border-black">
                    <div className="font-bold p-1 bg-gray-100 text-right pr-2">Conditional Approval:</div>
                    <div className="p-1 text-center">
                        {feasibilityData.conditions && feasibilityData.conditions.length > 0 
                            ? feasibilityData.conditions.join(', ') 
                            : 'None'}
                    </div>
                </div>
                <div className="grid grid-cols-2 border-b border-black">
                    <div className="font-bold p-1 bg-gray-300 text-center border-r border-black">Primary Risks</div>
                    <div className="font-bold p-1 bg-gray-300 text-center">Mitigating Factors</div>
                </div>
                <div className="grid grid-cols-2 min-h-[60px] border-b border-black">
                    <div className="p-2 border-r border-black">
                        {riskAnalysis.factors.length > 0 ? (
                            <ul className="list-disc pl-4">{riskAnalysis.factors.map((f: any, i: number) => <li key={i}>{f.message}</li>)}</ul>
                        ) : "No Major Risks"}
                    </div>
                    <div className="p-2">{feasibilityData.mitigatingFactors}</div>
                </div>
            </div>

            {/* Borrower Performance */}
            <div className="border-2 border-black mb-4 text-xs">
                <div className="grid grid-cols-2 bg-gray-300 font-bold border-b border-black">
                    <div className="p-1 text-center border-r border-black">Borrower Performance on L1C Loan</div>
                    <div className="p-1 text-center">Additional Requirements</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="border-r border-black">
                        <div className="grid grid-cols-[150px_1fr] border-b border-gray-300"><div className="text-right pr-2 bg-gray-100">Build time:</div><div className="pl-2">{feasibilityData.borrowerPerformance.buildTimeDays}</div></div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-gray-300"><div className="text-right pr-2 bg-gray-100">Avg days between draws:</div><div className="pl-2">{feasibilityData.borrowerPerformance.avgDaysBetweenDraws}</div></div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-gray-300"><div className="text-right pr-2 bg-gray-100">Projects review outcome:</div><div className="pl-2">{feasibilityData.borrowerPerformance.projectsReviewOutcome}</div></div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-gray-300"><div className="text-right pr-2 bg-gray-100">Violations/Liens:</div><div className="pl-2">{feasibilityData.borrowerPerformance.violationsLiens}</div></div>
                        <div className="grid grid-cols-[150px_1fr]"><div className="text-right pr-2 bg-gray-100">Budget Revisions:</div><div className="pl-2">{feasibilityData.borrowerPerformance.budgetRevisions}</div></div>
                    </div>
                    <div className="p-2">
                       {feasibilityData.referenceLoanNumbers}
                    </div>
                </div>
            </div>

            {/* CM Notes */}
            <div className="border-2 border-black mb-4 text-xs">
                <div className="bg-gray-300 font-bold text-center border-b border-black p-1">Construction Management Notes for CRC:</div>
                <div className="grid grid-cols-3 border-b border-black">
                    <div className="p-1 border-r border-black text-center">Soft Cost as %: <strong>{softCostPercent.toFixed(0)}%</strong></div>
                    <div className="p-1 border-r border-black text-center">Dollar per sqft: <strong>{formatCurrency(ppsf)}</strong></div>
                    <div className="p-1 text-center">Adjustments to Budget: <strong>{feasibilityData.cmNotes.adjustmentsToBudget ? 'Yes' : 'No'}</strong></div>
                </div>
                <div className="grid grid-cols-3 border-b border-black">
                    <div className="p-1 border-r border-black text-center">GC Review Completed: <strong>{feasibilityData.cmNotes.gcReviewCompleted ? 'Yes' : 'No'}</strong></div>
                    <div className="p-1 border-r border-black text-center">GC Approved: <strong>{feasibilityData.cmNotes.gcApproved ? 'Yes' : 'No'}</strong></div>
                    <div className="p-1 bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="border-r border-black">
                        <div className="bg-gray-300 font-bold text-center border-b border-black">Notes:</div>
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300"><div className="text-right pr-2">Permit</div><div className="pl-2 font-bold">In Hand</div></div>
                        <div className="grid grid-cols-[100px_1fr] border-b border-gray-300"><div className="text-right pr-2">Plans</div><div className="pl-2 font-bold">HOA Approved</div></div>
                        <div className="grid grid-cols-[100px_1fr]"><div className="text-right pr-2">HOA</div><div className="pl-2 font-bold">Yes</div></div>
                    </div>
                    <div>
                        <div className="bg-gray-300 font-bold text-center border-b border-black">Approval Dates:</div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-gray-300"><div className="text-right pr-2">Date Permit Approved:</div><div className="pl-2">{feasibilityData.approvalDates.permit || 'Unknown'}</div></div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-gray-300"><div className="text-right pr-2">Date Plans Approved:</div><div className="pl-2">{feasibilityData.approvalDates.plans || 'Unknown'}</div></div>
                        <div className="grid grid-cols-[150px_1fr]"><div className="text-right pr-2">Require HOA Approval:</div><div className="pl-2">{feasibilityData.hoa.required ? 'Yes' : 'No'}</div></div>
                    </div>
                </div>
            </div>

            {/* PAM Notes & Additional Info */}
            <div className="border-2 border-black mb-4 text-xs">
                <div className="bg-gray-300 font-bold text-center border-b border-black p-1">PAM/Additional Notes:</div>
                <div className="p-2 min-h-[40px]">
                    {feasibilityData.pamNotes}
                </div>
            </div>
        </div>
    );
};

interface AnalystReportProps {
  borrowerTotal: number;
  limaOneApprovedTotal: number;
  totalSqFt: string;
  selectedConditionValue: string;
  selectedRehabTypeValue: string;
  selectedMaterialQualityValue: string;
  conditions: SelectOption[];
  rehabTypes: SelectOption[];
  materialQualities: SelectOption[];
  riskAnalysis: RiskAnalysisResult;
  riskAdjustments: RiskAdjustments;
  onRiskAdjustmentChange: (key: keyof RiskAdjustments, value: boolean) => void;
  feasibilityData: FeasibilityData;
  onFeasibilityChange: (path: string, value: any) => void;
  asIsProjectedData: AsIsProjectedData;
  budgetData: BudgetCategoryData[];
  projectDocuments: ProjectDocument[];
  propertyDetails: PropertyDetails;
  dealGrade: DealGrade;
  generalContractor: GeneralContractor;
  manualBaseRateOverride?: number;
  onManualBaseRateChange: (value: number) => void;
  marketMetrics: MarketMetrics;
  onMarketMetricsChange: (field: keyof MarketMetrics, value: any) => void;
  onToast?: ShowToastFn;
}

export const AnalystReport: React.FC<AnalystReportProps> = ({
  borrowerTotal,
  limaOneApprovedTotal,
  totalSqFt,
  selectedConditionValue,
  selectedRehabTypeValue,
  selectedMaterialQualityValue,
  conditions,
  rehabTypes,
  materialQualities,
  riskAnalysis,
  riskAdjustments,
  onRiskAdjustmentChange,
  feasibilityData,
  onFeasibilityChange,
  asIsProjectedData,
  budgetData,
  projectDocuments,
  propertyDetails,
  dealGrade,
  generalContractor,
  manualBaseRateOverride,
  onManualBaseRateChange,
  marketMetrics,
  onMarketMetricsChange,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'financial' | 'entities' | 'market'>('risk');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isGradingLogicOpen, setIsGradingLogicOpen] = useState(false);
  const [isValidatorLogicOpen, setIsValidatorLogicOpen] = useState(false);
  const [isScopeAuditOpen, setIsScopeAuditOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Reset banner whenever analyst returns to the Risk tab
  useEffect(() => {
    if (activeTab === 'risk') setIsBannerDismissed(false);
  }, [activeTab]);
  
  // Toggle mock data based on feasibilityData state for demonstration (Borrower history)
  const borrowerData = feasibilityData.isRepeatBorrower ? repeatBorrowerData : firstTimeBorrowerData;
  
  // Determine GC Data based on GeneralContractor state
  const isGcRepeat = false; // MOCKED: Removed dependency on hasClosedLoan for now
  const reportGcData: ReportGcData = {
      isRepeat: isGcRepeat,
      name: generalContractor.businessName || 'Pending Contractor Name',
      buildzoomUrl: generalContractor.buildzoomUrl,
      performance: isGcRepeat ? {
          projectsWithUs: 4, // Mock: In real app, fetch from DB based on Entity ID
          onTimePercentage: '92%' // Mock
      } : undefined
  };

  const handleSave = () => {
      setSaveStatus('saving');
      // Simulate API delay - in real app, this would be an async prop function
      setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => {
              setSaveStatus('idle');
          }, 2000);
      }, 800);
  };

  const TabButton: React.FC<{ id: string, label: string }> = ({ id, label }) => (
      <button
          onClick={() => setActiveTab(id as any)}
          className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === id
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-[#78819D] hover:text-[#1E2D5C] hover:border-[#DFE1E5]'
          }`}
      >
          {label}
      </button>
  );

  return (
    <div className="analyst-report-container pb-10 bg-[#F4F5F7] min-h-screen relative">
      
      {/* Sticky Top Header with Actions */}
      <StickyActionHeader 
        propertyDetails={propertyDetails}
        feasibilityData={feasibilityData}
        onChange={onFeasibilityChange}
        dealGrade={dealGrade}
        riskAnalysis={riskAnalysis}
        selectedRehabTypeValue={selectedRehabTypeValue}
        onSave={handleSave}
        saveStatus={saveStatus}
        marketMetrics={marketMetrics}
        onOpenGradingLogic={() => setIsGradingLogicOpen(true)}
        onOpenScopeAudit={() => setIsScopeAuditOpen(true)}
      />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[#DFE1E5] px-4 md:px-6 sticky top-[60px] z-20 shadow-sm">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Analyst Sections">
             <TabButton id="risk" label="Risk & Feasibility" />
             <TabButton id="financial" label="Financial Validation" />
             <TabButton id="entities" label="Entities & Performance" />
             <TabButton id="market" label="Property & Market" />
          </nav>
      </div>

      {/* Risk Summary Banner — shown on Risk tab only, dismissible */}
      {activeTab === 'risk' && !isBannerDismissed && (() => {
          const g = dealGrade.grade;
          const flagCount = riskAnalysis.factors.length;
          const rec = feasibilityData.recommendation || 'Pending';

          // Color scheme keyed by grade
          const scheme = g.startsWith('A')
              ? { bar: 'bg-[#139B23]', bg: 'bg-[#E1F7E4]', border: 'border-[#ADDEB4]', text: 'text-[#139B23]', badge: 'bg-[#139B23] text-white', chip: 'bg-[#E1F7E4] text-[#139B23]' }
              : g.startsWith('B')
              ? { bar: 'bg-brand-500', bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-500', badge: 'bg-brand-500 text-white', chip: 'bg-brand-50 text-brand-500' }
              : g.startsWith('C')
              ? { bar: 'bg-[#EAA800]', bg: 'bg-[#FFF5DB]', border: 'border-[#EDDDB1]', text: 'text-[#EAA800]', badge: 'bg-[#EAA800] text-white', chip: 'bg-[#FFF5DB] text-[#EAA800]' }
              : g.startsWith('D')
              ? { bar: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500 text-white', chip: 'bg-orange-100 text-orange-700' }
              : { bar: 'bg-[#B92814]', bg: 'bg-[#FFF0EE]', border: 'border-red-200', text: 'text-[#B92814]', badge: 'bg-[#B92814] text-white', chip: 'bg-[#FFF0EE] text-[#B92814]' };

          const recColor = rec === 'Recommended'
              ? 'bg-[#E1F7E4] text-[#139B23]'
              : rec === 'Recommended with Conditions'
              ? 'bg-[#FFF5DB] text-[#EAA800]'
              : rec === 'Not Recommended'
              ? 'bg-[#FFF0EE] text-[#B92814]'
              : 'bg-[#F4F5F7] text-[#78819D]';

          return (
              <div className={`mx-4 md:mx-6 mt-4 rounded-xl border overflow-hidden shadow-sm ${scheme.bg} ${scheme.border}`}>
                  {/* Top accent bar */}
                  <div className={`h-1 w-full ${scheme.bar}`} />
                  <div className="px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
                      <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#78819D]">Risk Summary</span>
                          {/* Grade badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${scheme.chip}`}>
                              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">Grade</span>
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${scheme.badge}`}>{g}</span>
                          </span>
                          {/* Risk Score */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${scheme.chip}`}>
                              Risk Score: <span className="font-black">{riskAnalysis.score}</span>
                          </span>
                          {/* Flags */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${flagCount > 0 ? 'bg-[#FFF0EE] text-[#B92814]' : 'bg-[#E1F7E4] text-[#139B23]'}`}>
                              {flagCount > 0 ? `⚑ ${flagCount} Flag${flagCount !== 1 ? 's' : ''}` : '✓ No Flags'}
                          </span>
                          {/* Recommendation */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${recColor}`}>
                              {rec === '' ? 'Recommendation Pending' : rec}
                          </span>
                      </div>
                      <button
                          onClick={() => setIsBannerDismissed(true)}
                          className="text-[#78819D] hover:text-[#1E2D5C] text-lg leading-none transition-colors flex-shrink-0"
                          title="Dismiss"
                      >×</button>
                  </div>
              </div>
          );
      })()}

      <div className="p-4 md:p-6 space-y-6">

        {/* Risk & Feasibility Tab */}
        {activeTab === 'risk' && (
            <div className="animate-in fade-in duration-300 space-y-6">
                {/* Loan Setup & Configuration Card - Added prominently at the top */}
                <LoanSetupCard 
                    feasibilityData={feasibilityData}
                    onChange={onFeasibilityChange}
                />

                <Dashboard
                    borrowerTotal={borrowerTotal}
                    limaOneApprovedTotal={limaOneApprovedTotal}
                    totalSqFt={totalSqFt}
                    selectedConditionValue={selectedConditionValue}
                    selectedRehabTypeValue={selectedRehabTypeValue}
                    selectedMaterialQualityValue={selectedMaterialQualityValue}
                    conditions={conditions}
                    rehabTypes={rehabTypes}
                    materialQualities={materialQualities}
                    dealGrade={undefined} // Hiding specific grade widget here as it's in header, keeping high-level stats
                />
                
                {/* Unified Decision Console */}
                <DecisionConsole 
                    riskAnalysis={riskAnalysis} 
                    feasibilityData={feasibilityData} 
                    onChange={onFeasibilityChange}
                    dealGrade={dealGrade}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AlertsPanel riskAnalysis={riskAnalysis} />
                    {/* Replaced legacy DrawConditions with new ClosingConditionsCard */}
                    <ClosingConditionsCard 
                        feasibilityData={feasibilityData} 
                        onChange={onFeasibilityChange} 
                    />
                </div>
            </div>
        )}

        {/* Financial Validation Tab */}
        {activeTab === 'financial' && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <SmartBudgetValidator 
                        riskAnalysis={riskAnalysis} 
                        borrowerTotal={borrowerTotal} 
                        riskAdjustments={riskAdjustments} 
                        onRiskAdjustmentChange={onRiskAdjustmentChange}
                        manualBaseRateOverride={manualBaseRateOverride}
                        onManualBaseRateChange={onManualBaseRateChange}
                        onOpenLogic={() => setIsValidatorLogicOpen(true)}
                    />
                    <ConstructionManagementNotes 
                        budgetData={budgetData} 
                        scopeSummary={{ borrowerTotal, limaOneApprovedTotal }} 
                        feasibilityData={feasibilityData} 
                        onChange={onFeasibilityChange} 
                        totalSqFt={totalSqFt}
                    />
                </div>
                <div className="space-y-6">
                    <BudgetNotesTable 
                        asIsProjectedData={asIsProjectedData} 
                        projectDocuments={projectDocuments} 
                        feasibilityData={feasibilityData} 
                        onChange={onFeasibilityChange} 
                        selectedRehabType={selectedRehabTypeValue}
                    />
                </div>
            </div>
        )}

        {/* Entities & Performance Tab */}
        {activeTab === 'entities' && (
            <div className="animate-in fade-in duration-300 space-y-6">
                {/* Unified Sponsorship Card */}
                <SponsorshipStrengthCard 
                    feasibilityData={feasibilityData}
                    borrowerData={borrowerData}
                    gcData={reportGcData}
                    onChange={onFeasibilityChange}
                />
            </div>
        )}

        {/* Property & Market Tab */}
        {activeTab === 'market' && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Insert Market Health Card here */}
                    <MarketHealthCard 
                        marketMetrics={marketMetrics} 
                        onChange={onMarketMetricsChange} 
                    />
                    <GeospatialAnalysis />
                    <DevelopmentInfoCard 
                        feasibilityData={feasibilityData} 
                        onChange={onFeasibilityChange} 
                    />
                </div>
                <div className="space-y-6">
                    <AutomatedDueDiligenceDashboard />
                    <VisualVerification />
                </div>
            </div>
        )}

      </div>

      {/* Hidden Print View for PDF Generation */}
      <FeasibilityPrintView 
          feasibilityData={feasibilityData}
          asIsProjectedData={asIsProjectedData}
          budgetData={budgetData}
          borrowerTotal={borrowerTotal}
          riskAnalysis={riskAnalysis}
          riskAdjustments={riskAdjustments}
          conditions={feasibilityData.conditions}
          rehabTypes={rehabTypes}
          materialQualities={materialQualities}
          selectedConditionValue={selectedConditionValue}
          selectedRehabTypeValue={selectedRehabTypeValue}
          selectedMaterialQualityValue={selectedMaterialQualityValue}
      />

      <GradingLogicModal 
        isOpen={isGradingLogicOpen}
        onClose={() => setIsGradingLogicOpen(false)}
      />

      <ValidatorLogicModal
        isOpen={isValidatorLogicOpen}
        onClose={() => setIsValidatorLogicOpen(false)}
      />

      <ScopeAuditModal
        isOpen={isScopeAuditOpen}
        onClose={() => setIsScopeAuditOpen(false)}
        budgetData={budgetData}
        onToast={onToast}
      />
    </div>
  );
};
