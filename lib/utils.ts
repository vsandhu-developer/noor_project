import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidStudentEmail(email: string): boolean {
  const studentEmailPatterns = [
    /\.edu$/i,
    /@student\./i,
    /@university\./i,
    /@college\./i,
    /@algonquincdistudent\.ca$/i,
  ]
  return isValidEmail(email) && studentEmailPatterns.some(pattern => pattern.test(email))
}

