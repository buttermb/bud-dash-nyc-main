// Analytics tracking utility for signup popup and checkout events

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean = true;

  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', eventData);
    }

    // Store in localStorage for demo purposes
    this.storeEvent(eventData);
  }

  private storeEvent(eventData: AnalyticsEvent) {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      existingEvents.push(eventData);
      
      // Keep only last 100 events
      if (existingEvents.length > 100) {
        existingEvents.shift();
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(existingEvents));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  getEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  clearEvents() {
    localStorage.removeItem('analytics_events');
  }

  // Popup-specific tracking
  trackPopupViewed(cartTotal: number, itemsInCart: number, discountAmount: number) {
    this.track('Signup Popup Viewed', {
      cart_total: cartTotal,
      items_in_cart: itemsInCart,
      discount_amount: discountAmount,
      potential_savings: discountAmount + 5.99 // Include shipping
    });
  }

  trackPopupSignup(email: string, cartTotal: number, savingsAmount: number) {
    this.track('Signup From Popup', {
      email_entered: !!email,
      cart_total: cartTotal,
      savings_amount: savingsAmount,
      conversion: true
    });
  }

  trackPopupGuestCheckout(cartTotal: number, savingsDeclined: number) {
    this.track('Guest Checkout Selected', {
      cart_total: cartTotal,
      savings_declined: savingsDeclined,
      conversion: false
    });
  }

  trackPopupDismissed(cartTotal: number, method: 'close_button' | 'backdrop_click' | 'esc_key') {
    this.track('Signup Popup Dismissed', {
      cart_total: cartTotal,
      dismiss_method: method,
      conversion: false
    });
  }

  trackCheckoutStarted(cartTotal: number, itemCount: number, isGuest: boolean) {
    this.track('Checkout Started', {
      cart_total: cartTotal,
      item_count: itemCount,
      is_guest: isGuest
    });
  }

  trackOrderCompleted(orderTotal: number, discountApplied: number, isGuest: boolean) {
    this.track('Order Completed', {
      order_total: orderTotal,
      discount_applied: discountApplied,
      is_guest: isGuest
    });
  }
}

export const analytics = new Analytics();
