import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center text-sm font-medium z-50 flex items-center justify-center gap-2 animate-in slide-in-from-top-2"
      style={{
        // Account for safe area on iOS with notch/dynamic island
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))'
      }}
    >
      <WifiOff className="w-4 h-4" />
      <span>You're offline. Some features may be limited.</span>
    </div>
  );
};

export default OfflineBanner;
