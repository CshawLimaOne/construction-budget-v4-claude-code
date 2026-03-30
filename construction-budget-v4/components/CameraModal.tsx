
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { XIcon, CheckIcon, SwitchCameraIcon, CameraIcon, TrashIcon } from './Icons';

interface CapturedPhoto {
  file: File;
  preview: string;
}

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photos: CapturedPhoto[]) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false); // For visual burst feedback

  // Initialize Camera
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, [facingMode]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      // Cleanup on close
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setPhotos([]); // Reset photos on close? Or keep? Reset for now.
    }
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isOpen, startCamera]);

  const triggerHaptic = () => {
      if ('vibrate' in navigator) {
          navigator.vibrate(50);
      }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Haptic & Visual Feedback
        triggerHaptic();
        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = URL.createObjectURL(blob);
            setPhotos(prev => [...prev, { file, preview }]);
          }
        }, 'image/jpeg', 0.85);
      }
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDone = () => {
    onSave(photos);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Flash Overlay */}
      <div className={`absolute inset-0 bg-white pointer-events-none z-30 transition-opacity duration-150 ${flash ? 'opacity-50' : 'opacity-0'}`}></div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm"
        >
            <XIcon className="w-6 h-6" />
        </button>
        <button 
            onClick={handleSwitchCamera}
            className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm"
        >
            <SwitchCameraIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Video Feed */}
      <div className="flex-grow relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
            <div className="text-white text-center p-4">
                <p className="mb-2 text-red-400">{error}</p>
                <button onClick={startCamera} className="px-4 py-2 bg-slate-700 rounded text-sm">Retry</button>
            </div>
        ) : (
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 pb-8 pt-4 px-6 flex flex-col gap-4">
        
        {/* Gallery Strip */}
        {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {photos.map((photo, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border border-white/20 animate-in slide-in-from-right-10 duration-200">
                        <img src={photo.preview} className="w-full h-full object-cover" alt="captured" />
                        <button 
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-0 right-0 bg-red-600 p-0.5"
                        >
                            <XIcon className="w-3 h-3 text-white" />
                        </button>
                    </div>
                ))}
            </div>
        )}

        <div className="flex items-center justify-between">
            {/* Last Photo / Gallery Placeholder */}
            <div className="w-12 h-12">
               {photos.length > 0 ? (
                   <div className="relative">
                       <img src={photos[photos.length - 1].preview} className="w-12 h-12 rounded-lg object-cover border-2 border-white" alt="last" />
                       <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black">
                           {photos.length}
                       </span>
                   </div>
               ) : (
                   <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20"></div>
               )}
            </div>

            {/* Shutter Button */}
            <button 
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
            >
                <div className="w-16 h-16 bg-white rounded-full"></div>
            </button>

            {/* Done Button */}
            <button 
                onClick={handleDone}
                className="h-12 px-4 rounded-full bg-[#32373c] text-white font-bold text-sm flex items-center justify-center hover:bg-[#4a5056] transition-colors"
            >
                Done
                <CheckIcon className="w-4 h-4 ml-1" />
            </button>
        </div>
      </div>
    </div>
  );
};
