import React from 'react';
import { CardProps } from '@/types';

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  hover = false,
  onClick,
}) => {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card; 