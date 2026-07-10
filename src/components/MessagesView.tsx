import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ShieldAlert, Users, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { User, Conversation, Message } from '../types';
import { 
  getConversations, 
  getMessages, 
  getUsers, 
  addDirectMessage, 
  isUserBlocked,
  isBlockerOf,
  saveMessages
} from '../data/store';

interface MessagesViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function MessagesView({ currentUser, onRefresh }: MessagesViewProps) {
  const [activeConvoId, setActiveConvoId] = useState<string | null>(() => {
    const saved = localStorage.getItem('apnaarea_active_convo_id');
    localStorage.removeItem('apnaarea_active_convo_id');
    return saved;
  });
  const [messageText, setMessageText] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);

  // Load all users, conversations, and messages
  const users = getUsers();
  const allConvos = getConversations();
  const allMessages = getMessages();

  // Filter conversations for current user
  const myConvos = allConvos.filter(
    c => c.initiatorId === currentUser.id || c.recipientId === currentUser.id
  ).map(c => {
    const otherUserId = c.initiatorId === currentUser.id ? c.recipientId : c.initiatorId;
    const otherUser = users.find(u => u.id === otherUserId);
    
    // Get messages for this conversation
    const convoMessages = allMessages.filter(m => m.conversationId === c.id);
    const lastMessage = convoMessages[convoMessages.length - 1];
    
    // Check block rule
    const blocked = isUserBlocked(c.initiatorId, c.recipientId);

    return {
      conversation: c,
      otherUser,
      lastMessage,
      blocked,
      unreads: convoMessages.filter(m => m.senderId !== currentUser.id && !m.isRead).length
    };
  });

  // Scroll to bottom of message list on active conversation change or new message
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeConvoId, refreshTrigger, allMessages.length]);

  const activeInfo = myConvos.find(mc => mc.conversation.id === activeConvoId);
  const activeConvoMessages = activeConvoId 
    ? allMessages.filter(m => m.conversationId === activeConvoId)
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvoId || !messageText.trim()) return;

    try {
      addDirectMessage(activeConvoId, currentUser.id, messageText.trim());
      setMessageText('');
      setRefreshTrigger(prev => prev + 1);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  return (
    <div className="flex-1 bg-white border border-[#e1e1de] rounded-none flex flex-col md:flex-row h-[600px] font-sans overflow-hidden" id="messages-view-root">
      
      {/* Conversations List Panel */}
      <div className={`w-full md:w-80 border-r border-[#e1e1de] flex flex-col h-full bg-[#fdfdfb] shrink-0 ${activeConvoId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#e1e1de] bg-white">
          <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <MessageSquare size={16} />
            Direct Messages
          </h3>
          <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5">Civil, identity-verified conversations in your locality.</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#e1e1de]/65">
          {myConvos.length === 0 ? (
            <div className="p-6 text-center text-[#1A1A1A]/50 text-xs italic font-serif">
              No active conversations yet. Go to 'Locality Members' to start a direct chat!
            </div>
          ) : (
            myConvos.map(({ conversation, otherUser, lastMessage, blocked, unreads }) => {
              const isSelected = conversation.id === activeConvoId;
              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setActiveConvoId(conversation.id);
                    // Mark messages as read
                    convoMessagesAsRead(conversation.id);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors rounded-none hover:bg-[#f3f3f1] cursor-pointer ${
                    isSelected ? 'bg-[#f3f3f1] border-l-2 border-[#1A1A1A]' : 'bg-transparent'
                  }`}
                >
                  <img
                    src={otherUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-none object-cover border border-[#e1e1de]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif italic font-bold text-xs text-[#1A1A1A] truncate">{otherUser.name}</span>
                      {lastMessage && (
                        <span className="text-[8px] text-[#1A1A1A]/40 font-mono shrink-0">
                          {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[11px] text-[#1A1A1A]/65 truncate flex-1">
                        {blocked ? (
                          <span className="text-red-600 font-semibold flex items-center gap-0.5">
                            <ShieldAlert size={10} /> Conversation Frozen
                          </span>
                        ) : lastMessage ? (
                          lastMessage.content
                        ) : (
                          'No messages yet.'
                        )}
                      </p>
                      {unreads > 0 && !blocked && (
                        <span className="bg-[#1A1A1A] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-none">
                          {unreads}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat History Panel */}
      <div className={`flex-1 flex flex-col h-full bg-white relative ${activeConvoId ? 'flex' : 'hidden md:flex'}`}>
        {activeInfo && activeInfo.otherUser ? (
          <>
            {/* Active chat header */}
            <div className="p-4 border-b border-[#e1e1de] bg-[#fdfdfb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveConvoId(null)}
                  className="md:hidden p-1.5 hover:bg-[#f3f3f1] border border-[#e1e1de] text-[#1A1A1A] mr-1 cursor-pointer"
                  title="Back to Chats"
                >
                  <ArrowLeft size={14} />
                </button>

                <img
                  src={activeInfo.otherUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                  alt={activeInfo.otherUser.name}
                  className="w-9 h-9 rounded-none object-cover border border-[#e1e1de]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-serif italic font-bold text-xs text-[#1A1A1A]">{activeInfo.otherUser.name}</h4>
                  <p className="text-[9px] text-[#1A1A1A]/60 font-serif italic">Verified Resident</p>
                </div>
              </div>

              {activeInfo.blocked && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert size={11} />
                  Frozen
                </div>
              )}
            </div>

            {/* Message bubbles list */}
            <div ref={listRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF9F6]">
              {activeConvoMessages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 text-xs border rounded-none shadow-xs ${
                        isMine
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white text-[#1A1A1A] border-[#e1e1de]'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex justify-end mt-1">
                        <span className={`text-[8px] font-mono ${isMine ? 'text-white/60' : 'text-[#1A1A1A]/40'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat footer text composer */}
            <div className="p-3 border-t border-[#e1e1de] bg-white">
              {activeInfo.blocked ? (
                <div className="bg-red-50 border border-red-200 p-2.5 flex items-center gap-2 text-[10px] text-red-700 font-serif italic">
                  <ShieldAlert size={14} className="shrink-0 text-red-600" />
                  <span>This conversation is frozen because a block exists between you and {activeInfo.otherUser.name}. Unblock to continue chatting.</span>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Write a civil message to ${activeInfo.otherUser.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 text-xs border border-[#e1e1de] p-2.5 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 flex items-center justify-center cursor-pointer transition-colors rounded-none"
                  >
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9F6]">
            <MessageSquare size={36} className="text-[#1A1A1A]/30 mb-2" />
            <h4 className="font-serif italic font-bold text-sm text-[#1A1A1A]">No Conversation Selected</h4>
            <p className="text-[11px] text-[#1A1A1A]/60 max-w-xs mt-1">
              Select an active conversation from the sidebar panel, or head over to the verified resident roster to initiate a connection.
            </p>
          </div>
        )}
      </div>

    </div>
  );

  function convoMessagesAsRead(convoId: string) {
    const allMsgs = getMessages();
    let updated = false;
    allMsgs.forEach(m => {
      if (m.conversationId === convoId && m.senderId !== currentUser.id && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    });
    if (updated) {
      saveMessages(allMsgs);
      onRefresh();
    }
  }
}
