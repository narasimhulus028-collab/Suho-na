import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, ShieldCheck, Crown, Camera, Lock, LogOut, Trash2, Edit3, CheckCircle, AlertTriangle, Sparkles, X, Heart, KeyRound } from 'lucide-react';
import { UserAccount } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  isPremium: boolean;
  premiumExpiryDate?: number | null;
  userMessageCount: number;
  maxFreeMessages: number;
  onUpdateUser: (updated: UserAccount) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onOpenPremiumModal: () => void;
  onRestorePurchases?: () => void;
  isDarkMode?: boolean;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  isPremium,
  premiumExpiryDate,
  userMessageCount,
  maxFreeMessages,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
  onOpenPremiumModal,
  onRestorePurchases,
  isDarkMode = false
}: UserProfileModalProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [isEditingName, setIsEditingName] = useState(false);
  const [username, setUsername] = useState(currentUser?.username || '');
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');

  // Delete account double confirmation modal/state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');

  // Feedback messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Handle Photo Change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const updated: UserAccount = {
          ...currentUser,
          profilePhotoUrl: dataUrl
        };
        onUpdateUser(updated);
        setSuccessMsg("Profile photo updated successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Username
  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const updated: UserAccount = {
      ...currentUser,
      username: username.trim()
    };
    onUpdateUser(updated);
    setIsEditingName(false);
    setSuccessMsg("Username updated!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Handle Save Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentUser.passwordHash && currentPasswordInput !== currentUser.passwordHash) {
      setErrorMsg("Current password is incorrect.");
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      passwordHash: newPasswordInput
    };
    onUpdateUser(updated);
    setIsChangingPassword(false);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmNewPasswordInput('');
    setSuccessMsg("Password changed successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Confirm Delete Account
  const handleConfirmDelete = () => {
    if (deleteInputText.trim().toUpperCase() === 'DELETE') {
      onDeleteAccount();
      setIsDeleteConfirmOpen(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative max-w-md w-full rounded-3xl shadow-2xl border p-6 md:p-8 my-8 overflow-hidden ${
            isDarkMode ? 'bg-[#180d11] border-rose-900/40 text-rose-50' : 'bg-white border-pink-100 text-slate-800'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-100 dark:bg-rose-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center hover:bg-pink-200 transition-colors z-10"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* User Avatar & Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400 shadow-xl relative bg-pink-100">
                <img
                  src={currentUser.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Change Profile Photo"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Username display / edit */}
            {!isEditingName ? (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-pink-600 dark:text-pink-400">
                  {currentUser.username}
                </h2>
                <button
                  onClick={() => {
                    setUsername(currentUser.username);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-pink-400 hover:text-pink-600 transition-colors"
                  title="Edit Username"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3 py-1 rounded-xl border border-pink-300 text-xs font-bold text-slate-800 dark:text-rose-100 dark:bg-rose-950/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="text-xs text-pink-400 hover:underline"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Email & Verified status */}
            <div className="flex items-center gap-1.5 text-xs text-pink-400 dark:text-rose-300">
              <Mail size={14} />
              <span>{currentUser.email}</span>
              {currentUser.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Verified
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Premium Status Banner */}
          <div className={`p-4 rounded-2xl border mb-5 flex flex-col gap-2.5 ${
            isPremium
              ? 'bg-gradient-to-r from-amber-400/15 via-pink-500/15 to-purple-500/15 border-amber-300/60'
              : 'bg-pink-50/60 dark:bg-rose-950/30 border-pink-100 dark:border-rose-900/30'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white ${
                  isPremium ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 shadow-amber-500/20 shadow-md' : 'bg-pink-400'
                }`}>
                  <Crown size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-pink-600 dark:text-pink-400 block">
                      {isPremium ? '👑 Suho-na Premium Gold' : 'Free Plan'}
                    </span>
                  </div>
                  <span className="text-[11px] text-pink-400 dark:text-rose-300 block">
                    {isPremium 
                      ? (premiumExpiryDate ? `Renews on ${new Date(premiumExpiryDate).toLocaleDateString()}` : 'Unlimited chats & all features unlocked') 
                      : `${userMessageCount}/${maxFreeMessages} msgs used today`}
                  </span>
                </div>
              </div>

              {!isPremium ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPremiumModal();
                  }}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-[11px] hover:brightness-105 shadow-xs whitespace-nowrap"
                >
                  Renew Premium – ₹89/month
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPremiumModal();
                  }}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold text-[11px] flex items-center gap-1 border border-amber-300/50 shadow-xs"
                >
                  <Crown size={12} /> Manage Plan
                </button>
              )}
            </div>

            {onRestorePurchases && (
              <div className="pt-2 border-t border-pink-100 dark:border-rose-900/20 flex items-center justify-between text-[10px]">
                <span className="text-pink-400">Subscription Status: {isPremium ? 'Active' : 'Free'}</span>
                <button
                  type="button"
                  onClick={onRestorePurchases}
                  className="font-bold text-pink-600 underline"
                >
                  Restore Purchases
                </button>
              </div>
            )}
          </div>

          {/* Account Actions List */}
          <div className="space-y-3">
            {/* Change Password Collapsible */}
            <div className="border border-pink-100 dark:border-rose-900/30 rounded-2xl p-3 bg-pink-50/30 dark:bg-rose-950/20">
              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="w-full flex items-center justify-between text-xs font-bold text-pink-600 dark:text-rose-300"
              >
                <span className="flex items-center gap-2">
                  <KeyRound size={16} />
                  <span>Change Password</span>
                </span>
                <span className="text-xs opacity-75">{isChangingPassword ? '▲' : '▼'}</span>
              </button>

              {isChangingPassword && (
                <form onSubmit={handleSavePassword} className="mt-3 space-y-2.5 pt-2 border-t border-pink-100 dark:border-rose-900/20">
                  <input
                    type="password"
                    placeholder="Current Password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:ring-1 focus:ring-pink-400 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:ring-1 focus:ring-pink-400 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    required
                    value={confirmNewPasswordInput}
                    onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs focus:ring-1 focus:ring-pink-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-pink-500 text-white rounded-xl font-bold text-xs hover:bg-pink-600 transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-pink-300 font-extrabold text-xs hover:bg-pink-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Log Out of Account</span>
            </button>

            {/* Delete Account Button */}
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="w-full py-2.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>Delete Account</span>
            </button>
          </div>

          {/* Double Confirmation Modal for Account Deletion */}
          <AnimatePresence>
            {isDeleteConfirmOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className={`max-w-sm w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${
                  isDarkMode ? 'bg-[#1a1012] border-rose-900 text-rose-50' : 'bg-white border-rose-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertTriangle size={24} />
                    <h3 className="font-extrabold text-base">Delete Account Forever?</h3>
                  </div>
                  <p className="text-xs text-rose-500 dark:text-rose-300 font-medium">
                    This action is permanent and cannot be undone. All your chat history and memory with Suho-na will be deleted.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-600 mb-1">
                      Type "DELETE" to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteInputText}
                      onChange={(e) => setDeleteInputText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold border-rose-300 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={deleteInputText.trim().toUpperCase() !== 'DELETE'}
                      className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-700 transition-colors"
                    >
                      Permanently Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
