self.addEventListener('install', (event) => {
  // Skip waiting so it activates immediately on first load
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin image requests
  if (event.request.destination === 'image' && url.origin === self.location.origin) {
    // If path points to the old src-based assets, serve the placeholder instead
    if (url.pathname.startsWith('/src/pages/public/img/')) {
      event.respondWith(fetch('/img/placeholder.svg'));
      return;
    }
  }
});
