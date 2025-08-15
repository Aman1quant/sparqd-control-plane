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
exports.compress = compress;
exports.decompress = decompress;
const request_context_1 = require("@helpers/request-context");
const snappy_1 = __importDefault(require("snappy"));
/**
 * Compress data using Snappy
 * @param data - Data to potentially compress
 * @returns Compressed or original data
 */
function compress(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (0, request_context_1.getRequestLogger)();
        if (!data) {
            return data;
        }
        try {
            const compressed = yield snappy_1.default.compress(data);
            return compressed.toString('base64');
        }
        catch (err) {
            logger.warn(err, 'Failed to compress data, returning uncompressed.');
            return data;
        }
    });
}
/**
 * Decompress data using Snappy
 * @param data - Data to potentially uncompress
 * @returns Uncompressed or original data
 */
function decompress(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = (0, request_context_1.getRequestLogger)();
        if (!data) {
            return data;
        }
        try {
            const buffer = Buffer.from(data, 'base64');
            const decompressed = yield snappy_1.default.uncompress(buffer);
            return decompressed.toString();
        }
        catch (err) {
            logger.warn(err, 'Failed to decompress data, returning as-is.');
            return data;
        }
    });
}
