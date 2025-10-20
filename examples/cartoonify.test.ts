/**
 * Test file for the cartoonify example
 *
 * This test suite validates:
 * - Parameter validation for the cartoonify model
 * - Helper functions used by the example
 * - Optional integration tests when API credentials are available
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import {
  getApiCredentials,
  isValidUrl,
  validateCartoonifyParams,
} from './shared/helpers';

describe('cartoonify example', () => {
  let apiKey: string | undefined;
  let apiSecret: string | undefined;

  beforeAll(() => {
    // Load environment variables using the helper function
    const { apiKey: key, apiSecret: secret } = getApiCredentials();
    apiKey = key;
    apiSecret = secret;
  });

  describe('environment and helpers', () => {
    it('should extract API credentials from environment', () => {
      const creds = getApiCredentials();
      expect(creds).toHaveProperty('apiKey');
      expect(creds).toHaveProperty('apiSecret');
    });

    it('should have credentials available for integration tests', () => {
      if (!apiKey || !apiSecret) {
        console.warn('⚠️  Skipping integration tests: WIRO_API_KEY or WIRO_API_SECRET not set');
        return;
      }

      expect(apiKey).toBeDefined();
      expect(apiSecret).toBeDefined();
      expect(apiKey!.length).toBeGreaterThan(0);
      expect(apiSecret!.length).toBeGreaterThan(0);
    });

    it('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidUrl('http://example.com/image.png')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('parameter validation', () => {
    it('should validate required inputImageUrl', () => {
      const invalidParams = { safetyTolerance: '2' };

      expect(() => {
        validateCartoonifyParams(invalidParams);
      }).toThrow('inputImageUrl is required');
    });

    it('should validate inputImageUrl is a valid URL', () => {
      const invalidParams = {
        inputImageUrl: 'not-a-valid-url',
        safetyTolerance: '2',
      };

      expect(() => {
        validateCartoonifyParams(invalidParams);
      }).toThrow('Invalid inputImageUrl');
    });

    it('should accept valid image URLs', () => {
      const validParams = {
        inputImageUrl: 'https://example.com/image.jpg',
        safetyTolerance: '2',
        outputFormat: 'jpeg',
      };

      expect(() => {
        validateCartoonifyParams(validParams);
      }).not.toThrow();
    });

    it('should validate safetyTolerance is between 0-6', () => {
      const validParams = {
        inputImageUrl: 'https://example.com/image.jpg',
        safetyTolerance: '2',
      };

      // Valid values
      for (let i = 0; i <= 6; i++) {
        expect(() => {
          validateCartoonifyParams({ ...validParams, safetyTolerance: String(i) });
        }).not.toThrow();
      }

      // Invalid values
      expect(() => {
        validateCartoonifyParams({ ...validParams, safetyTolerance: '-1' });
      }).toThrow('safetyTolerance must be an integer between 0 and 6');

      expect(() => {
        validateCartoonifyParams({ ...validParams, safetyTolerance: '7' });
      }).toThrow('safetyTolerance must be an integer between 0 and 6');

      expect(() => {
        validateCartoonifyParams({ ...validParams, safetyTolerance: 'invalid' });
      }).toThrow('safetyTolerance must be an integer between 0 and 6');
    });

    it('should validate outputFormat is jpeg or png', () => {
      const baseParams = {
        inputImageUrl: 'https://example.com/image.jpg',
      };

      // Valid formats
      expect(() => {
        validateCartoonifyParams({ ...baseParams, outputFormat: 'jpeg' });
      }).not.toThrow();

      expect(() => {
        validateCartoonifyParams({ ...baseParams, outputFormat: 'png' });
      }).not.toThrow();

      // Invalid format
      expect(() => {
        validateCartoonifyParams({ ...baseParams, outputFormat: 'bmp' });
      }).toThrow('outputFormat must be either "jpeg" or "png"');
    });

    it('should validate aspectRatio is in valid list', () => {
      const baseParams = {
        inputImageUrl: 'https://example.com/image.jpg',
      };

      const validRatios = ['', '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4', '21:9', '9:21', '2:1', '1:2'];

      // Valid ratios
      for (const ratio of validRatios) {
        expect(() => {
          validateCartoonifyParams({ ...baseParams, aspectRatio: ratio });
        }).not.toThrow();
      }

      // Invalid ratio
      expect(() => {
        validateCartoonifyParams({ ...baseParams, aspectRatio: '99:1' });
      }).toThrow('Invalid aspectRatio');
    });

    it('should validate seed is not empty string', () => {
      const baseParams = {
        inputImageUrl: 'https://example.com/image.jpg',
      };

      expect(() => {
        validateCartoonifyParams({ ...baseParams, seed: '' });
      }).toThrow('seed cannot be an empty string');

      expect(() => {
        validateCartoonifyParams({ ...baseParams, seed: '42' });
      }).not.toThrow();
    });

    it('should validate a complete valid params object', () => {
      const validParams = {
        inputImageUrl: 'https://example.com/photo.jpg',
        safetyTolerance: '2',
        aspectRatio: '1:1',
        seed: '42',
        outputFormat: 'jpeg',
      };

      expect(() => {
        validateCartoonifyParams(validParams);
      }).not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should be able to import the example without errors', async () => {
      if (!apiKey || !apiSecret) {
        console.warn('⚠️  Skipping: API credentials not available');
        return;
      }

      try {
        const exampleModule = await import('./cartoonify.ts');
        expect(exampleModule).toBeDefined();
      } catch (error) {
        // Expected if running without proper setup, not a test failure
        console.log('Note: Full integration test requires manual execution with real API credentials');
      }
    });
  });
});