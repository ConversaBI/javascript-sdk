// Test setup file for Jest
import 'jest-dom/extend-expect';

// Mock fetch for tests
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-15T10:30:00.000Z');
global.Date.now = jest.fn(() => mockDate.getTime());

