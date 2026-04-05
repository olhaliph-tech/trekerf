// Функції для спільноти (реакції та коментарі)
const createActivityRecord = (type, text, bookId = '') => {
  const item = {
    id: typeof newId === 'function' ? newId('activity') : 'act_' + Date.now(),
    userId: state.user?.id || 'unknown',
    type,
    text,
    date: new Date().toISOString(),
    bookId
  };
  if (!state.activity) state.activity = [];
  state.activity.unshift(item);
  saveStateToStorage();
  return item;
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
  
  saveStateToStorage();
  return state.reactions;
};

const addComment = (postId, text) => {
  if (!text.trim()) return null;
  
  const comment = {
    id: newId('comment'),
    userId: state.user.id,
    postId,
    text,
    createdAt: new Date().toISOString()
  };
  
  state.comments.push(comment);
  saveStateToStorage();
  return comment;
};

const getReactionCounts = (postId) => {
  const reactions = getReactionsByPost(postId);
  const counts = {};
  
  reactions.forEach(r => {
    counts[r.type] = (counts[r.type] || 0) + 1;
  });
  
  return counts;
};

const getGlobalCommunityData = () => {
  const users = JSON.parse(localStorage.getItem('readingTrackerUsers') || '[]');
  let activities = [];
  let reactions = [];
  let comments = [];

  users.forEach(u => {
    const uDataStr = localStorage.getItem(`readingTrackerData_${u.id}`);
    if (uDataStr) {
      try {
        const data = JSON.parse(uDataStr);
        if (data.activity) activities.push(...data.activity.map(a => ({...a, userObj: u})));
        if (data.reactions) reactions.push(...data.reactions);
        if (data.comments) comments.push(...data.comments.map(c => ({...c, userObj: u})));
      } catch (e) {}
    }
  });

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { activities, reactions, comments, users };
};

const getActivityFeed = (limit = 50, filterUserId = null) => {
  const { activities, reactions, comments } = getGlobalCommunityData();
  
  let filtered = activities;
  if (filterUserId) {
    filtered = activities.filter(a => a.userId === filterUserId);
  }

  return filtered.slice(0, limit).map(item => {
    const itemReactions = reactions.filter(r => r.postId === item.id);
    const itemComments = comments.filter(c => c.postId === item.id);
    const userReaction = itemReactions.find(r => r.userId === state.user.id);
    
    const reactionCounts = {};
    itemReactions.forEach(r => {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    });
    
    return {
      ...item,
      reactions: itemReactions,
      comments: itemComments,
      userReaction,
      reactionCounts
    };
  });
};
