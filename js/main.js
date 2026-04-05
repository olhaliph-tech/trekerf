﻿﻿﻿// Прив'язка подій та ініціалізація
const bindAddPageEvents = () => {
  dom.manualForm = document.getElementById('manualForm');
  dom.externalSearchInput = document.getElementById('externalSearchInput');
  dom.externalSearchBtn = document.getElementById('externalSearchBtn');
  dom.externalResults = document.getElementById('externalResults');
  dom.tabBtns = document.querySelectorAll('#add .tab-btn');
  dom.tabContents = document.querySelectorAll('#add .tab-content');
  dom.coverUpload = document.getElementById('coverUpload');
  dom.coverFileName = document.getElementById('coverFileName');
  dom.coverPreview = document.getElementById('coverPreview');

  if (typeof setupCoverUpload === 'function') setupCoverUpload();

  if (dom.tabBtns) {
    dom.tabBtns.forEach((btn) => {
      btn.onclick = (e) => {
        if (typeof switchTab === 'function') switchTab(e.currentTarget.dataset.tab);
      };
    });
  }

  if (dom.manualForm) {
    dom.manualForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const fd = new FormData(e.currentTarget);
        const book = {
          author: fd.get('author') || 'Невідомий',
          title: fd.get('title') || 'Без назви',
          genre: fd.get('genre') || '',
          pages: Number(fd.get('pages')) || 1,
          description: fd.get('description') || '',
          cover: dom.coverUpload?.dataset?.base64 || '',
          folderId: 'folder_all',
          status: 'бажаю прочитати',
          currentPage: 0
        };

        await addBook(book);
        e.currentTarget.reset();

        if (dom.coverPreview) {
          dom.coverPreview.src = '';
          dom.coverPreview.style.display = 'none';
        }
        if (dom.coverFileName) dom.coverFileName.textContent = 'Виберіть файл';
        if (dom.coverUpload?.dataset) delete dom.coverUpload.dataset.base64;

        if (typeof renderFolders === 'function') renderFolders();
        if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
        if (dom.statusFilter) dom.statusFilter.value = 'all';
        if (typeof renderLibrary === 'function') renderLibrary();
        if (typeof switchPage === 'function') switchPage('library');

      } catch (err) {

        if (err.name === 'QuotaExceededError') {

        } else if (err.message.includes('Failed to fetch')) {

        } else {

        }
      }
    };
  }

  if (dom.externalSearchBtn && dom.externalSearchInput && dom.externalResults) {
    dom.externalSearchBtn.onclick = async () => {
      const q = dom.externalSearchInput.value.trim();
      if (!q) return;

      dom.externalResults.innerHTML = '<p>🔍 Пошук...</p>';
      try {
        // Пошук в OpenLibrary
        const response = await fetch(`https://openlibrary.org/search.json?limit=10&q=${encodeURIComponent(q)}`);
        const data = await response.json();
        
        // Пошук у локальній базі (книги від інших користувачів)
        const localResults = state.books.filter(b => 
          (b.title.toLowerCase().includes(q.toLowerCase()) || 
           b.author.toLowerCase().includes(q.toLowerCase())) &&
          b.userId !== state.user.id // не показуємо власні книги
        );

        // Комбінуємо результати: спочатку локальні книги, потім OpenLibrary
        let html = '';
        
        if (localResults.length > 0) {
          html += '<div style="margin-bottom: 20px;"><h4 style="text-align: center; color: var(--color-primary); font-size: 14px; margin-bottom: 10px;">📚 КНИГИ ВІД КОРИСТУВАЧІВ</h4>';
          html += localResults.map(book => {
            const owner = book.userId || 'Невідомий користувач';
            const cover = book.cover || window.PlaceholderFallback.book;
            const pages = book.pages || 0;
            const genre = book.genre || 'Без жанру';
            return `
              <article class="book-card" data-id="${book.id}">
                <img src="${cover}" alt="${book.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;" onerror="this.src=window.PlaceholderFallback.book;" />
                <h3 style="font-size: 15px; margin: 5px 0;">${book.title}</h3>
                <div class="card-meta" style="font-size: 13px;"><span>Автор: ${book.author}</span></div>
                <div class="card-meta" style="font-size: 13px;"><span>Жанр: ${genre}</span><span>Сторінок: ${pages}</span></div>
                <div class="card-meta" style="font-size: 12px; color: #999;">👤 ${owner}</div>
                <button class="add-local" data-id="${book.id}" type="button" style="width: 100%; padding: 8px; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 5px;">➕ Додати</button>
              </article>`;
          }).join('');
          html += '</div>';
        }

        if (data.docs.length > 0) {
          html += '<div><h4 style="text-align: center; color: var(--color-primary); font-size: 14px; margin-bottom: 10px;">🌐 КНИГИ З OPENLIBRARY</h4>';
          html += data.docs.map((doc) => {
            const book = placeholderBook(doc);
            const cover = book.cover || window.PlaceholderFallback.book;
            return `
              <article class="book-card" data-key="${doc.key}">
                <img src="${cover}" alt="${book.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;" onerror="this.src=window.PlaceholderFallback.book;" />
                <h3 style="font-size: 15px; margin: 5px 0;">${book.title}</h3>
                <div class="card-meta" style="font-size: 13px;"><span>Автор: ${book.author}</span></div>
                <div class="card-meta" style="font-size: 13px;"><span>Жанр: ${book.genre}</span><span>Сторінок: ${book.pages}</span></div>
                <div class="card-meta" style="font-size: 12px; color: #666; max-height: 50px; overflow: hidden;">${book.description.substring(0, 100)}...</div>
                <button class="add-ext" data-key="${doc.key}" type="button" style="width: 100%; padding: 8px; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 5px;">➕ Додати</button>
              </article>`;
          }).join('');
          html += '</div>';
        }

        if (!localResults.length && !data.docs.length) {
          html = '<p>Нічого не знайдено</p>';
        }

        dom.externalResults.innerHTML = html;

        // Обробник для додавання локальних книг
        dom.externalResults.querySelectorAll('.add-local').forEach((btn) => {
          btn.onclick = async () => {
            const id = btn.dataset.id;
            const book = state.books.find(b => b.id === id);
            if (!book) return;
            
            await addBook({
              title: book.title,
              author: book.author,
              genre: book.genre,
              description: book.description,
              pages: book.pages,
              cover: book.cover
            });
            renderFolders();
            if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
            if (dom.statusFilter) dom.statusFilter.value = 'all';
            renderLibrary();
            if (typeof switchTab === 'function') switchTab('manual');
            if (typeof switchPage === 'function') switchPage('library');
          };
        });

        // Обробник для додавання книг з OpenLibrary
        dom.externalResults.querySelectorAll('.add-ext').forEach((btn) => {
          btn.onclick = async () => {
            const key = btn.dataset.key;
            const item = data.docs.find((doc) => doc.key === key);
            if (!item) return;

            await addBook(placeholderBook(item));
            renderFolders();
            if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
            if (dom.statusFilter) dom.statusFilter.value = 'all';
            renderLibrary();
            if (typeof switchTab === 'function') switchTab('manual');
            if (typeof switchPage === 'function') switchPage('library');
          };
        });
      } catch (error) {
        dom.externalResults.innerHTML = '<p>Помилка пошуку</p>';
      }
    };
  }
};

const wireEvents = () => {
  // Навігація між розділами
  if (dom.navButtons) {
    dom.navButtons.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        const page = e.target.dataset.page;
        if (typeof switchPage === 'function') switchPage(page);
      })
    );
  }

  // Бібліотека - фільтрація
  if (dom.folderFilter) dom.folderFilter.addEventListener('change', renderLibrary);
  if (dom.statusFilter) dom.statusFilter.addEventListener('change', renderLibrary);
  if (dom.searchInput) dom.searchInput.addEventListener('input', renderLibrary);

  // Бібліотека - створення папки
  if (dom.createFolderBtn && dom.newFolderName) {
    dom.createFolderBtn.addEventListener('click', async () => {
      const name = dom.newFolderName.value.trim();
      if (!name) return;

      const folder = await createFolder(name);
      if (!folder) {

        return;
      }

      dom.newFolderName.value = '';
      renderFolders();
      renderLibrary();
    });
  }

  // Бібліотека - видалення папки
  if (dom.deleteFolderBtn) {
    dom.deleteFolderBtn.addEventListener('click', async () => {
      const folderId = dom.folderFilter ? dom.folderFilter.value : 'folder_all';
      if (!folderId || folderId === 'folder_all') {
        return;
      }

      const folder = state.folders.find(f => f.id === folderId);
      if (!folder) return;

      if (!confirm(`Видалити папку «${folder.name}» і всі книги в ній?`)) return;

      const result = await deleteFolder(folderId);
      if (result) {
        renderFolders();
        if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
        renderLibrary();

      }
    });
  }

  bindAddPageEvents();

  // Панель налаштувань теми
  const themeButton = document.getElementById('themeSettingsBtn');
  const themeSelect = document.getElementById('themeSelect');
  if (themeButton) {
    themeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (typeof toggleThemePanel === 'function') toggleThemePanel();
    });
  }
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      if (typeof applyTheme === 'function') applyTheme(e.target.value);
    });
  }

  // Закрити панель при кліку поза нею
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('themeSettingsPanel');
    const button = document.getElementById('themeSettingsBtn');
    if (!panel || !button) return;
    if (!panel.contains(e.target) && e.target !== button) {
      panel.classList.add('hidden');
    }
  });

  // Модалка - закриття
  if (dom.closeModal) dom.closeModal.addEventListener('click', closeModal);
  if (dom.bookModal) {
    dom.bookModal.addEventListener('click', (e) => {
      if (e.target === dom.bookModal && typeof closeModal === 'function') closeModal();
    });
  }
};

// Ізоляція даних для кожного користувача
window.isolateUserData = (userId) => {
  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;
  
  Storage.prototype.getItem = function(key) {
    if (key === 'readingTrackerData') {
      return originalGetItem.call(this, `readingTrackerData_${userId}`);
    }
    return originalGetItem.call(this, key);
  };
  
  Storage.prototype.setItem = function(key, value) {
    if (key === 'readingTrackerData') {
      return originalSetItem.call(this, `readingTrackerData_${userId}`, value);
    }
    return originalSetItem.call(this, key, value);
  };
};

window.initAppAfterAuth = async (userId) => {



  window.isolateUserData(userId);
  loadStateFromStorage();

  // Відновлюємо дані поточного користувача
  const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
  const currentUser = users.find(u => u.id === userId);
  if (currentUser && typeof state !== 'undefined') {
    state.user = currentUser;
  }

  if (typeof window.renderAddPageUI === 'function') window.renderAddPageUI();
  bindAddPageEvents();
  
  // ✅ Завантажуємо папки з сервера
  if (typeof loadFoldersFromServer === 'function') {
    await loadFoldersFromServer();
  }
  
  renderFolders();
  if (dom.folderFilter) dom.folderFilter.value = 'folder_all';
  if (dom.statusFilter) dom.statusFilter.value = 'all';
  renderLibrary();
  renderFeed();
  renderProfile();
  wireEvents();

  // ✅ Завантажуємо книги з сервера
  if (typeof loadBooksFromServer === 'function') {
    await loadBooksFromServer();
  }



  // Синхронізуємо книги з сервером кожні 10 секунд
  setInterval(() => {
    if (typeof loadBooksFromServer === 'function') {
      loadBooksFromServer().catch(err => {});
    }
  }, 10000);

  window.debugTheme = () => {



    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');

  };
};

// Ініціалізація додатку
const init = async () => {
  const authId = localStorage.getItem('readingTrackerAuth');
  if (!authId) {
    if (typeof window.renderAuthScreen === 'function') {
      window.renderAuthScreen();
    } else {

    }
  } else {
    await window.initAppAfterAuth(authId);
  }
};

window.addEventListener('DOMContentLoaded', init);
