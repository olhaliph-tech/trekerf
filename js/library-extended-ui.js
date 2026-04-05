/**
 * 🎨 LIBRARY EXTENDED UI COMPONENTS
 * ==================================
 * Компоненти інтерфейсу для розширених функцій бібліотеки
 */

// ============================================
// РЕНДЕРИНГ НОТАТОК ТА ЦИТАТ
// ============================================

const renderNotesPanel = (bookId) => {
  const notes = window.LibraryExtended?.getBookNotes(bookId) || [];
  const quotes = window.LibraryExtended?.getQuotes(bookId) || [];

  return `
    <div class="notes-panel" style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 12px; margin-top: 15px;">
      <h4 style="margin: 0 0 10px 0; color: var(--color-primary);">📝 Мої записи</h4>
      
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input id="newNote_${bookId}" placeholder="Додати нотатку..." style="flex: 1; padding: 8px; border: 1px solid #sda; border-radius: 6px;" />
        <button class="add-note-btn" data-book-id="${bookId}" style="padding: 8px 12px; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer;">➕</button>
      </div>

      <div class="notes-list" style="max-height: 200px; overflow-y: auto;">
        ${notes.map(note => `
          <div class="note-item" style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px; margin-bottom: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 500;">Сторінка ${note.page}</span>
              <button class="delete-note-btn" data-book-id="${bookId}" data-note-id="${note.id}" style="background: #f87171; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">Видалити</button>
            </div>
            <p style="margin: 5px 0 0 0; color: #666;">${note.text}</p>
          </div>
        `).join('')}
      </div>

      <h4 style="margin: 15px 0 10px 0; color: var(--color-primary);">✨ Мої цитати</h4>
      <div class="quotes-list">
        ${quotes.map(quote => `
          <div class="quote-item" style="background: linear-gradient(135deg, rgba(230, 150, 180, 0.1) 0%, rgba(170, 150, 230, 0.1) 100%); padding: 10px; border-left: 3px solid var(--color-primary); border-radius: 6px; margin-bottom: 8px; font-size: 12px; font-style: italic;">
            <p style="margin: 0 0 5px 0; color: #666;">"${quote.text}"</p>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #999;">
              <span>🔖 Сторінка ${quote.page}</span>
              <button class="favorite-quote-btn" data-book-id="${bookId}" data-quote-id="${quote.id}" style="background: none; border: none; cursor: pointer; font-size: 14px;">
                ${quote.isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// ============================================
// РЕНДЕРИНГ ТЕГІВ
// ============================================

const renderTagsPanel = (bookId) => {
  const colorTags = window.LibraryExtended?.getColorTags(bookId) || [];
  const quickTags = window.LibraryExtended?.getQuickTags(bookId) || [];

  return `
    <div class="tags-panel" style="margin-top: 15px;">
      <h4 style="color: var(--color-primary); margin-bottom: 10px;">🏷️ Теги</h4>
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
        ${colorTags.map(tag => `
          <span class="color-tag" style="background: ${tag.color}; padding: 6px 12px; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
            ${tag.name}
            <button class="remove-tag-btn" data-book-id="${bookId}" data-tag="${tag.name}" style="background: none; border: none; cursor: pointer; font-size: 12px;">✕</button>
          </span>
        `).join('')}
      </div>

      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${quickTags.map(tag => `
          <span class="quick-tag" style="background: linear-gradient(135deg, rgba(230, 150, 180, 0.3), rgba(170, 150, 230, 0.3)); padding: 6px 10px; border-radius: 20px; font-size: 11px;">
            ${tag.emoji} ${tag.label}
          </span>
        `).join('')}
      </div>

      <input id="newTag_${bookId}" placeholder="Додати новий тег..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-top: 10px;" />
      <button class="add-tag-btn" data-book-id="${bookId}" style="width: 100%; padding: 8px; margin-top: 8px; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer;">➕ Додати тег</button>
    </div>
  `;
};

// ============================================
// РЕНДЕРИНГ ПАНЕЛІ ПОДАРУНКУ
// ============================================

const renderGiftPanel = (bookId) => {
  const book = state.books?.find(b => b.id === bookId);
  const gift = book?.gift;

  return `
    <div class="gift-panel" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)); padding: 15px; border-radius: 12px; margin-top: 15px; border: 2px solid rgba(255, 215, 0, 0.3);">
      ${gift?.isGift ? `
        <h4 style="color: #FF6B35; margin: 0 0 10px 0;">🎁 Це подарунок!</h4>
        <div style="font-size: 13px;">
          <p><strong>Від:</strong> ${gift.from || 'невідомо'}</p>
          <p><strong>Причина:</strong> ${gift.occasion || 'без причини'}</p>
          <p><strong>Дата:</strong> ${new Date(gift.date).toLocaleDateString('uk-UA')}</p>
          ${gift.thankYou ? `
            <p style="color: green;"><strong>✓ Поблагодарили:</strong> ${new Date(gift.thankedDate).toLocaleDateString('uk-UA')}</p>
          ` : `
            <button class="thank-gift-btn" data-book-id="${bookId}" style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px;">✓ Позначити як полагодарив</button>
          `}
        </div>
      ` : `
        <h4 style="color: var(--color-primary); margin: 0 0 10px 0;">🎁 Позначити як подарунок</h4>
        <input id="giftFrom_${bookId}" placeholder="Від кого подарунок?" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 8px;" />
        <input id="giftOccasion_${bookId}" placeholder="Причина подарунку?" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 8px;" />
        <button class="set-gift-btn" data-book-id="${bookId}" style="width: 100%; padding: 8px; background: #F59E0B; color: white; border: none; border-radius: 6px; cursor: pointer;">🎁 Позначити як подарунок</button>
      `}
    </div>
  `;
};

// ============================================
// РЕНДЕРИНГ АНАЛІТИКИ
// ============================================

const renderBookAnalytics = (bookId) => {
  const analytics = window.LibraryExtended?.getBookAnalytics(bookId);
  if (!analytics) return '';

  return `
    <div class="book-analytics" style="background: rgba(100, 200, 255, 0.05); padding: 15px; border-radius: 12px; margin-top: 15px;">
      <h4 style="color: var(--color-primary); margin: 0 0 12px 0;">📊 Моя аналітика</h4>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
        <div style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px;">
          <span style="color: #999;">Прогре́с</span>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: var(--color-primary);">${analytics.progressPercent}%</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px;">
          <span style="color: #999;">Сторінок/день</span>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: var(--color-primary);">${analytics.pagesPerDay}</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px;">
          <span style="color: #999;">Днів читаю</span>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: var(--color-primary);">${analytics.readingDays}</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px;">
          <span style="color: #999;">Нотаток</span>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: var(--color-primary);">${analytics.notesCount}</p>
        </div>
      </div>
      
      ${analytics.estimatedFinishDate ? `
        <div style="margin-top: 12px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 6px; border-left: 3px solid #10B981;">
          <span style="color: #999; font-size: 12px;">Орієнтовна дата закінчення</span>
          <p style="margin: 5px 0 0 0; color: #10B981; font-weight: 500;">${new Date(analytics.estimatedFinishDate).toLocaleDateString('uk-UA')}</p>
        </div>
      ` : ''}
    </div>
  `;
};

// ============================================
// РЕНДЕРИНГ СМАРТ-НАГАДУВАНЬ
// ============================================

const renderSmartReminders = () => {
  const reminders = window.LibraryExtended?.getSmartReminders() || [];
  
  if (reminders.length === 0) return '';

  return `
    <div class="reminders-banner" style="background: linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(251, 191, 36, 0.2)); padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #F87171;">
      <h3 style="margin: 0 0 10px 0; color: #DC2626;">🔔 Розумні нагадування</h3>
      ${reminders.map(reminder => `
        <div style="margin-bottom: 8px; padding: 10px; background: rgba(255, 255, 255, 0.3); border-radius: 6px; font-size: 13px;">
          <span style="color: #666;">${reminder.message}</span>
        </div>
      `).join('')}
    </div>
  `;
};

// ============================================
// РЕНДЕРИНГ КОЛЕКЦІЙ
// ============================================

const renderCollectionsPanel = (bookId) => {
  const collections = window.LibraryExtended?.getCollections() || [];
  const book = state.books?.find(b => b.id === bookId);

  return `
    <div class="collections-panel" style="margin-top: 15px;">
      <h4 style="color: var(--color-primary); margin-bottom: 10px;">📚 Колекції</h4>
      
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
        ${collections.map(coll => {
          const isInCollection = coll.bookIds?.includes(bookId);
          return `
            <span class="collection-tag" style="background: ${isInCollection ? 'var(--color-primary)' : 'rgba(200, 200, 200, 0.3)'}; color: ${isInCollection ? 'white' : '#666'}; padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer;" data-book-id="${bookId}" data-coll-id="${coll.id}">
              ${coll.name} ${isInCollection ? '✓' : ''}
            </span>
          `;
        }).join('')}
      </div>
      
      <div style="display: flex; gap: 8px;">
        <input id="newColl_${bookId}" placeholder="Нова колекція..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px;" />
        <button class="create-coll-btn" data-book-id="${bookId}" style="padding: 8px 12px; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer;">➕</button>
      </div>
    </div>
  `;
};

// ============================================
// РЕНДЕРИНГ ПОРІВНЯННЯ З ДРУЗЯМИ
// ============================================

const renderFriendComparison = (bookId) => {
  const stats = window.LibraryExtended?.getBookComparisonStats(bookId);
  if (!stats) return '';

  return `
    <div class="friend-comparison" style="background: rgba(168, 85, 247, 0.05); padding: 15px; border-radius: 12px; margin-top: 15px;">
      <h4 style="color: var(--color-primary); margin: 0 0 12px 0;">👥 Порівняння з друзями</h4>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
        <div style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px; text-align: center;">
          <span style="color: #999; font-size: 11px;">Твій прогрес</span>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #10B981;">${stats.yourProgress}%</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.3); padding: 10px; border-radius: 6px; text-align: center;">
          <span style="color: #999; font-size: 11px;">Середній у друзів</span>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #3B82F6;">${stats.averageProgress}%</p>
        </div>
      </div>
      
      ${stats.friendsCount > 0 ? `
        <div style="margin-top: 12px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #3B82F6; font-weight: 500;">
            ${stats.yoursAhead ? '🚀 Ти попереду!' : '🏃 Друзі попереду!'}
            <span style="display: block; font-size: 11px; color: #999; margin-top: 4px;"> ${stats.friendsCount} друзів читають цю книгу</span>
          </p>
        </div>
      ` : ''}
    </div>
  `;
};

// ============================================
// Експортування компонентів
// ============================================

window.LibraryExtendedUI = {
  renderNotesPanel,
  renderTagsPanel,
  renderGiftPanel,
  renderBookAnalytics,
  renderSmartReminders,
  renderCollectionsPanel,
  renderFriendComparison
};
