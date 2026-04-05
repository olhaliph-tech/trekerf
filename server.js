const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Папка для зберігання даних
const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// ✅ Створюємо папку data якщо її не існує
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ✅ Допоміжні функції для збереження даних
const loadData = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
  }
  return defaultValue;
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
};

// ✅ Завантажуємо дані при запуску сервера
let books = loadData(BOOKS_FILE, [
  {
    id: 'book_1',
    title: '1984',
    author: 'Джордж Орвелл',
    genre: 'Антиутопія',
    pages: 328,
    status: 'прочитано',
    createdAt: new Date().toISOString()
  }
]);
let folders = loadData(FOLDERS_FILE, [
  { id: 'folder_all', name: 'Усі книги' }
]);
let sessions = loadData(SESSIONS_FILE, []);

// Допоміжна функція для генерації ID
const generateId = () => 'book_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
const generateFolderId = () => 'folder_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
const generateSessionId = () => 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Служить статичні файли (HTML, CSS, JS)
app.use(express.static(__dirname));

// ==========================================
// КНИГИ - Маршрути API
// ==========================================

// 1. READ: Отримати список всіх книг
app.get('/api/books', (req, res) => {
  res.json(books);
});

// 2. READ: Отримати одну книгу за ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Книгу не знайдено' });
  }
  res.json(book);
});

// 3. CREATE: Додати нову книгу
app.post('/api/books', (req, res) => {
  const { title, author, genre, pages, description, cover, status, folderId, currentPage, userId } = req.body;
  
  const newBook = {
    id: generateId(),
    title: (title || '').trim() || 'Без назви',
    author: (author || '').trim() || 'Невідомий',
    genre: (genre || '').trim() || 'Без жанру',
    pages: pages || 0,
    description: (description || '').trim() || '',
    cover: (cover || '').trim() || '',
    status: status || 'бажаю прочитати',
    folderId: folderId || 'folder_all',
    currentPage: currentPage || 0,
    userId: userId || 'unknown_user',
    createdAt: new Date().toISOString()
  };

  books.push(newBook);
  saveData(BOOKS_FILE, books); // ✅ Зберігаємо на диск
  res.status(201).json(newBook);
});

// 4. UPDATE: Оновити існуючу книгу за ID
app.put('/api/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Книгу не знайдено' });
  }

  books[index] = { ...books[index], ...req.body };
  saveData(BOOKS_FILE, books); // ✅ Зберігаємо на диск
  res.json(books[index]);
});

// 5. DELETE: Видалити книгу за ID
app.delete('/api/books/:id', (req, res) => {
  const initialLength = books.length;
  books = books.filter(b => b.id !== req.params.id);
  
  if (books.length === initialLength) {
    return res.status(404).json({ error: 'Книгу не знайдено' });
  }
  
  saveData(BOOKS_FILE, books); // ✅ Зберігаємо на диск
  res.status(204).send();
});

// ==========================================
// ПАПКИ - Маршрути API
// ==========================================

// Отримати список папок
app.get('/api/folders', (req, res) => {
  res.json(folders);
});

// Створити папку
app.post('/api/folders', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Назва папки не може бути пустою' });
  }
  
  // Перевіряємо, чи папка з такою назвою вже існує
  if (folders.some(f => f.name === name)) {
    return res.status(409).json({ error: 'Папка з такою назвою вже існує' });
  }
  
  const newFolder = {
    id: generateFolderId(),
    name: name
  };
  
  folders.push(newFolder);
  saveData(FOLDERS_FILE, folders); // ✅ Зберігаємо на диск
  res.status(201).json(newFolder);
});

// Видалити папку
app.delete('/api/folders/:id', (req, res) => {
  const folderId = req.params.id;
  
  if (folderId === 'folder_all') {
    return res.status(403).json({ error: 'Неможливо видалити стандартну папку' });
  }
  
  // Видаляємо всі книги в цій папці
  books = books.filter(b => b.folderId !== folderId);
  
  // Видаляємо папку
  folders = folders.filter(f => f.id !== folderId);
  
  saveData(BOOKS_FILE, books); // ✅ Зберігаємо на диск
  saveData(FOLDERS_FILE, folders); // ✅ Зберігаємо на диск
  
  res.status(204).send();
});

// ==========================================
// СЕСІЇ ЧИТАННЯ - Маршрути API
// ==========================================

// Отримати всі сесії книги
app.get('/api/sessions/book/:bookId', (req, res) => {
  const bookSessions = sessions.filter(s => s.bookId === req.params.bookId);
  res.json(bookSessions);
});

// Створити нову сесію читання
app.post('/api/sessions', (req, res) => {
  const { bookId, startPage, endPage, duration } = req.body;
  
  if (!bookId) {
    return res.status(400).json({ error: 'bookId не вказаний' });
  }
  
  const newSession = {
    id: generateSessionId(),
    bookId: bookId,
    startPage: startPage || 0,
    endPage: endPage || 0,
    duration: duration || 0,
    pagesRead: (endPage || 0) - (startPage || 0),
    date: new Date().toISOString()
  };
  
  sessions.push(newSession);
  saveData(SESSIONS_FILE, sessions); // ✅ Зберігаємо на диск
  res.status(201).json(newSession);
});

// Видалити сесію
app.delete('/api/sessions/:id', (req, res) => {
  const initialLength = sessions.length;
  sessions = sessions.filter(s => s.id !== req.params.id);
  
  if (sessions.length === initialLength) {
    return res.status(404).json({ error: 'Сесію не знайдено' });
  }
  
  saveData(SESSIONS_FILE, sessions); // ✅ Зберігаємо на диск
  res.status(204).send();
});

// ==========================================
// ЗДОРОВ'Я СЕРВЕРА
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер працює' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
  console.log(`📂 Дані зберігаються в папці: ${DATA_DIR}`);
});