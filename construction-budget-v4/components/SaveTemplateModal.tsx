
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
            <button onClick={onClose} className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC]">
                Cancel
            </button>
            <button
                onClick={handleSaveClick}
                disabled={!name.trim()}
                className="button-base bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 disabled:bg-[#BCBFC7] disabled:cursor-not-allowed"
            >
                Save Template
            </button>
        </>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Save as Template" footer={footer} size="md">
            <div className="space-y-4">
                <div className="bg-brand-50 p-4 rounded-lg border border-brand-200 flex items-start">
                    <div className="bg-brand-50 p-2 rounded-full mr-3 text-brand-500">
                        <BuildingIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#1E2D5C]">Create New Blueprint</h4>
                        <p className="text-sm text-brand-500 mt-1">
                            Save your current budget line items, projected specs, and material quality settings as a reusable template for future projects.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#1E2D5C] mb-2">
                        Template Name
                    </label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. My Standard Flip - 3 Bed" 
                        className="form-input-premium w-full"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[#1E2D5C] mb-2">
                        Description (Optional)
                    </label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={3}
                        placeholder="Briefly describe what this template is best used for..." 
                        className="form-input-premium w-full resize-none"
                    />
                </div>
            </div>
        </ComplexModal>
    );
};
