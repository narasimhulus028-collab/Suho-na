import selfie1 from '../assets/photos/selfie_1.jpg';
import selfie2 from '../assets/photos/selfie_2.jpg';
import selfie3 from '../assets/photos/selfie_3.jpg';
import selfie4 from '../assets/photos/selfie_4.jpg';
import selfie5 from '../assets/photos/selfie_5.jpg';
import selfiePinkSaree from '../assets/photos/suhona_pink_saree_selfie_1784785311551.jpg';
import selfieSatinBedroom from '../assets/photos/suhona_satin_bedroom_1784888014563.jpg';
import selfieCinematic from '../assets/photos/suhona_cinematic_moment_1784888300221.jpg';
import selfieProfile from '../assets/photos/suhona_profile_1784784684289.jpg';

/**
 * Approved photorealistic selfie collection from assets/photos
 */
export const LOCAL_SELFIE_PHOTOS: string[] = [
  selfie1,
  selfie2,
  selfie3,
  selfie4,
  selfie5,
  selfiePinkSaree,
  selfieSatinBedroom,
  selfieCinematic,
  selfieProfile,
  ...Object.values(
    import.meta.glob('../assets/photos/suhona/*.{jpg,jpeg,png,webp}', {
      eager: true,
      import: 'default',
      query: '?url'
    })
  )
];

/**
 * Preload all local selfie images into browser cache at app startup
 * to guarantee instant offline display without loading delay.
 */
export function preloadLocalSelfies(): void {
  if (typeof window === 'undefined') return;

  try {
    LOCAL_SELFIE_PHOTOS.forEach((photoUrl) => {
      const img = new Image();
      img.src = photoUrl;
    });

    // Also inject link rel=preload into head for immediate browser caching
    LOCAL_SELFIE_PHOTOS.slice(0, 5).forEach((photoUrl) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = photoUrl;
      document.head.appendChild(link);
    });
  } catch (err) {
    console.warn('Failed to preload selfie images:', err);
  }
}

/**
 * Get a random selfie from the uploaded gallery.
 * NEVER generates AI images; randomly chooses from uploaded selfie gallery photos.
 */
export function getRandomApprovedSelfie(customGallery?: Array<{ url: string }>, excludeUrl?: string): string {
  const uploadedUrls = (customGallery || []).map(g => g.url).filter(Boolean);
  
  // If user has uploaded images in their gallery, pick strictly from uploaded images
  const pool = uploadedUrls.length > 0 ? uploadedUrls : LOCAL_SELFIE_PHOTOS;
  
  const candidates = excludeUrl 
    ? pool.filter(url => url !== excludeUrl) 
    : pool;

  if (candidates.length === 0) return pool[0] || LOCAL_SELFIE_PHOTOS[0];
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
