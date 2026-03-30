import React from 'react';
import { PropertyDetails, AsIsProjectedData, ProjectQuestion, BudgetCategoryData, ScopeOfWorkSummary, AsIsProjectedItem } from '../types';
import { CONDITIONS_OF_PROPERTY, TYPES_OF_REHAB, MATERIAL_QUALITIES } from '../constants';

interface PrintableReportProps {
  propertyDetails: PropertyDetails;
  asIsProjectedData: AsIsProjectedData;
  selectedCondition: string;
  selectedRehabType: string;
  selectedMaterialQuality: string;
  projectQuestions: ProjectQuestion[];
  budgetData: BudgetCategoryData[];
  scopeSummary: ScopeOfWorkSummary;
  projectScopeStatement: string;
}

const formatCurrency = (value: number | string | undefined) => {
    if (value === undefined || value === null || value === '') return '$0';
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num)) return '$0';
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const getLabel = (options: any[], value: string) => options.find(o => o.value === value)?.label || 'N/A';

const DataPair: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div style={{ marginBottom: '8px' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>{label}</p>
        <p style={{ margin: 0 }}>{value || 'N/A'}</p>
    </div>
);

export const PrintableReport: React.FC<PrintableReportProps> = ({
  propertyDetails,
  asIsProjectedData,
  selectedCondition,
  selectedRehabType,
  selectedMaterialQuality,
  projectQuestions,
  budgetData,
  scopeSummary,
  projectScopeStatement,
}) => {
  const propertyAddress = `${propertyDetails.street}, ${propertyDetails.city}, ${propertyDetails.state} ${propertyDetails.zip}`;
  
  return (
    <div id="printable-report">
        <h1>Construction Budget Report</h1>
        <p style={{ textAlign: 'center', marginTop: '-15px', marginBottom: '25px', fontSize: '12pt' }}>
            <strong>Property:</strong> {propertyAddress}
        </p>

        <div className="printable-section">
            <h2>Property &amp; Project Details</h2>
            <table>
                <tbody>
                    <tr>
                        <td style={{ width: '50%' }}><DataPair label="Purchase Price" value={formatCurrency(propertyDetails.purchasePrice)} /></td>
                        <td style={{ width: '50%' }}><DataPair label="Condition of Property" value={getLabel(CONDITIONS_OF_PROPERTY, selectedCondition)} /></td>
                    </tr>
                    <tr>
                        <td><DataPair label="Type of Rehab" value={getLabel(TYPES_OF_REHAB, selectedRehabType)} /></td>
                        <td><DataPair label="Material Quality" value={getLabel(MATERIAL_QUALITIES, selectedMaterialQuality)} /></td>
                    </tr>
                </tbody>
            </table>

            <h3>As-Is vs. Projected</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style={{ textAlign: 'center' }}>As-Is</th>
                        <th style={{ textAlign: 'center' }}>Projected</th>
                    </tr>
                </thead>
                <tbody>
                    {(Object.keys(asIsProjectedData) as Array<keyof AsIsProjectedData>).map(key => {
                        const item = asIsProjectedData[key];
                        const asIsValue = Array.isArray(item.asIs) ? item.asIs.filter(Boolean).join(', ') : item.asIs;
                        const projectedValue = Array.isArray(item.projected) ? item.projected.filter(Boolean).join(', ') : item.projected;
                        return (
                            <tr key={item.label}>
                                <td>{item.label}</td>
                                <td style={{ textAlign: 'center' }}>{asIsValue || '-'}</td>
                                <td style={{ textAlign: 'center' }}>{projectedValue || '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <h3>Project Questions</h3>
            <table>
                <tbody>
                    {projectQuestions.map(q => (
                        <tr key={q.id}>
                            <td style={{ width: '70%' }}>{q.question}</td>
                            <td style={{ width: '30%' }}><strong>{q.answer || 'No Answer'}</strong> {q.explanation && ` - ${q.explanation}`}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="printable-section">
            <h2>Scope of Work &amp; Budget Summary</h2>
            <h3>Scope of Work Statement</h3>
            <p className="scope-statement">{projectScopeStatement || 'No scope of work provided.'}</p>
            
            <h3>Summary</h3>
            <table>
                <tbody>
                    <tr>
                        <td style={{ width: '50%' }}><DataPair label="Borrower Total Budget" value={formatCurrency(scopeSummary.borrowerTotal)} /></td>
                        <td style={{ width: '50%' }}><DataPair label="Lima One Approved Budget" value={formatCurrency(scopeSummary.limaOneApprovedTotal)} /></td>
                    </tr>
                    <tr>
                        <td><DataPair label="Start Date" value={scopeSummary.startDate} /></td>
                        <td><DataPair label="Projected Completion" value={scopeSummary.projectedCompletionDate} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div className="printable-section">
            <h2>Detailed Budget</h2>
            <table>
                <thead>
                    <tr>
                        <th style={{width: '8%'}}>Item #</th>
                        <th style={{width: '22%'}}>Category / Draw Item</th>
                        <th style={{width: '40%'}}>Description</th>
                        <th style={{width: '15%', textAlign: 'right'}}>Borrower Requested</th>
                        <th style={{width: '15%', textAlign: 'right'}}>Lima One Approved</th>
                    </tr>
                </thead>
                <tbody>
                    {budgetData.map(category => (
                        <React.Fragment key={category.name}>
                            <tr className="budget-category-header">
                                <td colSpan={3}>{category.name}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(category.items.reduce((sum, item) => sum + item.budget, 0))}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(category.items.reduce((sum, item) => sum + item.actual, 0))}</td>
                            </tr>
                            {category.items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.itemNumber}</td>
                                    <td>{item.drawItem}</td>
                                    <td>{item.description}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.budget)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.actual)}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="budget-category-header">
                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>GRAND TOTALS</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(scopeSummary.borrowerTotal)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(scopeSummary.limaOneApprovedTotal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  );
};