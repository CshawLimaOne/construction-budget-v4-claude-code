
import React from 'react';
import { ComplexModal } from './ComplexModal';

interface ValidatorLogicModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ValidatorLogicModal: React.FC<ValidatorLogicModalProps> = ({ isOpen, onClose }) => {
    const footer = (
        <button onClick={onClose} className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] focus:ring-slate-500">
            Close
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Smart Budget Validator V3.0 Algorithm" footer={footer} size="xl">
            <div className="space-y-8 text-slate-700 dark:text-slate-300 text-sm">
                
                {/* Introduction */}
                <div className="p-4 bg-[#0693e3]/8 dark:bg-[#0693e3]/15 rounded-lg border border-[#0693e3]/25 dark:border-[#0693e3]/30">
                    <p>
                        The <strong>Smart Budget Validator V3.0</strong> calculates a "Feasible Target Budget" to compare against the borrower's submission.
                        Significant deviations from this target trigger risk flags.
                    </p>
                    <p className="mt-2 font-mono text-xs bg-white dark:bg-slate-800 p-2 rounded border border-[#0693e3]/20 dark:border-[#0693e3]/25">
                        Target = (Base Rate × Location × Finish × Last Mile) × Square Footage
                    </p>
                </div>

                {/* Factor 1 */}
                <section>
                    <h3 className="text-base font-bold text-[#0693e3] dark:text-sky-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                        1. Base Rate Determination
                    </h3>
                    <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">
                        The system establishes a baseline Cost Per Square Foot (PPSF) based on the Rehab Type and Square Footage.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md">
                            <h4 className="font-semibold text-xs uppercase tracking-wide mb-1">New Construction</h4>
                            <ul className="list-disc pl-4 text-xs space-y-1">
                                <li><strong>State History Check:</strong> Uses internal state averages (e.g., CA $347, TX $126).</li>
                                <li><strong>Fallback:</strong> Uses National Pricing Tiers based on SqFt (Economies of scale).</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md">
                            <h4 className="font-semibold text-xs uppercase tracking-wide mb-1">Fix & Flip</h4>
                            <ul className="list-disc pl-4 text-xs space-y-1">
                                <li><strong>Light-Cosmetic:</strong> Uses "Under $100k" tiers (Start ~$52/sf).</li>
                                <li><strong>Scope Creep Logic:</strong> If calculated budget &gt; $125k, automatically switches to "Over $100k" tiers to prevent under-budgeting.</li>
                                <li><strong>Standard/Heavy:</strong> Uses "Over $100k" tiers (Start ~$137/sf).</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Factor 2 */}
                <section>
                    <h3 className="text-base font-bold text-[#0693e3] dark:text-sky-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                        2. Multipliers & Adjustments
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-left border border-slate-200 dark:border-slate-600">
                            <thead className="bg-slate-100 dark:bg-slate-700 font-semibold">
                                <tr>
                                    <th className="p-2 border-b dark:border-slate-600">Factor</th>
                                    <th className="p-2 border-b dark:border-slate-600">Source</th>
                                    <th className="p-2 border-b dark:border-slate-600">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                <tr>
                                    <td className="p-2 font-medium">Location Factor</td>
                                    <td className="p-2">Property State</td>
                                    <td className="p-2">Varies (e.g., CA 1.45x, TX 0.95x, AL 0.88x)</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium">Finish Factor</td>
                                    <td className="p-2">Material Quality (Q1-Q6)</td>
                                    <td className="p-2">
                                        Q1 (Luxury): <strong>1.75x</strong><br/>
                                        Q2/Q3 (Custom): <strong>1.30x</strong><br/>
                                        Q5/Q6 (Functional): <strong>0.90x</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium">"Last Mile"</td>
                                    <td className="p-2">Analyst Selection</td>
                                    <td className="p-2">
                                        Island: <strong>+15%</strong><br/>
                                        Ultra-Urban: <strong>+10%</strong><br/>
                                        Remote Rural: <strong>+5%</strong>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Factor 3 */}
                <section>
                    <h3 className="text-base font-bold text-[#0693e3] dark:text-sky-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                        3. Category Validation Rules
                    </h3>
                    <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">
                        Violating these "Rule of Thumb" ratios triggers specific Risk Flags and adds points to the Risk Score.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-4 gap-2 text-xs font-bold bg-slate-100 dark:bg-slate-700 p-2 rounded-t-md">
                            <div className="col-span-1">Check</div>
                            <div className="col-span-2">Trigger Condition</div>
                            <div className="col-span-1 text-right">Penalty</div>
                        </div>
                        {/* Rows */}
                        {[
                            { name: 'Total Feasibility', cond: 'Budget < 85% of Target', risk: 'Severe Under-budgeting', pts: '+40 pts' },
                            { name: 'Total Feasibility', cond: 'Budget < 95% of Target', risk: 'Moderate Under-budgeting', pts: '+15 pts' },
                            { name: 'Contingency', cond: '< 5% of Total', risk: 'Liquidity risk', pts: '+25 pts' },
                            { name: 'Structure', cond: '< 17% of Total (New/Heavy)', risk: 'Missing lumber/labor', pts: '+20 pts' },
                            { name: 'Foundation', cond: '< 8% of Total (Non-Cosmetic)', risk: 'Missing concrete/labor', pts: '+15 pts' },
                            { name: 'Soft Costs', cond: '> 15% of Total', risk: 'Over-capitalization', pts: '+10 pts' },
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-4 gap-2 text-xs p-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className="col-span-1 font-medium">{row.name}</div>
                                <div className="col-span-2">{row.cond} <span className="text-slate-400">({row.risk})</span></div>
                                <div className="col-span-1 text-right font-mono text-red-600 dark:text-red-400 font-bold">{row.pts}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Factor 4 */}
                <section>
                    <h3 className="text-base font-bold text-[#0693e3] dark:text-sky-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                        4. Market Health Overlays
                    </h3>
                    <div className="flex flex-col space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800">
                            <span><strong>Watchlist Zips:</strong> Property in high-risk zone (e.g., Coastal FL)</span>
                            <span className="font-mono text-red-600 font-bold">+25 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 dark:border-orange-800">
                            <span><strong>Delinquency:</strong> Market delinquency &gt; 5%</span>
                            <span className="font-mono text-red-600 font-bold">+20 pts</span>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                            <strong className="text-yellow-800 dark:text-yellow-400">⚠️ Market Trend Capping Rule</strong>
                            <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                                If Market Price Trend is <strong>"Declining"</strong> or <strong>"Crash"</strong>, the final Deal Grade is capped at <strong>'C'</strong>. 
                                Even a perfect borrower cannot get an A/B grade in a crashing market.
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </ComplexModal>
    );
};
