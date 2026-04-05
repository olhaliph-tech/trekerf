// Розширені функції для трекера читання
// Рейтинги, рецензії, цілі, досягнення, сортування

// ============ ФУНКЦІЇ ДЛЯ РЕЙТИНГІВ ============

const addRating = (bookId, rating) => {
  if (!state.books) return;
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;
  
  book.rating = Math.max(1, Math.min(5, rating));
  saveState();
  renderLibrary();
};

const getRating = (bookId) => {
  if (!state.books) return 0;
  const book = state.books.find(b => b.id === bookId);
  return book?.rating || 0;
};

const renderStars = (rating) => {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating ? '★' : '☆';
    html += `<span style="cursor:pointer; color:#ffc107; font-size:1.2rem;">${filled}</span>`;
  }
  return html;
};

// ============ ФУНКЦІЇ ДЛЯ РЕЦЕНЗІЙ ============

const addReview = (bookId, text, rating) => {
  if (!state.reviews) state.reviews = [];
  
  const review = {
    id: newId('review'),
    bookId,
    userId: state.user.id,
    text,
    rating,
    createdAt: new Date().toISOString()
  };
  
  state.reviews.push(review);
  saveState();
  return review;
};

const getReviews = (bookId) => {
  if (!state.reviews) return [];
  return state.reviews.filter(r => r.bookId === bookId);
};

const deleteReview = (reviewId) => {
  if (!state.reviews) return;
  state.reviews = state.reviews.filter(r => r.id !== reviewId);
  saveState();
};

const renderReviews = (bookId) => {
  const reviews = getReviews(bookId);
  if (!reviews.length) return '<p>Немає рецензій.</p>';
  
  return reviews.map(review => `
    <div style="background:rgba(255,255,255,0.3); padding:12px; border-radius:8px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between;">
        <div>
          <strong>Читач</strong> &mdash; ${renderStars(review.rating)}
        </div>
        <small style="color:#999;">${new Date(review.createdAt).toLocaleDateString('uk-UA')}</small>
      </div>
      <p style="margin:8px 0;">${review.text}</p>
    </div>
  `).join('');
};

// ============ ФУНКЦІЇ ДЛЯ СОРТУВАННЯ ============

const SORT_OPTIONS = {
  'date-new': { label: '📅 Нові', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  'date-old': { label: '📅 Старі', fn: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0) },
  'author-a': { label: '🔤 Автор (А-Я)', fn: (a, b) => (a.author || '').localeCompare(b.author || '', 'uk') },
  'author-z': { label: '🔤 Автор (Я-А)', fn: (a, b) => (b.author || '').localeCompare(a.author || '', 'uk') },
  'title-a': { label: '📖 Назва (А-Я)', fn: (a, b) => (a.title || '').localeCompare(b.title || '', 'uk') },
  'title-z': { label: '📖 Назва (Я-А)', fn: (a, b) => (b.title || '').localeCompare(a.title || '', 'uk') },
  'rating': { label: '⭐ Рейтинг', fn: (a, b) => (b.rating || 0) - (a.rating || 0) },
  'pages-asc': { label: '📄 Сторінок (зростання)', fn: (a, b) => (a.pages || 0) - (b.pages || 0) },
  'pages-desc': { label: '📄 Сторінок (спадання)', fn: (a, b) => (b.pages || 0) - (a.pages || 0) },
  'progress': { label: '📊 Прогрес (% спадання)', fn: (a, b) => {
    const pctA = (a.currentPage / a.pages) * 100 || 0;
    const pctB = (b.currentPage / b.pages) * 100 || 0;
    return pctB - pctA;
  }}
};

const getSortedBooks = (books, sortKey) => {
  const sortFn = SORT_OPTIONS[sortKey]?.fn;
  if (!sortFn) return books;
  return [...books].sort(sortFn);
};

// ============ ФУНКЦІЇ ДЛЯ ЦІЛЕЙ ============

const addGoal = (title, targetBooks, targetPages, createdAt = null) => {
  if (!state.goals) state.goals = [];
  
  const goal = {
    id: newId('goal'),
    title,
    targetBooks,
    targetPages,
    createdAt: createdAt || new Date().toISOString(),
    completed: false
  };
  
  state.goals.push(goal);
  saveState();
  return goal;
};

const updateGoal = (goalId, updates) => {
  if (!state.goals) return;
  const goal = state.goals.find(g => g.id === goalId);
  if (goal) {
    Object.assign(goal, updates);
    saveState();
  }
};

const deleteGoal = (goalId) => {
  if (!state.goals) return;
  state.goals = state.goals.filter(g => g.id !== goalId);
  saveState();
};

const getGoalProgress = (goal) => {
  const readBooks = state.books.filter(b => b.status === 'прочитано').length;
  const totalPages = state.books.reduce((sum, b) => sum + (b.finishedPage || 0), 0);
  
  return {
    booksProgress: Math.round((readBooks / goal.targetBooks) * 100),
    pagesProgress: Math.round((totalPages / goal.targetPages) * 100),
    booksRemaining: Math.max(0, goal.targetBooks - readBooks),
    pagesRemaining: Math.max(0, goal.targetPages - totalPages)
  };
};

const renderGoals = () => {
  if (!state.goals || !state.goals.length) {
    return '<p>Немає цілей. Створіть першу!</p>';
  }
  
  return state.goals.map(goal => {
    const prog = getGoalProgress(goal);
    return `
      <div style="background:rgba(255,255,255,0.4); padding:15px; border-radius:12px; margin-bottom:15px; border:2px solid rgba(230,150,180,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex:1;">
            <h4>${goal.title}</h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:10px;">
              <div>
                <small style="color:#999;">📚 Книги</small>
                <p style="font-size:14px;">${goal.targetBooks - prog.booksRemaining} / ${goal.targetBooks} (${prog.booksProgress}%)</p>
                <div style="background:rgba(230,150,180,0.1); height:8px; border-radius:4px; overflow:hidden;">
                  <div style="background:linear-gradient(90deg, #e6a0b4 0%, #e68aa3 100%); width:${prog.booksProgress}%; height:100%;"></div>
                </div>
              </div>
              <div>
                <small style="color:#999;">📄 Сторінки</small>
                <p style="font-size:14px;">${goal.targetPages - prog.pagesRemaining} / ${goal.targetPages} (${prog.pagesProgress}%)</p>
                <div style="background:rgba(230,150,180,0.1); height:8px; border-radius:4px; overflow:hidden;">
                  <div style="background:linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%); width:${prog.pagesProgress}%; height:100%;"></div>
                </div>
              </div>
            </div>
          </div>
          <button class="delete-goal" data-goal-id="${goal.id}" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
};

// ============ ФУНКЦІЇ ДЛЯ ДОСЯГНЕНЬ ============

const checkAchievements = () => {
  if (!state.achievements) state.achievements = [];
  
  const readBooks = state.books.filter(b => b.status === 'прочитано').length;
  const totalPages = state.books.reduce((sum, b) => sum + (b.finishedPage || 0), 0);
  const avgRating = state.books.filter(b => b.rating).length > 0 
    ? (state.books.reduce((sum, b) => sum + (b.rating || 0), 0) / state.books.filter(b => b.rating).length)
    : 0;
  
  const achievementsList = [
    { id: 'first-book', icon: '📖', title: 'Першочитець', desc: 'Прочити першу книгу', check: () => readBooks >= 1 },
    { id: 'five-books', icon: '📚', title: 'Любитель читання', desc: 'Прочити 5 книг', check: () => readBooks >= 5 },
    { id: 'ten-books', icon: '📚📚', title: 'Фанат літератури', desc: 'Прочити 10 книг', check: () => readBooks >= 10 },
    { id: 'fifty-books', icon: '🏆', title: 'Легенда читання', desc: 'Прочити 50 книг', check: () => readBooks >= 50 },
    { id: 'hundred-pages', icon: '📄', title: 'Сотень сторінок', desc: 'Прочити 100 сторінок', check: () => totalPages >= 100 },
    { id: 'thousand-pages', icon: '📄📄', title: 'Тисячник', desc: 'Прочити 1000 сторінок', check: () => totalPages >= 1000 },
    { id: 'high-rating', icon: '⭐', title: 'Цінитель литератури', desc: 'Середня оцінка 4+', check: () => avgRating >= 4 },
    { id: 'variety', icon: '🎨', title: 'Многогранник', desc: 'Прочити книги 5 різних жанрів', check: () => {
      const genres = new Set(state.books.filter(b => b.status === 'прочитано').map(b => b.genre));
      return genres.size >= 5;
    }},
    { id: 'streak-7', icon: '🔥', title: 'Невгасна пристрасть', desc: '7 днів поспіль читання', check: () => {
      const readDates = new Set();
      state.sessions.forEach(s => {
        const date = new Date(s.date).toISOString().split('T')[0];
        readDates.add(date);
      });
      // Простий чек - якщо є 7+ дат
      return readDates.size >= 7;
    }}
  ];
  
  achievementsList.forEach(achievement => {
    const exists = state.achievements.find(a => a.id === achievement.id);
    if (!exists && achievement.check()) {
      state.achievements.push({
        id: achievement.id,
        title: achievement.title,
        icon: achievement.icon,
        unlockedAt: new Date().toISOString()
      });
    }
  });
  
  saveState();
};

const renderAchievements = () => {
  checkAchievements();
  
  if (!state.achievements || !state.achievements.length) {
    return '<p>Досягнення з\'являтимуться по мірі вашого прогресу!</p>';
  }
  
  return state.achievements.map(ach => `
    <div style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:15px; background:rgba(255,215,0,0.15); border-radius:12px; border:2px solid rgba(255,215,0,0.3);">
      <div style="font-size:2rem;">${ach.icon}</div>
      <div style="text-align:center;">
        <strong>${ach.title}</strong>
        <p style="font-size:0.85rem; color:#999;">${new Date(ach.unlockedAt).toLocaleDateString('uk-UA')}</p>
      </div>
    </div>
  `).join('');
};

// ============ ФУНКЦІЇ ДЛЯ ТЕГІВ І КОЛЬОРІВ ============

const getGenreColor = (genre) => {
  const colors = {
    'фантастика': '#3b82f6',
    'детектив': '#8b5cf6',
    'романтика': '#ec4899',
    'фентезі': '#06b6d4',
    'драма': '#6366f1',
    'жахи': '#ef4444',
    'комедія': '#f59e0b',
    'приключення': '#10b981',
    'історія': '#f97316',
    'наука': '#06b6d4'
  };
  return colors[genre.toLowerCase()] || '#64748b';
};

const renderGenreTag = (genre) => {
  const color = getGenreColor(genre);
  return `<span style="background:${color}25; color:${color}; padding:4px 10px; border-radius:12px; font-size:0.85rem; font-weight:500;">${genre}</span>`;
};

// ============ API ДЛЯ РОЗШИРЕНОЇ БІБЛІОТЕКИ ============

const getEnhancedLibraryBooks = (folderId = null, status = null, search = null, sortKey = 'date-new') => {
  let books = [...state.books];
  
  if (folderId && folderId !== 'folder_all') {
    books = books.filter(b => b.folderId === folderId);
  }
  if (status && status !== 'all') {
    books = books.filter(b => b.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    books = books.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q)
    );
  }
  
  return getSortedBooks(books, sortKey);
};

// ============ ФУНКЦІЇ ДЛЯ ДРУЗІВ/ФОЛОВАННЯ ============

const followUser = (userId) => {
  if (!state.user.following) state.user.following = [];
  if (!state.user.following.includes(userId)) {
    state.user.following.push(userId);
    saveState();
  }
};

const unfollowUser = (userId) => {
  if (state.user.following) {
    state.user.following = state.user.following.filter(id => id !== userId);
    saveState();
  }
};

const isFollowing = (userId) => {
  return state.user.following?.includes(userId) || false;
};

// ============ ФУНКЦІЇ ДЛЯ РЕКОМЕНДАЦІЙ ============

const getBookRecommendations = (limit = 5) => {
  // Книги, які прочитали інші, maar не наш користувач
  const readByOthers = state.books.filter(b => b.status === 'прочитано');
  
  // Групуємо за рейтингом
  const sorted = [...readByOthers].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  
  return sorted.slice(0, limit);
};

// ============ ФУНКЦІЇ ДЛЯ СТАТИСТИКИ ЖАНРІВ ============

const getGenreStats = () => {
  const genreStats = {};
  
  state.books.forEach(book => {
    if (!genreStats[book.genre]) {
      genreStats[book.genre] = {
        total: 0,
        read: 0,
        reading: 0,
        abandoned: 0,
        avgRating: 0,
        totalRated: 0
      };
    }
    
    genreStats[book.genre].total++;
    
    if (book.status === 'прочитано') {
      genreStats[book.genre].read++;
      if (book.rating) {
        genreStats[book.genre].avgRating += book.rating;
        genreStats[book.genre].totalRated++;
      }
    } else if (book.status === 'читаю') {
      genreStats[book.genre].reading++;
    } else if (book.status === 'закинуто') {
      genreStats[book.genre].abandoned++;
    }
  });
  
  // Підраховуємо середнє
  Object.keys(genreStats).forEach(genre => {
    if (genreStats[genre].totalRated > 0) {
      genreStats[genre].avgRating = (genreStats[genre].avgRating / genreStats[genre].totalRated).toFixed(1);
    }
  });
  
  return genreStats;
};

const renderGenreStats = () => {
  const stats = getGenreStats();
  const sorted = Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  
  return sorted.map(([genre, data]) => `
    <div style="background:rgba(255,255,255,0.3); padding:12px; border-radius:8px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${renderGenreTag(genre)}</strong>
          <p style="font-size:0.9rem; color:#666; margin:4px 0;">
            📚 ${data.total} | ✅ ${data.read} | 📖 ${data.reading} | ❌ ${data.abandoned}
          </p>
          ${data.totalRated > 0 ? `<p style="font-size:0.9rem; color:#888;">⭐ Середня: ${data.avgRating}</p>` : ''}
        </div>
      </div>
    </div>
  `).join('');
};
