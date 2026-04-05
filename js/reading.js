// Функції для управління читанням і сесіями

// ✅ Синхронізація сесій з сервером
const saveSessionToServer = async (session) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    
    if (!response.ok) {

      return false;
    }
    
    return await response.json();
  } catch (err) {

    return false;
  }
};

// ✅ Завантажити сесії книги з сервера
const loadSessionsFromServer = async (bookId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/book/${bookId}`);
    if (response.ok) {
      const serverSessions = await response.json();
      // Фільтруємо і оновлюємо локальні сесії
      state.sessions = state.sessions || [];
      serverSessions.forEach(serverSession => {
        if (!state.sessions.find(s => s.id === serverSession.id)) {
          state.sessions.push(serverSession);
        }
      });
      return serverSessions;
    }
  } catch (err) {

  }
  return [];
};

const startReadingSession = (book, startPage) => {
  book.activeSession = {
    startPage: startPage,
    startTime: Date.now(),
    accumulatedTime: 0,
    isRunning: true
  };
  book.currentPage = startPage;
  book.status = 'читаю';
  createActivityRecord('start', `📖 Розпочато читання: ${book.title} зі сторінки ${startPage}`, book.id);
  saveStateToStorage();
  return book.activeSession;
};

const toggleReadingTimer = (book) => {
  if (!book.activeSession) return { success: false, message: 'Сесія не запущена.' };

  if (book.activeSession.isRunning) {
    // Призупиняємо таймер
    const now = Date.now();
    book.activeSession.accumulatedTime += (now - book.activeSession.startTime);
    book.activeSession.isRunning = false;
    createActivityRecord('pause', `⏸️ Призупинено читання: ${book.title}`, book.id);
  } else {
    // Продовжуємо таймер
    book.activeSession.startTime = Date.now();
    book.activeSession.isRunning = true;
    createActivityRecord('resume', `▶️ Продовжено читання: ${book.title}`, book.id);
  }
  
  saveStateToStorage();
  return { success: true, isRunning: book.activeSession.isRunning };
};

const finishReadingSession = (book, endPage) => {
  if (!book.activeSession) return { success: false, message: 'Сесія не запущена.' };

  if (!Number.isInteger(endPage)) {
    return { success: false, message: 'Введіть номер сторінки цілим числом.' };
  }

  if (endPage < book.activeSession.startPage) {
    return { success: false, message: 'Кінцева сторінка не може бути меншою за початкову.' };
  }

  if (endPage > book.pages) {
    return { success: false, message: `У книзі лише ${book.pages} сторінок.` };
  }

  let totalTimeMs = book.activeSession.accumulatedTime || 0;
  if (book.activeSession.isRunning) {
    totalTimeMs += (Date.now() - book.activeSession.startTime);
  }
  
  const durationMins = Math.max(1, Math.round(totalTimeMs / 60000));
  const pagesRead = Math.max(0, endPage - book.activeSession.startPage);
  const pagesPerHour = durationMins > 0 ? Math.round((pagesRead / durationMins) * 60) : 0;

  const session = {
    id: typeof newId === 'function' ? newId('session') : 'sess_' + Date.now(),
    bookId: book.id,
    date: new Date().toISOString(),
    startPage: book.activeSession.startPage,
    endPage: endPage,
    pagesRead,
    duration: durationMins,
    pagesPerHour
  };

  if (!state.sessions) state.sessions = [];
  state.sessions.push(session);
  state.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

  book.currentPage = endPage;
  book.activeSession = null;
  
  if (endPage >= book.pages) {
    book.status = 'прочитано';
    book.finishedPage = book.pages;
  }
  
  createActivityRecord('finish', `✅ Завершено читання: ${book.title} (прочитано ${pagesRead} стор. за ${durationMins} хв, ~${pagesPerHour} стор/год)`, book.id);
  saveStateToStorage();

  // ✅ Зберігаємо сесію на сервері асинхронно
  saveSessionToServer(session).catch(err => {});

  return { success: true, session, message: '🎉 Сесія збережена!' };
};

const cancelReadingSession = (book) => {
  if (!book.activeSession) return { success: false, message: 'Сесія не запущена.' };
  book.activeSession = null;
  createActivityRecord('cancel', `❌ Скасовано сесію читання: ${book.title}`, book.id);
  saveStateToStorage();
  return { success: true, message: 'Сесію скасовано.' };
};

const getSessionStats = () => {
  const allSessions = state.sessions;
  const totalPagesRead = state.books.reduce((sum, b) => sum + (b.finishedPage || 0), 0);
  const readDates = allSessions.map(s => new Date(s.date).toISOString().slice(0, 10));
  const uniqueReadDays = [...new Set(readDates)];
  
  const avgPagesPerSession = allSessions.length
    ? (allSessions.reduce((s, x) => s + x.pagesRead, 0) / allSessions.length).toFixed(1)
    : '0';

  return {
    totalPages: totalPagesRead,
    totalSessions: allSessions.length,
    avgPagesPerSession,
    uniqueReadDays
  };
};

const getLongestReadingStreak = () => {
  const stats = getSessionStats();
  const uniqueReadDays = stats.uniqueReadDays;
  
  let longestStreak = 0;
  let currentStreak = 0;
  
  for (let i = 0; i < 365; i += 1) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    
    if (uniqueReadDays.includes(key)) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return longestStreak;
};
