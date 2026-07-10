import { 
  User, 
  Neighborhood, 
  Membership, 
  Post, 
  Comment, 
  Listing, 
  Event, 
  EventRsvp, 
  Notification, 
  Report,
  PlatformRole,
  NeighborhoodRole,
  Follow,
  Block,
  Conversation,
  Message
} from '../types';
import { 
  SEED_USERS, 
  SEED_NEIGHBORHOODS, 
  SEED_MEMBERSHIPS, 
  SEED_POSTS, 
  SEED_COMMENTS, 
  SEED_LISTINGS, 
  SEED_EVENTS, 
  SEED_RSVPS, 
  SEED_NOTIFICATIONS, 
  SEED_REPORTS 
} from './mockData';

const KEYS = {
  USERS: 'apnaarea_users',
  NEIGHBORHOODS: 'apnaarea_neighborhoods',
  MEMBERSHIPS: 'apnaarea_memberships',
  POSTS: 'apnaarea_posts',
  COMMENTS: 'apnaarea_comments',
  LISTINGS: 'apnaarea_listings',
  EVENTS: 'apnaarea_events',
  RSVPS: 'apnaarea_rsvps',
  NOTIFICATIONS: 'apnaarea_notifications',
  REPORTS: 'apnaarea_reports',
  CURRENT_USER_ID: 'apnaarea_current_user_id',
  ACTIVE_NEIGHBORHOOD_ID: 'apnaarea_active_nb_id',
  FOLLOWS: 'apnaarea_follows',
  BLOCKS: 'apnaarea_blocks',
  CONVERSATIONS: 'apnaarea_conversations',
  MESSAGES: 'apnaarea_messages'
};

// Initialize localStorage if empty
export function initializeStore() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(SEED_NEIGHBORHOODS));
    localStorage.setItem(KEYS.MEMBERSHIPS, JSON.stringify(SEED_MEMBERSHIPS));
    localStorage.setItem(KEYS.POSTS, JSON.stringify(SEED_POSTS));
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(SEED_COMMENTS));
    localStorage.setItem(KEYS.LISTINGS, JSON.stringify(SEED_LISTINGS));
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(SEED_RSVPS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    localStorage.setItem(KEYS.FOLLOWS, JSON.stringify([]));
    localStorage.setItem(KEYS.BLOCKS, JSON.stringify([]));
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
    
    // Set default logged in user as Shivanshu
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'user-shivanshu');
    // Set default active neighborhood as Miraloma Park
    localStorage.setItem(KEYS.ACTIVE_NEIGHBORHOOD_ID, 'nb-miraloma');
  } else {
    // Migration: Update existing Dianne Russell to Dinesh Rajput in localStorage
    const existingUsersRaw = localStorage.getItem(KEYS.USERS);
    if (existingUsersRaw && existingUsersRaw.includes('Dianne Russell')) {
      try {
        let updatedUsers = JSON.parse(existingUsersRaw);
        updatedUsers = updatedUsers.map((u: any) => {
          if (u.name === 'Dianne Russell') {
            u.name = 'Dinesh Rajput';
            u.email = 'dinesh.r@example.com';
          }
          return u;
        });
        localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
      } catch (e) {}

      const existingPostsRaw = localStorage.getItem(KEYS.POSTS);
      if (existingPostsRaw && existingPostsRaw.includes('Dianne Russell')) {
        try {
          let updatedPosts = JSON.parse(existingPostsRaw);
          updatedPosts = updatedPosts.map((p: any) => {
            if (p.authorName === 'Dianne Russell') {
              p.authorName = 'Dinesh Rajput';
            }
            return p;
          });
          localStorage.setItem(KEYS.POSTS, JSON.stringify(updatedPosts));
        } catch (e) {}
      }

      const existingListingsRaw = localStorage.getItem(KEYS.LISTINGS);
      if (existingListingsRaw && existingListingsRaw.includes('Dianne Russell')) {
        try {
          let updatedListings = JSON.parse(existingListingsRaw);
          updatedListings = updatedListings.map((l: any) => {
            if (l.authorName === 'Dianne Russell') {
              l.authorName = 'Dinesh Rajput';
            }
            return l;
          });
          localStorage.setItem(KEYS.LISTINGS, JSON.stringify(updatedListings));
        } catch (e) {}
      }

      const existingReportsRaw = localStorage.getItem(KEYS.REPORTS);
      if (existingReportsRaw && existingReportsRaw.includes('Dianne Russell')) {
        try {
          let updatedReports = JSON.parse(existingReportsRaw);
          updatedReports = updatedReports.map((r: any) => {
            if (r.reporterName === 'Dianne Russell') {
              r.reporterName = 'Dinesh Rajput';
            }
            return r;
          });
          localStorage.setItem(KEYS.REPORTS, JSON.stringify(updatedReports));
        } catch (e) {}
      }
    }

    // Migration: Update list-1 image to the new local image path if stored
    const existingListingsRaw = localStorage.getItem(KEYS.LISTINGS);
    if (existingListingsRaw) {
      try {
        let updatedListings = JSON.parse(existingListingsRaw);
        let updated = false;
        updatedListings = updatedListings.map((l: any) => {
          if (l.id === 'list-1' && l.image !== 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=600') {
            l.image = 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=600';
            updated = true;
          }
          return l;
        });
        if (updated) {
          localStorage.setItem(KEYS.LISTINGS, JSON.stringify(updatedListings));
        }
      } catch (e) {}
    }

    // Migration: Update Shivanshu's avatar URL to the new regenerated image
    const usersForAvatarRaw = localStorage.getItem(KEYS.USERS);
    if (usersForAvatarRaw) {
      try {
        let updatedUsers = JSON.parse(usersForAvatarRaw);
        let updated = false;
        updatedUsers = updatedUsers.map((u: any) => {
          if (u.id === 'user-shivanshu' && u.avatarUrl !== 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200') {
            u.avatarUrl = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200';
            updated = true;
          }
          return u;
        });
        if (updated) {
          localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
        }
      } catch (e) {}
    }
  }
}

// Low-level Getters & Setters
export function getData<T>(key: string, fallback: T[]): T[] {
  initializeStore();
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T[];
  } catch (e) {
    return fallback;
  }
}

export function saveData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// User methods
export function getUsers(): User[] {
  return getData<User>(KEYS.USERS, SEED_USERS);
}

export function saveUsers(users: User[]): void {
  saveData(KEYS.USERS, users);
}

export function getCurrentUser(): User {
  initializeStore();
  const userId = localStorage.getItem(KEYS.CURRENT_USER_ID) || 'user-shivanshu';
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  return user || users[0];
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  
  // Set appropriate active neighborhood if member, otherwise stay or join
  const memberships = getMemberships();
  const userMembership = memberships.find(m => m.userId === userId);
  if (userMembership) {
    localStorage.setItem(KEYS.ACTIVE_NEIGHBORHOOD_ID, userMembership.neighborhoodId);
  }
}

// Neighborhood methods
export function getNeighborhoods(): Neighborhood[] {
  return getData<Neighborhood>(KEYS.NEIGHBORHOODS, SEED_NEIGHBORHOODS);
}

export function saveNeighborhoods(nbs: Neighborhood[]): void {
  saveData(KEYS.NEIGHBORHOODS, nbs);
}

export function getActiveNeighborhood(): Neighborhood {
  initializeStore();
  const nbs = getNeighborhoods();
  const activeId = localStorage.getItem(KEYS.ACTIVE_NEIGHBORHOOD_ID);
  const found = nbs.find(n => n.id === activeId);
  return found || nbs[0] || { id: 'empty', name: 'No Neighborhood', description: '', pincode: '', createdAt: '' };
}

export function setActiveNeighborhoodId(id: string): void {
  localStorage.setItem(KEYS.ACTIVE_NEIGHBORHOOD_ID, id);
}

// Membership methods
export function getMemberships(): Membership[] {
  return getData<Membership>(KEYS.MEMBERSHIPS, SEED_MEMBERSHIPS);
}

export function saveMemberships(memberships: Membership[]): void {
  saveData(KEYS.MEMBERSHIPS, memberships);
}

export function getUserRoleInNeighborhood(userId: string, neighborhoodId: string): NeighborhoodRole | null {
  const memberships = getMemberships();
  const m = memberships.find(mem => mem.userId === userId && mem.neighborhoodId === neighborhoodId);
  return m ? m.role : null;
}

// Post methods
export function getPosts(): Post[] {
  return getData<Post>(KEYS.POSTS, SEED_POSTS);
}

export function savePosts(posts: Post[]): void {
  saveData(KEYS.POSTS, posts);
}

// Comment methods
export function getComments(): Comment[] {
  return getData<Comment>(KEYS.COMMENTS, SEED_COMMENTS);
}

export function saveComments(comments: Comment[]): void {
  saveData(KEYS.COMMENTS, comments);
}

// Listing methods
export function getListings(): Listing[] {
  return getData<Listing>(KEYS.LISTINGS, SEED_LISTINGS);
}

export function saveListings(listings: Listing[]): void {
  saveData(KEYS.LISTINGS, listings);
}

// Event methods
export function getEvents(): Event[] {
  return getData<Event>(KEYS.EVENTS, SEED_EVENTS);
}

export function saveEvents(events: Event[]): void {
  saveData(KEYS.EVENTS, events);
}

// RSVP methods
export function getRSVPs(): EventRsvp[] {
  return getData<EventRsvp>(KEYS.RSVPS, SEED_RSVPS);
}

export function saveRSVPs(rsvps: EventRsvp[]): void {
  saveData(KEYS.RSVPS, rsvps);
}

// Notification methods
export function getNotifications(): Notification[] {
  return getData<Notification>(KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
}

export function saveNotifications(notifications: Notification[]): void {
  saveData(KEYS.NOTIFICATIONS, notifications);
}

// Report methods
export function getReports(): Report[] {
  return getData<Report>(KEYS.REPORTS, SEED_REPORTS);
}

export function saveReports(reports: Report[]): void {
  saveData(KEYS.REPORTS, reports);
}

// Business Logic Helper: Report a piece of content
export function addReport(
  reporterId: string,
  reporterName: string,
  targetId: string,
  targetType: 'POST' | 'COMMENT',
  targetText: string,
  reason: Report['reason']
): { autoHidden: boolean } {
  const reports = getReports();
  
  // Check if this reporter has already reported this target to prevent duplicate spamming
  const alreadyReported = reports.some(r => r.reporterId === reporterId && r.targetId === targetId);
  if (alreadyReported) {
    return { autoHidden: false };
  }

  const newReport: Report = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    reporterId,
    reporterName,
    targetId,
    targetType,
    targetText: targetText.length > 50 ? targetText.substring(0, 47) + '...' : targetText,
    reason,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  reports.push(newReport);
  saveReports(reports);

  // Count pending reports on this target
  const activeReportsCount = reports.filter(r => r.targetId === targetId && r.status === 'PENDING').length;
  let autoHidden = false;

  // Update target report count & auto-hide if threshold (5) is reached
  const threshold = 5;

  if (targetType === 'POST') {
    const posts = getPosts();
    const postIdx = posts.findIndex(p => p.id === targetId);
    if (postIdx !== -1) {
      posts[postIdx].reportsCount = activeReportsCount;
      if (activeReportsCount >= threshold) {
        posts[postIdx].isHidden = true;
        autoHidden = true;
      }
      savePosts(posts);
    }
  } else {
    const comments = getComments();
    const commentIdx = comments.findIndex(c => c.id === targetId);
    if (commentIdx !== -1) {
      comments[commentIdx].reportsCount = activeReportsCount;
      if (activeReportsCount >= threshold) {
        comments[commentIdx].isHidden = true;
        autoHidden = true;
      }
      saveComments(comments);
    }
  }

  return { autoHidden };
}

// Trigger in-app notification helper
export function triggerNotification(
  recipientId: string,
  actorName: string,
  type: Notification['type'],
  targetId: string,
  targetTitle: string
): void {
  if (recipientId === 'system' || !recipientId) return; // Ignore system
  const notifications = getNotifications();
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    recipientId,
    actorName,
    type,
    targetId,
    targetTitle,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  saveNotifications(notifications);
}

// Social Follow, Block, Conversation, Message store methods
export function getFollows(): Follow[] {
  return getData<Follow>(KEYS.FOLLOWS, []);
}

export function saveFollows(follows: Follow[]): void {
  saveData(KEYS.FOLLOWS, follows);
}

export function getBlocks(): Block[] {
  return getData<Block>(KEYS.BLOCKS, []);
}

export function saveBlocks(blocks: Block[]): void {
  saveData(KEYS.BLOCKS, blocks);
}

export function getConversations(): Conversation[] {
  return getData<Conversation>(KEYS.CONVERSATIONS, []);
}

export function saveConversations(conversations: Conversation[]): void {
  saveData(KEYS.CONVERSATIONS, conversations);
}

export function getMessages(): Message[] {
  return getData<Message>(KEYS.MESSAGES, []);
}

export function saveMessages(messages: Message[]): void {
  saveData(KEYS.MESSAGES, messages);
}

// Business Rules check functions
export function isUserBlocked(userAId: string, userBId: string): boolean {
  const blocks = getBlocks();
  return blocks.some(
    b => (b.blockerId === userAId && b.blockedId === userBId) || 
         (b.blockerId === userBId && b.blockedId === userAId)
  );
}

export function isBlockerOf(blockerId: string, blockedId: string): boolean {
  const blocks = getBlocks();
  return blocks.some(b => b.blockerId === blockerId && b.blockedId === blockedId);
}

// Social follow action toggle (returns updated follow state)
export function toggleFollowUser(followerId: string, followingId: string): boolean {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself");
  }
  if (isUserBlocked(followerId, followingId)) {
    throw new Error("Cannot follow a blocked user or blocker");
  }

  const follows = getFollows();
  const idx = follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
  let isFollowingNow = false;

  if (idx !== -1) {
    follows.splice(idx, 1);
  } else {
    const newFollow: Follow = {
      id: `fol-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };
    follows.push(newFollow);
    isFollowingNow = true;

    // Notify the user they followed
    const users = getUsers();
    const follower = users.find(u => u.id === followerId);
    if (follower) {
      triggerNotification(followingId, follower.name, 'FOLLOW', followerId, 'started following you');
    }
  }

  saveFollows(follows);
  return isFollowingNow;
}

// Block / Unblock action
export function toggleBlockUser(blockerId: string, blockedId: string): boolean {
  if (blockerId === blockedId) {
    throw new Error("You cannot block yourself");
  }

  const blocks = getBlocks();
  const idx = blocks.findIndex(b => b.blockerId === blockerId && b.blockedId === blockedId);
  let isBlockedNow = false;

  if (idx !== -1) {
    // Unblock
    blocks.splice(idx, 1);
  } else {
    // Block
    const newBlock: Block = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      blockerId,
      blockedId,
      createdAt: new Date().toISOString()
    };
    blocks.push(newBlock);
    isBlockedNow = true;

    // Apply auto-unfollow business rule in both directions
    let follows = getFollows();
    follows = follows.filter(
      f => !(f.followerId === blockerId && f.followingId === blockedId) &&
           !(f.followerId === blockedId && f.followingId === blockerId)
    );
    saveFollows(follows);
  }

  saveBlocks(blocks);
  return isBlockedNow;
}

// Conversation getter/creator
export function getOrCreateConversation(initiatorId: string, recipientId: string): Conversation {
  if (isUserBlocked(initiatorId, recipientId)) {
    throw new Error("Cannot message. A block exists between you and this user.");
  }

  const conversations = getConversations();
  let found = conversations.find(
    c => (c.initiatorId === initiatorId && c.recipientId === recipientId) ||
         (c.initiatorId === recipientId && c.recipientId === initiatorId)
  );

  if (!found) {
    found = {
      id: `con-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      initiatorId,
      recipientId,
      createdAt: new Date().toISOString()
    };
    conversations.push(found);
    saveConversations(conversations);
  }

  return found;
}

// Sending a message (raises error if frozen due to blocking)
export function addDirectMessage(conversationId: string, senderId: string, content: string): Message {
  const conversations = getConversations();
  const convo = conversations.find(c => c.id === conversationId);
  if (!convo) {
    throw new Error("Conversation not found");
  }

  // Check if blocked (convo between A and B frozen)
  if (isUserBlocked(convo.initiatorId, convo.recipientId)) {
    throw new Error("This conversation is frozen because a user is blocked.");
  }

  const messages = getMessages();
  const newMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    conversationId,
    senderId,
    content,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  messages.push(newMessage);
  saveMessages(messages);

  // Trigger notification for recipient
  const recipientId = convo.initiatorId === senderId ? convo.recipientId : convo.initiatorId;
  const users = getUsers();
  const sender = users.find(u => u.id === senderId);
  if (sender) {
    triggerNotification(
      recipientId,
      sender.name,
      'NEW_MESSAGE',
      conversationId,
      content.length > 30 ? content.substring(0, 27) + '...' : content
    );
  }

  return newMessage;
}

export function updateUserProfile(
  userId: string, 
  name: string, 
  avatarUrl: string, 
  bio: string
): User {
  const users = getUsers();
  let updatedUser: User | null = null;
  const updatedUsers = users.map(u => {
    if (u.id === userId) {
      updatedUser = {
        ...u,
        name,
        avatarUrl,
        bio
      };
      return updatedUser;
    }
    return u;
  });
  
  if (!updatedUser) {
    throw new Error('User not found');
  }
  
  saveUsers(updatedUsers);

  // Sync post authors
  const posts = getPosts();
  let postsChanged = false;
  const updatedPosts = posts.map(p => {
    if (p.userId === userId) {
      postsChanged = true;
      return {
        ...p,
        authorName: name,
        authorAvatar: avatarUrl
      };
    }
    return p;
  });
  if (postsChanged) {
    savePosts(updatedPosts);
  }

  // Sync comment authors
  const comments = getComments();
  let commentsChanged = false;
  const updatedComments = comments.map(c => {
    if (c.userId === userId) {
      commentsChanged = true;
      return {
        ...c,
        authorName: name,
        authorAvatar: avatarUrl
      };
    }
    return c;
  });
  if (commentsChanged) {
    saveComments(updatedComments);
  }

  // Sync listings authors
  const listings = getListings();
  let listingsChanged = false;
  const updatedListings = listings.map(l => {
    if (l.userId === userId) {
      listingsChanged = true;
      return {
        ...l,
        authorName: name
      };
    }
    return l;
  });
  if (listingsChanged) {
    saveListings(updatedListings);
  }

  // Sync event authors
  const events = getEvents();
  let eventsChanged = false;
  const updatedEvents = events.map(e => {
    if (e.userId === userId) {
      eventsChanged = true;
      return {
        ...e,
        authorName: name
      };
    }
    return e;
  });
  if (eventsChanged) {
    saveEvents(updatedEvents);
  }

  // Sync report authors
  const reports = getReports();
  let reportsChanged = false;
  const updatedReports = reports.map(r => {
    if (r.reporterId === userId) {
      reportsChanged = true;
      return {
        ...r,
        reporterName: name
      };
    }
    return r;
  });
  if (reportsChanged) {
    saveReports(updatedReports);
  }

  return updatedUser;
}

export function deletePost(postId: string): void {
  const posts = getPosts().filter(p => p.id !== postId);
  savePosts(posts);
}

export function deleteListing(listingId: string): void {
  const listings = getListings().filter(l => l.id !== listingId);
  saveListings(listings);
}


