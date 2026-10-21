import React from 'react';
import { sounds } from '../../utils/soundEffects';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'pill' | 'activePill';
  size?: 'sm' | 'md';
  playSound?: 'select' | 'nav' | 'back' | false;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  playSound = 'nav',
  className = '',
  onClick,
  children,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound === 'select') sounds.playSelect();
    else if (playSound === 'nav') sounds.playNav();
    else if (playSound === 'back') sounds.playBack();
    onClick?.(e);
  };

  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-xl gap-2',
  }[size];

  const variantStyles = {
    primary: 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-97 shadow-sm',
    secondary: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white active:scale-97',
    ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] active:scale-97',
    pill: 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white rounded-full text-xs px-3 py-1',
    activePill: 'bg-white text-zinc-950 font-bold rounded-full text-xs px-3 py-1 shadow-sm',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
