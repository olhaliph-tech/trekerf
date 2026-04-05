/**
 * 📚 PLACEHOLDER FALLBACK - Local Image Replacement
 * ================================================
 * Заміна via.placeholder.com на локальні SVG дані
 * Не потребує зовнішніх запитів, працює офлайн
 */

// SVG дані для обкладинок без зображення
const PLACEHOLDER_SVG_BOOK = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" width="220" height="180">
    <!-- Фон -->
    <rect width="220" height="180" fill="#e8e8e8"/>
    
    <!-- Іконка книги -->
    <g transform="translate(60, 40)">
      <!-- Обкладинка -->
      <rect x="10" y="0" width="60" height="80" fill="#b8860b" stroke="#8b6408" stroke-width="2" rx="2"/>
      
      <!-- Сторінки -->
      <line x1="30" y1="15" x2="60" y2="15" stroke="#d4a509" stroke-width="1"/>
      <line x1="30" y1="25" x2="60" y2="25" stroke="#d4a509" stroke-width="1"/>
      <line x1="30" y1="35" x2="60" y2="35" stroke="#d4a509" stroke-width="1"/>
      <line x1="30" y1="45" x2="60" y2="45" stroke="#d4a509" stroke-width="1"/>
      <line x1="30" y1="55" x2="60" y2="55" stroke="#d4a509" stroke-width="1"/>
      <line x1="15" y1="65" x2="65" y2="65" stroke="#d4a509" stroke-width="1"/>
      
      <!-- Корінець -->
      <rect x="18" y="78" width="44" height="3" fill="#8b6408"/>
    </g>
    
    <!-- Текст -->
    <text x="110" y="130" font-size="16" font-weight="bold" text-anchor="middle" fill="#666">
      NO COVER
    </text>
    <text x="110" y="155" font-size="12" text-anchor="middle" fill="#999">
      Click to add
    </text>
  </svg>
`;

// Конвертуємо SVG у data URI
const PLACEHOLDER_BOOK_DATA_URI = `data:image/svg+xml;base64,${btoa(PLACEHOLDER_SVG_BOOK)}`;

// SVG для аватарів
const PLACEHOLDER_SVG_AVATAR = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
    <!-- Фон -->
    <circle cx="40" cy="40" r="40" fill="#c8b8ff"/>
    
    <!-- Голова -->
    <circle cx="40" cy="32" r="16" fill="#f5deb3"/>
    
    <!-- Тіло -->
    <ellipse cx="40" cy="60" rx="18" ry="20" fill="#ff9999"/>
    
    <!-- Очі -->
    <circle cx="35" cy="28" r="2" fill="#333"/>
    <circle cx="45" cy="28" r="2" fill="#333"/>
    
    <!-- Рот -->
    <path d="M 35 35 Q 40 37 45 35" stroke="#333" stroke-width="1.5" fill="none"/>
  </svg>
`;

const PLACEHOLDER_AVATAR_DATA_URI = `data:image/svg+xml;base64,${btoa(PLACEHOLDER_SVG_AVATAR)}`;

// ============================================
// API для використання в коді
// ============================================

/**
 * Отримати placeholder для обкладинки
 * @returns {string} Data URI SVG
 */
function getPlaceholderBook() {
  return PLACEHOLDER_BOOK_DATA_URI;
}

/**
 * Отримати placeholder для аватара
 * @returns {string} Data URI SVG
 */
function getPlaceholderAvatar() {
  return PLACEHOLDER_AVATAR_DATA_URI;
}

/**
 * Встановити fallback image для img елемента
 * @param {HTMLImageElement} img - Image element
 */
function setupImageFallback(img) {
  if (!img) return;
  
  img.onerror = function() {
    // Дизайнуємо чи це обкладинка книги чи аватар
    if (img.classList.contains('avatar') || img.alt === 'avatar') {
      this.src = PLACEHOLDER_AVATAR_DATA_URI;
    } else {
      this.src = PLACEHOLDER_BOOK_DATA_URI;
    }
    // Видаляємо обробник щоб не було циклу
    this.onerror = null;
  };
}

// Експортуємо глобально
window.PlaceholderFallback = {
  book: PLACEHOLDER_BOOK_DATA_URI,
  avatar: PLACEHOLDER_AVATAR_DATA_URI,
  getBook: getPlaceholderBook,
  getAvatar: getPlaceholderAvatar,
  setup: setupImageFallback
};

// Ініціалізація - встановити avatar для defaultUser якщо він null
if (typeof defaultUser !== 'undefined' && !defaultUser.avatar) {
  defaultUser.avatar = PLACEHOLDER_AVATAR_DATA_URI;
}

console.log('✅ Placeholder Fallback завантажена - локальні SVG готові');
