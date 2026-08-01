import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, User, Mail, Lock, Key, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, X, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  isDarkMode?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  isDarkMode = false
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status/Error states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  if (!isOpen) return null;

  // Helper to load existing accounts from localStorage
  const getUsersDb = (): UserAccount[] => {
    try {
      const db = localStorage.getItem('suhona_users_db');
      return db ? JSON.parse(db) : [];
    } catch {
      return [];
    }
  };

  const saveUsersDb = (users: UserAccount[]) => {
    localStorage.setItem('suhona_users_db', JSON.stringify(users));
  };

  // Clear errors when changing modes
  const switchMode = (newMode: 'login' | 'signup' | 'forgot' | 'verify') => {
    setError(null);
    setSuccessMsg(null);
    setMode(newMode);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      const users = getUsersDb();
      const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!foundUser) {
        setError("No account found with this email. Please sign up first!");
        return;
      }

      if (foundUser.passwordHash !== password) {
        setError("Incorrect password. Please try again or reset password.");
        return;
      }

      // Successful login
      if (rememberMe) {
        localStorage.setItem('suhona_active_user', JSON.stringify(foundUser));
      } else {
        sessionStorage.setItem('suhona_active_user', JSON.stringify(foundUser));
      }

      onLoginSuccess(foundUser);
      onClose();
    }, 800);
  };

  // Handle Sign Up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !username.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const users = getUsersDb();
    const cleanEmail = email.trim().toLowerCase();
    
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setError("An account with this email already exists. Please log in.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Generate 6 digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      const newUser: UserAccount = {
        id: 'usr_' + Date.now().toString(),
        email: cleanEmail,
        username: username.trim(),
        profilePhotoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
        isVerified: false,
        createdAt: Date.now(),
        passwordHash: password,
      };

      setPendingUser(newUser);
      setSuccessMsg(`Verification code sent to ${cleanEmail}. (Code: ${code})`);
      switchMode('verify');
    }, 800);
  };

  // Handle Verification Code Check
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verificationCode.trim() !== generatedCode) {
      setError("Invalid verification code. Please check and try again.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (pendingUser) {
        const verifiedUser: UserAccount = {
          ...pendingUser,
          isVerified: true,
        };

        const users = getUsersDb();
        users.push(verifiedUser);
        saveUsersDb(users);

        localStorage.setItem('suhona_active_user', JSON.stringify(verifiedUser));
        onLoginSuccess(verifiedUser);
        onClose();
      }
    }, 600);
  };

  // Handle Forgot Password - Send Code
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    const users = getUsersDb();
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      setError("No account registered with this email address.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setPendingUser(foundUser);
      setSuccessMsg(`Reset code sent to ${cleanEmail}. (Code: ${code})`);
    }, 800);
  };

  // Reset Password step
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verificationCode.trim() !== generatedCode) {
      setError("Invalid verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (pendingUser) {
        const users = getUsersDb();
        const updatedUsers = users.map(u => u.id === pendingUser.id ? { ...u, passwordHash: newPassword } : u);
        saveUsersDb(updatedUsers);

        setSuccessMsg("Password reset successfully! You can now log in.");
        setTimeout(() => {
          switchMode('login');
        }, 1200);
      }
    }, 600);
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
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-100 dark:bg-rose-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center hover:bg-pink-200 transition-colors z-10"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Header Branding */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 p-1 shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#201015] flex items-center justify-center text-pink-500">
                <Heart size={32} fill="currentColor" className="animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              {mode === 'login' && 'Welcome Back to Suho-na 💕'}
              {mode === 'signup' && 'Create Your Lover Account 💕'}
              {mode === 'forgot' && 'Reset Your Password 🔑'}
              {mode === 'verify' && 'Verify Your Email 📩'}
            </h2>
            <p className="text-xs text-pink-400 dark:text-rose-300 font-medium">
              {mode === 'login' && 'Sign in to access your romantic chats & memories'}
              {mode === 'signup' && 'Connect deeply with Suho-na with your personalized account'}
              {mode === 'forgot' && 'Enter your email address to receive a recovery code'}
              {mode === 'verify' && 'Check your inbox for the 6-digit verification code'}
            </p>
          </div>

          {/* Mode Tabs (Login / Sign Up) */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="flex bg-pink-50 dark:bg-rose-950/40 p-1 rounded-2xl mb-5 border border-pink-100 dark:border-rose-900/30">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'login' 
                    ? 'bg-pink-500 text-white shadow-md' 
                    : 'text-pink-500 hover:text-pink-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'signup' 
                    ? 'bg-pink-500 text-white shadow-md' 
                    : 'text-pink-500 hover:text-pink-600'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error / Success Notifications */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sweetheart@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-pink-600 dark:text-rose-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] font-bold text-pink-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-pink-400 hover:text-pink-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-pink-600 dark:text-rose-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-pink-500 focus:ring-pink-400"
                  />
                  <span>Keep me logged in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Chat</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                  Your Name / Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-pink-400 hover:text-pink-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Create Account & Verify</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* EMAIL VERIFICATION FORM */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-pink-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-pink-100 dark:border-rose-900/30 text-center space-y-2">
                <span className="text-xs font-bold text-pink-600 dark:text-rose-300 block">
                  Simulated Code Sent to {email}
                </span>
                <div className="text-lg font-mono font-black text-pink-600 tracking-widest bg-white dark:bg-[#120a0c] py-1.5 px-4 rounded-xl inline-block border border-pink-200">
                  {generatedCode}
                </div>
                <p className="text-[11px] text-pink-400">
                  Enter the code above to complete email verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-lg font-mono font-bold tracking-widest py-3 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="flex-1 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 text-xs font-bold text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verify & Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={generatedCode ? handleResetPassword : handleForgotSubmit} className="space-y-4">
              {!generatedCode ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-pink-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 dark:bg-rose-950/30 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="flex-1 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 text-xs font-bold text-pink-600 hover:bg-pink-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-2 py-2.5 rounded-2xl bg-pink-500 text-white font-extrabold text-xs shadow-md hover:bg-pink-600 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Send Reset Code</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-pink-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-pink-100 dark:border-rose-900/30 text-center">
                    <span className="text-xs font-bold text-pink-600 block">Reset Code: {generatedCode}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Code"
                      className="w-full text-center text-lg font-mono font-bold tracking-widest py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-600 dark:text-rose-300 mb-1">
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-2xl border border-pink-200 dark:border-rose-900/40 bg-pink-50/50 text-xs font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save New Password & Log In</span>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Guest continuation note */}
          <div className="mt-6 pt-4 border-t border-pink-100 dark:border-rose-900/20 text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-pink-400 hover:text-pink-600 transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
