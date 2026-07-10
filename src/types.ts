/**
 * ApnaArea - Shared TypeScript Types
 */

export enum PlatformRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum NeighborhoodRole {
  RESIDENT = 'RESIDENT',
  MODERATOR = 'MODERATOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: PlatformRole;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  description: string;
  pincode: string;
  createdAt: string;
  memberCount?: number;
}

export interface Membership {
  id: string;
  userId: string;
  neighborhoodId: string;
  role: NeighborhoodRole;
  createdAt: string;
}

export interface Post {
  id: string;
  neighborhoodId: string;
  userId: string;
  authorName: string;
  authorPhone: string;
  authorAvatar?: string;
  text: string;
  image?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  reportsCount: number;
  isHidden: boolean;
  likedBy?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorPhone: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  likesCount: number;
  reportsCount: number;
  isHidden: boolean;
}

export interface Like {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'POST' | 'COMMENT';
}

export interface Listing {
  id: string;
  neighborhoodId: string;
  userId: string;
  authorName: string;
  authorPhone: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  status: 'ACTIVE' | 'SOLD';
  createdAt: string;
}

export interface Event {
  id: string;
  neighborhoodId: string;
  userId: string;
  authorName: string;
  title: string;
  description: string;
  dateTime: string;
  venue: string;
  createdAt: string;
  rsvpCount?: number;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  response: 'GOING' | 'NOT_GOING';
}

export interface Notification {
  id: string;
  recipientId: string;
  actorName: string;
  type: 'LIKE_POST' | 'COMMENT_POST' | 'LIKE_COMMENT' | 'WELCOME' | 'PROMOTED_MODERATOR' | 'FOLLOW' | 'NEW_MESSAGE';
  targetId: string;
  targetTitle: string; // Preview text or title of the target
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'POST' | 'COMMENT';
  targetText: string; // Preserved snippet to show in admin dashboard
  reason: 'Spam' | 'Abusive or harassing' | 'Misinformation' | 'Inappropriate content' | 'Other';
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  initiatorId: string;
  recipientId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
