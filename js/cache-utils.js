/**
 * 🔧 SERVICE WORKER UTILITY - Cache Management
 * ============================================
 * Безпечна робота з Cache API, що уникає помилок з chrome-extension URLs
 */

// Константи для кеширования
const CACHE_NAME = 'reading-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/style-extended.css',
  '/manifest.json'
];

/**
 * Перевірити чи URL безпечна для кеширування
 * @param {string|Request} urlOrRequest - URL або Request об'єкт
 * @returns {boolean} true якщо можна кешувати
 */
const isCacheSafeUrl = (urlOrRequest) => {
  try {
    const url = typeof urlOrRequest === 'string' ? urlOrRequest : urlOrRequest.url;
    const urlObj = new URL(url);
    
    // Кешуємо тільки безпечні протоколи
    const safeSchemesProxy = ['http:', 'https:', 'file:'];
    return safeSchemesProxy.includes(urlObj.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Безпечно додати до кешу
 * @param {Cache} cache - Cache об'єкт
 * @param {string|Request} request - Request для кешування
 * @param {Response} response - Response для кешування
 */
const safeCachePut = async (cache, request, response) => {
  try {
    // Перевіряємо чи URL безпечна
    if (!isCacheSafeUrl(request)) {
      console.warn(`⚠️ Не кешуємо небезпечний URL: ${request.url || request}`);
      return false;
    }
    
    // Кешуємо тільки успішні відповіді (200-299)
    if (!response || response.status < 200 || response.status >= 300) {
      console.warn(`⚠️ Не кешуємо помилкову відповідь (${response?.status})`);
      return false;
    }
    
    // Добавляємо до кешу
    await cache.put(request, response);
    return true;
  } catch (error) {
    console.error(`❌ Помилка при кешуванні ${request.url || request}:`, error.message);
    return false;
  }
};

/**
 * Отримати з кешу безпечно
 * @param {Cache} cache - Cache об'єкт
 * @param {string|Request} request - Request для пошуку
 * @returns {Promise<Response|null>}
 */
const safeCacheMatch = async (cache, request) => {
  try {
    if (!isCacheSafeUrl(request)) {
      return null;
    }
    return await cache.match(request);
  } catch (error) {
    console.error(`❌ Помилка при читанні кешу:`, error.message);
    return null;
  }
};

// Експортуємо утиліти
window.CacheUtils = {
  isCacheSafeUrl,
  safeCachePut,
  safeCacheMatch,
  CACHE_NAME,
  urlsToCache
};
