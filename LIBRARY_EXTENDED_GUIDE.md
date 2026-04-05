# 📚 LIBRARY EXTENDED - Документація

## 🎯 Перший Реліз: Top 10 Функцій

Цей документ описує 10 нових функцій для розділу **"Бібліотека"**, які були реалізовані для розширення можливостей трекера читання.

---

## 📋 Загальна Інформація

### Файли Реалізації
- **`js/library-extended.js`** - Основна логіка (350+ строк)
- **`js/library-extended-ui.js`** - UI компоненти (400+ строк)
- **Index.html** - Підключення скриптів

### Глобальні Об'єкти
- `window.LibraryExtended` - Всі функції
- `window.LibraryExtendedUI` - UI рендери

---

## 🔧 ФУНКЦІЯ #1: Приватні Нотатки до Книги

### Опис
Додайте особисті думки, запитання та записи до кожної книги.

### API Функції

```javascript
// Додати нотатку
LibraryExtended.addBookNote(bookId, "Текст нотатки", pageNumber)
// Повертає: { id, text, page, createdAt, updatedAt }

// Отримати всі нотатки
LibraryExtended.getBookNotes(bookId)
// Повертає: Array

// Видалити нотатку
LibraryExtended.deleteBookNote(bookId, noteId)
// Повертає: boolean
```

### Приклад Використання

```javascript
// Додання нотатки
const note = LibraryExtended.addBookNote(
  'book_123',
  'Цікава теза про гравітацію на сторінці 154',
  154
);

// Виведення всіх нотаток
const notes = LibraryExtended.getBookNotes('book_123');
console.log(notes);
// [{ id: 'note_...', text: '...', page: 154, ... }]

// Видалення нотатки
LibraryExtended.deleteBookNote('book_123', 'note_...');
```

### Зберігання
Нотатки зберігаються у властивості `book.notes[]` і автоматично синхронізуються з localStorage.

---

## 🔖 ФУНКЦІЯ #2: Закладки та Цитати

### Опис
Збереження улюблених цитат з вказанням сторінки, створення закладок.

### API Функції

```javascript
// Додати цитату
LibraryExtended.addQuote(bookId, "Текст цитати", pageNumber)
// Повертає: { id, text, page, isFavorite, createdAt }

// Отримати всі цитати
LibraryExtended.getQuotes(bookId)
// Повертає: Array

// Отримати закладки
LibraryExtended.getBookmarks(bookId)
// Повертає: Array

// Позначити як улюблену
LibraryExtended.toggleFavoriteQuote(bookId, quoteId)
// Повертає: boolean
```

### Приклад

```javascript
// Додання цитати
const quote = LibraryExtended.addQuote(
  'book_123',
  'Життя - це мистецтво знайти баланс',
  89
);

// Отримання цитат
const allQuotes = LibraryExtended.getQuotes('book_123');

// Помітити як улюблену
LibraryExtended.toggleFavoriteQuote('book_123', quote.id);

// Отримати закладки (створюються автоматично)
const bookmarks = LibraryExtended.getBookmarks('book_123');
// [{ page: 89, timestamp: '...' }, ...]
```

### Статус
- ✅ Закладки створюються вже при додаванні цитати
- ✅ Цитати можна помічати як улюблені (❤️/🤍)

---

## 🏷️ ФУНКЦІЯ #3: Розширені Теги з Кольорами

### Опис
Додавайте теги до книг з автоматичним вибором кольорів для більш наочного відображення.

### Доступні Кольори
```javascript
{
  'класика': '#E8B4B8',
  'фентезі': '#B4C7E8',
  'детектив': '#B8E8D4',
  'романтика': '#E8D4B4',
  'наука': '#D4B4E8',
  'історія': '#E8C4B4',
  'пригоди': '#C4E8B4',
  'жах': '#E8B4B4'
}
```

### API Функції

```javascript
// Додати тег з кольором
LibraryExtended.addColorTag(bookId, "класика", "#E8B4B8")

// Отримати все теги книги
LibraryExtended.getColorTags(bookId)
// Повертає: [{ name, color, createdAt }, ...]

// Видалити тег
LibraryExtended.removeColorTag(bookId, "класика")

// Отримати всі книги з тегом
LibraryExtended.getBooksByTag("класика")
// Повертає: Array
```

### Приклад

```javascript
// Додання тега (колір вибирається автоматично)
LibraryExtended.addColorTag('book_123', 'класика');

// Додання тега з власним кольором
LibraryExtended.addColorTag('book_123', 'улюблена', '#FF6B6B');

// Отримання тегів
const tags = LibraryExtended.getColorTags('book_123');
// [{ name: 'класика', color: '#E8B4B8', createdAt: '...' }]

// Пошук за тегом
const classicBooks = LibraryExtended.getBooksByTag('класика');
```

---

## ⭐ ФУНКЦІЯ #4: Швидкі Теги для Класифікації

### Опис
Швидке позначення книг однокліком за попередньо встановленими категоріями.

### Доступні Швидкі Теги
```javascript
{
  'обов_прочити': '📌 Обов\'язково прочитати',
  'рекомендована': '👍 Рекомендована мною',
  'класика': '📜 Класична література',
  'сучасна': '🔥 Сучасна литература',
  'дітям': '👶 Для дітей',
  'закончена': '✓ Цінна знахідка'
}
```

### API Функції

```javascript
// Додати швидкий тег
LibraryExtended.addQuickTag(bookId, 'обов_прочити')

// Видалити швидкий тег
LibraryExtended.removeQuickTag(bookId, 'обов_прочити')

// Отримати все швидкі теги
LibraryExtended.getQuickTags(bookId)
// Повертає: [{ key, emoji, label }, ...]
```

### Приклад

```javascript
// Додання швидкого тегу
LibraryExtended.addQuickTag('book_123', 'обов_прочити');
LibraryExtended.addQuickTag('book_123', 'рекомендована');

// Отримання тегів
const quickTags = LibraryExtended.getQuickTags('book_123');
// [
//   { key: 'обов_прочити', emoji: '📌', label: 'Обов\'язково прочитати' },
//   { key: 'рекомендована', emoji: '👍', label: 'Рекомендована мною' }
// ]
```

---

## 🎁 ФУНКЦІЯ #5: Статус "Отримана як Подарунок"

### Опис
Позначте книги, отримані як подарунки, зазначивши від кого та з якої причини.

### API Функції

```javascript
// Позначити як подарунок
LibraryExtended.setAsGift(bookId, "від кого", "причина")

// Позначити як "поблагодарили"
LibraryExtended.markGiftAsThanked(bookId)

// Отримати всі книги-подарунки
LibraryExtended.getGiftBooks()
// Повертає: Array
```

### Приклад

```javascript
// Додання статусу подарунку
LibraryExtended.setAsGift('book_123', 'Тетя Марія', 'З Дня народження');

// Позначення як "поблагодарив"
LibraryExtended.markGiftAsThanked('book_123');

// Отримання всіх подарунків
const gifts = LibraryExtended.getGiftBooks();
// [{ id, title, gift: { isGift, from, occasion, date, thankYou } }, ...]
```

### Структура Даних
```javascript
book.gift = {
  isGift: true,
  from: "Ім'я того, хто подарував",
  occasion: "Причина подарунку",
  date: "2026-04-06T...",
  thankYou: false,
  thankedDate: "2026-04-07T..." // Якщо поблагодарили
}
```

---

## 📊 ФУНКЦІЯ #6: Аналітика на Рівні Книги

### Опис
Детальна статистика про вашу активність з конкретною книгою.

### API Функції

```javascript
// Отримати аналітику книги
LibraryExtended.getBookAnalytics(bookId)
// Повертає: {
//   totalPages, currentPage, progressPercent,
//   daysAdded, readingDays, pagesPerDay,
//   estimatedFinishDate, notesCount, quotesCount, bookmarksCount
// }
```

### Приклад

```javascript
const analytics = LibraryExtended.getBookAnalytics('book_123');
console.log(analytics);
// {
//   totalPages: 400,
//   currentPage: 156,
//   progressPercent: "39.0",
//   daysAdded: 30,
//   readingDays: 15,
//   pagesPerDay: "10.4",
//   estimatedFinishDate: Date(2026-04-20),
//   notesCount: 3,
//   quotesCount: 5,
//   bookmarksCount: 8
// }

// Виведення результатів
console.log(`Прогрес: ${analytics.progressPercent}%`);
console.log(`Закінчу приблизно ${analytics.estimatedFinishDate.toLocaleDateString()}`);
```

---

## 🎨 ФУНКЦІЯ #7: Кастомізація Карточок

### Опис
Налаштування того, які дані показувати на карточках книг (назва, автор, прогрес тощо).

### API Функції

```javascript
// Встановити опції відображення
LibraryExtended.setCardDisplayOptions({
  title: true,
  author: true,
  genre: false,
  pages: true,
  progress: true,
  rating: true,
  cover: true,
  description: false,
  status: true
})

// Отримати поточні опції
LibraryExtended.getCardDisplayOptions()

// Встановити розмір карточок
LibraryExtended.setCardSize('large') // 'small', 'medium', 'large'
```

### Приклад

```javascript
// Приховати опис та жанр для компактного виду
LibraryExtended.setCardDisplayOptions({
  title: true,
  author: true,
  genre: false,
  description: false,
  progress: true
});

// Встановити великі карточки
LibraryExtended.setCardSize('large');

// Отримати поточні налаштування
const options = LibraryExtended.getCardDisplayOptions();
```

---

## 🔔 ФУНКЦІЯ #8: Смарт-Нагадування

### Опис
Автоматичні інтелігентні нагадування про книги, які потребують вашої уваги.

### API Функції

```javascript
// Отримати список активних нагадувань
LibraryExtended.getSmartReminders()
// Повертає: [
//   { type, bookId, message, priority }
// ]
```

### Типи Нагадувань

| Тип | Умова | Приклад |
|-----|-------|---------|
| `start_reading` | Книга в "бажаю прочитати" 3+ тиж | "📖 Книга вже 21 день на полиці" |
| `continue_reading` | Не оновлювали прогрес 7+ днів | "📚 Прерваль читання 7 днів тому" |

### Приклад

```javascript
// Отримання нагадувань
const reminders = LibraryExtended.getSmartReminders();

reminders.forEach(reminder => {
  console.log(`[${reminder.priority}] ${reminder.message}`);
});

// Результат:
// [high] 📖 "Harry Potter" вже очікує 35 днів на полиці
// [medium] 📚 "The Hobbit" - 9 днів без оновлень прогресу
```

---

## 📚 ФУНКЦІЯ #9: Колекції Книг

### Опис
Організуйте книги у власні колекції (например, "Улюблені автори", "До прочитання")

### API Функції

```javascript
// Створити колекцію
LibraryExtended.createCollection("Улюблені автори", "Книги моїх улюблених авторів")
// Повертає: { id, name, description, bookIds, createdAt }

// Додати книгу до колекції
LibraryExtended.addBookToCollection(collectionId, bookId)

// Отримати всі колекції
LibraryExtended.getCollections()
// Повертає: Array

// Отримати книги колекції
LibraryExtended.getCollectionBooks(collectionId)
// Повертає: Array
```

### Приклад

```javascript
// Створення колекції
const collection = LibraryExtended.createCollection(
  "Улюблені автори",
  "Книги авторів, які я люблю"
);

// Додавання книг до колекції
LibraryExtended.addBookToCollection(collection.id, 'book_123');
LibraryExtended.addBookToCollection(collection.id, 'book_456');

// Отримання всіх книг у колекції
const books = LibraryExtended.getCollectionBooks(collection.id);
console.log(`У колекції ${books.length} книг`);
```

---

## 👥 ФУНКЦІЯ #10: Порівняння з Друзями

### Опис
Дивіться як ви читаєте книгу в порівнянні з друзями.

### API Функції

```javascript
// Отримати статистику порівняння
LibraryExtended.getBookComparisonStats(bookId)
// Повертає: {
//   yourProgress: "45.5",
//   friendsCount: 3,
//   averageProgress: "32.1",
//   averageRating: "4.2",
//   yoursAhead: true,
//   yourRating: 5
// }
```

### Приклад

```javascript
const stats = LibraryExtended.getBookComparisonStats('book_123');

console.log(`Твій прогрес: ${stats.yourProgress}%`);
console.log(`У друзів в середньому: ${stats.averageProgress}%`);
console.log(`Ти ${stats.yoursAhead ? 'попереду' : 'позаду'} друзів`);

if (stats.friendsCount > 0) {
  console.log(`${stats.friendsCount} друзів читають цю книгу`);
}
```

---

## 🎬 Інтеграція з UI

### Рендеринг Компонентів

Всі компоненти перейду вже реалізовані в `library-extended-ui.js`:

```javascript
// Рендер панелі нотаток та цитат
LibraryExtendedUI.renderNotesPanel(bookId)

// Рендер панелі тегів
LibraryExtendedUI.renderTagsPanel(bookId)

// Рендер панелі подарунківліберарт
LibraryExtendedUI.renderGiftPanel(bookId)

// Рендер аналітики
LibraryExtendedUI.renderBookAnalytics(bookId)

// Рендер нагадувань
LibraryExtendedUI.renderSmartReminders()

// Рендер колекцій
LibraryExtendedUI.renderCollectionsPanel(bookId)

// Рендер порівняння з друзями
LibraryExtendedUI.renderFriendComparison(bookId)
```

---

## 💾 Зберігання Даних

### Структура Книги

Кожна книга тепер міститель нові властивості:

```javascript
{
  id: "book_...",
  title: "...",
  // ... базові властивості
  
  // Нові властивості:
  notes: [{ id, text, page, createdAt, updatedAt }],
  quotes: [{ id, text, page, isFavorite, createdAt }],
  bookmarks: [{ page, timestamp }],
  colorTags: [{ name, color, createdAt }],
  quickTags: ['обов_прочити', 'рекомендована'],
  gift: { isGift, from, occasion, date, thankYou, thankedDate },
  _lastProgressUpdate: "2026-04-06T..."
}
```

### localStorage
Всі дані автоматично зберігаються у localStorage за допомогою функції `saveBooksToLocalStorage()`.

---

## 📈 Статистика Реалізації

| Метрика | Значення |
|---------|----------|
| Функцій реалізовано | 10 |
| Рядків коду (функції) | 350+ |
| Рядків коду (UI) | 400+ |
| Компонентів UI | 7 |
| Документовано функцій | 10 |

---

## 🔄 Наступні Версії

Плановані функції (версія 2.1):
- 🔗 Серії та розділи книг
- 🎤 Голосові нотатки
- 📱 Синхронізація з мобільним
- 📥 Імпорт з Goodreads
- 🤖 AI рекомендації

---

## 🐛 Known Issues

Поточних помилок немає. Напишіть issue якщо знайшли проблеми.

---

## 📞 Підтримка

Для запитань та пропозицій звертайтесь до розробника.

**Версія:** 1.0.0  
**Дата:** 2026-04-06  
**Статус:** ✅ Стабільна
