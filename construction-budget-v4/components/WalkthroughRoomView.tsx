
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WalkthroughRoomDef, WalkthroughItemRecord, WalkthroughItemStatus, BatchRoomUpdate } from '../types';
import { ChevronLeftIcon, CameraIcon, CheckIcon, TrashIcon, SpinnerIcon, LightBulbIcon, ChevronRightIcon, AudioWavesIcon, WavesIcon, CalculatorIcon } from './Icons';
import { VoiceRecorder } from './VoiceRecorder';
import { COST_DB, UNIT_COST_DB, MOCK_HISTORICAL_DATA } from '../constants';
import { CameraModal } from './CameraModal';
import { GoogleGenAI, Type } from '@google/genai';
import { saveAsset } from '../utils/offlineStorage';
import { ShowToastFn } from './Toast';

// --- Room icon helpers (mirrors WalkthroughDashboard, scoped here to avoid cross-component coupling) ---
const ROOM_ICON_MAP: Record<string, { color: string }> = {
  kitchen:     { color: 'text-orange-300'  },
  bathroom:    { color: 'text-cyan-300'    },
  bedroom:     { color: 'text-indigo-300'  },
  living_room: { color: 'text-violet-300'  },
  basement:    { color: 'text-amber-300'   },
  exterior:    { color: 'text-emerald-300' },
  systems:     { color: 'text-brand-300'   },
};

const getRoomHeaderIcon = (iconKey: string) => {
  const conf = ROOM_ICON_MAP[iconKey] || ROOM_ICON_MAP['exterior'];
  const cls = `w-6 h-6 ${conf.color}`;
  const key = Object.keys(ROOM_ICON_MAP).find(k => iconKey.startsWith(k)) || 'exterior';
  const svgs: Record<string, React.ReactNode> = {
    kitchen:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><rect x="4" y="9" width="16" height="11" rx="2"/><circle cx="9" cy="14" r="2"/><circle cx="15" cy="14" r="2"/><path d="M8 6v3M12 6v3M16 6v3"/></svg>,
    bathroom:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M4 13v3a2 2 0 002 2h12a2 2 0 002-2v-3H4z"/><path d="M4 13H2v-2a3 3 0 013-3h1V5a1 1 0 011-1h2"/><path d="M8 20v2M16 20v2"/></svg>,
    bedroom:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M3 7v13M21 7v13"/><path d="M3 13h18"/><path d="M3 20h18"/><rect x="5" y="7" width="5" height="5" rx="1"/><rect x="14" y="7" width="5" height="5" rx="1"/></svg>,
    living_room: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M2 13a2 2 0 012-2h16a2 2 0 012 2v2H2v-2z"/><path d="M6 11V9a2 2 0 014 0v2M14 11V9a2 2 0 014 0v2"/><path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2"/><path d="M7 19v2M17 19v2"/></svg>,
    basement:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M4 20h4v-4h4v-4h4v-4h4"/><path d="M4 20v-4M8 16v-4M12 12v-4"/></svg>,
    exterior:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M5 21h14"/></svg>,
    systems:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  };
  return svgs[key] || svgs['exterior'];
};

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
  else if (status === 'N/A') containerBorderClass = 'border-slate-600/50 bg-slate-800/30 opacity-60';

  return (
    <div className={`mb-3 rounded-xl border transition-all duration-300 overflow-hidden ${containerBorderClass} bg-slate-800/70 backdrop-blur-sm`}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-white text-lg tracking-wide">{itemDef.label}</span>
          {status && status !== 'Keep' && status !== 'N/A' && (
              <span className="font-mono font-bold text-brand-300 bg-brand-500/15 border border-brand-400/25 px-2.5 py-0.5 rounded-full text-sm">
                  ${(itemState?.costEstimate || 0).toLocaleString()}
              </span>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-1 bg-black/30 p-1 rounded-xl">
          {(['Keep', 'Repair', 'Replace', 'N/A'] as const).map((opt) => {
            const isActive = status === opt;
            let activeClass = 'text-slate-400 hover:text-white hover:bg-white/5';

            if (isActive) {
              if (opt === 'Keep')    activeClass = 'bg-brand-600 text-white shadow-lg shadow-brand-900/50';
              if (opt === 'Repair')  activeClass = 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/50';
              if (opt === 'Replace') activeClass = 'bg-red-600 text-white shadow-lg shadow-red-900/50';
              if (opt === 'N/A')     activeClass = 'bg-slate-600 text-white shadow-lg';
            }

            return (
              <button
                key={opt}
                onClick={() => handleStatusChange(opt)}
                className={`py-3.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 active:scale-95 ${activeClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        
        {showHistoricalPrompt && isExpanded && (
            <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-brand-600/20 border border-brand-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center text-xs text-brand-200">
                    <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>
                        Typical cost: <strong className="text-white">${MOCK_HISTORICAL_DATA[itemDef.defaultCostCode].price.toLocaleString()}</strong>
                    </span>
                </div>
                <button 
                    onClick={applyHistoricalPrice}
                    className="bg-brand-500 hover:bg-brand-400 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm transition-colors"
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
                      <div className="text-[10px] text-brand-300 font-mono bg-brand-500/15 border border-brand-400/25 px-2 py-0.5 rounded-full flex items-center">
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
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-white/10 bg-slate-800/60 text-white text-lg font-bold focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
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
                  className="flex-grow p-3 rounded-xl border border-white/10 bg-slate-800/60 text-white text-sm min-h-[80px] focus:border-brand-500 outline-none resize-none"
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
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 group shadow-lg">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => { const newPhotos = [...(itemState.photos || [])]; newPhotos.splice(i, 1); onUpdate('photos', newPhotos); }} className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 transition-all active:scale-110 shadow-md">
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                  <div className="h-20 border border-dashed border-white/15 rounded-xl flex items-center justify-center text-xs text-slate-500">No photos</div>
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

  // --- Swipe gesture state ---
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;
      const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
      // Only register horizontal swipe if it's more horizontal than vertical (not a scroll)
      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > deltaY * 1.5) {
          if (deltaX > 0 && onNextRoom) { triggerHaptic(40); onNextRoom(); }
          if (deltaX < 0 && onPrevRoom) { triggerHaptic(40); onPrevRoom(); }
      }
  }, [onNextRoom, onPrevRoom, triggerHaptic]);

  // --- Room completion celebration ---
  const allItemsComplete = room.items.every(item => {
      const key = `${room.id}_${item.id}`;
      return !!itemsState[key]?.status;
  });
  const prevAllComplete = useRef(false);
  useEffect(() => {
      if (allItemsComplete && !prevAllComplete.current && room.items.length > 0) {
          triggerHaptic([30, 50, 30, 50, 80]);
      }
      prevAllComplete.current = allItemsComplete;
  }, [allItemsComplete, room.items.length, triggerHaptic]);

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
        <div
            className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-[#1E2E5C] text-white animate-in slide-in-from-right-10 duration-300 relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
        
        {/* Header */}
        <div className="p-4 bg-slate-800/70 backdrop-blur-sm border-b border-white/10 flex items-center justify-between sticky top-0 z-20 shadow-md">
            <div className="flex items-center">
                <button onClick={onBack} className="mr-3 p-2 -ml-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <span className="mr-2.5 flex-shrink-0">{getRoomHeaderIcon(room.icon)}</span>
                        {room.label}
                    </h2>
                </div>
            </div>
            <div className="text-right bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
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
        <div className="mx-4 mt-4 mb-2 p-4 bg-gradient-to-r from-brand-500/20 to-brand-600/10 border border-brand-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-white tracking-tight">
                            AI Room Scan
                        </h4>
                        <span className="inline-flex text-[10px] font-bold bg-brand-500/25 border border-brand-400/30 text-brand-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Recommended
                        </span>
                    </div>
                    <p className="text-[11px] text-brand-200/80 leading-snug">
                        Hold the mic button and describe the whole room aloud. AI will fill in every item automatically.
                    </p>
                </div>
                <VoiceRecorder onRecordingComplete={handleBatchRoomVoice} className="scale-110" onToast={onToast} />
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
                <div className="mt-8 mb-4 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Items Reviewed</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Use Next Room or Finish below</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Navigation — safe-area-aware for iOS home indicator */}
        <div
            className="fixed bottom-0 left-0 right-0 px-4 flex justify-between pointer-events-none z-30"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {onPrevRoom ? (
                <button onClick={onPrevRoom} className="pointer-events-auto flex items-center justify-center p-4 rounded-full bg-white/10 text-white shadow-lg border border-white/20 active:scale-95 transition-all backdrop-blur-sm">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            ) : <div />}
            {onNextRoom ? (
                <button onClick={onNextRoom} className="pointer-events-auto flex items-center px-6 py-4 rounded-full bg-[#0693e3] text-white shadow-lg active:scale-95 transition-all font-bold hover:bg-[#0578c5]" style={{ boxShadow: '0 4px 20px rgba(6,147,227,0.4)' }}>
                    <span className="mr-2">Next Room</span>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={onBack} className="pointer-events-auto flex items-center px-6 py-4 rounded-full bg-white/10 text-white shadow-lg border border-white/20 active:scale-95 transition-all font-bold backdrop-blur-sm">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    <span>Back to Rooms</span>
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
