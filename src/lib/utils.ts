import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  // If it's a full URL (including the backend server URL from /api/upload), just return it
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('data:')) return url;

  // Otherwise, it's a relative path stored in the DB, prepend the backend URL
  const baseUrl = '';

  // Clean up any double slashes
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
};
