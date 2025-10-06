import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission } from '@/utils/courierNotifications';

export default function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const checkPermission = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const hasSeenBanner = localStorage.getItem('notification_banner_dismissed');
        if (!hasSeenBanner) {
          setShow(true);
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('notification_banner_dismissed', 'true');
  };

  if (!show || dismissed) return null;

  return (
    <div className="bg-yellow-500/20 border-y border-yellow-500/30 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 flex-1">
          <Bell className="text-yellow-500 flex-shrink-0" size={20} />
          <div>
            <div className="font-bold text-sm text-white">Enable Notifications</div>
            <div className="text-xs text-slate-300">Get instant alerts for new orders</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleEnable}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold text-sm"
            size="sm"
          >
            Enable
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-slate-800 rounded"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
