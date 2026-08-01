import React, { useRef, useState } from 'react';
import { ImagePlus, CheckCircle, Trash2, Heart, Image as ImageIcon, Camera, UploadCloud, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryImage } from '../types';
import { getTranslation } from '../lib/translations';

interface GalleryProps {
  images: GalleryImage[];
  currentLanguage: string;
  onUpload: (url: string | string[]) => void;
  onDelete: (id: string) => void;
  onSelectAvatar: (url: string) => void;
  onSelectBackground: (url: string | null) => void;
  currentAvatar: string;
  currentBackground: string | null;
  isDarkMode: boolean;
  onOpenPremiumGallery?: () => void;
}

export default function Gallery({ 
  images, 
  currentLanguage,
  onUpload, 
  onDelete, 
  onSelectAvatar, 
  onSelectBackground,
  currentAvatar, 
  currentBackground,
  isDarkMode,
  onOpenPremiumGallery
}: GalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const t = getTranslation(currentLanguage);

  const processFiles = (fileList: FileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((urls) => {
      onUpload(urls);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onUpload(dataUrl);
        onSelectAvatar(dataUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors duration-500 relative ${
        isDarkMode ? 'bg-[#120a0c]' : 'bg-[#FFF5F7]'
      }`}
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-pink-500/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 border-4 border-dashed border-white m-4 rounded-3xl"
          >
            <UploadCloud size={64} className="animate-bounce mb-3" />
            <h3 className="text-2xl font-black">Drop photos here for Suho-na!</h3>
            <p className="text-sm font-semibold opacity-90 mt-1">Upload multiple photos at once</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-pink-600 flex items-center justify-center gap-2">
            {t.myGallery} <Heart className="fill-pink-500 text-pink-500" size={20} />
          </h2>
          <p className={`${isDarkMode ? 'text-rose-400' : 'text-pink-400'} text-sm`}>
            {t.gallerySub || "Upload and save photos for Suho-na anytime 💕"}
          </p>
        </div>

        {/* Premium Romantic Gallery Feature Banner */}
        {onOpenPremiumGallery && (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onOpenPremiumGallery}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 text-white shadow-xl cursor-pointer hover:brightness-105 transition-all flex items-center justify-between gap-4 border border-amber-300/30 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Crown size={26} className="text-amber-200 fill-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg">Premium Romantic Gallery</h3>
                  <span className="text-[10px] bg-white text-pink-600 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Paid Gold
                  </span>
                </div>
                <p className="text-xs text-pink-100 font-medium line-clamp-1">
                  Exclusive high-quality romantic couple photos & cute AI artwork
                </p>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-xs font-bold shrink-0 flex items-center gap-1.5 group-hover:bg-white/30 transition-colors">
              <span>Open</span>
              <Sparkles size={14} />
            </div>
          </motion.div>
        )}

        {/* Current Profile Picture Card & Quick Change */}
        <div className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-400 shadow-md">
                <img src={currentAvatar} alt="Suho-na Avatar" className="w-full h-full object-cover" />
              </div>
              <button 
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Change Profile Picture"
              >
                <Camera size={18} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-pink-600">Suho-na's Profile Picture</h3>
                <Sparkles size={14} className="text-pink-400" />
              </div>
              <p className="text-xs opacity-75 mt-0.5">
                Change her profile picture anytime from gallery or upload a new photo directly!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Camera size={16} />
              <span>Change Profile Picture</span>
            </button>
            <input 
              type="file" 
              ref={avatarInputRef} 
              onChange={handleAvatarFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Reset background button if background is set */}
        {currentBackground && (
          <div className="flex justify-end">
            <button 
              onClick={() => onSelectBackground(null)}
              className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors bg-pink-100/60 dark:bg-pink-900/40 px-3.5 py-1.5 rounded-full"
            >
              {t.resetBackground || "Reset Chat Background"}
            </button>
          </div>
        )}

        {/* Photos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Upload Multiple Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all shadow-sm p-4 text-center ${
              isDarkMode 
                ? 'border-rose-900/50 bg-[#1a1012] text-rose-400 hover:border-pink-500 hover:text-pink-500' 
                : 'border-pink-200 bg-white/50 text-pink-400 hover:border-pink-400 hover:text-pink-500'
            }`}
          >
            <ImagePlus size={32} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.addPhoto || "Upload Photos"}</span>
            <span className="text-[10px] opacity-75 font-medium">Select multiple photos or drag & drop</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </motion.button>

          {/* Image List */}
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`group relative aspect-square rounded-2xl overflow-hidden shadow-sm border transition-colors ${
                  isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
                }`}
              >
                <img
                  src={image.url}
                  alt="Suho-na Gallery"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-pink-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => onSelectAvatar(image.url)}
                    className="w-full bg-white text-pink-600 py-1.5 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-pink-50 transition-colors shadow-sm"
                  >
                    {currentAvatar === image.url ? <><CheckCircle size={12} /> {t.avatarBadge || "Current Avatar"}</> : (t.setAsAvatar || "Set as Avatar")}
                  </button>
                  <button
                    onClick={() => onSelectBackground(image.url)}
                    className="w-full bg-pink-500 text-white py-1.5 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-pink-600 transition-colors shadow-sm"
                  >
                    {currentBackground === image.url ? <><CheckCircle size={12} /> {t.backgroundBadge || "Current BG"}</> : (t.setAsBackground || "Set as Background")}
                  </button>
                  <button
                    onClick={() => onDelete(image.id)}
                    className="p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors absolute top-2 right-2"
                    title="Delete photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {currentAvatar === image.url && (
                    <div className="bg-pink-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 shadow-md" title="Current Avatar">
                      <CheckCircle size={10} />
                      <span>Avatar</span>
                    </div>
                  )}
                  {currentBackground === image.url && (
                    <div className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 shadow-md" title="Current Background">
                      <ImageIcon size={10} />
                      <span>BG</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {images.length === 0 && (
          <div className="text-center py-12 text-pink-300 italic">
            {t.noPhotos || "No photos in gallery yet. Click above to add multiple photos!"}
          </div>
        )}
      </div>
    </div>
  );
}

