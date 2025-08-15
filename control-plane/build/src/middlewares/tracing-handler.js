"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracingMiddleware = tracingMiddleware;
const logger_1 = __importDefault(require("@config/logger"));
const request_context_1 = require("@helpers/request-context");
const api_1 = require("@utils/api");
function tracingMiddleware(req, res, next) {
    const incomingTraceparent = req.header('traceparent');
    let traceId;
    let parentSpanId;
    if (incomingTraceparent) {
        const parts = incomingTraceparent.split('-');
        if (parts.length === 4) {
            traceId = parts[1];
            parentSpanId = parts[2];
        }
    }
    traceId || (traceId = (0, api_1.generateTraceId)());
    parentSpanId || (parentSpanId = (0, api_1.generateSpanId)());
    const spanId = (0, api_1.generateSpanId)();
    // Attach to logger
    req.log = req.log.child({
        trace_id: traceId,
        span_id: spanId,
        parent_span_id: parentSpanId,
    });
    res.setHeader('traceparent', `00-${traceId}-${spanId}-01`);
    res.setHeader('x-request-id', String(req.id));
    if (logger_1.default.isLevelEnabled('trace')) {
        req.log.trace('Inbound Request: %o', req.body);
        const originalSend = res.send;
        // Override res.send
        res.send = function (body) {
            req.log.trace('Outgoing Response: %o', body);
            return originalSend.call(this, body);
        };
    }
    (0, request_context_1.setRequestContext)({
        reqLogger: req.log,
        traceContext: {
            trace_id: traceId,
            parent_span_id: parentSpanId,
            span_id: spanId,
        },
    }, () => next());
}
