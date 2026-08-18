// AURA.FIT Service Worker — phiên bản "tự hủy" (self-destruct)
// Mục đích: gỡ cài đặt PWA cũ trên trình duyệt người dùng
// Xóa sạch mọi cache cũ → không còn blank page sau deploy
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Xóa toàn bộ caches (mọi tên)
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));

    // Claim control ngay lập tức
    await self.clients.claim();

    // Thông báo cho mọi tab: reload để tải app mới
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.navigate(client.url));
  })());
});

// Không intercept bất kỳ request nào — app chạy hoàn toàn từ network
self.addEventListener('fetch', () => {});
