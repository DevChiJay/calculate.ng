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
    ttfb: { good: 800, poor: 1800 },
    fmp: { good: 2000, poor: 4000 },
    domNodes: { good: 1000, poor: 2000 },
    jsHeapSize: { good: 50000000, poor: 100000000 } // 50MB, 100MB
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
    
    switch(metric) {
      case 'cls':
        return value.toFixed(3);
      case 'domNodes':
        return value.toString();
      case 'jsHeapSize':
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
      default:
        return `${Math.round(value)}ms`;
    }
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
          </div>          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={getColorClass(getRating('ttfb', metrics.ttfb))}>
              {formatValue('ttfb', metrics.ttfb)}
            </span>
          </div>

          {metrics.fmp !== null && (
            <div className="flex justify-between">
              <span>FMP:</span>
              <span className={getColorClass(getRating('fmp', metrics.fmp))}>
                {formatValue('fmp', metrics.fmp)}
              </span>
            </div>
          )}
          
          {metrics.domNodes !== null && (
            <div className="flex justify-between">
              <span>DOM Nodes:</span>
              <span className={getColorClass(getRating('domNodes', metrics.domNodes))}>
                {metrics.domNodes}
              </span>
            </div>
          )}
          
          {metrics.jsHeapSize !== null && (
            <div className="flex justify-between">
              <span>JS Heap:</span>
              <span className={getColorClass(getRating('jsHeapSize', metrics.jsHeapSize))}>
                {(metrics.jsHeapSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          )}
          
          {metrics.resources.length > 0 && (
            <div className="mt-2">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Resource Timings</summary>
                <ul className="mt-1 space-y-1 pl-2">
                  {metrics.resources.slice(0, 5).map((resource, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="truncate max-w-[120px]">{resource.name}</span>
                      <span>{resource.duration}ms ({(resource.transferSize / 1024).toFixed(1)}KB)</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
