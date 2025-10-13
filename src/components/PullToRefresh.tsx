import { useSwipeable } from 'react-swipeable';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { haptics } from '@/utils/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PULL_THRESHOLD = 80;

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Down' && window.scrollY === 0) {
        const distance = Math.min(eventData.deltaY, PULL_THRESHOLD + 20);
        setPullDistance(distance);
        
        if (distance > PULL_THRESHOLD && !isRefreshing) {
          haptics.light();
        }
      }
    },
    onSwiped: async () => {
      if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        haptics.success();
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  useEffect(() => {
    if (!isRefreshing && pullDistance === 0) {
      return;
    }
  }, [isRefreshing, pullDistance]);

  const rotation = (pullDistance / PULL_THRESHOLD) * 360;
  const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div {...handlers} className="relative">
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity"
          style={{
            height: pullDistance,
            opacity,
          }}
        >
          <RefreshCw
            className={`w-6 h-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? 'rotate(0deg)' : `rotate(${rotation}deg)`,
            }}
          />
        </div>
      )}
      <div style={{ marginTop: isRefreshing ? PULL_THRESHOLD : 0 }}>
        {children}
      </div>
    </div>
  );
}
