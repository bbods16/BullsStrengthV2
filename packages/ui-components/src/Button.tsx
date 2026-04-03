import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#8251EE] hover:bg-[#9366F5] text-white shadow-[0_0_20px_rgba(130,81,238,0.3)]',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    danger: 'bg-[#EF4444] hover:bg-[#F87171] text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#8251EE] focus:ring-offset-2 focus:ring-offset-[hsl(240,6%,10%)] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
