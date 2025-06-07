'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null);
  
  useEffect(() => {
    // Add global error handler for unhandled errors
    const errorHandler = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      setError(event.error);
      
      // In production, you might want to log to a service
      if (process.env.NODE_ENV === 'production') {
        // Send error to your analytics or error tracking service
        const errorDetails = {
          message: event.error?.message || 'Unknown error',
          stack: event.error?.stack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        };
        
        // Log to console for now - in production replace with your error logging service
        console.error('Error details for logging:', errorDetails);
        
        // Example of sending to a hypothetical API endpoint
        // fetch('/api/error-logging', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorDetails),
        // }).catch(e => console.error('Failed to log error:', e));
      }
      
      // Prevent the default handling
      event.preventDefault();
    };
    
    // Add event listener for uncaught errors
    window.addEventListener('error', errorHandler);
    
    // Cleanup
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  // If there's an error, display a fallback UI
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-background border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We&apos;re sorry, but we encountered an error while processing your request.
          </p>
          
          <div className="bg-muted p-3 rounded-md mb-6 max-h-32 overflow-auto">
            <p className="text-sm font-mono">{error.toString()}</p>
            {errorInfo && (
              <pre className="text-xs mt-2 text-muted-foreground">
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Reload page
            </Button>
            <Button 
              onClick={() => {
                setError(null);
                setErrorInfo(null);
              }}
              className="flex-1"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Otherwise, render children normally
  return <>{children}</>;
}
