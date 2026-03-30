
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
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(10,15,35,0.98) 0%, rgba(15,23,50,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: '2px solid rgba(6,147,227,0.5)',
          animation: 'modalIn 0.2s ease-out both',
          maxHeight: 'calc(100vh - 4rem)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(6,147,227,0.12)' }}>
              <InfoIcon className="w-4 h-4 text-[#0693e3] !ml-0" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How Application Score is Calculated</h2>
              <p className="text-xs text-slate-500 mt-0.5">5 categories · 100 points total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 overflow-y-auto flex-grow space-y-3">

          {/* Intro */}
          <p className="text-sm text-slate-400 leading-relaxed">
            The <strong className="text-white">Application Score</strong> (0–100) measures the quality and
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
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  {/* Title row */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-sm font-bold text-white">{label}</span>
                  </div>

                  {/* Points badge + score */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {earned !== null && (
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: done ? '#10b981' : '#94a3b8' }}>
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
                  <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: done ? '#10b981' : color }}
                    />
                  </div>
                )}

                {/* Requirements list */}
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color, marginTop: '5px' }} />
                      {item}
                    </li>
                  ))}
                </ul>

                {footnote && (
                  <p className="mt-2 text-[11px] text-slate-600 italic">{footnote}</p>
                )}
              </div>
            );
          })}

          {/* Deal Strength vs Deal Risk callout */}
          <div
            className="rounded-xl p-4 mt-2"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <h4 className="text-sm font-bold text-amber-300 mb-2">
              Application Score vs. Deal Risk — What's the difference?
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-amber-200/80">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span><strong className="text-amber-200">Application Score (You Control):</strong> Completeness, detail, and evidence. A high score means you've told the story well.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-amber-200/80">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span><strong className="text-amber-200">Deal Risk (Market Factors):</strong> Market trends, zip code risk, and financial feasibility. Largely outside your control but affects approval terms.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 flex justify-end border-t flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={onClose}
            className="button-base bg-brand-600 hover:bg-brand-500 text-white px-6 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
