# 📚 Повний Перелік Функцій - Reading Tracker v2.1

**Версія:** 2.1.0  
**Дата:** 2024  
**Всього функцій:** 130+

---

## 📖 Зміст

1. [📕 Управління книгами](#1--управління-книгами)
2. [📝 Заметки, оцінки, відгуки](#2--заметки-оцінки-відгуки)
3. [👥 Спільнота](#3--спільнота)
4. [📊 Аналітика](#4--аналітика)
5. [⏱️ Сесії читання](#5--сесії-читання)
6. [✨ Цитати та закладки](#6--цитати-та-закладки)
7. [🏷️ Теги та маркування](#7--теги-та-маркування)
8. [🎁 Подарунки](#8--подарунки)
9. [🗂️ Колекції](#9--колекції)
10. [🏆 Досягнення та рейтинги](#10--досягнення-та-рейтинги)
11. [🎯 Цілі та завдання](#11--цілі-та-завдання)
12. [👤 Профіль та користувачі](#12--профіль-та-користувачі)
13. [🎨 Тема та UI](#13--тема-та-ui)
14. [📂 Папки](#14--папки)
15. [🔧 Утиліти](#15--утиліти)
16. [💾 Зберігання](#16--зберігання)
17. [⚙️ Кеширування](#17--кеширування)

---

## 1️⃣ **Управління книгами**

### Основні операції

| Функція | Файл | Опис |
|---------|------|------|
| **`addBook(book)`** | library.js | Додати нову книгу (з сервером) |
| **`editBook(bookId, updates)`** | library.js | Редагувати дані книги |
| **`deleteBook(bookId)`** | library.js | Видалити книгу (м'яке видалення) |
| **`getBookById(bookId)`** | utils.js | Отримати книгу по ID |
| **`markBookAsDeleted(bookId)`** | library.js | Позначити як видалену |
| **`unmarkBookAsDeleted(bookId)`** | library.js | Скасувати видалення |
| **`getDeletedBooksIds()`** | library.js | Отримати список видалених |

### Статус та папки

| Функція | Файл | Опис |
|---------|------|------|
| **`updateBookStatus(bookId, newStatus)`** | library.js | Змінити статус (примітка, читаю, прочитано) |
| **`updateBookFolder(bookId, folderId)`** | library.js | Перемістити в папку |
| **`updateBookCurrentPage(bookId, page)`** | library.js | Оновити поточну сторінку |

### Фільтрування та пошук

| Функція | Файл | Опис |
|---------|------|------|
| **`getFilteredBooks(folderId, status, searchQuery)`** | library.js | Фільтрування по папці, статусу, пошуку |
| **`getEnhancedLibraryBooks(folderId, status, search, sortKey)`** | features.js | Розширене фільтрування з сортуванням |
| **`getSortedBooks(books, sortKey)`** | features.js | Сортування книг (по даті, назві, автору) |
| **`placeholderBook(item)`** | library.js | Отримати placeholder для невідомої книги |

### Завантаження/зберігання

| Функція | Файл | Опис |
|---------|------|------|
| **`loadBooksFromLocalStorage()`** | library.js | Завантажити з localStorage |
| **`saveBooksToLocalStorage()`** | library.js | Зберегти в localStorage |
| **`loadBooksFromServer()`** | library.js | Синхронізація з сервером |

---

## 2️⃣ **Заметки, оцінки, відгуки**

### Заметки / Notes

| Функція | Файл | Опис |
|---------|------|------|
| **`addNote(bookId, noteText)`** | init-notes-ratings-reviews.js | Додати заметку до книги |
| **`removeNote(bookId, noteId)`** | init-notes-ratings-reviews.js | Видалити заметку |
| **`editNote(bookId, noteId, newText)`** | init-notes-ratings-reviews.js | Редагувати заметку |
| **`getNotesByBook(bookId)`** | init-notes-ratings-reviews.js | Отримати всі заметки книги |
| **`renderNotesUI(bookId)`** | init-notes-ratings-reviews.js | Рендер UI для заміток |

### Оцінки / Ratings

| Функция | Файл | Опис |
|---------|------|------|
| **`setBookRating(bookId, rating)`** | init-notes-ratings-reviews.js | Встановити оцінку (1-5 зірок) |
| **`getBookRating(bookId)`** | init-notes-ratings-reviews.js | Отримати оцінку |
| **`renderRatingInput(bookId, currentRating)`** | init-notes-ratings-reviews.js | Рендер вибору оцінки |
| **`addRating(bookId, rating)`** | features.js | Додати оцінку (старий API) |
| **`getRating(bookId)`** | features.js | Отримати оцінку (старий API) |
| **`renderStars(rating)`** | features.js | Рендер зірок |

### Відгуки / Reviews

| Функція | Файл | Опис |
|---------|------|------|
| **`setBookReview(bookId, reviewText)`** | init-notes-ratings-reviews.js | Написати відгук |
| **`getBookReview(bookId)`** | init-notes-ratings-reviews.js | Отримати текст відгуку |
| **`getBookReviewDate(bookId)`** | init-notes-ratings-reviews.js | Отримати дату відгуку |
| **`addReview(bookId, text, rating)`** | features.js | Додати відгук (старий API) |
| **`getReviews(bookId)`** | features.js | Отримати всі відгуки |
| **`deleteReview(reviewId)`** | features.js | Видалити відгук |
| **`renderReviews(bookId)`** | features.js | Рендер списку відгуків |
| **`renderReviewUI(bookId, book)`** | init-notes-ratings-reviews.js | Рендер UI для відгуків |

---

## 3️⃣ **Спільнота**

### Дані спільноти

| Функція | Файл | Опис |
|---------|------|------|
| **`getCommunityBooks()`** | init-community-new.js | Агрегація даних всіх користувачів |
| **`getGlobalCommunityData()`** | community.js | Глобальна статистика спільноти |
| **`getActivityFeed(limit, filterUserId)`** | community.js | Лента активності |

### Рейтинги та тренди

| Функція | Файл | Опис |
|---------|------|------|
| **`getTopPopularBooks(limit=5)`** | init-community-new.js | 🏆 Топ популярних книг (оцінки, читачі) |
| **`getReadingTrends(limit=5)`** | init-community-new.js | 🔥 Тренди читання (книги зараз) |
| **`getTopReaders(limit=5)`** | init-community-new.js | 👑 Топ читачів (по прочитаном) |
| **`getActiveReaders(limit=5)`** | init-community-new.js | 📲 Активні читачі (сейчас) |
| **`getRecommendations(limit=5)`** | init-community-new.js | ✨ Рекомендації (жанр/автор) |

### Взаємодія в спільноті

| Функція | Файл | Опис |
|---------|------|------|
| **`createActivityRecord(type, text, bookId)`** | community.js | Створити запис активності |
| **`toggleReaction(postId, reactionType)`** | community.js | Добавити/видалити реакцію |
| **`addComment(postId, text)`** | community.js | Добавити коментар до поста |
| **`getReactionCounts(postId)`** | community.js | Отримати кількість реакцій |
| **`getActivityById(activityId)`** | utils.js | Отримати активність по ID |

### Слідкування за користувачами

| Функція | Файл | Опис |
|---------|------|------|
| **`followUser(userId)`** | features.js | Підписатись на користувача |
| **`unfollowUser(userId)`** | features.js | Відписатись від користувача |
| **`isFollowing(userId)`** | features.js | Перевірити підписку |
| **`toggleFollow(targetId)`** | ui.js | Перемикач підписки |

### Рендер спільноти

| Функция | Файл | Опис |
|---------|------|------|
| **`renderFeed()`** | ui.js | Основна лента спільноти |
| **`renderTopBooksSection()`** | init-community-new.js | Рендер топ книг |
| **`renderTrendsSection()`** | init-community-new.js | Рендер трендів |
| **`renderTopReadersSection()`** | init-community-new.js | Рендер топ читачів |
| **`renderActiveReadersSection()`** | init-community-new.js | Рендер активних користувачів |
| **`renderRecommendationsSection()`** | init-community-new.js | Рендер рекомендацій |
| **`attachCommunityEventHandlers()`** | init-community-new.js | Прив'язка подій спільноти |
| **`attachFeedEvents()`** | ui.js | Прив'язка подій ленти |
| **`renderFeedItemsHtml(items, reactionEmojis)`** | ui.js | HTML фідів |

---

## 4️⃣ **Аналітика**

### Основна статистика

| Функція | Файл | Опис |
|---------|------|------|
| **`getAnalyticsData()`** | analytics.js | Усі аналітичні дані |
| **`getReadingStats()`** | читання - калькуляція | Базова статистика |
| **`getReadingStreak(readingDays)`** | analytics.js | Обчислити серію читання |

### Прогрес та календар

| Функція | Файл | Опис |
|---------|------|------|
| **`getMonthlyProgress()`** | analytics.js | Прогрес по місяцях |
| **`getCalendarData(year, month)`** | analytics.js | Дані календаря читання |
| **`getReadingProgress()`** | - | Поточний прогрес читання |

### За жанрами та авторами

| Функція | Файл | Опис |
|---------|------|------|
| **`getGenreStats()`** | features.js | Статистика по жанрам |
| **`renderGenreStats()`** | features.js | Рендер графіка жанрів |
| **`getBookRecommendations(limit=5)`** | features.js | Рекомендації по жанрах/авторах |
| **`getGenreColor(genre)`** | features.js | Колір жанру |
| **`renderGenreTag(genre)`** | features.js | HTML тег жанру |

### Рекорди та досягнення

| Функція | Файл | Опис |
|---------|------|------|
| **`getPersonalRecords()`** | - | Персональні рекорди |
| **`getLongestReadingStreak()`** | reading.js | Найдовша серія читання |

### Рендер аналітики

| Функция | Файл | Опис |
|---------|------|------|
| **`renderAnalytics()`** | ui.js | Основна сторінка аналітики |
| **`buildStatCards()`** | analytics.js | HTML карточек статистики |

---

## 5️⃣ **Сесії читання**

### Управління сесіями

| Функція | Файл | Опис |
|---------|------|------|
| **`startReadingSession(book, startPage)`** | reading.js | Почати сесію читання |
| **`toggleReadingTimer(book)`** | reading.js | Вмикнути/вимкнути таймер |
| **`finishReadingSession(book, endPage)`** | reading.js | Завершити сесію |
| **`cancelReadingSession(book)`** | reading.js | Скасувати сесію |

### Статистика сесій

| Функція | Файл | Опис |
|---------|------|------|
| **`getSessionStats()`** | reading.js | Статистика всіх сесій |
| **`getSessionsByBook(bookId)`** | utils.js | Отримати сесії книги |
| **`saveSessionToServer(session)`** | reading.js | Синхронізація з сервером |
| **`loadSessionsFromServer(bookId)`** | reading.js | Завантажити з сервера |

### Рендер та форматування

| Функія | Файл | Опис |
|---------|------|------|
| **`formatSessionTime(ms)`** | ui.js | Форматування часу сесії |
| **`renderSessionLog(book)`** | ui.js | Історія сесій книги |

---

## 6️⃣ **Цитати та закладки**

### Цитати

| Функція | Файл | Опис |
|---------|------|------|
| **`addQuote(bookId, text, pageNumber=0)`** | library-extended.js | Додати цитату |
| **`getQuotes(bookId)`** | library-extended.js | Отримати всі цитати |
| **`getBookmarks(bookId)`** | library-extended.js | Отримати закладки (цитати) |

### Улюблені цитати

| Функія | Файл | Опис |
|---------|------|------|
| **`toggleFavoriteQuote(bookId, quoteId)`** | library-extended.js | Позначити збережену |

### Рендер

| Функія | Файл | Опис |
|---------|------|------|
| **`initQuotesHandlers()`** | library-extended-handlers.js | Прив'язка подій цитат |

---

## 7️⃣ **Теги та маркування**

### Кольорові теги

| Функція | Файл | Опис |
|---------|------|------|
| **`addColorTag(bookId, tagName, color=null)`** | library-extended.js | Додати кольоровий тег |
| **`getColorTags(bookId)`** | library-extended.js | Отримати кольорові теги |
| **`removeColorTag(bookId, tagName)`** | library-extended.js | Видалити тег |
| **`getBooksByTag(tagName)`** | library-extended.js | Пошук книг по тегу |

### Швидкі теги

| Функція | Файл | Опис |
|---------|------|------|
| **`addQuickTag(bookId, quickTagKey)`** | library-extended.js | Додати швидкий тег |
| **`removeQuickTag(bookId, quickTagKey)`** | library-extended.js | Видалити швидкий тег |
| **`getQuickTags(bookId)`** | library-extended.js | Отримати швидкі теги |

### Рендер та обробка

| Функція | Файл | Опис |
|---------|------|------|
| **`renderTagsPanel(bookId)`** | library-extended-ui.js | UI панель тегів |
| **`initTagsHandlers()`** | library-extended-handlers.js | Обробка подій тегів |

---

## 8️⃣ **Подарунки**

### Управління подарунками

| Функція | Файл | Опис |
|---------|------|------|
| **`setAsGift(bookId, fromWho='', occasion='')`** | library-extended.js | Позначити як подарунок |
| **`markGiftAsThanked(bookId)`** | library-extended.js | Позначити дякував |
| **`getGiftBooks()`** | library-extended.js | Отримати подарунки |

### Рендер та обробка

| Функція | Файл | Опис |
|---------|------|------|
| **`renderGiftPanel(bookId)`** | library-extended-ui.js | UI подарунків |
| **`initGiftHandlers()`** | library-extended-handlers.js | Обробка подій подарунків |

---

## 9️⃣ **Колекції**

### CRUD операції

| Функція | Файл | Опис |
|---------|------|------|
| **`createCollection(name, description='')`** | library-extended.js | Створити колекцію |
| **`getCollections()`** | library-extended.js | Отримати всі колекції |
| **`getCollectionBooks(collectionId)`** | library-extended.js | Книги в колекції |
| **`addBookToCollection(collectionId, bookId)`** | library-extended.js | Додати книгу до колекції |

### Рендер та обробка

| Функція | Файл | Опис |
|---------|------|------|
| **`renderCollectionsPanel(bookId)`** | library-extended-ui.js | UI колекцій |
| **`initCollectionsHandlers()`** | library-extended-handlers.js | Обробка подій колекцій |

---

## 🔟 **Досягнення та рейтинги**

### Досягнення

| Функція | Файл | Опис |
|---------|------|------|
| **`checkAchievements()`** | features.js | Перевірити розблоковані досягнення |
| **`renderAchievements()`** | features.js | Рендер досягнень |

### Порівняння з друзями

| Функція | Файл | Опис |
|---------|------|------|
| **`getBookComparisonStats(bookId)`** | library-extended.js | Порівняння з друзями |
| **`renderFriendComparison(bookId)`** | library-extended-ui.js | UI порівняння |

---

## 1️⃣1️⃣ **Цілі та завдання**

### CRUD операції

| Функція | Файл | Опис |
|---------|------|------|
| **`addGoal(title, targetBooks, targetPages, createdAt=null)`** | features.js | Додати мету |
| **`updateGoal(goalId, updates)`** | features.js | Редагувати мету |
| **`deleteGoal(goalId)`** | features.js | Видалити мету |
| **`getGoalProgress(goal)`** | features.js | Прогрес мети |

### Рендер

| Функція | Файл | Опис |
|---------|------|------|
| **`renderGoals()`** | features.js | Рендер цілей |

---

## 1️⃣2️⃣ **Профіль та користувачі**

### Профіль

| Функція | Файл | Опис |
|---------|------|------|
| **`renderProfile()`** | ui.js | Сторінка профілю |
| **`initializeProfileFeatures()`** | init-profile.js | Ініціалізація профілю |
| **`getBookComparisonStats(bookId)`** | library-extended.js | Порівняння з іншими |

### Дані користувача

| Функція | Файл | Опис |
|---------|------|------|
| **`getGameStats()`** | - | Статистика гравця |
| **`getReadingProgress()`** | - | Прогрес читання |

---

## 1️⃣3️⃣ **Тема та UI**

### Теми

| Функція | Файл | Опис |
|---------|------|------|
| **`applyTheme(themeKey)`** | ui.js | Встановити тему |
| **`loadTheme()`** | ui.js | Завантажити тему з памяти |
| **`toggleThemePanel()`** | ui.js | Відкрити меню тем |

### Основний рендер

| Функція | Файл | Опис |
|---------|------|------|
| **`renderLibrary()`** | ui.js | Основна бібліотека |
| **`renderFolders()`** | ui.js | Список папок |
| **`openBookModal(bookId)`** | ui.js | Модальне вікно книги |
| **`closeModal()`** | ui.js | Закрити модаль |

### Редагування та налаштування

| Функія | Файл | Опис |
|---------|------|------|
| **`switchTab(tabName)`** | ui.js | Переключення табів модалі |
| **`renderBookEditForm(book)`** | ui.js | Форма редагування |
| **`setupCoverUpload()`** | ui.js | Завантаження обкладинки |
| **`setCardDisplayOptions(options)`** | library-extended.js | Опції відображення карт |
| **`getCardDisplayOptions()`** | library-extended.js | Отримати опції |
| **`setCardSize(size)`** | library-extended.js | Розмір карти |

### Навігація

| Функція | Файл | Опис |
|---------|------|------|
| **`switchPage(pageName)`** | ui.js | Переключення сторінки |

### Рендер розширених панелей

| Функія | Файл | Опис |
|---------|------|------|
| **`renderNotesPanel(bookId)`** | library-extended-ui.js | Панель заміток |
| **`renderBookAnalytics(bookId)`** | library-extended-ui.js | Аналітика книги |
| **`renderSmartReminders()`** | library-extended-ui.js | Розумні нагадування |

---

## 1️⃣4️⃣ **Папки**

### Управління папками

| Функія | Файл | Опис |
|---------|------|------|
| **`createFolder(folderName)`** | library.js | Створити папку |
| **`deleteFolder(folderId)`** | library.js | Видалити папку |
| **`loadFoldersFromServer()`** | library.js | Завантажити з сервера |

### Утиліти

| Функія | Файл | Опис |
|---------|------|------|
| **`getFolderName(folderId)`** | utils.js | Отримати ім'я папки |
| **`renderFolders()`** | ui.js | Рендер списку папок |

---

## 1️⃣5️⃣ **Утиліти**

### ID и дата

| Функія | Файл | Опис |
|---------|------|------|
| **`newId(prefix='id')`** | utils.js | Генерувати унікальний ID |
| **`formatDate(d)`** | utils.js | Форматування дати |

### Пошук по ID

| Функія | Файл | Опис |
|---------|------|------|
| **`getBookById(bookId)`** | utils.js | Знайти книгу |
| **`getActivityById(activityId)`** | utils.js | Знайти активність |
| **`getSessionsByBook(bookId)`** | utils.js | Знайти сесії книги |

### Реакції та коментарі

| Функія | Файл | Опис |
|---------|------|------|
| **`getReactionsByPost(postId)`** | utils.js | Реакції поста |
| **`getCommentsByPost(postId)`** | utils.js | Коментарі поста |
| **`getUserReaction(postId, userId)`** | utils.js | Реакція користувача |

### Утиліти для подій

| Функія | Файл | Опис |
|---------|------|------|
| **`customPrompt(title, message, defaultValue, maxVal)`** | ui.js | Користувацький промпт |
| **`openCommentInput(postId)`** | ui.js | Відкрити ввід коментара |
| **`attachUserSearchEvents()`** | ui.js | Обробка пошуку користувачів |

---

## 1️⃣6️⃣ **Зберігання**

### LocalStorage

| Функия | Файл | Опис |
|---------|------|------|
| **`loadStateFromStorage()`** | storage.js | Завантажити стан з localStorage |
| **`saveStateToStorage()`** | storage.js | Зберегти стан в localStorage |
| **`loadBooksFromLocalStorage()`** | library.js | Завантажити книги |
| **`saveBooksToLocalStorage()`** | library.js | Зберегти книги |

### Синхронізація з сервером

| Функія | Файл | Опис |
|---------|------|------|
| **`loadBooksFromServer()`** | library.js | Синхронізація книг з backend |
| **`loadFoldersFromServer()`** | library.js | Синхронізація папок |

---

## 1️⃣7️⃣ **Кеширування**

### Cache утиліти

| Функія | Файл | Опис |
|---------|------|------|
| **`isCacheSafeUrl(urlOrRequest)`** | cache-utils.js | Перевірити безпеку кешування |
| **`safeCachePut(cache, request, response)`** | cache-utils.js | Безпечне додавання в cache |
| **`safeCacheMatch(cache, request)`** | cache-utils.js | Безпечне отримання з cache |

---

## 📌 **Ініціалізація**

### Запуск

| Функія | Файл | Опис |
|---------|------|------|
| **`init()`** | main.js | Основна ініціалізація |
| **`wireEvents()`** | main.js | Прив'язка всіх подій |
| **`bindAddPageEvents()`** | main.js | Обробка додавання сторінок |
| **`getState()`** | state.js | Отримати глобальний стан |
| **`updateState(updates)`** | state.js | Оновити стан |

### Розширена ініціалізація

| Функія | Файл | Опис |
|---------|------|------|
| **`initializeExtendedFeatures()`** | init-features.js | Активування розширень |
| **`initializeAdvancedAnalytics()`** | init-advanced.js | Просунута аналітика |
| **`initializeEnhancedCommunity()`** | init-advanced.js | Розширена спільнота |
| **`initLibraryExtendedHandlers()`** | library-extended-handlers.js | Всі обробники |
| **`initializeBookNotesRatingsReviews(book)`** | init-notes-ratings-reviews.js | Заметки для книги |

---

## 🎯 **Загальна статистика**

| Показник | Кількість |
|----------|----------|
| **Всього функцій** | 130+ |
| **Основних операцій** | ~50 |
| **Модулів ініціалізації** | 7 |
| **Файлів JavaScript** | 20+ |
| **Рівнів абстракції** | 4 |

---

## 📚 **Групування по типам**

### Дані (CRUD)
- Додавання (Create): ~20 функцій
- Отримання (Read): ~35 функцій  
- Редагування (Update): ~15 функцій
- Видалення (Delete): ~10 функцій

### UI/UX
- Рендер: ~25 функцій
- Обробка подій: ~15 функцій
- Навігація: ~8 функцій

### Утиліти та допоміжні
- Форматування: ~8 функцій
- Пошук/Фільтр: ~12 функцій
- Зберігання: ~8 функцій

---

## 🚀 **Часто використовувані функції**

### Топ 10 для розробників

1. **`addBook(book)`** — додати нову книгу
2. **`editBook(bookId, updates)`** — отримати/редагувати дані
3. **`addNote(bookId, noteText)`** — додати заметку
4. **`setBookRating(bookId, rating)`** — оцінити книгу
5. **`getFilteredBooks()`** — пошук і фільтрування
6. **`renderLibrary()`** — основний рендер
7. **`openBookModal(bookId)`** — деталі книги
8. **`getAnalyticsData()`** — аналітика
9. **`getCommunityBooks()`** — дані спільноти
10. **`saveStateToStorage()`** — персистенція

---

## 📖 **Посилання**

- 📚 [README.md](README.md) - Основна документація
- 🚀 [QUICK_START.md](QUICK_START.md) - Гайд користувача
- 📝 [NOTES_RATINGS_REVIEWS_GUIDE.md](NOTES_RATINGS_REVIEWS_GUIDE.md) - Заметки та оцінки
- ⚙️ [TECHNICAL_NOTES_RATINGS_SUMMARY.md](TECHNICAL_NOTES_RATINGS_SUMMARY.md) - Технічні деталі

---

**Версія:** 2.1.0  
**Остання оновлення:** 2024  
**Автор:** GitHub Copilot + User

🌟 **Всі функції протестовані і готові до використання!**
