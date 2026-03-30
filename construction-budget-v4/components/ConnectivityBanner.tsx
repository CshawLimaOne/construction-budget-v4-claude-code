
import React from 'react';
import { CloudUploadIcon, WarningTriangleIcon } from './Icons';

interface ConnectivityBannerProps {
  isOnline: boolean;
  pendingCount: number;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({ isOnline, pendingCount }) => {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`w-full py-2 px-4 text-xs font-bold text-center flex items-center justify-center transition-colors duration-500 ${isOnline ? 'bg-brand-600 text-white' : 'bg-amber-500 text-black'}`}>
      {isOnline ? (
        <>
          <CloudUploadIcon className="w-4 h-4 mr-2 animate-bounce" />
          <span>Connection restored. Syncing {pendingCount} item{pendingCount > 1 ? 's' : ''}...</span>
        </>
      ) : (
        <>
          <WarningTriangleIcon className="w-4 h-4 mr-2" />
          <span>You are offline. Changes are saved to your device and will sync later.</span>
        </>
      )}
    </div>
  );
};
