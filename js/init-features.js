// Инициализация расширенных функций
// Запускается после полной загрузки приложения

function initializeExtendedFeatures() {
  // Перехватываем оригинальный openBookModal и расширяем его
  const originalOpenBookModal = window.openBookModal;
  
  window.openBookModal = function(bookId) {
    const book = state.books.find((b) => b.id === bookId);
    if (!book) return;

    // Вызываем оригинальный модальный обработчик
    originalOpenBookModal(bookId);

    // После этого добавляем наши вкладки
    setTimeout(() => {
      const modalTabs = document.querySelector('.modal-tabs');
      if (modalTabs && !document.getElementById('ratingTab')) {
        // Добавляем новые вкладки
        const newTabs = document.createElement('div');
        newTabs.style.display = 'contents';
        newTabs.innerHTML = `
          <button class="modal-tab-btn" data-tab="rating" style="flex:1;">⭐ Рейтинг</button>
          <button class="modal-tab-btn" data-tab="reviews" style="flex:1;">💬 Рецензії</button>
        `;
        
        // Вставляем перед закрытием
        for (let btn of newTabs.querySelectorAll('.modal-tab-btn')) {
          modalTabs.appendChild(btn);
        }
        
        // Добавляем содержимое вкладок в modalBody
        const modalBody = document.getElementById('modalBody');
        
        // Рейтинг вкладка
        const ratingTab = document.createElement('div');
        ratingTab.id = 'rating-tab';
        ratingTab.className = 'modal-tab-content';
        ratingTab.style.display = 'none';
        ratingTab.innerHTML = `
          <h4>Ваша оценка</h4>
          <div style="display:flex; gap:8px; margin:15px 0; font-size:1.8rem;">
            ${[1,2,3,4,5].map(i => `
              <span class="star-btn" data-rating="${i}" style="cursor:pointer; color:${i <= (book.rating || 0) ? '#ffc107' : '#ddd'};">★</span>
            `).join('')}
          </div>
          <p>Ваша оценка: <strong>${book.rating ? book.rating + '/5' : 'Не оценено'}</strong></p>
          
          <h4 style="margin-top:20px;">Оставить рецензію</h4>
          <textarea id="reviewText" placeholder="Поделитемь своим мнением..." style="width:100%; height:100px; padding:10px; border-radius:8px; border:1px solid #ddd;"></textarea>
          <button id="submitReview" style="margin-top:10px; padding:10px 20px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer;">Отправить рецензію</button>
        `;
        
        // Рецензії вкладка
        const reviewsTab = document.createElement('div');
        reviewsTab.id = 'reviews-tab';
        reviewsTab.className = 'modal-tab-content';
        reviewsTab.style.display = 'none';
        reviewsTab.innerHTML = `
          <h4>Все рецензії</h4>
          <div id="reviewsList" style="max-height:300px; overflow-y:auto;">
            ${typeof renderReviews === 'function' ? renderReviews(bookId) : '<p>Загружение...</p>'}
          </div>
        `;
        
        modalBody.appendChild(ratingTab);
        modalBody.appendChild(reviewsTab);
        
        // Добавляем обработчик для звезд рейтинга
        document.querySelectorAll('.star-btn').forEach(star => {
          star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            if (typeof addRating === 'function') {
              addRating(bookId, rating);
              
              // Обновляем визуально
              document.querySelectorAll('.star-btn').forEach((s, idx) => {
                s.style.color = (idx + 1) <= rating ? '#ffc107' : '#ddd';
              });
              
              // Обновляем текст
              const ratingText = document.querySelector('.modal-tab-content strong');
              if (ratingText) ratingText.textContent = rating + '/5';
            }
          });
        });
        
        // Повесить обработчик отправки рецензии
        const submitBtn = document.getElementById('submitReview');
        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            const text = document.getElementById('reviewText').value.trim();
            const rating = book.rating || 3;
            
            if (!text) {
              alert('Введите текст рецензии');
              return;
            }
            
            if (typeof addReview === 'function') {
              addReview(bookId, text, rating);
              document.getElementById('reviewText').value = '';
              
              // Обновляем список рецензій
              const reviewsList = document.getElementById('reviewsList');
              if (reviewsList && typeof renderReviews === 'function') {
                reviewsList.innerHTML = renderReviews(bookId);
              }
              
              alert('Рецензія добавлена!');
            }
          });
        }
        
        // Добавляем обработчик для кликов по вкладкам
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
            if (targetTab) {
              targetTab.classList.add('active');
              targetTab.style.display = 'block';
            }
          });
        });
      }
    }, 100);
  };
  
  // Добавляем вкладку целей в аналитику
  const originalRenderAnalytics = window.renderAnalytics;
  
  window.renderAnalytics = function() {
    originalRenderAnalytics();
    
    setTimeout(() => {
      const analytics = document.getElementById('analytics');
      if (analytics && !analytics.querySelector('#goalsSection')) {
        const goalsSection = document.createElement('div');
        goalsSection.id = 'goalsSection';
        goalsSection.innerHTML = `
          <div style="margin-top: 30px; background: rgba(255, 255, 255, 0.4); padding: 20px; border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);">
            <h3>🎯 Цели читания</h3>
            <div id="goalsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
              ${typeof renderGoals === 'function' ? renderGoals() : '<p>Нет целей</p>'}
            </div>
            <div style="margin-top: 20px;">
              <h4>Добавить новую цель</h4>
              <div style="display: grid; gap: 10px;">
                <input id="goalTitle" placeholder="Название цели (например, 'Прочитать 10 книг в 2025')" style="padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                <input id="goalBooks" type="number" placeholder="Количество книг" min="1" style="padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                <input id="goalPages" type="number" placeholder="Количество страниц" min="1" style="padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
                <button id="addGoalBtn" style="padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">Добавить цель</button>
              </div>
            </div>
          </div>
        `;
        
        analytics.appendChild(goalsSection);
        
        // Обработчик для кнопки добавления цели
        document.getElementById('addGoalBtn').addEventListener('click', () => {
          const title = document.getElementById('goalTitle').value.trim();
          const books = parseInt(document.getElementById('goalBooks').value) || 0;
          const pages = parseInt(document.getElementById('goalPages').value) || 0;
          
          if (!title || books < 1 || pages < 1) {
            alert('Заполните все поля корректно');
            return;
          }
          
          if (typeof addGoal === 'function') {
            addGoal(title, books, pages);
            
            // Очищаем и обновляем
            document.getElementById('goalTitle').value = '';
            document.getElementById('goalBooks').value = '';
            document.getElementById('goalPages').value = '';
            
            const goalsContainer = document.getElementById('goalsContainer');
            if (goalsContainer && typeof renderGoals === 'function') {
              goalsContainer.innerHTML = renderGoals();
              
              // Добавляем обработчики для кнопок удаления
              document.querySelectorAll('.delete-goal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                  const goalId = e.target.dataset.goalId;
                  if (typeof deleteGoal === 'function') {
                    deleteGoal(goalId);
                    renderAnalytics();
                  }
                });
              });
            }
          }
        });
        
        // Добавляем обработчик для удаления целей
        document.querySelectorAll('.delete-goal').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const goalId = e.target.dataset.goalId;
            if (typeof deleteGoal === 'function') {
              deleteGoal(goalId);
              const goalsContainer = document.getElementById('goalsContainer');
              if (goalsContainer && typeof renderGoals === 'function') {
                goalsContainer.innerHTML = renderGoals();
              }
            }
          });
        });
      }
    }, 100);
  };
}

// Запускаем инициализацию после готовности DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtendedFeatures);
} else {
  initializeExtendedFeatures();
}
