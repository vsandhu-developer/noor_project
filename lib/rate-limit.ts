interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS = 100

export function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: store[key].resetTime,
    }
  }

  if (store[key].count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  store[key].count++
  return {
    allowed: true,
    remaining: MAX_REQUESTS - store[key].count,
    resetTime: store[key].resetTime,
  }
}

export function cleanExpiredEntries(): void {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}

setInterval(cleanExpiredEntries, RATE_LIMIT_WINDOW)

