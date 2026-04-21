import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string; // Allow passing additional classes to the tooltip itself
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'bottom', className = '' }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'top-full left-1/2 -translate-x-1/2 mt-2'; // Default to bottom
    }
  };

  return (
    <span className="relative group inline-flex items-center align-middle"> {/* Use inline-flex for better alignment of children */}
      {children}
      <span
        className={`absolute ${getPositionClasses()} w-max max-w-xs p-2 text-xs text-white bg-[#1E2D5C] rounded-md shadow-lg
                   opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 
                   transition-opacity duration-200 ease-in-out z-50 pointer-events-none ${className}`}
        role="tooltip"
        aria-hidden={true} // Hidden by default, shown via opacity
      >
        {text}
      </span>
    </span>
  );
};

export default Tooltip;