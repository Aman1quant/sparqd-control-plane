"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateWithTimezone = formatDateWithTimezone;
const dayjs_1 = __importDefault(require("dayjs"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
/**
 * Formats a date to ISO 8601 with timezone offset (e.g. +07:00)
 * @param date - Optional date input (string, number, Date, or Day.js ConfigType). Defaults to now.
 * @param timezone - IANA timezone string (e.g., "Asia/Jakarta")
 * @returns Formatted date string in "YYYY-MM-DDTHH:mm:ssZ" format
 */
function formatDateWithTimezone(date, timezone = 'Asia/Jakarta') {
    const baseDate = date ? (0, dayjs_1.default)(date) : (0, dayjs_1.default)();
    return baseDate.tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ');
}
