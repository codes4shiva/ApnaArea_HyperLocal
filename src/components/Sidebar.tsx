import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rss, 
  ShoppingBag, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Plus, 
  Search, 
  LogOut, 
  ArrowRight,
  Sparkles,
  Map,
  BadgeAlert,
  MessageSquare,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { 
  User, 
  Neighborhood, 
  Membership, 
  NeighborhoodRole, 
  PlatformRole 
} from '../types';
import { 
  getNeighborhoods, 
  getMemberships, 
  saveMemberships, 
  saveNeighborhoods, 
  setActiveNeighborhoodId,
  getUserRoleInNeighborhood,
  triggerNotification
} from '../data/store';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeNeighborhood: Neighborhood;
  setActiveNeighborhood: (nb: Neighborhood) => void;
  onRefresh: () => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  activeNeighborhood, 
  setActiveNeighborhood,
  onRefresh,
  isMobileOpen = false,
  onClose
}: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPincode, setNewPincode] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Neighborhood[]>([]);

  const nbs = getNeighborhoods();
  const memberships = getMemberships();

  // Find joined neighborhoods for this user
  const joinedNbIds = memberships
    .filter(m => m.userId === currentUser.id)
    .map(m => m.neighborhoodId);

  const joinedNbs = nbs.filter(n => joinedNbIds.includes(n.id));

  const handleSelectNeighborhood = (nb: Neighborhood) => {
    setActiveNeighborhoodId(nb.id);
    setActiveNeighborhood(nb);
    onRefresh();
  };

  // Create a new neighborhood (PRD: Creator is auto-assigned as Moderator)
  const handleCreateNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPincode.trim()) return;

    const newNbId = `nb-${Date.now()}`;
    const newNb: Neighborhood = {
      id: newNbId,
      name: newName,
      description: newDesc,
      pincode: newPincode,
      createdAt: new Date().toISOString()
    };

    // Save neighborhood
    const currentNbs = getNeighborhoods();
    currentNbs.push(newNb);
    saveNeighborhoods(currentNbs);

    // Join as MODERATOR
    const currentMemberships = getMemberships();
    const newMembership: Membership = {
      id: `mem-${Date.now()}`,
      userId: currentUser.id,
      neighborhoodId: newNbId,
      role: NeighborhoodRole.MODERATOR,
      createdAt: new Date().toISOString()
    };
    currentMemberships.push(newMembership);
    saveMemberships(currentMemberships);

    // Update notification
    triggerNotification(
      currentUser.id,
      'System',
      'PROMOTED_MODERATOR',
      newNbId,
      newName
    );

    // Reset and select
    setNewName('');
    setNewDesc('');
    setNewPincode('');
    setShowCreateModal(false);
    
    setActiveNeighborhoodId(newNbId);
    setActiveNeighborhood(newNb);
    onRefresh();
  };

  // Search neighborhoods by pin or name
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResult([]);
      return;
    }
    const currentNbs = getNeighborhoods();
    const filtered = currentNbs.filter(
      n => n.pincode.includes(q) || n.name.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResult(filtered);
  };

  // Join a neighborhood (PRD: joins as RESIDENT)
  const handleJoinNeighborhood = (nb: Neighborhood) => {
    const currentMemberships = getMemberships();
    
    // Check if already a member
    const exists = currentMemberships.some(
      m => m.userId === currentUser.id && m.neighborhoodId === nb.id
    );
    
    if (!exists) {
      const newM: Membership = {
        id: `mem-${Date.now()}`,
        userId: currentUser.id,
        neighborhoodId: nb.id,
        role: NeighborhoodRole.RESIDENT,
        createdAt: new Date().toISOString()
      };
      currentMemberships.push(newM);
      saveMemberships(currentMemberships);

      triggerNotification(
        currentUser.id,
        'System',
        'WELCOME',
        nb.id,
        nb.name
      );
    }

    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResult([]);
    
    setActiveNeighborhoodId(nb.id);
    setActiveNeighborhood(nb);
    onRefresh();
  };

  // Leave neighborhood (triggers succession rule if last moderator leaves)
  const handleLeaveNeighborhood = (nbId: string) => {
    const currentMemberships = getMemberships();
    
    // Find membership to delete
    const memIndex = currentMemberships.findIndex(
      m => m.userId === currentUser.id && m.neighborhoodId === nbId
    );
    
    if (memIndex !== -1) {
      const leavingRole = currentMemberships[memIndex].role;
      currentMemberships.splice(memIndex, 1);
      
      // SUCCESSION RULE: If the last MODERATOR of a neighborhood leaves,
      // promote the member with the oldest Membership.createdAt (oldest seniority)
      if (leavingRole === NeighborhoodRole.MODERATOR) {
        const remainingMembers = currentMemberships.filter(m => m.neighborhoodId === nbId);
        const hasModerator = remainingMembers.some(m => m.role === NeighborhoodRole.MODERATOR);
        
        if (!hasModerator && remainingMembers.length > 0) {
          // Sort by createdAt ascending (oldest first)
          remainingMembers.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          const oldestMember = remainingMembers[0];
          // Find original index in currentMemberships and promote
          const originalIdx = currentMemberships.findIndex(m => m.id === oldestMember.id);
          if (originalIdx !== -1) {
            currentMemberships[originalIdx].role = NeighborhoodRole.MODERATOR;
            
            // Send in-app notification to promoted user
            triggerNotification(
              oldestMember.userId,
              'System Succession',
              'PROMOTED_MODERATOR',
              nbId,
              nbs.find(n => n.id === nbId)?.name || 'Local Neighborhood'
            );
          }
        }
      }

      saveMemberships(currentMemberships);
      
      // Switch active neighborhood to first joined one, or default Miraloma
      const remainingJoined = joinedNbs.filter(n => n.id !== nbId);
      if (remainingJoined.length > 0) {
        setActiveNeighborhoodId(remainingJoined[0].id);
        setActiveNeighborhood(remainingJoined[0]);
      } else {
        const fallback = nbs.find(n => n.id === 'nb-miraloma') || nbs[0];
        setActiveNeighborhoodId(fallback.id);
        setActiveNeighborhood(fallback);
      }
      onRefresh();
    }
  };

  const currentRole = getUserRoleInNeighborhood(currentUser.id, activeNeighborhood.id);

  // Main navigation items
  const navItems = [
    { id: 'feed', label: 'Community Feed', icon: Rss },
    { id: 'marketplace', label: 'Local Marketplace', icon: ShoppingBag },
    { id: 'events', label: 'Neighborhood Events', icon: Calendar },
    { id: 'members', label: 'Locality Members', icon: Users },
    { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
  ];

  const renderSidebarContent = (isMobile: boolean) => {
    return (
      <div className="flex flex-col justify-between h-full">
        {/* Top Section */}
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-4 px-2 md:pl-[23px] md:pr-0 md:group-hover/sidebar:px-5 mb-2 md:mb-6 h-8 overflow-hidden shrink-0 cursor-pointer">
            <Menu className="text-[#1A1A1A] shrink-0 w-[16px] h-[16px] md:w-[18px] md:h-[18px] stroke-[2]" />
            <span className={`font-serif italic font-bold text-sm md:text-base text-[#1A1A1A] tracking-wider transition-all duration-300 ease-in-out ${
              isMobile 
                ? 'opacity-100 max-w-full' 
                : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden whitespace-nowrap'
            }`}>
              ApnaArea
            </span>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <span className={`text-[9px] font-bold text-[#1A1A1A] uppercase tracking-widest px-2 md:pl-[23px] md:pr-0 md:group-hover/sidebar:px-5 block transition-all duration-300 ${
              isMobile 
                ? 'opacity-100 max-w-full' 
                : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden whitespace-nowrap'
            }`}>
              Menu
            </span>
            <nav className="space-y-1" id="nav-menu">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile && onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-start gap-4 px-3 py-2.5 md:pl-[23px] md:pr-0 md:group-hover/sidebar:px-5 md:py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-none group ${
                      isSelected 
                        ? 'bg-[#1A1A1A] text-white shadow-xs' 
                        : 'text-[#1A1A1A] hover:text-[#1A1A1A] hover:bg-[#f3f3f1] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <Icon className="stroke-[1.5] shrink-0 w-[14px] h-[14px] md:w-[18px] md:h-[18px] transition-transform duration-200 ease-out group-hover:scale-110" />
                    <span className={`transition-all duration-300 ease-in-out ${
                      isMobile 
                        ? 'opacity-100 max-w-full' 
                        : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden whitespace-nowrap'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Moderation Panel (visible if active user is a moderator of current nb) */}
              {currentRole === NeighborhoodRole.MODERATOR && (
                <button
                  onClick={() => {
                    setActiveTab('moderation');
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-start gap-4 px-3 py-2.5 md:pl-[23px] md:pr-0 md:group-hover/sidebar:px-5 md:py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-none group ${
                    activeTab === 'moderation' 
                      ? 'bg-[#1A1A1A] text-white border-l-4 border-red-600 shadow-xs' 
                      : 'text-red-700 hover:bg-red-50/50 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  id="btn-nav-moderation"
                >
                  <ShieldAlert className="stroke-[1.5] shrink-0 w-[14px] h-[14px] md:w-[18px] md:h-[18px] transition-transform duration-200 ease-out group-hover:scale-110" />
                  <span className={`transition-all duration-300 ease-in-out ${
                    isMobile 
                      ? 'opacity-100 max-w-full' 
                      : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden whitespace-nowrap'
                  }`}>
                    Moderation Center
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Neighborhood Manager Section */}
          <div className="space-y-3.5 border-t border-[#e1e1de] pt-4">
            <div className="flex items-center justify-between px-2 md:pl-[23px] md:pr-0 md:group-hover/sidebar:px-5 gap-2">
              <span className={`text-[9px] font-bold text-[#1A1A1A] uppercase tracking-widest transition-all duration-300 ${
                isMobile 
                  ? 'opacity-100 max-w-full' 
                  : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden whitespace-nowrap'
              }`}>
                My Localities
              </span>
              <div className={`flex items-center gap-1.5 shrink-0 transition-all duration-300 ${
                isMobile 
                  ? 'opacity-100 max-w-full' 
                  : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden'
              }`}>
                <button 
                  onClick={() => setShowSearchModal(true)}
                  title="Search & Join Locality"
                  className="p-1.5 bg-white border border-[#e1e1de] hover:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-[#1A1A1A] hover:text-white rounded-none"
                  id="btn-search-nb-pincode"
                >
                  <Search size={11} className="stroke-[2.5]" />
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  title="Create Neighborhood"
                  className="p-1.5 bg-white border border-[#e1e1de] hover:border-[#1A1A1A] text-[#1A1A1A] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-[#1A1A1A] hover:text-white rounded-none"
                  id="btn-create-nb"
                >
                  <Plus size={11} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1" id="joined-neighborhoods-list">
              {joinedNbs.map((nb) => {
                const isActive = nb.id === activeNeighborhood.id;
                const isMod = getUserRoleInNeighborhood(currentUser.id, nb.id) === NeighborhoodRole.MODERATOR;
                return (
                  <div 
                    key={nb.id}
                    className={`flex items-center p-2 md:py-2 md:pl-[18px] md:pr-0 md:group-hover/sidebar:px-3 border group transition-all duration-200 text-xs font-medium cursor-pointer rounded-none relative overflow-hidden justify-start ${
                      isActive 
                        ? 'border-[#1A1A1A] bg-[#f3f3f1] shadow-xs' 
                        : 'border-[#e1e1de] hover:border-[#1A1A1A] bg-white hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    onClick={() => {
                      handleSelectNeighborhood(nb);
                      if (isMobile && onClose) onClose();
                    }}
                  >
                    {/* Initial Letter block/avatar for collapsed view */}
                    <div className={`w-7 h-7 flex items-center justify-center border text-[10px] font-bold font-serif italic uppercase shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                        : 'bg-white text-[#1A1A1A] border-[#e1e1de] group-hover:scale-105'
                    }`}>
                      {nb.name.charAt(0)}
                    </div>

                    {/* Expanded content area */}
                    <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
                      isMobile 
                        ? 'opacity-100 max-w-full ml-2.5 flex items-center justify-between' 
                        : 'opacity-100 max-w-full md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-xs md:group-hover/sidebar:opacity-100 overflow-hidden whitespace-nowrap ml-2.5 flex items-center justify-between'
                    }`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[#1A1A1A] font-serif font-semibold italic truncate block max-w-[110px]">
                            {nb.name}
                          </span>
                          {isMod && (
                            <span className="bg-white border border-[#1A1A1A] text-[#1A1A1A] font-medium text-[8px] px-1 shrink-0 uppercase tracking-wider">
                              Mod
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#1A1A1A]/60 block font-mono">{nb.pincode}</span>
                      </div>
                      
                      {/* Leave button - triggers moderator succession logic */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveNeighborhood(nb.id);
                        }}
                        title="Leave neighborhood"
                        className="text-[#1A1A1A]/50 hover:text-red-600 p-1.5 rounded-none hover:bg-[#f3f3f1] transition-all cursor-pointer shrink-0 ml-1"
                      >
                        <LogOut size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR PLACEHOLDER & PANEL */}
      <div className="hidden md:block w-16 h-screen shrink-0 font-sans" id="app-sidebar-desktop">
        <div className="fixed top-0 left-0 h-screen z-40 bg-[#FDFDFB] border-r border-[#e1e1de] py-6 w-16 hover:w-64 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto overflow-x-hidden shadow-xs group/sidebar">
          {renderSidebarContent(false)}
        </div>
      </div>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs z-50 md:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ translateX: '-100%' }}
              animate={{ translateX: 0 }}
              exit={{ translateX: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#FDFDFB] z-50 p-6 border-r border-[#e1e1de] flex flex-col justify-between overflow-y-auto md:hidden group/sidebar"
              id="app-sidebar-mobile"
            >
              {/* Close button at top right */}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={onClose} 
                  className="p-1.5 hover:bg-[#f3f3f1] border border-[#e1e1de] text-[#1A1A1A] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              {renderSidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE NEIGHBORHOOD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-create-neighborhood">
          <div className="bg-white max-w-sm w-full p-6 border border-[#1A1A1A] relative animate-in fade-in zoom-in-95 duration-150 rounded-none">
            <h3 className="font-serif italic font-semibold text-lg text-[#1A1A1A]">Create New Neighborhood</h3>
            <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 font-serif italic">Define your local locality. You will automatically join as the first Moderator!</p>

            <form onSubmit={handleCreateNeighborhood} className="mt-4 space-y-3.5" id="form-create-nb">
              <div>
                <label className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-1">Neighborhood Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Miraloma Park, Indiranagar 2nd Stage"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs border border-[#e1e1de] p-2.5 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-1">Pincode (ZIP)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 110016"
                    value={newPincode} 
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full text-xs border border-[#e1e1de] p-2.5 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-[9px] text-[#1A1A1A] bg-[#f3f3f1] p-2 border border-[#e1e1de] leading-normal block font-serif italic text-center w-full">
                    1 account per mobile number
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-1">Short Description</label>
                <textarea 
                  placeholder="Describe your locality borders or society profile..."
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs border border-[#e1e1de] p-2.5 h-16 resize-none focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#e1e1de]">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/75 hover:bg-[#f3f3f1] cursor-pointer rounded-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-none"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH & JOIN NEIGHBORHOOD MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-search-neighborhood">
          <div className="bg-white max-w-sm w-full p-6 border border-[#1A1A1A] relative animate-in fade-in zoom-in-95 duration-150 rounded-none">
            <h3 className="font-serif italic font-semibold text-lg text-[#1A1A1A]">Search & Join Localities</h3>
            <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 font-serif italic">Find nearby neighborhoods by typing their name or pincode.</p>

            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-[#1A1A1A]/50" />
                <input 
                  type="text" 
                  placeholder="Type name or pincode (e.g. 560038, Indiranagar)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full text-xs border border-[#e1e1de] pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto" id="search-results-list">
                {searchQuery && searchResult.length === 0 && (
                  <p className="text-center text-[11px] text-[#1A1A1A]/60 py-4 font-serif italic">No neighborhoods match your search query.</p>
                )}
                {!searchQuery && (
                  <p className="text-center text-[10px] text-[#1A1A1A]/50 py-2 font-serif italic">Type above to see existing areas...</p>
                )}
                {searchResult.map((nb) => {
                  const isJoined = joinedNbIds.includes(nb.id);
                  return (
                    <div key={nb.id} className="p-2.5 border border-[#e1e1de] bg-[#fdfdfb] flex items-center justify-between gap-3 text-xs rounded-none">
                      <div className="min-w-0">
                        <span className="font-serif font-semibold italic text-[#1A1A1A] block truncate">{nb.name}</span>
                        <span className="text-[9px] text-[#1A1A1A]/60 block font-mono">Pincode: {nb.pincode}</span>
                      </div>
                      
                      {isJoined ? (
                        <span className="text-[9px] text-[#1A1A1A] bg-[#f3f3f1] px-2 py-1 font-semibold border border-[#e1e1de] uppercase tracking-wider">Joined</span>
                      ) : (
                        <button
                          onClick={() => handleJoinNeighborhood(nb)}
                          className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors rounded-none"
                        >
                          Join <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t border-[#e1e1de]">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                    setSearchResult([]);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/75 hover:bg-[#f3f3f1] cursor-pointer rounded-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
