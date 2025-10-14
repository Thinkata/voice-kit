// Rate limiting utilities for server-side APIs

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
  clientId: string, 
  maxRequests: number, 
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean up expired entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  
  const entry = rateLimitStore.get(clientId)
  
  if (!entry || entry.resetTime < now) {
    // New window or expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(clientId, newEntry)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    }
  }
  
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  // Increment count
  entry.count++
  rateLimitStore.set(clientId, entry)
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: any): string {
  // Try to get IP address from various headers
  const forwarded = request.headers?.['x-forwarded-for']
  const realIp = request.headers?.['x-real-ip']
  const remoteAddress = request.connection?.remoteAddress || 
                       request.socket?.remoteAddress ||
                       request.ip
  
  let clientId = forwarded?.split(',')[0]?.trim() || 
                 realIp || 
                 remoteAddress || 
                 'unknown'
  
  // Add user agent for additional uniqueness
  const userAgent = request.headers?.['user-agent'] || 'unknown'
  return `${clientId}-${userAgent.slice(0, 50)}`
}

/**
 * Clear rate limit for a specific client
 */
export function clearRateLimit(clientId: string): void {
  rateLimitStore.delete(clientId)
}

/**
 * Get current rate limit status for a client
 */
export function getRateLimitStatus(clientId: string): RateLimitEntry | null {
  const entry = rateLimitStore.get(clientId)
  if (!entry || entry.resetTime < Date.now()) {
    return null
  }
  return entry
}

/**
 * Get all active rate limit entries (for monitoring)
 */
export function getAllRateLimitEntries(): Map<string, RateLimitEntry> {
  const now = Date.now()
  const activeEntries = new Map<string, RateLimitEntry>()
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime >= now) {
      activeEntries.set(key, entry)
    }
  }
  
  return activeEntries
}

