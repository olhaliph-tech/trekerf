// DOM елементи
const dom = {
  pages: document.querySelectorAll('.page'),
  navButtons: document.querySelectorAll('nav button'),
  folderFilter: document.getElementById('folderFilter'),
  statusFilter: document.getElementById('statusFilter'),
  searchInput: document.getElementById('searchInput'),
  bookList: document.getElementById('bookList'),
  libraryCount: document.getElementById('libraryCount'),
  newFolderName: document.getElementById('newFolderName'),
  createFolderBtn: document.getElementById('createFolderBtn'),
  deleteFolderBtn: document.getElementById('deleteFolderBtn'),
  manualForm: document.getElementById('manualForm'),
  externalSearchInput: document.getElementById('externalSearchInput'),
  externalSearchBtn: document.getElementById('externalSearchBtn'),
  externalResults: document.getElementById('externalResults'),
  stats: document.getElementById('stats'),
  calendar: document.getElementById('calendar'),
  progressChart: document.getElementById('progressChart'),
  activityFeed: document.getElementById('activityFeed'),
  profileInfo: document.getElementById('profileInfo'),
  profileFeed: document.getElementById('profileFeed'),
  bookModal: document.getElementById('bookModal'),
  closeModal: document.getElementById('closeModal'),
  modalBody: document.getElementById('modalBody'),
  // Таби та файли
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  coverUpload: document.getElementById('coverUpload'),
  coverFileName: document.getElementById('coverFileName'),
  coverPreview: document.getElementById('coverPreview')
};

const themeConfig = {
  default: { name: 'Синя', primary: '#2563eb', secondary: '#1d4ed8', light: '#f8fafc', bg: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' },
  green: { name: 'Зелена', primary: '#16a34a', secondary: '#22c55e', light: '#ecfdf5', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d9f99d 100%)' },
  purple: { name: 'Фіолетова', primary: '#7c3aed', secondary: '#a855f7', light: '#f5f3ff', bg: 'linear-gradient(135deg, #f5f3ff 0%, #e9d5ff 100%)' },
  warm: { name: 'Тепла', primary: '#ea580c', secondary: '#f97316', light: '#fff7ed', bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)' },
  dark: { name: 'Темна', primary: '#0f172a', secondary: '#1e293b', light: '#0f172a', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }
};

const applyTheme = (themeKey) => {
  const theme = themeConfig[themeKey] || themeConfig.default;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-light', theme.light);

  document.body.style.background = theme.bg;
  document.body.style.color = themeKey === 'dark' ? '#e2e8f0' : '#0f172a';

  document.querySelectorAll('nav button.active').forEach((btn) => {
    if (themeKey === 'dark') {
      btn.style.color = '#fff';
      btn.style.borderColor = '#334155';
    } else {
      btn.style.color = '#fff';
      btn.style.borderColor = theme.primary;
    }
  });

  localStorage.setItem('selectedTheme', themeKey);
};

const loadTheme = () => {
  const saved = localStorage.getItem('selectedTheme') || 'default';
  const themeSelector = document.getElementById('themeSelect');
  if (themeSelector) themeSelector.value = saved;
  applyTheme(saved);
};

const toggleThemePanel = () => {
  const panel = document.getElementById('themeSettingsPanel');
  if (!panel) return;
  panel.classList.toggle('hidden');
};

loadTheme();

// Функції рендерингу
const renderFolders = () => {
  if (!dom.folderFilter) return;
  dom.folderFilter.innerHTML = '';
  state.folders.forEach(f => {
    const o = document.createElement('option');
    o.value = f.id;
    o.textContent = f.name;
    dom.folderFilter.append(o);
  });
};

const renderLibrary = () => {
  const folderId = dom.folderFilter ? dom.folderFilter.value : 'folder_all';
  const status = dom.statusFilter ? dom.statusFilter.value : 'all';
  const search = dom.searchInput ? dom.searchInput.value.trim() : '';

  const books = getFilteredBooks(folderId, status, search);
  
  if (dom.libraryCount) {
    dom.libraryCount.textContent = `Відображено ${books.length} з ${state.books.length} книг`;
  }

  if (dom.bookList) {
    dom.bookList.innerHTML = books
      .map((b) => `
        <article class="book-card" data-id="${b.id}">
          <img src="${b.cover || window.PlaceholderFallback.book}" alt="${b.title}" onload="" onerror="this.src=window.PlaceholderFallback.book" />
          <h3>${b.title}</h3>
          <div class="card-meta"><span>Автор: ${b.author}</span><span>Жанр: ${b.genre}</span></div>
          <div class="card-meta"><span>Сторінок: ${b.pages}</span><span>Статус: ${b.status}</span></div>
          <div class="card-meta"><span>Папка: ${getFolderName(b.folderId)}</span></div>
          <button class="open-details">Деталі</button>
        </article>`)
      .join('');

    dom.bookList.querySelectorAll('.open-details').forEach((btn) => {
      btn.onclick = (e) => {
        const id = e.target.closest('.book-card').dataset.id;
        openBookModal(id);
      };
    });
  }
};

const renderSessionLog = (book) => {
  const sessions = getSessionsByBook(book.id);

  let html = '';
  if (book.activeSession) {
    html += `<div style="margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px dashed rgba(230,150,180,0.3); color: var(--color-primary);">⏳ <strong>Триває сесія:</strong> читання зі сторінки ${book.activeSession.startPage}</div>`;
  }

  if (!sessions.length && !book.activeSession) {
    return '<p>Немає сесій.</p>';
  }

  html += sessions
    .map((s) => {
      const speed = s.duration > 0 ? Math.round((s.pagesRead / s.duration) * 60) : 0;
      return `<div style="margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px dashed rgba(230,150,180,0.3);">${formatDate(s.date)}: ${s.startPage}→${s.endPage} (${s.pagesRead} стор. за ${s.duration} хв) ⚡ <strong>~${speed} стор/год</strong></div>`;
    })
    .join('');

  return html;
};

const renderReadingHistory = (book) => {
  const sessions = getSessionsByBook(book.id);
  const parts = [];

  if (book.activeSession) {
    parts.push(`<div style="margin-bottom: 10px; padding: 10px 12px; border: 1px dashed rgba(230,150,180,0.35); border-radius: 10px; background: rgba(255,255,255,0.45); color: var(--color-primary);"><strong>Триває сесія:</strong> читання зі сторінки ${book.activeSession.startPage}</div>`);
  }

  if (!sessions.length && !book.activeSession) {
    return '<p>Ще немає завершених сесій для цієї книги.</p>';
  }

  if (sessions.length) {
    parts.push(`<div style="margin-bottom: 10px; color: #64748b; font-size: 0.9rem;">Усього сесій: <strong>${sessions.length}</strong></div>`);
  }

  sessions.forEach((session) => {
    const speed = session.duration > 0 ? Math.round((session.pagesRead / session.duration) * 60) : 0;
    parts.push(`
      <div style="margin-bottom: 8px; padding: 10px 12px; border: 1px solid rgba(230,150,180,0.18); border-radius: 10px; background: rgba(255,255,255,0.35);">
        <div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
          <strong>${formatDate(session.date)}</strong>
          <span>${session.startPage} -> ${session.endPage}</span>
        </div>
        <div style="margin-top: 4px; color: #475569;">Прочитано ${session.pagesRead} стор. за ${session.duration} хв</div>
        <div style="margin-top: 2px; color: #64748b; font-size: 0.85rem;">Швидкість: ~${speed} стор./год</div>
      </div>
    `);
  });

  return parts.join('');
};

const renderAnalytics = () => {
  const analytics = getAnalyticsData();
  const statCards = buildStatCards();

  const streakDisplay = analytics.streak?.current > 0 
    ? `<div style="text-align: center; padding: 15px; background: linear-gradient(135deg, var(--color-primary), rgba(230, 150, 180, 0.6)); border-radius: 10px; color: white; margin-bottom: 15px;">
        <p style="font-size: 12px; margin: 0;">🔥 СЕРІЯ</p>
        <p style="font-size: 36px; margin: 5px 0; font-weight: bold;">${'🔥'.repeat(Math.min(analytics.streak.current, 5))}</p>
        <p style="font-size: 14px; margin: 5px 0;">${analytics.streak.current} днів поспіль</p>
        <p style="font-size: 12px; margin: 5px 0; opacity: 0.9;">Рекорд: ${analytics.streak.longest} днів</p>
      </div>`
    : '';

  dom.stats.innerHTML = streakDisplay + statCards
    .map(card => `<div class="stat-card"><strong>${card.label}</strong><p>${card.value}</p></div>`)
    .join('');

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const readingDays = analytics.readingDays || [];

  let calendarHtml = '<h3>📅 Календар (дні з читанням)</h3><div class="calendar-grid">';
  ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach((d) => {
    calendarHtml += `<div class="calendar-cell" style="font-weight:700;">${d}</div>`;
  });
  
  for (let i = 0; i < ((first.getDay() + 6) % 7); i++) {
    calendarHtml += '<div class="calendar-cell"></div>';
  }
  
  for (let d = 1; d <= days; d += 1) {
    const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
    const isReadingDay = readingDays.includes(dateStr);
    const isToday = dateStr === today.toISOString().slice(0, 10);
    
    const cellStyle = isReadingDay 
      ? 'background: linear-gradient(135deg, var(--color-primary), rgba(230, 150, 180, 0.6)); color: white; font-weight: bold;'
      : 'background: rgba(0,0,0,0.05);';
    
    const borderStyle = isToday ? 'border: 2px solid var(--color-primary);' : '';
    
    calendarHtml += `<div class="calendar-cell" style="${cellStyle} ${borderStyle} padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative;">
      ${d}
      ${isReadingDay ? '<span style="position: absolute; top: -5px; right: -5px; font-size: 18px;">🔥</span>' : ''}
    </div>`;
  }
  
  calendarHtml += '</div>';
  dom.calendar.innerHTML = calendarHtml;

  let stats = '<h3>📊 Розподіл книг</h3>';
  stats += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">';
  stats += `<div style="background: rgba(255, 255, 255, 0.4); padding: 15px; border-radius: 10px; text-align: center;">
    <strong style="color: var(--color-primary);">Бажаю</strong>
    <p style="font-size: 24px; margin: 8px 0; color: var(--color-primary);">${analytics.notStarted}</p>
  </div>`;
  stats += `<div style="background: rgba(255, 255, 255, 0.4); padding: 15px; border-radius: 10px; text-align: center;">
    <strong style="color: var(--color-primary);">Читаю</strong>
    <p style="font-size: 24px; margin: 8px 0; color: var(--color-primary);">${analytics.reading}</p>
  </div>`;
  stats += `<div style="background: rgba(255, 255, 255, 0.4); padding: 15px; border-radius: 10px; text-align: center;">
    <strong style="color: var(--color-primary);">Прочитано</strong>
    <p style="font-size: 24px; margin: 8px 0; color: var(--color-primary);">${analytics.readBooks}</p>
  </div>`;
  stats += `<div style="background: rgba(255, 255, 255, 0.4); padding: 15px; border-radius: 10px; text-align: center;">
    <strong style="color: var(--color-primary);">Закинуто</strong>
    <p style="font-size: 24px; margin: 8px 0; color: var(--color-primary);">${analytics.abandoned}</p>
  </div>`;
  stats += '</div>';

  dom.progressChart.innerHTML = stats;
};

const renderFeedItemsHtml = (items, reactionEmojis) => {
  return items.map(item => `
    <div class="activity-item">
      <div class="activity-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <img src="${item.userObj?.avatar || window.PlaceholderFallback.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.avatar" />
        <div>
          <span class="author" style="font-weight: bold; display: block; color: var(--color-primary);">${item.userObj?.name || 'Невідомий'} <span style="color: #64748b; font-size: 12px; font-weight: normal;">@${item.userObj?.nickname || ''}</span></span>
          <span class="date" style="font-size: 12px; color: #94a3b8;">${formatDate(item.date)}</span>
        </div>
      </div>
      <div class="activity-text">${item.text}</div>
      
      <div class="reactionsPanel">
        ${Object.entries(item.reactionCounts).map(([type, count]) => 
          `<span class="reaction-badge">${reactionEmojis[type]} ${count}</span>`
        ).join('')}
      </div>
      
      <div class="activity-actions">
        ${Object.entries(reactionEmojis).map(([type, emoji]) => 
          `<button class="reactButton ${item.userReaction?.type === type ? 'active' : ''}" data-post-id="${item.id}" data-reaction="${type}">${emoji}</button>`
        ).join('')}
        <button class="commentBtn" data-post-id="${item.id}">💬 Коментувати</button>
      </div>
      
      ${item.comments.length > 0 ? `
        <div class="commentSection">
          <strong style="color: #6b4a52;">Коментарі (${item.comments.length})</strong>
          <div class="commentList">
            ${item.comments.map(c => 
              `<div class="comment" style="display: flex; gap: 8px; margin-top: 8px; align-items: center;">
                <img src="${c.userObj?.avatar || window.PlaceholderFallback.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.avatar" />
                <div>
                  <span class="comment-author" style="font-weight: bold; font-size: 13px; color: var(--color-primary);">${c.userObj?.name || 'Читач'}:</span>
                  <span style="font-size: 13px;">${c.text}</span>
                </div>
               </div>`
            ).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
};

const attachUserSearchEvents = () => {
  const searchInput = document.getElementById('userSearchInput');
  const resultsDiv = document.getElementById('userSearchResults');
  if (!searchInput || !resultsDiv) return;

  const renderUsers = (query) => {
    const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
    const q = query.toLowerCase();
    const filtered = users.filter(u => 
      u.id !== state.user.id && 
      (u.name.toLowerCase().includes(q) || u.nickname.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      resultsDiv.innerHTML = query ? '<p style="color: #94a3b8; font-size: 14px; padding: 10px 0;">Користувачів не знайдено</p>' : '';
      return;
    }

    resultsDiv.innerHTML = filtered.map(u => {
      const isFollowing = state.user.following?.includes(u.id);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 10px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${u.avatar || window.PlaceholderFallback.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onerror="this.src=window.PlaceholderFallback.avatar" />
            <div>
              <div style="font-weight: bold; color: var(--color-primary);">${u.name}</div>
              <div style="font-size: 12px; color: #64748b;">@${u.nickname} • ${u.followers?.length || 0} підписників</div>
            </div>
          </div>
          <button class="followBtn" data-id="${u.id}" style="padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; transition: 0.2s; ${isFollowing ? 'background: #e2e8f0; color: #475569;' : 'background: var(--color-primary); color: white;'}">
            ${isFollowing ? 'Відписатися' : 'Підписатися'}
          </button>
        </div>
      `;
    }).join('');

    resultsDiv.querySelectorAll('.followBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.target.dataset.id;
        toggleFollow(targetId);
        renderUsers(searchInput.value.trim());
        renderProfile();
      });
    });
  };

  searchInput.addEventListener('input', (e) => {
    renderUsers(e.target.value.trim());
  });

  renderUsers(''); 
};

const toggleFollow = (targetId) => {
  const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
  
  const currentUserIndex = users.findIndex(u => u.id === state.user.id);
  const targetUserIndex = users.findIndex(u => u.id === targetId);
  
  if (currentUserIndex === -1 || targetUserIndex === -1) return;

  const currentUser = users[currentUserIndex];
  const targetUser = users[targetUserIndex];

  currentUser.following = currentUser.following || [];
  targetUser.followers = targetUser.followers || [];

  const followingIndex = currentUser.following.indexOf(targetId);
  if (followingIndex !== -1) {
    currentUser.following.splice(followingIndex, 1);
    targetUser.followers = targetUser.followers.filter(id => id !== state.user.id);
  } else {
    currentUser.following.push(targetId);
    targetUser.followers.push(state.user.id);
  }

  localStorage.setItem('readingTrackerUsers', JSON.stringify(users));
  state.user = currentUser;
  if (typeof saveStateToStorage === 'function') saveStateToStorage();
};

const renderFeed = () => {
  // ===== НОВА СПІЛЬНОТА (замість показування всіх дій) =====
  
  const communityHtml = `
    <!-- 🏆 ТОП ПОПУЛЯРНІ КНИГИ -->
    <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--color-primary); display: flex; align-items: center; gap: 8px; font-size: 18px;">🏆 Найбільш популярні</h3>
      <div id="topBooksSection">
        <p style="color: #999; padding: 15px; text-align: center;">Завантаження...</p>
      </div>
    </div>

    <!-- 🔥 ТРЕНДИ (які читають зараз) -->
    <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--color-primary); display: flex; align-items: center; gap: 8px; font-size: 18px;">🔥 Тренди - що читають зараз</h3>
      <div id="trendsSection">
        <p style="color: #999; padding: 15px; text-align: center;">Завантаження...</p>
      </div>
    </div>

    <!-- 📲 АКТИВНІ ЧИТАЧИ ЗАРАЗ -->
    <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--color-primary); display: flex; align-items: center; gap: 8px; font-size: 18px;">📲 Читають зараз</h3>
      <div id="activeReadersSection">
        <p style="color: #999; padding: 15px; text-align: center;">Завантаження...</p>
      </div>
    </div>

    <!-- 👑 ТОП ЧИТАЧІВ -->
    <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--color-primary); display: flex; align-items: center; gap: 8px; font-size: 18px;">👑 Топ читачів</h3>
      <div id="topReadersSection">
        <p style="color: #999; padding: 15px; text-align: center;">Завантаження...</p>
      </div>
    </div>

    <!-- ✨ РЕКОМЕНДАЦІЇ -->
    <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--color-primary); display: flex; align-items: center; gap: 8px; font-size: 18px;">✨ Можливо, тобі сподобається</h3>
      <div id="recommendationsSection">
        <p style="color: #999; padding: 15px; text-align: center;">Завантаження...</p>
      </div>
    </div>
  `;

  dom.activityFeed.innerHTML = communityHtml;

  // Заповнюємо секції даними
  setTimeout(() => {
    if (typeof renderTopBooksSection === 'function') {
      document.getElementById('topBooksSection').innerHTML = renderTopBooksSection();
    }
    if (typeof renderTrendsSection === 'function') {
      document.getElementById('trendsSection').innerHTML = renderTrendsSection();
    }
    if (typeof renderActiveReadersSection === 'function') {
      document.getElementById('activeReadersSection').innerHTML = renderActiveReadersSection();
    }
    if (typeof renderTopReadersSection === 'function') {
      document.getElementById('topReadersSection').innerHTML = renderTopReadersSection();
    }
    if (typeof renderRecommendationsSection === 'function') {
      document.getElementById('recommendationsSection').innerHTML = renderRecommendationsSection();
    }
    
    // Прикріплюємо обработчики подій
    if (typeof attachCommunityEventHandlers === 'function') {
      attachCommunityEventHandlers();
    }
  }, 50);

  // ===== ПРОФІЛЬ КОРИСТУВАЧА (особистий) =====
  
  const profileHtml = `
    <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--color-primary); font-size: 18px;">📊 Мні статистика</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size: 28px; font-weight: bold; color: var(--color-primary);" id="myReadBooks">-</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Книг прочитано</div>
        </div>
        <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size: 28px; font-weight: bold; color: var(--color-primary);" id="myReadPages">-</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Сторінок прочитано</div>
        </div>
        <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size: 28px; font-weight: bold; color: var(--color-primary);" id="myFavoriteGenre">-</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Улюблений жанр</div>
        </div>
      </div>
    </div>
  `;

  dom.profileFeed.innerHTML = profileHtml;

  // Заповнюємо особистої статистики
  setTimeout(() => {
    const myBooks = state.books || [];
    const readBooks = myBooks.filter(b => b.status === 'прочитано');
    const totalPages = readBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
    
    const genreStats = {};
    readBooks.forEach(b => {
      genreStats[b.genre] = (genreStats[b.genre] || 0) + 1;
    });
    const favoriteGenre = Object.entries(genreStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Нема даних';

    document.getElementById('myReadBooks').textContent = readBooks.length;
    document.getElementById('myReadPages').textContent = totalPages;
    document.getElementById('myFavoriteGenre').textContent = favoriteGenre;
  }, 50);
};

const renderProfile = () => {
  const readBooks = state.books.filter(b => b.status === 'прочитано').length;
  const user = state.user;
  
  dom.profileInfo.innerHTML = `
    <div style="background: rgba(255,255,255,0.7); border-radius: 20px; padding: 30px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; position: relative; max-width: 600px; margin: 0 auto;">
      <button id="logoutBtn" style="position: absolute; top: 15px; right: 15px; padding: 8px 16px; background: #fee2e2; color: #ef4444; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.2s;">🚪 Вийти</button>
      
      <div style="margin-bottom: 15px; position: relative; display: inline-block;">
        <img id="profileAvatarImg" src="${user.avatar}" alt="avatar" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--color-light); box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
        <input type="file" id="avatarUpload" accept="image/*" style="display: none;" />
        <label for="avatarUpload" style="position: absolute; bottom: 5px; right: 5px; background: white; border-radius: 50%; padding: 6px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); line-height: 1;">✏️</label>
      </div>

      <h3 style="margin: 0 0 5px 0; font-size: 24px; color: var(--color-primary);">${user.name}</h3>
      <p style="color: #64748b; margin: 0 0 15px 0; font-size: 15px;">@${user.nickname}</p>
      <p style="font-style: italic; color: #475569; margin-bottom: 25px; line-height: 1.5;">"${user.bio}"</p>
      
      <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
        <div style="background: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); min-width: 100px;">
          <strong style="display: block; font-size: 20px; color: var(--color-primary);">${user.following?.length || 0}</strong>
          <span style="font-size: 13px; color: #64748b;">Підписки</span>
        </div>
        <div style="background: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); min-width: 100px;">
          <strong style="display: block; font-size: 20px; color: var(--color-primary);">${user.followers?.length || 0}</strong>
          <span style="font-size: 13px; color: #64748b;">Підписники</span>
        </div>
        <div style="background: white; padding: 12px 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); min-width: 100px;">
          <strong style="display: block; font-size: 20px; color: var(--color-primary);">${readBooks}</strong>
          <span style="font-size: 13px; color: #64748b;">Прочитано</span>
        </div>
      </div>
      
      <button id="editProfileBtn" style="padding: 12px 24px; background: var(--color-primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%; max-width: 250px; transition: 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">✏️ Редагувати профіль</button>
    </div>

    <form id="editProfileForm" style="display:none; margin: 20px auto 0; max-width: 600px; background: rgba(255,255,255,0.7); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); flex-direction: column; gap: 15px;">
      <h4 style="margin: 0 0 10px 0; color: var(--color-primary); text-align: center; font-size: 18px;">Редагування даних</h4>
      <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
        <label style="font-size: 14px; font-weight: bold; color: #475569;">Ім'я:</label>
        <input type="text" id="editName" value="${user.name}" style="padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; transition: border-color 0.2s;">
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
        <label style="font-size: 14px; font-weight: bold; color: #475569;">Нікнейм:</label>
        <input type="text" id="editNickname" value="${user.nickname}" style="padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none;">
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
        <label style="font-size: 14px; font-weight: bold; color: #475569;">Біографія:</label>
        <textarea id="editBio" rows="3" style="padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; resize: vertical;">${user.bio}</textarea>
      </div>
      <button type="submit" style="padding: 14px; background: #10b981; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);">💾 Зберегти зміни</button>
    </form>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('readingTrackerAuth');
    location.reload();
  });

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    const form = document.getElementById('editProfileForm');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('avatarUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const newAvatar = canvas.toDataURL('image/jpeg', 0.8);
        user.avatar = newAvatar;
        const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].avatar = newAvatar;
          localStorage.setItem('readingTrackerUsers', JSON.stringify(users));
        }
        if (typeof saveStateToStorage === 'function') saveStateToStorage();
        renderProfile();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    user.name = document.getElementById('editName').value.trim();
    user.nickname = document.getElementById('editNickname').value.trim();
    user.bio = document.getElementById('editBio').value.trim();
    
    const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      localStorage.setItem('readingTrackerUsers', JSON.stringify(users));
    }
    
    if (typeof saveStateToStorage === 'function') saveStateToStorage();
    renderProfile();
  });
};

// Функції для табів
const switchTab = (tabName) => {
  if (!dom.tabContents.length || !dom.tabBtns.length) return;

  dom.tabContents.forEach(tab => {
    tab.classList.remove('active');
    tab.style.display = 'none';
  });
  dom.tabBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.style.background = '#e2e8f0';
    btn.style.color = '#475569';
    btn.style.boxShadow = 'none';
  });

  const content = document.getElementById(`tab-${tabName}`);
  if (content) {
    content.classList.add('active');
    content.style.display = 'block';
  }

  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'var(--color-primary)';
    btn.style.color = 'white';
    btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
  }
};

// Обробка завантаження фото
const setupCoverUpload = () => {
  if (!dom.coverFileName || !dom.coverUpload || !dom.coverPreview) return;
  
  dom.coverFileName.addEventListener('click', () => {
    dom.coverUpload.click();
  });
  
  dom.coverUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        dom.coverFileName.textContent = file.name;
        dom.coverPreview.src = compressed;
        dom.coverPreview.style.display = 'block';
        dom.coverUpload.dataset.base64 = compressed;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

window.renderAddPageUI = () => {
  const addPage = document.getElementById('add');
  if (!addPage) return;

  addPage.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px 0;">
      <h2 style="color: var(--color-primary); text-align: center; margin-bottom: 20px; font-size: 24px;">📚 Додати нову книгу</h2>
      
      <div style="display: flex; gap: 10px; margin-bottom: 25px; justify-content: center;">
        <button class="tab-btn active" data-tab="manual" type="button" style="flex: 1; padding: 12px 20px; border: none; border-radius: 12px; background: var(--color-primary); color: white; cursor: pointer; font-weight: bold; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">✏️ Вручну</button>
        <button class="tab-btn" data-tab="search" type="button" style="flex: 1; padding: 12px 20px; border: none; border-radius: 12px; background: #e2e8f0; color: #475569; cursor: pointer; font-weight: bold; transition: 0.2s;">🔍 Пошук з бази</button>
      </div>

      <div id="tab-manual" class="tab-content active" style="display: block;">
        <form id="manualForm" style="display: flex; flex-direction: column; gap: 15px; background: rgba(255,255,255,0.7); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <input type="text" name="title" placeholder="Назва книги" required style="padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-size: 15px; background: white;">
          <input type="text" name="author" placeholder="Автор" required style="padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-size: 15px; background: white;">
          <input type="text" name="genre" placeholder="Жанр (Фентезі, Роман, тощо)" required style="padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-size: 15px; background: white;">
          <input type="number" name="pages" placeholder="Кількість сторінок" min="1" required style="padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-size: 15px; background: white;">
          <textarea name="description" placeholder="Короткий опис книги..." rows="3" style="padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; resize: vertical; font-size: 15px; background: white;"></textarea>
          
          <div style="border: 2px dashed #94a3b8; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; position: relative; background: rgba(255,255,255,0.5); transition: 0.2s;">
            <span id="coverFileName" style="color: #475569; font-weight: bold; display: block; margin-bottom: 5px;">🖼 Натисніть, щоб вибрати обкладинку</span>
            <input type="file" id="coverUpload" accept="image/*" style="display: none;">
            <img id="coverPreview" src="" alt="Preview" style="display: none; max-width: 120px; margin: 10px auto 0; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          </div>
          
          <button type="submit" style="padding: 16px; background: #10b981; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 5px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); transition: 0.2s;">➕ Зберегти книгу</button>
        </form>
      </div>

      <div id="tab-search" class="tab-content" style="display: none;">
        <div style="background: rgba(255,255,255,0.7); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center;">
          <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">Шукайте книги у всесвітній базі OpenLibrary (найкраще англійською)</p>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input type="text" id="externalSearchInput" placeholder="Назва книги (напр. Harry Potter)..." style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-size: 15px; background: white;">
            <button id="externalSearchBtn" type="button" style="padding: 14px 24px; background: var(--color-primary); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: 0.2s;">🔍 Знайти</button>
          </div>
          <div id="externalResults" style="display: flex; flex-direction: column; gap: 15px; text-align: left; max-height: 400px; overflow-y: auto; padding-right: 5px;"></div>
        </div>
      </div>
    </div>
  `;

  // Оновлюємо посилання, щоб інші функції бачили нову форму!
  dom.manualForm = document.getElementById('manualForm');
  dom.externalSearchInput = document.getElementById('externalSearchInput');
  dom.externalSearchBtn = document.getElementById('externalSearchBtn');
  dom.externalResults = document.getElementById('externalResults');
  dom.tabBtns = document.querySelectorAll('#add .tab-btn');
  dom.tabContents = document.querySelectorAll('#add .tab-content');
  dom.coverUpload = document.getElementById('coverUpload');
  dom.coverFileName = document.getElementById('coverFileName');
  dom.coverPreview = document.getElementById('coverPreview');
};

window.renderAuthScreen = () => {
  const authDiv = document.createElement('div');
  authDiv.id = 'authOverlay';
  authDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg, #fdfbfb 0%, #eaedee 100%);z-index:9999;display:flex;justify-content:center;align-items:center;font-family:sans-serif;';
  authDiv.innerHTML = `
    <div style="background:white;padding:40px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.1);width:100%;max-width:350px;text-align:center;">
      <h2 id="authTitle" style="color:#6b4a52;margin-bottom:20px;font-size:24px;">Вхід у трекер</h2>
      <form id="authForm" style="display:flex;flex-direction:column;gap:15px;">
        <input type="text" id="authName" placeholder="Ваше ім'я" style="display:none;padding:12px;border:1px solid #ddd;border-radius:8px;outline:none;">
        <input type="email" id="authEmail" placeholder="Email" required style="padding:12px;border:1px solid #ddd;border-radius:8px;outline:none;">
        <input type="password" id="authPassword" placeholder="Пароль" required style="padding:12px;border:1px solid #ddd;border-radius:8px;outline:none;">
        <button type="submit" style="padding:14px;background:linear-gradient(135deg, #e6a0b4 0%, #e68aa3 100%);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:16px;transition:0.3s;">Увійти</button>
      </form>
      <p style="margin-top:20px;color:#888;font-size:14px;">
        <span id="authToggleText">Немає акаунту?</span>
        <a href="#" id="authToggleBtn" style="color:#6b4a52;text-decoration:none;font-weight:bold;">Зареєструватися</a>
      </p>
    </div>
  `;
  document.body.appendChild(authDiv);

  let isLogin = true;
  const authTitle = document.getElementById('authTitle');
  const authForm = document.getElementById('authForm');
  const authName = document.getElementById('authName');
  const authToggleText = document.getElementById('authToggleText');
  const authToggleBtn = document.getElementById('authToggleBtn');
  const submitBtn = authForm.querySelector('button');

  authToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? 'Вхід у трекер' : 'Реєстрація';
    submitBtn.textContent = isLogin ? 'Увійти' : 'Зареєструватися';
    authToggleText.textContent = isLogin ? 'Немає акаунту?' : 'Вже є акаунт?';
    authToggleBtn.textContent = isLogin ? 'Зареєструватися' : 'Увійти';
    authName.style.display = isLogin ? 'none' : 'block';
    authName.required = !isLogin;
  });

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const name = authName.value.trim();
    const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('readingTrackerAuth', user.id);
        document.body.removeChild(authDiv);
        if (typeof window.initAppAfterAuth === 'function') window.initAppAfterAuth(user.id);
        else location.reload();
      } else {

      }
    } else {
      if (users.find(u => u.email === email)) {
        return;
      }
      const newUser = { 
        id: 'user_' + Date.now(), 
        name: name || 'Читач', 
        nickname: email.split('@')[0], 
        email, 
        password,
        avatar: window.PlaceholderFallback.avatar,
        bio: 'Мій профіль читача',
        following: [],
        followers: []
      };
      users.push(newUser);
      localStorage.setItem('readingTrackerUsers', JSON.stringify(users));
      localStorage.setItem('readingTrackerAuth', newUser.id);
      document.body.removeChild(authDiv);
      if (typeof window.initAppAfterAuth === 'function') window.initAppAfterAuth(newUser.id);
      else location.reload();
    }
  });
};

const attachFeedEvents = () => {
  document.querySelectorAll('.reactButton').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      const reactionType = e.target.dataset.reaction;
      toggleReaction(postId, reactionType);
      renderFeed();
    });
  });
  
  document.querySelectorAll('.commentBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      openCommentInput(postId);
    });
  });
};

const openCommentInput = (postId) => {
  const existingInput = document.querySelector(`[data-comment-post="${postId}"]`);
  if (existingInput) {
    existingInput.remove();
    return;
  }
  
  const items = document.querySelectorAll('.activity-item');
  let item = null;
  items.forEach(el => {
    if (el.innerHTML.includes(postId)) item = el;
  });
  
  if (!item) return;
  
  let commentSection = item.querySelector('.commentSection');
  if (!commentSection) {
    commentSection = document.createElement('div');
    commentSection.className = 'commentSection';
    commentSection.innerHTML = '<strong style="color: #6b4a52;">Коментарі</strong><div class="commentList"></div>';
    item.appendChild(commentSection);
  }
  
  const inputDiv = document.createElement('div');
  inputDiv.className = 'commentInput';
  inputDiv.setAttribute('data-comment-post', postId);
  inputDiv.innerHTML = `
    <input placeholder="Напишіть коментар..." class="comment-input" />
    <button style="padding: 8px 12px; background: linear-gradient(135deg, #e6a0b4 0%, #e68aa3 100%); color: #fff; border: none; border-radius: 10px; cursor: pointer;">Надіслати</button>
  `;
  
  inputDiv.querySelector('button').addEventListener('click', () => {
    const text = inputDiv.querySelector('.comment-input').value.trim();
    if (text) {
      addComment(postId, text);
      renderFeed();
    }
  });
  
  commentSection.insertBefore(inputDiv, commentSection.querySelector('.commentList'));
};

const renderBookEditForm = (book) => {
  dom.modalBody.innerHTML = `
    <h3>🛠 Редагування книги</h3>
    <form id="editBookForm" class="form-grid">
      <label>📚 Назва<input name="title" value="${book.title}" required /></label>
      <label>📖 Автор<input name="author" value="${book.author}" required /></label>
      <label>🏷️ Жанр<input name="genre" value="${book.genre}" required /></label>
      <label>📄 Сторінок<input name="pages" type="number" min="1" value="${book.pages}" required /></label>
      <label>✍️ Опис<textarea name="description" rows="4">${book.description || ''}</textarea></label>
      <label>🖼️ Посилання на обкладинку<input name="cover" value="${book.cover || ''}" /></label>
      <button type="submit">💾 Зберегти</button>
      <button type="button" id="cancelEditBtn">✖️ Відмінити</button>
    </form>
  `;

  const editForm = document.getElementById('editBookForm');
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(editForm);
    const updates = {
      title: formData.get('title').trim(),
      author: formData.get('author').trim(),
      genre: formData.get('genre').trim(),
      pages: Number(formData.get('pages')) || 1,
      description: formData.get('description').trim(),
      cover: formData.get('cover').trim()
    };

    editBook(book.id, updates);
    renderFolders();
    renderLibrary();
    openBookModal(book.id);

  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    openBookModal(book.id);
  });
};

let modalTimerInterval = null;

// Спеціальне стилізоване вікно для введення сторінок замість системного prompt
const customPrompt = (title, message, defaultValue, maxVal) => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);display:flex;justify-content:center;align-items:center;z-index:9999;animation:fadeIn 0.2s ease;';
    
    const modalBox = document.createElement('div');
    modalBox.className = 'modal-content';
    modalBox.style.cssText = 'max-width:400px; padding:25px; text-align:center; box-shadow:0 15px 40px rgba(0,0,0,0.2);';
    
    modalBox.innerHTML = `
      <h3 style="margin-top:0; color:var(--color-primary); font-size:1.4rem;">${title}</h3>
      <p style="color:#64748b; margin-bottom:20px; font-size:1rem;">${message}</p>
      <input type="number" id="cpInput" value="${defaultValue}" min="0" max="${maxVal}" style="width:100%; padding:14px; font-size:1.3rem; text-align:center; border-radius:12px; border:2px solid rgba(230,150,180,0.4); margin-bottom:20px; outline:none; transition:all 0.3s; background:rgba(255,255,255,0.8); color:var(--color-dark); font-weight:bold; box-sizing:border-box;">
      <div style="display:flex; gap:10px;">
        <button id="cpCancel" style="flex:1; background:rgba(226, 232, 240, 0.8); color:#475569; box-shadow:none; border:none;">Скасувати</button>
        <button id="cpSubmit" style="flex:1; background:var(--color-primary); color:white; border:none;">Підтвердити</button>
      </div>
    `;
    
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
    
    const input = overlay.querySelector('#cpInput');
    input.focus();
    input.select();
    
    const cleanup = () => document.body.removeChild(overlay);
    
    overlay.querySelector('#cpSubmit').onclick = () => { cleanup(); resolve(input.value); };
    overlay.querySelector('#cpCancel').onclick = () => { cleanup(); resolve(null); };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { cleanup(); resolve(input.value); }
      if (e.key === 'Escape') { cleanup(); resolve(null); }
    });
  });
};

const formatSessionTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const openBookModal = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return;

  if (modalTimerInterval) clearInterval(modalTimerInterval);

  // Ініціалізуємо нові поля для заметок, оцінок та відгуків
  if (typeof initializeBookNotesRatingsReviews === 'function') {
    initializeBookNotesRatingsReviews(book);
  }

  dom.modalBody.innerHTML = `
    <div class="modal-tabs" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid rgba(230,150,180,0.2); padding-bottom:10px; flex-wrap: wrap;">
      <button class="modal-tab-btn active" data-tab="info" style="flex:1; min-width: 100px;">ℹ️ Інформація</button>
      <button class="modal-tab-btn" data-tab="reading" style="flex:1; min-width: 100px;">⏳ Читання</button>
      <button class="modal-tab-btn" data-tab="notes" style="flex:1; min-width: 100px;">📝 Заметки</button>
      <button class="modal-tab-btn" data-tab="rating-review" style="flex:1; min-width: 100px;">⭐ Оцінка</button>
    </div>

    <div id="tab-info" class="modal-tab-content active" style="display:block;">
      <h3>${book.title}</h3>
      <p><strong>Автор:</strong> ${book.author}</p>
      <p><strong>Жанр:</strong> ${book.genre}</p>
      <p><strong>Сторінок:</strong> ${book.pages}</p>
      <p><strong>Статус:</strong> ${book.status}</p>
      <div style="text-align: center;">
        <img src="${book.cover || window.PlaceholderFallback.book}" alt="cover" style="width:100%;max-width:260px;margin:10px 0;border-radius:12px;" onerror="this.src=window.PlaceholderFallback.book" />
      </div>
      <p>${book.description || 'Немає опису.'}</p>

      <div class="modal-row">
        <label>Папка:<br /><select id="modalFolderSelect">${state.folders
          .filter(f => f.id !== 'folder_all')
          .map(f => `<option value="${f.id}" ${book.folderId === f.id ? 'selected' : ''}>${f.name}</option>`)
          .join('')}</select></label>
        <label>Статус:<br /><select id="modalStatusSelect">${statuses
          .map(s => `<option value="${s}" ${book.status === s ? 'selected' : ''}>${s}</option>`)
          .join('')}</select></label>
      </div>
      <div class="modal-actions" style="display:flex;gap:8px;margin-top:15px;flex-wrap:wrap;">
        <button id="editBookBtn">✍️ Редагувати</button>
        <button id="deleteBookBtn" style="background:#f87171;color:#fff;">🗑️ Видалити</button>
      </div>
    </div>

    <div id="tab-reading" class="modal-tab-content" style="display:none;">
      <div id="readingTimerContainer" style="text-align: center; padding: 20px; background: rgba(255,255,255,0.5); border-radius: 16px; margin-bottom: 20px;">
        <div id="bookAnimation" class="book-animation ${book.activeSession?.isRunning ? 'running' : ''}" style="font-size: 4rem; margin-bottom: 10px;">📖</div>
        <div id="timerDisplay" style="font-size: 2.5rem; font-weight: bold; font-family: monospace; color: var(--color-primary); margin-bottom: 10px;">00:00:00</div>
        
        <p style="color: #64748b; margin-bottom: 5px;">Поточна сторінка: <strong id="currentReadingPage" style="color: var(--color-dark); font-size: 1.2rem;">${book.currentPage || 0}</strong> / ${book.pages}</p>
        
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">
          <span>Прогрес:</span>
          <strong id="readingProgressText">${Math.round(((book.currentPage || 0) / book.pages) * 100) > 100 ? 100 : Math.round(((book.currentPage || 0) / book.pages) * 100) || 0}%</strong>
        </div>
        <div style="width: 100%; background: rgba(230,150,180,0.2); border-radius: 8px; height: 10px; margin-bottom: 20px; overflow: hidden;">
          <div id="readingProgressBar" style="width: ${Math.round(((book.currentPage || 0) / book.pages) * 100) > 100 ? 100 : Math.round(((book.currentPage || 0) / book.pages) * 100) || 0}%; background: var(--color-primary); height: 100%; transition: width 0.4s ease;"></div>
        </div>
        
        <div class="modal-actions" style="justify-content: center; gap: 10px;">
          <button id="startTimerBtn" style="background: #10b981; display: ${book.activeSession ? 'none' : 'inline-block'};">▶️ Почати читати</button>
          <button id="toggleTimerBtn" style="background: ${book.activeSession?.isRunning ? '#f59e0b' : '#10b981'}; display: ${book.activeSession ? 'inline-block' : 'none'};">${book.activeSession?.isRunning ? '⏸️ Пауза' : '▶️ Продовжити'}</button>
          <button id="finishTimerBtn" style="background: var(--color-primary); display: ${book.activeSession ? 'inline-block' : 'none'};">✅ Завершити</button>
          <button id="cancelTimerBtn" style="background: #ef4444; display: ${book.activeSession ? 'inline-block' : 'none'};">❌ Скасувати</button>
        </div>
      </div>
      <h4 style="margin-bottom: 10px; color: #6b4a52;">Історія сесій</h4>
      <div id="sessionLog" style="font-size:.9rem; max-height:220px; overflow-y:auto; padding: 10px; background: rgba(255,255,255,0.3); border-radius: 10px;">${renderReadingHistory(book)}</div>
    </div>

    <div id="tab-notes" class="modal-tab-content" style="display:none;">
      ${typeof renderNotesUI === 'function' ? renderNotesUI(book.id) : '<p>Заметки недоступні</p>'}
    </div>

    <div id="tab-rating-review" class="modal-tab-content" style="display:none;">
      <div style="background: rgba(255,255,255,0.35); padding: 15px; border-radius: 12px;">
        <h5 style="margin: 0 0 10px 0; color: var(--color-primary);">⭐ Ваша оцінка</h5>
        ${typeof renderRatingInput === 'function' ? renderRatingInput(book.id, book.rating || 0) : '<p>Оцінки недоступні</p>'}
      </div>
      ${typeof renderReviewUI === 'function' ? renderReviewUI(book.id, book) : '<p>Відгуки недоступні</p>'}
    </div>
  `;

  dom.bookModal.classList.remove('hidden');

  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.modal-tab-content').forEach(c => c.style.display = 'none');
      e.target.classList.add('active');
      document.getElementById(`tab-${e.target.dataset.tab}`).style.display = 'block';
    });
  });

  document.getElementById('modalStatusSelect').addEventListener('change', (event) => {
    updateBookStatus(book.id, event.target.value);
    renderLibrary();
  });

  document.getElementById('modalFolderSelect').addEventListener('change', (event) => {
    updateBookFolder(book.id, event.target.value);
    renderLibrary();
  });

  const updateProgressUI = (page) => {
    const pageElem = document.getElementById('currentReadingPage');
    const progText = document.getElementById('readingProgressText');
    const progBar = document.getElementById('readingProgressBar');
    if (pageElem) pageElem.textContent = page;
    if (progText && progBar) {
      let pct = Math.round((page / book.pages) * 100) || 0;
      if (pct > 100) pct = 100;
      progText.textContent = pct + '%';
      progBar.style.width = pct + '%';
    }
  };

  const updateTimerUI = () => {
    const startBtn = document.getElementById('startTimerBtn');
    const toggleBtn = document.getElementById('toggleTimerBtn');
    const finishBtn = document.getElementById('finishTimerBtn');
    const cancelBtn = document.getElementById('cancelTimerBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const bookAnim = document.getElementById('bookAnimation');

    if (book.activeSession) {
      startBtn.style.display = 'none';
      toggleBtn.style.display = 'inline-block';
      finishBtn.style.display = 'inline-block';
      cancelBtn.style.display = 'inline-block';
      
      toggleBtn.innerHTML = book.activeSession.isRunning ? '⏸️ Пауза' : '▶️ Продовжити';
      toggleBtn.style.background = book.activeSession.isRunning ? '#f59e0b' : '#10b981';

      if (book.activeSession.isRunning) {
        bookAnim.classList.add('running');
      } else {
        bookAnim.classList.remove('running');
      }

      let elapsed = book.activeSession.accumulatedTime || 0;
      if (book.activeSession.isRunning) {
        elapsed += (Date.now() - book.activeSession.startTime);
      }
      timerDisplay.textContent = formatSessionTime(elapsed);
    } else {
      startBtn.style.display = 'inline-block';
      toggleBtn.style.display = 'none';
      finishBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      timerDisplay.textContent = '00:00:00';
      bookAnim.classList.remove('running');
    }
  };

  modalTimerInterval = setInterval(() => {
    if (book.activeSession && book.activeSession.isRunning) {
      updateTimerUI();
    }
  }, 1000);

  updateTimerUI();

  document.getElementById('startTimerBtn').onclick = async () => {
    const p = await customPrompt(
      '🚀 Початок читання', 
      `На якій сторінці ви починаєте читати? (Всього сторінок: ${book.pages})`, 
      book.currentPage || 1, 
      book.pages
    );
    if (p === null) return;
    const page = parseInt(String(p).trim(), 10);
    if (Number.isNaN(page)) {

      return;
    }
    
    startReadingSession(book, page);
    if (typeof editBook === 'function') editBook(book.id, { activeSession: book.activeSession, status: 'читаю', currentPage: page });
    
    updateProgressUI(page);
    
    const logElem = document.getElementById('sessionLog');
    if (logElem) logElem.innerHTML = renderReadingHistory(book);
    
    updateTimerUI();
    renderLibrary();
  };

  document.getElementById('toggleTimerBtn').onclick = () => {
    toggleReadingTimer(book);
    if (typeof editBook === 'function') editBook(book.id, { activeSession: book.activeSession });
    updateTimerUI();
  };

  document.getElementById('finishTimerBtn').onclick = async () => {
    if (!book.activeSession) return;
    const p = await customPrompt(
      '🏁 Завершення читання', 
      `На якій сторінці ви зупинились? (Всього сторінок: ${book.pages})`, 
      book.activeSession.startPage, 
      book.pages
    );
    if (p === null) return;
    const page = parseInt(p, 10);
    if (isNaN(page) || page < 0) return;

    const result = finishReadingSession(book, page);
    if (result.success) {
      if (typeof editBook === 'function') {
        editBook(book.id, { 
          currentPage: book.currentPage, 
          activeSession: null, 
          status: book.status, 
          finishedPage: book.finishedPage 
        });
      }
      updateProgressUI(book.currentPage);
      
      const logElem = document.getElementById('sessionLog');
      if (logElem) logElem.innerHTML = renderReadingHistory(book);
      
      updateTimerUI();
      renderLibrary();
    } else if (result.message) {

    }
  };

  document.getElementById('cancelTimerBtn').onclick = () => {
    if (!book.activeSession) return;
    if (!confirm('Ви впевнені, що хочете скасувати поточну сесію? Час та прочитані сторінки не будуть збережені.')) return;

    cancelReadingSession(book);
    if (typeof editBook === 'function') editBook(book.id, { activeSession: null });
    
    const logElem = document.getElementById('sessionLog');
    if (logElem) logElem.innerHTML = renderReadingHistory(book);
    
    updateTimerUI();
    renderLibrary();
  };

  // ===== ОБРАБОТЧИКИ ЗАМЕТОК =====
  const addNoteBtnEl = document.getElementById('addNoteBtn');
  if (addNoteBtnEl) {
    addNoteBtnEl.onclick = () => {
      const textarea = document.getElementById('newNoteInput');
      if (!textarea) return;
      const noteText = textarea.value.trim();
      
      if (!noteText) {
        alert('⚠️ Заметка не може бути пустою');
        return;
      }

      const result = addNote(book.id, noteText);
      if (result.success) {
        textarea.value = '';
        // Перерисовуємо список заметок
        const notesContainer = document.getElementById('tab-notes');
        if (notesContainer && typeof renderNotesUI === 'function') {
          notesContainer.innerHTML = renderNotesUI(book.id);
          attachNoteEventHandlers(book.id);
        }
      } else {
        alert('❌ Помилка: ' + result.message);
      }
    };
  }

  // Обработчик удаления заметок
  const attachNoteEventHandlers = (bookId) => {
    document.querySelectorAll('.delete-note-btn').forEach(btn => {
      btn.onclick = (e) => {
        const noteId = e.target.dataset.noteId;
        if (!noteId) return;
        
        if (!confirm('Видалити заметку?')) return;
        
        const result = removeNote(bookId, noteId);
        if (result.success) {
          const notesContainer = document.getElementById('tab-notes');
          if (notesContainer && typeof renderNotesUI === 'function') {
            notesContainer.innerHTML = renderNotesUI(bookId);
            attachNoteEventHandlers(bookId);
          }
        } else {
          alert('❌ Помилка: ' + result.message);
        }
      };
    });

    document.querySelectorAll('.edit-note-btn').forEach(btn => {
      btn.onclick = (e) => {
        const noteId = e.target.dataset.noteId;
        if (!noteId) return;

        const note = getNotesByBook(bookId).find(n => n.id === noteId);
        if (!note) return;

        const newText = prompt('Редагувати заметку:', note.text);
        if (newText === null) return;

        const result = editNote(bookId, noteId, newText);
        if (result.success) {
          const notesContainer = document.getElementById('tab-notes');
          if (notesContainer && typeof renderNotesUI === 'function') {
            notesContainer.innerHTML = renderNotesUI(bookId);
            attachNoteEventHandlers(bookId);
          }
        } else {
          alert('❌ Помилка: ' + result.message);
        }
      };
    });
  };

  // Прикрепляемо обработчики заметок
  setTimeout(() => attachNoteEventHandlers(book.id), 10);

  // Функция для обработки клика на звезду
  const attachRatingHandlers = () => {
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.onclick = (e) => {
        const rating = parseInt(e.target.dataset.rating, 10);
        
        const result = setBookRating(book.id, rating);
        if (result.success) {
          // Перерисовуємо UI оценок
          const ratingContainer = document.querySelector('.rating-input');
          if (ratingContainer && typeof renderRatingInput === 'function') {
            const parent = ratingContainer.parentElement;
            parent.innerHTML = renderRatingInput(book.id, result.rating);
            
            // Переприклепляемо обработчики
            attachRatingHandlers();
          }
        } else {
          alert('❌ ' + result.message);
        }
      };
    });
  };

  // ===== ОБРАБОТЧИКИ ОЦІНОК =====
  attachRatingHandlers();

  // ===== ОБРАБОТЧИКИ ОТЗЫВА =====
  const saveReviewBtnEl = document.getElementById('saveReviewBtn');
  if (saveReviewBtnEl) {
    saveReviewBtnEl.onclick = () => {
      const textarea = document.getElementById('reviewInput');
      if (!textarea) return;

      const reviewText = textarea.value.trim();
      const result = setBookReview(book.id, reviewText);
      
      if (result.success) {
        alert('✅ Отзыв сохранен!');
        // Перерисовуємо вкладку с отзывом
        const reviewContainer = document.getElementById('tab-rating-review');
        if (reviewContainer && typeof renderReviewUI === 'function') {
          const updatedBook = getBookById(book.id);
          reviewContainer.innerHTML = `
            <div style="background: rgba(255,255,255,0.35); padding: 15px; border-radius: 12px;">
              <h5 style="margin: 0 0 10px 0; color: var(--color-primary);">⭐ Ваша оцінка</h5>
              ${typeof renderRatingInput === 'function' ? renderRatingInput(updatedBook.id, updatedBook.rating || 0) : '<p>Оцінки недоступні</p>'}
            </div>
            ${renderReviewUI(updatedBook.id, updatedBook)}
          `;
          
          // Переприклепляемо обработчики
          setTimeout(() => {
            attachRatingHandlers();
            const newSaveBtn = document.getElementById('saveReviewBtn');
            if (newSaveBtn) {
              newSaveBtn.onclick = saveReviewBtnEl.onclick;
            }
          }, 10);
        }
      } else {
        alert('❌ Помилка: ' + result.message);
      }
    };
  }

  document.getElementById('editBookBtn').onclick = () => renderBookEditForm(book);

  document.getElementById('deleteBookBtn').onclick = async () => {
    if (!confirm(`Видалити книгу «${book.title}»?`)) return;

    const success = await deleteBook(book.id);
    if (success) {
      renderFolders();
      renderLibrary();
      closeModal();
    }
  };
};

const closeModal = () => {
  if (modalTimerInterval) clearInterval(modalTimerInterval);
  dom.bookModal.classList.add('hidden');
  renderLibrary();
  // Оновлюємо інші екрани, щоб статистика і стрічка новин були свіжими
  if (document.getElementById('analytics')?.classList.contains('active')) renderAnalytics();
  if (document.getElementById('community')?.classList.contains('active')) renderFeed();
  if (document.getElementById('profile')?.classList.contains('active')) { renderProfile(); renderFeed(); }
};

const switchPage = (pageName) => {
  dom.navButtons.forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
  
  dom.pages.forEach(p => {
    if (p.id === pageName) {
      p.classList.add('active');
      if (pageName === 'add') {
        switchTab('manual');
      }
      if (pageName === 'analytics') renderAnalytics();
      if (pageName === 'community' || pageName === 'profile') {
        renderFeed();
        renderProfile();
      }
    } else {
      p.classList.remove('active');
    }
  });
};
