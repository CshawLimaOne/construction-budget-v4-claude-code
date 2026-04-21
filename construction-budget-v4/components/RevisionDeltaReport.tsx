
import React from 'react';
import { AuditLogEntry } from '../types';

interface RevisionDeltaReportProps {
    auditLog: AuditLogEntry[];
}

const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
};

const formatValue = (value: any) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (value === '' || value === undefined || value === null) return 'N/A';
    return String(value);
};

const ChangeIndicator: React.FC<{ entry: AuditLogEntry }> = ({ entry }) => {
    const { changeType, oldValue, newValue } = entry;

    let content: React.ReactNode = null;
    let bgColor = '';
    let textColor = '';

    switch(changeType) {
        case 'thread_resolved':
            content = 'Thread Resolved';
            bgColor = 'bg-[#E1F7E4]';
            textColor = 'text-[#139B23]';
            break;
        case 'thread_reopened':
            content = 'Thread Re-opened';
            bgColor = 'bg-brand-50';
            textColor = 'text-brand-500';
            break;
        case 'budget_reopened':
            content = `Budget Status: ${formatValue(oldValue)} → ${formatValue(newValue)}`;
            bgColor = 'bg-[#FFF5DB]';
            textColor = 'text-[#EAA800]';
            break;
        case 'value_change':
            return (
                <div className="mt-3 p-2.5 border border-[#DFE1E5] rounded-md bg-[#F6F7F9]">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="text-[#78819D]">Changed from:</span>
                        <span className="font-mono p-1 rounded bg-[#FFF0EE] text-[#B92814] line-through">{formatValue(oldValue)}</span>
                        <span className="text-[#78819D]">to:</span>
                        <span className="font-mono p-1 rounded bg-[#E1F7E4] text-[#139B23] font-bold">{formatValue(newValue)}</span>
                    </div>
                </div>
            );
        default:
            return null;
    }

    return (
        <div className={`mt-3 p-2.5 rounded-md font-medium text-sm text-center ${bgColor} ${textColor}`}>
            {content}
        </div>
    );
};

const EntryBubble: React.FC<{ entry: AuditLogEntry }> = ({ entry }) => {
    const isAnalyst = entry.authorRole === 'analyst';

    const bubbleColor = isAnalyst ? 'bg-brand-50' : 'bg-[#F6F7F9]';
    const arrowBorderColor = isAnalyst
        ? 'border-r-brand-50'
        : 'border-r-[#F6F7F9]';

    const textColor = isAnalyst ? 'text-brand-700' : 'text-[#1E2D5C]';

    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${isAnalyst ? 'bg-brand-500' : 'bg-[#78819D]'}`}>
                {isAnalyst ? 'A' : 'B'}
            </div>
            
            <div className="flex flex-col w-full">
                <div className={`relative p-3 rounded-lg ${bubbleColor} max-w-lg rounded-tl-none`}>
                    <div className={`absolute top-3 w-0 h-0 border-8 border-transparent left-0 -ml-2 ${arrowBorderColor}`}></div>
                    
                    <div className="flex items-baseline justify-between">
                         <span className={`font-semibold text-sm ${textColor}`}>{entry.authorName}</span>
                         <span className="text-xs text-[#78819D] pl-4">{formatTimestamp(entry.timestamp)}</span>
                    </div>

                    {entry.changeType !== 'comment' && <ChangeIndicator entry={entry} />}

                    <p className="mt-2 text-sm text-[#1E2D5C] whitespace-pre-wrap">
                        {entry.commentText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const RevisionDeltaReport: React.FC<RevisionDeltaReportProps> = ({ auditLog }) => {
    
    const groupedAndSortedLog = React.useMemo(() => {
        if (!auditLog || auditLog.length === 0) return [];
        
        const groups: Record<string, AuditLogEntry[]> = auditLog.reduce((acc, entry) => {
            if (!acc[entry.fieldId]) {
                acc[entry.fieldId] = [];
            }
            acc[entry.fieldId].push(entry);
            return acc;
        }, {} as Record<string, AuditLogEntry[]>);

        const processedGroups = Object.values(groups).map(entries => {
            const sortedEntries = entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            const latestTimestamp = sortedEntries[sortedEntries.length - 1].timestamp;
            const fieldLabel = sortedEntries[0].fieldLabel;
            
            return { fieldLabel, latestTimestamp, entries: sortedEntries };
        });

        return processedGroups.sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
        
    }, [auditLog]);

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-[#1E2D5C]">Revision Report</h2>
                 <p className="text-sm text-[#78819D] mt-1 max-w-2xl mx-auto">
                    This report provides a complete history of all comments and value changes made on the budget, serving as a record for all communications and requested changes.
                </p>
            </div>

            {groupedAndSortedLog.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg section-container">
                    <p className="text-[#78819D]">No comments or changes have been logged yet.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedAndSortedLog.map(group => (
                        <div key={group.fieldLabel} className="section-container">
                            <h3 className="section-title text-base flex items-baseline">
                                <span className="font-normal opacity-80 mr-2">Field:</span>
                                <span className="font-semibold">{group.fieldLabel}</span>
                            </h3>
                            <div className="p-4 bg-white  space-y-6">
                                {group.entries.map(entry => (
                                    <EntryBubble key={entry.id} entry={entry} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
