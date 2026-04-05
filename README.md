# 📚 Трекер читання (Reading Tracker) v2.1

[![GitHub stars](https://img.shields.io/github/stars/olhaliph-tech/trekerf?style=flat)](https://github.com/olhaliph-tech/trekerf)
[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green.svg)](https://nodejs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-blueviolet.svg)](manifest.json)

**Вимерлива крос-платформна програма для отримання статистики читання с помітками, оцінками та спільнотою.**

🔗 **[GitHub Репозиторій](https://github.com/olhaliph-tech/trekerf)** • 📖 **[Посібник](QUICK_START.md)** • 🌐 **[Демо](http://localhost:3000)** (локально)

---

## ✨ Основні можливості

### 📖 Управління книгами
- ❤️ **Улюблені** книги
- 🏷️ **Теги** для організації  
- 📅 **Розписання читання** з датами (старт, кінець, сторінок на день)
- 📊 **Три режими перегляду**: картки, список, таблиця
- 🖼️ **Обкладинки** з önigma fallback

### 📝 Записи, Оцінки, Відгуки
- 📝 **Заметки** до кожної книги (багато заміток на книгу)
- ⭐ **Оцінки** (1-5 зірок, тільки для прочитаних)
- ✍️ **Текстові відгуки** з датою
- 🗑️ **Редагування й видалення** заміток

### 👥 Спільнота
- 🏆 **Топ популярних книг** (за оцінками, читачами)
- 🔥 **Тренди** (книги, що читаються зараз)
- 👑 **Топ читачів** (за кількістю прочитаних книг)
- 📲 **Активні читачі** (прямо зараз)
- ✨ **Персоналізовані рекомендації** (за жанром, автором)

### 🎨 Персоналізація
- 🌙 **5 кольорових тем** (Світла, Темна, Синя, Бордова, Зелена)
- 🔤 **3 розміри шрифту** (малий, звичайний, великий)
- 🌍 **3 мови** (Українська 🇺🇦, Англійська 🇬🇧, Російська 🇷🇺)

### 📊 Аналітика
- 📈 **Гістограма прогресу** (сторінки за час)
- 📅 **Календар прочитанання** (сторінки в день)
- 🎯 **Жанри по % прочитано**
- 👨‍✍️ **Топ авторів** (кількість книг)
- 🏆 **Персональні рекорди** (максимум сторінок на сесію)

### ⌨️ Додатково
- 🔌 **Service Worker** (працює офлайн)
- 📱 **PWA** (встановлюється як програма)
- 💾 **localStorage** персистенція (5-10MB)
- ⌨️ **10 гарячих клавіш** (Alt+N, Alt+S, Alt+A тощо)
- 🔒 **Локальна безпека** (все на вашому пристрої)

---

## 📋 Версія 2.1 - Що нового?

### Додано в v2.1  
1. ✨ **Система заміток** на всі книги
2. ⭐ **Оцінка 1-5 зірок** з валідацією
3. ✍️ **Текстові відгуки** з дат
4. 🔄 **Повна переробка спільноти** (5 видів метрик)
5. 📊 **Топ читачів** (лідербордпо прогресу)
6. 😱 **Персоналізовані рекомендації**

### Попередні версії
- **v2.0**: Друзі, клубиж опросы, 4 графіки, темы
- **v1.0**: Базова функціональність (книги, прямий прогрес)

---

## 🚀 Швидкий старт

### Вимоги
- **Node.js** v14+
- **npm** або **yarn**
- **Браузер** (Chrome, Firefox, Safari, Edge)

### Встановлення

```bash
# 1. Клонувати репозиторій
git clone https://github.com/olhaliph-tech/trekerf.git
cd trekerf

# 2. Встановити залежності (якщо потрібні)
npm install

# 3. Запустити сервер
npm start
# або
node server.js

# 4. Відкрити в браузері
# http://localhost:3000
```

### Використання без сервера
Сайт працює і без сервера — просто відкрийте `index.html` в браузері!  
(Функціональність найповніша з Express backend)

---

## 📁 Структура проекту

```
trekerf/
├── index.html                  # Головна сторінка
├── server.js                   # Express сервер
├── app.js                      # Express додаток
├── package.json                # На залежності
├── manifest.json               # PWA конфіг
├── service-worker.js           # Офлайн робота
├── style.css                   # Основні стилі
├── style-extended.css          # Розширені компоненти
│
├── js/                         # JavaScript модулі
│   ├── main.js                 # Точка входу
│   ├── state.js                # Управління станом
│   ├── storage.js              # localStorage обгортка
│   ├── ui.js                   # UI компоненти
│   ├── utils.js                # Утиліти
│   ├── library.js              # CRUD операції
│   ├── library-extended.js     # Розширена функціональність
│   ├── reading.js              # Отримання прогресу
│   ├── init-*.js               # Модулі ініціалізації (7 файлів)
│   │   ├── init-notes-ratings-reviews.js     # Заметки, оцінки
│   │   ├── init-community-new.js             # Спільнота
│   │   ├── init-favorites-tags.js            # # Улюблені, теги
│   │   ├── init-settings.js                  # Параметри, теми
│   │   ├── ...
│   └── ...
│
├── data/                       # Приклади даних
│   ├── books.json
│   ├── folders.json
│   └── sessions.json
│
└── docs/                       # Документація
    ├── QUICK_START.md          # Гайд для користувачів
    ├── QUICK_START_NOTES_RATINGS.md
    ├── NOTES_RATINGS_REVIEWS_GUIDE.md
    ├── TECHNICAL_NOTES_RATINGS_SUMMARY.md
    ├── README_UK.md            # Розширений README
    └── ... (8+ інших документів)
```

---

## 🎮 Гарячі клавіши

| Клавіша | Дія |
|---------|-----|
| **Alt+N** | Друга нова книга |
| **Alt+S** | Відкрити параметри |
| **Alt+A** | Додати на закладку |
| **Alt+H** | Додому |
| **Alt+U** | Мої улюблені |
| **Alt+T** | Показати теги |
| **Alt+W** | Закладки (wishlist) |
| **Alt+C** | Спільнота |
| **Alt+L** | Друзі |
| **Alt+F** | Пошук друзів |

---

## 📊 API Функції

### Книги
```javascript
// Управління
addBook(title, author, genre, status, pages, currentPage)
updateBook(bookId, updates)
deleteBook(bookId)
getBook(bookId)
getAllBooks()

// Улюблені
toggleFavorite(bookId)
getFavoriteBooks()

// Теги
addTag(bookId, tag)
removeTag(bookId, tag)
getBooksByTag(tag)
```

### Заметави 📝
```javascript
// Заметки
addNote(bookId, noteText)
removeNote(bookId, noteId)
editNote(bookId, noteId, newText)
getNotesByBook(bookId)

// Оцінки
setBookRating(bookId, rating)  // 1-5 зірок
getBookRating(bookId)

// Відгуки
setBookReview(bookId, reviewText)
getBookReview(bookId)
getBookReviewDate(bookId)
```

### Спільнота 👥
```javascript
// Огляд
getCommunityBooks()

// Лідерборди
getTopPopularBooks(limit=5)
getTopReaders(limit=5)
getActiveReaders(limit=5)

// Тренди
getReadingTrends(limit=5)
getRecommendations(limit=5)
```

### Аналітика 📊
```javascript
getReadingProgress()
getReadingStats()
getTopAuthors(limit)
getTopGenres(limit)
getPersonalRecords()
getReadingCalendar()
```

---

## 🎨 Теми

Виберіть från 5 вбудованих тем:

1. **Світла** 🌅 - білий фон, темний текст
2. **Темна** 🌙 - темний фон, світлий текст
3. **Синя** 🔵 - синій акцент, прохолодна палітра
4. **Бордова** 💜 - бордова акцент, теплі тони
5. **Зелена** 💚 - зелена акцент, природний світ

Налаштування збереживаються автоматично!

---

## 🌍 Многоязичність

Додаток вже має 3 мови:
- 🇺🇦 **Українська** (за замовчанням)
- 🇬🇧 **Englishish** (English)
- 🇷🇺 **Російська** (Русский)

Всі тексти засоповані в `js/utils.js` у об'єкті `translations`.

---

## 📱 PWA (Progressive Web App)

Додаток можна встановити як програму:

1. **На комп'ютері**: Натисніть 🔧 у адресному рядку → "Встановити додаток"
2. **На мобільному**: Меню → "Додати на екран" або "Встановити"

**Переваги:**
- ⚡ Швидке завантаження
- 🔌 Робота без інтернету
- 💾 Займає мало місця (~10MB)
- 📌 Прямий доступ з екрана

---

## 🔐 Безпека та Приватність

✅ **Всі дані зберігаються локально** — немає передачі на сервер  
✅ **Ніякої реклами** — чиста функціональність  
✅ **Ніяких трекерів** — повна приватність  
✅ **Офлайн робота** — Service Worker кешує все  

Дружніший з вашою конфіденційністю, ніж більшість додатків!

---

## 🛠️ Для розробників

### Добавленя нової функції

1. **Створіть модуль**
   ```bash
   touch js/init-my-feature.js
   ```

2. **Напишіть функції**
   ```javascript
   function myFeatureFunction() {
     // Ваш код
     saveToStorage(); // зберегти в localStorage
   }
   ```

3. **Підключіть у HTML**
   ```html
   <script src="js/init-my-feature.js"></script>
   ```

4. **Оновіть документацію**

### Архітектура

- **Модулі `init-*.js`** — окремо логіку для кожного блоку
- **`state.js`** — глобальне управління станом
- **`storage.js`** — обгортка для localStorage
- **`ui.js`** — рендеринг компонентів
- **`utils.js`** — утиліти (дата, текст, переклади)

### Тестування

Див. [TESTING.md](TESTING.md) для матриці тестування (15+ сценаріїв).

---

## 📝 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) для деталей.

---

## 🤝 Контрибуція

Витяги приймаються! Для великих змін:

1. **Fork** репозиторій
2. **Создайте** гілку (`git checkout -b feature/MyFeature`)
3. **Commit** змі (`git commit -m 'Add MyFeature'`)
4. **Push** гілку (`git push origin feature/MyFeature`)
5. **Відкрийте** Pull Request

---

## 👨‍💻 Автор

- **GitHub**: [@olhaliph-tech](https://github.com/olhaliph-tech)
- **Проект**: Reading Tracker

---

## 📞 Підтримка

Знайшли баг? Маєте ідею?

1. **GitHub Issues**: [Створити issue](https://github.com/olhaliph-tech/trekerf/issues)
2. **Документація**: [QUICK_START.md](QUICK_START.md)
3. **Технічне**: [TECHNICAL_NOTES_RATINGS_SUMMARY.md](TECHNICAL_NOTES_RATINGS_SUMMARY.md)

---

## 📈 Що дальше? (v3.0)

**В планах для майбутніх версій:**
- ☐ Облачна синхронізація (Firebase)
- ☐ AI рекомендації
- ☐ Реальні друзі (backend)
- ☐ Мобільне додаток (React Native)
- ☐ OpenLibrary інтеграція  
- ☐ Форум спільноти
- ☐ Аудіокниги
- ☐ Генерація мерча

---

<div align="center">

**Made with ❤️ for book lovers** 📚

⭐ Якщо вам подобається проект, поставте зірку!

[GitHub](https://github.com/olhaliph-tech/trekerf) • [Issues](https://github.com/olhaliph-tech/trekerf/issues) • [Discussions](https://github.com/olhaliph-tech/trekerf/discussions)

</div>
