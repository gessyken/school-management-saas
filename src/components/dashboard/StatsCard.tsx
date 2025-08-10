
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: 'skyblue' | 'mustard';
  variant?: 'default' | 'floating' | 'glow' | 'minimal';
  animationDelay?: number;
  onClick?: () => void;
  loading?: boolean;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  color = 'skyblue',
  variant = 'default',
  animationDelay = 0,
  onClick,
  loading = false,
}: StatsCardProps) => {
  const colorVariants = {
    skyblue: {
      bg: 'bg-gradient-to-br from-skyblue to-skyblue/80',
      icon: 'bg-skyblue/10 text-skyblue',
      trend: 'text-skyblue',
      border: 'border-skyblue/20',
      glow: 'shadow-skyblue/20',
    },
    mustard: {
      bg: 'bg-gradient-to-br from-mustard to-mustard/80',
      icon: 'bg-mustard/10 text-mustard',
      trend: 'text-mustard',
      border: 'border-mustard/20',
      glow: 'shadow-mustard/20',
    },
  };

  const colors = colorVariants[color];

  const variantStyles = {
    default: "shadow-lg hover:shadow-xl transform hover:scale-105",
    floating: "shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-2",
    glow: "shadow-lg hover:shadow-2xl transform hover:scale-105 hover:shadow-skyblue/25",
    minimal: "shadow-sm hover:shadow-md transform hover:scale-102"
  };

  const animationStyle = {
    animationDelay: `${animationDelay}ms`
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 transition-all duration-500 cursor-pointer",
        "animate-fade-in-up hover:animate-pulse",
        variantStyles[variant],
        onClick && "hover:cursor-pointer",
        loading && "animate-pulse opacity-75",
        className
      )}
      style={animationStyle}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
        colors.bg
      )} />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform rotate-45 scale-150 group-hover:scale-200 transition-transform duration-500"></div>
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            colors.icon
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold text-foreground group-hover:text-foreground transition-colors">
            {value}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-medium animate-slide-in-right",
              colors.trend
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1 animate-pulse" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1 animate-pulse" />
              )}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {description}
          </p>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="w-6 h-6 border-2 border-skyblue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="mr-1 animate-pulse">
              {trend.isPositive ? '↗' : '↘'}
            </span>
            <span>
              {trend.isPositive ? 'Augmentation' : 'Diminution'} depuis la dernière période
            </span>
          </div>
        )}
      </CardContent>
      
      {/* Animated border */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        colors.trend
      )} />
      
      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl",
        colors.glow
      )} />
    </Card>
  );
};
