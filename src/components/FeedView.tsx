import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Flag, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Send, 
  User as UserIcon, 
  ShieldAlert, 
  Smile, 
  AlertTriangle,
  ImageIcon,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Neighborhood, 
  Post, 
  Comment, 
  NeighborhoodRole, 
  PlatformRole 
} from '../types';
import { 
  getPosts, 
  savePosts, 
  getComments, 
  saveComments, 
  addReport, 
  getUserRoleInNeighborhood,
  triggerNotification,
  isUserBlocked
} from '../data/store';

interface FeedViewProps {
  currentUser: User;
  activeNeighborhood: Neighborhood;
  searchQuery: string;
  onRefresh: () => void;
  onViewProfile?: (userId: string) => void;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=600', // Tree-lined lane
  'https://images.unsplash.com/photo-1625603783228-44dc4c643916?auto=format&fit=crop&q=80&w=600', // Chai glass cutting
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600', // Lost pug dog
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'  // Nice society park
];

export default function FeedView({ 
  currentUser, 
  activeNeighborhood, 
  searchQuery,
  onRefresh,
  onViewProfile
}: FeedViewProps) {
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePresets, setShowImagePresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowImagePresets(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Comments visibility state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Editing states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostText, setEditPostText] = useState('');

  // Report states
  const [reportingItem, setReportingItem] = useState<{ id: string; type: 'POST' | 'COMMENT'; text: string } | null>(null);
  const [reportReason, setReportReason] = useState<any>('Spam');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  const posts = getPosts()
    .filter(p => p.neighborhoodId === activeNeighborhood.id && !p.isHidden && !isUserBlocked(currentUser.id, p.userId))
    .filter(p => p.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const comments = getComments().filter(c => !c.isHidden);

  const userRole = getUserRoleInNeighborhood(currentUser.id, activeNeighborhood.id);
  const isModerator = userRole === NeighborhoodRole.MODERATOR;

  // Handles adding a new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      neighborhoodId: activeNeighborhood.id,
      userId: currentUser.id,
      authorName: currentUser.name,
      authorPhone: currentUser.phone,
      authorAvatar: currentUser.avatarUrl,
      text: newPostText,
      image: selectedImage || undefined,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      reportsCount: 0,
      isHidden: false
    };

    const currentPosts = getPosts();
    currentPosts.unshift(newPost);
    savePosts(currentPosts);

    // Reset composer
    setNewPostText('');
    setSelectedImage(null);
    setShowImagePresets(false);
    onRefresh();
  };

  // Handles deleting a post (Own post or Moderator/Admin delete override)
  const handleDeletePost = (postId: string, postAuthorId: string) => {
    const isOwn = postAuthorId === currentUser.id;
    const canDelete = isOwn || isModerator;

    if (!canDelete) return;

    const currentPosts = getPosts();
    const filtered = currentPosts.filter(p => p.id !== postId);
    savePosts(filtered);

    // Delete associated comments too
    const currentComments = getComments();
    const commentsFiltered = currentComments.filter(c => c.postId !== postId);
    saveComments(commentsFiltered);

    onRefresh();
  };

  // Handles editing own post
  const handleSaveEditPost = (postId: string) => {
    if (!editPostText.trim()) return;

    const currentPosts = getPosts();
    const idx = currentPosts.findIndex(p => p.id === postId);
    if (idx !== -1 && currentPosts[idx].userId === currentUser.id) {
      currentPosts[idx].text = editPostText;
      savePosts(currentPosts);
    }
    setEditingPostId(null);
    onRefresh();
  };

  // Handles liking/unliking a post (Toggle Like)
  const handleLikePost = (postId: string, postAuthorId: string) => {
    const currentPosts = getPosts();
    const idx = currentPosts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      const post = currentPosts[idx];
      if (!post.likedBy) {
        post.likedBy = [];
      }
      const isLiked = post.likedBy.includes(currentUser.id);
      if (isLiked) {
        post.likedBy = post.likedBy.filter(id => id !== currentUser.id);
        post.likesCount = Math.max(0, post.likesCount - 1);
      } else {
        post.likedBy.push(currentUser.id);
        post.likesCount += 1;
        
        // Trigger notification for other users
        if (postAuthorId !== currentUser.id) {
          triggerNotification(
            postAuthorId,
            currentUser.name,
            'LIKE_POST',
            postId,
            post.text
          );
        }
      }
      savePosts(currentPosts);
    }
    onRefresh();
  };

  // Handles submitting a comment
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      postId,
      userId: currentUser.id,
      authorName: currentUser.name,
      authorPhone: currentUser.phone,
      authorAvatar: currentUser.avatarUrl,
      text,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      reportsCount: 0,
      isHidden: false
    };

    const currentComments = getComments();
    currentComments.push(newComment);
    saveComments(currentComments);

    // Update comment counts on post
    const currentPosts = getPosts();
    const postIdx = currentPosts.findIndex(p => p.id === postId);
    if (postIdx !== -1) {
      currentPosts[postIdx].commentsCount = (currentPosts[postIdx].commentsCount || 0) + 1;
      savePosts(currentPosts);
      
      // Notify the author
      if (currentPosts[postIdx].userId !== currentUser.id) {
        triggerNotification(
          currentPosts[postIdx].userId,
          currentUser.name,
          'COMMENT_POST',
          postId,
          currentPosts[postIdx].text
        );
      }
    }

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    onRefresh();
  };

  // Handles deleting comment (Own or Moderator/Admin delete override)
  const handleDeleteComment = (commentId: string, commentAuthorId: string, postId: string) => {
    const isOwn = commentAuthorId === currentUser.id;
    const canDelete = isOwn || isModerator;

    if (!canDelete) return;

    const currentComments = getComments();
    const filtered = currentComments.filter(c => c.id !== commentId);
    saveComments(filtered);

    // Decrement post commentsCount
    const currentPosts = getPosts();
    const postIdx = currentPosts.findIndex(p => p.id === postId);
    if (postIdx !== -1 && currentPosts[postIdx].commentsCount > 0) {
      currentPosts[postIdx].commentsCount -= 1;
      savePosts(currentPosts);
    }

    onRefresh();
  };

  // Handles reporting a post or comment
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;

    const result = addReport(
      currentUser.id,
      currentUser.name,
      reportingItem.id,
      reportingItem.type,
      reportingItem.text,
      reportReason
    );

    if (result.autoHidden) {
      setReportSuccessMsg(`Spam threshold crossed! This ${reportingItem.type.toLowerCase()} has been AUTO-HIDDEN immediately from the neighborhood feed for Admin review. Thank you for keeping our community safe.`);
    } else {
      setReportSuccessMsg(`Content reported successfully for "${reportReason}". Flagged for review.`);
    }

    setTimeout(() => {
      setReportingItem(null);
      setReportSuccessMsg(null);
      onRefresh();
    }, 4500);
  };

  return (
    <div className="flex-1 space-y-6 font-sans" id="feed-container">
      
      {/* POST COMPOSER - Replicating Image 3's "Post a message, event, poll or alert" style */}
      <div className="bg-white border border-[#1A1A1A] p-4 rounded-none" id="composer-root">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-start gap-3">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-10 h-10 object-cover border border-[#e1e1de] rounded-full" 
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <textarea
                placeholder="Post a message, event, poll or alert to your neighbors..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="w-full text-sm text-[#1A1A1A] bg-[#fdfdfb] border border-[#e1e1de] focus:border-[#1A1A1A] p-3 focus:outline-none min-h-[72px] resize-none transition-all rounded-none font-sans"
                id="composer-textarea"
                required
              />
            </div>
          </div>

          {/* Preset image selection */}
          {selectedImage && (
            <div className="relative inline-block ml-13 overflow-hidden border border-[#1A1A1A] rounded-none">
              <img src={selectedImage} alt="Post asset preview" className="h-32 object-cover rounded-none" />
              <button 
                type="button" 
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white px-1.5 py-0.5 text-xs transition-colors cursor-pointer rounded-none"
              >
                &times;
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#e1e1de] pt-3 ml-13">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-[#1A1A1A] hover:text-[#333333] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
              >
                <ImageIcon size={14} className="text-[#1A1A1A]" />
                <span>Add Local Photo</span>
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setShowImagePresets(!showImagePresets)}
                className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] text-[9px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>Or Use Preset</span>
              </button>
            </div>

            <button
              type="submit"
              className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer rounded-none font-sans"
              id="btn-submit-post"
            >
              Post to neighborhood
            </button>
          </div>

          {/* Preset Image list */}
          {showImagePresets && (
            <div className="bg-[#fdfdfb] p-2.5 border border-[#e1e1de] grid grid-cols-4 gap-2 ml-13 rounded-none">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img);
                    setShowImagePresets(false);
                  }}
                  className="overflow-hidden border border-[#e1e1de] hover:border-[#1A1A1A] aspect-square transition-all rounded-none"
                >
                  <img src={img} alt="Preset option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* FEED LISTINGS */}
      <div className="space-y-4" id="posts-list-root">
        {posts.length === 0 ? (
          <div className="bg-[#fdfdfb] border border-[#1A1A1A] p-12 text-center rounded-none">
            <Smile size={32} className="mx-auto text-[#1A1A1A]/40" />
            <h4 className="font-serif italic font-semibold text-sm text-[#1A1A1A] mt-2">Zero active posts</h4>
            <p className="text-xs text-[#1A1A1A]/60 mt-1 font-serif italic">Be the first to say hello to your neighbors in {activeNeighborhood.name}!</p>
          </div>
        ) : (
          posts.map((post) => {
            const isOwnPost = post.userId === currentUser.id;
            const postComments = comments.filter(c => c.postId === post.id);
            const isPostExpanded = expandedPostId === post.id;
            const isPostLiked = post.likedBy?.includes(currentUser.id) || false;

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#1A1A1A] p-5 space-y-4 relative rounded-none shadow-[2px_2px_0px_0px_rgba(26,26,26,0.15)]"
              >
                {/* Header (Real identity details) */}
                <div className="flex items-start justify-between">
                  <div 
                    onClick={() => onViewProfile && onViewProfile(post.userId)}
                    className="flex items-center gap-3 bg-[#fef9f9] p-1.5 border border-[#e1e1de]/40 cursor-pointer group hover:border-[#1A1A1A] transition-colors rounded-none"
                    title={`View ${post.authorName}'s Profile`}
                  >
                    <img 
                      src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                      alt={post.authorName} 
                      className="w-10 h-10 object-cover border border-[#e1e1de] group-hover:border-[#1A1A1A] shrink-0 rounded-full transition-colors"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#1A1A1A] leading-normal font-sans group-hover:underline group-hover:text-violet-700 transition-colors">{post.authorName}</span>
                        
                        {/* Display post-level neighborhood roles */}
                        {getUserRoleInNeighborhood(post.userId, activeNeighborhood.id) === NeighborhoodRole.MODERATOR && (
                           <span className="bg-[#f3f3f1] text-[#1A1A1A] text-[8px] font-bold px-1.5 py-0.5 border border-[#1A1A1A] uppercase tracking-wide rounded-none">MODERATOR</span>
                        )}
                        {post.userId === currentUser.id && (
                          <span className="bg-[#f3f3f1] text-[#1A1A1A]/70 text-[8px] font-bold px-1 py-0.5 border border-[#e1e1de] uppercase tracking-wide rounded-none">You</span>
                        )}
                      </div>
                      
                      {/* Sub-header (PRD: real identities) - Beautiful colored badge */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 text-[10px] font-semibold rounded-full font-sans shadow-xs">
                          <Clock size={10} className="text-violet-600 shrink-0" />
                          <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Delete trigger */}
                  <div className="flex items-center gap-2">
                    {/* Delete overrides */}
                    {(isOwnPost || isModerator) && (
                      <button
                        onClick={() => handleDeletePost(post.id, post.userId)}
                        title="Delete post"
                        className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    {/* Report triggers */}
                    {!isOwnPost && (
                      <button
                        onClick={() => setReportingItem({ id: post.id, type: 'POST', text: post.text })}
                        title="Flag/Report content"
                        className="text-slate-400 hover:text-orange-500 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Flag size={13} />
                      </button>
                    )}
                  </div>
                </div>                {/* Body Content */}
                <div className="text-[15px] md:text-base text-[#1A1A1A] leading-relaxed whitespace-pre-wrap px-1 font-serif italic">
                  {editingPostId === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editPostText}
                        onChange={(e) => setEditPostText(e.target.value)}
                        className="w-full text-sm border border-[#e1e1de] p-2.5 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none font-sans"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => setEditingPostId(null)} className="text-[10px] font-semibold uppercase tracking-wider text-[#1A1A1A]/70 py-1 px-2 hover:bg-[#f3f3f1] rounded-none">Cancel</button>
                        <button onClick={() => handleSaveEditPost(post.id)} className="text-[10px] font-semibold uppercase tracking-wider text-white bg-[#1A1A1A] py-1 px-3 hover:bg-[#333333] rounded-none">Save</button>
                      </div>
                    </div>
                  ) : (
                    post.text
                  )}
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="overflow-hidden border border-[#1A1A1A] rounded-none">
                    <img 
                      src={post.image} 
                      alt="Local update visual" 
                      className="w-full max-h-96 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Post Footer Action Bar - Replicating Image 3's visual structure */}
                <div className="flex items-center gap-4 border-t border-[#e1e1de] pt-3">
                  {/* Like button (likes) */}
                  <button
                    onClick={() => handleLikePost(post.id, post.userId)}
                    className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer p-1.5 rounded-none hover:bg-[#f3f3f1] transition-colors uppercase tracking-wider"
                  >
                    <motion.div
                      animate={{ scale: isPostLiked ? [1, 1.4, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center"
                    >
                      <Heart 
                        size={13} 
                        className={isPostLiked ? "text-red-600 fill-red-600" : "text-[#1A1A1A] fill-transparent"} 
                      />
                    </motion.div>
                    <span className={isPostLiked ? "text-red-600 font-bold" : "text-[#1A1A1A]"}>Like</span>
                    <span className={`px-1.5 py-0.2 font-mono text-[9px] border rounded-none ${
                      isPostLiked 
                        ? "bg-red-50 border-red-200 text-red-600" 
                        : "bg-[#fdfdfb] border-[#e1e1de] text-[#1A1A1A]"
                    }`}>{post.likesCount}</span>
                  </button>

                  {/* Comment Toggle button */}
                  <button
                    onClick={() => setExpandedPostId(isPostExpanded ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] hover:text-[#333333] cursor-pointer p-1.5 rounded-none hover:bg-[#f3f3f1] transition-colors uppercase tracking-wider"
                  >
                    <MessageSquare size={13} className="text-[#1A1A1A]" />
                    <span>Reply</span>
                    <span className="bg-[#fdfdfb] border border-[#e1e1de] px-1.5 py-0.2 font-mono text-[9px] text-[#1A1A1A] rounded-none">{postComments.length}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {isPostExpanded && (
                  <div className="border-t border-slate-50 pt-4 space-y-4" id={`comments-section-${post.id}`}>
                    
                    {/* Add Comment Field */}
                    <div className="flex items-start gap-2.5">
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-8 h-8 object-cover shrink-0 border border-[#e1e1de] rounded-full" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a warm reply..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          className="flex-1 text-xs border border-[#e1e1de] px-3 py-2 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none font-sans"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 flex items-center justify-center transition-colors cursor-pointer rounded-none"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 pl-3 border-l-2 border-[#e1e1de]">
                      {postComments.map((cmt) => (
                        <div key={cmt.id} className="bg-[#fdfdfb] p-3 border border-[#e1e1de] flex items-start justify-between gap-3 text-xs rounded-none">
                          <div 
                            onClick={() => onViewProfile && onViewProfile(cmt.userId)}
                            className="flex items-start gap-2.5 min-w-0 cursor-pointer group"
                            title={`View ${cmt.authorName}'s Profile`}
                          >
                            <img 
                              src={cmt.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                              alt={cmt.authorName} 
                              className="w-7 h-7 object-cover shrink-0 border border-[#e1e1de] group-hover:border-[#1A1A1A] rounded-full transition-colors" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[#1A1A1A] text-[11px] group-hover:underline group-hover:text-violet-700 transition-colors">{cmt.authorName}</span>
                                {getUserRoleInNeighborhood(cmt.userId, activeNeighborhood.id) === NeighborhoodRole.MODERATOR && (
                                  <span className="bg-[#f3f3f1] text-[#1A1A1A] border border-[#1A1A1A] text-[7px] px-1 font-bold uppercase rounded-none">MOD</span>
                                )}
                              </div>
                              <p className="text-[#1A1A1A]/85 mt-1 text-[11px] leading-relaxed font-sans">{cmt.text}</p>
                              <span className="text-[9px] text-indigo-600/70 mt-1 block font-sans font-medium">
                                {new Date(cmt.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Comment Actions */}
                          <div className="flex items-center gap-1 shrinkage-0">
                            {(cmt.userId === currentUser.id || isModerator) && (
                              <button
                                onClick={() => handleDeleteComment(cmt.id, cmt.userId, post.id)}
                                title="Delete comment"
                                className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}

                            {cmt.userId !== currentUser.id && (
                              <button
                                onClick={() => setReportingItem({ id: cmt.id, type: 'COMMENT', text: cmt.text })}
                                title="Report comment"
                                className="text-slate-400 hover:text-orange-500 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Flag size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </motion.article>
            );
          })
        )}
      </div>      {/* REPORT MODAL */}
      {reportingItem && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-report">
          <div className="bg-white max-w-sm w-full p-6 border border-[#1A1A1A] relative animate-in fade-in zoom-in-95 duration-150 rounded-none shadow-[4px_4px_0px_0px_rgba(26,26,26,0.15)]">
            
            {reportSuccessMsg ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle size={36} className="mx-auto text-[#1A1A1A] animate-bounce" />
                <h4 className="font-serif italic font-semibold text-[#1A1A1A] text-sm">Report Received</h4>
                <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-serif italic">{reportSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="flex items-center gap-2 text-orange-600 font-serif italic font-semibold text-base mb-1">
                  <AlertTriangle size={20} />
                  Report Content
                </div>
                <p className="text-[10px] text-[#1A1A1A]/60 font-serif italic">Social accountability ensures ApnaArea stays safe. Choose a genuine reason to flag this item for platform moderation.</p>

                {/* Content snippet */}
                <div className="bg-[#fdfdfb] border border-[#e1e1de] p-3 my-3 text-[11px] text-[#1A1A1A]/70 italic truncate font-serif rounded-none">
                  "{reportingItem.text}"
                </div>

                <div className="space-y-2.5">
                  <label className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block">Report Reason</label>
                  <div className="grid grid-cols-1 gap-1.5" id="report-reasons-options">
                    {['Spam', 'Abusive or harassing', 'Misinformation', 'Inappropriate content', 'Other'].map((reason) => (
                      <label 
                        key={reason}
                        className={`p-2.5 border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all rounded-none ${
                          reportReason === reason 
                            ? 'border-[#1A1A1A] bg-[#f3f3f1] text-[#1A1A1A]' 
                            : 'border-[#e1e1de] bg-[#fdfdfb] text-[#1A1A1A]/70 hover:bg-[#f3f3f1]'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="report_reason" 
                          value={reason} 
                          checked={reportReason === reason}
                          onChange={() => setReportReason(reason as any)}
                          className="accent-[#1A1A1A] focus:ring-[#1A1A1A]"
                        />
                        {reason}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-[#e1e1de]">
                  <button 
                    type="button" 
                    onClick={() => setReportingItem(null)}
                    className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/75 hover:bg-[#f3f3f1] cursor-pointer rounded-none"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-none"
                  >
                    Submit Flag
                  </button>
                </div>
              </form>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
