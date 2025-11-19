import { z } from 'zod'

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

export function validateFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize
}

export const commonSchemas = {
  email: z.string().email().transform((val) => sanitizeInput(val)),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100).transform((val) => sanitizeInput(val)),
  text: z.string().max(10000).transform((val) => sanitizeInput(val)),
}

