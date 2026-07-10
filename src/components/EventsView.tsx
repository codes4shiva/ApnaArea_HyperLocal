import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  X,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Neighborhood, Event, EventRsvp, NeighborhoodRole, PlatformRole } from '../types';
import { getEvents, saveEvents, getRSVPs, saveRSVPs, getUserRoleInNeighborhood } from '../data/store';

interface EventsViewProps {
  currentUser: User;
  activeNeighborhood: Neighborhood;
  searchQuery: string;
  onRefresh: () => void;
}

export default function EventsView({ 
  currentUser, 
  activeNeighborhood, 
  searchQuery,
  onRefresh 
}: EventsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');

  const events = getEvents()
    .filter(e => e.neighborhoodId === activeNeighborhood.id)
    .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const rsvps = getRSVPs();
  const userRole = getUserRoleInNeighborhood(currentUser.id, activeNeighborhood.id);
  const isModerator = userRole === NeighborhoodRole.MODERATOR;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime.trim() || !venue.trim()) return;

    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      neighborhoodId: activeNeighborhood.id,
      userId: currentUser.id,
      authorName: currentUser.name,
      title,
      description: desc,
      dateTime,
      venue,
      createdAt: new Date().toISOString()
    };

    // Save event
    const currentEvents = getEvents();
    currentEvents.unshift(newEvent);
    saveEvents(currentEvents);

    // Auto RSVP as GOING for creator
    const currentRSVPs = getRSVPs();
    currentRSVPs.push({
      id: `rsvp-${Date.now()}`,
      eventId: newEvent.id,
      userId: currentUser.id,
      response: 'GOING'
    });
    saveRSVPs(currentRSVPs);

    // Reset
    setTitle('');
    setDesc('');
    setDateTime('');
    setVenue('');
    setShowAddModal(false);
    onRefresh();
  };

  const handleDeleteEvent = (id: string) => {
    const currentEvents = getEvents();
    const filtered = currentEvents.filter(e => e.id !== id);
    saveEvents(filtered);

    // Clean up RSVPs
    const currentRSVPs = getRSVPs();
    const filteredRsvps = currentRSVPs.filter(r => r.eventId !== id);
    saveRSVPs(filteredRsvps);

    onRefresh();
  };

  const handleToggleRsvp = (eventId: string, response: 'GOING' | 'NOT_GOING') => {
    const currentRSVPs = getRSVPs();
    const idx = currentRSVPs.findIndex(r => r.eventId === eventId && r.userId === currentUser.id);

    if (idx !== -1) {
      if (currentRSVPs[idx].response === response) {
        // If clicking same answer, delete RSVP
        currentRSVPs.splice(idx, 1);
      } else {
        // Switch answer
        currentRSVPs[idx].response = response;
      }
    } else {
      // Create new RSVP
      currentRSVPs.push({
        id: `rsvp-${Date.now()}`,
        eventId,
        userId: currentUser.id,
        response
      });
    }

    saveRSVPs(currentRSVPs);
    onRefresh();
  };

  return (
    <div className="flex-1 space-y-6 font-sans" id="events-root">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-2xl border border-violet-100/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <Calendar className="text-violet-600" size={20} />
            Neighborhood Events
          </h3>
          <p className="text-xs text-slate-500 mt-1">Discover cultural festivals, local park meetings, welfare assemblies, and volunteering initiatives happening right here.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-violet-500/10 transition-colors shrink-0"
          id="btn-add-event-trigger"
        >
          <Plus size={14} className="stroke-[2.5]" />
          Schedule Event
        </button>
      </div>

      {/* EVENTS CARD BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="events-grid">
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center col-span-full">
            <CalendarCheck size={36} className="mx-auto text-slate-300 animate-pulse" />
            <h4 className="font-bold text-sm text-slate-700 mt-2">Zero upcoming events</h4>
            <p className="text-xs text-slate-400 mt-1">Planning a sports meetup or clean-up drive? Click "Schedule Event" to alert neighbors!</p>
          </div>
        ) : (
          events.map((evt) => {
            const isOwnEvent = evt.userId === currentUser.id;
            
            // Calculate RSVPs count
            const eventRsvps = rsvps.filter(r => r.eventId === evt.id);
            const goingCount = eventRsvps.filter(r => r.response === 'GOING').length;
            const userRsvp = eventRsvps.find(r => r.userId === currentUser.id);

            const eventDate = new Date(evt.dateTime);
            const formattedDate = eventDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const formattedTime = eventDate.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-violet-50 text-violet-600 rounded-xl px-3 py-2 text-center shrink-0 border border-violet-100/50">
                      <span className="text-[10px] uppercase font-bold block leading-none">
                        {eventDate.toLocaleString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-base font-bold font-display block leading-none mt-1">
                        {eventDate.getDate()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1">
                        {evt.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Hosted by {evt.authorName}
                      </span>
                    </div>

                    {/* Delete Event (Own or Moderator) */}
                    {(isOwnEvent || isModerator) && (
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="Cancel Event"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Date, Time, Location details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/80 space-y-2 text-[10px] font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-violet-500" />
                      <span>{formattedDate} at {formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-violet-500" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <Users size={12} className="text-slate-400" />
                    <span>{goingCount} resident{goingCount !== 1 ? 's' : ''} going</span>
                  </div>

                  {/* Interactive RSVP buttons */}
                  <div className="flex items-center gap-1.5 shrink-0" id={`rsvp-actions-${evt.id}`}>
                    <button
                      onClick={() => handleToggleRsvp(evt.id, 'GOING')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        userRsvp?.response === 'GOING'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100/50'
                      }`}
                    >
                      {userRsvp?.response === 'GOING' && <Check size={10} />}
                      Going
                    </button>

                    <button
                      onClick={() => handleToggleRsvp(evt.id, 'NOT_GOING')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        userRsvp?.response === 'NOT_GOING'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100/50'
                      }`}
                    >
                      Not Going
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* SCHEDULE EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-event">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-display font-bold text-base text-slate-800">Schedule Event</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Invite your verified neighbors to local cultural or Welfare activities.</p>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3.5" id="form-add-event">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Society General Body Meet, Chai Meetup"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={dateTime} 
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Venue Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Central Park Gazebo, Block C Community Hall"
                  value={venue} 
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Description</label>
                <textarea 
                  placeholder="Describe the schedule, catering, or details..."
                  value={desc} 
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 h-20 resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
