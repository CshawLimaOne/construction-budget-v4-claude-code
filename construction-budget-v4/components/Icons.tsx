
import React from 'react';

// ... existing icons ...

export const AudioWavesIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L7.5 3M12 21L12 3M16.5 21L16.5 3M3 12h1.5m15 0H21" />
  </svg>
);

export const WavesIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.344 3.071a45.24 45.24 0 00-5.812 1.554l1.178 3.53a43.24 43.24 0 014.634-1.248L9.344 3.071zM14.656 3.071l-.01 3.766a43.24 43.24 0 014.634 1.248l1.178-3.53a45.24 45.24 0 00-5.812-1.554zM9.344 20.929l.01-3.766a43.24 43.24 0 01-4.634-1.248l-1.178 3.53a45.24 45.24 0 005.812 1.554zM14.656 20.929a45.24 45.24 0 005.812-1.554l-1.178-3.53a43.24 43.24 0 01-4.634 1.248l.01 3.766z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
);

export const InfoIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 inline-block ml-1 ${className}`}>
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clipRule="evenodd" />
  </svg>
);

export const FlagIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 inline-block mx-1 ${className}`}>
        <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-0.5H16a.75.75 0 0 0 .75-.75V3.5a.75.75 0 0 0-.75-.75H3.5V2.75Z" />
    </svg>
);

export const PlayCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 inline-block mr-1 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
  </svg>
);

export const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-5 h-5 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

export const ExclamationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 0 0-1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
  </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin h-5 w-5 text-slate-600 dark:text-slate-300 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const CameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.586a2 2 0 0 0 1.414-.586l.707-.707A2 2 0 0 1 7.414 4h5.172a2 2 0 0 1 1.414.586l.707.707A2 2 0 0 0 16.414 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" clipRule="evenodd" />
    </svg>
);

export const SwitchCameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

export const XCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 0 0-1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
);

export const XIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const CloudUploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
);

export const ArrowUpTrayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

export const BuildingIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

export const ClipboardUserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
    </svg>
);

export const CalculatorIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H11.25v-.008Zm3-6h.008v.008H11.25v-.008Zm0 3h.008v.008H14.25v-.008ZM12 6.75h5.25A2.25 2.25 0 0 1 19.5 9v6a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 15V9a2.25 2.25 0 0 1 2.25-2.25H12Z" />
    </svg>
);

export const ClipboardCheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// Descriptive Quality — pencil on document
export const DocumentTextIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

/* ── Sidebar step icons ───────────────────────────────────────────────── */

// Step 1 — Property Detail: house silhouette
export const HomeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12 11.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

// Step 2 — GC & Documents: ID card with person (contractor identity)
export const IdentificationIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
    </svg>
);

// Step 3 — Detailed Budget: banknotes (money / costs)
export const BanknotesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
);

// Step 4 — Review & Submit: paper airplane (send / submit)
export const PaperAirplaneIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

export const ChatBubbleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
        <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 1 4 2.5h12A1.5 1.5 0 0 1 17.5 4v8.5A1.5 1.5 0 0 1 16 14H6.621a1.5 1.5 0 0 0-1.06.44L2.5 17.5V4Z" clipRule="evenodd" />
    </svg>
);

export const WarningTriangleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
  </svg>
);

export const PuzzlePieceIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M8.106 2.115A2.993 2.993 0 0 1 10 2c1.825 0 3.362 1.533 3.633 3.394a2 2 0 0 1 3.468.532 2.992 2.992 0 0 1 .18 3.864c-.313.56-.848 1.002-1.492 1.299a2 2 0 0 1-1.434 1.879 2.993 2.993 0 0 1-3.633 3.394 2 2 0 0 1-3.468.532 2.992 2.992 0 0 1-.18-3.864c.313-.56.848-1.002 1.492-1.299a2 2 0 0 1 1.434-1.879A2.993 2.993 0 0 1 8 5c-1.825 0-3.362-1.533-3.633-3.394a2 2 0 0 1-3.468-.532 2.992 2.992 0 0 1-.18-3.864c.313-.56.848-1.002 1.492-1.299a2 2 0 0 1 1.434-1.879A2.993 2.993 0 0 1 8.106 2.115Z" />
  </svg>
);

export const PercentDownIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-7.5a.75.75 0 0 0 1.5 0v-2.546l.24.24a.75.75 0 0 0 1.06-1.06l-1.75-1.75a.75.75 0 0 0-1.06 0L7.44 7.184a.75.75 0 0 0 1.06 1.06l.25-.25v2.546Z" clipRule="evenodd" />
  </svg>
);

export const MicrophoneIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
    <path d="M12 18.75a6.002 6.002 0 0 1-4.034-1.534.75.75 0 0 1 1.06-1.06 4.5 4.5 0 0 0 5.948 0 .75.75 0 0 1 1.06 1.06A6.002 6.002 0 0 1 12 18.75Z" />
    <path d="M4.75 12.75a.75.75 0 0 0 1.5 0v.5c0 3.176 2.574 5.75 5.75 5.75s5.75-2.574 5.75-5.75v-.5a.75.75 0 0 0 1.5 0v.5c0 3.61-2.624 6.604-6.096 7.158l.596 2.342h1.5a.75.75 0 0 0 0 1.5h-5.5a.75.75 0 0 0 0-1.5h1.5l.596-2.342C7.374 19.854 4.75 16.86 4.75 13.25v-.5Z" />
  </svg>
);

export const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
  </svg>
);

export const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${className}`}>
    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
  </svg>
);

export const TrashIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.498 1.485 47.255 47.255 0 0 0-3.48-.514c.574 1.127.845 2.32.845 3.51V18a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4.5 18V9.7c0-1.19.27-2.383.845-3.51-1.205.166-2.386.335-3.48.514a.75.75 0 1 1-.498-1.485 48.819 48.819 0 0 1 3.878-.512v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.816 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-3.536 6.132a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Zm3.536 0a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Zm3.536 0a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

export const PlusIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10 2a6 6 0 00-6 6c0 1.887.454 3.665 1.257 5.234a.75.75 0 00.515.376l2.366.618a1.75 1.75 0 011.51 1.272l.022.083a.75.75 0 00.73.558h.001a.75.75 0 00.73-.559l.022-.083a1.75 1.75 0 011.51-1.273l2.366-.617a.75.75 0 00.515-.377A12.036 12.036 0 0016 8a6 6 0 00-6-6zM8 17.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
  </svg>
);

export const HammerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.989 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /> 
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

// Lima One-style renovation icon: house with wrench/tools
export const RenovationIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.204 3.045a1.5 1.5 0 012.092 0L21.75 12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5V19.5a.75.75 0 00.75.75H9.75v-4.5h4.5v4.5h4.5a.75.75 0 00.75-.75V10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75V4.5h-2.25v2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 13.5l2.25-2.25M15 11.25l1.28-1.28a1.875 1.875 0 012.47 2.47L17.47 13.72" />
    </svg>
);

// Lima One-style new construction icon: multi-story building frame
export const NewConstructionIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 21V7.5l6-4.5 6 4.5V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5h12M6 14.5h12M6 18.5h12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21v-3.5h4V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h6" />
    </svg>
);

// New Construction: Tower crane + ascending building floors
export const TractorIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Foundation slab */}
    <rect x="7" y="42" width="22" height="4" rx="1" fill="#fb923c" fillOpacity="0.2" stroke="#fb923c" strokeWidth="1.5" strokeOpacity="0.65"/>
    {/* Building floor 1 (bottom) */}
    <rect x="9" y="32" width="18" height="10" rx="0.5" fill="#fb923c" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5"/>
    {/* Building floor 2 (middle) */}
    <rect x="11" y="23" width="14" height="9" rx="0.5" fill="#fb923c" fillOpacity="0.13" stroke="currentColor" strokeWidth="1.5"/>
    {/* Building floor 3 (top, partially under construction) */}
    <rect x="13" y="15" width="10" height="8" rx="0.5" fill="#fb923c" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
    {/* Window details — floor 1 */}
    <rect x="12" y="34.5" width="3" height="4" rx="0.5" fill="#fb923c" fillOpacity="0.3" stroke="currentColor" strokeWidth="1"/>
    <rect x="17" y="34.5" width="3" height="4" rx="0.5" fill="#fb923c" fillOpacity="0.3" stroke="currentColor" strokeWidth="1"/>
    <rect x="22" y="34.5" width="3" height="4" rx="0.5" fill="#fb923c" fillOpacity="0.3" stroke="currentColor" strokeWidth="1"/>
    {/* Window details — floor 2 */}
    <rect x="14" y="26" width="2.5" height="3" rx="0.5" fill="#fb923c" fillOpacity="0.2" stroke="currentColor" strokeWidth="1"/>
    <rect x="19.5" y="26" width="2.5" height="3" rx="0.5" fill="#fb923c" fillOpacity="0.2" stroke="currentColor" strokeWidth="1"/>
    {/* Crane mast — vertical */}
    <line x1="38" y1="46" x2="38" y2="6" stroke="currentColor" strokeWidth="2.5"/>
    {/* Crane brace */}
    <line x1="38" y1="22" x2="32" y2="46" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
    {/* Crane boom — horizontal */}
    <line x1="14" y1="8" x2="44" y2="8" stroke="currentColor" strokeWidth="2"/>
    {/* Back stay — diagonal from mast top to end of boom */}
    <line x1="38" y1="7" x2="16" y2="8" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/>
    {/* Counterweight block */}
    <rect x="40" y="5" width="6" height="6" rx="1" fill="#fb923c" fillOpacity="0.35" stroke="#fb923c" strokeWidth="1.5"/>
    {/* Lift cable — dashed orange */}
    <line x1="24" y1="8" x2="24" y2="18" stroke="#fb923c" strokeWidth="1.5" strokeOpacity="0.75" strokeDasharray="2,1.5"/>
    {/* Hook */}
    <path d="M22 18 L22 22 Q22 26 26 26 Q30 26 30 22" stroke="#fb923c" strokeWidth="1.5" strokeOpacity="0.75" fill="none"/>
  </svg>
);

export const MagicWandIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

export const CompassIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.875 13.125 14.25 9.75l-3.375 3.375ZM13.125 10.875 9.75 14.25l3.375-3.375Z" />
    </svg>
);

export const FolderIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
);

export const DocumentPlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

// New Icons for Visual Selector Phase 2
export const PaintBrushIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.635m3.61 3.61a6 6 0 0 1-8.6 8.6M12.9 12.9l-.635.635" />
    </svg>
);

export const WrenchScrewdriverIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
);

// ── Rehab Type Icons — premium 48×48 illustrated icons ──────────────────────

// Light Cosmetic: paint roller with fresh mint-green paint swath + drops
export const RehabLightIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Fresh paint swath — wide stroke for paint film */}
    <path d="M3 24 Q10 20 18 23 Q26 26 34 22" stroke="#4ade80" strokeWidth="5" strokeOpacity="0.22" fill="none"/>
    <path d="M3 24 Q10 20 18 23 Q26 26 34 22" stroke="#4ade80" strokeWidth="2" strokeOpacity="0.7" fill="none"/>
    {/* Roller cylinder */}
    <rect x="2" y="6" width="28" height="13" rx="5" stroke="currentColor" strokeWidth="2"/>
    {/* Nap texture — zigzag pile on roller face */}
    <path d="M5 9 L7.5 14 L10 9 L12.5 14 L15 9 L17.5 14 L20 9 L22.5 14 L25 9 L27.5 14" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.5"/>
    {/* End cap */}
    <rect x="29" y="8" width="5" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    {/* L-arm */}
    <path d="M34 12.5 L42 12.5 L42 30" stroke="currentColor" strokeWidth="2"/>
    {/* Handle grip */}
    <rect x="38" y="30" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
    {/* Grip texture lines */}
    <line x1="40" y1="33" x2="44" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35"/>
    <line x1="40" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35"/>
    <line x1="40" y1="39" x2="44" y2="39" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35"/>
    {/* Paint drops — green filled circles */}
    <circle cx="10" cy="29" r="2.5" fill="#4ade80" fillOpacity="0.65"/>
    <circle cx="20" cy="31" r="1.8" fill="#4ade80" fillOpacity="0.45"/>
    <circle cx="29" cy="29" r="2" fill="#4ade80" fillOpacity="0.55"/>
  </svg>
);

// Standard Full: house cross-section — left half finished, right half teal framing exposed
export const RehabStandardIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Foundation block — teal accent */}
    <rect x="4" y="42" width="40" height="4" rx="1" fill="#2dd4bf" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
    {/* Roof */}
    <path d="M4 24 L24 8 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Left wall (finished) */}
    <path d="M6 24 L6 42" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 42 L26 42" stroke="currentColor" strokeWidth="2"/>
    {/* Left window */}
    <rect x="8" y="27" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="27" x2="12" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="8" y1="30.5" x2="16" y2="30.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Door */}
    <rect x="17" y="32" width="9" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="24.5" cy="37" r="0.9" fill="currentColor"/>
    {/* Cutaway divider — dashed teal line */}
    <line x1="28" y1="24" x2="28" y2="42" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="3,2" strokeOpacity="0.85"/>
    {/* Right half — exposed framing area tint */}
    <rect x="28" y="24" width="14" height="18" fill="#2dd4bf" fillOpacity="0.06"/>
    {/* Right wall */}
    <path d="M42 24 L42 42 L28 42" stroke="currentColor" strokeWidth="2"/>
    {/* Top plate */}
    <line x1="28" y1="24" x2="42" y2="24" stroke="#2dd4bf" strokeWidth="2.5" strokeOpacity="0.8"/>
    {/* Bottom plate */}
    <line x1="28" y1="42" x2="42" y2="42" stroke="#2dd4bf" strokeWidth="2.5" strokeOpacity="0.8"/>
    {/* Studs */}
    <line x1="32" y1="24" x2="32" y2="42" stroke="#2dd4bf" strokeWidth="1.5" strokeOpacity="0.65"/>
    <line x1="37" y1="24" x2="37" y2="42" stroke="#2dd4bf" strokeWidth="1.5" strokeOpacity="0.65"/>
    {/* Mid nogging */}
    <line x1="28" y1="33" x2="42" y2="33" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.5"/>
  </svg>
);

// Heavy: sledgehammer with amber impact zone + cracks
export const RehabHeavyIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground impact glow */}
    <ellipse cx="22" cy="44" rx="14" ry="3" fill="#fbbf24" fillOpacity="0.18"/>
    {/* Impact crack lines on ground */}
    <path d="M14 44 L18 40 L22 43 L26 38 L30 42 L34 44" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.65" fill="none"/>
    {/* Sledgehammer head — amber filled */}
    <rect x="3" y="19" width="22" height="14" rx="2.5" fill="#fbbf24" fillOpacity="0.18" stroke="currentColor" strokeWidth="2"/>
    {/* Head texture lines (weight/mass feel) */}
    <line x1="8" y1="21" x2="8" y2="31" stroke="#fbbf24" strokeWidth="1.3" strokeOpacity="0.45"/>
    <line x1="14" y1="21" x2="14" y2="31" stroke="#fbbf24" strokeWidth="1.1" strokeOpacity="0.3"/>
    <line x1="20" y1="21" x2="20" y2="31" stroke="#fbbf24" strokeWidth="1.1" strokeOpacity="0.3"/>
    {/* Handle — diagonal, thick */}
    <line x1="21" y1="26" x2="44" y2="5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    {/* Wood grain marks on handle */}
    <line x1="30" y1="19" x2="32" y2="17" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
    <line x1="36" y1="13" x2="38" y2="11" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
    {/* Radial impact lines — amber */}
    <line x1="2" y1="22" x2="4" y2="25" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.75"/>
    <line x1="1" y1="29" x2="3" y2="29" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.75"/>
    <line x1="2" y1="36" x2="4" y2="33" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.75"/>
    <line x1="8" y1="38" x2="9" y2="41" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.65"/>
    <line x1="16" y1="39" x2="16" y2="43" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.65"/>
    <line x1="24" y1="37" x2="26" y2="40" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.65"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

export const HomeModernIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
    </svg>
);

export const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

export const MapPinIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

export const PhotoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

// ── Condition Icons — premium house illustrations with color-coded status badges ──

// Shared house base paths (defined inline for clarity in each icon)
// viewBox 0 0 48 48, strokeLinecap/Join="round"

// C-1: Nearly New — pristine house + emerald 4-point sparkle star + shine marks
export const ConditionC1Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M6 23 L6 41 L42 41 L42 23" stroke="currentColor" strokeWidth="2"/>
    {/* Roof */}
    <path d="M4 24 L24 8 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Chimney */}
    <path d="M31 15 L31 8 L36 8 L36 18" stroke="currentColor" strokeWidth="1.5"/>
    {/* Door — emerald tint */}
    <rect x="19" y="31" width="10" height="10" rx="0.5" fill="#22c55e" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="27.5" cy="36" r="0.9" fill="currentColor"/>
    {/* Left window */}
    <rect x="8" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="26" x2="12" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="8" y1="29.5" x2="16" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Right window */}
    <rect x="32" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="36" y1="26" x2="36" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="32" y1="29.5" x2="40" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Sparkle star badge — top right, emerald */}
    <path d="M40 3 L41.5 7 L45.5 8.5 L41.5 10 L40 14 L38.5 10 L34.5 8.5 L38.5 7 Z" fill="#22c55e" fillOpacity="0.85" stroke="#22c55e" strokeWidth="0.5"/>
    {/* Small secondary sparkle */}
    <line x1="46" y1="3" x2="46" y2="6" stroke="#22c55e" strokeWidth="1.3" strokeOpacity="0.7"/>
    <line x1="44.5" y1="4.5" x2="47.5" y2="4.5" stroke="#22c55e" strokeWidth="1.3" strokeOpacity="0.7"/>
    {/* Wall shine marks */}
    <line x1="10" y1="24" x2="10" y2="22" stroke="#22c55e" strokeWidth="1.3" strokeOpacity="0.6"/>
    <line x1="38" y1="24" x2="38" y2="22" stroke="#22c55e" strokeWidth="1.3" strokeOpacity="0.6"/>
  </svg>
);

// C-2: Excellent — house + green circle-check badge
export const ConditionC2Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M6 23 L6 41 L42 41 L42 23" stroke="currentColor" strokeWidth="2"/>
    {/* Roof */}
    <path d="M4 24 L24 8 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Chimney */}
    <path d="M31 15 L31 8 L36 8 L36 18" stroke="currentColor" strokeWidth="1.5"/>
    {/* Door */}
    <rect x="19" y="31" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="27.5" cy="36" r="0.9" fill="currentColor"/>
    {/* Left window */}
    <rect x="8" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="26" x2="12" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="8" y1="29.5" x2="16" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Right window */}
    <rect x="32" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="36" y1="26" x2="36" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="32" y1="29.5" x2="40" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Circle-check badge — top right, light green */}
    <circle cx="40" cy="7.5" r="7" fill="#4ade80" fillOpacity="0.18" stroke="#4ade80" strokeWidth="2"/>
    <path d="M36 7.5 L39 10.5 L44 5" stroke="#4ade80" strokeWidth="2.5" fill="none"/>
  </svg>
);

// C-3: Well Maintained — house + yellow wrench-circle badge
export const ConditionC3Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M6 23 L6 41 L42 41 L42 23" stroke="currentColor" strokeWidth="2"/>
    {/* Roof */}
    <path d="M4 24 L24 8 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Chimney */}
    <path d="M31 15 L31 8 L36 8 L36 18" stroke="currentColor" strokeWidth="1.5"/>
    {/* Door */}
    <rect x="19" y="31" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="27.5" cy="36" r="0.9" fill="currentColor"/>
    {/* Left window */}
    <rect x="8" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="26" x2="12" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="8" y1="29.5" x2="16" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Right window */}
    <rect x="32" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="36" y1="26" x2="36" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="32" y1="29.5" x2="40" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Wrench circle badge — top right, yellow */}
    <circle cx="40" cy="7.5" r="7" fill="#eab308" fillOpacity="0.15" stroke="#eab308" strokeWidth="1.8"/>
    {/* Wrench: open circle head + diagonal handle */}
    <circle cx="38.5" cy="5.5" r="2.5" fill="none" stroke="#eab308" strokeWidth="2" strokeOpacity="0.85"/>
    <line x1="40.2" y1="7.3" x2="44" y2="11.5" stroke="#eab308" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85"/>
  </svg>
);

// C-4: Worn but Adequate — house + orange warning triangle badge + left wall crack
export const ConditionC4Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M6 23 L6 41 L42 41 L42 23" stroke="currentColor" strokeWidth="2"/>
    {/* Roof */}
    <path d="M4 24 L24 8 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Chimney */}
    <path d="M31 15 L31 8 L36 8 L36 18" stroke="currentColor" strokeWidth="1.5"/>
    {/* Door */}
    <rect x="19" y="31" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="27.5" cy="36" r="0.9" fill="currentColor"/>
    {/* Left window */}
    <rect x="8" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="26" x2="12" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="8" y1="29.5" x2="16" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Right window */}
    <rect x="32" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="36" y1="26" x2="36" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    <line x1="32" y1="29.5" x2="40" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Warning triangle badge — top right, orange */}
    <path d="M40 1.5 L47 13.5 L33 13.5 Z" fill="#f97316" fillOpacity="0.2" stroke="#f97316" strokeWidth="1.8" strokeLinejoin="round"/>
    <line x1="40" y1="5" x2="40" y2="9.5" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9"/>
    <circle cx="40" cy="12" r="1" fill="#f97316" strokeOpacity="0.9"/>
    {/* Left wall crack — orange zigzag */}
    <path d="M11 23 L8 28 L13 33 L9 38 L12 41" stroke="#f97316" strokeWidth="2.5" strokeOpacity="0.75" fill="none"/>
  </svg>
);

// C-5: Significant Repairs — house + red warning badge + broken window + roof gap + two cracks
export const ConditionC5Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M6 23 L6 41 L42 41 L42 23" stroke="currentColor" strokeWidth="2"/>
    {/* Roof with gap at peak */}
    <path d="M4 24 L20 10" stroke="currentColor" strokeWidth="2"/>
    <path d="M28 10 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Chimney (leaning slightly) */}
    <path d="M31 15 L31 8 L36 8 L36 17" stroke="currentColor" strokeWidth="1.5"/>
    {/* Door */}
    <rect x="19" y="31" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    {/* Left window — intact */}
    <rect x="8" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="26" x2="12" y2="33" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
    <line x1="8" y1="29.5" x2="16" y2="29.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
    {/* Right window — broken diagonal crack */}
    <rect x="32" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="32" y1="26" x2="40" y2="33" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.75"/>
    <line x1="36" y1="26" x2="32" y2="30" stroke="#ef4444" strokeWidth="1.2" strokeOpacity="0.5"/>
    {/* Two wall cracks — red */}
    <path d="M10 23 L7 28 L12 33 L8 38 L11 41" stroke="#ef4444" strokeWidth="2.5" strokeOpacity="0.75" fill="none"/>
    <path d="M39 27 L42 32 L39 37" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.6" fill="none"/>
    {/* Red circle-warning badge — top right */}
    <circle cx="40" cy="7.5" r="7" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="2"/>
    <line x1="40" y1="4.5" x2="40" y2="8.5" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="40" cy="11" r="1.1" fill="#ef4444"/>
  </svg>
);

// C-6: Uninhabitable — collapsed jagged roof + Xd windows + massive cracks + red X badge
export const ConditionC6Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M6 23 L6 41 L42 41 L42 23" stroke="currentColor" strokeWidth="2"/>
    {/* Dramatically collapsed/jagged roof */}
    <path d="M4 24 L14 15 L18 20 L24 11 L30 20 L34 15 L44 24" stroke="currentColor" strokeWidth="2"/>
    {/* Both windows — Xd out with red */}
    <rect x="8" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="8" y1="26" x2="16" y2="33" stroke="#dc2626" strokeWidth="2" strokeOpacity="0.8"/>
    <line x1="16" y1="26" x2="8" y2="33" stroke="#dc2626" strokeWidth="2" strokeOpacity="0.8"/>
    <rect x="32" y="26" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="32" y1="26" x2="40" y2="33" stroke="#dc2626" strokeWidth="2" strokeOpacity="0.8"/>
    <line x1="40" y1="26" x2="32" y2="33" stroke="#dc2626" strokeWidth="2" strokeOpacity="0.8"/>
    {/* Massive left wall crack */}
    <path d="M9 23 L5 29 L11 34 L6 39 L9 41" stroke="#dc2626" strokeWidth="3" strokeOpacity="0.75" fill="none"/>
    {/* Foundation crack */}
    <path d="M15 41 L19 38 L23 40 L27 37 L31 40 L35 37" stroke="#dc2626" strokeWidth="1.8" strokeOpacity="0.65" fill="none"/>
    {/* Red circle-X badge — top right */}
    <circle cx="40" cy="7.5" r="7" fill="#dc2626" fillOpacity="0.2" stroke="#dc2626" strokeWidth="2"/>
    <line x1="36.5" y1="4.5" x2="43.5" y2="10.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="43.5" y1="4.5" x2="36.5" y2="10.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ── Material Quality Icons — premium 48×48, unique metaphors per tier ────────

// Q1 Luxury — faceted diamond gem with purple glow + sparkle
export const MaterialQ1Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Outer glow */}
    <ellipse cx="24" cy="36" rx="12" ry="4" fill="#7e22ce" fillOpacity="0.12"/>
    {/* Diamond body fill */}
    <path d="M24 5 L38 17 L24 44 L10 17 Z" fill="#7e22ce" fillOpacity="0.14"/>
    {/* Diamond outline */}
    <path d="M24 5 L38 17 L24 44 L10 17 Z" stroke="currentColor" strokeWidth="2"/>
    {/* Belt line */}
    <line x1="10" y1="17" x2="38" y2="17" stroke="currentColor" strokeWidth="1.5"/>
    {/* Top-left facet */}
    <line x1="24" y1="5" x2="17" y2="17" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Top-right facet */}
    <line x1="24" y1="5" x2="31" y2="17" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.55"/>
    {/* Center bottom facet — main pavilion */}
    <line x1="17" y1="17" x2="24" y2="44" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4"/>
    <line x1="31" y1="17" x2="24" y2="44" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4"/>
    {/* Table facet highlight */}
    <path d="M17 17 L24 22 L31 17" fill="#a855f7" fillOpacity="0.18" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.4"/>
    {/* Sparkle at peak */}
    <path d="M24 5 L25 2.5 L26 5 L28.5 6 L26 7 L25 9.5 L24 7 L21.5 6 Z" fill="#c084fc" fillOpacity="0.9" stroke="#c084fc" strokeWidth="0.5"/>
  </svg>
);

// Q2 Custom — drafting compass with purple arc (custom-designed)
export const MaterialQ2Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Blueprint circle backdrop */}
    <circle cx="24" cy="24" r="20" fill="#a855f7" fillOpacity="0.05" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3,3"/>
    {/* Compass arc drawn by the tool */}
    <path d="M17 38 Q24 43 31 38" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.75" fill="none" strokeDasharray="2,2"/>
    {/* Left leg */}
    <line x1="24" y1="13" x2="15" y2="38" stroke="currentColor" strokeWidth="2.5"/>
    {/* Right leg */}
    <line x1="24" y1="13" x2="33" y2="38" stroke="currentColor" strokeWidth="2.5"/>
    {/* Hinge assembly */}
    <circle cx="24" cy="13" r="3.5" fill="#a855f7" fillOpacity="0.25" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="13" r="1.2" fill="#a855f7" fillOpacity="0.8"/>
    {/* Sharp metal point — left */}
    <path d="M13.5 36.5 L15 38 L16.5 36.5 L15 33 Z" fill="#a855f7" fillOpacity="0.55" stroke="#a855f7" strokeWidth="1" strokeLinejoin="round"/>
    {/* Pencil tip — right */}
    <path d="M31.5 36.5 L33 38 L34.5 36.5 L33 33 Z" fill="#a855f7" fillOpacity="0.55" stroke="#a855f7" strokeWidth="1" strokeLinejoin="round"/>
    {/* Top cap */}
    <rect x="21.5" y="5" width="5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="21.5" y1="8.5" x2="26.5" y2="8.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/>
  </svg>
);

// Q3 Upscale — award medal with blue star
export const MaterialQ3Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ribbon tails */}
    <path d="M17 29 L13 45 L24 38 L35 45 L31 29" fill="#3b82f6" fillOpacity="0.13" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.7"/>
    {/* Medal ring */}
    <circle cx="24" cy="22" r="14" fill="#3b82f6" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5"/>
    {/* Inner ring */}
    <circle cx="24" cy="22" r="10" fill="#3b82f6" fillOpacity="0.07" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"/>
    {/* 5-point star */}
    <path d="M24 13 L26 19 L32.5 19 L27.5 23 L29.5 29.5 L24 25.5 L18.5 29.5 L20.5 23 L15.5 19 L22 19 Z" fill="#3b82f6" fillOpacity="0.55" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.7"/>
    {/* Ribbon connector bar */}
    <rect x="20" y="7" width="8" height="5" rx="1.5" fill="#3b82f6" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

// Q4 Standard — clean house with green center checkmark
export const MaterialQ4Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Walls */}
    <path d="M8 24 L8 41 L40 41 L40 24" stroke="currentColor" strokeWidth="2"/>
    {/* Roof */}
    <path d="M4 24 L24 8 L44 24" stroke="currentColor" strokeWidth="2.5"/>
    {/* Door */}
    <rect x="20" y="31" width="8" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    {/* Windows */}
    <rect x="10" y="27" width="7" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="31" y="27" width="7" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    {/* Green check badge over center of house */}
    <circle cx="24" cy="20" r="8.5" fill="#22c55e" fillOpacity="0.18" stroke="#22c55e" strokeWidth="1.8"/>
    <path d="M19.5 20 L22.5 23 L28.5 16.5" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
  </svg>
);

// Q5 Functional — 8-tooth gear cog with yellow accent
export const MaterialQ5Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Gear body — 8-tooth polygon (r=19 tips, r=13 roots) */}
    <polygon
      points="24,5 28.6,12.9 36.7,11.3 35.1,19.4 43,24 35.1,28.6 36.7,36.7 28.6,35.1 24,43 19.4,35.1 11.3,36.7 12.9,28.6 5,24 12.9,19.4 11.3,11.3 19.4,12.9"
      fill="#eab308" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
    />
    {/* Inner bore ring */}
    <circle cx="24" cy="24" r="8" fill="#eab308" fillOpacity="0.18" stroke="currentColor" strokeWidth="2"/>
    {/* Center axle */}
    <circle cx="24" cy="24" r="3" fill="#eab308" fillOpacity="0.75"/>
    {/* Radial keyway spokes */}
    <line x1="24" y1="16" x2="24" y2="11" stroke="#eab308" strokeWidth="1.2" strokeOpacity="0.5"/>
    <line x1="24" y1="32" x2="24" y2="37" stroke="#eab308" strokeWidth="1.2" strokeOpacity="0.5"/>
    <line x1="16" y1="24" x2="11" y2="24" stroke="#eab308" strokeWidth="1.2" strokeOpacity="0.5"/>
    <line x1="32" y1="24" x2="37" y2="24" stroke="#eab308" strokeWidth="1.2" strokeOpacity="0.5"/>
  </svg>
);

// Q6 Substandard — deteriorated house fragment with red warning
export const MaterialQ6Icon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Red hazard glow at base */}
    <ellipse cx="24" cy="43" rx="16" ry="3" fill="#ef4444" fillOpacity="0.12"/>
    {/* Ground */}
    <line x1="3" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="1.5"/>
    {/* Tilted/leaning walls */}
    <path d="M7 25 L5 41 L38 41 L40 25" stroke="currentColor" strokeWidth="2"/>
    {/* Collapsed/jagged roof */}
    <path d="M4 25 L13 16 L17 22 L24 12 L31 22 L35 16 L44 25" stroke="currentColor" strokeWidth="2"/>
    {/* Both windows — Xd */}
    <rect x="8" y="28" width="7" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="8" y1="28" x2="15" y2="34" stroke="#ef4444" strokeWidth="1.8" strokeOpacity="0.8"/>
    <line x1="15" y1="28" x2="8" y2="34" stroke="#ef4444" strokeWidth="1.8" strokeOpacity="0.8"/>
    <rect x="33" y="28" width="7" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="33" y1="28" x2="40" y2="34" stroke="#ef4444" strokeWidth="1.8" strokeOpacity="0.8"/>
    <line x1="40" y1="28" x2="33" y2="34" stroke="#ef4444" strokeWidth="1.8" strokeOpacity="0.8"/>
    {/* Large wall crack */}
    <path d="M10 25 L7 30 L12 35 L8 41" stroke="#ef4444" strokeWidth="2.5" strokeOpacity="0.7" fill="none"/>
    {/* Rubble pile at base */}
    <path d="M14 41 L17 38 L20 40 L23 37 L26 40 L29 37 L32 40 L35 38 L38 41" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.55" fill="none"/>
  </svg>
);
