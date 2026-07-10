import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface ChatOverlayProps {
  currentUser: User;
}

export default function ChatOverlay({ currentUser }: ChatOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: `Hi ${currentUser.name.split(' ')[0]}! I'm AreaDada, your ApnaArea neighborhood guide. 😊\n\nI can help you navigate our platform! Try asking:\n• How does the 5-report auto-hide system work?\n• How do I list things on the Marketplace?\n• Can anyone promote someone to Moderator?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Map message history for Gemini backend
      const history = messages
        .filter(m => m.id !== 'msg-init-1') // Skip greeting to save prompt length or keep standard
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history
        })
      });

      if (!response.ok) {
        throw new Error('API communication failed');
      }

      const data = await response.json();
      
      const replyMsg: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'assistant',
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, replyMsg]);
    } catch (err) {
      console.error('Error fetching AI response:', err);
      // Friendly fallback reply
      const fallbackMsg: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'assistant',
        text: "Namaste! It seems my main brain is offline. But as your trusted neighbor, I can tell you that ApnaArea is built to make neighborhoods safer and more connected. You can check out local events, post on the community feed, or list items in the marketplace! Let me know if you want to try switching accounts in the header to see moderator rules in action! 🙏",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="support-chat-root">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[480px]"
          >
            {/* Header - Replicating Image 1's Support Chat header styling */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-semibold">
                  <Bot size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Support chat</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-400 font-medium">AreaDada is active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                id="btn-close-chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                    <div className={`text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-violet-200' : 'text-slate-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 rounded-2xl rounded-tl-none px-4 py-3 text-xs border border-slate-100 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 bg-white" id="form-chat-input">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your message..."
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                id="btn-send-chat"
              >
                <Send size={14} className="stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button - Match Image 1 purple accents */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg cursor-pointer border border-violet-500/10"
        id="btn-chat-trigger"
      >
        {isOpen ? <X size={20} className="stroke-[2.5]" /> : <MessageSquare size={20} className="stroke-[2.5]" />}
      </motion.button>
    </div>
  );
}
