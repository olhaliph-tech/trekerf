/**
 * 🎣 LIBRARY EXTENDED - EVENT HANDLERS
 * ====================================
 * Обработники подій для розширених функцій
 */

// ============================================
// ОБРАБОТНИК ПОДІЙ - НОТАТКИ
// ============================================

const initNotesHandlers = () => {
  // Додання нотатки
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-note-btn')) {
      const bookId = e.target.dataset.bookId;
      const input = document.getElementById(`newNote_${bookId}`);
      
      if (input && input.value.trim()) {
        const note = window.LibraryExtended?.addBookNote(bookId, input.value.trim());
        if (note) {
          input.value = '';
          // Перерендеринг панелі або показання сповіщення
          console.log('✅ Нотатка додана:', note.text);
        }
      }
    }

    // Видалення нотатки
    if (e.target.classList.contains('delete-note-btn')) {
      const bookId = e.target.dataset.bookId;
      const noteId = e.target.dataset.noteId;
      
      if (confirm('Видалити нотатку?')) {
        window.LibraryExtended?.deleteBookNote(bookId, noteId);
        console.log('✅ Нотатка видалена');
      }
    }
  });
};

// ============================================
// ОБРАБОТНИК ПОДІЙ - ЦИТАТИ
// ============================================

const initQuotesHandlers = () => {
  document.addEventListener('click', (e) => {
    // Додання цитати (передбачається за наявністю модального вікна)
    if (e.target.classList.contains('add-quote-btn')) {
      const bookId = e.target.dataset.bookId;
      const quoteText = prompt('Введіть цитату:');
      const pageNum = prompt('Номер сторінки:') || 0;
      
      if (quoteText) {
        const quote = window.LibraryExtended?.addQuote(bookId, quoteText, parseInt(pageNum));
        console.log('✅ Цитата додана:', quote);
      }
    }

    // Помітити як улюблену
    if (e.target.classList.contains('favorite-quote-btn')) {
      const bookId = e.target.dataset.bookId;
      const quoteId = e.target.dataset.quoteId;
      
      window.LibraryExtended?.toggleFavoriteQuote(bookId, quoteId);
      e.target.textContent = e.target.textContent === '❤️' ? '🤍' : '❤️';
      console.log('✅ Статус улюбленого змінений');
    }
  });
};

// ============================================
// ОБРАБОТНИК ПОДІЙ - ТЕГИ
// ============================================

const initTagsHandlers = () => {
  document.addEventListener('click', (e) => {
    // Додання кольорового тегу
    if (e.target.classList.contains('add-tag-btn')) {
      const bookId = e.target.dataset.bookId;
      const input = document.getElementById(`newTag_${bookId}`);
      
      if (input && input.value.trim()) {
        const tag = window.LibraryExtended?.addColorTag(bookId, input.value.trim());
        if (tag) {
          input.value = '';
          console.log('✅ Тег додан:', tag.name);
        } else {
          alert('Цей тег вже існує для цієї книги');
        }
      }
    }

    // Видалення тегу
    if (e.target.classList.contains('remove-tag-btn')) {
      const bookId = e.target.dataset.bookId;
      const tagName = e.target.dataset.tag;
      
      window.LibraryExtended?.removeColorTag(bookId, tagName);
      e.target.parentElement.remove();
      console.log('✅ Тег видалений:', tagName);
    }

    // Додання швидкого тегу (через кліком на готові варіанти)
    if (e.target.classList.contains('quick-tag-option')) {
      const bookId = e.target.dataset.bookId;
      const tagKey = e.target.dataset.tagKey;
      
      window.LibraryExtended?.addQuickTag(bookId, tagKey);
      console.log('✅ Швидкий тег додан:', tagKey);
    }
  });
};

// ============================================
// ОБРАБОТНИК ПОДІЙ - ПОДАРУНКИ
// ============================================

const initGiftHandlers = () => {
  document.addEventListener('click', (e) => {
    // Додання статусу подарунку
    if (e.target.classList.contains('set-gift-btn')) {
      const bookId = e.target.dataset.bookId;
      const fromInput = document.getElementById(`giftFrom_${bookId}`);
      const occasionInput = document.getElementById(`giftOccasion_${bookId}`);
      
      const from = fromInput?.value || '';
      const occasion = occasionInput?.value || '';
      
      window.LibraryExtended?.setAsGift(bookId, from, occasion);
      console.log('✅ Книга позначена як подарунок від:', from);
    }

    // Позначити як "поблагодарив"
    if (e.target.classList.contains('thank-gift-btn')) {
      const bookId = e.target.dataset.bookId;
      window.LibraryExtended?.markGiftAsThanked(bookId);
      console.log('✅ Позначено як "поблагодарив"');
    }
  });
};

// ============================================
// ОБРАБОТНИК ПОДІЙ - КОЛЕКЦІЇ
// ============================================

const initCollectionsHandlers = () => {
  document.addEventListener('click', (e) => {
    // Додання до колекції (клік по мітці колекції)
    if (e.target.classList.contains('collection-tag')) {
      const bookId = e.target.dataset.bookId;
      const collId = e.target.dataset.collId;
      
      window.LibraryExtended?.addBookToCollection(collId, bookId);
      e.target.style.background = 'var(--color-primary)';
      e.target.style.color = 'white';
      e.target.textContent += ' ✓';
      console.log('✅ Книга додана до колекції');
    }

    // Створення нової колекції
    if (e.target.classList.contains('create-coll-btn')) {
      const bookId = e.target.dataset.bookId;
      const input = document.getElementById(`newColl_${bookId}`);
      
      if (input && input.value.trim()) {
        const coll = window.LibraryExtended?.createCollection(input.value.trim());
        if (coll) {
          window.LibraryExtended?.addBookToCollection(coll.id, bookId);
          input.value = '';
          console.log('✅ Колекція створена:', coll.name);
        }
      }
    }
  });
};

// ============================================
// ОБРАБОТНИК ПОДІЙ - КАРТОЧКИ
// ============================================

const initCardSettingsHandlers = () => {
  // Налаштування розміру карточок
  const cardSizeSelector = document.getElementById('cardSize');
  if (cardSizeSelector) {
    cardSizeSelector.addEventListener('change', (e) => {
      window.LibraryExtended?.setCardSize(e.target.value);
      console.log('✅ Розмір карточок змінений на:', e.target.value);
    });
  }

  // Налаштування видимості полів
  const displaySelectors = document.querySelectorAll('[data-display-option]');
  displaySelectors.forEach(selector => {
    selector.addEventListener('change', (e) => {
      const options = {};
      displaySelectors.forEach(sel => {
        const optionName = sel.dataset.displayOption;
        options[optionName] = sel.checked;
      });
      window.LibraryExtended?.setCardDisplayOptions(options);
      console.log('✅ Параметри відображення змінені');
    });
  });
};

// ============================================
// ІНІЦІАЛІЗАЦІЯ ВСІХ ОБРАБОТНИКІВ
// ============================================

const initLibraryExtendedHandlers = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initNotesHandlers();
      initQuotesHandlers();
      initTagsHandlers();
      initGiftHandlers();
      initCollectionsHandlers();
      initCardSettingsHandlers();
      console.log('✅ Library Extended обработники ініціалізовані');
    });
  } else {
    initNotesHandlers();
    initQuotesHandlers();
    initTagsHandlers();
    initGiftHandlers();
    initCollectionsHandlers();
    initCardSettingsHandlers();
    console.log('✅ Library Extended обработники ініціалізовані');
  }
};

// Запуск при завантаженні
initLibraryExtendedHandlers();
