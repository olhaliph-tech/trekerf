// Инициализация расширенного профиля

function initializeProfileFeatures() {
  const originalRenderProfile = window.renderProfile;
  
  window.renderProfile = function() {
    if (!state.user) return;
    
    const user = state.user;
    const readBooks = state.books.filter((b) => b.status === 'прочитано').length;
    const totalPages = state.books.reduce((sum, b) => sum + (b.finishedPage || 0), 0);
    const avgRating = state.books.filter(b => b.rating).length > 0 
      ? (state.books.reduce((sum, b) => sum + (b.rating || 0), 0) / state.books.filter(b => b.rating).length).toFixed(1)
      : '0';
    
    dom.profileInfo.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div style="text-align:center;">
          <div style="position:relative; display:inline-block;">
            <img src="${user.avatar}" alt="avatar" style="width:120px;height:120px;border-radius:50%;margin-bottom:12px;object-fit:cover;border:4px solid var(--color-primary);" />
            <button id="changeAvatarBtn" class="avatar-edit-btn" style="position:absolute; bottom:0; right:0; width:35px; height:35px; border-radius:50%; background:var(--color-primary); color:white; border:none; cursor:pointer; font-size:1.2rem;">🖼️</button>
          </div>
          <h3>${user.name} <span style="font-size:0.9rem; color:#999;">@${user.nickname}</span></h3>
          <p style="color:#666; font-style:italic;">${user.bio}</p>
          
          <div style="display:flex; gap:15px; justify-content:center; margin:15px 0; padding:15px 0; border-top:1px solid #ddd; border-bottom:1px solid #ddd;">
            <div style="text-align:center;">
              <p style="font-size:1.5rem; font-weight:bold; color:var(--color-primary);">${user.following?.length || 0}</p>
              <small>Подписок</small>
            </div>
            <div style="text-align:center;">
              <p style="font-size:1.5rem; font-weight:bold; color:var(--color-primary);">${user.followers?.length || 0}</p>
              <small>Подписчиков</small>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style="color:#6b4a52;">📊 Ваша статистика</h4>
          <div style="display:grid; gap:10px;">
            <div style="background:rgba(235,213,230,0.3); padding:10px; border-radius:8px;">
              <small style="color:#999;">📚 Прочитано</small>
              <p style="font-size:1.5rem; font-weight:bold; margin:5px 0;">${readBooks}</p>
            </div>
            <div style="background:rgba(235,213,230,0.3); padding:10px; border-radius:8px;">
              <small style="color:#999;">📄 Сторінок</small>
              <p style="font-size:1.5rem; font-weight:bold; margin:5px 0;">${totalPages}</p>
            </div>
            <div style="background:rgba(235,213,230,0.3); padding:10px; border-radius:8px;">
              <small style="color:#999;">⭐ Середня оцінка</small>
              <p style="font-size:1.5rem; font-weight:bold; margin:5px 0;">${avgRating}${avgRating !== '0' ? '/5' : ''}</p>
            </div>
            <div style="background:rgba(235,213,230,0.3); padding:10px; border-radius:8px;">
              <small style="color:#999;">📈 Всього у ЛС</small>
              <p style="font-size:1.5rem; font-weight:bold; margin:5px 0;">${state.books.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <button id="editProfileBtn" style="flex:1; padding:12px 16px; background:linear-gradient(135deg, #e6a0b4 0%, #e68aa3 100%); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">✏️ Редагувати профіль</button>
        <button id="logoutBtn" style="flex:1; padding:12px 16px; background:#ef4444; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">🚪 Вийти</button>
      </div>
      
      <form id="editProfileForm" style="display:none; gap:15px; max-width:400px; background:rgba(255,255,255,0.5); padding:20px; border-radius:10px; margin-bottom:20px; flex-direction:column;">
        <h4>Редагування профілю</h4>
        <label style="display:flex; flex-direction:column;">Ім'я:
          <input type="text" id="editName" value="${user.name}" style="margin-top:5px; padding:10px; border-radius:5px; border:1px solid #ccc;">
        </label>
        <label style="display:flex; flex-direction:column;">Нікнейм:
          <input type="text" id="editNickname" value="${user.nickname}" style="margin-top:5px; padding:10px; border-radius:5px; border:1px solid #ccc;">
        </label>
        <label style="display:flex; flex-direction:column;">Біографія:
          <textarea id="editBio" style="margin-top:5px; padding:10px; border-radius:5px; border:1px solid #ccc; height:80px;">${user.bio}</textarea>
        </label>
        <label style="display:flex; flex-direction:column;">URL Аватарки:
          <input type="text" id="editAvatar" value="${user.avatar}" style="margin-top:5px; padding:10px; border-radius:5px; border:1px solid #ccc;">
          <small style="color:#999; margin-top:5px;">Вставьте ссылку на изображение (JPEG, PNG, GIF)</small>
        </label>
        <button type="submit" style="padding:12px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">💾 Зберегти зміни</button>
        <button type="button" id="cancelEditBtn" style="padding:10px; background:#999; color:white; border:none; border-radius:5px; cursor:pointer;">❌ Скасувати</button>
      </form>
      
      <div id="profileAchievements" style="margin-top:30px; background: rgba(255, 255, 255, 0.4); padding: 20px; border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);">
        <h4 style="color:#6b4a52;">🏆 Ваши досягнення</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:15px; margin-top:15px;">
          ${typeof renderAchievements === 'function' ? renderAchievements() : '<p>Загружение...</p>'}
        </div>
      </div>
    `;
    
    // Обработчик для редактирования профиля
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      const form = document.getElementById('editProfileForm');
      form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    });
    
    // Обработчик отмены
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      document.getElementById('editProfileForm').style.display = 'none';
    });
    
    // Обработчик отправки формы
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
    });
    
    // Обработчик смены аватара
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
      const newAvatar = prompt('Вставьте URL нового аватара:', user.avatar);
      if (newAvatar) {
        user.avatar = newAvatar.trim();
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = user;
          saveUsers(users);
        }
        saveState();
        renderProfile();
      }
    });
    
    // Обработчик выхода
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem(AUTH_KEY);
        location.reload();
      }
    });
  };
}

// Запускаем при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfileFeatures);
} else {
  initializeProfileFeatures();
}
