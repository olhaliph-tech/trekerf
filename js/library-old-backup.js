// Базова адреса API сервера
const API_BASE_URL = 'http://localhost:3000/api';
const LOCAL_BOOK_SYNC_GRACE_MS = 10000;
const BOOKS_STORAGE_KEY = 'readingTrackerBooks';

// Завантаження всіх книг із локального сховища
const loadBooksFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (saved) {
      state.books = JSON.parse(saved);
      return true;
    }
  } catch (e) {
    console.error('Помилка завантаження книг з localStorage:', e);
  }
  return false;
};

// Збереження всіх книг у локальне сховище
const saveBooksToLocalStorage = () => {
  try {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(state.books));
  } catch (e) {
    console.warn('Помилка збереження книг у localStorage:', e);
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
      
      // Зберігаємо отримані книги у стані
      state.books = serverBooks.map(serverBook => {
        const localBook = state.books?.find(b => b.id === serverBook.id);
        if (
          localBook &&
          localBook._localUpdatedAt &&
          Date.now() - localBook._localUpdatedAt < LOCAL_BOOK_SYNC_GRACE_MS
        ) {
          return { ...serverBook, ...localBook };
        }
        // Зберігаємо активну сесію таймера, щоб вона не збивалась при оновленні
        if (localBook && localBook.activeSession) {
          serverBook.activeSession = localBook.activeSession;
        }
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
    currentPage: 0 // початкова сторінка читання
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
      console.warn('Помилка запису активності', e);
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

// Створення нової папки
const createFolder = (folderName) => {
  // Перевіряємо, чи папка з такою назвою вже існує
  if (state.folders.some((f) => f.name === folderName)) {
    return null;
  }

  // Створюємо нову папку
  const newFolder = { id: newId('folder'), name: folderName };

  // Додаємо її до списку папок
  state.folders.push(newFolder);

  // Зберігаємо стан
  saveStateToStorage();

  return newFolder;
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
const placeholderBook = (item) => ({
  author: item.author_name?.join(', ') || 'Невідомий',
  title: item.title || 'Невідома книга',
  genre: item.subject?.[0] || 'Не вказано',
  pages: item.number_of_pages_median || 100,
  description: item.first_sentence?.join(' ') || item.subtitle || 'Немає опису',
  cover: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : ''
});

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
  }).catch(err => console.error('Помилка оновлення на сервері:', err));

  return book;
};

// Видалення книги
const deleteBook = (bookId) => {
  // Отримуємо книгу за ID
  const book = getBookById(bookId);

  // Якщо книгу не знайдено — повертаємо false
  if (!book) return false;

  // Видаляємо книгу зі списку книг
  state.books = state.books.filter((b) => b.id !== bookId);

  // Видаляємо всі сесії читання, пов’язані з цією книгою
  state.sessions = state.sessions.filter((s) => s.bookId !== bookId);

  // Додаємо запис активності
  createActivityRecord('delete', `🗑️ Видалена книга: ${book.title}`, book.id);

  // Зберігаємо стан
  saveStateToStorage();

  // Фонове видалення книги на сервері
  fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: 'DELETE'
  }).catch(err => console.error('Помилка видалення на сервері:', err));

  return true;
};

// Видалення папки
const deleteFolder = (folderId) => {
  // Забороняємо видаляти стандартну папку
  if (folderId === 'folder_all') return false;

  // Шукаємо папку за ID
  const folder = state.folders.find((f) => f.id === folderId);

  // Якщо папку не знайдено — повертаємо false
  if (!folder) return false;

  // Отримуємо ID книг, які знаходяться у цій папці
  const removedBookIds = state.books
    .filter((b) => b.folderId === folderId)
    .map((b) => b.id);

  // Видаляємо книги цієї папки
  state.books = state.books.filter((b) => b.folderId !== folderId);

  // Видаляємо саму папку
  state.folders = state.folders.filter((f) => f.id !== folderId);

  // Видаляємо сесії читання для видалених книг
  state.sessions = state.sessions.filter((s) => !removedBookIds.includes(s.bookId));

  // Створюємо запис активності
  createActivityRecord('delete', `🗑️ Видалена папка: ${folder.name}`, '');

  // Зберігаємо стан
  saveStateToStorage();

  // Видаляємо всі книги цієї папки з сервера
  removedBookIds.forEach(id => {
    fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' })
      .catch(err => console.error('Помилка видалення на сервері:', err));
  });

  return true;
};
