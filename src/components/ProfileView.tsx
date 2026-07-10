import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Camera, 
  Check, 
  FileText, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { updateUserProfile } from '../data/store';

interface ProfileViewProps {
  currentUser: User;
  onRefresh: () => void;
  onUserChanged: (newUser: User) => void;
  onViewProfile?: (userId: string) => void;
}

export default function ProfileView({ 
  currentUser, 
  onRefresh, 
  onUserChanged,
  onViewProfile
}: ProfileViewProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Profile name cannot be blank.');
      return;
    }

    try {
      setError('');
      const updatedUser = updateUserProfile(currentUser.id, name.trim(), avatarUrl.trim(), bio.trim());
      onUserChanged(updatedUser);
      onRefresh();
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit to 3MB for local storage storage size efficiency
    if (file.size > 3 * 1024 * 1024) {
      setError('Image is too large. Please select an image under 3MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setAvatarUrl(e.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
      id="profile-view-root"
    >
      {/* Editorial Header */}
      <div className="bg-[#FAF9F6] border border-[#e1e1de] p-5 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <UserIcon className="text-[#1A1A1A]" size={18} />
            My Member Profile
          </h3>
          <p className="text-[11px] text-[#1A1A1A]/60 mt-0.5">
            Keep your profile details verified, clear, and up-to-date for your neighbors in the locality.
          </p>
        </div>

        {onViewProfile && (
          <button
            type="button"
            onClick={() => onViewProfile(currentUser.id)}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white border border-[#1A1A1A] py-2 px-4 text-[11px] font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles size={12} />
            Manage My Content & Insights
          </button>
        )}
      </div>

      <div className="bg-white border border-[#e1e1de] p-6 rounded-none shadow-xs">
        <form onSubmit={handleSave} className="space-y-6" id="profile-edit-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 flex items-start gap-2.5 text-xs rounded-none">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 flex items-start gap-2.5 text-xs rounded-none">
              <CheckCircle size={15} className="shrink-0 mt-0.5" />
              <span>Your profile has been successfully saved and synced across all your posts, listings, and comments!</span>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="space-y-3">
            <span className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block">
              Profile Photo
            </span>

            <div className="flex flex-col sm:flex-row items-stretch gap-5 p-4 border border-[#e1e1de] bg-[#FAF9F6]">
              {/* Avatar Live Preview */}
              <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden">
                  <img 
                    src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                    alt={name} 
                    className="w-full h-full rounded-full object-cover border-2 border-[#1A1A1A] bg-white shadow-xs" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute inset-0 bg-[#1A1A1A]/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-full"
                  >
                    <Camera size={16} className="text-white mb-1" />
                    <span className="text-[9px] text-white font-sans font-bold uppercase tracking-wider">Change</span>
                  </button>
                </div>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[9px] text-red-600 hover:text-red-800 font-sans font-bold uppercase tracking-wider flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Trash2 size={10} />
                    Remove
                  </button>
                )}
              </div>

              {/* Device File Drag-and-Drop Area */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`flex-1 border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
                  isDragging 
                    ? 'border-[#1A1A1A] bg-[#1A1A1A]/5' 
                    : 'border-[#e1e1de] hover:border-[#1A1A1A] hover:bg-white'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="bg-white p-2.5 border border-[#e1e1de] mb-2 shadow-2xs">
                  <Upload size={18} className="text-[#1A1A1A]/60" />
                </div>
                <p className="text-xs font-bold text-[#1A1A1A] mb-1">
                  Upload profile picture from device
                </p>
                <p className="text-[10px] text-[#1A1A1A]/50 max-w-[280px] leading-normal">
                  Drag & drop your image here, or <span className="underline font-bold text-[#1a1a1a]">click to browse</span>. Supports PNG, JPG, or WEBP.
                </p>
              </div>
            </div>
          </div>

          {/* Name & Phone Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <Edit3 className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#1A1A1A]/40" />
                <input 
                  type="text" 
                  placeholder="Your verified name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-[#e1e1de] p-2.5 focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-[#1A1A1A]/50 uppercase tracking-wider block mb-1">
                Account Verification
              </label>
              <div className="w-full text-xs border border-emerald-200 p-2.5 bg-emerald-50 text-emerald-800 font-sans font-semibold uppercase tracking-wider text-[10px] rounded-none flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                SIM-Verified Resident Account
              </div>
            </div>
          </div>

          {/* Description / Bio */}
          <div>
            <label className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-1">
              Profile Description / Bio
            </label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 h-3.5 w-3.5 text-[#1A1A1A]/40" />
              <textarea 
                placeholder="Introduce yourself to your neighborhood... (e.g., hobbyist baker, dog parent, tech enthusiast)"
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                maxLength={250}
                className="w-full text-xs border border-[#e1e1de] p-3 h-24 resize-none focus:outline-none focus:border-[#1A1A1A] bg-[#fdfdfb] rounded-none leading-relaxed"
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[9px] text-[#1A1A1A]/40 font-serif italic">
                Will be visible on the Locality Roster & post cards.
              </span>
              <span className="text-[9px] text-[#1A1A1A]/40 font-mono">
                {bio.length}/250
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-[#e1e1de]">
            <button 
              type="submit" 
              className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-none flex items-center gap-2 shadow-xs transition-colors"
              id="btn-save-profile"
            >
              <Check size={13} className="stroke-[2.5]" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
