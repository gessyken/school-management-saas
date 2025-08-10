import React from 'react';
import { cn } from '../../lib/utils';
import { getButtonClasses } from '../../lib/colors';
import { Button, ButtonProps } from './button';

interface ColorButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline';
  color?: 'skyblue' | 'mustard';
  children: React.ReactNode;
}

export const ColorButton: React.FC<ColorButtonProps> = ({
  variant = 'primary',
  color = 'skyblue',
  className,
  children,
  ...props
}) => {
  const colorClasses = getButtonClasses(variant, color);

  return (
    <Button
      className={cn(
        colorClasses,
        'transition-all duration-200 font-medium',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};