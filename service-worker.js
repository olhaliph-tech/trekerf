/**
 * 📱 SERVICE WORKER - PWA Offline Support
 * ======================================
 * Управління офлайн функціями та кешуванням
 */

// Константи
const CACHE_NAME = 'reading-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/style-extended.css',
  '/manifest.json'
];

// ============================================
// INSTALLATION - Кеширование статичних активів
// ============================================

self.addEventListener('install', (event) => {
  console.log('📱 Service Worker: Інсталяція розпочата...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('💾 Service Worker: Кеширование статичних активів...');
      
      return Promise.all(
        STATIC_ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`⚠️ Не вдалося закешувати ${url}:`, err.message);
          });
        })
      );
    }).catch((err) => {
      console.error('❌ Помилка при кешуванні статичних активів:', err);
    })
  );
  
  self.skipWaiting(); // Активувати новий SW негайно
});

// ============================================
// ACTIVATION - Очистка старих кешів
// ============================================

self.addEventListener('activate', (event) => {
  console.log('📱 Service Worker: Активація розпочата...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log(`🗑️ Service Worker: Видалення старого кешу "${cacheName}"`);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  self.clients.claim(); // Негайно контролюватимемо всіх клієнтів
});

// ============================================
// FETCH - Network First, Cache Fallback
// ============================================

self.addEventListener('fetch', (event) => {
  // Ігноруємо unsafe URLs (chrome-extension, etc.)
  if (!isSafeUrl(event.request.url)) {
    return; // Не обробляємо не безпечні URLs
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Якщо успішна відповідь - зберігаємо в кеш
        if (
          response &&
          response.status === 200 &&
          response.type !== 'error'
        ) {
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Безпечно кешуємо
              cache.put(event.request, responseToCache).catch((err) => {
                // Ігноруємо помилки кеширування (наприклад chrome-extension)
                console.debug(`⚠️ Не вдалося закешувати: ${event.request.url}`);
              });
            });
        }
        
        return response;
      })
      .catch(() => {
        // Мережа недоступна - беремо з кешу
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log(`📦 Offline: Використання кешованого ${event.request.url}`);
              return cachedResponse;
            }
            
            // У кешу нема - повертаємо 404 сторінку або дефолтне
            console.warn(`❌ Offline: Нема в кешу - ${event.request.url}`);
            return new Response('Offline - дані недоступні', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          })
          .catch((err) => {
            console.error('❌ Cache error:', err);
            return new Response('Помилка при doступі до даних', {
              status: 500,
              statusText: 'Internal Server Error'
            });
          });
      })
  );
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Перевірити чи URL безпечна для процесування
 * @param {string} url - URL для перевірки
 * @returns {boolean} true якщо безпечна
 */
function isSafeUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Дозволяємо тільки http/https
    const safeProtocols = ['http:', 'https:', 'file:'];
    if (!safeProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // Ігноруємо placeholder API (вона вниз)
    if (url.includes('via.placeholder.com')) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================
// MESSAGE HANDLER - Команди від клієнта
// ============================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true, message: 'Кеш очищен' });
      });
      break;
      
    case 'GET_CACHE_SIZE':
      caches.open(CACHE_NAME).then((cache) => {
        cache.keys().then((keys) => {
          event.ports[0].postMessage({ 
            success: true, 
            size: keys.length,
            urls: keys.map(k => k.url)
          });
        });
      });
      break;
      
    default:
      event.ports[0].postMessage({ success: false, error: 'Unknown command' });
  }
});

console.log('✅ Service Worker завантажений та готовий (PWA режим увімкнено)');
