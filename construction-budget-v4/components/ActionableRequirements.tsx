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
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
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
    // Default pending icon
    return (
      <div className="w-6 h-6 border-2 border-slate-400 dark:border-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
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
              className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 dark:bg-sky-900 dark:text-sky-300 flex items-center justify-center hover:bg-brand-200 dark:hover:bg-sky-800 transition-colors"
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
    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex-shrink-0">
        {statusIcon()}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{requirement.label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{requirement.info}</p>
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
  if (requirements.length === 0) {
    return null;
  }

  const completedCount = requirements.filter(r => r.status === 'completed').length;
  const totalCount = requirements.length;

  return (
    <div className="section-container">
      <h3 className="section-title flex justify-between items-center">
        <span>Actionable Requirements</span>
        <span className="text-sm font-medium bg-slate-600 text-white rounded-full px-2.5 py-1">
          {completedCount} / {totalCount} Complete
        </span>
      </h3>
      <div className="p-4 bg-white dark:bg-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            This checklist updates automatically based on your form entries.
        </p>
        <div className="space-y-3">
            {requirements.map(req => (
              <RequirementItem key={req.id} requirement={req} onUploadFile={onUploadFile} />
            ))}
        </div>
      </div>
    </div>
  );
};
