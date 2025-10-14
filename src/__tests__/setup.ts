// Jest setup for form-fill package tests

// Mock DOM APIs that might not be available in test environment
Object.defineProperty(window, 'fetch', {
  value: jest.fn(),
  writable: true
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
