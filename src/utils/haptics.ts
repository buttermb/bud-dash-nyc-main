/**
 * Haptic feedback utilities for mobile devices
 */

export const haptics = {
  /**
   * Light tap feedback (button press)
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium impact feedback (selection change)
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy impact feedback (important action)
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Success feedback (order placed, item added)
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Error feedback (failed action)
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },

  /**
   * Selection feedback (toggle, checkbox)
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
};
