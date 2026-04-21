
import React, { useRef } from 'react';
import { Requirement } from '../types';
import Tooltip from './Tooltip';
import { InfoIcon, CheckIcon, ArrowUpTrayIcon } from './Icons';

interface RequirementItemProps {
  requirement: Requirement;
  onUploadFile: (requirementId: string, file: File) => void;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ requirement, onUploadFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onUploadFile(requirement.id, event.target.files[0]);
    }
  };

  const isInformationalNotice = requirement.actionType === 'info' && requirement.id !== 'gc-review';

  const statusIcon = () => {
    if (requirement.status === 'completed') {
      return (
        <div className="w-6 h-6 bg-[#139B23] rounded-full flex items-center justify-center text-white flex-shrink-0">
          <CheckIcon className="w-4 h-4" />
        </div>
      );
    }
    if (isInformationalNotice) {
      return (
        <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
          <InfoIcon className="w-4 h-4 m-0" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 border-2 border-[#DFE1E5] rounded-full flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 bg-[#BCBFC7] rounded-full"></div>
      </div>
    );
  };

  const actionOrStatus = () => {
    if (requirement.status === 'completed') {
      return <span className="requirement-status-badge requirement-status-badge--completed">Completed</span>;
    }
    if (requirement.actionType === 'upload') {
      return (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label={`Upload file for ${requirement.label}`}
          />
          <Tooltip text="Upload File" position="top">
            <button
              onClick={handleUploadClick}
              className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
              aria-label={`Upload for ${requirement.label}`}
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </>
      );
    }
    if (requirement.id === 'gc-review') {
      return <span className="requirement-status-badge requirement-status-badge--pending">Pending Review</span>;
    }
    if (isInformationalNotice) {
      return <span className="requirement-status-badge requirement-status-badge--info">Informational</span>;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#DFE1E5]">
      <div className="flex-shrink-0">
        {statusIcon()}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-[#1E2D5C]">{requirement.label}</p>
        <p className="text-sm text-[#78819D] mt-0.5">{requirement.info}</p>
      </div>
      <div className="flex-shrink-0 ml-4">
        {actionOrStatus()}
      </div>
    </div>
  );
};


interface ActionableRequirementsProps {
  requirements: Requirement[];
  onUploadFile: (requirementId: string, file: File) => void;
}

export const ActionableRequirements: React.FC<ActionableRequirementsProps> = ({ requirements, onUploadFile }) => {
  const completedCount = requirements.filter(r => r.status === 'completed').length;
  const totalCount = requirements.length;

  if (requirements.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-6">
        <div className="w-14 h-14 rounded-full bg-[#E1F7E4] border border-[#ADDEB4] flex items-center justify-center">
          <CheckIcon className="w-7 h-7 text-[#139B23]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1E2D5C] mb-1">Everything looks good</h3>
          <p className="text-sm text-[#78819D] max-w-xs leading-relaxed">
            No outstanding requirements were found. You're ready to submit your application for review.
          </p>
        </div>
        <div className="w-full bg-[#FFF5DB] border border-[#EDDDB1] rounded-xl p-4 text-left mt-2">
          <p className="text-sm text-[#EAA800] font-medium">Once submitted, your budget will be locked for editing until a Lima One analyst completes their review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#78819D]">Complete the items below before submitting.</p>
        <span className="text-xs font-bold bg-[#F6F7F9] text-[#1E2D5C] border border-[#DFE1E5] rounded-full px-3 py-1">
          {completedCount} / {totalCount} Complete
        </span>
      </div>
      <div className="space-y-3">
        {requirements.map(req => (
          <RequirementItem key={req.id} requirement={req} onUploadFile={onUploadFile} />
        ))}
      </div>
    </div>
  );
};
