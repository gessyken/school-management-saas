import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AnimatedCardProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  variant?: 'default' | 'floating' | 'glow' | 'minimal' | 'gradient';
  color?: 'skyblue' | 'mustard' | 'mixed';
  animation?: 'fade' | 'slide' | 'float' | 'bounce' | 'glow' | 'shimmer';
  animationDelay?: number;
  onClick?: () => void;
  loading?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedCard = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className,
  variant = 'default',
  color = 'skyblue',
  animation = 'fade',
  animationDelay = 0,
  onClick,
  loading = false,
  hoverable = true,
  size = 'md',
}: AnimatedCardProps) => {
  const colorVariants = {
    skyblue: {
      bg: 'bg-gradient-to-br from-skyblue/10 to-skyblue/20',
      border: 'border-skyblue/30',
      icon: 'bg-skyblue/20 text-skyblue',
      glow: 'hover:shadow-skyblue/25',
      text: 'text-skyblue',
    },
    mustard: {
      bg: 'bg-gradient-to-br from-mustard/10 to-mustard/20',
      border: 'border-mustard/30',
      icon: 'bg-mustard/20 text-mustard',
      glow: 'hover:shadow-mustard/25',
      text: 'text-mustard',
    },
    mixed: {
      bg: 'bg-gradient-to-br from-skyblue/10 via-white to-mustard/10',
      border: 'border-skyblue/30',
      icon: 'bg-gradient-to-br from-skyblue/20 to-mustard/20 text-skyblue',
      glow: 'hover:shadow-skyblue/20',
      text: 'text-skyblue',
    },
  };

  const variantStyles = {
    default: 'shadow-md hover:shadow-lg',
    floating: 'shadow-xl hover:shadow-2xl hover:-translate-y-2',
    glow: 'shadow-lg hover:shadow-xl',
    minimal: 'shadow-sm hover:shadow-md border',
    gradient: 'shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const animationClasses = {
    fade: 'animate-fade-in-up',
    slide: 'animate-slide-in-right',
    float: 'animate-float',
    bounce: 'animate-bounce-gentle',
    glow: 'animate-glow',
    shimmer: 'animate-shimmer',
  };

  const colors = colorVariants[color];
  const animationStyle = {
    animationDelay: `${animationDelay}ms`,
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-500',
        variantStyles[variant],
        animationClasses[animation],
        hoverable && 'transform hover:scale-105',
        onClick && 'cursor-pointer hover:cursor-pointer',
        loading && 'animate-pulse opacity-75',
        variant === 'glow' && colors.glow,
        variant === 'minimal' && colors.border,
        className
      )}
      style={animationStyle}
      onClick={onClick}
    >
      {/* Animated background overlay */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        colors.bg
      )} />
      
      {/* Shimmer effect */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 animate-shimmer" />
        </div>
      )}
      
      {/* Header with icon */}
      {(title || Icon) && (
        <CardHeader className={cn('relative z-10', sizeStyles[size])}>
          <div className="flex items-center justify-between">
            {title && (
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                  {title}
                </CardTitle>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            )}
            {Icon && (
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                'group-hover:scale-110 group-hover:rotate-3',
                colors.icon
              )}>
                <Icon className="h-6 w-6" />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      {/* Content */}
      {children && (
        <CardContent className={cn('relative z-10', sizeStyles[size])}>
          {children}
        </CardContent>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-skyblue border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        </div>
      )}
      
      {/* Floating particles effect for special variants */}
      {variant === 'floating' && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-4 left-4 w-2 h-2 bg-skyblue/30 rounded-full animate-bounce-gentle" style={{ animationDelay: '0ms' }} />
          <div className="absolute top-8 right-6 w-1 h-1 bg-mustard/40 rounded-full animate-bounce-gentle" style={{ animationDelay: '200ms' }} />
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-skyblue/20 rounded-full animate-bounce-gentle" style={{ animationDelay: '400ms' }} />
        </div>
      )}
    </Card>
  );
};

export default AnimatedCard;