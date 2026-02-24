import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  // If it already has the production domain, return it
  if (url.startsWith('http://thedeepcollection.com') || url.startsWith('https://thedeepcollection.com')) return url;

  // If it's another domain or data URI, return it
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('data:')) return url;

  // Otherwise, it's a relative path (like /uploads/...), prepend the live domain
  const baseUrl = 'https://thedeepcollection.com';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
};
