
import React, { useState, useEffect } from 'react';
import { ComplexModal } from './ComplexModal';
import { BudgetItem } from '../types';
import { NC_SOFT_COST_ROWS } from '../constants';
import { InfoIcon, MagicWandIcon } from './Icons';

interface SoftCostWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: BudgetItem[];
  onSave: (updatedItems: { id: string; budget: number }[]) => void;
}

export const SoftCostWizardModal: React.FC<SoftCostWizardModalProps> = ({ isOpen, onClose, currentItems, onSave }) => {
  // Local state to manage the inputs before saving
  const [costs, setCosts] = useState<Record<string, number>>({});

  // When modal opens, populate local state with current budget values
  useEffect(() => {
    if (isOpen) {
      const initialCosts: Record<string, number> = {};
      NC_SOFT_COST_ROWS.forEach(row => {
        // Find existing item in currentItems by ID or Name match
        const existing = currentItems.find(i => i.id === row.id || i.drawItem === row.drawItem);
        initialCosts[row.id] = existing ? existing.budget : 0;
      });
      // Also look for standard items that might be relevant
      const standardItems = ['Building Permit*', 'Impact Fees', 'Survey/Drawings/Plans*'];
      standardItems.forEach(name => {
          const existing = currentItems.find(i => i.drawItem === name);
          if (existing) {
              initialCosts[existing.id] = existing.budget;
          }
      });
      
      setCosts(initialCosts);
    }
  }, [isOpen, currentItems]);

  const handleCostChange = (id: string, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
    setCosts(prev => ({ ...prev, [id]: numValue }));
  };

  const handleSave = () => {
    const updates = Object.entries(costs).map(([id, budget]) => ({ id, budget }));
    onSave(updates);
    onClose();
  };

  const totalSoftCosts = Object.values(costs).reduce((acc: number, val: number) => acc + val, 0);

  // Group items for better UX
  const professionalServices = NC_SOFT_COST_ROWS.filter(r => ['Architecture & Design', 'Civil Engineering', 'Soil / Geotech Report', 'Surveying (Topo, Stake, Final)'].includes(r.drawItem));
  const municipalFees = NC_SOFT_COST_ROWS.filter(r => ['School Impact Fees', 'Water/Sewer Tap Fees'].includes(r.drawItem));
  
  // Find standard items to include in the wizard for completeness
  const permitItem = currentItems.find(i => i.drawItem === 'Building Permit*');
  const impactItem = currentItems.find(i => i.drawItem === 'Impact Fees');

  const renderInput = (id: string, label: string, budget: number) => (
      <div key={id} className="flex justify-between items-center py-3 border-b border-[#DFE1E5] last:border-0">
          <label className="text-sm font-medium text-[#1E2D5C] w-2/3">{label}</label>
          <div className="w-1/3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78819D] text-sm">$</span>
              <input
                  type="number"
                  value={budget === 0 ? '' : budget}
                  onChange={(e) => handleCostChange(id, e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-right border border-[#DFE1E5] rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 bg-white text-[#1E2D5C]"
                  placeholder="0"
              />
          </div>
      </div>
  );

  const footer = (
    <>
        <div className="mr-auto text-sm font-bold text-[#1E2D5C]">
            Total: <span className="text-brand-500 text-lg ml-1">${totalSoftCosts.toLocaleString()}</span>
        </div>
        <button onClick={onClose} className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] mr-2">
            Cancel
        </button>
        <button onClick={handleSave} className="button-base bg-brand-500 text-white hover:bg-brand-600">
            Update Budget
        </button>
    </>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="New Construction Soft Cost Wizard" footer={footer} size="lg">
        <div className="space-y-6">
            <div className="bg-brand-50 p-4 rounded-lg border border-brand-200 flex items-start">
                <div className="bg-brand-50 p-2 rounded-full mr-3 text-brand-500">
                    <MagicWandIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-[#1E2D5C]">Plan Your Soft Costs</h4>
                    <p className="text-sm text-[#78819D] mt-1">
                        Soft costs for new construction can be significant (often $50k+). Use this wizard to ensure you've budgeted for all necessary professional services and municipal fees.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Professional Services */}
                <div>
                    <h4 className="text-xs font-bold uppercase text-[#78819D] mb-3 border-b border-[#DFE1E5] pb-1">Professional Services</h4>
                    {professionalServices.map(row => renderInput(row.id, row.drawItem, costs[row.id] || 0))}
                </div>

                {/* Column 2: Municipal & Impact Fees */}
                <div>
                    <h4 className="text-xs font-bold uppercase text-[#78819D] mb-3 border-b border-[#DFE1E5] pb-1">Municipal & Impact Fees</h4>
                    {permitItem && renderInput(permitItem.id, "Building Permit (Base)", costs[permitItem.id] || 0)}
                    {impactItem && renderInput(impactItem.id, "General Impact Fees", costs[impactItem.id] || 0)}
                    {municipalFees.map(row => renderInput(row.id, row.drawItem, costs[row.id] || 0))}
                </div>
            </div>
            
            <div className="text-xs text-[#78819D] bg-[#F6F7F9] p-3 rounded italic">
                <InfoIcon className="w-3 h-3 inline mr-1" />
                Note: Tap fees vary wildly by district. Check with your local utility provider for exact quotes.
            </div>
        </div>
    </ComplexModal>
  );
};
