
import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon } from './Icons';
import { ShowToastFn } from './Toast';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  className?: string;
  onToast?: ShowToastFn;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, className, onToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup function to stop tracks if component unmounts while recording
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      onToast?.('Could not access microphone. Please ensure permissions are granted.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle both mouse/touch events for "press and hold" behavior
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default behaviors like text selection or scrolling
    startRecording();
  };

  const handleStop = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {isRecording && (
        <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></div>
      )}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onMouseLeave={handleStop}
        onTouchStart={handleStart}
        onTouchEnd={handleStop}
        className={`relative z-10 flex items-center justify-center p-4 rounded-full transition-all duration-200 focus:outline-none shadow-lg ${
          isRecording 
            ? 'bg-red-600 text-white scale-110' 
            : 'bg-white text-red-500 border-2 border-red-500 hover:bg-red-50'
        }`}
        aria-label={isRecording ? "Release to stop recording" : "Press and hold to record"}
        title="Press and hold to record"
      >
        <MicrophoneIcon className="w-8 h-8" />
      </button>
      {isRecording && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-[#B92814] whitespace-nowrap animate-pulse">
          Recording...
        </div>
      )}
    </div>
  );
};
