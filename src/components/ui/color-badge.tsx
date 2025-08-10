import React from 'react';
import { cn } from '../../lib/utils';
import { colors, getBadgeClasses } from '../../lib/colors';

interface ColorBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'active' | 'inactive';
  color?: 'skyblue' | 'mustard';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ColorBadge: React.FC<ColorBadgeProps> = ({
  children,
  variant = 'info',
  color = 'skyblue',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return colors.states.success;
      case 'warning':
        return colors.states.warning;
      case 'error':
        return colors.states.error;
      case 'info':
        return colors.states.info;
      case 'active':
        return getBadgeClasses('active', color);
      case 'inactive':
        return getBadgeClasses('inactive', color);
      default:
        return colors.states.info;
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        sizeClasses[size],
        typeof variantClasses === 'string' ? variantClasses : `${variantClasses.bg} ${variantClasses.text} ${variantClasses.border}`,
        className
      )}
    >
      {children}
    </span>
  );
};