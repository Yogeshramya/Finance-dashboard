/**
 * Cloudinary Optimization Utility
 * 
 * Automatically applies transformations for:
 * - f_auto: Best format based on browser (WebP/AVIF)
 * - q_auto: Optimal compression without quality loss
 */

export function getOptimizedImageUrl(url: string | undefined): string {
  if (!url) return "";
  
  // If it's already a Cloudinary URL, inject optimization flags
  if (url.includes("res.cloudinary.com")) {
    // Standard Cloudinary URL structure: .../upload/[transformations]/v[version]/[id]
    // We insert f_auto,q_auto after /upload/
    if (url.includes("/upload/") && !url.includes("f_auto")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  }
  
  return url;
}
