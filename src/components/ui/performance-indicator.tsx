"use client";

import { useState } from 'react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

interface PerformanceIndicatorProps {
  showDetails?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4'
};

export function PerformanceIndicator({
  showDetails = false,
  position = 'bottom-right',
  className
}: PerformanceIndicatorProps) {
  const metrics = usePerformanceMetrics();
  const [expanded, setExpanded] = useState(showDetails);
  const positionClass = positionClasses[position];
  
  // Performance rating thresholds (in ms)
  const thresholds = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 }
  };
  
  // Get rating based on metric value
  const getRating = (metric: keyof typeof thresholds, value: number | null) => {
    if (value === null) return 'unknown';
    
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };
  
  // Get color class based on rating
  const getColorClass = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-amber-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };
  
  // Format value for display
  const formatValue = (metric: string, value: number | null) => {
    if (value === null) return 'Not measured';
    if (metric === 'cls') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div 
      className={`fixed ${positionClass} z-50 p-2 bg-background/90 backdrop-blur border rounded-md shadow-md transition-all ${className}`}
      style={{ minWidth: expanded ? '240px' : 'auto' }}
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <div className={`w-2 h-2 rounded-full ${metrics.measured ? 'bg-green-500' : 'bg-amber-500'}`} />
          Performance
        </button>
      </div>
      
      {expanded && metrics.measured && (
        <div className="mt-2 text-xs space-y-1">
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getColorClass(getRating('fcp', metrics.fcp))}>
              {formatValue('fcp', metrics.fcp)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getColorClass(getRating('lcp', metrics.lcp))}>
              {formatValue('lcp', metrics.lcp)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getColorClass(getRating('fid', metrics.fid))}>
              {formatValue('fid', metrics.fid)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getColorClass(getRating('cls', metrics.cls))}>
              {formatValue('cls', metrics.cls)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={getColorClass(getRating('ttfb', metrics.ttfb))}>
              {formatValue('ttfb', metrics.ttfb)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
