// ===== МОДУЛЬ НОВОЙ СПІЛЬНОТИ v2.0 =====
// Замість показування всіх дій, показуємо:
// 1. 🏆 Найбільш популярні книги
// 2. 🔥 Тренди (книги, які читають зараз)
// 3. 👑 Топ читачів
// 4. 📲 Хто читає зараз
// 5. ✨ Рекомендації по жанру/автору

const getCommunityBooks = () => {
  const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
  const bookMap = new Map();

  users.forEach(u => {
    const uDataStr = localStorage.getItem(`readingTrackerData_${u.id}`);
    if (uDataStr) {
      try {
        const data = JSON.parse(uDataStr);
        if (Array.isArray(data.books)) {
          data.books.forEach(book => {
            if (!bookMap.has(book.id)) {
              bookMap.set(book.id, {
                ...book,
                readers: [],
                totalRating: 0,
                ratingCount: 0,
                finishedCount: 0,
                readingNow: 0
              });
            }
            
            const bookData = bookMap.get(book.id);
            bookData.readers.push(u.id);
            
            if (book.status === 'прочитано') bookData.finishedCount++;
            if (book.status === 'читаю') bookData.readingNow++;
            
            if (book.rating && book.rating > 0) {
              bookData.totalRating += book.rating;
              bookData.ratingCount++;
            }
          });
        }
      } catch (e) {}
    }
  });

  return bookMap;
};

const getTopPopularBooks = (limit = 5) => {
  const bookMap = getCommunityBooks();
  const books = Array.from(bookMap.values())
    .filter(b => b.readers.length > 0)
    .map(b => ({
      ...b,
      avgRating: b.ratingCount > 0 ? (b.totalRating / b.ratingCount).toFixed(1) : 0,
      popularityScore: (b.finishedCount * 2 + b.readers.length)
    }))
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return b.readers.length - a.readers.length;
    })
    .slice(0, limit);

  return books;
};

const getReadingTrends = (limit = 5) => {
  const bookMap = getCommunityBooks();
  const books = Array.from(bookMap.values())
    .filter(b => b.readingNow > 0)
    .sort((a, b) => b.readingNow - a.readingNow)
    .slice(0, limit)
    .map(b => ({
      ...b,
      avgRating: b.ratingCount > 0 ? (b.totalRating / b.ratingCount).toFixed(1) : 0
    }));

  return books;
};

const getTopReaders = (limit = 5) => {
  const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
  
  const usersWithStats = users.map(u => {
    const uDataStr = localStorage.getItem(`readingTrackerData_${u.id}`);
    let readBooks = 0;
    let totalPages = 0;
    let genreStats = {};
    let authorStats = {};

    if (uDataStr) {
      try {
        const data = JSON.parse(uDataStr);
        if (Array.isArray(data.books)) {
          const finished = data.books.filter(b => b.status === 'прочитано');
          readBooks = finished.length;
          totalPages = finished.reduce((sum, b) => sum + (b.pages || 0), 0);
          
          finished.forEach(b => {
            genreStats[b.genre] = (genreStats[b.genre] || 0) + 1;
            authorStats[b.author] = (authorStats[b.author] || 0) + 1;
          });
        }
      } catch (e) {}
    }

    const favoriteGenre = Object.entries(genreStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Невідомий';

    return {
      ...u,
      readBooks,
      totalPages,
      favoriteGenre,
      followers: (u.followers || []).length
    };
  })
  .filter(u => u.readBooks > 0)
  .sort((a, b) => b.readBooks - a.readBooks)
  .slice(0, limit);

  return usersWithStats;
};

const getActiveReaders = (limit = 5) => {
  const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
  const now = Date.now();
  const ACTIVE_THRESHOLD = 30 * 60 * 1000;

  const activeUsers = users
    .map(u => {
      const uDataStr = localStorage.getItem(`readingTrackerData_${u.id}`);
      let currentBook = null;
      let sessionTime = 0;

      if (uDataStr) {
        try {
          const data = JSON.parse(uDataStr);
          if (Array.isArray(data.books)) {
            const reading = data.books.find(b => b.status === 'читаю' && b.activeSession);
            if (reading && reading.activeSession) {
              currentBook = reading;
              sessionTime = (now - new Date(reading.activeSession.startTime).getTime());
            }
          }
        } catch (e) {}
      }

      return {
        ...u,
        currentBook,
        sessionTime
      };
    })
    .filter(u => u.currentBook && u.sessionTime < ACTIVE_THRESHOLD)
    .sort((a, b) => a.sessionTime - b.sessionTime)
    .slice(0, limit);

  return activeUsers;
};

const getRecommendations = (limit = 5) => {
  const myBooks = state.books || [];
  const readBooks = myBooks.filter(b => b.status === 'прочитано');
  
  if (readBooks.length === 0) {
    return getTopPopularBooks(limit);
  }

  const genreStats = {};
  const authorStats = {};
  
  readBooks.forEach(b => {
    genreStats[b.genre] = (genreStats[b.genre] || 0) + 1;
    authorStats[b.author] = (authorStats[b.author] || 0) + 1;
  });

  const communityBookMap = getCommunityBooks();
  const recommendations = Array.from(communityBookMap.values())
    .filter(b => {
      if (myBooks.find(mb => mb.id === b.id)) return false;
      return genreStats[b.genre] > 0 || authorStats[b.author] > 0;
    })
    .map(b => {
      let score = 0;
      
      if (genreStats[b.genre]) {
        score += genreStats[b.genre] * 10;
      }
      
      if (authorStats[b.author]) {
        score += authorStats[b.author] * 15;
      }
      
      const avgRating = b.ratingCount > 0 ? (b.totalRating / b.ratingCount) : 0;
      score += avgRating * 5;

      return {
        ...b,
        avgRating: avgRating.toFixed(1),
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations.length > 0 ? recommendations : getTopPopularBooks(limit);
};

const renderTopBooksSection = () => {
  const books = getTopPopularBooks(5);
  
  if (books.length === 0) {
    return '<p style="color: #999; padding: 15px; text-align: center;">Ще немає популярних книг</p>';
  }

  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px;">';
  
  books.forEach((book, idx) => {
    html += `
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.2s; cursor: pointer;" class="book-top-item" data-book-id="${book.id}">
        <div style="position: relative; height: 180px; overflow: hidden; background: #f0f0f0;">
          <img src="${book.cover || window.PlaceholderFallback.book}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.book" />
          <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            🏆 #${idx + 1}
          </div>
        </div>
        <div style="padding: 12px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${book.title}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">${book.author}</p>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #f59e0b;">⭐ ${book.avgRating}</span>
            <span style="color: #64748b; font-size: 11px;">(${book.ratingCount})</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

const renderTrendsSection = () => {
  const books = getReadingTrends(5);
  
  if (books.length === 0) {
    return '<p style="color: #999; padding: 15px; text-align: center;">Наразі ніхто не читає активно</p>';
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  
  books.forEach((book, idx) => {
    const trendIcon = idx === 0 ? '🔥' : idx === 1 ? '📈' : '📊';
    
    html += `
      <div style="background: white; padding: 15px; border-radius: 12px; border-left: 4px solid var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer;" class="trend-item" data-book-id="${book.id}">
        <div style="display: flex; gap: 12px;">
          <img src="${book.cover || window.PlaceholderFallback.book}" alt="${book.title}" style="width: 60px; height: 90px; border-radius: 8px; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.book" />
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #333; font-weight: bold;">
              ${trendIcon} ${book.title}
            </h4>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">${book.author}</p>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                👥 Читають ${book.readingNow}
              </span>
              <span style="color: #f59e0b;">⭐ ${book.avgRating}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

const renderTopReadersSection = () => {
  const readers = getTopReaders(5);
  
  if (readers.length === 0) {
    return '<p style="color: #999; padding: 15px; text-align: center;">Ще немає активних читачів</p>';
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  
  readers.forEach((user, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐';
    
    html += `
      <div style="background: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" class="reader-item" data-user-id="${user.id}">
        <div style="text-align: center; font-size: 24px; min-width: 40px;">${medal}</div>
        <img src="${user.avatar || window.PlaceholderFallback.avatar}" alt="${user.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.avatar" />
        <div style="flex: 1;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #333; font-weight: bold;">${user.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">@${user.nickname}</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px;">
            <span>📚 ${user.readBooks} книг</span>
            <span>📄 ${user.totalPages} стор.</span>
            <span>🎯 ${user.favoriteGenre}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: bold; color: var(--color-primary);">${user.readBooks}</div>
          <div style="font-size: 11px; color: #64748b;">Прочитано</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

const renderActiveReadersSection = () => {
  const activeReaders = getActiveReaders(5);
  
  if (activeReaders.length === 0) {
    return '<p style="color: #999; padding: 15px; text-align: center;">Наразі ніхто не читає 📚</p>';
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  
  activeReaders.forEach((user) => {
    const sessionMinutes = Math.round(user.sessionTime / 60000);
    const status = sessionMinutes < 5 ? '🟢' : sessionMinutes < 15 ? '🟡' : '🔴';
    
    html += `
      <div style="background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6)); padding: 15px; border-radius: 12px; border: 1px solid rgba(230, 150, 180, 0.2);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <div style="text-align: center; font-size: 20px;">${status}</div>
          <img src="${user.avatar || window.PlaceholderFallback.avatar}" alt="${user.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.avatar" />
          <div>
            <h4 style="margin: 0; font-size: 13px; color: #333; font-weight: bold;">${user.name}</h4>
            <p style="margin: 0; font-size: 11px; color: #64748b;">@${user.nickname}</p>
          </div>
          <div style="margin-left: auto; text-align: right;">
            <div style="font-size: 11px; color: var(--color-primary); font-weight: bold;">⏱️ ${sessionMinutes} хв</div>
          </div>
        </div>
        ${user.currentBook ? `
          <div style="background: white; padding: 10px; border-radius: 8px; display: flex; gap: 10px;">
            <img src="${user.currentBook.cover || window.PlaceholderFallback.book}" alt="${user.currentBook.title}" style="width: 40px; height: 60px; border-radius: 6px; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.book" />
            <div style="flex: 1; font-size: 12px;">
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #333;">📖 ${user.currentBook.title}</p>
              <p style="margin: 0; color: #64748b;">Сторінка ${user.currentBook.currentPage} / ${user.currentBook.pages}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

const renderRecommendationsSection = () => {
  const recs = getRecommendations(5);
  
  if (recs.length === 0) {
    return '<p style="color: #999; padding: 15px; text-align: center;">Рекомендацій немає</p>';
  }

  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px;">';
  
  recs.forEach((book) => {
    html += `
      <div style="background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6)); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.2s; cursor: pointer; border: 2px solid rgba(230, 150, 180, 0.3);" class="rec-book-item" data-book-id="${book.id}">
        <div style="position: relative; height: 180px; overflow: hidden; background: #f0f0f0;">
          <img src="${book.cover || window.PlaceholderFallback.book}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.book" />
          <div style="position: absolute; top: 8px; left: 8px; background: rgba(220,38,38,0.9); color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            ✨ Для тебе
          </div>
        </div>
        <div style="padding: 12px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${book.title}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">${book.author}</p>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #f59e0b;">⭐ ${book.avgRating}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
};

const attachCommunityEventHandlers = () => {
  document.querySelectorAll('.book-top-item, .trend-item, .rec-book-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const bookId = e.currentTarget.dataset.bookId;
      if (bookId && typeof openBookModal === 'function') {
        openBookModal(bookId);
      }
    });
  });
};

window.getCommunityBooks = getCommunityBooks;
window.getTopPopularBooks = getTopPopularBooks;
window.getReadingTrends = getReadingTrends;
window.getTopReaders = getTopReaders;
window.getActiveReaders = getActiveReaders;
window.getRecommendations = getRecommendations;
window.renderTopBooksSection = renderTopBooksSection;
window.renderTrendsSection = renderTrendsSection;
window.renderTopReadersSection = renderTopReadersSection;
window.renderActiveReadersSection = renderActiveReadersSection;
window.renderRecommendationsSection = renderRecommendationsSection;
window.attachCommunityEventHandlers = attachCommunityEventHandlers;

console.log('✅ Модуль нової спільноти завантажен');
