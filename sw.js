const CACHE_NAME = 'rif-admin-v2'; // ভার্সন আপডেট করা হয়েছে
const urlsToCache = [
  './',
  './index.html', // আপনার মেইন ফাইল
  './manifest.json',
  './admin192.png',
  './admin512.png',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// ১. ইনস্টল ইভেন্ট (ক্যাশে সেভ করা)
self.addEventListener('install', event => {
  self.skipWaiting(); // নতুন ভার্সন এলে সাথে সাথে আপডেট হবে
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// ২. অ্যাক্টিভেট ইভেন্ট (পুরনো ক্যাশে ডিলিট করা)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ৩. ফেচ ইভেন্ট (অফলাইন সাপোর্ট)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // ক্যাশে থাকলে ক্যাশ থেকে দেবে, না থাকলে নেটওয়ার্ক থেকে আনবে
      return response || fetch(event.request).catch(() => {
        // যদি নেটওয়ার্ক না থাকে এবং রিকোয়েস্টটি পেজ (HTML) হয়
        if (event.request.mode === 'navigate') {
          return caches.match('./');
        }
      });
    })
  );
});
