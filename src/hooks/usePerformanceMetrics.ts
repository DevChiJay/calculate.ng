"use client";

import { useEffect, useRef, useState } from "react";
import { throttle } from "@/lib/utils/performance";

// Add interface for LayoutShift
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

type PerformanceMetrics = {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  measured: boolean;
};

/**
 * Hook to measure web vitals performance metrics
 * Uses the Web Vitals API to collect core metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null, 
    cls: null,
    ttfb: null,
    measured: false
  });
  
  const observer = useRef<PerformanceObserver | null>(null);
  
  useEffect(() => {
    // Only run in the browser environment
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return;
    }
    
    // Getting TTFB (Time to First Byte)
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const ttfb = (navigationEntries[0] as PerformanceNavigationTiming).responseStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }
    
    try {
      // First Contentful Paint
      observer.current = new PerformanceObserver(
        throttle((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              const fcp = entry.startTime;
              setMetrics(prev => ({ ...prev, fcp }));
            }
          }
        }, 100)
      );

      observer.current.observe({ type: 'paint', buffered: true });

      // First Input Delay and others
      const getVisibilityState = () => document.visibilityState;
      
      if ('PerformanceEventTiming' in window) {
        // First Input Delay
        const fidObserver = new PerformanceObserver(
          throttle((entryList) => {
            const firstInput = entryList.getEntries().find(
              (entry: PerformanceEntry) => entry.name === 'first-input'
            );
            
            if (firstInput) {
              const fid = (firstInput as PerformanceEventTiming).processingStart - 
                          firstInput.startTime;
              setMetrics(prev => ({ ...prev, fid }));
            }
          }, 100)
        );
        
        fidObserver.observe({ type: 'first-input', buffered: true });
      }
      
      // Largest Contentful Paint
      if ('LargestContentfulPaint' in window) {
        const lcpObserver = new PerformanceObserver(
          throttle((entryList) => {
            // Get only the last LCP candidate before the visibility changes
            const entries = entryList.getEntries();
            if (entries.length > 0 && getVisibilityState() !== 'hidden') {
              const lastEntry = entries[entries.length - 1];
              const lcp = lastEntry.startTime;
              setMetrics(prev => ({ ...prev, lcp }));
            }
          }, 100)
        );
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }
      
      // Layout Shifts
      if ('LayoutShift' in window) {
        let clsValue = 0;
        const clsEntries: PerformanceEntry[] = [];
        
        const clsObserver = new PerformanceObserver(
          throttle((entryList) => {
            const entries = entryList.getEntries() as LayoutShift[];
            
            entries.forEach(entry => {
              // Only count layout shifts without recent user input
              if (!entry.hadRecentInput) {
                clsEntries.push(entry);
                
                // Calculate CLS score
                clsValue += entry.value;
              }
            });
            
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }, 100)
        );
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }
      
      // Mark as measured
      setTimeout(() => {
        setMetrics(prev => ({ ...prev, measured: true }));
      }, 5000); // Wait a reasonable time to collect metrics
      
      return () => {
        if (observer.current) observer.current.disconnect();
      };
    } catch (e) {
      console.warn('PerformanceObserver is not supported in this browser', e);
      return;
    }
  }, []);

  return metrics;
}
