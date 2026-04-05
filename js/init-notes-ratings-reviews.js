// ===== МОДУЛЬ УПРАВЛІННЯ ЗАМЕТКАМИ, ОЦІНКАМИ ТА ВІДГУКАМИ =====
// Дозволяє користувачам:
// 1. Залишати заметки до книги
// 2. Ставити оцінку (1-5 зірок) коли книга прочитана
// 3. Залишати текстовий відгук до книги

// ============== ІНІЦІАЛІЗАЦІЯ НОВИХ ПОЛІВ КНИГИ ==============
const initializeBookNotesRatingsReviews = (book) => {
  if (!book.notes) book.notes = [];
  if (!book.rating) book.rating = 0;
  if (!book.review) book.review = '';
  if (!book.reviewDate) book.reviewDate = null;
  return book;
};

// ============== УПРАВЛІННЯ ЗАМЕТКАМИ ==============

// Додати нову заметку до книги
const addNote = (bookId, noteText) => {
  if (!noteText || noteText.trim().length === 0) {
    return { success: false, message: 'Заметка не може бути пустою.' };
  }

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Книга не знайдена.' };

  initializeBookNotesRatingsReviews(book);
  
  const note = {
    id: newId('note'),
    text: noteText.trim(),
    createdAt: new Date().toISOString()
  };

  book.notes.push(note);
  createActivityRecord('note', `📝 Додана заметка до: ${book.title}`, bookId);
  saveStateToStorage();
  
  return { success: true, noteId: note.id };
};

// Видалити заметку
const removeNote = (bookId, noteId) => {
  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Книга не знайдена.' };

  const noteIndex = book.notes.findIndex(n => n.id === noteId);
  if (noteIndex === -1) return { success: false, message: 'Заметка не знайдена.' };

  const removedNote = book.notes.splice(noteIndex, 1)[0];
  createActivityRecord('note-delete', `🗑️ Видалена заметка з: ${book.title}`, bookId);
  saveStateToStorage();

  return { success: true, message: 'Заметка видалена.' };
};

// Отримати всі заметки книги
const getNotesByBook = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return [];
  
  initializeBookNotesRatingsReviews(book);
  return book.notes || [];
};

// Редагувати заметку
const editNote = (bookId, noteId, newText) => {
  if (!newText || newText.trim().length === 0) {
    return { success: false, message: 'Заметка не може бути пустою.' };
  }

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Книга не знайдена.' };

  const note = book.notes.find(n => n.id === noteId);
  if (!note) return { success: false, message: 'Заметка не знайдена.' };

  note.text = newText.trim();
  note.updatedAt = new Date().toISOString();
  createActivityRecord('note-edit', `✏️ Відредагована заметка: ${book.title}`, bookId);
  saveStateToStorage();

  return { success: true };
};

// ============== УПРАВЛІННЯ ОЦІНКАМИ ==============

// Встановити оцінку книги (1-5 зірок)
const setBookRating = (bookId, rating) => {
  if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
    return { success: false, message: 'Оцінка має бути від 0 до 5.' };
  }

  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Книга не знайдена.' };

  if (book.status !== 'прочитано' && rating > 0) {
    return { success: false, message: '⚠️ Можна ставити оцінку тільки коли книга прочитана!' };
  }

  const oldRating = book.rating || 0;
  book.rating = rating;
  
  if (rating > 0 && oldRating === 0) {
    createActivityRecord('rating', `⭐ Дав оцінку ${rating}/5 книзі: ${book.title}`, bookId);
  } else if (rating !== oldRating) {
    createActivityRecord('rating-update', `⭐ Змінив оцінку на ${rating}/5: ${book.title}`, bookId);
  }
  
  saveStateToStorage();
  return { success: true, rating: book.rating };
};

// Отримати оцінку книги
const getBookRating = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return 0;
  
  initializeBookNotesRatingsReviews(book);
  return book.rating || 0;
};

// ============== УПРАВЛІННЯ ВІДГУКАМИ ==============

// Встановити відгук (текстовий review)
const setBookReview = (bookId, reviewText) => {
  const book = getBookById(bookId);
  if (!book) return { success: false, message: 'Книга не знайдена.' };

  if (book.status !== 'прочитано') {
    return { success: false, message: '⚠️ Можна залишати відгук тільки коли книга прочитана!' };
  }

  const hadReview = book.review && book.review.length > 0;
  book.review = reviewText.trim();
  book.reviewDate = new Date().toISOString();

  if (!hadReview && book.review.length > 0) {
    createActivityRecord('review', `💬 Написав відгук до: ${book.title}`, bookId);
  } else if (hadReview && book.review.length > 0) {
    createActivityRecord('review-update', `✏️ Оновив відгук: ${book.title}`, bookId);
  }

  saveStateToStorage();
  return { success: true, reviewDate: book.reviewDate };
};

// Отримати отзыв книги
const getBookReview = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return '';
  
  initializeBookNotesRatingsReviews(book);
  return book.review || '';
};

// Отримати дату відгука
const getBookReviewDate = (bookId) => {
  const book = getBookById(bookId);
  if (!book) return null;
  
  initializeBookNotesRatingsReviews(book);
  return book.reviewDate || null;
};

// ============== UI ФУНКЦІЇ ==============

// Отримати HTML для відображення зірок оцінки (з інтерактивністю)
const renderRatingInput = (bookId, currentRating = 0) => {
  let html = '<div class="rating-input" style="display: flex; gap: 5px; align-items: center; margin: 10px 0;">';
  
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= currentRating;
    html += `
      <button 
        class="star-btn" 
        data-rating="${i}" 
        style="
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          opacity: ${isFilled ? '1' : '0.4'};
          transition: opacity 0.2s, transform 0.2s;
        "
        onmouseover="this.style.opacity='1'; this.style.transform='scale(1.15)';"
        onmouseout="this.style.opacity='${isFilled ? '1' : '0.4'}'; this.style.transform='scale(1)';"
      >⭐</button>
    `;
  }
  
  if (currentRating > 0) {
    html += `<span style="margin-left: 10px; color: var(--color-primary); font-weight: bold;">${currentRating}/5</span>`;
  } else {
    html += `<span style="margin-left: 10px; color: #999;">Не оцінено</span>`;
  }
  
  html += '</div>';
  return html;
};

// Отримати HTML для відображення заметок
const renderNotesUI = (bookId) => {
  const notes = getNotesByBook(bookId);
  
  let html = `
    <div style="margin-top: 15px; background: rgba(255,255,255,0.35); padding: 15px; border-radius: 12px;">
      <h5 style="margin: 0 0 10px 0; color: var(--color-primary);">📝 Заметки (${notes.length})</h5>
      
      <textarea 
        id="newNoteInput" 
        placeholder="Додати нову заметку..." 
        style="
          width: 100%; 
          padding: 10px; 
          border: 1px solid rgba(230,150,180,0.3); 
          border-radius: 8px; 
          resize: vertical; 
          min-height: 60px;
          font-family: inherit;
          margin-bottom: 8px;
        "
      ></textarea>
      <button id="addNoteBtn" style="background: var(--color-primary); color: white; padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer;">➕ Додати заметку</button>
      
      <div id="notesList" style="margin-top: 12px; max-height: 300px; overflow-y: auto;">
  `;
  
  if (notes.length === 0) {
    html += '<p style="color: #999; font-size: 0.9rem;">Немає заметок. Додайте першу!</p>';
  } else {
    notes.forEach((note, idx) => {
      const createdDate = formatDate(note.createdAt);
      html += `
        <div style="
          background: white; 
          padding: 10px; 
          margin-bottom: 8px; 
          border-radius: 8px; 
          border-left: 3px solid var(--color-primary);
        ">
          <p style="margin: 0 0 5px 0; color: #333;">${note.text}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #999;">
            <span>📅 ${createdDate}</span>
            <div style="display: flex; gap: 5px;">
              <button class="edit-note-btn" data-note-id="${note.id}" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✏️ Редагувати</button>
              <button class="delete-note-btn" data-note-id="${note.id}" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🗑️ Видалити</button>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  html += '</div></div>';
  return html;
};

// Отримати HTML для відображення відгуку
const renderReviewUI = (bookId, book) => {
  const review = getBookReview(bookId);
  const reviewDate = getBookReviewDate(bookId);
  const isRead = book.status === 'прочитано';
  
  let html = `
    <div style="margin-top: 15px; background: rgba(255,255,255,0.35); padding: 15px; border-radius: 12px;">
      <h5 style="margin: 0 0 10px 0; color: var(--color-primary);">💬 Ваш відгук</h5>
  `;
  
  if (!isRead) {
    html += '<p style="color: #e97316; font-size: 0.9rem; margin: 0;">⚠️ Можна залишати відгук тільки коли книга прочитана.</p>';
  } else {
    html += `
      <textarea 
        id="reviewInput" 
        placeholder="Поділіться своїми враженнями про книгу..." 
        value="${review}"
        style="
          width: 100%; 
          padding: 10px; 
          border: 1px solid rgba(230,150,180,0.3); 
          border-radius: 8px; 
          resize: vertical; 
          min-height: 100px;
          font-family: inherit;
          margin-bottom: 8px;
        "
      >${review}</textarea>
      <button id="saveReviewBtn" style="background: var(--color-primary); color: white; padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer;">💾 Зберегти відгук</button>
      
      ${review ? `<p style="margin-top: 10px; color: #64748b; font-size: 0.85rem;">📅 Відгук написаний: ${formatDate(reviewDate)}</p>` : ''}
    `;
  }
  
  html += '</div>';
  return html;
};

// ============== ЕКСПОРТУВАННЯ ФУНКЦІЙ ==============
// Для використання в якості глобальних функцій коли скрипт завантажается

window.initializeBookNotesRatingsReviews = initializeBookNotesRatingsReviews;
window.addNote = addNote;
window.removeNote = removeNote;
window.getNotesByBook = getNotesByBook;
window.editNote = editNote;
window.setBookRating = setBookRating;
window.getBookRating = getBookRating;
window.setBookReview = setBookReview;
window.getBookReview = getBookReview;
window.getBookReviewDate = getBookReviewDate;
window.renderRatingInput = renderRatingInput;
window.renderNotesUI = renderNotesUI;
window.renderReviewUI = renderReviewUI;

console.log('✅ Модуль заметок, оцінок та відгуків загружений');
