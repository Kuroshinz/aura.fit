/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  dynamicStartUrl: true,
  runtimeCaching: [
    {
      // Chỉ cache các file tĩnh ổn định — KHÔNG cache chunks JS/HTML sau deploy
      urlPattern: /^https:\/\/aurafitiris\.vercel\.app\/_next\/static\/media\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-media',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
