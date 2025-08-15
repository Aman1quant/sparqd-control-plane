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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJsonSha1 = createJsonSha1;
exports.createJsonSha1Stable = createJsonSha1Stable;
const crypto_1 = require("crypto");
/**
 * Creates a SHA-1 hash for any JSON-serializable value
 * @param value - Any JSON-serializable value (object, array, string, number, boolean, null)
 * @returns SHA-1 hash as a hexadecimal string
 */
function createJsonSha1(value) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonString = JSON.stringify(value, null, 0);
        const encoder = new TextEncoder();
        const data = encoder.encode(jsonString);
        const hashBuffer = yield crypto_1.webcrypto.subtle.digest('SHA-1', data);
        return Buffer.from(hashBuffer).toString('hex');
    });
}
/**
 * Creates a SHA-1 hash with sorted object keys for consistent hashing
 * regardless of property order
 * @param value - Any JSON-serializable value
 * @returns SHA-1 hash as a hexadecimal string
 */
function createJsonSha1Stable(value) {
    return __awaiter(this, void 0, void 0, function* () {
        // Recursive function to sort object keys
        const sortedValue = sortKeys(value);
        return createJsonSha1(sortedValue);
    });
}
function sortKeys(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortKeys);
    }
    // Sort object keys and recursively sort nested objects
    const sorted = {};
    Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .forEach((key) => {
        sorted[key] = sortKeys(obj[key]);
    });
    return sorted;
}
