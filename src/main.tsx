import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA capabilities and caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registered:', registration.scope);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      },
      (error) => {
        console.error('ServiceWorker registration failed:', error);
      }
    );
  });
}

// Performance monitoring
if ('PerformanceObserver' in window && import.meta.env.DEV) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`Performance: ${entry.name}`, entry);
    }
  });
  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
}

createRoot(document.getElementById("root")!).render(<App />);
