import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ children, className = "", variant = 'default' }) => {
  return (
    <div className={`glass-card p-6 ${variant === 'elevated' ? 'bg-white/10' : ''} ${className}`}>
      {children}
    </div>
  );
};
