import React, { useState } from 'react';
import { 
  X, 
  Grid, 
  ShoppingBag, 
  Heart, 
  MessageSquare, 
  Trash2, 
  Eye, 
  Check, 
  UserPlus, 
  UserMinus,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Neighborhood, Post, Listing, NeighborhoodRole } from '../types';
import { 
  getUsers,
  getPosts, 
  deletePost, 
  getListings, 
  deleteListing, 
  getFollows, 
  toggleFollowUser,
  getOrCreateConversation,
  getUserRoleInNeighborhood
} from '../data/store';

interface UserProfileModalProps {
  userId: string;
  currentUser: User;
  activeNeighborhood: Neighborhood;
  onClose: () => void;
  onRefresh: () => void;
  setActiveTab?: (tab: string) => void;
}

export default function UserProfileModal({
  userId,
  currentUser,
  activeNeighborhood,
  onClose,
  onRefresh,
  setActiveTab
}: UserProfileModalProps) {
  const isSelf = userId === currentUser.id;
  const users = getUsers();
  const profileUser = users.find(u => u.id === userId) || currentUser;

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'marketplace'>('posts');
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; type: 'post' | 'listing' } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch metrics and content
  const allPosts = getPosts().filter(p => !p.isHidden);
  const userPosts = allPosts.filter(p => p.userId === userId && p.neighborhoodId === activeNeighborhood.id);
  
  const allListings = getListings();
  const userListings = allListings.filter(l => l.userId === userId && l.neighborhoodId === activeNeighborhood.id);

  const follows = getFollows();
  const followersCount = follows.filter(f => f.followingId === userId).length;
  const followingCount = follows.filter(f => f.followerId === userId).length;
  const isFollowing = follows.some(f => f.followerId === currentUser.id && f.followingId === userId);

  // Engagement calculations (Instagram-style insights)
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = userPosts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const avgEngagement = userPosts.length > 0 
    ? ((totalLikes + totalComments) / userPosts.length).toFixed(1) 
    : '0';

  const handleFollowToggle = () => {
    try {
      toggleFollowUser(currentUser.id, userId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error updating follow status');
    }
  };

  const handleMessageUser = () => {
    try {
      const convo = getOrCreateConversation(currentUser.id, userId);
      localStorage.setItem('apnaarea_active_convo_id', convo.id);
      if (setActiveTab) {
        setActiveTab('messages');
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error starting message');
    }
  };

  const handleDeleteItem = () => {
    if (!deleteConfirmId) return;

    if (deleteConfirmId.type === 'post') {
      deletePost(deleteConfirmId.id);
      setSuccessMsg('Post deleted successfully!');
    } else {
      deleteListing(deleteConfirmId.id);
      setSuccessMsg('Listing deleted successfully!');
    }

    setDeleteConfirmId(null);
    onRefresh();
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 2500);
  };

  // Mock engagement view multiplier based on timestamp
  const getMockViews = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (sum % 45) + 12;
  };

  const getEngagementRating = (likes: number, comments: number) => {
    const score = likes + comments * 2;
    if (score >= 15) return { text: 'VIRAL 🔥', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (score >= 8) return { text: 'HIGH ENGAGEMENT ⚡', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    if (score >= 3) return { text: 'STEADY 📈', color: 'text-violet-600 bg-violet-50 border-violet-100' };
    return { text: 'STANDBY ⏳', color: 'text-slate-500 bg-slate-50 border-slate-100' };
  };

  const isUserMod = getUserRoleInNeighborhood(userId, activeNeighborhood.id) === NeighborhoodRole.MODERATOR;

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans" id="instagram-profile-modal">
      <div className="bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] max-w-2xl w-full h-[85vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1A1A1A] hover:bg-[#FAF9F6] p-1.5 border border-transparent hover:border-[#1A1A1A] transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Modal Header / Banner */}
        <div className="bg-[#FAF9F6] border-b border-[#1A1A1A] p-6 shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            
            {/* Large Avatar */}
            <div className="relative shrink-0">
              <img 
                src={profileUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                alt={profileUser.name} 
                className="w-20 h-20 border-2 border-[#1A1A1A] object-cover bg-white shadow-xs" 
                referrerPolicy="no-referrer"
              />
              {isUserMod && (
                <span className="absolute -bottom-2 -right-2 bg-[#1A1A1A] text-white text-[8px] font-bold px-1.5 py-0.5 border border-white uppercase tracking-wider">
                  MOD
                </span>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] flex items-center justify-center sm:justify-start gap-1.5">
                  {profileUser.name}
                  <span className="inline-flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 uppercase font-sans font-bold tracking-wider leading-none text-[8px]">
                    <ShieldCheck size={9} /> Verified Resident
                  </span>
                </h3>

                {/* Follow/Message Actions if not self */}
                {!isSelf && (
                  <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-0 sm:ml-2">
                    <button
                      onClick={handleFollowToggle}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 rounded-none ${
                        isFollowing 
                          ? 'bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-red-50 hover:border-red-600 hover:text-red-600' 
                          : 'bg-[#1A1A1A] border-[#1A1A1A] text-white hover:bg-[#333333]'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus size={11} /> Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus size={11} /> Follow
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleMessageUser}
                      className="bg-white hover:bg-[#FAF9F6] border border-[#1A1A1A] text-[#1A1A1A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer rounded-none"
                    >
                      <MessageSquare size={11} /> Chat
                    </button>
                  </div>
                )}
              </div>

              {profileUser.bio ? (
                <p className="text-xs text-[#1A1A1A]/80 italic font-serif leading-relaxed max-w-md">
                  "{profileUser.bio}"
                </p>
              ) : (
                <p className="text-xs text-[#1A1A1A]/40 italic font-serif leading-relaxed">
                  No bio has been added to this resident profile yet.
                </p>
              )}

              {/* Stats Counters */}
              <div className="flex items-center justify-center sm:justify-start gap-6 pt-1 text-xs border-t border-[#e1e1de] mt-2">
                <div>
                  <span className="font-mono font-bold text-[#1A1A1A]">{followersCount}</span>
                  <span className="text-[#1A1A1A]/50 font-serif italic ml-1">followers</span>
                </div>
                <div>
                  <span className="font-mono font-bold text-[#1A1A1A]">{followingCount}</span>
                  <span className="text-[#1A1A1A]/50 font-serif italic ml-1">following</span>
                </div>
                <div>
                  <span className="font-mono font-bold text-[#1A1A1A]">{userPosts.length}</span>
                  <span className="text-[#1A1A1A]/50 font-serif italic ml-1">posts</span>
                </div>
                <div>
                  <span className="font-mono font-bold text-[#1A1A1A]">{userListings.length}</span>
                  <span className="text-[#1A1A1A]/50 font-serif italic ml-1">listings</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Self-Profile Engagement Summary Header */}
        {isSelf && (
          <div className="bg-[#FAF9F6] border-b-2 border-[#1A1A1A] px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold text-[#1A1A1A] shrink-0 font-mono">
            <div className="flex items-center gap-1.5 text-violet-700">
              <Sparkles size={13} className="animate-pulse" />
              <span>ENGAGEMENT INSIGHTS SUMMARY (MY CONTENT)</span>
            </div>
            <div className="flex gap-4">
              <span>Avg Interaction: <strong className="text-violet-900">{avgEngagement}</strong></span>
              <span>Total Likes: <strong className="text-rose-600">{totalLikes}</strong></span>
            </div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-emerald-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Check size={14} className="stroke-[3]" />
            {successMsg}
          </div>
        )}

        {/* Tabs Row */}
        <div className="border-b border-[#1A1A1A] flex shrink-0">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-r border-[#1A1A1A] transition-colors cursor-pointer ${
              activeSubTab === 'posts' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'bg-white text-[#1A1A1A] hover:bg-[#FAF9F6]'
            }`}
          >
            <Grid size={13} />
            Neighbourhood Posts ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('marketplace')}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === 'marketplace' 
                ? 'bg-[#1A1A1A] text-white' 
                : 'bg-white text-[#1A1A1A] hover:bg-[#FAF9F6]'
            }`}
          >
            <ShoppingBag size={13} />
            Marketplace Listings ({userListings.length})
          </button>
        </div>

        {/* Content Body Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F6]">
          {deleteConfirmId ? (
            /* Inside Modal Delete Confirmation */
            <div className="bg-white border-2 border-red-600 p-6 space-y-4 max-w-sm mx-auto text-center my-6">
              <AlertCircle size={32} className="text-red-600 mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">Confirm Deletion</h4>
                <p className="text-xs text-[#1A1A1A]/70 mt-1">
                  Are you absolutely sure you want to permanently delete this {deleteConfirmId.type}? This action is irreversible and will remove all likes/comments.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF9F6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="bg-red-600 border border-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ) : activeSubTab === 'posts' ? (
            /* POSTS TAB CONTENT */
            userPosts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Grid size={24} className="text-[#1A1A1A]/30 mx-auto" />
                <p className="text-xs italic text-[#1A1A1A]/60 font-serif">No posts listed by this resident yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userPosts.map(post => {
                  const rating = getEngagementRating(post.likesCount || 0, post.commentsCount || 0);
                  const views = getMockViews(post.id);
                  return (
                    <div 
                      key={post.id}
                      className="bg-white border border-[#1A1A1A] p-4 flex flex-col justify-between gap-3 relative shadow-xs"
                    >
                      <div>
                        {/* Post Header with Date */}
                        <div className="flex justify-between items-start text-[10px] text-[#1A1A1A]/50 mb-2 border-b border-[#FAF9F6] pb-1.5">
                          <span className="flex items-center gap-1 font-serif italic">
                            <Clock size={10} />
                            {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {/* Self Delete Button */}
                          {isSelf && (
                            <button
                              onClick={() => setDeleteConfirmId({ id: post.id, type: 'post' })}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Post Text & Optional Image */}
                        <div className="space-y-2">
                          <p className="text-xs text-[#1A1A1A] leading-relaxed font-serif">
                            {post.text}
                          </p>
                          {post.image && (
                            <img 
                              src={post.image} 
                              alt="Post attach" 
                              className="max-h-40 w-full object-cover border border-[#e1e1de] rounded-none"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      </div>

                      {/* Engagement Metrics & Insights for everyone, but enhanced for Self */}
                      <div className="bg-[#FAF9F6] border border-[#e1e1de] p-2 flex items-center justify-between text-[10px] mt-2 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[#1A1A1A]">
                            <Heart size={11} className="text-rose-500 fill-rose-500" /> {post.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-1 text-[#1A1A1A]">
                            <MessageSquare size={11} className="text-violet-500" /> {post.commentsCount || 0}
                          </span>
                          {isSelf && (
                            <span className="flex items-center gap-1 text-[#1A1A1A]/60 text-[9px] border-l border-[#e1e1de] pl-3">
                              <Eye size={11} /> {views} Views
                            </span>
                          )}
                        </div>

                        {isSelf && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 border uppercase tracking-wider ${rating.color}`}>
                            {rating.text}
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* MARKETPLACE TAB CONTENT */
            userListings.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ShoppingBag size={24} className="text-[#1A1A1A]/30 mx-auto" />
                <p className="text-xs italic text-[#1A1A1A]/60 font-serif">No listings active or sold by this resident yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userListings.map(listing => {
                  const views = getMockViews(listing.id);
                  const isSold = listing.status === 'SOLD';
                  return (
                    <div 
                      key={listing.id}
                      className="bg-white border border-[#1A1A1A] p-3 flex flex-col justify-between gap-2.5 relative shadow-xs"
                    >
                      {/* Image Thumbnail & Category */}
                      <div className="relative aspect-video w-full bg-slate-50 border border-[#e1e1de] overflow-hidden shrink-0">
                        {listing.image ? (
                          <img 
                            src={listing.image} 
                            alt={listing.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-[#FAF9F6]">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                        <span className="absolute top-1.5 left-1.5 bg-white/95 text-[8px] font-bold px-1.5 py-0.5 border border-[#1A1A1A] uppercase tracking-wide">
                          {listing.category}
                        </span>
                        {isSold && (
                          <span className="absolute inset-0 bg-[#1A1A1A]/75 flex items-center justify-center text-white text-[9px] font-bold tracking-widest uppercase">
                            SOLD
                          </span>
                        )}
                      </div>

                      {/* Info & Price */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-[#1A1A1A] line-clamp-1">{listing.title}</h4>
                          <span className="font-mono text-[11px] font-bold text-violet-700">₹{listing.price.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[10px] text-[#1A1A1A]/70 line-clamp-2">{listing.description}</p>
                      </div>

                      {/* Footer Info / Self-Delete & Views */}
                      <div className="border-t border-[#FAF9F6] pt-2 flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          {isSelf && (
                            <span className="flex items-center gap-1 text-[#1A1A1A]/60 text-[9px]">
                              <Eye size={10} /> {views} views
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isSelf && (
                            <button
                              onClick={() => setDeleteConfirmId({ id: listing.id, type: 'listing' })}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
