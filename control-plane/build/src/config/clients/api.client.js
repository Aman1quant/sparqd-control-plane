"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_context_1 = require("@helpers/request-context");
const axios_1 = __importDefault(require("axios"));
const api = axios_1.default.create();
api.interceptors.request.use((config) => {
    const logger = (0, request_context_1.getRequestLogger)();
    logger.info({
        type: 'http-request',
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
    }, 'Outbound Request');
    return config;
}, (error) => {
    const logger = (0, request_context_1.getRequestLogger)();
    logger.error({ type: 'http-request-error', err: error }, 'Outbound Request Error');
    return Promise.reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
});
api.interceptors.response.use((response) => {
    const logger = (0, request_context_1.getRequestLogger)();
    logger.info({
        type: 'http-response',
        url: response.config.url,
        status: response.status,
        data: response.data,
    }, 'Inbound Response');
    return response;
}, (error) => {
    const logger = (0, request_context_1.getRequestLogger)();
    logger.error(error, 'Inbound Response Error');
    return Promise.reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
});
exports.default = api;
