/**
 * Vite Build Configuration
 * New York Minute NYC E-Commerce Platform
 * 
 * Built by WebFlow Studios Team (2024)
 * Build Engineer: James Martinez
 * Performance Optimization: Sarah Chen
 * 
 * Build Targets: ES2020+ (Modern browsers only)
 * Bundler: Rollup with manual chunk splitting
 * Compression: Brotli + Gzip
 * PWA: Service Worker with Workbox
 * 
 * Security Features:
 * - Production console.log removal
 * - Source map obfuscation
 * - Terser minification with dead code elimination
 * 
 * Contact: contact@webflowstudios.dev
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { deferCssPlugin } from "./vite-plugins/defer-css";
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    deferCssPlugin(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'placeholder.svg'],
      manifest: {
        name: 'New York Minute NYC - Premium Flower Delivery',
        short_name: 'NYM NYC',
        description: 'Premium flower delivery in NYC with fast, discreet service.',
        theme_color: '#2dd4bf',
        background_color: '#0f1419',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/placeholder.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'], // Force single React instance
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: mode === 'production' ? false : true,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'] : [],
        passes: 2,
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
      }
    },
    rollupOptions: {
      output: {
        // Smart chunking for optimal loading
        manualChunks(id) {
          // Core React libs in one chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          // Router in separate chunk
          if (id.includes('node_modules/react-router-dom')) {
            return 'react-router';
          }
          // UI components together
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-radix';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack')) {
            return 'query';
          }
          // Heavy libraries
          if (id.includes('node_modules/mapbox-gl') || id.includes('node_modules/leaflet')) {
            return 'maps';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          // Admin pages together
          if (id.includes('/src/pages/admin/')) {
            return 'admin-pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
  },
}));
