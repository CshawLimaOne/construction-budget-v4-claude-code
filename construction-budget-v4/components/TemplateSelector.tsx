
import React from 'react';
import { ComplexModal } from './ComplexModal';
import { BudgetTemplate } from '../types';
import { BuildingIcon, CheckCircleIcon } from './Icons';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    templates: BudgetTemplate[];
    onSelectTemplate: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ isOpen, onClose, templates, onSelectTemplate }) => {
    const footer = (
        <button onClick={onClose} className="button-base bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
            Cancel
        </button>
    );

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Template Library" footer={footer} size="xl">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select a Starting Blueprint</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Choose a pre-filled template to jumpstart your budget. You can customize all line items later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <button 
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className="flex flex-col text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition-all group relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <BuildingIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                {formatCurrency(template.totalCostEstimate)}
                            </span>
                        </div>
                        
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {template.name}
                        </h4>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                            {template.description}
                        </p>

                        <div className="mt-auto flex flex-wrap gap-2">
                            {template.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded border border-slate-100 dark:border-slate-600">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircleIcon className="w-6 h-6 text-brand-600" />
                        </div>
                    </button>
                ))}
            </div>
        </ComplexModal>
    );
};
