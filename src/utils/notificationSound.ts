// Generate notification sound using Web Audio API
export const playNotificationSound = () => {
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
    
    console.log('🔔 Notification sound played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Play success sound (higher pitch, two beeps)
export const playSuccessSound = () => {
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
    
    console.log('✅ Success sound played');
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
};
