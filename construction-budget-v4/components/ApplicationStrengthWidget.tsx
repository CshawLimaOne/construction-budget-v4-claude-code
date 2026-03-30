
import React from 'react';
import { ApplicationStrength } from '../types';
import { CalculatorIcon as LogicIcon } from './Icons';

interface ApplicationStrengthWidgetProps {
  strength: ApplicationStrength;
  onActionClick: () => void;
  onShowLogic: () => void;
}

export const ApplicationStrengthWidget: React.FC<ApplicationStrengthWidgetProps> = ({ strength, onActionClick, onShowLogic }) => {
  const { score, level, nextBestAction, nextActionDescription } = strength;

  // Bar color progression: slate → LO cyan → purple → emerald
  let barColor = '#475569';       // 0–39: slate
  let textColor = 'text-slate-300';
  if (score >= 90) {
      barColor = '#10b981';       // 90–100: emerald
      textColor = 'text-emerald-300';
  } else if (score >= 70) {
      barColor = '#a855f7';       // 70–89: purple
      textColor = 'text-purple-300';
  } else if (score >= 40) {
      barColor = '#0693e3';       // 40–69: LO cyan
      textColor = 'text-[#0693e3]';
  }

  // Format Description with Bold Markdown support
  const formattedDesc = nextActionDescription.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
  );

  return (
    <div className="bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden mb-6">

      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h4 className="font-bold text-slate-100 text-xs uppercase tracking-widest">
            Application Guide
          </h4>
          {import.meta.env.DEV && (
            <button
              onClick={onShowLogic}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group"
              title="How is this calculated?"
            >
              <LogicIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase group-hover:underline">Logic</span>
            </button>
          )}
      </div>

      {/* Main Content */}
      <div className="p-5">

          {/* Level label + score */}
          <div className="flex items-baseline justify-between mb-1">
            <span className={`text-base font-bold ${textColor}`}>{level}</span>
            <span className="text-sm font-black text-white tabular-nums">{score}%</span>
          </div>

          {/* Slim linear progress bar */}
          <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${score}%`, backgroundColor: barColor, boxShadow: `0 0 8px ${barColor}80` }}
            />
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 leading-snug mb-0">
            {score < 100
              ? 'Complete tasks to improve your application health.'
              : 'Great job! Your application is ready for review.'}
          </p>

          {/* Next Best Action Card */}
          {score < 100 && (
              <div className="mt-5 bg-white/5 rounded-xl border border-white/10 p-4 relative group hover:bg-white/10 transition-colors">
                  <div className="absolute -left-[1px] top-4 bottom-4 w-1 bg-[#0693e3] rounded-r-full"></div>
                  
                  <div className="pl-3">
                      <h5 className="text-sm font-bold text-white mb-1">
                          {nextBestAction}
                      </h5>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                          {formattedDesc}
                      </p>
                      
                      <button
                          onClick={onActionClick}
                          className="text-xs font-bold text-[#0693e3] hover:text-white flex items-center group-hover:translate-x-1 transition-all"
                      >
                          Do this now →
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
