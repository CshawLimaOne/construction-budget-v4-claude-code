
import React from 'react';
import { ApplicationStrength } from '../types';
import { HomeIcon, IdentificationIcon, BanknotesIcon, DocumentTextIcon, CameraIcon, XIcon, InfoIcon } from './Icons';

interface DealStrengthLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  strength?: ApplicationStrength;
}

const CATEGORIES = [
  {
    key:      'basics'  as const,
    label:    'The Basics',
    max:      20,
    Icon:     HomeIcon,
    color:    '#0693e3',
    items:    ['Full Property Address & Price (+5)', 'Answered all Project Questions (+5)', 'Selected Condition, Rehab Type & Quality (+10)'],
  },
  {
    key:      'team'    as const,
    label:    'Team & Documents',
    max:      15,
    Icon:     IdentificationIcon,
    color:    '#a855f7',
    items:    ['Entered GC Business Name (+5)', 'Uploaded License/Insurance OR Invited GC (+10)'],
    footnote: 'For Light-Cosmetic or Standard-Full rehabs, these points are awarded automatically as a GC is optional.',
  },
  {
    key:      'budget'  as const,
    label:    'Budget Detail',
    max:      30,
    Icon:     BanknotesIcon,
    color:    '#f59e0b',
    items:    ['Budget has > 5 line items (+10)', 'Budget has > 15 line items (+10)', 'Soft Costs included (not $0) (+10)'],
  },
  {
    key:      'quality' as const,
    label:    'Descriptive Quality',
    max:      20,
    Icon:     DocumentTextIcon,
    color:    '#10b981',
    items:    ['Custom descriptions on 3+ items (+10)', 'Scope of Work statement > 50 characters (+10)'],
  },
  {
    key:      'photos'  as const,
    label:    'Visual Evidence',
    max:      15,
    Icon:     CameraIcon,
    color:    '#ec4899',
    items:    ['At least 1 photo uploaded (+5)', '5+ photos uploaded (+10)'],
  },
];

export const DealStrengthLogicModal: React.FC<DealStrengthLogicModalProps> = ({ isOpen, onClose, strength }) => {
  if (!isOpen) return null;

  const breakdown = strength?.breakdown;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ backgroundColor: 'rgba(4,11,31,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col bg-white"
        style={{
          border: '1px solid #DFE1E5',
          borderTop: '2px solid #0693e3',
          animation: 'modalIn 0.2s ease-out both',
          maxHeight: 'calc(100vh - 4rem)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: '#DFE1E5' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(6,147,227,0.10)' }}>
              <InfoIcon className="w-4 h-4 text-brand-500 !ml-0" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E2D5C]">How Application Score is Calculated</h2>
              <p className="text-xs text-[#78819D] mt-0.5">5 categories · 100 points total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-[#78819D] hover:text-[#1E2D5C] hover:bg-[#F7F9FC] transition-all cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 overflow-y-auto flex-grow space-y-3">

          {/* Intro */}
          <p className="text-sm text-[#78819D] leading-relaxed">
            The <strong className="text-[#1E2D5C]">Application Score</strong> (0–100) measures the quality and
            completeness of your submission. A higher score helps analysts review your loan faster
            and reduces the likelihood of revision requests.
          </p>

          {/* Category Cards */}
          {CATEGORIES.map(({ key, label, max, Icon, color, items, footnote }) => {
            const earned  = breakdown?.[key] ?? null;
            const done    = earned !== null && earned >= max;
            const pct     = earned !== null ? Math.min(100, Math.round((earned / max) * 100)) : null;

            return (
              <div
                key={key}
                className="rounded-xl p-4 bg-[#F6F7F9]"
                style={{
                  border: `1px solid #DFE1E5`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Title row */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-sm font-bold text-[#1E2D5C]">{label}</span>
                  </div>

                  {/* Points badge + score */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {earned !== null && (
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: done ? '#139B23' : '#78819D' }}>
                        {earned}/{max}
                      </span>
                    )}
                    <span
                      className="text-[11px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: `${color}20`, color }}
                    >
                      {max} pts
                    </span>
                  </div>
                </div>

                {/* Mini progress bar (only when strength is available) */}
                {pct !== null && (
                  <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: '#DFE1E5' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: done ? '#139B23' : color }}
                    />
                  </div>
                )}

                {/* Requirements list */}
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#78819D]">
                      <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color, marginTop: '5px' }} />
                      {item}
                    </li>
                  ))}
                </ul>

                {footnote && (
                  <p className="mt-2 text-[11px] text-[#78819D] italic">{footnote}</p>
                )}
              </div>
            );
          })}

          {/* Deal Strength vs Deal Risk callout */}
          <div
            className="rounded-xl p-4 mt-2 bg-[#FFF5DB] border border-[#EDDDB1]"
          >
            <h4 className="text-sm font-bold text-[#EAA800] mb-2">
              Application Score vs. Deal Risk — What's the difference?
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-[#EAA800]">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EAA800] flex-shrink-0" />
                <span><strong className="text-[#EAA800]">Application Score (You Control):</strong> Completeness, detail, and evidence. A high score means you've told the story well.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#EAA800]">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EAA800] flex-shrink-0" />
                <span><strong className="text-[#EAA800]">Deal Risk (Market Factors):</strong> Market trends, zip code risk, and financial feasibility. Largely outside your control but affects approval terms.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 flex justify-end border-t flex-shrink-0"
          style={{ borderColor: '#DFE1E5' }}
        >
          <button
            onClick={onClose}
            className="button-base bg-brand-500 hover:bg-brand-600 text-white px-6 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
