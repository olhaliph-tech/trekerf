let STORAGE_KEY = 'readingTrackerData';
const USERS_KEY = 'readingTrackerUsers';
const AUTH_KEY = 'readingTrackerAuth';
const statuses = ['бажаю прочитати', 'читаю', 'прочитано', 'закинуто'];

const defaultUser = {
  id: 'user_1',
  name: 'Читач',
  nickname: 'reader',
  email: 'user@example.com',
  password: '',
  avatar: null, // Буде встановлено PlaceholderFallback.avatar при завантаженні
  bio: 'Мій профіль читача',
  following: [],
  followers: []
};

const defaultFolders = [{id: 'folder_all', name: 'Усі книги'}];

let state = {
  user: {...defaultUser},
  books: [],
  sessions: [],
  folders: [...defaultFolders],
  comments: [],
  reactions: [],
  activity: [],
  // Нові поля для розширеного функціоналу
  goals: [],           // цілі читання
  achievements: [],    // досягнення
  reviews: [],         // рецензії
  userStats: {         // персональна статистика
    totalBooksRead: 0,
    totalPagesRead: 0,
    totalReadingMinutes: 0,
    longestReadingStreak: 0,
    currentReadingStreak: 0,
    averageRating: 0,
    booksThisYear: 0
  },
  clubsJoined: []      // книжкові клуби
};

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
  modalBody: document.getElementById('modalBody')
};

const newId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Не вдалося зберегти користувачів (можливо, переповнена пам\'ять):', e);
  }
};

const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const users = getUsers();
  const currentUserId = localStorage.getItem(AUTH_KEY);
  const currentUser = users.find(u => u.id === currentUserId);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = {
        user: currentUser || parsed.user || {...defaultUser},
        books: parsed.books || [],
        sessions: parsed.sessions || [],
        folders: parsed.folders && parsed.folders.length ? parsed.folders : [...defaultFolders],
        comments: parsed.comments || [],
        reactions: parsed.reactions || [],
        activity: parsed.activity || [],
        goals: parsed.goals || [],
        achievements: parsed.achievements || [],
        reviews: parsed.reviews || [],
        userStats: parsed.userStats || {
          totalBooksRead: 0,
          totalPagesRead: 0,
          totalReadingMinutes: 0,
          longestReadingStreak: 0,
          currentReadingStreak: 0,
          averageRating: 0,
          booksThisYear: 0
        },
        clubsJoined: parsed.clubsJoined || []
      };
    } catch (e) {
      console.error('load error', e);
    }
  } else {
    state.user = currentUser || {...defaultUser};
  }
};

const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Не вдалося зберегти стан (можливо, переповнена пам\'ять):', e);
  }
};

const createActivity = (type, text, bookId = '') => {
  const item = {
    id: newId('activity'),
    userId: state.user.id,
    type,
    text,
    date: new Date().toISOString(),
    bookId
  };
  state.activity.unshift(item);
  saveState();
};

const switchPage = (pageName) => {
  dom.navButtons.forEach((b) => b.classList.remove('active'));
  const targetBtn = document.querySelector(`nav button[data-page="${pageName}"]`);
  if (targetBtn) targetBtn.classList.add('active');
  
  dom.pages.forEach((p) => {
    if (p.id === pageName) {
      p.classList.add('active');
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

const renderFolders = () => {
  dom.folderFilter.innerHTML = '';
  state.folders.forEach(f => {
    const o = document.createElement('option');
    o.value = f.id;
    o.textContent = f.name;
    dom.folderFilter.append(o);
  });
};

const formatDate = (d) => new Date(d).toLocaleDateString('uk-UA');

const getFolderName = (folderId) => {
  const f = state.folders.find(x => x.id === folderId);
  return f ? f.name : 'Без папки';
};

const renderLibrary = () => {
  const folderId = dom.folderFilter.value;
  const status = dom.statusFilter.value;
  const search = dom.searchInput.value.trim().toLowerCase();
  const sortKey = document.getElementById('sortFilter')?.value || 'date-new';

  let books = getEnhancedLibraryBooks(folderId, status, search, sortKey);

  dom.libraryCount.textContent = `Відображено ${books.length} з ${state.books.length} книг`;

  dom.bookList.innerHTML = books
    .map((b) => {
      const rating = b.rating || 0;
      const ratingHtml = rating > 0 ? `<div class="rating-badge">${renderStars(rating)}</div>` : '';
      const progressPct = b.status === 'читаю' ? Math.round((b.currentPage / b.pages) * 100) : 
                          b.status === 'прочитано' ? 100 : 0;
      
      return `
      <article class="book-card" data-id="${b.id}">
        <img src="${b.cover || 'https://via.placeholder.com/220x180?text=No+Cover'}" alt="${b.title}" />
        <h3>${b.title}</h3>
        <div class="card-meta"><span>Автор: ${b.author}</span><span>${renderGenreTag(b.genre)}</span></div>
        <div class="card-meta"><span>Сторінок: ${b.pages}</span><span>Статус: ${b.status}</span></div>
        ${ratingHtml}
        ${progressPct > 0 ? `<div style="background:rgba(230,150,180,0.1); height:6px; margin:8px 0; border-radius:3px; overflow:hidden;">
          <div style="background:linear-gradient(90deg, #e6a0b4 0%, #e68aa3 100%); width:${progressPct}%; height:100%;"></div>
        </div>` : ''}
        <button class="open-details">Деталі</button>
      </article>`;
    })
    .join('');

  dom.bookList.querySelectorAll('.open-details').forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.target.closest('.book-card').dataset.id;
      openBookModal(id);
    };
  });
};

const renderSessionLog = (book) => {
  const sessions = state.sessions
    .filter((s) => s.bookId === book.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = '';
  if (book.activeSession) {
    html += `<div style="margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px dashed rgba(230,150,180,0.3); color: var(--color-primary);">⏳ <strong>Триває сесія:</strong> читання зі сторінки ${book.activeSession.startPage}</div>`;
  }

  if (!sessions.length && !book.activeSession) {
    return '<p>Немає сесій.</p>';
  }

  html += sessions
    .map((s) => {
      const speed = s.pagesPerHour ?? (s.duration > 0 ? Math.round((s.pagesRead / s.duration) * 60) : 0);
      return `<div style="margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px dashed rgba(230,150,180,0.3);">${formatDate(s.date)}: ${s.startPage}→${s.endPage} (${s.pagesRead} стор. за ${s.duration} хв) ⚡ <strong>~${speed} стор/год</strong></div>`;
    })
    .join('');
  return html;
};

let modalTimerInterval = null;

const formatSessionTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const openBookModal = (bookId) => {
  const book = state.books.find((b) => b.id === bookId);
  if (!book) return;

  if (modalTimerInterval) clearInterval(modalTimerInterval);

  const tabsContainer = document.createElement('div');
  tabsContainer.innerHTML = `
    <div class="modal-tabs" style="display:flex;gap:10px;margin-bottom:20px;border-bottom:2px solid rgba(230,150,180,0.2);padding-bottom:10px;">
      <button class="modal-tab-btn active" data-tab="info" style="flex:1;">ℹ️ Інформація</button>
      <button class="modal-tab-btn" data-tab="reading" style="flex:1;">⏳ Читання</button>
    </div>

    <div id="info-tab" class="modal-tab-content active" style="display:block;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${book.cover || 'https://via.placeholder.com/220x180?text=No+Cover'}" alt="cover" style="width:100%;max-width:260px;margin:10px 0;border-radius:12px;" />
      </div>
      <h3>${book.title}</h3>
      <p><strong>Автор:</strong> ${book.author}</p>
      <p><strong>Жанр:</strong> ${book.genre}</p>
      <p><strong>Сторінок:</strong> ${book.pages}</p>
      <p><strong>Статус:</strong> ${book.status}</p>
      <p>${book.description || 'Немає опису.'}</p>

      <div class="modal-row">
        <label>Папка:<br /><select id="modalFolderSelect">${state.folders
          .filter((f) => f.id !== 'folder_all')
          .map((f) => `<option value="${f.id}" ${book.folderId === f.id ? 'selected' : ''}>${f.name}</option>`)
          .join('')}</select></label>
        <label>Статус:<br /><select id="modalStatusSelect">${statuses
          .map((s) => `<option value="${s}" ${book.status === s ? 'selected' : ''}>${s}</option>`)
          .join('')}</select></label>
      </div>
    </div>

    <div id="reading-tab" class="modal-tab-content" style="display:none;">
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
      <div id="sessionLog" style="font-size:.9rem; max-height:150px; overflow-y:auto; padding: 10px; background: rgba(255,255,255,0.3); border-radius: 10px;">${renderSessionLog(book)}</div>
    </div>
  `;

  dom.modalBody.innerHTML = '';
  dom.modalBody.appendChild(tabsContainer);

  dom.bookModal.classList.remove('hidden');

  const tabButtons = document.querySelectorAll('.modal-tab-btn');
  const tabContents = document.querySelectorAll('.modal-tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });
      e.target.classList.add('active');
      const targetTab = document.getElementById(`${tabName}-tab`);
      targetTab.classList.add('active');
      targetTab.style.display = 'block';
    });
  });

  document.getElementById('modalStatusSelect').addEventListener('change', (event) => {
    book.status = event.target.value;
    saveState();
    renderLibrary();
  });

  document.getElementById('modalFolderSelect').addEventListener('change', (event) => {
    book.folderId = event.target.value;
    saveState();
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

  document.getElementById('startTimerBtn').onclick = () => {
    const p = prompt(`На якій сторінці ви починаєте читати? (Всього сторінок: ${book.pages})`, book.currentPage || 1);
    if (p === null) return;
    const page = parseInt(p, 10);
    if (isNaN(page) || page < 0) return;
    
    book.activeSession = { startPage: page, startTime: Date.now(), accumulatedTime: 0, isRunning: true };
    book.currentPage = page;
    book.status = 'читаю';
    createActivity('start', `📖 Розпочато читання: ${book.title} зі сторінки ${page}`, book.id);
    saveState();
    
    if (typeof editBook === 'function') editBook(book.id, { activeSession: book.activeSession, status: 'читаю', currentPage: page });
    
    updateProgressUI(page);
    
    const logElem = document.getElementById('sessionLog');
    if (logElem) logElem.innerHTML = renderSessionLog(book);
    
    updateTimerUI();
    renderLibrary();
  };

  document.getElementById('toggleTimerBtn').onclick = () => {
    if (!book.activeSession) return;
    if (book.activeSession.isRunning) {
      const now = Date.now();
      book.activeSession.accumulatedTime += (now - book.activeSession.startTime);
      book.activeSession.isRunning = false;
      createActivity('pause', `⏸️ Призупинено читання: ${book.title}`, book.id);
    } else {
      book.activeSession.startTime = Date.now();
      book.activeSession.isRunning = true;
      createActivity('resume', `▶️ Продовжено читання: ${book.title}`, book.id);
    }
    saveState();
    if (typeof editBook === 'function') editBook(book.id, { activeSession: book.activeSession });
    updateTimerUI();
  };

  document.getElementById('finishTimerBtn').onclick = () => {
    if (!book.activeSession) return;
    const p = prompt(`На якій сторінці ви зупинились? (Всього сторінок: ${book.pages})`, book.activeSession.startPage);
    if (p === null) return;
    const endPage = parseInt(p, 10);
    if (isNaN(endPage) || endPage < 0) return;

    let totalTimeMs = book.activeSession.accumulatedTime || 0;
    if (book.activeSession.isRunning) {
      totalTimeMs += (Date.now() - book.activeSession.startTime);
    }
    
    const durationMins = Math.max(1, Math.round(totalTimeMs / 60000));
    const pagesRead = Math.max(0, endPage - book.activeSession.startPage);
    const pagesPerHour = durationMins > 0 ? Math.round((pagesRead / durationMins) * 60) : 0;

    if (!state.sessions) state.sessions = [];
    state.sessions.push({
      id: newId('session'),
      bookId: book.id,
      date: new Date().toISOString(),
      startPage: book.activeSession.startPage,
      endPage: endPage,
      pagesRead,
      duration: durationMins,
      pagesPerHour
    });

    book.currentPage = endPage;
    book.activeSession = null;
    if (endPage >= book.pages) {
      book.status = 'прочитано';
      book.finishedPage = book.pages;
    }
    
    createActivity('finish', `✅ Завершено читання: ${book.title} (прочитано ${pagesRead} стор. за ${durationMins} хв, ~${pagesPerHour} стор/год)`, book.id);
    saveState();
    
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
    if (logElem) logElem.innerHTML = renderSessionLog(book);
    
    updateTimerUI();
    renderLibrary();
  };

  document.getElementById('cancelTimerBtn').onclick = () => {
    if (!book.activeSession) return;
    if (!confirm('Ви впевнені, що хочете скасувати поточну сесію? Час та прочитані сторінки не будуть збережені.')) return;

    book.activeSession = null;
    createActivity('cancel', `❌ Скасовано сесію читання: ${book.title}`, book.id);
    saveState();
    if (typeof editBook === 'function') editBook(book.id, { activeSession: null });
    
    const logElem = document.getElementById('sessionLog');
    if (logElem) logElem.innerHTML = renderSessionLog(book);
    
    updateTimerUI();
    renderLibrary();
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

const addBook = (book) => {
  const newBook = {
    id: newId('book'),
    title: book.title,
    author: book.author,
    genre: book.genre,
    description: book.description,
    pages: book.pages,
    cover: book.cover,
    status: 'бажаю прочитати',
    folderId: book.folderId || 'folder_all',
    createdAt: new Date().toISOString(),
    currentPage: 0
  };

  state.books.push(newBook);
  if (!state.folders.some((f) => f.id === newBook.folderId)) {
    state.folders.push({id: newId('folder'), name: newBook.folderId});
  }
  createActivity('add', `📚 Додана книга: ${newBook.title}`, newBook.id);
  saveState();
  renderFolders();
  renderLibrary();
};

const placeholderBook = (item) => ({
  author: item.author_name?.join(', ') || 'Невідомий',
  title: item.title || 'Невідома книга',
  genre: item.subject?.[0] || 'Не вказано',
  pages: item.number_of_pages_median || 100,
  description: item.first_sentence?.join(' ') || item.subtitle || 'Немає опису',
  cover: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : ''
});

const renderAnalytics = () => {
  const totalBooks = state.books.length;
  const readBooks = state.books.filter((b) => b.status === 'прочитано').length;
  const totalPagesRead = state.books.reduce((sum, b) => sum + (b.finishedPage || 0), 0);
  const months = [...new Set(state.books.map((b) => (b.createdAt ? new Date(b.createdAt) : new Date()).toISOString().slice(0, 7)))];
  const avgBooksPerMonth = months.length ? (readBooks / months.length).toFixed(2) : '0';

  const allSessions = state.sessions;
  const avgPagesPerSession = allSessions.length
    ? (allSessions.reduce((s, x) => s + x.pagesRead, 0) / allSessions.length).toFixed(1)
    : '0';

  const readDates = allSessions.map((s) => new Date(s.date).toISOString().slice(0, 10));
  const uniqueReadDays = [...new Set(readDates)];

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

  const genreCount = {};
  state.books.filter((b) => b.status === 'прочитано').forEach((b) => {
    genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
  });
  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Немає даних';

  dom.stats.innerHTML = `
    <div class="stat-card"><strong>📚 Всього книг</strong><p>${totalBooks}</p></div>
    <div class="stat-card"><strong>✅ Прочитаних</strong><p>${readBooks}</p></div>
    <div class="stat-card"><strong>📄 Сторінок</strong><p>${totalPagesRead}</p></div>
    <div class="stat-card"><strong>📊 Біля/місяць</strong><p>${avgBooksPerMonth}</p></div>
    <div class="stat-card"><strong>📖 Сторінок/сесія</strong><p>${avgPagesPerSession}</p></div>
    <div class="stat-card"><strong>🔥 Найдовша серія</strong><p>${longestStreak} днів</p></div>
    <div class="stat-card"><strong>🎯 Улюблений жанр</strong><p>${favoriteGenre}</p></div>
    <div class="stat-card"><strong>📈 Завершено</strong><p>${
      totalBooks ? ((readBooks / totalBooks) * 100).toFixed(1) : '0'
    }%</p></div>
  `;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();

  let calendarHtml = '<h3>📅 Календар цього місяця</h3><div class="calendar-grid">';
  ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach((d) => {
    calendarHtml += `<div class="calendar-cell" style="font-weight:700;">${d}</div>`;
  });
  for (let i = 0; i < ((first.getDay() + 6) % 7); i++) {
    calendarHtml += '<div class="calendar-cell"></div>';
  }
  for (let d = 1; d <= days; d += 1) {
    const dstr = new Date(year, month, d).toISOString().slice(0, 10);
    const readClass = uniqueReadDays.includes(dstr) ? 'read-day' : '';
    calendarHtml += `<div class="calendar-cell ${readClass}">${d}</div>`;
  }
  calendarHtml += '</div>';
  dom.calendar.innerHTML = calendarHtml;

  dom.progressChart.innerHTML = `<div style="background: rgba(255, 255, 255, 0.4); padding: 20px; border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);"><h3>📈 Прогрес читання</h3><p>${months
    .map((m) => `<strong>${m}:</strong> ${state.books.filter((b) => b.status === 'прочитано' && (b.createdAt || '').startsWith(m)).length} книг`)
    .join(' • ') || 'Немає даних'}</p></div>`;
};

const renderFeed = () => {
  const reactionEmojis = { like: '❤️', love: '😍', wow: '😮', fire: '🔥' };
  
  const feedHtml = state.activity.slice(0, 20).map(item => {
    const itemReactions = state.reactions.filter(r => r.postId === item.id);
    const itemComments = state.comments.filter(c => c.postId === item.id);
    const userReaction = itemReactions.find(r => r.userId === state.user.id);
    
    const reactionCounts = {};
    itemReactions.forEach(r => {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    });
    
    return `
      <div class="activity-item">
        <div class="activity-header">
          <span class="author">${state.user.name}</span>
          <span class="date">${formatDate(item.date)}</span>
        </div>
        <div class="activity-text">${item.text}</div>
        
        <div class="reactionsPanel">
          ${Object.entries(reactionCounts).map(([type, count]) => 
            `<span class="reaction-badge">${reactionEmojis[type]} ${count}</span>`
          ).join('')}
        </div>
        
        <div class="activity-actions">
          ${Object.entries(reactionEmojis).map(([type, emoji]) => 
            `<button class="reactButton ${userReaction?.type === type ? 'active' : ''}" data-post-id="${item.id}" data-reaction="${type}">${emoji}</button>`
          ).join('')}
          <button class="commentBtn" data-post-id="${item.id}">💬 Коментувати</button>
        </div>
        
        ${itemComments.length > 0 ? `
          <div class="commentSection">
            <strong style="color: #6b4a52;">Коментарі (${itemComments.length})</strong>
            <div class="commentList">
              ${itemComments.map(c => 
                `<div class="comment"><span class="comment-author">Читач:</span> ${c.text}</div>`
              ).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  dom.activityFeed.innerHTML = feedHtml || '<p style="color: #7a7a8a;">Немає активності.</p>';
  dom.profileFeed.innerHTML = feedHtml || '<p style="color: #7a7a8a;">Немає активності.</p>';
  
  attachFeedEvents();
};

const attachFeedEvents = () => {
  document.querySelectorAll('.reactButton').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      const reactionType = e.target.dataset.reaction;
      toggleReaction(postId, reactionType);
    });
  });
  
  document.querySelectorAll('.commentBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const postId = e.target.dataset.postId;
      openCommentInput(postId);
    });
  });
};

const toggleReaction = (postId, reactionType) => {
  const existingReaction = state.reactions.find(
    r => r.postId === postId && r.userId === state.user.id
  );
  
  if (existingReaction) {
    if (existingReaction.type === reactionType) {
      state.reactions = state.reactions.filter(r => r.id !== existingReaction.id);
    } else {
      existingReaction.type = reactionType;
    }
  } else {
    state.reactions.push({
      id: newId('reaction'),
      userId: state.user.id,
      postId,
      type: reactionType
    });
  }
  
  saveState();
  renderFeed();
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
      state.comments.push({
        id: newId('comment'),
        userId: state.user.id,
        postId,
        text,
        createdAt: new Date().toISOString()
      });
      saveState();
      renderFeed();
    }
  });
  
  commentSection.insertBefore(inputDiv, commentSection.querySelector('.commentList'));
};

const renderProfile = () => {
  const user = state.user;
  const readBooks = state.books.filter((b) => b.status === 'прочитано').length;
  dom.profileInfo.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
      <div>
        <img src="${user.avatar}" alt="avatar" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;object-fit:cover;" />
        <h3>${user.name} (@${user.nickname})</h3>
        <p>${user.bio}</p>
        <p>👥 Підписки: ${user.following.length} | Підписники: ${user.followers.length}</p>
        <p>📚 Прочитано книг: ${readBooks}</p>
      </div>
      <button id="logoutBtn" style="padding:8px 16px; background:#e74c3c; color:white; border:none; border-radius:8px; cursor:pointer;">Вийти</button>
    </div>
    <button id="editProfileBtn" style="margin-top:10px; padding:8px 16px; background:linear-gradient(135deg, #e6a0b4 0%, #e68aa3 100%); color:white; border:none; border-radius:8px; cursor:pointer;">Редагувати профіль</button>
    
    <form id="editProfileForm" style="display:none; margin-top:20px; flex-direction:column; gap:10px; max-width:400px; background:rgba(255,255,255,0.5); padding:15px; border-radius:10px;">
      <label>Ім'я: <input type="text" id="editName" value="${user.name}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></label>
      <label>Нікнейм: <input type="text" id="editNickname" value="${user.nickname}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></label>
      <label>Біографія: <textarea id="editBio" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;">${user.bio}</textarea></label>
      <label>URL Аватарки: <input type="text" id="editAvatar" value="${user.avatar}" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc;"></label>
      <button type="submit" style="padding:10px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer;">Зберегти зміни</button>
    </form>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    location.reload();
  });

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    const form = document.getElementById('editProfileForm');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    user.name = document.getElementById('editName').value.trim();
    user.nickname = document.getElementById('editNickname').value.trim();
    user.bio = document.getElementById('editBio').value.trim();
    user.avatar = document.getElementById('editAvatar').value.trim();
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      saveUsers(users);
    }
    saveState();
    renderProfile();
    renderFeed();
  });
};

const wireEvents = () => {
  dom.navButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const page = e.target.dataset.page;
      switchPage(page);
    })
  );

  dom.folderFilter.addEventListener('change', renderLibrary);
  dom.statusFilter.addEventListener('change', renderLibrary);
  dom.searchInput.addEventListener('input', renderLibrary);
  
  // Додаємо обробник для сортування
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', renderLibrary);
  }

  dom.createFolderBtn.addEventListener('click', () => {
    const name = dom.newFolderName.value.trim();
    if (!name) return alert('Введіть назву папки');

    if (state.folders.some((f) => f.name === name)) return alert('Папка існує');

    state.folders.push({id: newId('folder'), name});
    dom.newFolderName.value = '';
    saveState();
    renderFolders();
    renderLibrary();
  });

  dom.manualForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(dom.manualForm);
    const book = {
      author: fd.get('author'),
      title: fd.get('title'),
      genre: fd.get('genre'),
      pages: Number(fd.get('pages')),
      description: fd.get('description'),
      cover: fd.get('cover'),
      folderId: 'folder_all'
    };
    addBook(book);
    dom.manualForm.reset();
    if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
    if (dom.statusFilter) dom.statusFilter.value = 'all';
    renderLibrary();
    switchPage('library');
    setTimeout(() => alert('✅ Книга додана!'), 10);
  });

  dom.externalSearchBtn.addEventListener('click', async () => {
    const q = dom.externalSearchInput.value.trim();
    if (!q) return;
    dom.externalResults.innerHTML = '<p>🔍 Пошук...</p>';
    try {
      const result = await fetch(`https://openlibrary.org/search.json?limit=8&q=${encodeURIComponent(q)}`);
      const json = await result.json();
      dom.externalResults.innerHTML = json.docs
        .map((doc) => {
          const book = placeholderBook(doc);
          return `<article class="book-card" data-key="${doc.key}"><h3>${book.title}</h3><div class="card-meta"><span>${book.author}</span><span>${book.genre}</span></div><button class="add-ext" data-key="${doc.key}">➕ Додати</button></article>`;
        })
        .join('');
      dom.externalResults.querySelectorAll('.add-ext').forEach((btn) => {
        btn.onclick = (e) => {
          const key = e.target.dataset.key;
          const doc = json.docs.find((d) => d.key === key);
          addBook(placeholderBook(doc));
          if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
          if (dom.statusFilter) dom.statusFilter.value = 'all';
          renderLibrary();
          switchPage('library');
          setTimeout(() => alert('✅ Книга додана з зовнішної бази'), 10);
        };
      });
    } catch (err) {
      dom.externalResults.innerHTML = '<p>❌ Помилка пошуку</p>';
      console.error(err);
    }
  });

  dom.closeModal.addEventListener('click', closeModal);
  dom.bookModal.addEventListener('click', (e) => {
    if (e.target === dom.bookModal) closeModal();
  });
};

const renderAuthScreen = () => {
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
    const users = getUsers();

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem(AUTH_KEY, user.id);
        document.body.removeChild(authDiv);
        initAppAfterAuth(user.id);
      } else {
        alert('Невірний email або пароль!');
      }
    } else {
      if (users.find(u => u.email === email)) {
        return alert('Користувач з таким email вже існує!');
      }
      const newUser = { ...defaultUser, id: newId('user'), name: name || 'Читач', nickname: email.split('@')[0], email, password };
      // Встановити avatar з PlaceholderFallback
      if (window.PlaceholderFallback) {
        newUser.avatar = window.PlaceholderFallback.avatar;
      }
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem(AUTH_KEY, newUser.id);
      document.body.removeChild(authDiv);
      initAppAfterAuth(newUser.id);
    }
  });
};

const initAppAfterAuth = (userId) => {
  STORAGE_KEY = `readingTrackerData_${userId}`;
  loadState();
  renderFolders();
  renderLibrary();
  renderFeed();
  renderProfile();
  wireEvents();

  // Слухач подій для миттєвої синхронізації між вкладками браузера
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === AUTH_KEY || e.key === USERS_KEY) {
      loadState();
      renderFolders();
      renderLibrary();
      if (document.getElementById('analytics')?.classList.contains('active')) renderAnalytics();
      if (document.getElementById('community')?.classList.contains('active')) renderFeed();
      if (document.getElementById('profile')?.classList.contains('active')) { 
        renderProfile(); 
        renderFeed(); 
      }
    }
  });
};

const init = () => {
  const authId = localStorage.getItem(AUTH_KEY);
  if (!authId) {
    renderAuthScreen();
  } else {
    initAppAfterAuth(authId);
  }
};

// Зареєструємо Service Worker для PWA підтримки
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('✅ Service Worker зареєстрований успішно:', reg))
    .catch(err => console.warn('⚠️ Помилка при реєстрації Service Worker:', err));
}

init();
