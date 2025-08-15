"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_KEY_PREFIXES = void 0;
exports.buildRedisKey = buildRedisKey;
exports.checkExists = checkExists;
exports.getKey = getKey;
exports.setKey = setKey;
const redis_client_1 = __importDefault(require("@config/clients/redis.client"));
const request_context_1 = require("@helpers/request-context");
const compression_1 = require("@utils/compression");
/**
 * Redis key prefixes for different types of data
 */
exports.REDIS_KEY_PREFIXES = {
    OFFER: 'offer:',
    COMPLETE: 'complete:',
    SPELLING: 'spell:',
    SYNONYM: 'term:',
    INTENT: 'intent:',
    RESULT: 'result:',
};
/**
 * Prefixes that should use Snappy compression
 */
const COMPRESSED_PREFIXES = new Set(['OFFER', 'COMPLETE', 'RESULT']);
/**
 * Check if a key exists in Redis.
 * @param key - Redis key to check.
 * @returns Number indicating existence (0 or 1).
 */
function checkExists(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (0, request_context_1.getRequestLogger)();
        try {
            return (yield redis_client_1.default.exists(key)) === 1;
        }
        catch (err) {
            logger.error('Error checking [%s] key existence in Redis:', key, err);
            throw new Error(`Failed to check existence of key ${key}: ${err.message}`);
        }
    });
}
/**
 * Set a key-value pair in Redis with optional TTL.
 * @param key - Redis key.
 * @param value - Value to store.
 * @param ttl - Time-to-live in seconds (optional).
 */
function setKey(key, value, ttl) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (0, request_context_1.getRequestLogger)();
        try {
            const options = ttl ? { EX: ttl } : undefined;
            const keyPrefix = getKeyPrefix(key);
            let valueToStore = value;
            if (keyPrefix && COMPRESSED_PREFIXES.has(keyPrefix)) {
                valueToStore = yield (0, compression_1.compress)(value);
            }
            yield redis_client_1.default.set(key, valueToStore, options);
        }
        catch (err) {
            logger.error('Error setting %s key in Redis:', key, err);
            throw new Error(`Failed to set key ${key} in Redis: ${err.message}`);
        }
    });
}
/**
 * Retrieve the value of a key from Redis.
 * @param key - Redis key to retrieve.
 * @returns Value associated with the key, or null if not found.
 */
function getKey(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (0, request_context_1.getRequestLogger)();
        try {
            const keyPrefix = getKeyPrefix(key);
            let returnValue = yield redis_client_1.default.get(key);
            if (keyPrefix && COMPRESSED_PREFIXES.has(keyPrefix)) {
                returnValue = yield (0, compression_1.decompress)(returnValue);
            }
            return returnValue;
        }
        catch (err) {
            logger.error('Error retrieving %s key from Redis:', key, err);
            throw new Error(`Failed to get key ${key} from Redis: ${err.message}`);
        }
    });
}
/**
 * Builds a Redis key with the appropriate prefix
 * @param prefix - The key prefix from REDIS_KEY_PREFIXES
 * @param identifier - The unique identifier for the key
 * @returns The complete Redis key
 */
function buildRedisKey(prefix, identifier) {
    return `${exports.REDIS_KEY_PREFIXES[prefix]}${identifier}`;
}
/**
 * Extract prefix from a Redis key
 * @param key - Redis key
 * @returns The prefix type or null if not found
 */
function getKeyPrefix(key) {
    for (const [prefixKey, prefixValue] of Object.entries(exports.REDIS_KEY_PREFIXES)) {
        if (key.startsWith(prefixValue)) {
            return prefixKey;
        }
    }
    return null;
}
