/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This utility contains performance-related helper functions
 * for improved loading and runtime performance.
 */

/**
 * Throttles a function call to limit execution frequency
 * 
 * @param fn The function to throttle
 * @param delay The minimum time between executions in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Debounces a function call to delay execution until after a period of inactivity
 * 
 * @param fn The function to debounce
 * @param delay The time to wait after the last call before executing
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Prefetches resources that might be needed soon
 * 
 * @param resource URL of the resource to prefetch
 * @param type The type of resource prefetch ('image', 'style', 'script')
 */
export function prefetchResource(resource: string, type: 'image' | 'style' | 'script'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = resource;
  
  if (type === 'image') {
    link.as = 'image';
  } else if (type === 'style') {
    link.as = 'style';
  } else if (type === 'script') {
    link.as = 'script';
  }
  
  document.head.appendChild(link);
}

/**
 * Checks if the browser supports intersection observer for lazy loading
 */
export function supportsIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== 'undefined' && 
    typeof IntersectionObserverEntry !== 'undefined';
}

/**
 * Creates a simple resource loading monitor that can be used to track
 * resource loading performance
 */
export function createLoadingMonitor() {
  const startTime = performance.now();
  
  return {
    getElapsedTime: () => performance.now() - startTime,
    mark: (label: string) => {
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(label);
      }
    },
    measure: (label: string, startMark: string, endMark: string) => {
      if (typeof window !== 'undefined' && window.performance) {
        try {
          window.performance.measure(label, startMark, endMark);
        } catch (e) {
          console.error('Performance measurement error:', e);
        }
      }
    }
  };
}
