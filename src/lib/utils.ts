import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  // If we already have http:// or https:// or data: return it directly
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;

  // Otherwise, since our static files are served at the root (or /uploads),
  // return the relative path (prepending a slash if needed)
  return url.startsWith('/') ? url : `/${url}`;
};
