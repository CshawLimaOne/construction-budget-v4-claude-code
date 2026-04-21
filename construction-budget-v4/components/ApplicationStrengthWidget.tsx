
import React from 'react';
import { ApplicationStrength } from '../types';
import { InfoIcon, HomeIcon, IdentificationIcon, BanknotesIcon, DocumentTextIcon, CameraIcon, CheckCircleIcon } from './Icons';

interface ApplicationStrengthWidgetProps {
  strength: ApplicationStrength;
  onActionClick: () => void;
  onShowLogic: () => void;
}

const CATEGORIES = [
  { key: 'basics'  as const, label: 'The Basics',   max: 20, Icon: HomeIcon },
  { key: 'team'    as const, label: 'Team & Docs',   max: 15, Icon: IdentificationIcon },
  { key: 'budget'  as const, label: 'Budget Detail', max: 30, Icon: BanknotesIcon },
  { key: 'quality' as const, label: 'Descriptions',  max: 20, Icon: DocumentTextIcon },
  { key: 'photos'  as const, label: 'Photos',        max: 15, Icon: CameraIcon },
];

export const ApplicationStrengthWidget: React.FC<ApplicationStrengthWidgetProps> = ({
  strength,
  onActionClick,
  onShowLogic,
}) => {
  const { score, level, nextBestAction, nextActionDescription, breakdown } = strength;

  // Color tier
  let barColor   = '#78819D';
  let textColor  = 'text-[#78819D]';
  let topBorder  = '#DFE1E5';
  if (score >= 90) {
    barColor  = '#139B23';
    textColor = 'text-[#139B23]';
    topBorder = '#ADDEB4';
  } else if (score >= 70) {
    barColor  = '#1C39D8';
    textColor = 'text-brand-500';
    topBorder = '#BEC6ED';
  } else if (score >= 40) {
    barColor  = '#1C39D8';
    textColor = 'text-brand-500';
    topBorder = '#BEC6ED';
  }

  // Dynamic subtitle by tier
  const subtitle =
    score >= 90 ? 'Your application is strong and ready for analyst review!' :
    score >= 70 ? 'Almost there — a few more steps will make this loan-ready.' :
    score >= 40 ? 'Good progress — keep filling in details to strengthen your file.' :
                  'Your application needs significant work before submission.';

  // Bold markdown support in description
  const formattedDesc = nextActionDescription.split('**').map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[#1E2D5C] font-bold">{part}</strong>
      : part
  );

  const isComplete = score >= 100;

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: '#FFFFFF',
        border: `1px solid #DFE1E5`,
        borderTop: `2px solid ${topBorder}`,
        boxShadow: '0 2px 8px rgba(30,45,92,0.06)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-5 py-3 border-b border-[#DFE1E5] flex justify-between items-center"
        style={{ background: '#F6F7F9' }}
      >
        <h4 className="font-bold text-[#1E2D5C] text-xs uppercase tracking-widest flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
            style={{ backgroundColor: barColor }}
          />
          Application Guide
        </h4>
        <button
          onClick={onShowLogic}
          aria-label="How is the Application Score calculated?"
          className="flex items-center gap-1.5 text-[#78819D] hover:text-[#1E2D5C] transition-colors group cursor-pointer"
        >
          <InfoIcon className="w-3.5 h-3.5 !ml-0" />
          <span className="text-[10px] font-bold uppercase group-hover:underline">Logic</span>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        {isComplete ? (
          /* Celebration state */
          <div className="text-center py-3">
            <div
              className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: '#E1F7E4' }}
            >
              <CheckCircleIcon className="w-8 h-8 text-[#139B23]" />
            </div>
            <p className="text-sm font-bold text-[#139B23] mb-1">Application Ready!</p>
            <p className="text-xs text-[#78819D] leading-relaxed">
              All sections complete. You're ready for analyst review.
            </p>
          </div>
        ) : (
          <>
            {/* Score + Level */}
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${textColor} opacity-80`}>
                  {level}
                </span>
                <div className="text-3xl font-black text-[#1E2D5C] tabular-nums leading-none mt-0.5">
                  {score}
                  <span className="text-base font-bold text-[#78819D] ml-0.5">%</span>
                </div>
              </div>
              <span className="text-[10px] text-[#78819D] font-medium pb-1">out of 100</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-[#DFE1E5] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${score}%`,
                  backgroundColor: barColor,
                  boxShadow: `0 0 10px ${barColor}70`,
                }}
              />
            </div>

            {/* Dynamic subtitle */}
            <p className="text-xs text-[#78819D] leading-snug mb-4">{subtitle}</p>

            {/* 5-Category Checklist */}
            <div className="space-y-2 mb-4 p-2 rounded-xl bg-[#F6F7F9] border border-[#DFE1E5]">
              {CATEGORIES.map(({ key, label, max, Icon }) => {
                const earned = breakdown[key] ?? 0;
                const done = earned >= max;
                const pct = Math.min(100, Math.round((earned / max) * 100));
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    {/* Check/dot */}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-[#E1F7E4] border border-[#ADDEB4]' : 'bg-white border border-[#DFE1E5]'}`}
                    >
                      {done
                        ? <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-[#139B23]" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <div className="w-1.5 h-1.5 rounded-full bg-[#BCBFC7]" />
                      }
                    </div>
                    {/* Icon */}
                    <Icon className={`w-3 h-3 flex-shrink-0 ${done ? 'text-[#139B23]' : 'text-[#78819D]'}`} />
                    {/* Label */}
                    <span className={`text-[11px] flex-1 min-w-0 truncate ${done ? 'text-[#1E2D5C]' : 'text-[#78819D]'}`}>{label}</span>
                    {/* Mini bar */}
                    <div className="w-10 h-1.5 bg-[#DFE1E5] rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: done ? '#139B23' : barColor }}
                      />
                    </div>
                    {/* Points */}
                    <span className={`text-[10px] font-bold tabular-nums w-7 text-right flex-shrink-0 ${done ? 'text-[#139B23]' : 'text-[#78819D]'}`}>
                      {earned}/{max}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Next Best Action Card */}
            <div
              className="rounded-xl p-4 relative group hover:bg-[#F7F9FC] transition-colors cursor-default bg-white border border-[#DFE1E5]"
            >
              <div className="absolute -left-[1px] top-4 bottom-4 w-1 rounded-r-full" style={{ backgroundColor: barColor }} />
              <div className="pl-3">
                <h5 className="text-sm font-bold text-[#1E2D5C] mb-1">{nextBestAction}</h5>
                <p className="text-xs text-[#78819D] mb-3 leading-relaxed">{formattedDesc}</p>
                <button
                  onClick={onActionClick}
                  className="text-xs font-bold flex items-center gap-1 hover:text-white transition-all group-hover:translate-x-1 cursor-pointer"
                  style={{ color: barColor }}
                >
                  Do this now →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
