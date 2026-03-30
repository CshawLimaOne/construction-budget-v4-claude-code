
import React, { useState, useMemo } from 'react';
import { WalkthroughRoomDef, WalkthroughState, WalkthroughItemRecord } from '../types';
import { CheckIcon, XIcon, PlusIcon, HomeModernIcon, WrenchScrewdriverIcon, WarningTriangleIcon } from './Icons';
import { WALKTHROUGH_TEMPLATE } from '../walkthroughConstants';
import { ComplexModal } from './ComplexModal';

interface WalkthroughDashboardProps {
  rooms: WalkthroughRoomDef[]; 
  walkthroughState: WalkthroughState;
  onRoomSelect: (roomId: string) => void;
  onFinish: () => void;
  onExit: () => void;
  onAddRoom: (roomName: string, templateType: string) => void;
  projectDetails?: {
      beds: number;
      baths: number;
  };
  onUpdateProjectDetails: (beds: number, baths: number) => void;
}

const CircularProgress: React.FC<{ percentage: number; size?: number; color?: string }> = ({ percentage, size = 24, color = 'text-brand-500' }) => {
  const radius = size / 2 - 2; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-white/10"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-500 ease-out`}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {percentage === 100 && (
          <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
              <CheckIcon className="w-3 h-3" />
          </div>
      )}
    </div>
  );
};

const AddRoomModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (name: string, type: string) => void }> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('living_areas');

    if (!isOpen) return null;

    const footer = (
        <>
            <button onClick={onClose} className="button-base bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
            <button 
                onClick={() => { if(name) onConfirm(name, type); }} 
                disabled={!name}
                className="button-base bg-[#32373c] text-white hover:bg-[#4a5056] disabled:opacity-50"
            >
                Add Room
            </button>
        </>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Add New Room" footer={footer} size="md">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Room Name</label>
                    <input 
                        autoFocus
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g. Guest Suite"
                        className="spreadsheet-input w-full !text-slate-900 dark:!text-white !bg-white dark:!bg-slate-900 border-slate-300 dark:border-slate-600"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Room Type Template</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                        className="spreadsheet-input w-full !text-slate-900 dark:!text-white !bg-white dark:!bg-slate-900 border-slate-300 dark:border-slate-600"
                    >
                        <option value="living_areas">Living Area (General)</option>
                        <option value="bedroom">Bedroom</option>
                        <option value="bath_secondary">Bathroom</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="basement">Basement</option>
                        <option value="exterior">Exterior</option>
                        <option value="systems">Systems</option>
                    </select>
                </div>
            </div>
        </ComplexModal>
    );
};

const EditProjectDetailsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: (beds: number, baths: number) => void;
    initialBeds: number;
    initialBaths: number;
}> = ({ isOpen, onClose, onConfirm, initialBeds, initialBaths }) => {
    const [beds, setBeds] = useState(initialBeds);
    const [baths, setBaths] = useState(initialBaths);

    if (!isOpen) return null;

    const footer = (
        <>
            <button onClick={onClose} className="button-base bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
            <button 
                onClick={() => onConfirm(beds, baths)} 
                className="button-base bg-[#32373c] text-white hover:bg-[#4a5056]"
            >
                Update Layout
            </button>
        </>
    );

    return (
        <ComplexModal isOpen={isOpen} onClose={onClose} title="Project Configuration" footer={footer} size="md">
            <div className="space-y-6">
                <div className="p-4 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-lg text-sm text-brand-800 dark:text-brand-200">
                    <p>Updating these counts will automatically adjust the room list to match your property.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bedrooms</label>
                        <input 
                            type="number" 
                            value={beds} 
                            onChange={e => setBeds(Math.max(0, parseInt(e.target.value) || 0))} 
                            className="spreadsheet-input w-full text-center text-xl font-bold h-14 !text-slate-900 dark:!text-white !bg-white dark:!bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Bathrooms</label>
                        <input 
                            type="number" 
                            value={baths} 
                            onChange={e => setBaths(Math.max(0, parseFloat(e.target.value) || 0))} 
                            className="spreadsheet-input w-full text-center text-xl font-bold h-14 !text-slate-900 dark:!text-white !bg-white dark:!bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
            </div>
        </ComplexModal>
    );
};

// Exit Confirmation Modal
const ExitConfirmModal: React.FC<{ isOpen: boolean; onClose: () => void; onSaveDraft: () => void; onSync: () => void; }> = ({ isOpen, onClose, onSaveDraft, onSync }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <WarningTriangleIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sync before closing?</h3>
                    <p className="text-slate-400 text-sm">
                        You have recorded walkthrough data. Do you want to sync these changes to your main budget now?
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onSync}
                        className="w-full py-3 bg-[#32373c] hover:bg-[#4a5056] text-white rounded-lg font-bold transition-colors flex items-center justify-center shadow-lg"
                    >
                        Review & Sync to Budget
                    </button>
                    <button 
                        onClick={onSaveDraft}
                        className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold transition-colors"
                    >
                        Save Draft & Exit
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export const WalkthroughDashboard: React.FC<WalkthroughDashboardProps> = ({ walkthroughState, onRoomSelect, onFinish, onExit, onAddRoom, projectDetails, onUpdateProjectDetails }) => {
  
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // Auto-generate rooms based on project details + template logic
  const generatedRooms = useMemo(() => {
      const dynamicRooms: WalkthroughRoomDef[] = [];
      const beds = projectDetails?.beds || 0;
      const baths = projectDetails?.baths || 0;

      // 1. Core Rooms
      WALKTHROUGH_TEMPLATE.forEach(template => {
          if (['kitchen', 'exterior', 'systems', 'living_room', 'basement'].includes(template.id)) {
              dynamicRooms.push(template);
          }
          if (template.id === 'master_bath' && baths >= 1) {
              dynamicRooms.push(template);
          }
      });

      // 2. Extra Beds
      if (beds > 0) {
          const bedTemplate = WALKTHROUGH_TEMPLATE.find(t => t.id === 'bedroom');
          if (bedTemplate) {
              for (let i = 1; i <= beds; i++) {
                  dynamicRooms.push({
                      ...bedTemplate,
                      id: `bedroom_${i}`,
                      label: i === 1 ? 'Primary Bedroom' : `Bedroom ${i}`
                  });
              }
          }
      }

      // 3. Extra Baths
      if (baths > 1) {
          const bathTemplate = WALKTHROUGH_TEMPLATE.find(t => t.id === 'bath_secondary');
          if (bathTemplate) {
              for (let i = 2; i <= baths; i++) {
                  dynamicRooms.push({
                      ...bathTemplate,
                      id: `bath_${i}`,
                      label: `Bath ${i}`
                  });
              }
          }
      }

      const sortOrder = ['kitchen', 'master_bath', 'bath_', 'bedroom_', 'living', 'basement', 'exterior', 'systems'];
      return dynamicRooms.sort((a, b) => {
          const indexA = sortOrder.findIndex(key => a.id.startsWith(key));
          const indexB = sortOrder.findIndex(key => b.id.startsWith(key));
          return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });

  }, [projectDetails]);

  const allRooms = [...generatedRooms, ...(walkthroughState.customRooms || [])];
  const displayRooms = allRooms.length > 0 ? allRooms : WALKTHROUGH_TEMPLATE;

  const getRoomProgress = (roomId: string, items: WalkthroughRoomDef['items']) => {
    const totalItems = items.length;
    let checkedItems = 0;
    
    items.forEach(item => {
        const key = `${roomId}_${item.id}`;
        const record = walkthroughState.items[key];
        if (record && record.status) {
            checkedItems++;
        }
    });

    return { checked: checkedItems, total: totalItems, percentage: totalItems > 0 ? (checkedItems / totalItems) * 100 : 0 };
  };

  const totalRooms = displayRooms.length;
  const completedRooms = displayRooms.filter(r => getRoomProgress(r.id, r.items).percentage === 100).length;
  const overallProgress = totalRooms > 0 ? (completedRooms / totalRooms) * 100 : 0;
  
  const currentTotal = (Object.values(walkthroughState.items) as WalkthroughItemRecord[]).reduce((acc, item) => acc + (item.costEstimate || 0), 0);
  const itemsModified = (Object.values(walkthroughState.items) as WalkthroughItemRecord[]).some(i => i.status !== undefined && i.status !== 'Keep');

  const handleAddRoomConfirm = (name: string, type: string) => {
      onAddRoom(name, type);
      setIsAddRoomOpen(false);
  };

  const handleUpdateDetailsConfirm = (beds: number, baths: number) => {
      onUpdateProjectDetails(beds, baths);
      setIsEditDetailsOpen(false);
  };

  const handleExitRequest = () => {
      if (itemsModified) {
          setIsExitConfirmOpen(true);
      } else {
          onExit();
      }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-[#1E2E5C] text-white animate-in fade-in duration-300 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/05 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 bg-slate-800/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center">
                    <HomeModernIcon className="w-6 h-6 mr-2 text-brand-400" />
                    Mobile Walkthrough
                </h2>
                {/* Config Pill */}
                <button 
                    onClick={() => setIsEditDetailsOpen(true)}
                    className="mt-3 flex items-center group bg-slate-900/50 hover:bg-brand-600/20 border border-white/10 hover:border-brand-500/50 rounded-full pr-4 pl-1 py-1 transition-all duration-300"
                >
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center mr-3 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <WrenchScrewdriverIcon className="w-4 h-4 text-brand-400 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start mr-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-brand-200 leading-none mb-0.5">Configuration</span>
                        <span className="text-sm font-bold text-white leading-none">
                            {projectDetails ? `${projectDetails.beds} Beds, ${projectDetails.baths} Baths` : 'Set Layout'}
                        </span>
                    </div>
                    <div className="text-slate-500 group-hover:text-white transition-colors text-xs">Edit</div>
                </button>
            </div>

            <div className="flex flex-col items-end gap-3">
                <button 
                    onClick={handleExitRequest}
                    className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5 hover:border-white/20"
                    aria-label="Exit Walkthrough"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="text-right bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Running Total</div>
                    <div className="text-lg font-mono font-bold text-brand-400">
                        ${currentTotal.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{completedRooms} / {totalRooms} Rooms</span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="bg-gradient-to-r from-brand-600 to-brand-400 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,147,227,0.5)]"
                    style={{ width: `${overallProgress}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative z-10 flex-grow p-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-4 pb-24">
            {displayRooms.map(room => {
                const { checked, total, percentage } = getRoomProgress(room.id, room.items);
                const isStarted = percentage > 0;
                const isComplete = percentage === 100;

                // Dynamic Card Styles
                let cardBorderClass = 'border-white/10 hover:border-white/20';
                let bgClass = 'bg-white/5 hover:bg-white/10';
                let iconColor = 'text-slate-400';
                let progressColor = 'text-brand-500';

                if (isComplete) {
                    cardBorderClass = 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
                    bgClass = 'bg-emerald-900/20';
                    iconColor = 'text-emerald-400';
                    progressColor = 'text-emerald-400';
                } else if (isStarted) {
                    cardBorderClass = 'border-brand-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
                    bgClass = 'bg-brand-900/20';
                    iconColor = 'text-brand-400';
                }

                return (
                    <button
                        key={room.id}
                        onClick={() => onRoomSelect(room.id)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl backdrop-blur-sm border transition-all duration-200 active:scale-95 aspect-square ${cardBorderClass} ${bgClass}`}
                    >
                        <div className={`text-4xl mb-3 filter drop-shadow-md ${isComplete ? 'grayscale-0' : 'grayscale opacity-80'}`}>{room.icon}</div>
                        <h3 className={`font-bold text-sm text-center leading-tight mb-1 ${isComplete ? 'text-white' : 'text-slate-300'}`}>
                            {room.label}
                        </h3>
                        
                        <div className="absolute top-3 right-3">
                            <CircularProgress 
                                percentage={percentage} 
                                size={24} 
                                color={progressColor} 
                            />
                        </div>
                        
                        <div className={`mt-auto text-[10px] font-bold uppercase tracking-wide ${isComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {checked}/{total} Items
                        </div>
                    </button>
                );
            })}
            
            {/* Add Room Button */}
            <button
                onClick={() => setIsAddRoomOpen(true)}
                className="flex flex-col items-center justify-center p-4 bg-transparent rounded-2xl border-2 border-dashed border-slate-700 text-slate-500 hover:border-brand-500 hover:text-brand-400 hover:bg-brand-900/10 transition-all active:scale-95 aspect-square group"
            >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <PlusIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Add Room</span>
            </button>
        </div>
      </div>

      {/* Footer Action - Fixed at bottom */}
      <div className="relative z-20 p-4 bg-slate-900/90 border-t border-white/10 backdrop-blur-sm safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <button
            onClick={onFinish}
            className="button-base w-full bg-[#32373c] hover:bg-[#4a5056] text-white text-lg py-4 shadow-lg font-bold flex items-center justify-center"
        >
            <CheckIcon className="w-6 h-6 mr-2" />
            Review & Sync to Budget
        </button>
      </div>

      <AddRoomModal 
        isOpen={isAddRoomOpen} 
        onClose={() => setIsAddRoomOpen(false)} 
        onConfirm={handleAddRoomConfirm} 
      />

      <EditProjectDetailsModal
        isOpen={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        onConfirm={handleUpdateDetailsConfirm}
        initialBeds={projectDetails?.beds || 0}
        initialBaths={projectDetails?.baths || 0}
      />

      <ExitConfirmModal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        onSaveDraft={onExit}
        onSync={() => { setIsExitConfirmOpen(false); onFinish(); }}
      />
    </div>
  );
};
