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
 * @param apiKey - Your Wiro project API key (required, minimum 8 characters)
 * @param apiSecret - Your Wiro project API secret (required, minimum 8 characters)
 * @returns Authentication headers object
 * @throws Error if apiKey or apiSecret is empty or too short
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
export declare function generateAuthHeaders(apiKey: string, apiSecret: string): WiroAuthHeaders;
//# sourceMappingURL=auth.d.ts.map