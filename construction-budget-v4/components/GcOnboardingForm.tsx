import React from 'react';
import { GcOnboardingData, GcPreviousExperience } from '../types';
import { XCircleIcon } from './Icons';

interface GcOnboardingFormProps {
    data: GcOnboardingData;
    onChange: (path: string, value: any) => void;
    isReadOnly?: boolean;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="gc-onboarding-section border border-[#DFE1E5] rounded-lg overflow-hidden mb-6">
        <h3 className="bg-[#F6F7F9] p-3 font-bold text-[#1E2D5C] border-b border-[#DFE1E5]">{title}</h3>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-[#1E2D5C] mb-1">{label}</label>
        {children}
    </div>
);

export const GcOnboardingForm: React.FC<GcOnboardingFormProps> = ({ data, onChange, isReadOnly = false }) => {

    const handleExperienceChange = (id: string, field: keyof GcPreviousExperience, value: string) => {
        const updatedExperience = data.previousExperience.map(exp => 
            exp.id === id ? { ...exp, [field]: value } : exp
        );
        onChange('previousExperience', updatedExperience);
    };

    return (
        <div className="text-sm">
            <p className="text-xs text-[#78819D] mb-4">
                To begin, please provide the information below to create your Contractor Profile. This profile setup is a one-time process. To keep your file current, we will only require an annual update of your licenses and insurance certificates going forward.
            </p>

            <FormSection title="General Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="Full Name">
                        <input type="text" value={data.generalInfo.fullName} onChange={e => onChange('generalInfo.fullName', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Address">
                        <input type="text" value={data.generalInfo.address} onChange={e => onChange('generalInfo.address', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Business Phone">
                        <input type="tel" value={data.generalInfo.businessPhone} onChange={e => onChange('generalInfo.businessPhone', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Personal Email">
                        <input type="email" value={data.generalInfo.personalEmail} onChange={e => onChange('generalInfo.personalEmail', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="SSN or EIN">
                        <input type="text" value={data.generalInfo.ssnOrEin} onChange={e => onChange('generalInfo.ssnOrEin', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Birthdate">
                        <input type="date" value={data.generalInfo.birthdate} onChange={e => onChange('generalInfo.birthdate', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Entity Name and Type">
                        <input type="text" value={data.generalInfo.entityNameAndType} onChange={e => onChange('generalInfo.entityNameAndType', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="GC License Number">
                        <input type="text" value={data.generalInfo.gcLicenseNumber} onChange={e => onChange('generalInfo.gcLicenseNumber', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Entity Email">
                        <input type="email" value={data.generalInfo.entityEmail} onChange={e => onChange('generalInfo.entityEmail', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                    <FormRow label="Number of Employees">
                        <input type="number" value={data.generalInfo.numberOfEmployees} onChange={e => onChange('generalInfo.numberOfEmployees', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                </div>
            </FormSection>

            <FormSection title="Statement of Previous Similar Experience">
                 <p className="text-xs text-[#78819D] -mt-2 mb-4">
                   Please list 3 completed projects of similar scope/budget.
                </p>
                <div className="space-y-4">
                {data.previousExperience.map((exp, index) => (
                    <div key={exp.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-[#DFE1E5] rounded-md">
                        <FormRow label={`Project ${index + 1} Address`}>
                            <input type="text" value={exp.address} onChange={e => handleExperienceChange(exp.id, 'address', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                        </FormRow>
                        <FormRow label="Scope of Work / Rehab Type">
                            <textarea
                                rows={1}
                                value={exp.scopeOfWork}
                                onChange={e => {
                                    handleExperienceChange(exp.id, 'scopeOfWork', e.target.value);
                                    if (!isReadOnly) {
                                        const textarea = e.currentTarget;
                                        textarea.style.height = 'auto';
                                        textarea.style.height = `${textarea.scrollHeight}px`;
                                    }
                                }}
                                className="spreadsheet-input w-full resize-none overflow-hidden"
                                readOnly={isReadOnly}
                            />
                        </FormRow>
                         <FormRow label="Construction Budget">
                            <input type="text" value={exp.constructionBudget} onChange={e => handleExperienceChange(exp.id, 'constructionBudget', e.target.value)} className="spreadsheet-input w-full" placeholder="$" readOnly={isReadOnly} />
                        </FormRow>
                    </div>
                ))}
                </div>
            </FormSection>

            <FormSection title="Statement of Capabilities">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormRow label="# of projects forecasted – next 12 mos.">
                        <input type="text" value={data.capabilities.projectsForecasted} onChange={e => onChange('capabilities.projectsForecasted', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of dedicated field supervisors">
                        <input type="text" value={data.capabilities.dedicatedFieldSupervisors} onChange={e => onChange('capabilities.dedicatedFieldSupervisors', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of dedicated production admin">
                        <input type="text" value={data.capabilities.dedicatedProductionAdmin} onChange={e => onChange('capabilities.dedicatedProductionAdmin', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of in-house crews available">
                        <input type="text" value={data.capabilities.inHouseCrewsAvailable} onChange={e => onChange('capabilities.inHouseCrewsAvailable', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of foundation subs">
                        <input type="text" value={data.capabilities.foundationSubs} onChange={e => onChange('capabilities.foundationSubs', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of framing subs">
                        <input type="text" value={data.capabilities.framingSubs} onChange={e => onChange('capabilities.framingSubs', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of MEP subs">
                        <input type="text" value={data.capabilities.mepSubs} onChange={e => onChange('capabilities.mepSubs', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="# of 'other' subs">
                        <input type="text" value={data.capabilities.otherSubs} onChange={e => onChange('capabilities.otherSubs', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                 </div>
            </FormSection>
            
            <FormSection title="Release Authorization">
                <div className="space-y-4 text-xs text-[#78819D]">
                    <p><strong>Release Authorization:</strong> The undersigned hereby declares that the statements made to Lender herein are true and correct and authorizes lender to obtain personal and/or business credit information should Lender deem it necessary.</p>
                    <p>The undersigned has been advised and further authorizes the lender to obtain information concerning the undersigned's past employment, past performance, construction contracts, work history, credit and any other matter which Lender deems relevant and authorizes but does not require Lender to disclose any such information to Lender's borrower and/or necessary persons. During this review, the Lender reserves the right to perform a background and OFAC check. Lender additionally reserves the right to perform background and OFAC checks of the undersigned on an annual basis. The undersigned hereby agrees that so long as Lender acts in good faith, Lender and Lender's agent shall be held harmless and shall be indemnified in connection with any claims, suits, actions, or the like which relate in any way to said investigation or disclosures.</p>
                    <p><strong>Verification of Previous Work:</strong> Should Lima One Capital be unable to verify previous scope and production capabilities with the information provided, further documentation, including bank statements and/or tax returns, may be required.</p>
                </div>
                 <div className="mt-4 p-4 border-t border-[#DFE1E5]">
                     <label className="flex items-start">
                        <input 
                            type="checkbox" 
                            checked={data.authorization.agreedToTerms}
                            onChange={e => onChange('authorization.agreedToTerms', e.target.checked)}
                            className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 mt-0.5"
                            disabled={isReadOnly}
                         />
                        <span className="ml-3 text-sm text-[#1E2D5C]">
                            By checking this box, you acknowledge and agree to the terms of the Release Authorization and Verification of Previous Work.
                        </span>
                     </label>
                 </div>

                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#DFE1E5]">
                     <FormRow label="Signature (Type Full Name)">
                        <input type="text" value={data.authorization.signature} onChange={e => onChange('authorization.signature', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="Print Name">
                        <input type="text" value={data.authorization.printName} onChange={e => onChange('authorization.printName', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="Title">
                        <input type="text" value={data.authorization.title} onChange={e => onChange('authorization.title', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                     <FormRow label="Date">
                        <input type="date" value={data.authorization.date} onChange={e => onChange('authorization.date', e.target.value)} className="spreadsheet-input w-full" readOnly={isReadOnly} />
                    </FormRow>
                 </div>
            </FormSection>
        </div>
    );
};