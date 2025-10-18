/**
 * Enhanced monitoring utilities for production
 * Tracks errors, performance, and user actions
 */

interface ErrorContext {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class MonitoringService {
  private static instance: MonitoringService;

  private constructor() {
    this.initPerformanceObserver();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Track errors with context
   */
  trackError(error: Error, context?: ErrorContext) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorData);
    }

    // Send to monitoring service (could be Sentry, LogRocket, etc.)
    this.sendToMonitoring('error', errorData);

    // Store locally for debugging
    this.storeLocally('errors', errorData);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: PerformanceMetric) {
    const data = {
      ...metric,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (import.meta.env.DEV) {
      console.log('Performance metric:', data);
    }

    this.sendToMonitoring('performance', data);
  }

  /**
   * Track user interactions
   */
  trackInteraction(action: string, details?: Record<string, any>) {
    const data = {
      action,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...details,
    };

    this.sendToMonitoring('interaction', data);
  }

  /**
   * Initialize performance observer for Web Vitals
   */
  private initPerformanceObserver() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      
      this.trackPerformance({
        name: 'LCP',
        value: lcp,
        rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor',
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.trackPerformance({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                  entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor',
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      
      this.trackPerformance({
        name: 'CLS',
        value: clsScore,
        rating: clsScore < 0.1 ? 'good' : clsScore < 0.25 ? 'needs-improvement' : 'poor',
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Send data to monitoring service
   */
  private async sendToMonitoring(type: string, data: any) {
    try {
      // In production, send to your monitoring service
      // await fetch('/api/monitoring', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, data }),
      // });
    } catch (error) {
      console.error('Failed to send monitoring data:', error);
    }
  }

  /**
   * Store data locally for debugging
   */
  private storeLocally(key: string, data: any) {
    try {
      const stored = JSON.parse(localStorage.getItem(`monitoring_${key}`) || '[]');
      stored.push(data);
      
      // Keep only last 50 entries
      if (stored.length > 50) {
        stored.shift();
      }
      
      localStorage.setItem(`monitoring_${key}`, JSON.stringify(stored));
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Get stored monitoring data
   */
  getMonitoringData(type: 'errors' | 'performance' | 'interactions') {
    try {
      return JSON.parse(localStorage.getItem(`monitoring_${type}`) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear monitoring data
   */
  clearMonitoringData() {
    ['errors', 'performance', 'interactions'].forEach(type => {
      localStorage.removeItem(`monitoring_${type}`);
    });
  }
}

export const monitoring = MonitoringService.getInstance();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoring.trackError(event.error, {
      action: 'global_error_handler',
      metadata: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.trackError(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      {
        action: 'unhandled_rejection',
        metadata: { reason: event.reason },
      }
    );
  });
}
