// Базова адреса API сервера
const API_BASE_URL = 'http://localhost:3000/api';
const LOCAL_BOOK_SYNC_GRACE_MS = 10000;
const BOOKS_STORAGE_KEY = 'readingTrackerBooks';
// ✅ Ключ для збереження видалених книг
const DELETED_BOOKS_KEY = 'readingTrackerDeletedBooks';

// Завантаження всіх книг із локального сховища
const loadBooksFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (saved) {
      const allBooks = JSON.parse(saved);
      // ✅ Фільтруємо видалені книги при завантаженні
      const deletedIds = getDeletedBooksIds();
      state.books = allBooks.filter(b => !deletedIds.includes(b.id));
      return true;
    }
  } catch (e) {
  }
  return false;
};

// Збереження всіх книг у локальне сховище
const saveBooksToLocalStorage = () => {
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(state.books));
  } catch (e) {
  }
};

// ✅ Отримати список видалених книг з локального сховища
const getDeletedBooksIds = () => {
  try {
    const saved = localStorage.getItem(DELETED_BOOKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

// ✅ Додати книгу до списку видалених
const markBookAsDeleted = (bookId) => {
  const deletedIds = getDeletedBooksIds();
  if (!deletedIds.includes(bookId)) {
    deletedIds.push(bookId);
    try {
      localStorage.setItem(DELETED_BOOKS_KEY, JSON.stringify(deletedIds));
    } catch (e) {
    }
  }
};

// ✅ Видалити книгу зі списку видалених (синхронізовано з сервером)
const unmarkBookAsDeleted = (bookId) => {
  const deletedIds = getDeletedBooksIds();
  const filtered = deletedIds.filter(id => id !== bookId);
  try {
    localStorage.setItem(DELETED_BOOKS_KEY, JSON.stringify(filtered));
  } catch (e) {
  }
};

// Завантаження всіх книг із сервера
const loadBooksFromServer = async () => {
  try {
    // Виконуємо GET-запит до /books
    const response = await fetch(`${API_BASE_URL}/books`, { timeout: 3000 });

    // Якщо відповідь успішна
    if (response.ok) {
      const serverBooks = await response.json();
      const oldState = JSON.stringify(state.books);
      
      // ✅ Отримуємо список видалених книг
      const deletedIds = getDeletedBooksIds();
      
      // Зберігаємо отримані книги у стані, виключаючи видалені
      state.books = serverBooks
        .filter(serverBook => !deletedIds.includes(serverBook.id)) // ✅ Фільтруємо видалені
        .map(serverBook => {
          const localBook = state.books?.find(b => b.id === serverBook.id);
          if (
            localBook &&
            localBook._localUpdatedAt &&
            Date.now() - localBook._localUpdatedAt < LOCAL_BOOK_SYNC_GRACE_MS
          ) {
            return { ...serverBook, ...localBook, userId: serverBook.userId || 'unknown_user' };
          }
          // Зберігаємо активну сесію таймера, щоб вона не збивалась при оновленні
          if (localBook && localBook.activeSession) {
            serverBook.activeSession = localBook.activeSession;
          }
          // Забезпечуємо userId для старих книг
          serverBook.userId = serverBook.userId || 'unknown_user';
          return serverBook;
        });

      // Також зберігаємо у localStorage як резервну копію
      saveBooksToLocalStorage();

      // Перемальовуємо UI тільки якщо дані дійсно змінилися
      if (JSON.stringify(state.books) !== oldState) {
        if (typeof renderLibrary === 'function') renderLibrary();
        if (typeof renderAnalytics === 'function') renderAnalytics();
      }
    }
  } catch (error) {
    // Виводимо помилку в консоль, якщо не вдалося завантажити книги
    console.warn('⚠️ Помилка завантаження книг з сервера. Використовується локальне сховище.', error);
    // Пробуємо завантажити з localStorage
    loadBooksFromLocalStorage();
  }
};

// Додавання нової книги
const addBook = async (book) => {
  // Формуємо об’єкт нової книги для збереження
  const newBookData = {
    title: book.title,
    author: book.author,
    genre: book.genre,
    description: book.description,
    pages: book.pages,
    cover: book.cover,
    status: 'бажаю прочитати', // статус за замовчуванням
    folderId: book.folderId || 'folder_all', // якщо папка не вказана — додаємо в "Усі книги"
    currentPage: 0, // початкова сторінка читання
    userId: state.user.id // власник книги
  };

  try {
    // Надсилаємо POST-запит на сервер
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBookData)
    });

    // Якщо сервер повернув помилку
    if (!response.ok) throw new Error('Помилка сервера при додаванні книги');

    // Отримуємо збережену книгу з відповіді
    const savedBook = await response.json();

    // Якщо масив книг не існує — створюємо його
    if (!Array.isArray(state.books)) state.books = [];

    // Додаємо нову книгу до локального стану
    state.books.push(savedBook);

    // Якщо масив папок не існує — створюємо його з базовою папкою
    if (!Array.isArray(state.folders)) {
      state.folders = [{ id: 'folder_all', name: 'Усі книги' }];
    }

    // Якщо папка книги не "Усі книги" і її ще немає у списку — додаємо
    if (
      savedBook.folderId !== 'folder_all' &&
      !state.folders.some((f) => f.id === savedBook.folderId)
    ) {
      state.folders.push({ id: newId('folder'), name: savedBook.folderId });
    }

    // Створюємо запис активності про додавання книги
    try {
      if (typeof createActivityRecord === 'function') {
        createActivityRecord('add', `📚 Додана книга: ${savedBook.title}`, savedBook.id);
      }
    } catch (e) {
    }

    // Зберігаємо оновлений стан у локальне сховище
    saveStateToStorage();

    // Повертаємо додану книгу
    return savedBook;
  } catch (error) {
    // Виводимо помилку і передаємо її далі
    console.error('Помилка:', error);
    throw error;
  }
};

// ✅ Завантажити папки з сервера
const loadFoldersFromServer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`);
    if (response.ok) {
      const serverFolders = await response.json();
      // Об'єднуємо серверні папки з локальним списком (видаляємо дублікати)
      state.folders = state.folders || [{ id: 'folder_all', name: 'Усі книги' }];
      serverFolders.forEach(serverFolder => {
        if (!state.folders.find(f => f.id === serverFolder.id)) {
          state.folders.push(serverFolder);
        }
      });
      return serverFolders;
    }
  } catch (err) {
  }
  return [];
};

// Створення нової папки
const createFolder = async (folderName) => {
  // Перевіряємо, чи папка з такою назвою вже існує
  if (state.folders.some((f) => f.name === folderName)) {
    return null;
  }

  try {
    // ✅ Створюємо папку на сервері
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: folderName })
    });

    if (!response.ok) {

      // Створюємо локально, як резервний варіант
      const newFolder = { id: newId('folder'), name: folderName };
      state.folders.push(newFolder);
      saveStateToStorage();
      return newFolder;
    }

    const newFolder = await response.json();

    // Додаємо папку до локального списку
    state.folders.push(newFolder);

    // Зберігаємо стан
    saveStateToStorage();

    return newFolder;
  } catch (err) {

    // Як резервний варіант, створюємо локально
    const newFolder = { id: newId('folder'), name: folderName };
    state.folders.push(newFolder);
    saveStateToStorage();
    return newFolder;
  }
};

// Оновлення статусу книги
const updateBookStatus = (bookId, newStatus) => editBook(bookId, { status: newStatus });

// Оновлення папки книги
const updateBookFolder = (bookId, newFolderId) => editBook(bookId, { folderId: newFolderId });

// Оновлення поточної сторінки книги
const updateBookCurrentPage = (bookId, page) => editBook(bookId, { currentPage: page });

// Отримання відфільтрованого списку книг
const getFilteredBooks = (folderId, status, searchQuery) => {
  let books = state.books;

  // Фільтрація за папкою
  if (folderId && folderId !== 'folder_all') {
    books = books.filter(b => b.folderId === folderId);
  }

  // Фільтрація за статусом
  if (status && status !== 'all') {
    books = books.filter(b => b.status === status);
  }

  // Пошук за назвою, автором, жанром або статусом
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    books = books.filter(b =>
      [b.title, b.author, b.genre, b.status].some(v => v?.toLowerCase().includes(query))
    );
  }

  return books;
};

// Формування "заповнювача" книги на основі даних із зовнішнього джерела
const placeholderBook = (item) => {
  // Витягуємо автора
  const author = item.author_name?.join(', ') || item.author?.name || 'Невідомий автор';
  
  // Витягуємо назву
  const title = item.title || 'Без назви';
  
  // Витягуємо жанр - беремо перші 2-3 жанри через кому
  const genres = item.subject || item.categories || [];
  const genre = genres.slice(0, 2).join(', ') || 'Без жанру';
  
  // Витягуємо кількість сторінок
  const pages = item.number_of_pages_median || item.number_of_pages || 0;
  
  // Витягуємо опис - спробуємо різні джерела
  let description = '';
  if (item.first_sentence) {
    description = Array.isArray(item.first_sentence) ? item.first_sentence.join(' ') : item.first_sentence;
  } else if (item.subtitle) {
    description = item.subtitle;
  } else if (item.description) {
    description = typeof item.description === 'string' ? item.description : item.description.value || '';
  }
  description = description || 'Немає опису';
  
  // Витягуємо обкладинку
  const cover = item.cover_i 
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
    : item.cover_url || window.PlaceholderFallback.book;
  
  return {
    author,
    title,
    genre,
    pages,
    description,
    cover
  };
};

// Редагування книги
const editBook = (bookId, updates) => {
  // Отримуємо книгу за її ID
  const book = getBookById(bookId);

  // Якщо книгу не знайдено — повертаємо null
  if (!book) return null;

  // Список полів, які можна редагувати
  const allowedFields = [
    'title',
    'author',
    'genre',
    'description',
    'pages',
    'cover',
    'status',
    'folderId',
    'currentPage',
    'activeSession',
    'finishedPage'
  ];

  // Оновлюємо лише дозволені поля
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      book[key] = updates[key];
    }
  });

  book._localUpdatedAt = Date.now();

  // Створюємо запис активності
  createActivityRecord('edit', `✍️ Редагована книга: ${book.title}`, book.id);

  // Зберігаємо оновлений стан
  saveStateToStorage();

  // Оптимістичне фонове оновлення на сервері
  const serverUpdates = { ...updates };
  delete serverUpdates._localUpdatedAt;

  fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serverUpdates)
  }).catch(err => {});

  return book;
};

// Видалення книги
const deleteBook = async (bookId) => {
  const book = getBookById(bookId);
  if (!book) return false;
  state.books = state.books.filter((b) => b.id !== bookId);
  state.sessions = state.sessions.filter((s) => s.bookId !== bookId);
  saveStateToStorage();
  saveBooksToLocalStorage();
  markBookAsDeleted(bookId);
  try { createActivityRecord('delete', `🗑️ Видалена книга: ${book.title}`, book.id); } catch (e) {}
  fetch(`${API_BASE_URL}/books/${bookId}`, { method: 'DELETE' }).catch(() => {});
  return true;
};

// Видалення папки
const deleteFolder = async (folderId) => {
  if (folderId === 'folder_all') return false;

  const folder = state.folders.find((f) => f.id === folderId);
  if (!folder) return false;

  const removedBookIds = state.books
    .filter((b) => b.folderId === folderId)
    .map((b) => b.id);

  state.books = state.books.filter((b) => b.folderId !== folderId);
  state.folders = state.folders.filter((f) => f.id !== folderId);
  state.sessions = state.sessions.filter((s) => !removedBookIds.includes(s.bookId));

  saveStateToStorage();
  saveBooksToLocalStorage();
  removedBookIds.forEach(id => markBookAsDeleted(id));

  try {
    createActivityRecord('delete', `🗑️ Видалена папка: ${folder.name}`, '');
  } catch (e) {}

  // Синхронізація з сервером
  fetch(`${API_BASE_URL}/folders/${folderId}`, { method: 'DELETE' }).catch(() => {});
  removedBookIds.forEach(id => {
    fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' }).catch(() => {});
  });

  return true;
};
