"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = exports.mockErrorResponseFn = void 0;
const mockErrorResponseFn = (message, errors, data) => ({
    code: 'FAIL',
    message,
    errors,
    data,
    serverTime: '2025-01-01T00:00:00.00',
});
exports.mockErrorResponseFn = mockErrorResponseFn;
exports.createSuccessResponse = jest.fn().mockImplementation((data) => ({
    code: 'SUCCESS',
    message: 'Success',
    errors: null,
    data,
    serverTime: '2025-01-01T00:00:00.00',
}));
exports.createErrorResponse = jest.fn().mockImplementation(exports.mockErrorResponseFn);
