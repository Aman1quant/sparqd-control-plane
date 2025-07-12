import dayjs, { ConfigType } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a date to ISO 8601 with timezone offset (e.g. +07:00)
 * @param date - Optional date input (string, number, Date, or Day.js ConfigType). Defaults to now.
 * @param timezone - IANA timezone string (e.g., "Asia/Jakarta")
 * @returns Formatted date string in "YYYY-MM-DDTHH:mm:ssZ" format
 */
export function formatDateWithTimezone(date?: ConfigType, timezone: string = 'Asia/Jakarta'): string {
  const baseDate = date ? dayjs(date) : dayjs();
  return baseDate.tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ');
}
