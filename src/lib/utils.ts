
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}

// Color utility functions for corkboard notes
export const getNoteColorsByType = (type: 'interest' | 'dislike' | 'skill' | 'goal') => {
  const colorMap = {
    interest: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      shadow: 'shadow-green-100',
      icon: 'text-green-500'
    },
    dislike: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      shadow: 'shadow-red-100',
      icon: 'text-red-500'
    },
    skill: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      shadow: 'shadow-blue-100',
      icon: 'text-blue-500'
    },
    goal: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      shadow: 'shadow-purple-100',
      icon: 'text-purple-500'
    }
  };
  
  return colorMap[type];
}

// Format timeframe for career goals
export function formatTimeframe(years: number): string {
  if (years < 1) {
    return 'Short-term (< 1 year)';
  } else if (years <= 3) {
    return 'Medium-term (1-3 years)';
  } else {
    return 'Long-term (3+ years)';
  }
}
