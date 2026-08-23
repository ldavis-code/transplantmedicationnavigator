import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Transplant Medication Navigator',
        short_name: 'Med Navigator',
        description: 'Free guide for transplant patients to find affordable medications and assistance programs',
        theme_color: '#059669',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['health', 'medical', 'utilities'],
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'My Path Quiz',
            short_name: 'Quiz',
            description: 'Find your personalized medication path',
            url: '/wizard'
          },
          {
            name: 'Search Medications',
            short_name: 'Search',
            description: 'Search and compare medication prices',
            url: '/medications'
          }
        ]
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // Navigation requests - always network first to prevent stale redirects.
            // The Epic OAuth callback is fully excluded: it must always come
            // straight from the network (it carries one-time auth codes and its
            // own no-store headers), never from service-worker machinery.
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' && !url.pathname.startsWith('/auth/epic/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-v2',
              networkTimeoutSeconds: 3,
            }
          },
          {
            // Cache GET API calls with network-first strategy. POSTs (token
            // exchange, medication import, feedback) must NOT be routed through
            // a caching strategy: Cache storage cannot hold POST responses, and
            // routing them through the strategy machinery can stall the request.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && /\/api\//i.test(url.href),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Cache images with stale-while-revalidate for better freshness
            // This serves cached version immediately but fetches updates in background
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache-v3',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache-v2',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            // Cache CSS and JS with stale-while-revalidate
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-v2',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ],
        // Without this, the plugin registers an offline-first NavigationRoute
        // that serves the precached index.html for every navigation — ahead of
        // the NetworkFirst rule above — so server behavior (the static /es/
        // Spanish pages, the legacy ?lang=es 301s) never runs. Navigations
        // must reach the network first.
        navigateFallback: null,
        // Precache the hashed app assets, NOT the prerendered HTML pages.
        // HTML used to be included, but with ~500 prerendered pages that
        // meant every client re-downloaded the whole page set on every
        // deploy, and worse: a stale precached shell could be served
        // against the NEW deploy's hashed chunks (the old ones are gone
        // from both server and cleaned-up caches), leaving a half-alive
        // page whose buttons stop responding. Navigations are NetworkFirst
        // (rule above), and the pages-v2 runtime cache still keeps visited
        // pages available for offline revisits.
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        // Exclude large infographic images from precaching, plus the legacy
        // per-weight font copies: fonts.css now uses one variable-font file
        // per family; the old files stay on disk only for visitors whose
        // cached (formerly immutable) fonts.css still points at them, and
        // precaching all 16 would re-download ~700 KB nobody renders with.
        globIgnores: [
            '**/photos/tmn_infographic.jpg',
            '**/fonts/fraunces-[57]00-*.woff2',
            '**/fonts/fraunces-600-*.woff2',
            '**/fonts/plus-jakarta-sans-[45678]00-*.woff2',
        ],
        // Don't precache large files
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        // Clean up old caches
        cleanupOutdatedCaches: true,
        // Skip waiting to activate new service worker immediately
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true, // Enable PWA in development for testing
        type: 'module'
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Function form: works under both Rollup (Vite 5) and Rolldown
        // (Vite 8+), which rejects the object form with "manualChunks is
        // not a function" — this is what broke the Dependabot vite-8 PR's
        // deploys. Keep this form so the upgrade path stays open.
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react/')) return 'icons';
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run\/router)\//.test(id)) return 'react-vendor';
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  css: {
    devSourcemap: false
  }
})
