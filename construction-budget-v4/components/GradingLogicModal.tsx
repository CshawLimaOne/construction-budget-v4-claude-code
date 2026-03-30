
import React from 'react';
import { ComplexModal } from './ComplexModal';

interface GradingLogicModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GradingLogicModal: React.FC<GradingLogicModalProps> = ({ isOpen, onClose }) => {
    const footer = (
        <button onClick={onClose} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
            Close
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Construction Budget Risk & Deal Grading Logic" footer={footer} size="lg">
            <div className="space-y-8 text-slate-700 dark:text-slate-300">
                
                {/* Introduction */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <p className="text-sm">
                        This report outlines the algorithmic logic used to assess project risk and assign a quality grade to loan applications. 
                        The system uses a weighted composite scoring model to ensure consistency across all deals.
                    </p>
                </div>

                {/* Risk Score Section */}
                <section>
                    <h3 className="text-lg font-bold text-[#0693e3] dark:text-sky-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                        1. Risk Score (0 - 100)
                    </h3>
                    <p className="text-sm mb-4">
                        The Risk Score measures the potential downside of a project. <strong className="text-red-600 dark:text-red-400">A higher score indicates higher risk.</strong>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">A. Market Factors</h4>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Watchlist Zip:</strong> <span className="font-mono text-red-600">+25 pts</span> (High-risk zones)</li>
                                <li><strong>Market Trend:</strong> <span className="font-mono text-red-600">+30 pts</span> if "Declining" or "Crash"</li>
                                <li><strong>Delinquency:</strong> <span className="font-mono text-red-600">+20 pts</span> if &gt; 5%</li>
                                <li><strong>Inventory:</strong> <span className="font-mono text-red-600">+10 pts</span> if Days on Market &gt; 120</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">B. Financial Feasibility</h4>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                                <li><strong>Severe Under-budgeting:</strong> <span className="font-mono text-red-600">+40 pts</span> (&gt;15% below target)</li>
                                <li><strong>Moderate Under-budgeting:</strong> <span className="font-mono text-red-600">+15 pts</span> (5-15% below target)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-sm">C. Construction Logic (Category Validation)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left border border-slate-200 dark:border-slate-600">
                                <thead className="bg-slate-100 dark:bg-slate-700 font-semibold">
                                    <tr>
                                        <th className="p-2 border-b dark:border-slate-600">Check</th>
                                        <th className="p-2 border-b dark:border-slate-600">Trigger Condition</th>
                                        <th className="p-2 border-b dark:border-slate-600">Penalty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    <tr><td className="p-2">Contingency</td><td className="p-2">&lt; 5% of Total Budget</td><td className="p-2 font-mono text-red-600">+25 pts</td></tr>
                                    <tr><td className="p-2">Structure</td><td className="p-2">&lt; 17% (New Const / Heavy Rehab)</td><td className="p-2 font-mono text-red-600">+20 pts</td></tr>
                                    <tr><td className="p-2">Foundation</td><td className="p-2">&lt; 8% (Non-Cosmetic)</td><td className="p-2 font-mono text-red-600">+15 pts</td></tr>
                                    <tr><td className="p-2">Finishes</td><td className="p-2">&lt; 25% (High-End Q1-Q3)</td><td className="p-2 font-mono text-red-600">+15 pts</td></tr>
                                    <tr><td className="p-2">Soft Costs</td><td className="p-2">&gt; 15% (Over-capitalization)</td><td className="p-2 font-mono text-red-600">+10 pts</td></tr>
                                    <tr><td className="p-2">Systems (MEP)</td><td className="p-2">&lt; 14% of Total Budget</td><td className="p-2 font-mono text-red-600">+10 pts</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Deal Grade Section */}
                <section>
                    <h3 className="text-lg font-bold text-[#0693e3] dark:text-sky-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                        2. Deal Grade (A+ to F)
                    </h3>
                    <p className="text-sm mb-4">
                        The Deal Grade is a weighted composite score. <strong className="text-green-600 dark:text-green-400">A higher score indicates a better deal.</strong>
                    </p>

                    <div className="mb-6">
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-2">Scoring Weights</h4>
                        <div className="flex h-4 rounded-full overflow-hidden text-[10px] font-bold text-white text-center leading-4">
                            <div className="bg-[#0693e3] w-[35%]">Financial (35%)</div>
                            <div className="bg-green-600 w-[25%]">Sponsor (25%)</div>
                            <div className="bg-purple-600 w-[20%]">Market (20%)</div>
                            <div className="bg-orange-500 w-[20%]">Data (20%)</div>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="p-3 border border-[#0693e3]/25 bg-[#0693e3]/8 dark:bg-[#0693e3]/15 dark:border-[#0693e3]/30 rounded-md">
                            <h5 className="font-bold text-[#0578c5] dark:text-[#5bb8f5]">1. Financial Score (35%)</h5>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                Calculated as <span className="font-mono">100 - Risk Score</span>. Low risk results in a high financial score.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 border border-slate-200 dark:border-slate-600 rounded-md">
                                <h5 className="font-bold text-slate-800 dark:text-slate-200">2. Sponsorship Score (25%)</h5>
                                <p className="text-xs text-slate-500 mb-2">Baseline: 50 pts</p>
                                <ul className="text-xs space-y-1">
                                    <li className="flex justify-between"><span>Repeat Borrower</span><span className="font-mono text-green-600">+20</span></li>
                                    <li className="flex justify-between"><span>Experienced GC</span><span className="font-mono text-green-600">+15</span></li>
                                    <li className="flex justify-between"><span>Clean History</span><span className="font-mono text-green-600">+15</span></li>
                                </ul>
                            </div>
                            <div className="p-3 border border-slate-200 dark:border-slate-600 rounded-md">
                                <h5 className="font-bold text-slate-800 dark:text-slate-200">3. Market Score (20%)</h5>
                                <p className="text-xs text-slate-500 mb-2">Baseline: 100 pts</p>
                                <ul className="text-xs space-y-1">
                                    <li className="flex justify-between"><span>Delinquency &gt; 4%</span><span className="font-mono text-red-600">-25</span></li>
                                    <li className="flex justify-between"><span>Trend: Declining</span><span className="font-mono text-red-600">-40</span></li>
                                    <li className="flex justify-between"><span>Trend: Softening</span><span className="font-mono text-red-600">-15</span></li>
                                    <li className="flex justify-between"><span>Supply &gt; 6 mos</span><span className="font-mono text-red-600">-10</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-3 border border-slate-200 dark:border-slate-600 rounded-md">
                            <h5 className="font-bold text-slate-800 dark:text-slate-200">4. Completeness Score (20%)</h5>
                            <p className="text-xs text-slate-500 mb-2">Points awarded for provided data:</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Scope Statement (+25)</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Plans (+25)</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Permits (+25)</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Detailed Line Items (+25)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-400 text-sm mb-1">
                            ⚠️ Critical Capping Rule
                        </h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Regardless of the numerical score, if the <strong>Market Price Trend</strong> is "Declining" or "Crash", the final Deal Grade is <strong>capped at 'C'</strong>. This ensures no deal in a crashing market receives an A or B grade.
                        </p>
                    </div>
                </section>
            </div>
        </ComplexModal>
    );
};
