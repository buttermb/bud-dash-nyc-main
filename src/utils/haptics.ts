/**
 * Haptic feedback utilities for mobile devices
 * Only triggers after user interaction to prevent browser intervention
 */

let userHasInteracted = false;

// Set up one-time listener for any user interaction
if (typeof window !== 'undefined') {
  const markInteraction = () => {
    userHasInteracted = true;
    window.removeEventListener('click', markInteraction);
    window.removeEventListener('touchstart', markInteraction);
    window.removeEventListener('keydown', markInteraction);
  };
  
  window.addEventListener('click', markInteraction, { once: true, passive: true });
  window.addEventListener('touchstart', markInteraction, { once: true, passive: true });
  window.addEventListener('keydown', markInteraction, { once: true, passive: true });
}

export const haptics = {
  /**
   * Light tap feedback (button press)
   */
  light: () => {
    if (userHasInteracted && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium impact feedback (selection change)
   */
  medium: () => {
    if (userHasInteracted && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy impact feedback (important action)
   */
  heavy: () => {
    if (userHasInteracted && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Success feedback (order placed, item added)
   */
  success: () => {
    if (userHasInteracted && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Error feedback (failed action)
   */
  error: () => {
    if (userHasInteracted && 'vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },

  /**
   * Selection feedback (toggle, checkbox)
   */
  selection: () => {
    if (userHasInteracted && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
};
