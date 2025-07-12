import snappy from 'snappy';
import { getRequestLogger } from '@helpers/request-context';

/**
 * Compress data using Snappy
 * @param data - Data to potentially compress
 * @returns Compressed or original data
 */
export async function compress(data: string): Promise<string> {
  const logger = getRequestLogger();
  if (!data) {
    return data;
  }

  try {
    const compressed = await snappy.compress(data);
    return compressed.toString('base64');
  } catch (err: any) {
    logger.warn(err, 'Failed to compress data, returning uncompressed.');
    return data;
  }
}

/**
 * Decompress data using Snappy
 * @param data - Data to potentially uncompress
 * @returns Uncompressed or original data
 */
export async function decompress(data: string | null): Promise<string | null> {
  const logger = getRequestLogger();

  if (!data) {
    return data;
  }

  try {
    const buffer = Buffer.from(data, 'base64');
    const decompressed = await snappy.uncompress(buffer);
    return decompressed.toString();
  } catch (err: any) {
    logger.warn(err, 'Failed to decompress data, returning as-is.');
    return data;
  }
}
