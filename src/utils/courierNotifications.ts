// Notification sound using HTML5 audio (doesn't trigger microphone icon on iOS)
export const playOrderSound = () => {
  try {
    // Simple notification sound using HTML5 audio
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmi78N+oVRQLUKbh8LJeHAU7k9bxy3crc');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (error) {
    console.log('Could not play order sound:', error);
  }
};

// Success sound using HTML5 audio (doesn't trigger microphone icon on iOS)
export const playSuccessSound = () => {
  try {
    // Simple success sound using HTML5 audio
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGmi78N+oVRQLUKbh8LJeHAU7k9bxy3crc');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (error) {
    console.log('Could not play success sound:', error);
  }
};

// Vibrate on mobile
export const vibrateDevice = (pattern: number | number[] = 200) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show browser notification
export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};

// Show new order notification
export const notifyNewOrder = (orderNumber: string, amount: number, borough: string) => {
  playOrderSound();
  vibrateDevice([200, 100, 200]);
  
  showBrowserNotification('🚨 New Order Available!', {
    body: `${orderNumber} - $${amount}\n${borough}`,
    tag: 'new-order',
    requireInteraction: true
  });
};

// Show delivery reminder
export const notifyDeliveryReminder = (orderNumber: string) => {
  vibrateDevice(200);
  
  showBrowserNotification('⏰ Delivery In Progress', {
    body: `Don't forget to complete ${orderNumber}`,
    tag: 'delivery-reminder'
  });
};

// Show earnings update
export const notifyEarningsUpdate = (amount: number) => {
  playSuccessSound();
  vibrateDevice([100, 50, 100]);
  
  showBrowserNotification('💰 Earnings Updated', {
    body: `You earned $${amount.toFixed(2)}!`,
    tag: 'earnings'
  });
};
