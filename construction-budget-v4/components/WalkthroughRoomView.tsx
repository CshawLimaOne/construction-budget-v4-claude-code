
import React, { useRef, useState, useCallback } from 'react';
import { WalkthroughRoomDef, WalkthroughItemRecord, WalkthroughItemStatus, BatchRoomUpdate } from '../types';
import { ChevronLeftIcon, CameraIcon, CheckIcon, TrashIcon, SpinnerIcon, LightBulbIcon, ChevronRightIcon, AudioWavesIcon, WavesIcon, CalculatorIcon } from './Icons';
import { VoiceRecorder } from './VoiceRecorder';
import { COST_DB, UNIT_COST_DB, MOCK_HISTORICAL_DATA } from '../constants';
import { CameraModal } from './CameraModal';
import { GoogleGenAI, Type } from '@google/genai';
import { saveAsset } from '../utils/offlineStorage';
import { ShowToastFn } from './Toast';

interface WalkthroughRoomViewProps {
  room: WalkthroughRoomDef;
  itemsState: Record<string, WalkthroughItemRecord>;
  onUpdateItem: (itemId: string, field: keyof WalkthroughItemRecord, value: any) => void;
  onBack: () => void;
  selectedQuality: string;
  onNextRoom?: () => void;
  onPrevRoom?: () => void;
  nextRoomLabel?: string;
  prevRoomLabel?: string;
  onAddPendingJob?: (job: any) => void; // New prop for offline handling
  onToast?: ShowToastFn;
}

const WalkthroughItemRow: React.FC<{
  itemDef: { id: string; label: string; defaultCostCode: string };
  roomId: string;
  itemState: WalkthroughItemRecord | undefined;
  onUpdate: (field: keyof WalkthroughItemRecord, value: any) => void;
  quality: string;
  onOpenCamera: () => void;
  onToast?: ShowToastFn;
}> = ({ itemDef, roomId, itemState, onUpdate, quality, onOpenCamera, onToast }) => {
  const status = itemState?.status || ''; 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showHistoricalPrompt, setShowHistoricalPrompt] = useState(false);

  // "Show the Math" Logic
  const unitCost = UNIT_COST_DB[itemDef.defaultCostCode]?.[quality];

  const handleStatusChange = (newStatus: WalkthroughItemStatus) => {
    let newCost = itemState?.costEstimate;
    let foundHistorical = false;

    if (newStatus === 'Replace' && MOCK_HISTORICAL_DATA[itemDef.defaultCostCode]) {
        setShowHistoricalPrompt(true);
        foundHistorical = true;
    } else {
        setShowHistoricalPrompt(false);
    }
    
    if (newStatus === 'Replace' || newStatus === 'Repair') {
        if (newStatus === 'Repair' && itemDef.id === 'hvac') {
             newCost = 500; 
        } else {
            const tierCosts = COST_DB[itemDef.defaultCostCode];
            if (tierCosts) {
                const baseCost = tierCosts[quality] || tierCosts['Q4'] || 0; 
                newCost = newStatus === 'Repair' ? Math.round(baseCost * 0.4) : baseCost;
            }
        }
    } else if (newStatus === 'Keep' || newStatus === 'N/A') {
        newCost = 0;
    }

    onUpdate('status', newStatus);
    if (newCost !== undefined && !foundHistorical) {
        onUpdate('costEstimate', newCost);
    }
  };

  const applyHistoricalPrice = () => {
      const historical = MOCK_HISTORICAL_DATA[itemDef.defaultCostCode];
      if (historical) {
          onUpdate('costEstimate', historical.price);
          onUpdate('notes', (itemState?.notes || '') + `\n[Using Historical Price: ${historical.label}]`);
          setShowHistoricalPrompt(false);
      }
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      const currentPhotos = itemState?.photos || [];
      onUpdate('photos', [...currentPhotos, { file, preview }]);
    }
  };

  const calculateCostFromText = (text: string): number | null => {
      const quantityMatch = text.match(/(\d+([\.,]\d+)?)\s*(sqft|sq\.ft\.|sf|square feet|linear feet|lf|ft)/i);
      
      if (quantityMatch && quantityMatch[1]) {
          const quantity = parseFloat(quantityMatch[1].replace(',', ''));
          const unitCostData = UNIT_COST_DB[itemDef.defaultCostCode];
          
          if (unitCostData) {
              const unitPrice = unitCostData[quality] || unitCostData['Q4']; 
              if (unitPrice) {
                  return Math.round(quantity * unitPrice);
              }
          }
      }
      return null;
  };
  
  const processVoice = async (blob: Blob) => {
      setIsProcessingVoice(true);
      // Fallback for offline single-item voice currently not fully implemented in this MVP due to complexity,
      // focusing on Batch Room offline mode which is the "Magic Feature".
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const prompt = `
            You are a construction estimator assistant processing voice notes from a site walkthrough.
            Context: Room: ${roomId}, Item: ${itemDef.label}.
            Analyze the audio. Extract:
            - action: 'Replace', 'Repair', or 'Keep'
            - description: The work needed.
            - costEstimate: Number, ONLY if the user explicitly says a dollar amount.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING },
                        description: { type: Type.STRING },
                        costEstimate: { type: Type.NUMBER }
                    }
                },
                temperature: 0.1
            }
        });

        const result = JSON.parse(response.text);
        
        if (result.action && result.action !== 'Keep') {
            handleStatusChange(result.action);
        }
        
        const currentNotes = itemState?.notes || '';
        const newNotes = currentNotes ? `${currentNotes}\n${result.description}` : result.description;
        onUpdate('notes', newNotes);
        
        let calculatedCost = result.costEstimate;
        if (!calculatedCost || calculatedCost === 0) {
            calculatedCost = calculateCostFromText(result.description);
        }

        if (calculatedCost && calculatedCost > 0) {
            onUpdate('costEstimate', calculatedCost);
        }

      } catch (err) {
          console.error(err);
          onToast?.("Failed to process voice note. Please try again online.", 'error');
      } finally {
          setIsProcessingVoice(false);
      }
  };

  const isExpanded = status === 'Replace' || status === 'Repair';
  let containerBorderClass = 'border-white/5';
  if (status === 'Replace') containerBorderClass = 'border-red-500/50 bg-red-900/10';
  else if (status === 'Repair') containerBorderClass = 'border-yellow-500/50 bg-yellow-900/10';
  else if (status === 'Keep') containerBorderClass = 'border-brand-500/30 bg-brand-900/10';

  return (
    <div className={`mb-3 rounded-xl border transition-all duration-300 overflow-hidden ${containerBorderClass} bg-slate-800/70 backdrop-blur-sm`}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white text-lg tracking-wide">{itemDef.label}</span>
          {status && status !== 'Keep' && (
              <span className="font-mono font-bold text-brand-400 bg-black/20 px-2 py-1 rounded text-sm">
                  ${(itemState?.costEstimate || 0).toLocaleString()}
              </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1 bg-black/30 p-1 rounded-lg">
          {(['Keep', 'Repair', 'Replace'] as const).map((opt) => {
            const isActive = status === opt;
            let activeClass = 'text-slate-400 hover:text-white hover:bg-white/5';
            
            if (isActive) {
              if (opt === 'Keep') activeClass = 'bg-brand-600 text-white shadow-lg shadow-brand-900/50';
              if (opt === 'Repair') activeClass = 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/50';
              if (opt === 'Replace') activeClass = 'bg-red-600 text-white shadow-lg shadow-red-900/50';
            }

            return (
              <button
                key={opt}
                onClick={() => handleStatusChange(opt)}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${activeClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        
        {showHistoricalPrompt && isExpanded && (
            <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-brand-600/20 border border-brand-500/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center text-xs text-brand-200">
                    <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>
                        Typical cost: <strong className="text-white">${MOCK_HISTORICAL_DATA[itemDef.defaultCostCode].price.toLocaleString()}</strong>
                    </span>
                </div>
                <button 
                    onClick={applyHistoricalPrice}
                    className="bg-brand-500 hover:bg-brand-400 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm transition-colors"
                >
                    Apply
                </button>
            </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300">
          <div className="h-px w-full bg-white/10 mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Cost</label>
                  {unitCost && (
                      <div className="text-[10px] text-brand-300 font-mono bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/30 flex items-center">
                          <CalculatorIcon className="w-3 h-3 mr-1" />
                          Regional Avg: ${unitCost.toFixed(2)}/unit
                      </div>
                  )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                <input
                  type="number"
                  value={itemState?.costEstimate || ''}
                  onChange={(e) => onUpdate('costEstimate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-3 rounded-lg border border-white/10 bg-black/20 text-white text-lg font-bold focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notes / Scope</label>
              <div className="flex gap-2">
                <textarea
                  value={itemState?.notes || ''}
                  onChange={(e) => onUpdate('notes', e.target.value)}
                  className="flex-grow p-3 rounded-lg border border-white/10 bg-black/20 text-white text-sm min-h-[80px] focus:border-brand-500 outline-none resize-none"
                  placeholder="Describe work needed..."
                />
                <div className="flex-shrink-0 flex flex-col justify-end items-center gap-2">
                   {isProcessingVoice && <SpinnerIcon className="w-5 h-5 text-brand-400 animate-spin" />}
                   <VoiceRecorder onRecordingComplete={processVoice} className="shadow-lg" onToast={onToast} />
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Photos ({itemState?.photos?.length || 0})</label>
                <div className="flex gap-2">
                    <button onClick={onOpenCamera} className="flex items-center text-[10px] font-bold text-brand-300 bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 rounded-full hover:bg-brand-500/20 transition-colors shadow-sm">
                        <CameraIcon className="w-3 h-3 mr-1" /> Camera
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center text-[10px] font-bold text-slate-400 border border-white/10 px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                        + Gallery
                    </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleNativeFileUpload} />
              </div>
              {itemState?.photos && itemState.photos.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {itemState.photos.map((p, i) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/10 group shadow-lg">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => { const newPhotos = [...(itemState.photos || [])]; newPhotos.splice(i, 1); onUpdate('photos', newPhotos); }} className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                  <div className="h-16 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-xs text-slate-500">No photos</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WalkthroughRoomView: React.FC<WalkthroughRoomViewProps> = ({ room, itemsState, onUpdateItem, onBack, selectedQuality, onNextRoom, onPrevRoom, nextRoomLabel, prevRoomLabel, onAddPendingJob, onToast }) => {
  const total = (Object.values(itemsState) as WalkthroughItemRecord[]).reduce((acc, item) => acc + (item.costEstimate || 0), 0);
  const [cameraTargetId, setCameraTargetId] = useState<string | null>(null);
  const [isProcessingRoom, setIsProcessingRoom] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  const handleCameraSave = (photos: { file: File, preview: string }[]) => {
      if (cameraTargetId) {
          const currentItem = itemsState[cameraTargetId];
          const existingPhotos = currentItem?.photos || [];
          onUpdateItem(cameraTargetId, 'photos', [...existingPhotos, ...photos]);
          setCameraTargetId(null);
      }
  };

  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
      if ('vibrate' in navigator) {
          navigator.vibrate(pattern);
      }
  }, []);

  const handleBatchRoomVoice = async (blob: Blob) => {
      if (isProcessingRoom) return;
      
      triggerHaptic(100); 
      
      // OFFLINE CHECK
      if (!navigator.onLine) {
          if (onAddPendingJob) {
              const dbKey = `pending_voice_${room.id}_${Date.now()}`;
              try {
                  await saveAsset(dbKey, blob);
                  onAddPendingJob({
                      id: Date.now().toString(),
                      type: 'room_voice',
                      roomId: room.id,
                      timestamp: Date.now(),
                      dataKey: dbKey
                  });
                  setShowOfflineNotice(true);
                  triggerHaptic([50, 50]); // Success pattern
                  setTimeout(() => setShowOfflineNotice(false), 4000);
              } catch (e) {
                  console.error("Failed to save offline asset", e);
                  onToast?.("Failed to save recording locally. Please check storage.", 'error');
              }
          }
          return;
      }

      setIsProcessingRoom(true);
      setProcessingStage('Analyzing whole-room audio...');

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const itemsContext = room.items.map(i => `- ${i.id}: ${i.label}`).join('\n');
        const systemPrompt = `
            You are a master construction estimator. The user is recording a "Room Walkthrough" for a ${room.label}.
            Given the audio, extract updates for these specific items:
            ${itemsContext}

            For each item mentioned, return:
            - itemId: The string ID provided above.
            - status: One of 'Replace', 'Repair', or 'Keep'.
            - description: A concise note of what the user said about this specific item.
            - costEstimate: Number, ONLY if the user explicitly stated a specific price.

            If an item is NOT mentioned in the audio, do NOT return it in the list.
            Ignore background noise. Focus only on the inspector's voice.
        `;

        setProcessingStage(`Mapping to ${room.label} items...`);

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { text: systemPrompt },
                    { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            itemId: { type: Type.STRING },
                            status: { type: Type.STRING },
                            description: { type: Type.STRING },
                            costEstimate: { type: Type.NUMBER }
                        }
                    }
                },
                temperature: 0.1
            }
        });

        const updates = JSON.parse(response.text) as BatchRoomUpdate[];
        
        if (updates && updates.length > 0) {
            setProcessingStage(`Applying ${updates.length} updates...`);
            
            updates.forEach(update => {
                const storageKey = `${room.id}_${update.itemId}`;
                const itemDef = room.items.find(i => i.id === update.itemId);
                
                if (itemDef) {
                    const newStatus = update.status as WalkthroughItemStatus;
                    onUpdateItem(storageKey, 'status', newStatus);
                    
                    let finalCost = update.costEstimate;
                    if (!finalCost || finalCost === 0) {
                        const tierCosts = COST_DB[itemDef.defaultCostCode];
                        if (tierCosts) {
                            const baseCost = tierCosts[selectedQuality] || tierCosts['Q4'] || 0;
                            finalCost = newStatus === 'Repair' ? Math.round(baseCost * 0.4) : baseCost;
                        }
                    }
                    
                    onUpdateItem(storageKey, 'costEstimate', finalCost || 0);
                    onUpdateItem(storageKey, 'notes', update.description);
                }
            });
            triggerHaptic([50, 30, 50]); // Success pattern
        }

      } catch (err) {
          console.error(err);
          onToast?.("Batch processing failed. Try again or record items individually.", 'error');
      } finally {
          setIsProcessingRoom(false);
          setProcessingStage('');
      }
  };

  const handleStartRecord = () => {
      triggerHaptic(50); // Small buzz on start
  };

  return (
    <>
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-[#1E2E5C] text-white animate-in slide-in-from-right-10 duration-300 relative">
        
        {/* Header */}
        <div className="p-4 bg-slate-800/70 backdrop-blur-sm border-b border-white/10 flex items-center justify-between sticky top-0 z-20 shadow-md">
            <div className="flex items-center">
                <button onClick={onBack} className="mr-3 p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <span className="mr-3 text-2xl filter drop-shadow-md">{room.icon}</span> 
                        {room.label}
                    </h2>
                </div>
            </div>
            <div className="text-right bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Room Total</div>
                <div className="text-lg font-mono font-bold text-brand-400">${total.toLocaleString()}</div>
            </div>
        </div>

        {/* Offline Notice */}
        {showOfflineNotice && (
            <div className="p-4 bg-amber-500/20 border-b border-amber-500/30 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-full text-black">
                        <WavesIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-200 text-sm">Saved to Device</h4>
                        <p className="text-[10px] text-amber-100/80">
                            Recording queued. Will sync automatically when online.
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Continuous Flow Mode CTA */}
        <div className="p-4 bg-brand-600/10 border-b border-brand-500/20">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <h4 className="text-sm font-bold text-brand-200 flex items-center">
                        <WavesIcon className="w-4 h-4 mr-2" />
                        Room Walkthrough Mode
                    </h4>
                    <p className="text-[10px] text-brand-300/80 leading-tight mt-1">
                        Hold the mic and describe the whole room in one go. Gemini will extract every item.
                    </p>
                </div>
                <VoiceRecorder onRecordingComplete={handleBatchRoomVoice} className="scale-125" onToast={onToast} />
            </div>
        </div>

        {/* Processing Overlay */}
        {isProcessingRoom && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <div className="relative mb-6">
                    <div className="w-24 h-24 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AudioWavesIcon className="w-10 h-10 text-brand-400 animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Magic in progress...</h3>
                <p className="text-sm font-mono text-brand-400 animate-pulse uppercase tracking-widest">{processingStage}</p>
            </div>
        )}

        {/* List */}
        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
            <div className="pb-24">
                {room.items.map(itemDef => {
                    const storageKey = `${room.id}_${itemDef.id}`;
                    const itemState = itemsState[storageKey];
                    return (
                        <WalkthroughItemRow
                            key={itemDef.id}
                            itemDef={itemDef}
                            roomId={room.id}
                            itemState={itemState}
                            onUpdate={(field, value) => onUpdateItem(storageKey, field, value)}
                            quality={selectedQuality}
                            onOpenCamera={() => setCameraTargetId(storageKey)}
                            onToast={onToast}
                        />
                    );
                })}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/5 text-slate-500">
                        <CheckIcon className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold uppercase">End of Checklist</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-between pointer-events-none z-30">
            {onPrevRoom ? (
                <button onClick={onPrevRoom} className="pointer-events-auto flex items-center justify-center p-4 rounded-full bg-slate-800 text-white shadow-lg border border-slate-700 active:scale-95 transition-all">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            ) : <div />}
            {onNextRoom ? (
                <button onClick={onNextRoom} className="pointer-events-auto flex items-center px-6 py-4 rounded-full bg-[#32373c] text-white shadow-lg active:scale-95 transition-all font-bold hover:bg-[#4a5056]">
                    <span className="mr-2">Next Room</span>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={onBack} className="pointer-events-auto flex items-center px-6 py-4 rounded-full bg-[#32373c] text-white shadow-lg active:scale-95 transition-all font-bold hover:bg-[#4a5056]">
                    <span className="mr-2">Finish</span>
                    <CheckIcon className="w-5 h-5" />
                </button>
            )}
        </div>
        </div>

        <CameraModal 
            isOpen={!!cameraTargetId}
            onClose={() => setCameraTargetId(null)}
            onSave={handleCameraSave}
        />
    </>
  );
};
