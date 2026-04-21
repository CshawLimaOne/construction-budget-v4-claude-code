
import React from 'react';

interface RiskGaugeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showLegend?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md', showLabel = true, showLegend = false }) => {
    const maxScore = 100; // Normalized to 100 for the engine, previously 10 in report
    const displayScore = score; // Engine returns 0-100
    
    // Dimensions based on size
    let radius = 52;
    let strokeWidth = 8;
    let activeStrokeWidth = 15;
    let widthClass = 'w-44';
    let heightClass = 'h-44';
    let fontSizeNum = 'text-4xl';
    let fontSizeLabel = 'text-lg';

    if (size === 'sm') {
        radius = 40;
        strokeWidth = 6;
        activeStrokeWidth = 8;
        widthClass = 'w-24';
        heightClass = 'h-24';
        fontSizeNum = 'text-xl';
        fontSizeLabel = 'text-xs';
    } else if (size === 'lg') {
        // default settings match original md/lg
    }

    const arcFraction = 0.75;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * arcFraction;
    const scorePercentage = displayScore / maxScore;
    const offset = arcLength * (1 - scorePercentage);

    let colorClass, levelText;
    if (displayScore <= 25) {
        colorClass = 'stroke-green-500';
        levelText = 'Low Risk';
    } else if (displayScore <= 50) {
        colorClass = 'stroke-yellow-500';
        levelText = 'Medium Risk';
    } else if (displayScore <= 75) {
        colorClass = 'stroke-orange-500';
        levelText = 'High Risk';
    } else {
        colorClass = 'stroke-red-500';
        levelText = 'Critical';
    }

    const legendSegments = [
        { label: 'Low', range: '0–25', color: 'bg-[#139B23]', active: displayScore <= 25 },
        { label: 'Mod', range: '26–50', color: 'bg-[#FFF8E6]0', active: displayScore > 25 && displayScore <= 50 },
        { label: 'High', range: '51–75', color: 'bg-orange-500', active: displayScore > 50 && displayScore <= 75 },
        { label: 'Crit', range: '76–100', color: 'bg-[#B92814]', active: displayScore > 75 },
    ];

    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${widthClass} ${heightClass} mx-auto flex flex-col items-center justify-center`}>
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(135deg)' }}>
                    {/* Background track */}
                    <circle
                        className="stroke-[#DFE1E5]"
                        cx="60" cy="60" r={radius}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={arcLength}
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <circle
                        className={`${colorClass} transition-all duration-500`}
                        cx="60" cy="60" r={radius}
                        strokeWidth={activeStrokeWidth}
                        fill="transparent"
                        strokeDasharray={arcLength}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                    <div className={`${fontSizeNum} font-black text-[#1E2D5C]`}>
                        {displayScore}
                    </div>
                    {showLabel && (
                        <div className={`${fontSizeLabel} font-bold ${colorClass.replace('stroke-', 'text-')} mt-1`}>
                            {levelText}
                        </div>
                    )}
                </div>
            </div>
            {showLegend && (
                <div className="flex items-center gap-0.5 mt-1.5">
                    {legendSegments.map((seg) => (
                        <div
                            key={seg.label}
                            className={`flex flex-col items-center transition-all duration-200 ${seg.active ? 'opacity-100 scale-105' : 'opacity-40'}`}
                            title={`${seg.label}: ${seg.range}`}
                        >
                            <div className={`h-1.5 w-8 rounded-full ${seg.color}`} />
                            <span className="text-[8px] font-bold text-[#78819D] mt-0.5 leading-none">{seg.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
