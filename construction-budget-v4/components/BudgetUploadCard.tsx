import React, { useState, useRef } from 'react';
import { SpinnerIcon } from './Icons';

interface BudgetUploadCardProps {
    isParsing: boolean;
    parsingError: string | null;
    isAnalyzing: boolean;
    analysisError: string | null;
    onProcessBudget: (file: File) => void;
}

export const BudgetUploadCard: React.FC<BudgetUploadCardProps> = ({ isParsing, parsingError, isAnalyzing, analysisError, onProcessBudget }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleProcessBudget = () => {
        if (selectedFile) {
            onProcessBudget(selectedFile);
        }
    };

    const isLoading = isParsing || isAnalyzing;
    let buttonText = 'Process Budget';
    if (isParsing) {
        buttonText = 'Parsing...';
    } else if (isAnalyzing) {
        buttonText = 'Analyzing...';
    }

    return (
        <div className="p-4 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg mb-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                Already have a budget?
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Upload your .csv, .txt, .xlsx, or .pdf file here.
            </p>
            <div className="flex items-center justify-start mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="budget-file-upload"
                    accept=".csv,.txt,.xlsx,.pdf"
                    disabled={isLoading}
                />
                <label
                    htmlFor="budget-file-upload"
                    className={`button-base text-sm py-1.5 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 whitespace-nowrap ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    Choose File
                </label>
                <span className="ml-3 text-sm text-slate-500 dark:text-slate-400 truncate">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
            </div>
            <button
                onClick={handleProcessBudget}
                disabled={!selectedFile || isLoading}
                className="button-base w-full bg-[#32373c] text-white hover:bg-[#4a5056] disabled:bg-slate-400 dark:disabled:bg-slate-600 flex items-center justify-center"
            >
                {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                {buttonText}
            </button>
            {(parsingError || analysisError) && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                    {parsingError || analysisError}
                </p>
            )}
        </div>
    );
};