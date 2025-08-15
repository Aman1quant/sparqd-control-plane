"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRequestContext = setRequestContext;
exports.getRequestLogger = getRequestLogger;
exports.getTraceId = getTraceId;
exports.getSpanId = getSpanId;
const logger_1 = __importDefault(require("@config/logger"));
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
function setRequestContext(context, func) {
    asyncLocalStorage.run(context, func);
}
function getRequestLogger() {
    var _a;
    const store = asyncLocalStorage.getStore();
    return (_a = store === null || store === void 0 ? void 0 : store.reqLogger) !== null && _a !== void 0 ? _a : logger_1.default;
}
function getTraceId() {
    var _a, _b;
    const store = asyncLocalStorage.getStore();
    return (_b = (_a = store === null || store === void 0 ? void 0 : store.traceContext) === null || _a === void 0 ? void 0 : _a.trace_id) !== null && _b !== void 0 ? _b : crypto.randomUUID();
}
function getSpanId() {
    var _a, _b;
    const store = asyncLocalStorage.getStore();
    return (_b = (_a = store === null || store === void 0 ? void 0 : store.traceContext) === null || _a === void 0 ? void 0 : _a.span_id) !== null && _b !== void 0 ? _b : crypto.randomUUID();
}
