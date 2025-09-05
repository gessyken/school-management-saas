import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const variantClasses = {
  primary: 'bg-gradient-primary text-primary-foreground',
  secondary: 'bg-gradient-secondary text-secondary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-lg shadow-card transition-all duration-200 hover:shadow-elevated',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="text-right">
            <div className={cn(
              "text-sm font-medium",
              trend.value > 0 ? "text-green-200" : "text-red-200"
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
            <div className="text-xs opacity-80">{trend.label}</div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm opacity-90">{title}</p>
        {subtitle && (
          <p className="text-xs opacity-70">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export { StatCard };