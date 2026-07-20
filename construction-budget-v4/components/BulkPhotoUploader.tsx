
import React, { useState, useRef } from 'react';
import { BudgetCategoryData } from '../types';
import { StagedPhoto } from '../App';
import { ComplexModal } from './ComplexModal';
import { CloudUploadIcon, SparklesIcon, SpinnerIcon } from './Icons';
import { CLAUDE_MODELS } from '../constants';
import { callClaudeForStructuredOutput, toClaudeContentBlock, ClaudeContentBlock } from '../utils/claudeClient';
import { ShowToastFn } from './Toast';

interface BulkPhotoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  stagedPhotos: StagedPhoto[];
  budgetData: BudgetCategoryData[];
  onStageFiles: (files: FileList) => void;
  onAssignPhoto: (photoIndex: number, assignment: string | null, isAiAssigned?: boolean) => void;
  onFinalize: () => void;
  onToast?: ShowToastFn;
}

export const BulkPhotoUploader: React.FC<BulkPhotoUploaderProps> = ({
  isOpen,
  onClose,
  stagedPhotos,
  budgetData,
  onStageFiles,
  onAssignPhoto,
  onFinalize,
  onToast,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onStageFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onStageFiles(e.target.files);
    }
  };

  const handleAutoAssign = async () => {
      const photosToAnalyze = stagedPhotos.map((p, i) => ({ photo: p, index: i })).filter(item => !item.photo.assignment);
      
      if (photosToAnalyze.length === 0) {
          onToast?.("All photos are already assigned or no photos to analyze.", 'info');
          return;
      }

      setIsAnalyzing(true);

      try {
          // 1. Prepare Budget Schema for AI
          const budgetSchema = budgetData.flatMap(cat =>
              cat.items.map(item => ({
                  id: `ITEM:${item.id}`,
                  name: `${cat.name} - ${item.drawItem || item.description || 'Item'}`
              }))
          );

          // Limit schema size for prompt efficiency, most critical items usually top of list
          const schemaText = JSON.stringify(budgetSchema.slice(0, 150));

          // 2. Prepare Images
          // Claude's vision API supports multiple images in one message. We'll batch if necessary, but assume < 16 photos for burst.
          const imageParts: ClaudeContentBlock[] = await Promise.all(photosToAnalyze.map(async (item) => {
              return new Promise<ClaudeContentBlock>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      const base64String = (reader.result as string).split(',')[1];
                      resolve(toClaudeContentBlock(item.photo.file.type, base64String));
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(item.photo.file);
              });
          }));

          // 3. Construct Prompt
          const prompt = `
            You are a construction estimator.
            I am uploading ${photosToAnalyze.length} images from a site inspection.

            Match each image (in order) to the most appropriate Budget Item from this list:
            ${schemaText}

            Return a JSON object where 'assignments' is an array. Each object in the array should have:
            - 'imageIndex': The 0-based index of the image from the uploaded set.
            - 'itemId': The 'id' of the matching Budget Item from the list above.

            If an image clearly shows a specific trade (e.g. toilet -> plumbing fixture, hole in roof -> roofing), assign it.
            If ambiguous, skip it or return null for itemId.
          `;

          const result = await callClaudeForStructuredOutput({
              model: CLAUDE_MODELS.OPUS,
              content: [
                  { type: 'text', text: prompt },
                  ...imageParts
              ],
              toolName: 'assign_photos',
              toolDescription: 'Match each uploaded site photo to the most appropriate budget line item.',
              inputSchema: {
                  type: 'object',
                  properties: {
                      assignments: {
                          type: 'array',
                          items: {
                              type: 'object',
                              properties: {
                                  imageIndex: { type: 'integer' },
                                  itemId: { type: 'string' }
                              }
                          }
                      }
                  },
                  required: ['assignments']
              },
          });

          if (result.assignments) {
              result.assignments.forEach((assignment: any) => {
                  if (assignment.itemId && assignment.imageIndex < photosToAnalyze.length) {
                      const originalIndex = photosToAnalyze[assignment.imageIndex].index;
                      onAssignPhoto(originalIndex, assignment.itemId, true);
                  }
              });
          }

      } catch (error) {
          console.error("Auto-assign failed:", error);
          onToast?.("Auto-assign failed. Please try again.", 'error');
      } finally {
          setIsAnalyzing(false);
      }
  };

  const DropZone = () => (
    <div
      className={`w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors
        ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-[#DFE1E5] hover:border-brand-400'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CloudUploadIcon className="text-[#78819D] mb-4 h-12 w-12" />
      <p className="text-[#78819D]">
        <span className="font-semibold text-brand-500">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-[#78819D] mt-1">PNG, JPG, GIF up to 10MB</p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
       <div className="mt-4 flex gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="button-base bg-transparent text-brand-600 border border-brand-600 hover:bg-brand-50 focus:ring-brand-500 text-sm py-2 px-4"
           >
             Select Files
           </button>
           <button
             onClick={handleAutoAssign}
             disabled={stagedPhotos.length === 0 || isAnalyzing}
             className="button-base bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 text-sm py-2 px-4 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isAnalyzing ? <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /> : <SparklesIcon className="w-4 h-4 mr-2" />}
             {isAnalyzing ? 'Analyzing...' : 'Auto-Assign'}
           </button>
       </div>
    </div>
  );

  const StagedPhotosGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stagedPhotos.map((photo, index) => (
        <div key={index} className={`border rounded-lg p-2 bg-[#F6F7F9] flex flex-col space-y-2 relative transition-all duration-500 ${isAnalyzing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} ${(photo as any).isAiAssigned ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}>
          <div className="relative">
              <img src={photo.preview} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-md" />
              {(photo as any).isAiAssigned && (
                  <div className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center animate-in zoom-in">
                      <SparklesIcon className="w-3 h-3 mr-1" /> AI
                  </div>
              )}
          </div>
          <select
            value={photo.assignment || ''}
            onChange={(e) => onAssignPhoto(index, e.target.value || null, false)} // Manual override clears AI flag
            className="form-input-premium w-full text-xs"
            aria-label={`Assign photo ${index + 1}`}
          >
            <option value="">Assign to...</option>
            {budgetData.map(category => (
              <optgroup key={category.name} label={category.name}>
                <option value={`CATEGORY:${category.name}`}>-- General: {category.name} --</option>
                {category.items.filter(item => !item.isCustomDescription || item.drawItem.trim() !== '').map(item => (
                  <option key={item.id} value={`ITEM:${item.id}`}>
                    {item.drawItem}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      ))}
    </div>
  );

  const modalFooter = (
    <>
      <button
        onClick={onClose}
        className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC]"
      >
        Cancel
      </button>
      <button
        onClick={onFinalize}
        disabled={stagedPhotos.length === 0}
        className="button-base bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 disabled:bg-[#BCBFC7] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        Done ({stagedPhotos.filter(p => p.assignment).length}/{stagedPhotos.length} Assigned)
      </button>
    </>
  );

  return (
    <ComplexModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload and Assign Project Photos"
      footer={modalFooter}
      size="xl"
    >
        <div className="flex flex-col space-y-6">
            <DropZone />
            {isAnalyzing && (
                <div className="text-center py-4 animate-pulse">
                    <p className="text-brand-500 font-bold text-lg">AI Vision is analyzing your photos...</p>
                    <p className="text-[#78819D] text-sm">Matching construction elements to budget line items.</p>
                </div>
            )}
            {stagedPhotos.length > 0 && <StagedPhotosGrid />}
        </div>
    </ComplexModal>
  );
};
