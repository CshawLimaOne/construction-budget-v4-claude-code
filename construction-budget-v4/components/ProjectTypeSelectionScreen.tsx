
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ProjectTypeSelectionScreenProps {
  onSelect: (mode: 'renovation' | 'new_construction') => void;
  onBack: () => void;
}

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

const cards = [
  {
    id: 'renovation' as const,
    image: '/Value_Add.png',
    title: 'Renovation / Value Add',
    tag: 'Fix & Flip · BRRRR · Rehab',
    description:
      'Fix & Flips, cosmetic updates, or heavy rehabs on existing structures. Shapes your line items around As-Is vs. ARV.',
    buttonLabel: 'Select Renovation',
    ariaLabel: 'Select Renovation / Value Add project type',
  },
  {
    id: 'new_construction' as const,
    image: '/New_Construction.png',
    title: 'New Construction',
    tag: 'Ground-Up · Tear-Down · Lot Build',
    description:
      'Building from scratch on a vacant lot or after total demolition. Focuses on Land Value, Hard & Soft Costs, and Development phases.',
    buttonLabel: 'Select New Construction',
    ariaLabel: 'Select New Construction project type',
  },
];

export const ProjectTypeSelectionScreen: React.FC<ProjectTypeSelectionScreenProps> = ({ onSelect, onBack }) => {
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (id: 'renovation' | 'new_construction') => {
    setIsExiting(true);
    setTimeout(() => onSelect(id), 350);
  };

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(onBack, 350);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col overflow-hidden transition-all duration-500 ${isExiting ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
      style={{ backgroundColor: '#F4F5F7' }}
    >
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-[#DFE1E5]">
        <button
          onClick={handleBack}
          aria-label="Back to welcome screen"
          className="group flex items-center gap-2 text-[#78819D] hover:text-[#1E2D5C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
        >
          <div className="p-1.5 rounded-lg border border-[#DFE1E5] bg-white group-hover:bg-[#F6F7F9] transition-colors">
            <ChevronLeftIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Back</span>
        </button>

        <img
          src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
          alt="Lima One Capital"
          width={140}
          height={37}
          className="object-contain hidden md:block"
          style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(44%) saturate(1200%) hue-rotate(200deg) brightness(90%) contrast(95%)' }}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#78819D] tracking-wider hidden sm:block">
            Step {CURRENT_STEP} of {TOTAL_STEPS}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === CURRENT_STEP - 1
                    ? 'w-5 h-2 bg-brand-500'
                    : i < CURRENT_STEP - 1
                    ? 'w-2 h-2 bg-brand-300'
                    : 'w-2 h-2 bg-[#DFE1E5]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">

          {/* Badge */}
          <div className={`welcome-fade-up welcome-delay-0 ${visible ? 'visible' : ''} flex justify-center mb-6`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
              <span className="text-sm font-semibold text-brand-700">
                Project Setup &middot; Step 1 of 4
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className={`welcome-fade-up welcome-delay-1 ${visible ? 'visible' : ''} text-center mb-3`}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-[#1E2D5C]">
              What type of project is this?
            </h1>
          </div>

          {/* Subtitle */}
          <div className={`welcome-fade-up welcome-delay-2 ${visible ? 'visible' : ''} text-center mb-10`}>
            <p className="text-lg text-[#78819D] font-light max-w-xl mx-auto leading-relaxed">
              Your selection shapes the entire budget template, line items, and AI estimates.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <div
                key={card.id}
                className={`welcome-fade-up welcome-delay-${i + 3} ${visible ? 'visible' : ''}`}
              >
                <button
                  onClick={() => handleSelect(card.id)}
                  aria-label={card.ariaLabel}
                  className="group w-full text-left bg-white border border-[#DFE1E5] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={{ boxShadow: '0 2px 8px rgba(30,45,92,0.06)' }}
                >
                  {/* Photo header */}
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                    {/* Subtle brand tint on hover */}
                    <div className="absolute inset-0 bg-brand-700/0 group-hover:bg-brand-700/15 transition-colors duration-300" />
                    {/* Tag badge over image */}
                    <div className="absolute bottom-3 left-4">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/90 text-[#1E2D5C] border border-white/60 backdrop-blur-sm">
                        {card.tag}
                      </span>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#1E2D5C] mb-2">{card.title}</h2>
                    <p className="text-sm text-[#78819D] leading-relaxed mb-5">{card.description}</p>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 group-hover:bg-brand-600 text-white font-bold text-sm transition-colors duration-200">
                      <span>{card.buttonLabel}</span>
                      <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
