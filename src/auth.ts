import { createHmac } from 'crypto';

/**
 * Authentication headers required by the Wiro AI API.
 */
export interface WiroAuthHeaders {
  'x-api-key': string;
  'x-nonce': string;
  'x-signature': string;
}

/**
 * Generate authentication headers for Wiro AI API requests.
 * 
 * The Wiro AI API uses HMAC-SHA256 authentication with the following formula:
 * - nonce: Unix timestamp (seconds since epoch)
 * - signature: HMAC-SHA256(apiSecret + nonce, apiKey)
 * 
 * @param apiKey - Your Wiro project API key
 * @param apiSecret - Your Wiro project API secret
 * @returns Authentication headers object
 * 
 * @example
 * ```ts
 * const headers = generateAuthHeaders('my-api-key', 'my-api-secret');
 * // Returns:
 * // {
 * //   'x-api-key': 'my-api-key',
 * //   'x-nonce': '1734513807',
 * //   'x-signature': 'abc123...'
 * // }
 * ```
 */
export function generateAuthHeaders(apiKey: string, apiSecret: string): WiroAuthHeaders {
  // Generate nonce as Unix timestamp in seconds
  const nonce = Math.floor(Date.now() / 1000).toString();
  
  // Create HMAC-SHA256 signature
  // Formula: HMAC-SHA256(apiSecret + nonce, apiKey)
  const message = apiSecret + nonce;
  const hmac = createHmac('sha256', apiKey);
  hmac.update(message);
  const signature = hmac.digest('hex');

  return {
    'x-api-key': apiKey,
    'x-nonce': nonce,
    'x-signature': signature,
  };
}
