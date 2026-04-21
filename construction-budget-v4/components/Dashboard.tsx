
import React, { useState } from 'react';
import { ScopeOfWorkSummary, SelectOption, DealGrade } from '../types';
import { InfoIcon } from './Icons';

interface DashboardProps {
  borrowerTotal: number;
  limaOneApprovedTotal: number;
  totalSqFt: string;
  selectedConditionValue: string;
  selectedRehabTypeValue: string;
  selectedMaterialQualityValue: string;
  conditions: SelectOption[];
  rehabTypes: SelectOption[];
  materialQualities: SelectOption[];
  dealGrade?: DealGrade; // Made optional to prevent breaking existing usage if not passed initially
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const DashboardItem: React.FC<{ label: string; value: string | number; valueClass?: string, isCurrency?: boolean }> = ({ label, value, valueClass, isCurrency }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md shadow-sm border border-[#DFE1E5] h-full">
    <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
    <span className={`text-xl md:text-2xl font-bold mt-1 ${valueClass || 'text-slate-700'}`}>
      {isCurrency && typeof value === 'number' ? formatCurrency(value) : value}
    </span>
  </div>
);

const QualitativeItem: React.FC<{ label: string; selectedValue: string; options: SelectOption[] }> = ({ label, selectedValue, options }) => {
  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayLabel = selectedOption ? selectedOption.label : 'N/A';
  // Retain original colorClass for the badge itself, assuming it's meant to be a fixed color indicator
  const colorClass = selectedOption ? selectedOption.colorClass : 'bg-gray-200 ';
  // Adjust text color based on the badge's specific background color for contrast
  const textColor = selectedOption 
    ? (selectedOption.colorClass?.includes('yellow') || selectedOption.colorClass?.includes('green-400') || selectedOption.colorClass?.includes('gray-200')
      ? 'text-black ' // Ensure dark text on light-ish badges even in dark mode if badge color doesn't change
      : 'text-white ') // Ensure light text on dark badges
    : 'text-black';


  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md shadow-sm border border-[#DFE1E5] h-full">
      <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClass} ${textColor}`}>
        {displayLabel}
      </span>
    </div>
  );
};

export const DealGradeWidget: React.FC<{ dealGrade: DealGrade, variant?: 'default' | 'header' }> = ({ dealGrade, variant = 'default' }) => {
    const [showPopover, setShowPopover] = useState(false);

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'bg-[#139B23] text-white';
        if (grade.startsWith('B')) return 'bg-brand-500 text-white';
        if (grade.startsWith('C')) return 'bg-[#EAA800] text-black';
        if (grade.startsWith('D')) return 'bg-orange-500 text-white';
        return 'bg-[#B92814] text-white animate-pulse';
    };

    const getGradeGlow = (grade: string) => {
        if (grade.startsWith('A')) return '0 0 16px rgba(34,197,94,0.55)';
        if (grade.startsWith('B')) return '0 0 16px rgba(6,147,227,0.55)';
        if (grade.startsWith('C')) return '0 0 16px rgba(250,204,21,0.55)';
        if (grade.startsWith('D')) return '0 0 16px rgba(249,115,22,0.55)';
        return '0 0 20px rgba(220,38,38,0.65)';
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-[#139B23]';
        if (score >= 80) return 'text-[#0693e3]';
        if (score >= 70) return 'text-[#EAA800]';
        if (score >= 60) return 'text-orange-600';
        return 'text-[#B92814]';
    };

    const isHeader = variant === 'header';

    return (
        <div className="relative h-full">
            <button
                onClick={() => setShowPopover(!showPopover)}
                className={`flex items-center justify-center w-full transition-colors group ${isHeader ? 'flex-col gap-0.5' : 'flex-col p-3 bg-white rounded-md shadow-sm border border-[#DFE1E5] h-full hover:bg-[#F7F9FC]'}`}
            >
                <div className={`flex items-center justify-center gap-1 ${isHeader ? '' : 'mb-1'}`}>
                    <span className={`uppercase tracking-wider font-bold text-slate-500 ${isHeader ? 'text-[9px]' : 'text-xs'}`}>Deal Grade</span>
                    <InfoIcon className="text-slate-300 group-hover:text-[#0693e3] w-3 h-3 transition-colors" />
                </div>
                <div
                    className={`${isHeader ? 'w-14 h-14 text-2xl' : 'w-12 h-12 text-2xl'} rounded-full flex items-center justify-center font-black transition-all duration-300 ${getGradeColor(dealGrade.grade)}`}
                    style={{ boxShadow: getGradeGlow(dealGrade.grade) }}
                >
                    {dealGrade.grade}
                </div>
            </button>

            {showPopover && (
                <div className={`absolute right-0 ${isHeader ? 'top-12' : 'top-full mt-2'} w-64 bg-white rounded-lg border border-[#DFE1E5] z-50 p-4 animate-in fade-in zoom-in-95 duration-200`} style={{ boxShadow: '0 4px 20px rgba(30,45,92,0.1)' }}>
                    <div className="flex justify-between items-start mb-3 border-b border-[#DFE1E5] pb-2">
                        <div>
                            <h4 className="font-bold text-[#1E2D5C]">Deal Scorecard</h4>
                            <span className="text-xs text-[#78819D]">Confidence Score: {dealGrade.numericalScore}/100</span>
                        </div>
                        <button onClick={() => setShowPopover(false)} className="text-[#78819D] hover:text-[#1E2D5C]"><span className="sr-only">Close</span>×</button>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-[#78819D]">Financial Feasibility</span>
                            <span className={`font-bold ${getScoreColor(dealGrade.breakdown.financials)}`}>{dealGrade.breakdown.financials}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#78819D]">Sponsorship</span>
                            <span className={`font-bold ${getScoreColor(dealGrade.breakdown.sponsorship)}`}>{dealGrade.breakdown.sponsorship}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#78819D]">Market Factors</span>
                            <span className={`font-bold ${getScoreColor(dealGrade.breakdown.market)}`}>{dealGrade.breakdown.market}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#78819D]">Data Completeness</span>
                            <span className={`font-bold ${getScoreColor(dealGrade.breakdown.completeness)}`}>{dealGrade.breakdown.completeness}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#DFE1E5] text-xs italic text-[#78819D]">
                        "{dealGrade.summary}"
                    </div>
                </div>
            )}
            {/* Overlay to close on click outside */}
            {showPopover && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowPopover(false)}></div>}
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({
  borrowerTotal,
  limaOneApprovedTotal,
  totalSqFt,
  selectedConditionValue,
  selectedRehabTypeValue,
  selectedMaterialQualityValue,
  conditions,
  rehabTypes,
  materialQualities,
  dealGrade,
}) => {
  return (
    <div className="app-dashboard mb-8 p-4 bg-brand-700 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-white text-center mb-4">Project Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <DashboardItem label="Borrower Total" value={borrowerTotal} valueClass="text-[#0693e3] " isCurrency/>
        <DashboardItem label="Lima One Approved" value={limaOneApprovedTotal} valueClass="text-[#139B23] " isCurrency/>
        <DashboardItem label="Total Sq Ft" value={totalSqFt || '0'} valueClass="text-slate-700" />
        
        <QualitativeItem label="Condition" selectedValue={selectedConditionValue} options={conditions} />
        <QualitativeItem label="Rehab Type" selectedValue={selectedRehabTypeValue} options={rehabTypes} />
        <QualitativeItem label="Material Quality" selectedValue={selectedMaterialQualityValue} options={materialQualities} />
        
        {/* Insert Deal Grade Widget if available */}
        {dealGrade && (
            <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
                <DealGradeWidget dealGrade={dealGrade} />
            </div>
        )}
      </div>
    </div>
  );
};
