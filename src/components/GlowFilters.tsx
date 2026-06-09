import React from 'react';

export const GlowFilters: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 animate-pulse" aria-hidden="true" focusable="false" style={{ pointerEvents: 'none' }}>
      <defs>
        <filter id="neonGlowEmerald" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur1" />
          <feGaussianBlur stdDeviation="1.1" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neonGlowAmber" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur1" />
          <feGaussianBlur stdDeviation="1.1" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};
