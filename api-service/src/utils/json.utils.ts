import { getRequestLogger } from '@/helpers/request-context';

export function safeJsonParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    const logger = getRequestLogger();
    logger.error({ error, data }, 'Failed to parse JSON');
    return fallback;
  }
}
