import React, { useState, useRef } from 'react';
import { 
  Tag, 
  ShoppingBag, 
  PhoneCall, 
  Trash2, 
  Plus, 
  CheckCircle, 
  X, 
  ChevronRight,
  Sparkles,
  PackageCheck,
  Upload,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Neighborhood, Listing, NeighborhoodRole, PlatformRole } from '../types';
import { getListings, saveListings, getUserRoleInNeighborhood, getOrCreateConversation } from '../data/store';

interface MarketplaceViewProps {
  currentUser: User;
  activeNeighborhood: Neighborhood;
  searchQuery: string;
  onRefresh: () => void;
  setActiveTab?: (tab: string) => void;
  onViewProfile?: (userId: string) => void;
}

const PRESET_LISTING_IMAGES = [
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400', // iPad
  'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=400', // Boots
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400', // Teapot
  'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400', // Chair
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400', // Electronics
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'  // Books
];

export default function MarketplaceView({ 
  currentUser, 
  activeNeighborhood, 
  searchQuery,
  onRefresh,
  setActiveTab,
  onViewProfile
}: MarketplaceViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Listing | null>(null);

  const handleStartChat = (targetId: string) => {
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

  // Form states
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [selectedImg, setSelectedImg] = useState<string>(PRESET_LISTING_IMAGES[0]);

  // Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const imgUrl = uploadEvent.target.result as string;
          setCustomImages(prev => [imgUrl, ...prev]);
          setSelectedImg(imgUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const imgUrl = uploadEvent.target.result as string;
          setCustomImages(prev => [imgUrl, ...prev]);
          setSelectedImg(imgUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const listings = getListings()
    .filter(l => l.neighborhoodId === activeNeighborhood.id)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    const newListing: Listing = {
      id: `list-${Date.now()}`,
      neighborhoodId: activeNeighborhood.id,
      userId: currentUser.id,
      authorName: currentUser.name,
      authorPhone: currentUser.phone,
      title,
      description: desc,
      price: parseFloat(price),
      category,
      image: selectedImg,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const currentListings = getListings();
    currentListings.unshift(newListing);
    saveListings(currentListings);

    // Reset
    setTitle('');
    setDesc('');
    setPrice('');
    setCategory('Electronics');
    setShowAddModal(false);
    onRefresh();
  };

  const handleDeleteListing = (id: string) => {
    const currentListings = getListings();
    const item = currentListings.find(l => l.id === id);
    if (!item || item.userId !== currentUser.id) return; // Only creator can delete
    const filtered = currentListings.filter(l => l.id !== id);
    saveListings(filtered);
    onRefresh();
  };

  const handleMarkAsSold = (id: string) => {
    const currentListings = getListings();
    const idx = currentListings.findIndex(l => l.id === id);
    if (idx !== -1) {
      currentListings[idx].status = 'SOLD';
      saveListings(currentListings);
    }
    onRefresh();
  };

  return (
    <div className="flex-1 space-y-6 font-sans" id="marketplace-root">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-2xl border border-violet-100/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-violet-600" size={20} />
            Neighborhood Marketplace
          </h3>
          <p className="text-xs text-slate-500 mt-1">Buy and sell preloved goods securely within {activeNeighborhood.name}. Zero delivery cost, 100% trust.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-violet-500/10 transition-colors shrink-0"
          id="btn-add-listing-trigger"
        >
          <Plus size={14} className="stroke-[2.5]" />
          Sell an Item
        </button>
      </div>

      {/* PRODUCT GRID - Matching Image 1 styling exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" id="marketplace-grid">
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center col-span-full">
            <PackageCheck size={36} className="mx-auto text-slate-300 animate-pulse" />
            <h4 className="font-bold text-sm text-slate-700 mt-2">No active listings</h4>
            <p className="text-xs text-slate-400 mt-1">Have something lying around? Click "Sell an Item" to list it in {activeNeighborhood.name}!</p>
          </div>
        ) : (
          listings.map((item) => {
            const isOwnListing = item.userId === currentUser.id;
            const isSold = item.status === 'SOLD';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-2xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all flex flex-col group relative ${
                  isSold ? 'opacity-70' : ''
                }`}
              >
                {/* Image Section */}
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-50 mb-3 border border-slate-50">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag size={32} />
                    </div>
                  )}

                  {/* SOLD Banner Overlay - Matches Image 1 */}
                  {isSold && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-500 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-rose-400/20">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  {/* Category Tag */}
                  <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-700 font-bold text-[9px] px-2 py-0.8 rounded-lg shadow-sm border border-slate-100/50">
                    {item.category}
                  </span>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-semibold text-xs text-slate-800 line-clamp-1 group-hover:text-violet-600 transition-colors">
                        {item.title}
                      </h4>
                      <span className="font-mono font-bold text-xs text-violet-600 whitespace-nowrap shrink-0">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Seller info & actions */}
                  <div className="border-t border-slate-50 pt-2.5 mt-3 flex items-center justify-between">
                    <div 
                      onClick={() => onViewProfile && onViewProfile(item.userId)}
                      className="cursor-pointer group"
                      title={`View ${item.authorName}'s Profile`}
                    >
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none group-hover:text-slate-500">Listed by</span>
                      <span className="text-[10px] text-slate-700 font-bold block mt-0.5 truncate max-w-[120px] group-hover:underline group-hover:text-violet-700 transition-colors">{item.authorName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Delete actions (Only own listing) */}
                      {isOwnListing && (
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          title="Delete Listing"
                          className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      {/* Sold transition toggler for owner */}
                      {isOwnListing && !isSold && (
                        <button
                          onClick={() => handleMarkAsSold(item.id)}
                          className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                        >
                          <CheckCircle size={10} /> Sold
                        </button>
                      )}

                      {/* Contact button */}
                      {!isOwnListing && (
                        <button
                          onClick={() => setSelectedSeller(item)}
                          disabled={isSold}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            isSold 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/5'
                          }`}
                        >
                          <MessageSquare size={10} /> Chat to Buy
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* SELLER DETAILS MODAL */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-seller-details">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setSelectedSeller(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-4 pt-2">
              <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-2xl mx-auto border-2 border-white shadow-md">
                {selectedSeller.authorName[0]}
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">{selectedSeller.authorName}</h4>
                <p className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full inline-block mt-1 font-medium border border-slate-100/50">Verified Resident Member</p>
              </div>

              <div className="border-t border-b border-slate-50 py-3 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Item Title</span>
                <span className="text-xs font-bold text-slate-700 block">{selectedSeller.title}</span>
                <span className="text-xs text-slate-500 block mt-1">{selectedSeller.description}</span>
              </div>

              {/* Direct Chat Contact block */}
              <div className="bg-violet-50/50 border border-violet-100/70 p-3.5 rounded-xl text-left space-y-1">
                <span className="text-[10px] font-bold text-violet-700 block tracking-wider uppercase">Contact Resident Seller</span>
                <p className="text-[10px] text-slate-600 leading-normal">
                  ApnaArea values civil, identity-verified interactions. Initiate a direct chat with the seller to negotiate, ask questions, or arrange doorstep pick-up!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleStartChat(selectedSeller.userId);
                    setSelectedSeller(null);
                  }}
                  className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-violet-500/10"
                >
                  <MessageSquare size={13} />
                  Start Chat with {selectedSeller.authorName.split(' ')[0]}
                </button>
              </div>

              <button
                onClick={() => setSelectedSeller(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LISTING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-add-listing">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-display font-bold text-base text-slate-800">Sell an Item</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">List your preloved items to verified residents in {activeNeighborhood.name}.</p>

            <form onSubmit={handleCreateListing} className="mt-4 space-y-3.5" id="form-add-listing">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">What are you selling?</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ergonomic Office Chair, Sourdough Bread"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Price (INR ₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-violet-500"
                  >
                    {['Electronics', 'Furniture', 'Collectibles', 'Footwear', 'Kitchenware', 'Books', 'Others'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Short Description</label>
                <textarea 
                  placeholder="Describe its condition, dimensions, and your society gate collection rules..."
                  value={desc} 
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 h-16 resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Select photo */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1.5">Product Photo (Drag & Drop or Click to Upload)</label>
                  
                  {/* File Upload Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                      isDragging 
                        ? 'border-violet-600 bg-violet-50/50 scale-[1.01]' 
                        : 'border-slate-200 hover:border-violet-400 hover:bg-slate-50/30'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <div className="p-2 bg-violet-50 rounded-lg text-violet-600 shrink-0">
                      <Upload size={16} className="stroke-[2.5]" />
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-slate-700">Upload from device</p>
                      <p className="text-[9px] text-slate-400">Drag & drop or click to browse files</p>
                    </div>
                  </div>
                </div>

                {/* Previews / Selections */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Photo Source</label>
                  
                  {/* Grid showing both custom uploaded photos and preset photos */}
                  <div className="grid grid-cols-6 gap-2">
                    {/* Render custom images first */}
                    {customImages.map((img, idx) => (
                      <button
                        key={`custom-${idx}`}
                        type="button"
                        onClick={() => setSelectedImg(img)}
                        className={`rounded-lg overflow-hidden border aspect-square transition-all relative group/thumb ${
                          selectedImg === img ? 'border-violet-600 scale-105 ring-2 ring-violet-500/10' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <img src={img} alt="Uploaded visual" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-violet-600 text-white text-[7px] font-bold py-0.5 text-center uppercase tracking-wider opacity-90">
                          My Photo
                        </span>
                      </button>
                    ))}

                    {/* Render preset images */}
                    {PRESET_LISTING_IMAGES.map((img, idx) => (
                      <button
                        key={`preset-${idx}`}
                        type="button"
                        onClick={() => setSelectedImg(img)}
                        className={`rounded-lg overflow-hidden border aspect-square transition-all ${
                          selectedImg === img ? 'border-violet-600 scale-105 ring-2 ring-violet-500/10' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <img src={img} alt="Preset visual asset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
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
                  Post Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
