
import React from 'react';
import { ChevronLeftIcon } from './Icons';

interface ProjectTypeSelectionScreenProps {
  onSelect: (mode: 'renovation' | 'new_construction') => void;
  onBack: () => void;
}

const cards = [
  {
    id: 'renovation' as const,
    image: '/Value_Add.png',
    title: 'Renovation / Value Add',
    description:
      'Fix & Flips, cosmetic updates, or heavy rehabs on existing structures. Focuses on As-Is vs. Projected Value and repairs.',
    buttonLabel: 'Select Renovation',
  },
  {
    id: 'new_construction' as const,
    image: '/New_Construction.png',
    title: 'New Construction',
    description:
      'Building from scratch on a vacant lot or after total demolition. Focuses on Land Value, Hard & Soft Costs, and Development phases.',
    buttonLabel: 'Select New Construction',
  },
];

export const ProjectTypeSelectionScreen: React.FC<ProjectTypeSelectionScreenProps> = ({ onSelect, onBack }) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden text-white"
      style={{
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      {/* Warm gradient overlay — heavy enough to dissolve the photo into warm color tones */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(30,15,5,0.92) 0%, rgba(80,40,10,0.88) 40%, rgba(20,30,70,0.92) 100%)' }}
      />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center text-white hover:text-white transition-colors font-medium group z-20"
        aria-label="Back to Welcome Screen"
      >
        <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/20 transition-colors backdrop-blur-sm">
          <ChevronLeftIcon className="w-5 h-5" />
        </div>
        <span className="ml-3 text-sm uppercase tracking-wider font-bold" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>Back</span>
      </button>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Headline */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-white"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}
          >
            What type of project is this?
          </h1>
          <p className="text-base text-white font-light max-w-2xl mx-auto" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
            We'll tailor the experience based on your construction goals.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              className="group relative flex flex-col text-left rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
              style={{
                minHeight: '380px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Photo layer — fades out on hover */}
              <div
                className="absolute inset-0 transition-opacity duration-500 opacity-100 group-hover:opacity-0"
                style={{
                  backgroundImage: `url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Gradient overlay on top of photo */}
              <div
                className="absolute inset-0 transition-opacity duration-500 opacity-100 group-hover:opacity-0"
                style={{ background: 'linear-gradient(to top, rgba(8,15,40,0.95) 0%, rgba(8,15,40,0.55) 50%, rgba(8,15,40,0.25) 100%)' }}
              />

              {/* Solid hover background */}
              <div className="absolute inset-0 bg-[#0d1b3e] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Left accent border on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0693e3] opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Outer border glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(6,147,227,0.4)' }}
              />

              {/* Card content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center h-full p-8">
                {/* Title */}
                <h2
                  className="text-2xl font-bold text-white mb-3 leading-tight"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
                >
                  {card.title}
                </h2>

                {/* Description */}
                <p
                  className="text-white text-sm leading-relaxed mb-6 max-w-sm"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                >
                  {card.description}
                </p>

                {/* Select Button */}
                <div className="mt-4">
                  <span
                    className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-white border border-white/40 transition-all duration-300 group-hover:bg-[#0693e3] group-hover:border-[#0693e3]"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    {card.buttonLabel}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
