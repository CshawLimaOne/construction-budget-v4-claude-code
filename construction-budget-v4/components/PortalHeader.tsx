import React from 'react';

interface PortalHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#DFE1E5]">
      <div className="flex items-center gap-4">
        <img
          src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
          alt="Lima One Capital"
          width={130}
          height={34}
          className="object-contain"
          style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(44%) saturate(1200%) hue-rotate(200deg) brightness(90%) contrast(95%)' }}
        />
        <div className="pl-4 border-l border-[#DFE1E5]">
          <h1 className="text-xl font-bold text-[#1E2D5C]">{title}</h1>
          <p className="text-sm text-[#78819D]">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};
