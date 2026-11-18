/**
 * Cloudinary Media Optimization Utility
 * 
 * Provides dynamic URL transformations for images and videos hosted on Cloudinary.
 * Preserves high visual fidelity (using q_auto:good and f_auto) while drastically reducing
 * payload size (by up to 90%+) and preventing bandwidth quota exhaustion.
 */

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'limit' | 'fill' | 'scale' | 'fit' | 'thumb';
  dpr?: 'auto' | number;
}

export interface CloudinaryVideoOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
  format?: 'auto' | 'mp4' | 'webm';
  audioCodec?: 'none' | 'aac' | 'mp3';
}

/**
 * Injects transformation parameters into a Cloudinary URL.
 * If the URL is not hosted on Cloudinary or is already transformed, returns it safely.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: CloudinaryImageOptions = {}
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto:good', // Default to high-fidelity perceptual quality
    format = 'auto',       // Automatically serves AVIF/WebP based on browser support
    crop = 'limit',        // Avoid upscaling smaller images
    dpr,
  } = options;

  const transformations: string[] = [`f_${format}`, `q_${quality}`];

  if (crop) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (dpr) transformations.push(`dpr_${dpr}`);

  const transformString = transformations.join(',');

  // Check if transformations already exist in the URL
  const uploadIndex = url.indexOf('/image/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + '/image/upload/'.length);
  const rest = url.slice(uploadIndex + '/image/upload/'.length);

  // If already contains transformation flags right after /upload/, avoid duplicating
  if (/^([a-z]_[a-z0-9:._-]+,?)+\//.test(rest)) {
    return url;
  }

  return `${prefix}${transformString}/${rest}`;
}

/**
 * Optimizes Cloudinary video URLs with dynamic compression and audio track stripping
 * for background ambient loops.
 */
export function getOptimizedVideoUrl(
  url: string | null | undefined,
  options: CloudinaryVideoOptions = {}
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto:good',
    format = 'auto',
    audioCodec = 'none', // Strips audio track for muted background loops
  } = options;

  const transformations: string[] = [`f_${format}`, `q_${quality}`];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (audioCodec === 'none') transformations.push('ac_none');

  const transformString = transformations.join(',');

  const uploadIndex = url.indexOf('/video/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + '/video/upload/'.length);
  const rest = url.slice(uploadIndex + '/video/upload/'.length);

  if (/^([a-z]_[a-z0-9:._-]+,?)+\//.test(rest)) {
    return url;
  }

  return `${prefix}${transformString}/${rest}`;
}
