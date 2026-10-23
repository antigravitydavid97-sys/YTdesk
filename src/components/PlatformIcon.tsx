import React from 'react';
import { Platform, Stage } from '../types';

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  color?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = 'w-4 h-4',
  color,
}) => {
  const style = color ? { color } : undefined;

  if (platform === 'youtube') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        aria-hidden="true"
      >
        <rect x="2" y="4.5" width="20" height="15" rx="4.5" />
        <polygon points="10 9.25 15.5 12 10 14.75 10 9.25" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (platform === 'tiktok') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        aria-hidden="true"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
};

export function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    case 'instagram':
      return 'Instagram';
  }
}

export function getStageSystemColor(stage: Stage): string {
  switch (stage) {
    case 'idea':
      return 'var(--sys-orange)';
    case 'proceso':
      return 'var(--sys-blue)';
    case 'publicado':
      return 'var(--sys-green)';
  }
}
