
import React from 'react';
import { ComplexModal } from './ComplexModal';

interface DealStrengthLogicModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DealStrengthLogicModal: React.FC<DealStrengthLogicModalProps> = ({ isOpen, onClose }) => {
    const footer = (
        <button onClick={onClose} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
            Got it
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="How Deal Strength is Calculated" footer={footer} size="lg">
            <div className="space-y-6 text-slate-700 dark:text-slate-300">
                <p className="text-sm">
                    The <strong>Deal Strength Score</strong> (0-100) is a measure of the <em>quality and completeness</em> of your application. 
                    A higher score helps our analysts review your loan faster and reduces the likelihood of revision requests.
                </p>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-600">
                            <tr>
                                <th className="p-3 w-1/4">Category</th>
                                <th className="p-3 w-1/6">Points</th>
                                <th className="p-3">Requirements to Earn Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            <tr>
                                <td className="p-3 font-medium text-[#1E2E5C] dark:text-sky-400">1. The Basics</td>
                                <td className="p-3 font-bold">20 pts</td>
                                <td className="p-3 text-xs">
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Full Property Address & Price (+5)</li>
                                        <li>Answered all Project Questions (+5)</li>
                                        <li>Selected Condition, Rehab Type, & Quality (+10)</li>
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-[#1E2E5C] dark:text-sky-400">2. The Team</td>
                                <td className="p-3 font-bold">15 pts</td>
                                <td className="p-3 text-xs">
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Entered GC Business Name (+5)</li>
                                        <li>Uploaded License/Insurance OR Invited GC (+10)</li>
                                    </ul>
                                    <p className="mt-2 text-slate-500 italic">
                                        *For Light-Cosmetic or Standard-Full rehabs, these points are awarded automatically as a GC is optional.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-[#1E2E5C] dark:text-sky-400">3. Budget Detail</td>
                                <td className="p-3 font-bold">30 pts</td>
                                <td className="p-3 text-xs">
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Budget has &gt; 5 line items (+10)</li>
                                        <li>Budget has &gt; 15 line items (+10)</li>
                                        <li>Soft Costs included (not $0) (+10)</li>
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-[#1E2E5C] dark:text-sky-400">4. Descriptive Quality</td>
                                <td className="p-3 font-bold">20 pts</td>
                                <td className="p-3 text-xs">
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Custom descriptions on 3+ items (+10)</li>
                                        <li>Scope of Work statement &gt; 50 chars (+10)</li>
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium text-[#1E2E5C] dark:text-sky-400">5. Visual Evidence</td>
                                <td className="p-3 font-bold">15 pts</td>
                                <td className="p-3 text-xs">
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>At least 1 photo uploaded (+5)</li>
                                        <li>5+ photos uploaded (+10)</li>
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 font-bold">
                            <tr>
                                <td className="p-3">TOTAL</td>
                                <td className="p-3">100 pts</td>
                                <td className="p-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-1">Difference between Deal Strength & Deal Risk</h4>
                    <ul className="text-xs text-yellow-800 dark:text-yellow-300 list-disc pl-4 space-y-1">
                        <li><strong>Deal Strength (You Control):</strong> Focuses on completeness, detail, and evidence. A high score means you've told the story well.</li>
                        <li><strong>Deal Risk (Market Factors):</strong> Focuses on market trends, zip code risk, and financial feasibility. These are largely outside your control but affect approval terms.</li>
                    </ul>
                </div>
            </div>
        </ComplexModal>
    );
};