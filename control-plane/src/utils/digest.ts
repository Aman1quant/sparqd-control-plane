import { webcrypto } from 'crypto';

/**
 * Creates a SHA-1 hash for any JSON-serializable value
 * @param value - Any JSON-serializable value (object, array, string, number, boolean, null)
 * @returns SHA-1 hash as a hexadecimal string
 */
export async function createJsonSha1(value: any): Promise<string> {
  const jsonString = JSON.stringify(value, null, 0);

  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  const hashBuffer = await webcrypto.subtle.digest('SHA-1', data);
  return Buffer.from(hashBuffer).toString('hex');
}

/**
 * Creates a SHA-1 hash with sorted object keys for consistent hashing
 * regardless of property order
 * @param value - Any JSON-serializable value
 * @returns SHA-1 hash as a hexadecimal string
 */
export async function createJsonSha1Stable(value: any): Promise<string> {
  // Recursive function to sort object keys
  const sortedValue = sortKeys(value);

  return createJsonSha1(sortedValue);
}

function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }

  // Sort object keys and recursively sort nested objects
  const sorted: any = {};
  Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .forEach((key) => {
      sorted[key] = sortKeys(obj[key]);
    });

  return sorted;
}
