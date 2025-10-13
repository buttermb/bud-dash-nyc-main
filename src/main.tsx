import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA capabilities and caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
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
