/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

// PWA (next-pwa) DISABLED — service worker gây blank page sau mỗi deploy
// vì cache chunk cũ → 404. App là web app trên Vercel, không cần offline.
// public/sw.js sẽ tự-unregister để dọn SW cũ trên trình duyệt người dùng.

module.exports = nextConfig;
