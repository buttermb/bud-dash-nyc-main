// Notification sound - success sound
export const playOrderSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Success sound
export const playSuccessSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
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
