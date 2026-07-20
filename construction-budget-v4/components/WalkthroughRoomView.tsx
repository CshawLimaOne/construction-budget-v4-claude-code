
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WalkthroughRoomDef, WalkthroughItemRecord, WalkthroughItemStatus } from '../types';
import { ChevronLeftIcon, CameraIcon, CheckIcon, TrashIcon, LightBulbIcon, ChevronRightIcon, CalculatorIcon } from './Icons';
import { COST_DB, UNIT_COST_DB, MOCK_HISTORICAL_DATA } from '../constants';
import { CameraModal } from './CameraModal';
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


  const isExpanded = status === 'Replace' || status === 'Repair';
  let containerBorderClass = 'border-[#DFE1E5]';
  if (status === 'Replace') containerBorderClass = 'border-[#B92814] bg-[#FFF0EE]';
  else if (status === 'Repair') containerBorderClass = 'border-[#EDDDB1] bg-[#FFF5DB]';
  else if (status === 'Keep') containerBorderClass = 'border-brand-200 bg-brand-50';
  else if (status === 'N/A') containerBorderClass = 'border-[#DFE1E5] bg-[#F6F7F9] opacity-60';

  return (
    <div className={`mb-3 rounded-xl border transition-all duration-300 overflow-hidden ${containerBorderClass} bg-white`}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#1E2D5C] text-lg tracking-wide">{itemDef.label}</span>
          {status && status !== 'Keep' && status !== 'N/A' && (
              <span className="font-mono font-bold text-brand-300 bg-brand-500/15 border border-brand-400/25 px-2.5 py-0.5 rounded-full text-sm">
                  ${(itemState?.costEstimate || 0).toLocaleString()}
              </span>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-1 bg-[#F6F7F9] p-1 rounded-xl">
          {(['Keep', 'Repair', 'Replace', 'N/A'] as const).map((opt) => {
            const isActive = status === opt;
            let activeClass = 'text-[#78819D] hover:text-[#1E2D5C] hover:bg-[#F7F9FC]';

            if (isActive) {
              if (opt === 'Keep')    activeClass = 'bg-brand-600 text-white shadow-lg shadow-brand-900/50';
              if (opt === 'Repair')  activeClass = 'bg-[#EAA800] text-white shadow-lg shadow-[#b37a00]/50';
              if (opt === 'Replace') activeClass = 'bg-[#B92814] text-white shadow-lg shadow-red-900/50';
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
            <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center text-xs text-[#1E2D5C]">
                    <LightBulbIcon className="w-4 h-4 mr-2 text-[#EAA800]" />
                    <span>
                        Typical cost: <strong className="text-[#1E2D5C]">${MOCK_HISTORICAL_DATA[itemDef.defaultCostCode].price.toLocaleString()}</strong>
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
          <div className="h-px w-full bg-[#DFE1E5] mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                  <label className="block text-[10px] font-bold text-[#78819D] uppercase">Estimated Cost</label>
                  {unitCost && (
                      <div className="text-[10px] text-brand-300 font-mono bg-brand-500/15 border border-brand-400/25 px-2 py-0.5 rounded-full flex items-center">
                          <CalculatorIcon className="w-3 h-3 mr-1" />
                          Regional Avg: ${unitCost.toFixed(2)}/unit
                      </div>
                  )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78819D] font-mono">$</span>
                <input
                  type="number"
                  value={itemState?.costEstimate || ''}
                  onChange={(e) => onUpdate('costEstimate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-[#DFE1E5] bg-white text-[#1E2D5C] text-lg font-bold focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#78819D] uppercase mb-1">Notes / Scope</label>
              <textarea
                value={itemState?.notes || ''}
                onChange={(e) => onUpdate('notes', e.target.value)}
                className="w-full p-3 rounded-xl border border-[#DFE1E5] bg-white text-[#1E2D5C] text-sm min-h-[80px] focus:border-brand-500 outline-none resize-none"
                placeholder="Describe work needed..."
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-[#78819D] uppercase">Photos ({itemState?.photos?.length || 0})</label>
                <div className="flex gap-2">
                    <button onClick={onOpenCamera} className="flex items-center text-[10px] font-bold text-brand-300 bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 rounded-full hover:bg-brand-500/20 transition-colors shadow-sm">
                        <CameraIcon className="w-3 h-3 mr-1" /> Camera
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center text-[10px] font-bold text-[#78819D] border border-[#DFE1E5] px-2 py-1.5 rounded-full hover:bg-[#F7F9FC] transition-colors">
                        + Gallery
                    </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleNativeFileUpload} />
              </div>
              {itemState?.photos && itemState.photos.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {itemState.photos.map((p, i) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-[#DFE1E5] group shadow-sm">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => { const newPhotos = [...(itemState.photos || [])]; newPhotos.splice(i, 1); onUpdate('photos', newPhotos); }} className="absolute top-1 right-1 bg-[#B92814]/90 text-white rounded-full p-1 transition-all active:scale-110 shadow-md">
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                  <div className="h-20 border border-dashed border-[#DFE1E5] rounded-xl flex items-center justify-center text-xs text-[#78819D]">No photos</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WalkthroughRoomView: React.FC<WalkthroughRoomViewProps> = ({ room, itemsState, onUpdateItem, onBack, selectedQuality, onNextRoom, onPrevRoom, nextRoomLabel, prevRoomLabel, onToast }) => {
  const total = (Object.values(itemsState) as WalkthroughItemRecord[]).reduce((acc, item) => acc + (item.costEstimate || 0), 0);
  const [cameraTargetId, setCameraTargetId] = useState<string | null>(null);

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

  return (
    <>
        <div
            className="flex flex-col h-full bg-[#F4F5F7] text-[#1E2D5C] animate-in slide-in-from-right-10 duration-300 relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#DFE1E5] flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
                <button onClick={onBack} className="mr-3 p-2 -ml-2 text-[#78819D] hover:text-[#1E2D5C] bg-[#F6F7F9] hover:bg-[#F7F9FC] rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-[#1E2D5C] flex items-center">
                        <span className="mr-2.5 flex-shrink-0">{getRoomHeaderIcon(room.icon)}</span>
                        {room.label}
                    </h2>
                </div>
            </div>
            <div className="text-right bg-[#F6F7F9] px-3 py-1.5 rounded-xl border border-[#DFE1E5]">
                <div className="text-[10px] text-[#78819D] uppercase font-bold">Room Total</div>
                <div className="text-lg font-mono font-bold text-brand-500">${total.toLocaleString()}</div>
            </div>
        </div>

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
                    <div className="w-10 h-10 rounded-full bg-[#E1F7E4] border border-[#ADDEB4] flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-[#139B23]" />
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-bold text-[#78819D] uppercase tracking-widest">All Items Reviewed</div>
                        <div className="text-[10px] text-[#78819D] mt-0.5">Use Next Room or Finish below</div>
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
                <button onClick={onPrevRoom} className="pointer-events-auto flex items-center justify-center p-4 rounded-full bg-white text-[#1E2D5C] shadow-sm border border-[#DFE1E5] hover:bg-[#F7F9FC] active:scale-95 transition-all">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            ) : <div />}
            {onNextRoom ? (
                <button onClick={onNextRoom} className="pointer-events-auto flex items-center px-6 py-4 rounded-full bg-brand-500 text-white shadow-sm active:scale-95 transition-all font-bold hover:bg-brand-600">
                    <span className="mr-2">Next Room</span>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={onBack} className="pointer-events-auto flex items-center px-6 py-4 rounded-full bg-white text-[#1E2D5C] shadow-sm border border-[#DFE1E5] hover:bg-[#F7F9FC] active:scale-95 transition-all font-bold">
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
