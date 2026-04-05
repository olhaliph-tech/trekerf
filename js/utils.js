// Допоміжні функції
const newId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatDate = (d) => new Date(d).toLocaleDateString('uk-UA');

const getFolderName = (folderId) => {
  const f = state.folders.find(x => x.id === folderId);
  return f ? f.name : 'Без папки';
};

const getBookById = (bookId) => state.books.find(b => b.id === bookId);

const getActivityById = (activityId) => state.activity.find(a => a.id === activityId);

const getSessionsByBook = (bookId) => 
  state.sessions.filter(s => s.bookId === bookId).sort((a, b) => new Date(b.date) - new Date(a.date));

const getReactionsByPost = (postId) => state.reactions.filter(r => r.postId === postId);

const getCommentsByPost = (postId) => state.comments.filter(c => c.postId === postId);

const getUserReaction = (postId, userId) => {
  const reactions = getReactionsByPost(postId);
  return reactions.find(r => r.userId === userId);
};
