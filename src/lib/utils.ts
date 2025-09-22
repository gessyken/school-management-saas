import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatEmail = (email: string | undefined) => {
  if (!email) return '';
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;
  
  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  
  if (localPart.length <= 4) {
    return email; // Return as is if too short to obscure
  }
  
  const firstTwo = localPart.substring(0, 2);
  const lastTwo = localPart.substring(localPart.length - 2);
  
  return `${firstTwo}***${lastTwo}${domain}`;
};
