import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'neutral' | 'success';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-200',
    accent: 'bg-amber-400/15 text-amber-400',
    neutral: 'bg-zinc-850 text-zinc-300 font-mono',
    success: 'bg-emerald-500/15 text-emerald-400',
  }[variant];

  return (
    <span className={`inline-flex items-center text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md shadow-sm ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
