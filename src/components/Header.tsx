import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Search, 
  User as UserIcon, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  CheckSquare, 
  Check, 
  Menu 
} from 'lucide-react';
import { User, Neighborhood, Notification, PlatformRole, NeighborhoodRole } from '../types';
import { getUsers, setCurrentUserId, getNotifications, saveNotifications, getUserRoleInNeighborhood } from '../data/store';

interface HeaderProps {
  currentUser: User;
  activeNeighborhood: Neighborhood;
  onUserChanged: (newUser: User) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadCount: number;
  onNotificationRead: () => void;
  onMenuToggle?: () => void;
  onShowPortal?: () => void;
}

export default function Header({ 
  currentUser, 
  activeNeighborhood, 
  onUserChanged,
  searchQuery,
  setSearchQuery,
  unreadCount,
  onNotificationRead,
  onMenuToggle,
  onShowPortal
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const allUsers = getUsers();
  const allNotifs = getNotifications().filter(n => n.recipientId === currentUser.id);
  const userRole = getUserRoleInNeighborhood(currentUser.id, activeNeighborhood.id);

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    const users = getUsers();
    const newUser = users.find(u => u.id === userId);
    if (newUser) {
      onUserChanged(newUser);
    }
    setShowUserDropdown(false);
  };

  const handleMarkAllRead = () => {
    const updated = getNotifications().map(n => {
      if (n.recipientId === currentUser.id) {
        return { ...n, isRead: true };
      }
      return n;
    });
    saveNotifications(updated);
    onNotificationRead();
    setShowNotifDropdown(false);
  };

  const handleMarkSingleRead = (id: string) => {
    const updated = getNotifications().map(n => {
      if (n.id === id) {
        return { ...n, isRead: true };
      }
      return n;
    });
    saveNotifications(updated);
    onNotificationRead();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFDFB] border-b border-[#e1e1de] font-sans px-4 md:px-8 py-3 md:pl-20" id="app-header">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & Active Neighborhood Pin */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 text-[#1A1A1A] hover:bg-[#f3f3f1] border border-[#e1e1de] shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1A1A1A] flex items-center justify-center text-white font-serif italic font-bold text-xl">
              A
            </div>
            <div className="hidden sm:block">
              <span className="font-serif italic font-bold text-lg tracking-tight text-[#1A1A1A]">ApnaArea</span>
              <span className="text-[9px] text-[#1A1A1A] font-medium block -mt-1.5 tracking-widest uppercase letter-spacing-wide">Hyperlocal</span>
            </div>
          </div>

          {/* Active Neighborhood Badge */}
          <div className="flex items-center gap-1.5 bg-[#f3f3f1] px-3 py-1.5 border border-[#e1e1de]">
            <MapPin size={13} className="text-[#1A1A1A] fill-[#1A1A1A]/10" />
            <span className="text-xs font-medium text-[#1A1A1A] max-w-[120px] lg:max-w-none truncate font-serif italic">
              {activeNeighborhood.name}
            </span>
            <span className="text-[10px] bg-white border border-[#e1e1de] text-[#1A1A1A] px-1.5 py-0.5 font-mono">
              {activeNeighborhood.pincode}
            </span>
          </div>
        </div>

        {/* Center Section: Modern Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#1A1A1A]/50" />
            <input
              type="text"
              placeholder={`Search posts, listings or events in ${activeNeighborhood.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-[#e1e1de] pl-10 pr-4 py-2 focus:outline-none focus:border-[#1A1A1A] focus:bg-[#f3f3f1]/10 text-[#1A1A1A] transition-colors"
              id="search-input"
            />
          </div>
        </div>

        {/* Right Section: Notification Panel & Switchable User Profile dropdown */}
        <div className="flex items-center gap-3">
          
          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="w-9 h-9 border border-[#e1e1de] bg-white flex items-center justify-center text-[#1A1A1A] hover:bg-[#f3f3f1] transition-colors relative cursor-pointer"
              id="btn-notif-bell"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[9px] font-medium w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#1A1A1A] py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-[#e1e1de] flex items-center justify-between bg-[#f3f3f1]/50">
                  <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider letter-spacing-wide">Notifications ({allNotifs.length})</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-[#1A1A1A] hover:underline font-semibold cursor-pointer uppercase letter-spacing-wide"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {allNotifs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#1A1A1A]/60 font-serif italic">
                      No notifications yet
                    </div>
                  ) : (
                    allNotifs.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleMarkSingleRead(notif.id)}
                        className={`px-4 py-2.5 border-b border-[#e1e1de]/50 flex items-start gap-2.5 hover:bg-[#f3f3f1] transition-colors cursor-pointer ${
                          !notif.isRead ? 'bg-[#f3f3f1]/40' : ''
                        }`}
                      >
                        <div className="w-1.5 h-1.5 bg-[#1A1A1A] mt-1.5 shrink-0" style={{ opacity: notif.isRead ? 0 : 1 }}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[#1A1A1A] leading-normal">
                            <span className="font-semibold">{notif.actorName}</span>{' '}
                            {notif.type === 'LIKE_POST' && 'liked your post:'}
                            {notif.type === 'COMMENT_POST' && 'commented on your post:'}
                            {notif.type === 'LIKE_COMMENT' && 'liked your comment:'}
                            {notif.type === 'WELCOME' && 'welcomed you to'}
                            {notif.type === 'PROMOTED_MODERATOR' && 'promoted you to Moderator in'}
                            {' '}<span className="italic font-serif">"{notif.targetTitle}"</span>
                          </p>
                          <span className="text-[9px] text-[#1A1A1A]/60 mt-0.5 block font-mono">
                            {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Portal button for recruiters */}
          {onShowPortal && (
            <button
              onClick={onShowPortal}
              className="flex items-center gap-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider"
              title="Return to Welcome Portal / Landing Page"
            >
              <LogOut size={12} />
              <span className="hidden md:inline">Exit to Portal</span>
            </button>
          )}

          {/* User Account Switcher - Extremely valuable tool for demonstrating different workflows */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 bg-white hover:bg-[#f3f3f1] border border-[#e1e1de] px-2.5 py-1.5 transition-colors cursor-pointer"
              id="btn-user-dropdown"
            >
              <div className="w-7 h-7 overflow-hidden border border-[#e1e1de] rounded-full">
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover rounded-full" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f3f3f1] text-[#1A1A1A] flex items-center justify-center font-bold text-xs rounded-full">
                    {currentUser.name[0]}
                  </div>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-[#1A1A1A] flex items-center gap-1">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[9px] text-[#1A1A1A]/60 font-serif italic leading-none">
                  {userRole === NeighborhoodRole.MODERATOR ? 'Community Moderator' : currentUser.id === 'user-dianne' ? 'Local Seller' : 'Verified Resident'}
                </div>
              </div>
              <ChevronDown size={14} className="text-[#1A1A1A]/60" />
            </button>

            {/* Clean personal profile card instead of a multi-user hack dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-[#1A1A1A] shadow-md z-50">
                <div className="p-4 border-b border-[#e1e1de] text-center flex flex-col items-center">
                  <div className="w-12 h-12 overflow-hidden border border-[#e1e1de] rounded-full mb-2">
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-full h-full object-cover rounded-full" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f3f3f1] text-[#1A1A1A] flex items-center justify-center font-bold text-sm rounded-full">
                        {currentUser.name[0]}
                      </div>
                    )}
                  </div>
                  <h4 className="font-serif italic font-bold text-sm text-[#1A1A1A]">{currentUser.name}</h4>
                  <p className="text-[10px] text-[#1A1A1A]/60 font-mono mt-0.5">{currentUser.phone || 'Verified Neighbor'}</p>
                  
                  <div className="mt-3">
                    {userRole === NeighborhoodRole.MODERATOR ? (
                      <span className="text-[9px] font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 border border-violet-200 uppercase tracking-wider">
                        Moderator Scope
                      </span>
                    ) : currentUser.id === 'user-dianne' ? (
                      <span className="text-[9px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 border border-indigo-200 uppercase tracking-wider">
                        Seller Scope
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase tracking-wider">
                        Verified Resident
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 text-[10px] text-[#1A1A1A]/70 leading-relaxed border-b border-[#e1e1de]">
                  <p>This neighborhood is restricted by pincode to verified local residents only. Your profile is active and authenticated.</p>
                </div>

                {onShowPortal && (
                  <div className="p-2">
                    <button
                      onClick={onShowPortal}
                      className="w-full text-center px-3 py-2 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100/80 border border-red-200 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer font-sans"
                    >
                      <LogOut size={12} />
                      Log Out & Exit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
