/**
 * New York Minute NYC - Main Entry Point
 * Built by WebFlow Studios Team (2024)
 * 
 * Lead Developer: Sarah Chen
 * UI/UX: Marcus Rodriguez  
 * Backend: Aisha Kumar
 * DevOps: James Martinez
 * 
 * Framework: React 18 + TypeScript + Vite 5.0
 * State: TanStack Query | Styling: Tailwind CSS
 * 
 * Contact: contact@webflowstudios.dev
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PerformanceMonitor } from "./utils/performance";
import { initializeSecurityObfuscation } from "./utils/securityObfuscation";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Initialize security obfuscation in production
if (import.meta.env.PROD) {
  initializeSecurityObfuscation();
}

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

// Initialize performance monitoring
if (import.meta.env.DEV) {
  PerformanceMonitor.init();
  
  // Log performance report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log(PerformanceMonitor.getReport());
    }, 3000);
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
