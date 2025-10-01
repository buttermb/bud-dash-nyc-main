// Enhanced notification sound system with vibration support
type SoundType = 'notification' | 'success' | 'urgent';

// Vibration patterns for different events
const VIBRATION_PATTERNS = {
  notification: [100, 50, 100], // Double tap
  success: [200, 100, 200], // Long double tap
  urgent: [200, 100, 200, 100, 200], // Triple tap
};

// Play sound with vibration
const playWithVibration = (soundType: SoundType, enableVibration = true) => {
  // Vibrate on mobile devices
  if (enableVibration && 'vibrate' in navigator) {
    try {
      navigator.vibrate(VIBRATION_PATTERNS[soundType]);
    } catch (error) {
      console.error('Vibration error:', error);
    }
  }
};

// Generate notification sound using Web Audio API
export const playNotificationSound = (vibrate = true) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for the beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the sound (pleasant notification beep)
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    // Fade in and out for smooth sound
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    
    // Play the sound
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    
    // Vibrate
    playWithVibration('notification', vibrate);
    
    console.log('🔔 Notification sound played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Play success sound (higher pitch, two beeps)
export const playSuccessSound = (vibrate = true) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First beep
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    oscillator1.frequency.value = 1000;
    oscillator1.type = 'sine';
    
    const now = audioContext.currentTime;
    gainNode1.gain.setValueAtTime(0, now);
    gainNode1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNode1.gain.linearRampToValueAtTime(0, now + 0.15);
    oscillator1.start(now);
    oscillator1.stop(now + 0.15);
    
    // Second beep (slightly higher)
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    oscillator2.frequency.value = 1200;
    oscillator2.type = 'sine';
    
    gainNode2.gain.setValueAtTime(0, now + 0.15);
    gainNode2.gain.linearRampToValueAtTime(0.3, now + 0.2);
    gainNode2.gain.linearRampToValueAtTime(0, now + 0.4);
    oscillator2.start(now + 0.15);
    oscillator2.stop(now + 0.4);
    
    // Vibrate
    playWithVibration('success', vibrate);
    
    console.log('✅ Success sound played');
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
};

// Play urgent alert sound
export const playUrgentSound = (vibrate = true) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a more urgent, attention-grabbing sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Higher frequency for urgency
    oscillator.frequency.value = 1400;
    oscillator.type = 'square'; // Harsher sound
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
    
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    
    // Second urgent beep
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 1400;
      oscillator2.type = 'square';
      
      const now2 = audioContext.currentTime;
      gainNode2.gain.setValueAtTime(0, now2);
      gainNode2.gain.linearRampToValueAtTime(0.4, now2 + 0.05);
      gainNode2.gain.linearRampToValueAtTime(0, now2 + 0.2);
      
      oscillator2.start(now2);
      oscillator2.stop(now2 + 0.2);
    }, 250);
    
    // Vibrate with urgent pattern
    playWithVibration('urgent', vibrate);
    
    console.log('🚨 Urgent sound played');
  } catch (error) {
    console.error('Error playing urgent sound:', error);
  }
};
