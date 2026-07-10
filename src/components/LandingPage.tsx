import React from 'react';
import { 
  Shield, 
  Users, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  UserCheck, 
  ExternalLink
} from 'lucide-react';
import { User } from '../types';
import { getUsers, setCurrentUserId } from '../data/store';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const allUsers = getUsers();

  // Find specific role-players from seed data
  const moderatorUser = allUsers.find(u => u.id === 'user-shivanshu') || allUsers[0];
  const residentUser = allUsers.find(u => u.id === 'user-arjun') || allUsers[2];
  const sellerUser = allUsers.find(u => u.id === 'user-dianne') || allUsers[4];

  const handleQuickLogin = (userId: string) => {
    setCurrentUserId(userId);
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-slate-800 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-800" id="apnaarea-landing">
      {/* LANDING HEADER */}
      <header className="border-b border-[#e1e1de] bg-[#FDFDFB]/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1A1A1A] flex items-center justify-center text-white font-serif italic font-bold text-xl">
              A
            </div>
            <div>
              <span className="font-serif italic font-bold text-lg tracking-tight text-[#1A1A1A]">ApnaArea</span>
              <span className="text-[9px] text-[#1A1A1A] font-medium block -mt-1.5 tracking-widest uppercase">Hyperlocal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleQuickLogin(moderatorUser.id)}
              className="text-xs bg-[#1A1A1A] text-white px-4 py-2 hover:bg-[#333333] transition-all font-medium cursor-pointer flex items-center gap-1.5"
            >
              Enter Platform <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-4 py-16 md:py-24 bg-gradient-to-b from-[#fbfbfa] to-[#FDFDFB] border-b border-[#e1e1de]/50">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="font-serif italic text-4xl md:text-6xl font-bold text-[#1A1A1A] leading-tight tracking-tight mb-6">
            The digital town square built for <span className="underline decoration-violet-500 decoration-wavy underline-offset-8">verified neighbors</span>.
          </h1>
          
          <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            ApnaArea is a complete hyperlocal community ecosystem. It isolates discussions, local marketplaces, and emergency alerts by pincode, securing civil interactions through strict, decentralized self-moderation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#login-profiles" 
              className="w-full sm:w-auto bg-[#1A1A1A] text-white px-8 py-3.5 text-xs font-semibold tracking-wide uppercase hover:bg-[#333333] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              Choose Verified Profile <ArrowRight size={14} />
            </a>
            <button 
              onClick={() => handleQuickLogin(residentUser.id)}
              className="w-full sm:w-auto bg-white border border-[#e1e1de] text-slate-700 px-8 py-3.5 text-xs font-semibold tracking-wide uppercase hover:bg-[#f3f3f1] hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Direct Entry (Resident)
            </button>
          </div>
        </div>
      </section>

      {/* VERIFIED PROFILES SECTION */}
      <section id="login-profiles" className="px-4 py-16 md:py-20 bg-slate-50/50 border-b border-[#e1e1de]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif italic text-3xl font-bold text-[#1A1A1A] mb-3">
              Select Your Neighborhood Account
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto font-sans">
              ApnaArea is secured by strict verification scopes. Choose an active local profile below to instantly log in and experience the town square with its specific privileges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* MODERATOR CARD */}
            <div className="bg-white border-2 border-violet-600 shadow-md flex flex-col justify-between p-6 transition-all hover:translate-y-[-2px] relative">
              <div className="absolute top-3 right-3 bg-violet-100 text-violet-800 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                Community Moderator
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-500 shrink-0">
                    <img 
                      src={moderatorUser.avatarUrl} 
                      alt={moderatorUser.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] leading-tight">{moderatorUser.name}</h3>
                    <span className="text-[10px] font-mono text-violet-700 font-semibold bg-violet-50 px-1.5 py-0.5 border border-violet-100">MODERATOR</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6 font-sans">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-violet-600 shrink-0 mt-0.5" />
                    <span>Accesses the restricted <strong>Moderation Panel</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-violet-600 shrink-0 mt-0.5" />
                    <span>Inspect and action flagged posts, comments, and reports.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-violet-600 shrink-0 mt-0.5" />
                    <span>Post official community safety broadcasts and notices.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleQuickLogin(moderatorUser.id)}
                className="w-full bg-violet-600 text-white text-xs font-bold py-2.5 hover:bg-violet-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
              >
                Log In as Moderator <ArrowRight size={13} />
              </button>
            </div>

            {/* RESIDENT CARD */}
            <div className="bg-white border border-[#e1e1de] shadow-sm flex flex-col justify-between p-6 transition-all hover:border-slate-400 hover:translate-y-[-2px] relative">
              <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                Verified Resident
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#e1e1de] shrink-0">
                    <img 
                      src={residentUser.avatarUrl} 
                      alt={residentUser.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] leading-tight">{residentUser.name}</h3>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 border border-emerald-100">RESIDENT / USER</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6 font-sans">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Create rich text community posts & photo attachments.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>RSVP to upcoming events and converse with neighbors.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Submit content flag reports to initiate auto-hide protocol.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleQuickLogin(residentUser.id)}
                className="w-full bg-[#1A1A1A] text-white text-xs font-bold py-2.5 hover:bg-[#333333] transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
              >
                Log In as Resident <ArrowRight size={13} />
              </button>
            </div>

            {/* SELLER CARD */}
            <div className="bg-white border border-[#e1e1de] shadow-sm flex flex-col justify-between p-6 transition-all hover:border-slate-400 hover:translate-y-[-2px] relative">
              <div className="absolute top-3 right-3 bg-indigo-100 text-indigo-800 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                Local Merchant
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#e1e1de] shrink-0">
                    <img 
                      src={sellerUser.avatarUrl} 
                      alt={sellerUser.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] leading-tight">{sellerUser.name}</h3>
                    <span className="text-[10px] font-mono text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 border border-indigo-100">LOCAL SELLER</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-6 font-sans">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>Accesses the <strong>Marketplace Panel</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>List pre-loved devices (e.g., Apple iPad Pro) with full details.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>Handle direct inquiries from community members.</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleQuickLogin(sellerUser.id)}
                className="w-full bg-[#1A1A1A] text-white text-xs font-bold py-2.5 hover:bg-[#333333] transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
              >
                Log In as Seller <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED FEATURES SECTIONS */}
      <section className="px-4 py-16 max-w-5xl mx-auto font-sans">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold uppercase text-violet-600 tracking-wider">Core Architectural pillars</span>
          <h2 className="font-serif italic text-3xl font-bold text-[#1A1A1A] mt-2">
            Engineered for Civil Hyperlocal Engagement
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="border-t border-[#e1e1de] pt-6">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white mb-4">
              <UserCheck size={18} />
            </div>
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] mb-2">Verified Phone Identity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every user is mapped to a real, verified phone number. This keeps conversations accountable and eliminates bot-spam or untraceable trolling.
            </p>
          </div>

          <div className="border-t border-[#e1e1de] pt-6">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white mb-4">
              <Shield size={18} />
            </div>
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] mb-2">5-Report Auto-Hide Protocol</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decentralized moderation. If any post receives 5 flags, it is hidden from public view instantly and queued in the Moderation Panel.
            </p>
          </div>

          <div className="border-t border-[#e1e1de] pt-6">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white mb-4">
              <MapPin size={18} />
            </div>
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] mb-2">Neighborhood Pincode Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discussions and marketplace products stay relevant by isolating feeds completely to neighboring pincodes. Restricts cross-city noise.
            </p>
          </div>

          <div className="border-t border-[#e1e1de] pt-6">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white mb-4">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] mb-2">Direct Negotiation Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Secure internal chatting between local members. Ideal for safe meetups, item inspections, and coordinating community RSVPs.
            </p>
          </div>
        </div>
      </section>

      {/* LANDING FOOTER */}
      <footer className="bg-white border-t border-[#e1e1de]/60 py-8 text-center text-[11px] text-slate-400 font-medium">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-[#1A1A1A] flex items-center justify-center text-white font-serif italic font-bold text-xs">
              A
            </div>
            <span>ApnaArea Hyperlocal Network</span>
          </div>
          <div>
            <span>ApnaArea &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
