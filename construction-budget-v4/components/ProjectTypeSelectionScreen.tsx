
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ProjectTypeSelectionScreenProps {
  onSelect: (mode: 'renovation' | 'new_construction') => void;
  onBack: () => void;
}

const HERO_IMAGES = [
  '/hero-bg.png',
  '/New_Construction.png',
  '/Value_Add.png',
];

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
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [nextHeroIndex, setNextHeroIndex] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Staggered entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Crossfading hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentHeroIndex + 1) % HERO_IMAGES.length;
      setNextHeroIndex(next);
      setIsFading(true);
      setTimeout(() => {
        setCurrentHeroIndex(next);
        setIsFading(false);
      }, 1500);
    }, 7000);
    return () => clearInterval(interval);
  }, [currentHeroIndex]);

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
      className={`pts-root relative min-h-screen w-full flex flex-col overflow-hidden text-white transition-all duration-500
        ${isExiting ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
    >
      {/* ── Crossfading Hero Background ── */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${HERO_IMAGES[currentHeroIndex]})`, opacity: 1 }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms]"
          style={{ backgroundImage: `url(${HERO_IMAGES[nextHeroIndex]})`, opacity: isFading ? 1 : 0 }}
        />
        {/* Same cinematic overlay as WelcomeScreen */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(10,15,35,0.88) 0%, rgba(15,30,70,0.78) 40%, rgba(10,15,35,0.85) 100%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* ── Ambient Orbs (reuse from styles.css) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="welcome-orb welcome-orb-1" />
        <div className="welcome-orb welcome-orb-2" />
        <div className="welcome-orb welcome-orb-3" />
      </div>

      {/* ── Top Bar: Back · Logo · Step indicator ── */}
      <div className="relative z-20 flex-shrink-0 flex items-center justify-between px-6 py-4">
        {/* Back */}
        <button
          onClick={handleBack}
          aria-label="Back to welcome screen"
          className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-full"
        >
          <div className="p-2 rounded-full bg-white/10 border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 transition-all duration-200 backdrop-blur-sm">
            <ChevronLeftIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 group-hover:text-white transition-colors">
            Back
          </span>
        </button>

        {/* Logo (center on md+) */}
        <div className="hidden md:block">
          <img
            src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
            alt="Lima One Capital"
            width={140}
            height={37}
            className="object-contain opacity-90"
          />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wider hidden sm:block">
            Step {CURRENT_STEP} of {TOTAL_STEPS}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === CURRENT_STEP - 1
                    ? 'w-5 h-2 bg-brand-400'
                    : i < CURRENT_STEP - 1
                    ? 'w-2 h-2 bg-brand-600'
                    : 'w-2 h-2 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl">

          {/* Badge */}
          <div className={`welcome-fade-up welcome-delay-0 ${visible ? 'visible' : ''} flex justify-center mb-5`}>
            <div className="welcome-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
              <span className="text-sm font-semibold text-brand-200">
                Project Setup &middot; Choose Your Project Type
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className={`welcome-fade-up welcome-delay-1 ${visible ? 'visible' : ''} text-center mb-3`}>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05]">
              What type of<br />
              <span className="welcome-gradient-text">project is this?</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className={`welcome-fade-up welcome-delay-2 ${visible ? 'visible' : ''} text-center mb-10`}>
            <p className="text-lg text-slate-300 font-light max-w-xl mx-auto leading-relaxed">
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
                  className="pts-card group relative w-full text-left rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  style={{ minHeight: '360px' }}
                >
                  {/* Photo layer — stays visible, zooms slightly on hover */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ backgroundImage: `url(${card.image})` }}
                  />

                  {/* Persistent gradient for text readability (bottom-up) */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.97) 0%, rgba(5,10,30,0.65) 45%, rgba(5,10,30,0.25) 100%)' }}
                  />

                  {/* Hover: deepen the tint + add blue shimmer */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(to top, rgba(6,50,120,0.55) 0%, rgba(6,50,120,0.2) 60%, transparent 100%)' }}
                  />

                  {/* Blue glow border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 1.5px rgba(6,147,227,0.6)' }}
                  />

                  {/* Left accent line on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-l-2xl" />

                  {/* Card Content — pinned to bottom */}
                  <div className="absolute inset-0 flex flex-col justify-end p-7">
                    {/* Type tag */}
                    <div className="mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-500/25 border border-brand-400/40 text-brand-200 backdrop-blur-sm">
                        {card.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                      {card.title}
                    </h2>

                    {/* Description — visible by default, enhanced on hover */}
                    <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-xs drop-shadow-md">
                      {card.description}
                    </p>

                    {/* CTA Button — slides up from below on hover */}
                    <div className="transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 group-hover:bg-brand-400 text-white font-bold text-sm shadow-lg group-hover:shadow-[0_0_20px_rgba(6,147,227,0.5)] transition-all duration-300">
                        <span>{card.buttonLabel}</span>
                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
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
