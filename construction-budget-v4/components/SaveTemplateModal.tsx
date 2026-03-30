
import React, { useState } from 'react';
import { ComplexModal } from './ComplexModal';
import { BuildingIcon } from './Icons';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSaveClick = () => {
        if (name.trim()) {
            onSave(name, description);
            setName('');
            setDescription('');
        }
    };

    const footer = (
        <>
            <button onClick={onClose} className="button-base bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                Cancel
            </button>
            <button 
                onClick={handleSaveClick} 
                disabled={!name.trim()}
                className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                Save Template
            </button>
        </>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Save as Template" footer={footer} size="md">
            <div className="space-y-4">
                <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-100 dark:border-brand-800 flex items-start">
                    <div className="bg-brand-100 dark:bg-brand-800 p-2 rounded-full mr-3 text-brand-600 dark:text-brand-300">
                        <BuildingIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-900 dark:text-brand-100">Create New Blueprint</h4>
                        <p className="text-sm text-brand-700 dark:text-brand-300 mt-1">
                            Save your current budget line items, projected specs, and material quality settings as a reusable template for future projects.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Template Name
                    </label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. My Standard Flip - 3 Bed" 
                        className="spreadsheet-input w-full"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Description (Optional)
                    </label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={3}
                        placeholder="Briefly describe what this template is best used for..." 
                        className="spreadsheet-input w-full resize-none"
                    />
                </div>
            </div>
        </ComplexModal>
    );
};
