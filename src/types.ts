export interface LoveLetter {
  id: string;
  sender: 'user' | 'suhona';
  title: string;
  content: string;
  timestamp: number;
  paperStyle?: 'parchment' | 'rose_petal' | 'midnight_gold' | 'vintage_lavender';
  stamp?: 'heart' | 'rose' | 'gold_heart' | 'kiss';
  replyToId?: string;
  isKeepsake?: boolean;
}

export interface HeartReaction {
  id: string;
  label: string;
  emoji: string;
}

export const HEART_REACTIONS: HeartReaction[] = [
  { id: 'Love', label: 'Love', emoji: '❤️' },
  { id: 'Joy', label: 'Joy', emoji: '🥰' },
  { id: 'Smile', label: 'Smile', emoji: '😊' },
  { id: 'Kiss', label: 'Kiss', emoji: '💋' },
  { id: 'Sparkle', label: 'Sparkle', emoji: '💖' },
  { id: 'Warmth', label: 'Warmth', emoji: '🤗' }
];

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isLiked?: boolean;
  isVoiceMessage?: boolean;
  audioDuration?: number; // duration in seconds
  imageUrl?: string;
  isLoveLetter?: boolean;
  loveLetterData?: LoveLetter;
  reactions?: string[]; // Array of reaction IDs or emojis e.g. ['Love', 'Joy', 'Smile']
  reaction?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  timestamp: number;
}

export interface UserMemory {
  userName: string;
  birthday: string;
  favoriteColor: string;
  hobbies: string;
  importantDates: string;
  nicknames: string;
  likes: string;
  dislikes: string;
  favoriteFood: string;
  savedLoveLetters?: LoveLetter[];
  language?: string;
}

export type MoodType = 'Happy' | 'Shy' | 'Excited' | 'Sleepy' | 'Sad' | 'Playful' | 'Romantic' | 'Spicy';
export type OutfitType = 'casual' | 'elegant' | 'beachwear' | 'pajamas' | 'romantic_red';
export type ThemeType = 'rose' | 'dusk' | 'starlight' | 'sunset' | 'coffee';

export interface RelationshipStats {
  loveLevel: number; // 0 to 100
  trustLevel: number; // 0 to 100
  mood: MoodType;
  streakDays: number;
  lastCheckInDate: string;
  relationshipStartDate: string;
  outfit: OutfitType;
  theme: ThemeType;
}

export interface RoleplayScenario {
  id: string;
  name: string;
  emoji: string;
  description: string;
  location: string;
  prompt: string;
  initialMessage: string;
}

export interface VoiceSettings {
  enabled: boolean;
  speed: number; // 0.7 - 1.5
  pitch: number; // 0.8 - 1.2
  autoPlay: boolean;
}

export interface ExtendedSettings {
  fontSize: 'sm' | 'md' | 'lg';
  notificationsEnabled: boolean;
  morningNightAlerts: boolean;
}

export interface AppSettings {
  avatar: string;
  gallery: GalleryImage[];
  background: string | null;
  voiceEnabled: boolean;
  darkMode: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  profilePhotoUrl?: string;
  isVerified: boolean;
  createdAt: number;
  passwordHash?: string;
  bio?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  reward: string;
  progress: number;
  maxProgress: number;
  category: 'chat' | 'streak' | 'features' | 'milestones';
}

export interface UnlockedReward {
  id: string;
  type: 'theme' | 'frame' | 'sticker' | 'avatar';
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface ReferralRecord {
  id: string;
  referredUsername: string;
  date: string;
  rewardEarned: string; // e.g. "+1 Premium Day"
  status: 'completed' | 'pending';
}

export interface ReferrerLeaderboardItem {
  rank: number;
  username: string;
  referralsCount: number;
  rewardsEarnedDays: number;
  avatar: string;
  isUser?: boolean;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalRewardsDays: number;
  history: ReferralRecord[];
}

export interface ProgressStats {
  xp: number;
  level: number; // 1 to 100
  totalMessages: number;
  totalChatMinutes: number;
  relationshipStartDate: string;
  favoriteLanguage: string;
  lastActiveDate: string; // YYYY-MM-DD
  checkInHistory: string[]; // YYYY-MM-DD dates
  activeFrame?: string;
}

