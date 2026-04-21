
import React from 'react';
import { ComplexModal } from './ComplexModal';

interface GradingLogicModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GradingLogicModal: React.FC<GradingLogicModalProps> = ({ isOpen, onClose }) => {
    const footer = (
        <button onClick={onClose} className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC]">
            Close
        </button>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Construction Budget Risk & Deal Grading Logic" footer={footer} size="lg">
            <div className="space-y-8 text-[#1E2D5C]">

                {/* Introduction */}
                <div className="p-4 bg-[#F6F7F9] rounded-lg border border-[#DFE1E5]">
                    <p className="text-sm">
                        This report outlines the algorithmic logic used to assess project risk and assign a quality grade to loan applications.
                        The system uses a weighted composite scoring model to ensure consistency across all deals.
                    </p>
                </div>

                {/* Risk Score Section */}
                <section>
                    <h3 className="text-lg font-bold text-brand-500 mb-3 border-b border-[#DFE1E5] pb-2">
                        1. Risk Score (0 - 100)
                    </h3>
                    <p className="text-sm mb-4">
                        The Risk Score measures the potential downside of a project. <strong className="text-[#B92814]">A higher score indicates higher risk.</strong>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-[#1E2D5C] mb-2">A. Market Factors</h4>
                            <ul className="list-disc pl-5 space-y-1 text-[#78819D]">
                                <li><strong>Watchlist Zip:</strong> <span className="font-mono text-[#B92814]">+25 pts</span> (High-risk zones)</li>
                                <li><strong>Market Trend:</strong> <span className="font-mono text-[#B92814]">+30 pts</span> if "Declining" or "Crash"</li>
                                <li><strong>Delinquency:</strong> <span className="font-mono text-[#B92814]">+20 pts</span> if &gt; 5%</li>
                                <li><strong>Inventory:</strong> <span className="font-mono text-[#B92814]">+10 pts</span> if Days on Market &gt; 120</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1E2D5C] mb-2">B. Financial Feasibility</h4>
                            <ul className="list-disc pl-5 space-y-1 text-[#78819D]">
                                <li><strong>Severe Under-budgeting:</strong> <span className="font-mono text-[#B92814]">+40 pts</span> (&gt;15% below target)</li>
                                <li><strong>Moderate Under-budgeting:</strong> <span className="font-mono text-[#B92814]">+15 pts</span> (5-15% below target)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold text-[#1E2D5C] mb-2 text-sm">C. Construction Logic (Category Validation)</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left border border-[#DFE1E5]">
                                <thead className="bg-[#F6F7F9] font-semibold">
                                    <tr>
                                        <th className="p-2 border-b border-[#DFE1E5]">Check</th>
                                        <th className="p-2 border-b border-[#DFE1E5]">Trigger Condition</th>
                                        <th className="p-2 border-b border-[#DFE1E5]">Penalty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DFE1E5]">
                                    <tr><td className="p-2">Contingency</td><td className="p-2">&lt; 5% of Total Budget</td><td className="p-2 font-mono text-[#B92814]">+25 pts</td></tr>
                                    <tr><td className="p-2">Structure</td><td className="p-2">&lt; 17% (New Const / Heavy Rehab)</td><td className="p-2 font-mono text-[#B92814]">+20 pts</td></tr>
                                    <tr><td className="p-2">Foundation</td><td className="p-2">&lt; 8% (Non-Cosmetic)</td><td className="p-2 font-mono text-[#B92814]">+15 pts</td></tr>
                                    <tr><td className="p-2">Finishes</td><td className="p-2">&lt; 25% (High-End Q1-Q3)</td><td className="p-2 font-mono text-[#B92814]">+15 pts</td></tr>
                                    <tr><td className="p-2">Soft Costs</td><td className="p-2">&gt; 15% (Over-capitalization)</td><td className="p-2 font-mono text-[#B92814]">+10 pts</td></tr>
                                    <tr><td className="p-2">Systems (MEP)</td><td className="p-2">&lt; 14% of Total Budget</td><td className="p-2 font-mono text-[#B92814]">+10 pts</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Deal Grade Section */}
                <section>
                    <h3 className="text-lg font-bold text-brand-500 mb-3 border-b border-[#DFE1E5] pb-2">
                        2. Deal Grade (A+ to F)
                    </h3>
                    <p className="text-sm mb-4">
                        The Deal Grade is a weighted composite score. <strong className="text-[#139B23]">A higher score indicates a better deal.</strong>
                    </p>

                    <div className="mb-6">
                        <h4 className="font-semibold text-sm text-[#1E2D5C] mb-2">Scoring Weights</h4>
                        <div className="flex h-4 rounded-full overflow-hidden text-[10px] font-bold text-white text-center leading-4">
                            <div className="bg-brand-500 w-[35%]">Financial (35%)</div>
                            <div className="bg-[#139B23] w-[25%]">Sponsor (25%)</div>
                            <div className="bg-purple-600 w-[20%]">Market (20%)</div>
                            <div className="bg-orange-500 w-[20%]">Data (20%)</div>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="p-3 border border-brand-200 bg-brand-50 rounded-md">
                            <h5 className="font-bold text-brand-500">1. Financial Score (35%)</h5>
                            <p className="text-[#78819D] mt-1">
                                Calculated as <span className="font-mono">100 - Risk Score</span>. Low risk results in a high financial score.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 border border-[#DFE1E5] rounded-md">
                                <h5 className="font-bold text-[#1E2D5C]">2. Sponsorship Score (25%)</h5>
                                <p className="text-xs text-[#78819D] mb-2">Baseline: 50 pts</p>
                                <ul className="text-xs space-y-1">
                                    <li className="flex justify-between"><span>Repeat Borrower</span><span className="font-mono text-[#139B23]">+20</span></li>
                                    <li className="flex justify-between"><span>Experienced GC</span><span className="font-mono text-[#139B23]">+15</span></li>
                                    <li className="flex justify-between"><span>Clean History</span><span className="font-mono text-[#139B23]">+15</span></li>
                                </ul>
                            </div>
                            <div className="p-3 border border-[#DFE1E5] rounded-md">
                                <h5 className="font-bold text-[#1E2D5C]">3. Market Score (20%)</h5>
                                <p className="text-xs text-[#78819D] mb-2">Baseline: 100 pts</p>
                                <ul className="text-xs space-y-1">
                                    <li className="flex justify-between"><span>Delinquency &gt; 4%</span><span className="font-mono text-[#B92814]">-25</span></li>
                                    <li className="flex justify-between"><span>Trend: Declining</span><span className="font-mono text-[#B92814]">-40</span></li>
                                    <li className="flex justify-between"><span>Trend: Softening</span><span className="font-mono text-[#B92814]">-15</span></li>
                                    <li className="flex justify-between"><span>Supply &gt; 6 mos</span><span className="font-mono text-[#B92814]">-10</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-3 border border-[#DFE1E5] rounded-md">
                            <h5 className="font-bold text-[#1E2D5C]">4. Completeness Score (20%)</h5>
                            <p className="text-xs text-[#78819D] mb-2">Points awarded for provided data:</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-[#F6F7F9] px-2 py-1 rounded">Scope Statement (+25)</span>
                                <span className="bg-[#F6F7F9] px-2 py-1 rounded">Plans (+25)</span>
                                <span className="bg-[#F6F7F9] px-2 py-1 rounded">Permits (+25)</span>
                                <span className="bg-[#F6F7F9] px-2 py-1 rounded">Detailed Line Items (+25)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-[#FFF5DB] border border-[#EDDDB1] rounded-lg">
                        <h4 className="font-bold text-[#EAA800] text-sm mb-1">
                            ⚠️ Critical Capping Rule
                        </h4>
                        <p className="text-xs text-[#EAA800]">
                            Regardless of the numerical score, if the <strong>Market Price Trend</strong> is "Declining" or "Crash", the final Deal Grade is <strong>capped at 'C'</strong>. This ensures no deal in a crashing market receives an A or B grade.
                        </p>
                    </div>
                </section>
            </div>
        </ComplexModal>
    );
};
