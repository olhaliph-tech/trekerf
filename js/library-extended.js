/**
 * 📚 LIBRARY EXTENDED FEATURES MODULE
 * ====================================
 * Розширені функції для розділу "Бібліотека"
 * 
 * Реалізовані функції:
 * 1. 📝 Приватні нотатки до книги
 * 2. 🔖 Закладки та цитати
 * 3. 🏷️ Розширені теги з кольорами
 * 4. ⭐ Швидкі теги для класифікації
 * 5. 🎁 Статус "Отримана як подарунок"
 * 6. 📊 Аналітика на рівні книги
 * 7. 🎨 Кастомізація карточок
 * 8. 🔔 Смарт-нагадування
 * 9. 📚 Колекції книг
 * 10. 👥 Порівняння з друзями
 */

// ============================================
// 1️⃣ ПРИВАТНІ НОТАТКИ ДО КНИГИ
// ============================================

/**
 * Додати нотатку до книги
 * @param {string} bookId - ID книги
 * @param {string} noteText - Текст нотатки
 * @param {number} pageNumber - Номер сторінки
 */
const addBookNote = (bookId, noteText, pageNumber = 0) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return false;

  if (!book.notes) book.notes = [];
  
  const note = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text: noteText,
    page: pageNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  book.notes.push(note);
  saveBooksToLocalStorage();
  return note;
};

/**
 * Отримати всі нотатки книги
 * @param {string} bookId - ID книги
 * @returns {Array} Масив нотаток
 */
const getBookNotes = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  return book?.notes || [];
};

/**
 * Видалити нотатку
 * @param {string} bookId - ID книги
 * @param {string} noteId - ID нотатки
 */
const deleteBookNote = (bookId, noteId) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !book.notes) return false;
  
  book.notes = book.notes.filter(n => n.id !== noteId);
  saveBooksToLocalStorage();
  return true;
};

// ============================================
// 2️⃣ ЗАКЛАДКИ ТА ЦИТАТИ
// ============================================

/**
 * Додати цитату з книги
 * @param {string} bookId - ID книги
 * @param {string} text - Текст цитати
 * @param {number} pageNumber - Номер сторінки
 */
const addQuote = (bookId, text, pageNumber = 0) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return false;

  if (!book.quotes) book.quotes = [];
  if (!book.bookmarks) book.bookmarks = [];
  
  const quote = {
    id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text: text,
    page: pageNumber,
    isFavorite: false,
    createdAt: new Date().toISOString()
  };
  
  book.quotes.push(quote);
  
  // Додаємо закладку на сторінку
  if (!book.bookmarks.find(b => b.page === pageNumber)) {
    book.bookmarks.push({
      page: pageNumber,
      timestamp: new Date().toISOString()
    });
  }
  
  saveBooksToLocalStorage();
  return quote;
};

/**
 * Отримати всі цитати книги
 * @param {string} bookId - ID книги
 * @returns {Array} Масив цитат
 */
const getQuotes = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  return book?.quotes || [];
};

/**
 * Отримати всі закладки книги
 * @param {string} bookId - ID книги
 * @returns {Array} Масив закладок
 */
const getBookmarks = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  return book?.bookmarks || [];
};

/**
 * Помітити цитату як улюблену
 * @param {string} bookId - ID книги
 * @param {string} quoteId - ID цитати
 */
const toggleFavoriteQuote = (bookId, quoteId) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !book.quotes) return false;
  
  const quote = book.quotes.find(q => q.id === quoteId);
  if (quote) {
    quote.isFavorite = !quote.isFavorite;
    saveBooksToLocalStorage();
    return true;
  }
  return false;
};

// ============================================
// 3️⃣ РОЗШИРЕНІ ТЕГИ З КОЛЬОРАМИ
// ============================================

const TAG_COLORS = {
  'класика': '#E8B4B8',
  'фентезі': '#B4C7E8',
  'детектив': '#B8E8D4',
  'романтика': '#E8D4B4',
  'наука': '#D4B4E8',
  'історія': '#E8C4B4',
  'пригоди': '#C4E8B4',
  'жах': '#E8B4B4'
};

/**
 * Додати тег до книги з кольором
 * @param {string} bookId - ID книги
 * @param {string} tagName - Назва тегу
 * @param {string} color - Колір тегу (опціонально)
 */
const addColorTag = (bookId, tagName, color = null) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return false;

  if (!book.colorTags) book.colorTags = [];
  
  // Перевірили чи такий тег вже є
  if (book.colorTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())) {
    return false; // Тег вже існує
  }
  
  const tag = {
    name: tagName,
    color: color || TAG_COLORS[tagName.toLowerCase()] || '#E0E0E0',
    createdAt: new Date().toISOString()
  };
  
  book.colorTags.push(tag);
  saveBooksToLocalStorage();
  return tag;
};

/**
 * Отримати всі кольорові теги книги
 * @param {string} bookId - ID книги
 * @returns {Array} Теги з кольорами
 */
const getColorTags = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  return book?.colorTags || [];
};

/**
 * Видалити кольоровий тег
 * @param {string} bookId - ID книги
 * @param {string} tagName - Назва тегу
 */
const removeColorTag = (bookId, tagName) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !book.colorTags) return false;
  
  book.colorTags = book.colorTags.filter(t => t.name !== tagName);
  saveBooksToLocalStorage();
  return true;
};

/**
 * Отримати всі книги з конкретним тегом
 * @param {string} tagName - Назва тегу
 * @returns {Array} Список книг
 */
const getBooksByTag = (tagName) => {
  return state.books.filter(book => 
    book.colorTags?.some(t => t.name.toLowerCase() === tagName.toLowerCase())
  );
};

// ============================================
// 4️⃣ ШВИДКІ ТЕГИ ДЛЯ КЛАСИФІКАЦІЇ
// ============================================

const QUICK_TAGS = {
  'обов_прочити': { emoji: '📌', label: 'Обов\'язково прочитати' },
  'рекомендована': { emoji: '👍', label: 'Рекомендована мною' },
  'класика': { emoji: '📜', label: 'Класична література' },
  'сучасна': { emoji: '🔥', label: 'Сучасна литература' },
  'дітям': { emoji: '👶', label: 'Для дітей' },
  'закончена': { emoji: '✓', label: 'Цінна знахідка' }
};

/**
 * Додати швидкий тег до книги
 * @param {string} bookId - ID книги
 * @param {string} quickTagKey - Ключ швидкого тегу
 */
const addQuickTag = (bookId, quickTagKey) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !QUICK_TAGS[quickTagKey]) return false;

  if (!book.quickTags) book.quickTags = [];
  if (!book.quickTags.includes(quickTagKey)) {
    book.quickTags.push(quickTagKey);
    saveBooksToLocalStorage();
    return true;
  }
  return false;
};

/**
 * Видалити швидкий тег
 * @param {string} bookId - ID книги
 * @param {string} quickTagKey - Ключ швидкого тегу
 */
const removeQuickTag = (bookId, quickTagKey) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !book.quickTags) return false;
  
  book.quickTags = book.quickTags.filter(t => t !== quickTagKey);
  saveBooksToLocalStorage();
  return true;
};

/**
 * Отримати всі швидкі теги книги
 * @param {string} bookId - ID книги
 * @returns {Array} Швидкі теги
 */
const getQuickTags = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !book.quickTags) return [];
  
  return book.quickTags.map(key => ({
    key: key,
    emoji: QUICK_TAGS[key]?.emoji || '🏷️',
    label: QUICK_TAGS[key]?.label || key
  }));
};

// ============================================
// 5️⃣ СТАТУС "ОТРИМАНА ЯК ПОДАРУНОК"
// ============================================

/**
 * Встановити статус подарунку для книги
 * @param {string} bookId - ID книги
 * @param {string} fromWho - Від кого подарунок
 * @param {string} occasion - Причина подарунку
 */
const setAsGift = (bookId, fromWho = '', occasion = '') => {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return false;

  book.gift = {
    isGift: true,
    from: fromWho,
    occasion: occasion,
    date: new Date().toISOString(),
    thankYou: false
  };
  
  saveBooksToLocalStorage();
  return true;
};

/**
 * Позначити подарунок як "подякував"
 * @param {string} bookId - ID книги
 */
const markGiftAsThanked = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book || !book.gift) return false;
  
  book.gift.thankYou = true;
  book.gift.thankedDate = new Date().toISOString();
  saveBooksToLocalStorage();
  return true;
};

/**
 * Отримати всі книги-подарунки
 * @returns {Array} Список книг-подарунків
 */
const getGiftBooks = () => {
  return state.books.filter(book => book.gift?.isGift);
};

// ============================================
// 6️⃣ АНАЛІТИКА НА РІВНІ КНИГИ
// ============================================

/**
 * Отримати статистику книги
 * @param {string} bookId - ID книги
 * @returns {Object} Статистика
 */
const getBookAnalytics = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return null;

  const createdDate = new Date(book.createdAt);
  const now = new Date();
  const daysAdded = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  
  const readingDays = book.activeSession ? 
    Math.floor((now - new Date(book.activeSession.startDate)) / (1000 * 60 * 60 * 24)) : 0;
  
  const pagesPerDay = book.currentPage > 0 && readingDays > 0 ? 
    (book.currentPage / readingDays).toFixed(1) : 0;
  
  const estimatedFinishDate = pagesPerDay > 0 ? 
    new Date(now.getTime() + ((book.pages - book.currentPage) / pagesPerDay) * 86400000) : null;

  return {
    totalPages: book.pages,
    currentPage: book.currentPage,
    progressPercent: ((book.currentPage / book.pages) * 100).toFixed(1),
    daysAdded: daysAdded,
    readingDays: readingDays,
    pagesPerDay: pagesPerDay,
    estimatedFinishDate: estimatedFinishDate,
    notesCount: book.notes?.length || 0,
    quotesCount: book.quotes?.length || 0,
    bookmarksCount: book.bookmarks?.length || 0
  };
};

// ============================================
// 7️⃣ КАСТОМІЗАЦІЯ КАРТОЧОК
// ============================================

const CARD_DISPLAY_OPTIONS = {
  title: true,
  author: true,
  genre: true,
  pages: true,
  progress: true,
  rating: true,
  cover: true,
  description: true,
  status: true
};

/**
 * Встановити параметри відображення карточки
 * @param {Object} options - Параметри відображення
 */
const setCardDisplayOptions = (options) => {
  Object.assign(CARD_DISPLAY_OPTIONS, options);
  localStorage.setItem('cardDisplayOptions', JSON.stringify(CARD_DISPLAY_OPTIONS));
};

/**
 * Отримати параметри відображення карточки
 * @returns {Object} Параметри
 */
const getCardDisplayOptions = () => {
  const saved = localStorage.getItem('cardDisplayOptions');
  return saved ? JSON.parse(saved) : CARD_DISPLAY_OPTIONS;
};

/**
 * Встановити розмір карточок
 * @param {string} size - 'small', 'medium', 'large'
 */
const setCardSize = (size) => {
  const sizes = {
    small: 'max-width:150px',
    medium: 'max-width:220px',
    large: 'max-width:280px'
  };
  
  localStorage.setItem('cardSize', size);
  document.documentElement.style.setProperty('--card-size', sizes[size] || sizes.medium);
  return true;
};

// ============================================
// 8️⃣ СМАРТ-НАГАДУВАННЯ
// ============================================

/**
 * Отримати нагадуванняために книги
 * @returns {Array} Список нагадувань
 */
const getSmartReminders = () => {
  const reminders = [];
  const now = new Date();

  state.books.forEach(book => {
    // Нагадування: не розпоч та книга 3+ тиж  
    if (book.status === 'бажаю прочитати') {
      const createdDate = new Date(book.createdAt);
      const daysWaiting = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      
      if (daysWaiting >= 21) {
        reminders.push({
          type: 'start_reading',
          bookId: book.id,
          message: `📖 "${book.title}" вже очікує ${daysWaiting} днів на полиці`,
          priority: 'high'
        });
      }
    }

    // Нагадування: прерлаж затримано
    if (book.status === 'читаю' && book.currentPage > 0) {
      const lastUpdate = book._lastProgressUpdate || book.createdAt;
      const daysSinceUpdate = Math.floor((now - new Date(lastUpdate)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate >= 7) {
        reminders.push({
          type: 'continue_reading',
          bookId: book.id,
          message: `📚 "${book.title}" - ${daysSinceUpdate} днів без оновлень прогресу`,
          priority: 'medium'
        });
      }
    }
  });

  return reminders.sort((a, b) => 
    a.priority === 'high' ? -1 : a.priority === 'medium' ? 0 : 1
  );
};

// ============================================
// 9️⃣ КОЛЕКЦІЇ КНИГ
// ============================================

/**
 * Створити нову колекцію
 * @param {string} name - Назва колекції
 * @param {string} description - Опис
 * @returns {Object} Новель колекція
 */
const createCollection = (name, description = '') => {
  if (!state.collections) state.collections = [];
  
  const collection = {
    id: `coll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name,
    description: description,
    bookIds: [],
    createdAt: new Date().toISOString()
  };
  
  state.collections.push(collection);
  saveBooksToLocalStorage();
  return collection;
};

/**
 * Додати книгу до колекції
 * @param {string} collectionId - ID колекції
 * @param {string} bookId - ID книги
 */
const addBookToCollection = (collectionId, bookId) => {
  if (!state.collections) return false;
  
  const collection = state.collections.find(c => c.id === collectionId);
  if (!collection) return false;
  
  if (!collection.bookIds.includes(bookId)) {
    collection.bookIds.push(bookId);
    saveBooksToLocalStorage();
    return true;
  }
  return false;
};

/**
 * Отримати всі колекції
 * @returns {Array} Список колекцій
 */
const getCollections = () => {
  return state.collections || [];
};

/**
 * Отримати книги колекції
 * @param {string} collectionId - ID колекції
 * @returns {Array} Книги у колекції
 */
const getCollectionBooks = (collectionId) => {
  const collection = state.collections?.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return state.books.filter(book => collection.bookIds.includes(book.id));
};

// ============================================
// 🔟 ПОРІВНЯННЯ З ДРУЗЯМИ
// ============================================

/**
 * Отримати порівняльну статистику з друзями
 * @param {string} bookId - ID книги
 * @returns {Object} Статистика порівняння
 */
const getBookComparisonStats = (bookId) => {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return null;

  // Скільки твоїх друзів читають цю книгу
  const friendsWithBook = state.books.filter(b => 
    b.title === book.title && 
    b.author === book.author && 
    b.userId !== state.user.id
  );

  const avgProgress = friendsWithBook.length > 0 ?
    (friendsWithBook.reduce((sum, b) => sum + ((b.currentPage / b.pages) * 100), 0) / friendsWithBook.length).toFixed(1) : 0;

  const avgRating = friendsWithBook.length > 0 ?
    (friendsWithBook.reduce((sum, b) => sum + (b.rating || 0), 0) / friendsWithBook.length).toFixed(1) : 0;

  return {
    yourProgress: ((book.currentPage / book.pages) * 100).toFixed(1),
    friendsCount: friendsWithBook.length,
    averageProgress: avgProgress,
    averageRating: avgRating,
    yoursAhead: ((book.currentPage / book.pages) * 100) > avgProgress,
    yourRating: book.rating || 0
  };
};

/**
 * Експортувати функції для глобального доступу
 */
window.LibraryExtended = {
  // Нотатки
  addBookNote,
  getBookNotes,
  deleteBookNote,
  
  // Цитати та закладки
  addQuote,
  getQuotes,
  getBookmarks,
  toggleFavoriteQuote,
  
  // Кольорові теги
  addColorTag,
  getColorTags,
  removeColorTag,
  getBooksByTag,
  
  // Швидкі теги
  addQuickTag,
  removeQuickTag,
  getQuickTags,
  
  // Подарунки
  setAsGift,
  markGiftAsThanked,
  getGiftBooks,
  
  // Аналітика
  getBookAnalytics,
  
  // Кастомізація
  setCardDisplayOptions,
  getCardDisplayOptions,
  setCardSize,
  
  // Нагадування
  getSmartReminders,
  
  // Колекції
  createCollection,
  addBookToCollection,
  getCollections,
  getCollectionBooks,
  
  // Порівняння
  getBookComparisonStats
};
