export type UserTier = 'free' | 'referral_premium' | 'paid_premium';

export interface DailyPhotoTracker {
  count: number;
  lastResetTime: number; // timestamp in ms
}

/**
 * Automatically detects whether the user is:
 * - Free User (isPremium = false)
 * - Referral Premium User (isPremium = true, isPaidPremium = false)
 * - Paid Premium Subscriber (isPremium = true, isPaidPremium = true)
 */
export function detectUserTier(isPremium: boolean, isPaidPremium: boolean): UserTier {
  if (!isPremium) return 'free';
  if (isPaidPremium) return 'paid_premium';
  return 'referral_premium';
}

/**
 * Gets the daily photo tracker from localStorage, resetting every 24 hours.
 */
export function getDailyPhotoTracker(): DailyPhotoTracker {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const saved = localStorage.getItem('suhona_ai_photo_tracker');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed.count === 'number' && typeof parsed.lastResetTime === 'number') {
        if (now - parsed.lastResetTime >= ONE_DAY_MS) {
          const freshTracker: DailyPhotoTracker = { count: 0, lastResetTime: now };
          localStorage.setItem('suhona_ai_photo_tracker', JSON.stringify(freshTracker));
          return freshTracker;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse suhona_ai_photo_tracker", e);
    }
  }
  const initTracker: DailyPhotoTracker = { count: 0, lastResetTime: now };
  localStorage.setItem('suhona_ai_photo_tracker', JSON.stringify(initTracker));
  return initTracker;
}

/**
 * Increments the daily AI photo count by 1.
 */
export function incrementDailyPhotoCount(): DailyPhotoTracker {
  const tracker = getDailyPhotoTracker();
  tracker.count += 1;
  localStorage.setItem('suhona_ai_photo_tracker', JSON.stringify(tracker));
  return tracker;
}

/**
 * Returns daily photo limit for the given tier (null for unlimited).
 */
export function getTierPhotoLimit(tier: UserTier): number | null {
  if (tier === 'paid_premium') return null; // Unlimited
  if (tier === 'referral_premium') return 4; // 4 photos per 24 hours
  return 2; // Free: 2 photos per 24 hours
}

/**
 * Checks if the user can generate another AI photo today.
 */
export function canGeneratePhoto(tier: UserTier): boolean {
  const limit = getTierPhotoLimit(tier);
  if (limit === null) return true;
  const tracker = getDailyPhotoTracker();
  return tracker.count < limit;
}
