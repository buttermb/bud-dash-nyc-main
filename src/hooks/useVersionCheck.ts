import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_KEY = 'app_version';

async function clearAllCaches() {
  try {
    // Clear service worker registrations
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // Clear all caches - prioritize realtime/API caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const priorityCaches = cacheNames.filter(name => 
        name.includes('runtime') || name.includes('api')
      );
      const otherCaches = cacheNames.filter(name => 
        !name.includes('runtime') && !name.includes('api')
      );
      
      // Clear priority caches first
      await Promise.all(priorityCaches.map(name => caches.delete(name)));
      await Promise.all(otherCaches.map(name => caches.delete(name)));
    }
    
    // Clear storage but preserve essential data
    const essentialKeys = ['nym_theme', 'nym_production_logs'];
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !essentialKeys.includes(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    
    console.log('[VersionCheck] Cleared caches successfully');
  } catch (error) {
    console.error('[VersionCheck] Error clearing caches:', error);
  }
}

export function useVersionCheck() {
  const checkInProgress = useRef(false);
  const currentVersion = useRef<string | null>(null);
  const lastCheckTime = useRef<number>(0);
  const MIN_CHECK_INTERVAL = 60000; // Don't check more than once per minute

  useEffect(() => {
    const checkVersion = async () => {
      // Prevent concurrent checks
      if (checkInProgress.current) return;
      
      // Respect minimum check interval
      const now = Date.now();
      if (now - lastCheckTime.current < MIN_CHECK_INTERVAL) {
        return;
      }
      
      checkInProgress.current = true;
      lastCheckTime.current = now;

      try {
        // Fetch with cache-busting
        const response = await fetch(`/index.html?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const html = await response.text();
        
        // Extract build timestamp from meta tag or generate from content hash
        const metaMatch = html.match(/<meta name="build-time" content="([^"]+)"/);
        const newVersion = metaMatch ? metaMatch[1] : html.substring(0, 100);
        
        // Initialize version on first check
        if (currentVersion.current === null) {
          currentVersion.current = newVersion;
          localStorage.setItem(VERSION_KEY, newVersion);
          return;
        }
        
        // Check if version changed - must be different AND stored version must exist
        const storedVersion = localStorage.getItem(VERSION_KEY);
        const versionChanged = storedVersion && storedVersion !== newVersion && currentVersion.current !== newVersion;
        
        if (versionChanged) {
          toast.info('New version available! Updating...', {
            duration: 3000
          });
          
          await clearAllCaches();
          localStorage.setItem(VERSION_KEY, newVersion);
          currentVersion.current = newVersion;
          
          // Reload after short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      } finally {
        checkInProgress.current = false;
      }
    };

    // Check immediately on mount
    checkVersion();

    // Check periodically (less frequent)
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);
}
