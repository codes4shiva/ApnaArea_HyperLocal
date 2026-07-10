import React from 'react';
import { 
  Users, 
  Shield, 
  Award, 
  Clock, 
  Check, 
  Heart, 
  Ban, 
  MessageSquare, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Neighborhood, Membership, NeighborhoodRole, PlatformRole } from '../types';
import { 
  getUsers, 
  getMemberships, 
  saveMemberships, 
  getUserRoleInNeighborhood,
  triggerNotification,
  getFollows,
  getBlocks,
  toggleFollowUser,
  toggleBlockUser,
  getOrCreateConversation,
  isUserBlocked,
  isBlockerOf
} from '../data/store';

interface MembersViewProps {
  currentUser: User;
  activeNeighborhood: Neighborhood;
  searchQuery: string;
  onRefresh: () => void;
  setActiveTab?: (tab: string) => void;
  onViewProfile?: (userId: string) => void;
}

export default function MembersView({ 
  currentUser, 
  activeNeighborhood, 
  searchQuery,
  onRefresh,
  setActiveTab,
  onViewProfile
}: MembersViewProps) {
  const users = getUsers();
  const memberships = getMemberships().filter(m => m.neighborhoodId === activeNeighborhood.id);

  const currentUserRole = getUserRoleInNeighborhood(currentUser.id, activeNeighborhood.id);
  const isModerator = currentUserRole === NeighborhoodRole.MODERATOR;

  const follows = getFollows();
  const blocks = getBlocks();

  // Filter users who are members of this neighborhood
  const joinedUsers = users.map(user => {
    const membership = memberships.find(m => m.userId === user.id);
    if (!membership) return null;
    return {
      ...user,
      neighborhoodRole: membership.role,
      joinedAt: membership.createdAt,
      membershipId: membership.id
    };
  }).filter((u): u is NonNullable<typeof u> => u !== null)
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase())));

  const handlePromoteToModerator = (userId: string, userName: string) => {
    const currentMemberships = getMemberships();
    const idx = currentMemberships.findIndex(
      m => m.userId === userId && m.neighborhoodId === activeNeighborhood.id
    );

    if (idx !== -1) {
      currentMemberships[idx].role = NeighborhoodRole.MODERATOR;
      saveMemberships(currentMemberships);

      // Trigger notification for the promoted user
      triggerNotification(
        userId,
        currentUser.name,
        'PROMOTED_MODERATOR',
        activeNeighborhood.id,
        activeNeighborhood.name
      );

      onRefresh();
    }
  };

  const handleFollowToggle = (targetId: string) => {
    try {
      toggleFollowUser(currentUser.id, targetId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error executing follow');
    }
  };

  const handleBlockToggle = (targetId: string) => {
    try {
      const isNowBlocked = toggleBlockUser(currentUser.id, targetId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error executing block');
    }
  };

  const handleStartMessage = (targetId: string) => {
    try {
      const convo = getOrCreateConversation(currentUser.id, targetId);
      localStorage.setItem('apnaarea_active_convo_id', convo.id);
      if (setActiveTab) {
        setActiveTab('messages');
      }
    } catch (err: any) {
      alert(err.message || 'Error starting message');
    }
  };

  return (
    <div className="flex-1 space-y-6 font-sans" id="members-view-root">
      
      {/* MEMBERS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="members-grid">
        {joinedUsers.map((user, index) => {
          const isSelf = user.id === currentUser.id;
          const isUserMod = user.neighborhoodRole === NeighborhoodRole.MODERATOR;

          // Block conditions
          const blockedByMe = isBlockerOf(currentUser.id, user.id);
          const blockedMe = isBlockerOf(user.id, currentUser.id);

          // Calculate follower statistics
          const userFollowers = follows.filter(f => f.followingId === user.id).length;
          const userFollowing = follows.filter(f => f.followerId === user.id).length;
          const isFollowingThisUser = follows.some(f => f.followerId === currentUser.id && f.followingId === user.id);

          // Rule: If other user has blocked current user, current user cannot view their profile.
          if (blockedMe && !isSelf) {
            return (
              <div 
                key={user.id}
                className="bg-[#FAF9F6] border border-dashed border-[#e1e1de] p-5 flex flex-col items-center justify-center text-center h-[200px]"
              >
                <ShieldAlert size={20} className="text-[#1A1A1A]/40 mb-2" />
                <h4 className="font-serif italic font-bold text-xs text-[#1A1A1A]">Profile Unavailable</h4>
                <p className="text-[10px] text-[#1A1A1A]/50 max-w-[200px] mt-1">This resident has restricted their profile visibility.</p>
              </div>
            );
          }

          return (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-white border border-[#e1e1de] p-4 flex flex-col justify-between transition-all rounded-none ${
                blockedByMe ? 'bg-[#FAF9F6] opacity-75' : ''
              }`}
            >
              <div className="space-y-3.5">
                {/* Header info */}
                <div 
                  onClick={() => onViewProfile && onViewProfile(user.id)}
                  className="flex items-start gap-3 cursor-pointer group"
                  title={`View ${user.name}'s Profile`}
                >
                  <img 
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-none object-cover border border-[#e1e1de] group-hover:border-[#1A1A1A] shrink-0 transition-colors" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif italic font-bold text-sm text-[#1A1A1A] truncate flex items-center gap-1.5 group-hover:underline group-hover:text-violet-700 transition-colors">
                      {user.name}
                      {isSelf && (
                        <span className="bg-[#1A1A1A] text-white text-[8px] font-sans font-bold px-1 py-0.2 uppercase tracking-wide">You</span>
                      )}
                    </h4>
                  </div>
                </div>

                {/* Blocked by me indicator */}
                {blockedByMe && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-2 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={12} />
                    You have blocked this resident
                  </div>
                )}

                {/* Profile details & metrics (only if not blocked by me) */}
                {!blockedByMe && (
                  <>
                    {user.bio ? (
                      <p className="text-[11px] text-[#1A1A1A]/75 italic leading-relaxed font-serif line-clamp-2">
                        "{user.bio}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#1A1A1A]/40 italic leading-relaxed font-serif">
                        No bio listed.
                      </p>
                    )}

                    {/* Social connection statistics */}
                    <div className="grid grid-cols-2 gap-2 border border-[#e1e1de] p-2 text-center text-[10px] bg-[#d3d8e7]">
                      <div>
                        <span className="block font-mono font-bold text-[#1A1A1A]">{userFollowers}</span>
                        <span className="text-[#1A1A1A]/50 font-serif italic text-[9px]">followers</span>
                      </div>
                      <div>
                        <span className="block font-mono font-bold text-[#1A1A1A]">{userFollowing}</span>
                        <span className="text-[#1A1A1A]/50 font-serif italic text-[9px]">following</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Role tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {isUserMod ? (
                    <span className="bg-[#1A1A1A] text-white font-sans font-bold text-[8px] px-1.5 py-0.5 uppercase tracking-wide flex items-center gap-0.5">
                      <Shield size={9} /> Neighborhood Moderator
                    </span>
                  ) : (
                    <span className="bg-[#d8c9eb] text-[#1A1A1A]/80 font-sans font-bold text-[8px] px-1.5 py-0.5 border border-[#e1e1de] uppercase tracking-wide">
                      Resident Member
                    </span>
                  )}
                </div>

                {/* Additional membership info */}
                <div className="flex items-center gap-1.5 text-[9px] text-[#1A1A1A]/50 font-mono">
                  <Clock size={10} />
                  <span>Resident since {new Date(user.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Action Rows */}
              <div className="border-t border-[#e1e1de] pt-3 mt-4">
                {isSelf ? (
                  <div className="flex justify-between items-center text-[10px] text-[#1A1A1A]/40 font-serif italic">
                    <span>Active Session</span>
                    <span className="font-sans font-bold uppercase tracking-wider text-[8px] text-[#1A1A1A]/60">Verified Resident</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Social Interaction Buttons (Follow, DM, Block) */}
                    <div className="flex items-center gap-1.5">
                      {!blockedByMe && (
                        <>
                          <button
                            onClick={() => handleFollowToggle(user.id)}
                            className={`flex-1 flex items-center justify-center gap-1 py-1 px-2.5 text-[10px] font-bold transition-all border cursor-pointer ${
                              isFollowingThisUser 
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                                : 'bg-white text-[#1A1A1A] border-[#e1e1de] hover:bg-[#FAF9F6]'
                            }`}
                          >
                            <Heart size={11} className={isFollowingThisUser ? 'fill-current text-white' : ''} />
                            {isFollowingThisUser ? 'Following' : 'Follow'}
                          </button>

                          <button
                            onClick={() => handleStartMessage(user.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1 px-2.5 text-[10px] font-bold bg-white text-[#1A1A1A] border border-[#e1e1de] hover:bg-[#FAF9F6] cursor-pointer"
                          >
                            <MessageSquare size={11} />
                            Message
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleBlockToggle(user.id)}
                        className={`flex items-center justify-center py-1 px-2.5 text-[10px] font-bold transition-all border cursor-pointer ${
                          blockedByMe
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-red-600 border-red-100 hover:bg-red-50'
                        }`}
                        title={blockedByMe ? "Unblock User" : "Block User"}
                      >
                        <Ban size={11} />
                        <span className="ml-1">{blockedByMe ? 'Blocked' : 'Block'}</span>
                      </button>
                    </div>

                    {/* Promotable by moderators */}
                    {isModerator && !isUserMod && (
                      <button
                        onClick={() => handlePromoteToModerator(user.id, user.name)}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-1 rounded-none text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <Award size={10} /> Promote to Moderator
                      </button>
                    )}
                  </div>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
