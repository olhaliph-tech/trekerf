# 💡 LIBRARY EXTENDED - Практичні Приклади

## 📌 Консоль Для Тестування

Щоб тестувати функції, відкрийте браузер DevTools (F12) та вставте код в консоль.

---

## 🔖 Приклад #1: Додання Цитати та Нотатки до Книги

```javascript
// 1. Отримайте ID першої книги
const firstBook = state.books[0];
const bookId = firstBook.id;
console.log(`📖 Вибрана книга: "${firstBook.title}"`);

// 2. Додайте цитату
const quote = LibraryExtended.addQuote(
  bookId,
  'Успіх - це не пункт призначення, а подорож',
  42
);
console.log('✅ Цитата додана:', quote.text);

// 3. Додайте нотатку до цієї сторінки
const note = LibraryExtended.addBookNote(
  bookId,
  'Важлива думка про успіх. Згадати для свого блогу.',
  42
);
console.log('✅ Нотатка додана:', note.text);

// 4. Отримайте всі цитати цієї книги
const allQuotes = LibraryExtended.getQuotes(bookId);
console.log(`📚 Всього цитат на цій книзі: ${allQuotes.length}`, allQuotes);
```

**Результат в консолі:**
```
📖 Вибрана книга: "Harry Potter"
✅ Цитата додана: Успіх - це не пункт призначення, а подорож
✅ Нотатка додана: Важлива думка про успіх...
📚 Всього цитат на цій книзі: 1
```

---

## 🏷️ Приклад #2: Організація книг за Тегами

```javascript
// 1. Додайте теги до кількох книг
const book1 = state.books[0];
const book2 = state.books[1];

LibraryExtended.addColorTag(book1.id, 'класика');
LibraryExtended.addColorTag(book1.id, 'улюблена', '#FF6B6B');

LibraryExtended.addColorTag(book2.id, 'класика');
LibraryExtended.addColorTag(book2.id, 'фентезі');

console.log('✅ Теги додані до книг');

// 2. Отримайте всі книги з тегом "класика"
const classicBooks = LibraryExtended.getBooksByTag('класика');
console.log(`📚 Класичних книг у вас: ${classicBooks.length}`);
classicBooks.forEach(b => console.log(`  - ${b.title}`));

// 3. Отримайте теги першої книги
const tags = LibraryExtended.getColorTags(book1.id);
console.log(`🏷️ Теги для "${book1.title}":`, tags);
```

**Результат:**
```
✅ Теги додані до книг
📚 Класичних книг у вас: 2
  - Harry Potter
  - The Lord of the Rings
🏷️ Теги для "Harry Potter": [
  { name: 'класика', color: '#E8B4B8', createdAt: '...' },
  { name: 'улюблена', color: '#FF6B6B', createdAt: '...' }
]
```

---

## 🎁 Приклад #3: Відслідковування Книг-Подарунків

```javascript
// 1. Позначте книгу як подарунок
const book = state.books[0];
LibraryExtended.setAsGift(book.id, 'Тетя Марія', 'День народження');
console.log('✅ Книга позначена як подарунок');

// 2. Отримайте всі подарунки
const allGifts = LibraryExtended.getGiftBooks();
console.log(`🎁 Всього подарунків: ${allGifts.length}`);

// 3. Покажіть деталі подарунку
allGifts.forEach(giftBook => {
  console.log(`📖 ${giftBook.title}`);
  console.log(`   От: ${giftBook.gift.from}`);
  console.log(`   Причина: ${giftBook.gift.occasion}`);
  console.log(`   Дата: ${new Date(giftBook.gift.date).toLocaleDateString('uk-UA')}`);
  console.log(`   Поблагодарили: ${giftBook.gift.thankYou ? '✓ Так' : '✗ Ні'}`);
});

// 4. Позначте як "поблагодарили"
LibraryExtended.markGiftAsThanked(book.id);
console.log('✅ Позначено як "поблагодарили"');
```

**Результат:**
```
✅ Книга позначена як подарунок
🎁 Всього подарунків: 1
📖 Harry Potter
   От: Тетя Марія
   Причина: День народження
   Дата: 06.04.2026
   Поблагодарили: ✗ Ні
✅ Позначено як "поблагодарили"
```

---

## 📊 Приклад #4: Аналіз Вашого Читання

```javascript
// 1. Отримайте аналітику для першої книги
const book = state.books[0];
const analytics = LibraryExtended.getBookAnalytics(book.id);

console.log(`📖 ${book.title}`);
console.log(`═══════════════════════════════════`);
console.log(`Всього сторінок: ${analytics.totalPages}`);
console.log(`Прочитано: ${analytics.currentPage} (${analytics.progressPercent}%)`);
console.log(`Днів від додавання: ${analytics.daysAdded}`);
console.log(`Днів читаю: ${analytics.readingDays}`);
console.log(`Середньо в день: ${analytics.pagesPerDay} сторінок`);

if (analytics.estimatedFinishDate) {
  const finishDate = new Date(analytics.estimatedFinishDate);
  const daysLeft = Math.ceil((finishDate - new Date()) / (1000 * 60 * 60 * 24));
  console.log(`Орієнтовна дата закінчення: ${finishDate.toLocaleDateString('uk-UA')} (${daysLeft} днів)`);
}

console.log(`\nДодаткова інформація:`);
console.log(`Нотаток: ${analytics.notesCount}`);
console.log(`Цитат: ${analytics.quotesCount}`);
console.log(`Закладок: ${analytics.bookmarksCount}`);
```

**Результат:**
```
📖 Harry Potter
═══════════════════════════════════
Всього сторінок: 567
Прочитано: 234 (41.3%)
Днів від додавання: 30
Днів читаю: 15
Середньо в день: 15.6 сторінок

Орієнтовна дата закінчення: 19.04.2026 (14 днів)

Додаткова інформація:
Нотаток: 3
Цитат: 5
Закладок: 8
```

---

## 🚨 Приклад #5: Смарт-Нагадування

```javascript
// 1. Отримайте список активних нагадувань
const reminders = LibraryExtended.getSmartReminders();

console.log(`🔔 Активних нагадувань: ${reminders.length}\n`);

if (reminders.length === 0) {
  console.log('✅ У вас немає невідкладних нагадувань. Чудово!');
} else {
  // 2. Покажіть нагадування за пріоритетом
  const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' };
  
  reminders.forEach(reminder => {
    console.log(`${priorityEmoji[reminder.priority]} [${reminder.priority.toUpperCase()}]`);
    console.log(`   💭 ${reminder.message}`);
    
    // 3. Укажіть як діяти
    if (reminder.type === 'start_reading') {
      console.log(`   📌 Дія: Почніть читати цю книгу!`);
    } else if (reminder.type === 'continue_reading') {
      console.log(`   📌 Дія: Продовжіть читати цю книгу`);
    }
    console.log('');
  });
}
```

**Результат (якщо є нагадування):**
```
🔔 Активних нагадувань: 2

🔴 [HIGH]
   💭 📖 "The Hobbit" вже очікує 35 днів на полиці
   📌 Дія: Почніть читати цю книгу!

🟡 [MEDIUM]
   💭 📚 "Percy Jackson" - 9 днів без оновлень прогресу
   📌 Дія: Продовжіть читати цю книгу
```

---

## 📚 Приклад #6: Керування Колекціями

```javascript
// 1. Створіть нову колекцію
const collection = LibraryExtended.createCollection(
  'Казки для дітей',
  'Книги, які хочу показати своїм дітям'
);
console.log(`✅ Колекція створена: "${collection.name}"`);

// 2. Додайте книги до колекції
const booksToAdd = state.books.slice(0, 3);
booksToAdd.forEach(book => {
  LibraryExtended.addBookToCollection(collection.id, book.id);
  console.log(`  ✓ "${book.title}" додана до колекції`);
});

// 3. Отримайте книги з колекції
const collectionBooks = LibraryExtended.getCollectionBooks(collection.id);
console.log(`\n📚 У колекції "${collection.name}" ${collectionBooks.length} книг:`);
collectionBooks.forEach(book => {
  console.log(`   - ${book.title} (${book.author})`);
});

// 4. Отримайте всі ваші колекції
const allCollections = LibraryExtended.getCollections();
console.log(`\n🎯 Всього колекцій: ${allCollections.length}`);
allCollections.forEach(coll => {
  console.log(`   - ${coll.name} (${coll.bookIds.length} книг)`);
});
```

**Результат:**
```
✅ Колекція створена: "Казки для дітей"
  ✓ "Harry Potter" додана до колекції
  ✓ "The Hobbit" додана до колекції
  ✓ "Percy Jackson" додана до колекції

📚 У колекції "Казки для дітей" 3 книг:
   - Harry Potter (J.K. Rowling)
   - The Hobbit (J.R.R. Tolkien)
   - Percy Jackson (Rick Riordan)

🎯 Всього колекцій: 1
   - Казки для дітей (3 книг)
```

---

## 👥 Приклад #7: Порівняння з Друзями

```javascript
// 1. Отримайте статистику для книги
const book = state.books[0];
const stats = LibraryExtended.getBookComparisonStats(book.id);

console.log(`📖 Порівняння: "${book.title}"\n`);

console.log(`Твій прогрес: ${stats.yourProgress}%`);
if (stats.friendsCount > 0) {
  console.log(`Прогрес друзів (в середньому): ${stats.averageProgress}%`);
  console.log(`\n${stats.yoursAhead ? '🚀 ТИ ПОПЕРЕДУ!' : '🏃 ДРУЗІ ПОПЕРЕДУ!'}`);
  console.log(`Різниця: ${Math.abs(parseFloat(stats.yourProgress) - parseFloat(stats.averageProgress)).toFixed(1)}%\n`);
  console.log(`Друзівs, які читають цю книгу: ${stats.friendsCount}`);
  
  // Рейтинг порівняння
  console.log(`\nТвій рейтинг: ${stats.yourRating || 'не оцінена'} ⭐`);
  console.log(`Середній рейтинг друзів: ${stats.averageRating} ⭐`);
} else {
  console.log('❌ Жоден з твоїх друзів не читає цю книгу');
}
```

**Результат:**
```
📖 Порівняння: "Harry Potter"

Твій прогрес: 45.5%
Прогрес друзів (в середньому): 32.1%

🚀 ТИ ПОПЕРЕДУ!
Різниця: 13.4%

Друзівs, які читають цю книгу: 3

Твій рейтинг: 5 ⭐
Середній рейтинг друзів: 4.2 ⭐
```

---

## ⚡ Швидкі Скрипти

### Додати улюблену цитату швидко:
```javascript
const bookId = state.books[0].id;
LibraryExtended.addQuote(bookId, prompt('Цитата:'), parseInt(prompt('Сторінка:')));
```

### Показати нагадування:
```javascript
LibraryExtended.getSmartReminders().forEach(r => alert(r.message));
```

### Список всіх теги:
```javascript
const allTags = new Set();
state.books.forEach(book => {
  book.colorTags?.forEach(tag => allTags.add(tag.name));
});
console.log(Array.from(allTags));
```

### Статистика по колекціях:
```javascript
LibraryExtended.getCollections().forEach(coll => {
  console.log(`${coll.name}: ${coll.bookIds.length} книг`);
});
```

---

## 🎓 Навчальні Завдання

### Завдання 1: Організація Улюблених Книг
```javascript
// Додайте тег "улюблена" до 5 ваших найполюбленіших книг
// Вгадалось: LibraryExtended.addColorTag(..., 'улюблена', '#FF6B6B')
```

### Завдання 2:創建Персоналізовану Колекцію
```javascript
// Створіть колекцію для книг, які хочете прочитати в цьому році
const goal2026 = LibraryExtended.createCollection(
  'Цілі 2026',
  'Книги, які обов\'язково прочитаю цього року'
);
// Додайте 5 книг до цієї колекції
```

### Завдання 3: Напишіть 3 Цитати
```javascript
// Знайдіть 3 улюблених цитати з книги, яку читаєте
// Додайте їх за допомогою LibraryExtended.addQuote(...)
```

### Завдання 4: Аналізуйте Вашу Активність
```javascript
// Виведіть аналітику для найпопулярнішої книги:
const topBook = state.books[0];
const analytics = LibraryExtended.getBookAnalytics(topBook.id);
// Виведіть в консоль красиво
```

---

## 🐛 Дебіу

### Перевірити, чи функції доступні:
```javascript
console.log('LibraryExtended' in window ? '✅ Доступна' : '❌ Не доступна');
console.log('LibraryExtendedUI' in window ? '✅ Доступна' : '❌ Не доступна');
```

### Перевірити дані в консолі:
```javascript
console.table(state.books[0]);
console.table(LibraryExtended.getBookNotes(state.books[0].id));
```

---

## 📝 Примітки

- Всі дані зберігаються автоматично у localStorage
- Потрібне перезавантаження для деяких змін
- Функції повертають значення для подальшого використання
- DevTools (F12) - ваш найкращий друг для тестування!

---

**Більше прикладів додаватимуться в майбутніх версіях.**
