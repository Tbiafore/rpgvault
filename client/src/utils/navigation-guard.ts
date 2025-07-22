// Navigation guard to prevent runtime errors during browser navigation
// This helps handle the specific case of back button after auth redirects

let navigationInProgress = false;
let lastNavigationTime = 0;

export function setNavigationInProgress(inProgress: boolean) {
  navigationInProgress = inProgress;
  if (inProgress) {
    lastNavigationTime = Date.now();
  }
}

export function isNavigationInProgress(): boolean {
  // Clear navigation flag after 2 seconds to prevent stuck state
  if (navigationInProgress && Date.now() - lastNavigationTime > 2000) {
    navigationInProgress = false;
  }
  return navigationInProgress;
}

// Debounce navigation events to prevent rapid-fire issues
let navigationTimer: NodeJS.Timeout | null = null;

export function debouncedNavigate(navigationFn: () => void, delay = 150) {
  if (navigationTimer) {
    clearTimeout(navigationTimer);
  }
  
  setNavigationInProgress(true);
  navigationTimer = setTimeout(() => {
    try {
      navigationFn();
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setNavigationInProgress(false);
      navigationTimer = null;
    }
  }, delay);
}

// Override the global error handling to prevent plugin errors during navigation
export function suppressNavigationErrors() {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Don't log runtime plugin errors during navigation
    if (isNavigationInProgress() && 
        (message.includes('plugin:runtime-error-plugin') || 
         message.includes('sendError'))) {
      return; // Suppress these specific errors during navigation
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // Also handle window error events
  const handleError = (event: ErrorEvent) => {
    if (isNavigationInProgress() && 
        (event.message?.includes('plugin:runtime-error-plugin') ||
         event.message?.includes('sendError'))) {
      event.preventDefault();
      return true; // Prevent default error handling
    }
    return false;
  };
  
  window.addEventListener('error', handleError);
  
  return () => {
    console.error = originalConsoleError;
    window.removeEventListener('error', handleError);
  };
}