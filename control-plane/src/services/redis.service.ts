import redisClient from '@config/clients/redis.client';
import { getRequestLogger } from '@helpers/request-context';
import { compress, decompress } from '@utils/compression';

/**
 * Redis key prefixes for different types of data
 */
export const REDIS_KEY_PREFIXES = {
  OFFER: 'offer:',
  COMPLETE: 'complete:',
  SPELLING: 'spell:',
  SYNONYM: 'term:',
  INTENT: 'intent:',
  RESULT: 'result:',
} as const;

/**
 * Prefixes that should use Snappy compression
 */
const COMPRESSED_PREFIXES = new Set<keyof typeof REDIS_KEY_PREFIXES>(['OFFER', 'COMPLETE', 'RESULT']);

/**
 * Check if a key exists in Redis.
 * @param key - Redis key to check.
 * @returns Number indicating existence (0 or 1).
 */
async function checkExists(key: string): Promise<boolean> {
  const logger = getRequestLogger();
  try {
    return (await redisClient.exists(key)) === 1;
  } catch (err: any) {
    logger.error('Error checking [%s] key existence in Redis:', key, err);
    throw new Error(`Failed to check existence of key ${key}: ${err.message}`);
  }
}

/**
 * Set a key-value pair in Redis with optional TTL.
 * @param key - Redis key.
 * @param value - Value to store.
 * @param ttl - Time-to-live in seconds (optional).
 */
async function setKey(key: string, value: string, ttl?: number): Promise<void> {
  const logger = getRequestLogger();
  try {
    const options = ttl ? { EX: ttl } : undefined;
    const keyPrefix = getKeyPrefix(key);
    let valueToStore = value;
    if (keyPrefix && COMPRESSED_PREFIXES.has(keyPrefix)) {
      valueToStore = await compress(value);
    }

    await redisClient.set(key, valueToStore, options);
  } catch (err: any) {
    logger.error('Error setting %s key in Redis:', key, err);
    throw new Error(`Failed to set key ${key} in Redis: ${err.message}`);
  }
}

/**
 * Retrieve the value of a key from Redis.
 * @param key - Redis key to retrieve.
 * @returns Value associated with the key, or null if not found.
 */
async function getKey(key: string): Promise<string | null> {
  const logger = getRequestLogger();
  try {
    const keyPrefix = getKeyPrefix(key);
    let returnValue = await redisClient.get(key);

    if (keyPrefix && COMPRESSED_PREFIXES.has(keyPrefix)) {
      returnValue = await decompress(returnValue);
    }

    return returnValue;
  } catch (err: any) {
    logger.error('Error retrieving %s key from Redis:', key, err);
    throw new Error(`Failed to get key ${key} from Redis: ${err.message}`);
  }
}

/**
 * Builds a Redis key with the appropriate prefix
 * @param prefix - The key prefix from REDIS_KEY_PREFIXES
 * @param identifier - The unique identifier for the key
 * @returns The complete Redis key
 */
function buildRedisKey(prefix: keyof typeof REDIS_KEY_PREFIXES, identifier: string): string {
  return `${REDIS_KEY_PREFIXES[prefix]}${identifier}`;
}

/**
 * Extract prefix from a Redis key
 * @param key - Redis key
 * @returns The prefix type or null if not found
 */
function getKeyPrefix(key: string): keyof typeof REDIS_KEY_PREFIXES | null {
  for (const [prefixKey, prefixValue] of Object.entries(REDIS_KEY_PREFIXES)) {
    if (key.startsWith(prefixValue)) {
      return prefixKey as keyof typeof REDIS_KEY_PREFIXES;
    }
  }
  return null;
}

export { buildRedisKey, checkExists, getKey, setKey };
