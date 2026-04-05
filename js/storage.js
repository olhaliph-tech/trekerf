// Управління збереженням і завантаженням даних
const STORAGE_KEY = 'readingTrackerData';

const loadStateFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = {
        user: parsed.user || {...defaultUser},
        books: parsed.books || [],
        sessions: parsed.sessions || [],
        folders: parsed.folders && parsed.folders.length ? parsed.folders : [...defaultFolders],
        comments: parsed.comments || [],
        reactions: parsed.reactions || [],
        activity: parsed.activity || []
      };
    } catch (e) {
    }
  }
};

const saveStateToStorage = () => {
  // Передаємо всі дані, ОКРІМ книг. Книги тепер живуть на бекенді, 
  // що повністю вирішує проблему QuotaExceededError (пам'ять переповнена).
  const stateToSave = { ...state, books: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
};
