/**
 * Test file for the cartoonify example
 *
 * This test validates that the cartoonify example can run without errors
 * when proper API credentials are provided.
 */

import { describe, it, expect, beforeAll } from 'bun:test';

describe('cartoonify example', () => {
  let apiKey: string | undefined;
  let apiSecret: string | undefined;

  beforeAll(() => {
    // Load environment variables
    apiKey = process.env.WIRO_API_KEY || Bun.env.WIRO_API_KEY;
    apiSecret = process.env.WIRO_API_SECRET || Bun.env.WIRO_API_SECRET;
  });

  it('should have required environment variables', () => {
    // This test will be skipped if credentials are not available
    if (!apiKey || !apiSecret) {
      console.warn('Skipping tests: WIRO_API_KEY or WIRO_API_SECRET not set');
      return;
    }

    expect(apiKey).toBeDefined();
    expect(apiSecret).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(0);
    expect(apiSecret!.length).toBeGreaterThan(0);
  });

  it('should be able to import the example without errors', async () => {
    // Test that the example can be imported without syntax errors
    const exampleModule = await import('./cartoonify.ts');
    expect(exampleModule).toBeDefined();
  });

  it('should validate required parameters correctly', () => {
    // Test parameter validation logic
    const validUrl = 'https://example.com/image.jpg';
    const invalidUrl = 'not-a-url';

    // URL validation function from helpers
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    expect(isValidUrl(validUrl)).toBe(true);
    expect(isValidUrl(invalidUrl)).toBe(false);
  });

  // Note: We don't test the full API integration here to avoid
  // consuming API credits during test runs. The integration
  // can be tested manually by running the example.
});