"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = createErrorResponse;
exports.createResponse = createResponse;
exports.createSuccessResponse = createSuccessResponse;
exports.generateRequestId = generateRequestId;
exports.generateSpanId = generateSpanId;
exports.generateTraceId = generateTraceId;
exports.offsetPagination = offsetPagination;
exports.sanitizeForJson = sanitizeForJson;
exports.validateRequiredFields = validateRequiredFields;
const crypto_1 = __importDefault(require("crypto"));
const dayjs_1 = __importDefault(require("dayjs"));
function generateRequestId() {
    return crypto_1.default.randomUUID();
}
function generateTraceId() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
function generateSpanId() {
    return crypto_1.default.randomBytes(8).toString('hex');
}
function createResponse(code, serverTime, message, errors, data) {
    const formattedTime = (0, dayjs_1.default)(serverTime).format('YYYY-MM-DDTHH:mm:ss.SSSSSS');
    return {
        code: code,
        message: message,
        errors: errors || null,
        data: data,
        serverTime: formattedTime,
    };
}
function validateRequiredFields(input, fields) {
    return fields.filter((field) => !input[field]).map((field) => String(field));
}
function createErrorResponse(err, data) {
    if (typeof err === 'string') {
        return Object.assign(Object.assign({}, createResponse('FAILURE', new Date(), err, undefined, data)), { statusCode: 500 });
    }
    return Object.assign(Object.assign({}, createResponse('FAILURE', new Date(), err.message || 'A server error occurred', err.details, data)), { statusCode: err.status || 500 });
}
function createSuccessResponse(data) {
    return createResponse('SUCCESS', new Date(), 'Success', undefined, sanitizeForJson(data));
}
function sanitizeForJson(obj) {
    if (Array.isArray(obj)) {
        return obj.map(sanitizeForJson);
    }
    if (obj && typeof obj === 'object') {
        if (obj instanceof Date) {
            return obj.toISOString();
        }
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'bigint') {
                result[key] = value.toString();
            }
            else {
                result[key] = sanitizeForJson(value);
            }
        }
        return result;
    }
    return obj;
}
function offsetPagination(page, limit) {
    return page && limit ? (page - 1) * limit : undefined;
}
