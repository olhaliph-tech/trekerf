// Расширенная аналитика и стат по жанрам

function initializeAdvancedAnalytics() {
  const originalRenderAnalytics = window.renderAnalytics;
  let alreadyExtended = false;
  
  window.renderAnalytics = function() {
    originalRenderAnalytics();
    
    if (alreadyExtended) return;
    alreadyExtended = true;
    
    setTimeout(() => {
      const analyticsPage = document.getElementById('analytics');
      if (!analyticsPage) return;
      
      // Добавляем раздел по жанрам
      const genreSection = document.createElement('div');
      genreSection.style.cssText = 'margin-top: 30px; background: rgba(255, 255, 255, 0.4); padding: 20px; border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);';
      genreSection.innerHTML = `
        <h3>📚 Статистика по жанрам</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 15px;">
          ${typeof renderGenreStats === 'function' ? renderGenreStats() : '<p>Загружение...</p>'}
        </div>
      `;
      
      analyticsPage.appendChild(genreSection);
      
      // Добавляем раздел с советами
      const tipsSection = document.createElement('div');
      tipsSection.style.cssText = 'margin-top: 30px; background: linear-gradient(135deg, rgba(230,150,180,0.2) 0%, rgba(230,160,170,0.2) 100%); padding: 20px; border-radius: 20px; border: 2px solid rgba(230,150,180,0.3);';
      
      const totalBooks = state.books.length;
      const readBooks = state.books.filter(b => b.status === 'прочитано').length;
      const readingBooks = state.books.filter(b => b.status === 'читаю').length;
      
      let tips = [];
      if (readingBooks === 0 && readBooks > 0) {
        tips.push('💡 Вы давно не начинали новую книгу! Пора выбрать одну из списка желаний.');
      }
      if (readBooks === 0) {
        tips.push('💡 Это начало! Добавьте вашу первую книгу в список прочитанного.');
      }
      if (totalBooks > 10 && !state.goals?.length) {
        tips.push('💡 Установите цели чтения, чтобы отслеживать свой прогресс!');
      }
      
      tipsSection.innerHTML = `
        <h3>💡 Советы для вас</h3>
        <ul style="margin: 15px 0; padding-left: 20px;">
          ${tips.length > 0 ? tips.map(tip => `<li style="margin: 8px 0; color: #6b4a52;">${tip}</li>`).join('') : '<li style="color: #6b4a52;">Вы отлично справляетесь! Продолжайте в том же духе!</li>'}
        </ul>
      `;
      
      analyticsPage.appendChild(tipsSection);
    }, 100);
  };
}

function initializeEnhancedCommunity() {
  const originalRenderFeed = window.renderFeed;
  
  window.renderFeed = function() {
    originalRenderFeed();
    
    setTimeout(() => {
      const communityPage = document.getElementById('community');
      if (!communityPage) return;
      
      // Добавляем раздел «кого читают»
      if (!document.getElementById('trendingBooksSection')) {
        const trendingSection = document.createElement('div');
        trendingSection.id = 'trendingBooksSection';
        trendingSection.style.cssText = 'margin-bottom: 30px; background: rgba(255, 255, 255, 0.4); padding: 20px; border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);';
        
        // Получаем популярные книги (с наибольшим количеством "нравится")
        const bookPopularity = {};
        state.activity.forEach(activity => {
          if (activity.bookId) {
            bookPopularity[activity.bookId] = (bookPopularity[activity.bookId] || 0) + 1;
          }
        });
        
        const topBooks = Object.entries(bookPopularity)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([bookId, count]) => {
            const book = state.books.find(b => b.id === bookId);
            return book ? `
              <div style="background:rgba(255,255,255,0.5); padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>${book.title}</strong>
                  <p style="font-size:0.85rem; color:#999;">${book.author}</p>
                </div>
                <span style="background:var(--color-primary); color:white; padding:4px 8px; border-radius:12px; font-size:0.85rem;">📍 ${count}</span>
              </div>
            ` : '';
          })
          .join('');
        
        trendingSection.innerHTML = `
          <h3>🔥 Популярные в общине</h3>
          <div>${topBooks || '<p>Нет данных</p>'}</div>
        `;
        
        const communityHeading = communityPage.querySelector('h2');
        if (communityHeading) {
          communityHeading.insertAdjacentElement('afterend', trendingSection);
        }
      }
      
      // Добавляем раздел с фильтром активности
      const feedHeader = communityPage.querySelector('[style*="background: rgba(255, 255, 255, 0.4)"]');
      if (feedHeader && !feedHeader.querySelector('#feedFilter')) {
        const filterDiv = document.createElement('div');
        filterDiv.id = 'feedFilter';
        filterDiv.style.cssText = 'margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;';
        filterDiv.innerHTML = `
          <button data-filter="all" class="feed-filter-btn active" style="padding:8px 12px; border-radius:20px; border:2px solid var(--color-primary); background:var(--color-primary); color:white; cursor:pointer;">Все</button>
          <button data-filter="add" class="feed-filter-btn" style="padding:8px 12px; border-radius:20px; border:2px solid #ccc; background:white; color:#333; cursor:pointer;">📚 Добавлены</button>
          <button data-filter="finish" class="feed-filter-btn" style="padding:8px 12px; border-radius:20px; border:2px solid #ccc; background:white; color:#333; cursor:pointer;">✅ Завершены</button>
          <button data-filter="start" class="feed-filter-btn" style="padding:8px 12px; border-radius:20px; border:2px solid #ccc; background:white; color:#333; cursor:pointer;">▶️ Начаты</button>
        `;
        
        feedHeader.appendChild(filterDiv);
        
        // Обработчик фильтра
        document.querySelectorAll('.feed-filter-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            
            // Обновляем стили кнопок
            document.querySelectorAll('.feed-filter-btn').forEach(b => {
              b.style.background = 'white';
              b.style.color = '#333';
              b.style.borderColor = '#ccc';
            });
            e.target.style.background = 'var(--color-primary)';
            e.target.style.color = 'white';
            e.target.style.borderColor = 'var(--color-primary)';
            
            // Фильтруем активность
            const feedItems = document.querySelectorAll('.activity-item');
            feedItems.forEach(item => {
              let show = true;
              if (filter !== 'all') {
                const text = item.textContent;
                if (filter === 'add' && !text.includes('Додана')) show = false;
                if (filter === 'finish' && !text.includes('Завершено')) show = false;
                if (filter === 'start' && !text.includes('Розпочато')) show = false;
              }
              item.style.display = show ? 'block' : 'none';
            });
          });
        });
      }
    }, 100);
  };
}

// Инициализируем
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAdvancedAnalytics();
    initializeEnhancedCommunity();
  });
} else {
  initializeAdvancedAnalytics();
  initializeEnhancedCommunity();
}
