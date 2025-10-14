import {
  checkRateLimit,
  getClientIdentifier,
  clearRateLimit,
  getRateLimitStatus,
  getAllRateLimitEntries
} from '../server/rate-limiter'

describe('rate-limiter', () => {
  const testClientId = 'test-client-123'
  const maxRequests = 5
  const windowMs = 60000 // 1 minute

  beforeEach(() => {
    // Clear rate limits before each test
    clearRateLimit(testClientId)
  })

  afterEach(() => {
    // Clean up after tests
    clearRateLimit(testClientId)
  })

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      const result = checkRateLimit(testClientId, maxRequests, windowMs)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(maxRequests - 1)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should track multiple requests', () => {
      // First request
      const result1 = checkRateLimit(testClientId, maxRequests, windowMs)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)

      // Second request
      const result2 = checkRateLimit(testClientId, maxRequests, windowMs)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)

      // Third request
      const result3 = checkRateLimit(testClientId, maxRequests, windowMs)
      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(2)
    })

    it('should block requests exceeding the limit', () => {
      // Use up all allowed requests
      for (let i = 0; i < maxRequests; i++) {
        checkRateLimit(testClientId, maxRequests, windowMs)
      }

      // Next request should be blocked
      const result = checkRateLimit(testClientId, maxRequests, windowMs)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', () => {
      // Use up all requests with a very short window
      const shortWindowMs = 10
      for (let i = 0; i < maxRequests; i++) {
        checkRateLimit(testClientId, maxRequests, shortWindowMs)
      }

      // Should be blocked
      let result = checkRateLimit(testClientId, maxRequests, shortWindowMs)
      expect(result.allowed).toBe(false)

      // Wait for window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          // Should be allowed again
          result = checkRateLimit(testClientId, maxRequests, shortWindowMs)
          expect(result.allowed).toBe(true)
          expect(result.remaining).toBe(maxRequests - 1)
          resolve(undefined)
        }, shortWindowMs + 5)
      })
    })

    it('should handle different clients independently', () => {
      const client1 = 'client-1'
      const client2 = 'client-2'

      const result1 = checkRateLimit(client1, maxRequests, windowMs)
      const result2 = checkRateLimit(client2, maxRequests, windowMs)

      expect(result1.remaining).toBe(maxRequests - 1)
      expect(result2.remaining).toBe(maxRequests - 1)

      clearRateLimit(client1)
      clearRateLimit(client2)
    })
  })

  describe('getClientIdentifier', () => {
    it('should extract client ID from x-forwarded-for header', () => {
      const request = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'user-agent': 'Mozilla/5.0'
        }
      }

      const clientId = getClientIdentifier(request)
      expect(clientId).toContain('192.168.1.1')
      expect(clientId).toContain('Mozilla/5.0')
    })

    it('should extract client ID from x-real-ip header', () => {
      const request = {
        headers: {
          'x-real-ip': '192.168.1.100',
          'user-agent': 'TestAgent'
        }
      }

      const clientId = getClientIdentifier(request)
      expect(clientId).toContain('192.168.1.100')
    })

    it('should fall back to remote address', () => {
      const request = {
        headers: {
          'user-agent': 'TestAgent'
        },
        connection: {
          remoteAddress: '127.0.0.1'
        }
      }

      const clientId = getClientIdentifier(request)
      expect(clientId).toContain('127.0.0.1')
    })

    it('should handle missing headers gracefully', () => {
      const request = {
        headers: {}
      }

      const clientId = getClientIdentifier(request)
      expect(clientId).toBe('unknown-unknown')
    })
  })

  describe('clearRateLimit', () => {
    it('should clear rate limit for a client', () => {
      checkRateLimit(testClientId, maxRequests, windowMs)
      
      let status = getRateLimitStatus(testClientId)
      expect(status).not.toBeNull()
      expect(status?.count).toBe(1)

      clearRateLimit(testClientId)
      
      status = getRateLimitStatus(testClientId)
      expect(status).toBeNull()
    })
  })

  describe('getRateLimitStatus', () => {
    it('should return null for new client', () => {
      const status = getRateLimitStatus('new-client')
      expect(status).toBeNull()
    })

    it('should return current status for active client', () => {
      checkRateLimit(testClientId, maxRequests, windowMs)
      checkRateLimit(testClientId, maxRequests, windowMs)

      const status = getRateLimitStatus(testClientId)
      expect(status).not.toBeNull()
      expect(status?.count).toBe(2)
      expect(status?.resetTime).toBeGreaterThan(Date.now())
    })

    it('should return null for expired entries', () => {
      const shortWindowMs = 10
      checkRateLimit(testClientId, maxRequests, shortWindowMs)

      return new Promise((resolve) => {
        setTimeout(() => {
          const status = getRateLimitStatus(testClientId)
          expect(status).toBeNull()
          resolve(undefined)
        }, shortWindowMs + 5)
      })
    })
  })

  describe('getAllRateLimitEntries', () => {
    it('should return empty map when no active entries', () => {
      const entries = getAllRateLimitEntries()
      expect(entries.size).toBe(0)
    })

    it('should return all active entries', () => {
      checkRateLimit('client-1', maxRequests, windowMs)
      checkRateLimit('client-2', maxRequests, windowMs)
      checkRateLimit('client-3', maxRequests, windowMs)

      const entries = getAllRateLimitEntries()
      expect(entries.size).toBeGreaterThanOrEqual(3)

      // Clean up
      clearRateLimit('client-1')
      clearRateLimit('client-2')
      clearRateLimit('client-3')
    })

    it('should not include expired entries', () => {
      const shortWindowMs = 10
      checkRateLimit(testClientId, maxRequests, shortWindowMs)

      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = getAllRateLimitEntries()
          expect(entries.has(testClientId)).toBe(false)
          resolve(undefined)
        }, shortWindowMs + 5)
      })
    })
  })
})

