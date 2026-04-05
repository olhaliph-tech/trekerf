// Глобальний стан додатку
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

const statuses = ['бажаю прочитати', 'читаю', 'прочитано', 'закинуто'];

let state = {
  user: {...defaultUser},
  books: [],
  sessions: [],
  folders: [...defaultFolders],
  comments: [],
  reactions: [],
  activity: []
};

const getState = () => state;

const updateState = (updates) => {
  state = {...state, ...updates};
};
