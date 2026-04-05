// Простий аналітика

const getReadingStreak = (readingDays) => {
  if (!Array.isArray(readingDays) || readingDays.length === 0) return { current: 0, longest: 0 };
  
  const sortedDays = readingDays.sort();
  let currentStreak = 1;
  let longestStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const dayDiff = (curr - prev) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return { current: currentStreak, longest: longestStreak };
};

const getAnalyticsData = () => {
  const totalBooks = Array.isArray(state.books) ? state.books.length : 0;
  const readBooks = Array.isArray(state.books) ? state.books.filter(b => b.status === 'прочитано').length : 0;
  const totalPages = Array.isArray(state.books) ? state.books.reduce((sum, b) => sum + (b.currentPage || 0), 0) : 0;
  const notStarted = Array.isArray(state.books) ? state.books.filter(b => b.status === 'бажаю прочитати').length : 0;
  const reading = Array.isArray(state.books) ? state.books.filter(b => b.status === 'читаю').length : 0;
  const abandoned = Array.isArray(state.books) ? state.books.filter(b => b.status === 'закинуто').length : 0;
  
  // Отримуємо дні коли користувач читав
  const readingDays = new Set();
  if (Array.isArray(state.sessions)) {
    state.sessions.forEach(s => {
      const date = s.date || s.createdAt;
      if (date) {
        const dateStr = new Date(date).toISOString().slice(0, 10);
        readingDays.add(dateStr);
      }
    });
  }
  
  const readingDaysArray = Array.from(readingDays);
  const streak = getReadingStreak(readingDaysArray);
  
  return {
    totalBooks,
    readBooks,
    totalPages,
    notStarted,
    reading,
    abandoned,
    readingDays: readingDaysArray,
    streak: streak,
    uniqueReadDays: [],
    months: []
  };
};

const buildStatCards = () => {
  const analytics = getAnalyticsData();
  const percent = analytics.totalBooks > 0 ? Math.round((analytics.readBooks / analytics.totalBooks) * 100) : 0;
  
  return [
    { label: '📚 Всього', value: analytics.totalBooks },
    { label: '✅ Прочитано', value: analytics.readBooks },
    { label: '📄 Сторінок', value: analytics.totalPages },
    { label: '📈 %', value: percent + '%' }
  ];
};

const getMonthlyProgress = () => {
  return [];
};

const getCalendarData = (year, month) => {
  return { year, month, daysRead: [] };
};
