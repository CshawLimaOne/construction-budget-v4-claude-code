
import React, { useState, useEffect } from 'react';
import { BudgetTemplate } from '../types';
import { BuildingIcon, CheckCircleIcon, ChevronLeftIcon } from './Icons';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    templates: BudgetTemplate[];
    onSelectTemplate: (templateId: string) => void;
}

const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ isOpen, onClose, templates, onSelectTemplate }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => setVisible(true), 80);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ backgroundColor: '#F4F5F7' }}>

            {/* Top Bar */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-[#DFE1E5]">
                <button
                    onClick={onClose}
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

                <div className="w-24" /> {/* spacer to balance back button */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-6 py-10">
                <div className="w-full max-w-5xl mx-auto">

                    {/* Header */}
                    <div className={`welcome-fade-up welcome-delay-0 ${visible ? 'visible' : ''} text-center mb-2`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                            <span className="text-sm font-semibold text-brand-700">Template Library</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-[#1E2D5C] mb-3">
                            Select a Starting Blueprint
                        </h1>
                        <p className="text-lg text-[#78819D] font-light max-w-xl mx-auto">
                            Choose a pre-filled template to jumpstart your budget. You can customize all line items after.
                        </p>
                    </div>

                    {/* Template Cards */}
                    <div className={`welcome-fade-up welcome-delay-1 ${visible ? 'visible' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10`}>
                        {templates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => onSelectTemplate(template.id)}
                                className="group flex flex-col text-left bg-white border border-[#DFE1E5] rounded-2xl p-5 hover:border-brand-400 hover:-translate-y-1 transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                style={{ boxShadow: '0 2px 8px rgba(30,45,92,0.06)' }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                        <BuildingIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold bg-[#F6F7F9] text-[#78819D] px-2.5 py-1 rounded-lg border border-[#DFE1E5]">
                                        {formatCurrency(template.totalCostEstimate)}
                                    </span>
                                </div>

                                <h4 className="font-bold text-lg text-[#1E2D5C] mb-2 group-hover:text-brand-600 transition-colors">
                                    {template.name}
                                </h4>

                                <p className="text-sm text-[#78819D] mb-4 line-clamp-3 flex-1">
                                    {template.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 bg-[#F6F7F9] text-[#78819D] rounded-lg border border-[#DFE1E5]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircleIcon className="w-5 h-5 text-brand-500" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
