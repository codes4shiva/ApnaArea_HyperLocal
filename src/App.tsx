import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  getActiveNeighborhood, 
  getNotifications,
  getUserRoleInNeighborhood,
  initializeStore 
} from './data/store';
import { User, Neighborhood, NeighborhoodRole, PlatformRole } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FeedView from './components/FeedView';
import MarketplaceView from './components/MarketplaceView';
import EventsView from './components/EventsView';
import MembersView from './components/MembersView';
import MessagesView from './components/MessagesView';
import ModerationView from './components/ModerationView';
import ProfileView from './components/ProfileView';
import ChatOverlay from './components/ChatOverlay';
import UserProfileModal from './components/UserProfileModal';
import { ShieldCheck, UserCheck, Compass } from 'lucide-react';

export default function App() {
  // Initialize standard seeds if localStorage is vacant
  useEffect(() => {
    initializeStore();
  }, []);

  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [activeNeighborhood, setActiveNeighborhood] = useState<Neighborhood>(getActiveNeighborhood());
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

  // Triggered whenever notifications or data elements update
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Sync notification bells
  useEffect(() => {
    const allNotifs = getNotifications();
    const count = allNotifs.filter(n => n.recipientId === currentUser.id && !n.isRead).length;
    setUnreadCount(count);
  }, [currentUser, refreshKey]);

  // Handle switching personas on-the-fly
  const handleUserChanged = (newUser: User) => {
    setCurrentUser(newUser);
    // Switch active neighborhood to first one they are joined to
    const activeNb = getActiveNeighborhood();
    setActiveNeighborhood(activeNb);
    // Reset query
    setSearchQuery('');
    handleRefresh();
  };

  const userRole = getUserRoleInNeighborhood(currentUser.id, activeNeighborhood.id);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-800 antialiased font-sans selection:bg-violet-100 selection:text-violet-800" id="apna-area-app">
      
      {/* HEADER BAR */}
      <Header 
        currentUser={currentUser}
        activeNeighborhood={activeNeighborhood}
        onUserChanged={handleUserChanged}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadCount={unreadCount}
        onNotificationRead={handleRefresh}
        onMenuToggle={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* CORE WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR TABS & LOCALITIES */}
        <Sidebar 
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeNeighborhood={activeNeighborhood}
          setActiveNeighborhood={setActiveNeighborhood}
          onRefresh={handleRefresh}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* ACTIVE PANEL CONTENT AREA */}
        <section className="flex-1 min-w-0" id="main-content-area">
          {activeTab === 'feed' && (
            <FeedView 
              currentUser={currentUser}
              activeNeighborhood={activeNeighborhood}
              searchQuery={searchQuery}
              onRefresh={handleRefresh}
              onViewProfile={setSelectedProfileUserId}
            />
          )}

          {activeTab === 'marketplace' && (
            <MarketplaceView 
              currentUser={currentUser}
              activeNeighborhood={activeNeighborhood}
              searchQuery={searchQuery}
              onRefresh={handleRefresh}
              setActiveTab={setActiveTab}
              onViewProfile={setSelectedProfileUserId}
            />
          )}

          {activeTab === 'events' && (
            <EventsView 
              currentUser={currentUser}
              activeNeighborhood={activeNeighborhood}
              searchQuery={searchQuery}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'members' && (
            <MembersView 
              currentUser={currentUser}
              activeNeighborhood={activeNeighborhood}
              searchQuery={searchQuery}
              onRefresh={handleRefresh}
              setActiveTab={setActiveTab}
              onViewProfile={setSelectedProfileUserId}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesView 
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'moderation' && (
            <ModerationView 
              currentUser={currentUser}
              activeNeighborhood={activeNeighborhood}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              currentUser={currentUser}
              onRefresh={handleRefresh}
              onUserChanged={handleUserChanged}
              onViewProfile={setSelectedProfileUserId}
            />
          )}
        </section>

      </main>

      {/* CHAT SUPPORT OVERLAY */}
      <ChatOverlay currentUser={currentUser} />

      {/* USER PROFILE MODAL */}
      {selectedProfileUserId && (
        <UserProfileModal
          userId={selectedProfileUserId}
          currentUser={currentUser}
          activeNeighborhood={activeNeighborhood}
          onClose={() => setSelectedProfileUserId(null)}
          onRefresh={handleRefresh}
          setActiveTab={setActiveTab}
        />
      )}

      {/* FOOTER BAR */}
      <footer className="border-t border-slate-100 bg-white py-6 mt-12 text-center text-[11px] text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Compass size={13} className="text-violet-600" />
            <span>ApnaArea Hyperlocal Network • Enforcing Verified Civility</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <UserCheck size={11} className="text-emerald-500" /> Real Phone ID
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-violet-500" /> 5-Report Auto-Hide
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
